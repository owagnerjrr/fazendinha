-- Add an inactive R$15 outfit without changing existing contracts or player states.
DO $migration$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 ALTER TABLE paid_outfit_ownership DROP CONSTRAINT IF EXISTS paid_outfit_ownership_outfit_check;
 ALTER TABLE paid_outfit_ownership ADD CONSTRAINT paid_outfit_ownership_outfit_check CHECK(outfit IN('nebula','forest'));
 INSERT INTO studio_payment_packs(id,name,coins,fertilizers,cents,active,version) VALUES('outfit_forest','Guardião da Clareira',0,0,1500,false,1) ON CONFLICT DO NOTHING;
 INSERT INTO studio_package_versions(package_id,version,name,coins,cents) SELECT id,version,name,coins,cents FROM studio_payment_packs WHERE id='outfit_forest' ON CONFLICT DO NOTHING;
 ALTER TABLE coin_orders DROP CONSTRAINT IF EXISTS coin_orders_catalog_check;
 ALTER TABLE coin_orders ADD CONSTRAINT coin_orders_catalog_check CHECK(
  (package_version IS NULL AND ((package='f5' AND coins=0 AND amount_cents=1000) OR (package='p10' AND coins=10000 AND amount_cents=1000) OR (package='p20' AND coins=20000 AND amount_cents=2000) OR (package='p30' AND coins=30000 AND amount_cents=3000) OR (package='p40' AND coins=40000 AND amount_cents=4000) OR (package='p50' AND coins=50000 AND amount_cents=5000))) OR
  (package_version>=1 AND package~'^[a-z0-9_-]{1,30}$' AND coins BETWEEN 0 AND 10000000 AND amount_cents BETWEEN 100 AND 100000 AND ((package IN('f5','outfit_nebula','outfit_forest') AND coins=0) OR (package NOT IN('f5','outfit_nebula','outfit_forest') AND coins>0))));
 CREATE OR REPLACE FUNCTION public.apply_store_payment(p_order uuid,p_payment text,p_status text,p_amount integer,p_refunded integer,p_updated timestamptz) RETURNS integer LANGUAGE plpgsql SET search_path=public,pg_temp AS $function$
 DECLARE o coin_orders%ROWTYPE; prior coin_payments%ROWTYPE; target boolean; difference integer; f jsonb; w jsonb; owned jsonb; entitled boolean; had boolean; outfit_id text;
 BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
  SELECT * INTO o FROM coin_orders WHERE id=p_order FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown order';END IF;
  outfit_id:=CASE o.package WHEN 'outfit_nebula' THEN 'nebula' WHEN 'outfit_forest' THEN 'forest' END;
  IF outfit_id IS NULL THEN RETURN apply_consumable_store_payment(p_order,p_payment,p_status,p_amount,p_refunded,p_updated);END IF;
  IF o.payment_api<>'orders' OR o.package_version IS NULL OR o.coins<>0 OR p_amount<>o.amount_cents OR p_amount<=0 OR p_refunded<0 OR p_refunded>p_amount OR p_updated IS NULL OR p_status NOT IN('pending','in_process','approved','rejected','cancelled','refunded','charged_back','in_mediation') THEN RAISE EXCEPTION 'Invalid outfit payment';END IF;
  SELECT * INTO prior FROM coin_payments WHERE payment_id=p_payment FOR UPDATE;
  IF FOUND THEN
   IF prior.order_id<>p_order THEN RAISE EXCEPTION 'Payment already bound';END IF;
   IF p_updated<prior.provider_updated_at OR (p_updated=prior.provider_updated_at AND (p_status<>prior.status OR p_refunded<>prior.refunded_cents)) THEN RETURN 0;END IF;
  END IF;
  target:=coalesce(prior.credited_outfit,false);
  IF p_status='approved' THEN target:=p_refunded<p_amount;
  ELSIF p_status IN('refunded','charged_back','in_mediation') THEN target:=false;END IF;
  difference:=target::integer-coalesce(prior.credited_outfit,false)::integer;
  SELECT state INTO STRICT f FROM farms WHERE user_id=o.user_id FOR UPDATE;
  w:=coalesce(f->'wardrobe','{"owned":[],"equipped":null}'::jsonb);owned:=coalesce(w->'owned','[]'::jsonb);had:=owned?outfit_id;
  INSERT INTO paid_outfit_ownership(user_id,outfit,gifted) VALUES(o.user_id,outfit_id,had) ON CONFLICT DO NOTHING;
  -- Reuse the validated, timestamp-guarded payment ledger with a zero-coin contract.
  PERFORM apply_coin_payment(p_order,p_payment,p_status,p_amount,p_refunded,p_updated);
  UPDATE coin_payments SET credited_outfit=target WHERE payment_id=p_payment;
  SELECT gifted OR EXISTS(SELECT 1 FROM coin_payments p JOIN coin_orders orders ON orders.id=p.order_id WHERE orders.user_id=o.user_id AND orders.package=o.package AND p.credited_outfit) INTO entitled FROM paid_outfit_ownership WHERE user_id=o.user_id AND outfit=outfit_id;
  IF entitled AND NOT had THEN owned:=owned||to_jsonb(outfit_id);
  ELSIF NOT entitled AND had THEN SELECT coalesce(jsonb_agg(value),'[]'::jsonb) INTO owned FROM jsonb_array_elements(owned) WHERE value<>to_jsonb(outfit_id);END IF;
  IF entitled IS DISTINCT FROM had OR (NOT entitled AND w->>'equipped'=outfit_id) THEN
   w:=jsonb_set(w,'{owned}',owned);
   IF NOT entitled AND w->>'equipped'=outfit_id THEN w:=jsonb_set(w,'{equipped}','null'::jsonb);END IF;
   UPDATE farms SET state=jsonb_set(state,'{wardrobe}',w),revision=revision+1 WHERE user_id=o.user_id;
  END IF;
  IF difference<>0 THEN INSERT INTO outfit_movements(payment_id,order_id,user_id,outfit,delta,reason) VALUES(p_payment,p_order,o.user_id,outfit_id,difference,p_status);END IF;
  UPDATE coin_orders SET status=CASE WHEN target AND p_refunded>0 THEN 'partially_refunded' WHEN target THEN 'approved' WHEN p_status='approved' AND p_refunded=p_amount THEN 'refunded' ELSE p_status END,updated_at=now() WHERE id=p_order;
  RETURN difference;
 END $function$;
END $migration$;
