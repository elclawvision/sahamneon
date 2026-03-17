import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_r7iuygWvC4HF@ep-odd-sea-a1eal6y4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
const email = 'dragon11@yahoo.com';
async function run() {
  console.log('Querying corrected...');
  try {
    const gp = await sql`SELECT * FROM global_product WHERE email = ${email}`;
    console.log('GP:', JSON.stringify(gp));
    const sc = await sql`SELECT * FROM saham_clients WHERE user_email = ${email}`;
    console.log('SC:', JSON.stringify(sc));
    const recent = await sql`SELECT email, status, created_at FROM global_product ORDER BY created_at DESC LIMIT 5`;
    console.log('RECENT:', JSON.stringify(recent));
  } catch (e) {
    console.error('SQL ERR:', e);
  }
}
run().then(() => process.exit());
