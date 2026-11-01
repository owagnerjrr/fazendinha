-- Rename the current offer, preserving permanent ownership and historical orders.
DO $rename$
DECLARE actor text; offer studio_payment_packs%ROWTYPE;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 IF EXISTS(SELECT 1 FROM studio_audit WHERE request_id=md5('rename-forest-025')::uuid) THEN RETURN;END IF;
 SELECT * INTO STRICT offer FROM studio_payment_packs WHERE id='outfit_forest' FOR UPDATE;
 SELECT user_id INTO STRICT actor FROM studio_admins;
 UPDATE studio_payment_packs SET name='Guerreiro Link',version=offer.version+1,updated_at=now() WHERE id=offer.id;
 INSERT INTO studio_package_versions(package_id,version,name,coins,cents) VALUES(offer.id,offer.version+1,'Guerreiro Link',offer.coins,offer.cents);
 INSERT INTO studio_audit(request_id,author,action,target,reason,before,after,hash,result) VALUES(md5('rename-forest-025')::uuid,actor,'rename-paid-outfit',offer.id,'Nome Guerreiro Link solicitado pelo proprietário; aparência loira com olhos azuis',to_jsonb(offer),jsonb_build_object('name','Guerreiro Link','version',offer.version+1,'cents',offer.cents),md5('rename-forest-025'),'{"renamed":true}');
END $rename$;
