export const GET=()=>Response.json({available:!!process.env.NEON_AUTH_BASE_URL},{headers:{'Cache-Control':'no-store'}});
