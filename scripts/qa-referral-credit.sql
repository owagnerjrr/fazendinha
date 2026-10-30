-- Isolated QA branch only. All fixtures and balance mutations are rolled back on completion.
DO $$
DECLARE owner_id uuid:=gen_random_uuid(); invited_id uuid:=gen_random_uuid(); duplicate_id uuid:=gen_random_uuid();
 address text:='qa.'||replace(gen_random_uuid()::text,'-','')||'@gmail.com'; fingerprint text; changed boolean;
BEGIN
 fingerprint:=encode(sha256(convert_to(replace(split_part(address,'@',1),'.','')||'@gmail.com','UTF8')),'hex');
 INSERT INTO neon_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES(owner_id,'QA owner',owner_id::text||'@example.invalid',true,now(),now()),(invited_id,'QA invited',address,false,now(),now());
 INSERT INTO farms(user_id,name,state) VALUES(owner_id::text,'QA owner','{"coins":50}'),(invited_id::text,'QA invited','{"coins":50}');
 INSERT INTO referral_claims(invitee,referrer,email_hash) VALUES(invited_id::text,owner_id::text,fingerprint);
 IF credit_verified_referral(invited_id::text) THEN RAISE EXCEPTION 'Unverified credit'; END IF;
 IF (SELECT (state->>'coins')::int FROM farms WHERE user_id=owner_id::text)<>50 THEN RAISE EXCEPTION 'Pending altered balance'; END IF;
 UPDATE neon_auth."user" SET "emailVerified"=true WHERE id=invited_id;
 IF NOT credit_verified_referral(invited_id::text) THEN RAISE EXCEPTION 'Verified signup not rewarded'; END IF;
 IF credit_verified_referral(invited_id::text) THEN RAISE EXCEPTION 'Duplicate credit'; END IF;
 IF (SELECT (state->>'coins')::int FROM farms WHERE user_id=owner_id::text)<>1050 OR (SELECT revision FROM farms WHERE user_id=owner_id::text)<>1 THEN RAISE EXCEPTION 'Wrong coins or revision'; END IF;
 BEGIN
  INSERT INTO referral_claims(invitee,referrer,email_hash) VALUES(duplicate_id::text,owner_id::text,fingerprint);
  RAISE EXCEPTION 'Duplicate email accepted';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
  INSERT INTO referral_claims(invitee,referrer,email_hash) VALUES(owner_id::text,owner_id::text,repeat('0',64));
  RAISE EXCEPTION 'Self invitation accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 RAISE NOTICE 'PASS pending verification, exactly 1000, replay, revision, duplicate email and self guard';
 -- A caught subtransaction rollback removes all synthetic fixtures without deleting any real rows.
 RAISE EXCEPTION USING ERRCODE='ZQ001',MESSAGE='QA rollback';
EXCEPTION WHEN SQLSTATE 'ZQ001' THEN RAISE NOTICE 'PASS isolated QA rolled back';
END $$;
