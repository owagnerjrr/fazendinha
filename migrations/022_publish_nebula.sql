-- Run only after the outfit-capable deployment is READY. Does not deliver any product itself.
DO $publish$
DECLARE actor text; offer studio_payment_packs%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 IF EXISTS(SELECT 1 FROM studio_audit WHERE request_id=md5('publish-nebula-022')::uuid) THEN RETURN;END IF;
 SELECT * INTO STRICT offer FROM studio_payment_packs WHERE id='outfit_nebula' FOR UPDATE;
 IF offer.coins<>0 OR offer.fertilizers<>0 OR offer.cents<>1000 OR offer.version<>1 THEN RAISE EXCEPTION 'Unexpected outfit offer; publication refused';END IF;
 SELECT user_id INTO STRICT actor FROM studio_admins;
 UPDATE studio_payment_packs SET active=true,updated_at=now() WHERE id=offer.id;
 INSERT INTO studio_audit(request_id,author,action,target,reason,before,after,hash,result) VALUES(md5('publish-nebula-022')::uuid,actor,'publish-paid-outfit',offer.id,'Publicar Sentinela Nebulosa por R$ 10,00, conforme aprovação do proprietário',to_jsonb(offer),jsonb_build_object('active',true,'cents',1000,'coins',0,'outfit','nebula'),md5('publish-nebula-022'),'{"active":true}');
END $publish$;
