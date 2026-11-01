-- Version the five coin offers only. Never update farms, orders, payments or prior versions.
-- One statement: any unexpected catalog drift rolls back the complete rebalance.
DO $rebalance$
DECLARE item record; old_pack studio_payment_packs%ROWTYPE; prior studio_package_versions%ROWTYPE; fresh studio_payment_packs%ROWTYPE; actor text;
BEGIN
 SELECT user_id INTO actor FROM studio_admins LIMIT 1;
 FOR item IN SELECT * FROM (VALUES ('p10',10000,500,1000,'500 moedas'),('p20',20000,1000,2000,'1.000 moedas'),('p30',30000,1500,3000,'1.500 moedas'),('p40',40000,2000,4000,'2.000 moedas'),('p50',50000,2500,5000,'2.500 moedas')) AS offers(id,old_coins,new_coins,cents,name) LOOP
  SELECT * INTO STRICT old_pack FROM studio_payment_packs WHERE id=item.id FOR UPDATE;
  SELECT * INTO STRICT prior FROM studio_package_versions WHERE package_id=old_pack.id AND version=old_pack.version;
  IF ROW(prior.coins,prior.cents,prior.name) IS DISTINCT FROM ROW(old_pack.coins,old_pack.cents,old_pack.name) THEN RAISE EXCEPTION 'Catalog history differs for %',item.id;END IF;
  IF old_pack.coins=item.new_coins AND old_pack.cents=item.cents AND old_pack.fertilizers=0 AND old_pack.name=item.name THEN CONTINUE;END IF;
  IF old_pack.version<>1 OR old_pack.coins<>item.old_coins OR old_pack.cents<>item.cents OR old_pack.fertilizers<>0 OR NOT old_pack.active THEN RAISE EXCEPTION 'Unexpected catalog change for %, rebalance refused',item.id;END IF;
  UPDATE studio_payment_packs SET name=item.name,coins=item.new_coins,version=old_pack.version+1,updated_at=now() WHERE id=item.id RETURNING * INTO fresh;
  INSERT INTO studio_package_versions(package_id,version,name,coins,cents) VALUES(fresh.id,fresh.version,fresh.name,fresh.coins,fresh.cents);
  INSERT INTO studio_audit(request_id,author,action,target,reason,before,after,hash,result) VALUES(md5('economy-018-'||item.id)::uuid,coalesce(actor,'migration:018'),'pack-rebalance',item.id,'Reequilíbrio solicitado: 50 moedas por real; preços em reais e contratos anteriores preservados',to_jsonb(old_pack),to_jsonb(fresh),md5(to_jsonb(fresh)::text),jsonb_build_object('id',fresh.id,'version',fresh.version));
 END LOOP;
END;
$rebalance$;
