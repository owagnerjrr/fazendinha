// Same-origin auth transport keeps the session usable on mobile browsers that block third-party cookies.
const allowed=new Set(['get-session','sign-up/email','sign-in/email','sign-out','token','email-otp/send-verification-otp','sign-in/email-otp','sign-in/social','link-social','list-accounts']);
async function proxy(request:Request) {
  const url=new URL(request.url),path=url.searchParams.get('path')??url.pathname.replace(/^\/api\/auth\/?/,'');
  url.searchParams.delete('path');
  if(!allowed.has(path))return Response.json({error:'Rota não disponível.'},{status:404});
  const base=process.env.NEON_AUTH_BASE_URL;if(!base)return Response.json({error:'Autenticação indisponível.'},{status:503});
  const origin=request.headers.get('origin');
  if(request.method==='POST'&&origin&&origin!==url.origin)return Response.json({error:'Origem inválida.'},{status:403});
  try{
    const body=request.method==='POST'?await request.text():undefined;
    if(body&&body.length>16384)return new Response(null,{status:413});
    const headers=new Headers({'Accept':'application/json'});
    for(const key of ['cookie','content-type','user-agent']){const value=request.headers.get(key);if(value)headers.set(key,value);}
    headers.set('Origin',url.origin);
    const upstream=await fetch(`${base}/${path}${url.search}`,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(12000)});
    const output=new Headers({'Cache-Control':'no-store','Content-Type':upstream.headers.get('content-type')??'application/json','X-Content-Type-Options':'nosniff'});
    const redirect=upstream.headers.get('location');if(redirect)output.set('Location',redirect);
    const jwt=upstream.headers.get('set-auth-jwt');if(jwt)output.set('set-auth-jwt',jwt);
    for(const cookie of upstream.headers.getSetCookie())output.append('Set-Cookie',cookie.replace(/;\s*Domain=[^;]+/ig,''));
    return new Response(upstream.body,{status:upstream.status,headers:output});
  }catch{console.error('auth_proxy_failed');return Response.json({error:{message:'Não foi possível conectar à sua conta.'}},{status:503});}
}
export const GET=proxy;
export const POST=proxy;
