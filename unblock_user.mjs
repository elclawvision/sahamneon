import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_r7iuygWvC4HF@ep-odd-sea-a1eal6y4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
const email = 'dragon11@yahoo.com';
async function unblock() {
  try {
    await sql`INSERT INTO saham_clients (user_email, status, joined_at, last_login) VALUES (${email}, 'active', NOW(), NOW()) ON CONFLICT (user_email) DO UPDATE SET status = 'active', last_login = NOW()`;
    console.log('User unblocked in saham_clients');
  } catch (e) {
    console.error(e);
  }
}
unblock().then(() => process.exit());
