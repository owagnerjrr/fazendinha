-- One transaction / row lock owns verification, balance and receipt, including concurrent retries.
CREATE OR REPLACE FUNCTION public.credit_verified_referral(p_invitee text) RETURNS boolean
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE claim referral_claims%ROWTYPE; address text; canonical text; verified boolean; credited integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 SELECT * INTO claim FROM referral_claims WHERE invitee=p_invitee AND rewarded_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 SELECT lower(trim(email)),"emailVerified" INTO address,verified FROM neon_auth."user" WHERE id::text=p_invitee AND banned IS NOT TRUE;
 IF NOT FOUND OR verified IS NOT TRUE THEN RETURN false; END IF;
 canonical:=address;
 IF split_part(address,'@',2) IN ('gmail.com','googlemail.com') THEN
  canonical:=replace(split_part(split_part(address,'@',1),'+',1),'.','')||'@gmail.com';
 END IF;
 IF encode(sha256(convert_to(canonical,'UTF8')),'hex')<>claim.email_hash THEN RETURN false; END IF;
 UPDATE farms SET state=jsonb_set(state,'{coins}',to_jsonb((state->>'coins')::bigint+1000)),revision=revision+1
 WHERE user_id=claim.referrer AND EXISTS(SELECT 1 FROM neon_auth."user" WHERE id::text=claim.referrer AND banned IS NOT TRUE);
 GET DIAGNOSTICS credited=ROW_COUNT;
 IF credited=0 THEN RETURN false; END IF;
 UPDATE referral_claims SET rewarded_at=now() WHERE invitee=p_invitee;
 RETURN true;
END;
$$;
