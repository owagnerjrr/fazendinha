import {identity} from '../server/auth.js';import {GameError} from '../server/game.js';import {readChat,sendChat} from '../server/chat.js';
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function handle(request:Request){try{const user=await identity(request),url=new URL(request.url);
 if(request.method==='GET')return json(await readChat(user.id,url.searchParams.get('code')??'',url.searchParams.get('after'),url.searchParams.get('before')));
 if(request.method!=='POST')return json({error:'Método não permitido.'},405);
 if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origem inválida.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Envie JSON.'},415);const raw=await request.text();if(raw.length>4096)return json({error:'Mensagem muito grande.'},413);let input;try{input=JSON.parse(raw);}catch{return json({error:'JSON inválido.'},400);}return json(await sendChat(user.id,input));
 }catch(e){if(e instanceof GameError)return json({error:e.message},e.status);if(e instanceof Error&&e.message==='UNAUTHORIZED')return json({error:'Entre na sua conta.'},401);console.error('chat_request_failed',e instanceof Error?e.name:'unknown');return json({error:'Não foi possível abrir a conversa. Tente novamente.'},503);}}
export const GET=handle;export const POST=handle;
