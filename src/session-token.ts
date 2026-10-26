// Neon Auth 0.6 may serve the cached session envelope from token(), depending on the preceding call.
// Both SDK responses carry the same signed token; opaque session cookies must never be used as a JWT.
export function sessionToken(result: { data?: { token?: string; session?: { token?: string } } | null; error?: unknown }): string | null {
  if(result.error)return null;
  const token=result.data?.token??result.data?.session?.token;
  return typeof token==='string'&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)?token:null;
}
