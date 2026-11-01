DO $migration$
DECLARE admin_id text; account record; inserted integer;
 model_id uuid := '6049a8cf-1d56-4b71-9a10-16e7754d0460';
 model jsonb := '{"kind":"model","name":"Clara · personagem loira","description":"Personagem loira de rabo de cavalo, com caminhada e ferramentas do jogo. Aparência editável, sem alterar personagens existentes.","price":0,"sellPrice":0,"color":"#e9cb78","behaviors":[],"dependencies":[],"data":{"style":"ponytail","skin":0,"hair":5,"shirt":2}}';
BEGIN
 SELECT user_id INTO admin_id FROM studio_admins;
 IF admin_id IS NULL THEN RAISE EXCEPTION 'Configure the exclusive studio administrator first'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('fazendinha-economy-v1'));
 FOR account IN SELECT user_id,public_code,state->'visitorCare' AS old_care FROM farms WHERE state->'visitorCare' IS DISTINCT FROM 'true'::jsonb AND NOT EXISTS(SELECT 1 FROM studio_audit WHERE request_id=md5('020-friend-care-'||farms.user_id)::uuid) FOR UPDATE LOOP
  UPDATE farms SET state=jsonb_set(state,'{visitorCare}','true'::jsonb),revision=revision+1 WHERE user_id=account.user_id;
  INSERT INTO studio_audit(request_id,author,action,target,reason,before,after,hash,result) VALUES(md5('020-friend-care-'||account.user_id)::uuid,admin_id,'friend-care-default',account.public_code,'Liberar cuidados por amigos aceitos em todas as contas, conforme pedido do proprietário',jsonb_build_object('visitorCare',account.old_care),'{"visitorCare":true}',md5('020-friend-care-'||account.user_id),'{"enabled":true}');
 END LOOP;
 INSERT INTO studio_content(id,kind,name,draft,created_by) VALUES(model_id,'model',model->>'name',model,admin_id) ON CONFLICT(id) DO NOTHING;
 GET DIAGNOSTICS inserted=ROW_COUNT;
 IF inserted=1 THEN
  INSERT INTO studio_drafts(content_id,revision,definition,author) VALUES(model_id,1,model,admin_id);
  INSERT INTO studio_audit(request_id,author,action,target,reason,after,hash,result) VALUES(md5('020-blonde-model')::uuid,admin_id,'seed-blonde-model',model_id::text,'Adicionar personagem loira editável na Central de Criação',model,md5('020-blonde-model'),jsonb_build_object('id',model_id,'draft',true));
 END IF;
END
$migration$;
