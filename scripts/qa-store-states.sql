DO $$
DECLARE u text:=gen_random_uuid()::text; o uuid; st text; n integer;
BEGIN
 INSERT INTO farms(user_id,name,state) VALUES(u,'QA States','{"coins":50}');
 FOREACH st IN ARRAY ARRAY['pending','in_process','rejected','cancelled'] LOOP
  o:=gen_random_uuid();INSERT INTO coin_orders(id,user_id,request_id,package,coins,amount_cents,method,mode,collector_id,expires_at) VALUES(o,u,gen_random_uuid(),'p10',10000,1000,'card','test','123',now()-interval '1 minute');
  n:=apply_coin_payment(o,o::text,st,1000,0,now());IF n<>0 OR (SELECT (state->>'coins')::int FROM farms WHERE user_id=u)<>50 THEN RAISE EXCEPTION 'Unpaid status credited'; END IF;
 END LOOP;
 SELECT count(*) INTO n FROM coin_movements WHERE user_id=u;IF n<>0 THEN RAISE EXCEPTION 'Unpaid ledger changed'; END IF;
 RAISE EXCEPTION USING ERRCODE='ZQ003',MESSAGE='rollback QA';
EXCEPTION WHEN SQLSTATE 'ZQ003' THEN RAISE NOTICE 'PASS pending, in-process, rejected and cancelled do not credit';
END $$;
