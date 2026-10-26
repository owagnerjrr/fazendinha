import pg from 'pg';
// A small pool per warm function; pooled Neon hostname also limits total database connections.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
