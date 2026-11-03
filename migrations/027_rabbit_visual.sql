-- Rename only the administrator's original rabbit draft. Published versions and player progress remain immutable.
WITH target AS (
 SELECT id,draft,draft_rev FROM studio_content
 WHERE id='b6ac9d54-563e-4120-8dc3-d5ba9eb4679e' AND name='Meu coelho' AND draft->>'name'='Meu coelho'
 FOR UPDATE
), changed AS (
 UPDATE studio_content c SET name='Coelho',draft=jsonb_set(jsonb_set(c.draft,'{name}','"Coelho"'),'{data,builtinArt}','"rabbit-v57"'),draft_rev=c.draft_rev+1,updated_at=now()
 FROM target t WHERE c.id=t.id
 RETURNING c.id,c.draft,c.draft_rev,t.draft AS old_draft
), history AS (
 INSERT INTO studio_drafts(content_id,revision,definition,author)
 SELECT id,draft_rev,draft,'system:release-0.56.0' FROM changed RETURNING content_id
)
INSERT INTO studio_audit(request_id,author,action,target,reason,before,after,hash,result)
SELECT '4f58a354-bf60-4ea0-a849-3d78a647ea57','system:release-0.56.0','rabbit-visual-update',id::text,
 'Pedido do administrador: renomear espécie para Coelho e melhorar a arte, preservando nomes personalizados, propriedade e cuidados.',old_draft,draft,md5(draft::text),jsonb_build_object('content',id,'revision',draft_rev)
FROM changed;
