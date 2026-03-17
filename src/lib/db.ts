import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not defined in environment variables');
}

// Neon serverless driver for the browser (HTTP)
export const sql = neon(databaseUrl || 'postgresql://neondb_owner:npg_r7iuygWvC4HF@ep-odd-sea-a1eal6y4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require', {
  disableWarningInBrowsers: true
});
