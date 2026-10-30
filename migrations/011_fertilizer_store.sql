BEGIN;
-- Widen only the catalog constraints. Old orders and the coin ledger are preserved.
DO $$ DECLARE c record; BEGIN FOR c IN SELECT conname FROM pg_constraint WHERE conrelid='coin_orders'::regclass AND contype='c' AND (pg_get_constraintdef(oid) LIKE '%package%' OR pg_get_constraintdef(oid) LIKE '%coins%' OR pg_get_constraintdef(oid) LIKE '%amount_cents%') LOOP EXECUTE format('ALTER TABLE coin_orders DROP CONSTRAINT %I',c.conname);END LOOP;END $$;
ALTER TABLE coin_orders ADD CONSTRAINT coin_orders_catalog_check CHECK(
 (package='f5' AND coins=0 AND amount_cents=1000) OR
 (package='p10' AND coins=10000 AND amount_cents=1000) OR
 (package='p20' AND coins=20000 AND amount_cents=2000) OR
 (package='p30' AND coins=30000 AND amount_cents=3000) OR
 (package='p40' AND coins=40000 AND amount_cents=4000) OR
 (package='p50' AND coins=50000 AND amount_cents=5000));
ALTER TABLE coin_payments ADD COLUMN IF NOT EXISTS credited_fertilizers integer NOT NULL DEFAULT 0 CHECK(credited_fertilizers BETWEEN 0 AND 5);
CREATE TABLE IF NOT EXISTS fertilizer_movements(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,payment_id text NOT NULL REFERENCES coin_payments(payment_id),
 order_id uuid NOT NULL REFERENCES coin_orders(id),user_id text NOT NULL,delta integer NOT NULL CHECK(delta<>0),reason text NOT NULL,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.apply_store_payment(p_order uuid,p_payment text,p_status text,p_amount integer,p_refunded integer,p_updated timestamptz) RETURNS integer
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE o coin_orders%ROWTYPE;previous coin_payments%ROWTYPE;target integer;difference integer;balance integer;debt integer;available integer;owed integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 SELECT * INTO o FROM coin_orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown order';END IF;
 IF o.package<>'f5' THEN RETURN apply_coin_payment(p_order,p_payment,p_status,p_amount,p_refunded,p_updated);END IF;
 IF o.payment_api<>'orders' OR p_amount<>1000 OR p_refunded<0 OR p_refunded>p_amount OR p_updated IS NULL OR p_status NOT IN ('pending','in_process','approved','rejected','cancelled','refunded','charged_back','in_mediation') THEN RAISE EXCEPTION 'Invalid fertilizer payment';END IF;
 SELECT * INTO previous FROM coin_payments WHERE payment_id=p_payment FOR UPDATE;
 IF FOUND THEN
  IF previous.order_id<>p_order THEN RAISE EXCEPTION 'Payment already bound';END IF;
  IF p_updated<previous.provider_updated_at OR (p_updated=previous.provider_updated_at AND (p_status<>previous.status OR p_refunded<>previous.refunded_cents)) THEN RETURN 0;END IF;
 END IF;
 target:=COALESCE(previous.credited_fertilizers,0);
 IF p_status='approved' THEN target:=floor(5::numeric*(p_amount-p_refunded)/p_amount)::integer;
 ELSIF p_status IN ('refunded','charged_back','in_mediation') THEN target:=0;END IF;
 difference:=target-COALESCE(previous.credited_fertilizers,0);
 IF difference<>0 THEN
  SELECT COALESCE((state->>'fertilizers')::integer,0),COALESCE((state->>'fertilizerDebt')::integer,0) INTO balance,debt FROM farms WHERE user_id=o.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Farm missing';END IF;
  IF difference>0 THEN available:=greatest(0,balance+difference-debt);owed:=greatest(0,debt-balance-difference);
  ELSE available:=greatest(0,balance+difference);owed:=debt+greatest(0,-difference-balance);END IF;
  UPDATE farms SET state=jsonb_set(jsonb_set(state,'{fertilizers}',to_jsonb(available)),'{fertilizerDebt}',to_jsonb(owed)),revision=revision+1 WHERE user_id=o.user_id;
 END IF;
 INSERT INTO coin_payments(payment_id,order_id,status,amount_cents,refunded_cents,credited_coins,credited_fertilizers,provider_updated_at)
 VALUES(p_payment,p_order,p_status,p_amount,p_refunded,0,target,p_updated)
 ON CONFLICT(payment_id) DO UPDATE SET status=excluded.status,refunded_cents=excluded.refunded_cents,credited_fertilizers=excluded.credited_fertilizers,provider_updated_at=excluded.provider_updated_at,updated_at=now();
 IF difference<>0 THEN INSERT INTO fertilizer_movements(payment_id,order_id,user_id,delta,reason) VALUES(p_payment,p_order,o.user_id,difference,p_status);END IF;
 UPDATE coin_orders SET status=CASE WHEN target>0 AND p_refunded>0 THEN 'partially_refunded' WHEN target>0 THEN 'approved' WHEN p_status='approved' AND p_refunded=p_amount THEN 'refunded' ELSE p_status END,updated_at=now() WHERE id=p_order;
 RETURN difference;
END $$;
COMMIT;
