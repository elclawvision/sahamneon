import { neon } from '@neondatabase/serverless';
import { authClient } from './src/lib/auth.js';

const sql = neon('postgresql://neondb_owner:npg_r7iuygWvC4HF@ep-odd-sea-a1eal6y4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function migrate() {
    console.log('--- Starting Migration ---');
    try {
        // Find all PAID users from global_product
        const paidUsers = await sql\`SELECT email, name, password FROM global_product WHERE status = 'PAID'\`;
        console.log(\`Found \${paidUsers.length} paid users.\`);

        for (const user of paidUsers) {
            const email = user.email.trim().toLowerCase();
            console.log(\`Checking \${email}...\`);
            
            try {
                // Try to create the user in Neon Auth
                // Note: Better Auth (via authClient) doesn't have a direct "import" without a session usually
                // but we can try to signUp them if they don't exist.
                const result = await authClient.signUp.email({
                    email: email,
                    password: user.password || 'TemporaryPass123!',
                    name: user.name || 'Investor',
                });

                if (result.error) {
                    if (result.error.code === 'user_already_exists' || result.error.message?.includes('exists')) {
                        console.log(\`  - \${email} already exists in Auth.\`);
                    } else {
                        console.error(\`  - Error migrating \${email}: \`, result.error);
                    }
                } else {
                    console.log(\`  ✅ \${email} migrated to Neon Auth successfully.\`);
                }

                // Ensure they are also in saham_clients
                await sql\`
                    INSERT INTO saham_clients (user_email, status, joined_at, last_login)
                    VALUES (\${email}, 'active', NOW(), NOW())
                    ON CONFLICT (user_email) DO UPDATE SET status = 'active'
                \`;

            } catch (err) {
                console.error(\`  - Failed migrating \${email}: \`, err.message);
            }
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

migrate().then(() => {
    console.log('--- Migration Finished ---');
    process.exit();
});
