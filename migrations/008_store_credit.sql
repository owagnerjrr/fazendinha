CREATE OR REPLACE FUNCTION public.apply_coin_payment(p_order uuid,p_payment text,p_status text,p_amount integer,p_refunded integer,p_updated timestamptz,p_fee integer DEFAULT 0,p_net integer DEFAULT NULL,p_release timestamptz DEFAULT NULL) RETURNS integer
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE o coin_orders%ROWTYPE; previous coin_payments%ROWTYPE; target integer; difference integer; balance bigint; debt bigint; available bigint; owed bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 SELECT * INTO o FROM coin_orders WHERE id=p_order FOR UPDATE;
 IF NOT FOUND OR p_amount<>o.amount_cents OR p_refunded<0 OR p_refunded>p_amount OR p_updated IS NULL THEN RAISE EXCEPTION 'Invalid payment binding'; END IF;
 IF p_status NOT IN ('pending','in_process','approved','rejected','cancelled','refunded','charged_back','in_mediation') THEN RAISE EXCEPTION 'Unknown payment status'; END IF;
 SELECT * INTO previous FROM coin_payments WHERE payment_id=p_payment FOR UPDATE;
 IF FOUND THEN
  IF previous.order_id<>p_order THEN RAISE EXCEPTION 'Payment already bound'; END IF;
  IF p_updated<previous.provider_updated_at THEN RETURN 0; END IF;
  IF p_updated=previous.provider_updated_at AND (p_status<>previous.status OR p_refunded<>previous.refunded_cents) THEN RETURN 0; END IF;
 END IF;
 target:=COALESCE(previous.credited_coins,0);
 IF p_status='approved' THEN target:=floor(o.coins::numeric*(p_amount-p_refunded)/p_amount)::integer;
 ELSIF p_status IN ('refunded','charged_back','in_mediation') THEN target:=0; END IF;
 difference:=target-COALESCE(previous.credited_coins,0);
 IF difference<>0 THEN
  SELECT (state->>'coins')::bigint,COALESCE((state->>'coinDebt')::bigint,0) INTO balance,debt FROM farms WHERE user_id=o.user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Farm missing; preserve payment for reconciliation'; END IF;
  IF difference>0 THEN available:=greatest(0,balance+difference-debt);owed:=greatest(0,debt-balance-difference);
  ELSE available:=greatest(0,balance+difference);owed:=debt+greatest(0,-difference-balance); END IF;
  UPDATE farms SET state=jsonb_set(jsonb_set(state,'{coins}',to_jsonb(available)),'{coinDebt}',to_jsonb(owed)),revision=revision+1 WHERE user_id=o.user_id;
 END IF;
 INSERT INTO coin_payments(payment_id,order_id,status,amount_cents,refunded_cents,credited_coins,provider_updated_at,fee_cents,net_cents,money_release_date)
 VALUES(p_payment,p_order,p_status,p_amount,p_refunded,target,p_updated,p_fee,p_net,p_release)
 ON CONFLICT(payment_id) DO UPDATE SET status=excluded.status,refunded_cents=excluded.refunded_cents,credited_coins=excluded.credited_coins,provider_updated_at=excluded.provider_updated_at,fee_cents=excluded.fee_cents,net_cents=excluded.net_cents,money_release_date=excluded.money_release_date,updated_at=now();
 IF difference<>0 THEN INSERT INTO coin_movements(payment_id,order_id,user_id,delta,reason,provider_updated_at) VALUES(p_payment,p_order,o.user_id,difference,p_status,p_updated); END IF;
 UPDATE coin_orders SET status=CASE WHEN EXISTS(SELECT 1 FROM coin_payments WHERE order_id=p_order AND credited_coins>0) THEN CASE WHEN EXISTS(SELECT 1 FROM coin_payments WHERE order_id=p_order AND refunded_cents>0) THEN 'partially_refunded' ELSE 'approved' END WHEN p_status='approved' AND p_refunded=p_amount THEN 'refunded' ELSE p_status END,updated_at=now() WHERE id=p_order;
 RETURN difference;
END $$;
