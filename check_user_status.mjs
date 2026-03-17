import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_r7iuygWvC4HF@ep-odd-sea-a1eal6y4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
const email = 'dragon11@yahoo.com';

async function check() {
    try {
        console.log('--- Checking for: ' + email + ' ---');
        const gp = await sql("SELECT * FROM global_product WHERE email = $1 OR user_email = $1", [email]);
        console.log('GLOBAL PRODUCT RESULTS:', gp.length);
        if (gp.length > 0) console.log(JSON.stringify(gp, null, 2));

        const sc = await sql("SELECT * FROM saham_clients WHERE user_email = $1", [email]);
        console.log('SAHAM CLIENTS RESULTS:', sc.length);
        if (sc.length > 0) console.log(JSON.stringify(sc, null, 2));
        
        // Also check for any recent paid users to see if the table name is correct
        const recent = await sql("SELECT email, status, created_at FROM global_product ORDER BY created_at DESC LIMIT 3");
        console.log('\n--- RECENT USERS ---');
        console.log(JSON.stringify(recent, null, 2));

    } catch (err) {
        console.error('SQL Error:', err);
    }
}
check().then(() => process.exit());
