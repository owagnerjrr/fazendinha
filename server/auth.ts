import { createRemoteJWKSet, jwtVerify } from 'jose';
let jwks: ReturnType<typeof createRemoteJWKSet>;
export async function identity(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token || !process.env.NEON_AUTH_BASE_URL) throw new Error('UNAUTHORIZED');
  const base = process.env.NEON_AUTH_BASE_URL;
  jwks ??= createRemoteJWKSet(new URL(`${base}/.well-known/jwks.json`));
  try {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['EdDSA'], issuer: new URL(base).origin, requiredClaims: ['exp','sub'] });
    if (!payload.sub || payload.role === 'anonymous') throw new Error();
    return { id: payload.sub, name: typeof payload.name === 'string' ? payload.name.slice(0,40) : 'Fazendeiro' };
  } catch { throw new Error('UNAUTHORIZED'); }
}
