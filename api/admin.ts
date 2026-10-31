import {readAdmin,writeAdmin} from '../server/studio.js';
import {StudioValidationError} from '../src/studio-schema.js';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(r:Request){try{return json(r.method==='GET'?await readAdmin(r):await writeAdmin(r));}catch(e){const m=e instanceof Error?e.message:'';if(m==='UNAUTHORIZED')return json({error:'Entre na sua conta.'},401);if(m==='FORBIDDEN')return json({error:'Acesso exclusivo do administrador.'},403);if(e instanceof SyntaxError)return json({error:'JSON inválido.'},400);if(e instanceof StudioValidationError)return json({error:m},400);console.error('studio_failed');return json({error:'Operação indisponível. Nenhuma alteração confirmada.'},503);}}
export const GET=handle;export const POST=handle;
