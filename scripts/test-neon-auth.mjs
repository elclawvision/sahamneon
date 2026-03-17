import { createAuthClient } from '@neondatabase/auth';

async function testSignup() {
    const authUrl = process.env.VITE_NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL;
    
    if (!authUrl) {
        console.error("Missing NEON_AUTH_URL in environment.");
        return;
    }

    console.log(`Using Auth URL: ${authUrl}`);
    const authClient = createAuthClient(authUrl, {
        fetchOptions: {
            headers: {
                'Origin': 'http://localhost:5173'
            }
        }
    });

    try {
        console.log("Attempting to sign up test user...");
        const result = await authClient.signUp.email({
            email: 'test_neon_auth@example.com',
            password: 'TestPassword123!',
            name: 'Test User'
        }, {
            fetchOptions: {
                headers: {
                    'Origin': 'http://localhost:5173'
                }
            }
        });

        if (result.error) {
            console.error("SIGNUP ERROR:");
            console.error(JSON.stringify(result.error, null, 2));
        } else {
            console.log("SIGNUP SUCCESS:");
            console.log(JSON.stringify(result.data, null, 2));
        }
    } catch (e) {
        console.error("CAUGHT EXCEPTION:");
        console.error(e);
    }
}

testSignup();
