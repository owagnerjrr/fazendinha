import { createRemoteJWKSet, jwtVerify } from 'jose';
import{pool}from'./db.js';
export class BlockedAccountError extends Error{constructor(){super('Esta conta está com acesso bloqueado. Entre em contato com a administração.');}}
let jwks: ReturnType<typeof createRemoteJWKSet>;
export async function identity(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !process.env.NEON_AUTH_BASE_URL) throw new Error('UNAUTHORIZED');
  const base = process.env.NEON_AUTH_BASE_URL;
  jwks ??= createRemoteJWKSet(new URL(`${base}/.well-known/jwks.json`));
  let user:{id:string;name:string};try {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['EdDSA'], issuer: new URL(base).origin, requiredClaims: ['exp','sub'] });
    if (!payload.sub || payload.role === 'anonymous') throw new Error();
    user={ id: payload.sub, name: typeof payload.name === 'string' ? payload.name.slice(0,40) : 'Fazendeiro' };
  } catch { throw new Error('UNAUTHORIZED'); }
  const account=(await pool.query('SELECT coalesce(u.banned,false) OR EXISTS(SELECT 1 FROM studio_account_blocks b WHERE b.user_id=$1) blocked FROM neon_auth."user" u WHERE u.id::text=$1',[user.id])).rows[0];if(!account)throw new Error('UNAUTHORIZED');if(account.blocked)throw new BlockedAccountError();return user;
}
