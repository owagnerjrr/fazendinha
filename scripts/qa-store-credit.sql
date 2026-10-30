-- Run on an isolated branch; all fixtures are rolled back through a caught subtransaction.
DO $$
DECLARE owner text:=gen_random_uuid()::text; o uuid:=gen_random_uuid(); p text:='qa-'||gen_random_uuid()::text; t timestamptz:=now(); delta integer; coins integer; debt integer;
BEGIN
 INSERT INTO farms(user_id,name,state) VALUES(owner,'QA Financial','{"coins":50}');
 INSERT INTO coin_orders(id,user_id,request_id,package,coins,amount_cents,method,mode,collector_id,expires_at) VALUES(o,owner,gen_random_uuid(),'p10',10000,1000,'pix','test','123',now()+interval '30 minutes');
 PERFORM apply_coin_payment(o,p,'pending',1000,0,t);
 IF (SELECT (state->>'coins')::int FROM farms WHERE user_id=owner)<>50 THEN RAISE EXCEPTION 'Pending credited'; END IF;
 delta:=apply_coin_payment(o,p,'approved',1000,0,t+interval '1 second');IF delta<>10000 THEN RAISE EXCEPTION 'Wrong initial credit'; END IF;
 delta:=apply_coin_payment(o,p,'approved',1000,0,t+interval '1 second');IF delta<>0 THEN RAISE EXCEPTION 'Replay credited'; END IF;
 delta:=apply_coin_payment(o,p,'pending',1000,0,t);IF delta<>0 THEN RAISE EXCEPTION 'Older event accepted'; END IF;
 IF (SELECT (state->>'coins')::int FROM farms WHERE user_id=owner)<>10050 THEN RAISE EXCEPTION 'Wrong balance'; END IF;
 PERFORM apply_coin_payment(o,p,'approved',1000,200,t+interval '2 seconds');
 IF (SELECT (state->>'coins')::int FROM farms WHERE user_id=owner)<>8050 THEN RAISE EXCEPTION 'Wrong partial refund'; END IF;
 -- Spend synthetic QA coins before a chargeback; the debt must be explicit and coins nonnegative.
 UPDATE farms SET state=jsonb_set(state,'{coins}','100'::jsonb) WHERE user_id=owner;
 PERFORM apply_coin_payment(o,p,'charged_back',1000,200,t+interval '3 seconds');
 SELECT (state->>'coins')::int,(state->>'coinDebt')::int INTO coins,debt FROM farms WHERE user_id=owner;
 IF coins<>0 OR debt<>7900 THEN RAISE EXCEPTION 'Invalid chargeback debt'; END IF;
 PERFORM apply_coin_payment(o,p,'charged_back',1000,200,t+interval '3 seconds');
 IF (SELECT count(*) FROM coin_movements WHERE order_id=o)<>3 THEN RAISE EXCEPTION 'Duplicate ledger entry'; END IF;
 -- A dispute won restores only the official net entitlement and first settles the debt.
 PERFORM apply_coin_payment(o,p,'approved',1000,200,t+interval '4 seconds');
 SELECT (state->>'coins')::int,(state->>'coinDebt')::int INTO coins,debt FROM farms WHERE user_id=owner;
 IF coins<>100 OR debt<>0 THEN RAISE EXCEPTION 'Dispute restoration inconsistent'; END IF;
 PERFORM apply_coin_payment(o,p,'refunded',1000,1000,t+interval '5 seconds');
 IF (SELECT status FROM coin_orders WHERE id=o)<>'refunded' THEN RAISE EXCEPTION 'Refund status missing'; END IF;
 BEGIN
  PERFORM apply_coin_payment(o,p,'approved',100,0,t+interval '6 seconds');RAISE EXCEPTION 'Altered price accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Invalid payment binding' THEN RAISE; END IF; END;
 RAISE EXCEPTION USING ERRCODE='ZQ002',MESSAGE='rollback QA';
EXCEPTION WHEN SQLSTATE 'ZQ002' THEN RAISE NOTICE 'PASS wallet, replay, pending, partial refund, chargeback debt, dispute restoration and price guard';
END $$;
