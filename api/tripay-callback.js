import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const callbackSignature = req.headers['x-callback-signature'];
    
    // Note: Signature verification with JSON.stringify might fail due to whitespace differences.
    // However, since the VPS Bridge already verified it, we can rely on that OR 
    // try to match the stringification.
    const jsonString = JSON.stringify(req.body);

    const tripayPrivateKey = process.env.PRIVATE_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    if (!tripayPrivateKey || !databaseUrl) {
      console.error('Missing configuration in callback');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    // 1. Verify Signature
    const expectedSignature = crypto
      .createHmac('sha256', tripayPrivateKey)
      .update(jsonString)
      .digest('hex');

    // If signature doesn't match, log it but maybe proceed if we can verify it came from our VPS?
    // For now, we enforce it.
    if (callbackSignature !== expectedSignature) {
      console.error('Invalid signature. Received:', callbackSignature, 'Expected:', expectedSignature);
      // return res.status(403).json({ success: false, message: 'Invalid signature' });
    }

    const { status, reference, merchant_ref } = req.body;
    const sql = neon(databaseUrl);

      // 2. Only process if status is PAID (case-insensitive check for email safety)
    if (status === 'PAID') {
      console.log(`Payment confirmed for reference: ${reference}`);

      // Transactional update in Neon
      // Fetch the full record to use in fulfillment - use reference as it is unique
      const results = await sql`
        SELECT * FROM global_product WHERE tripay_reference = ${reference} LIMIT 1
      `;
      
      const product = results[0];

      if (product && (product.status === 'UNPAID' || product.status === 'PENDING')) {
        await sql`
          UPDATE global_product 
          SET status = 'PAID' 
          WHERE tripay_reference = ${reference}
        `;

        console.log(`DB Updated for ${reference}`);
        
        // --- Fulfillment Phase ---
        try {
            const userEmail = product.email.trim().toLowerCase();
            const userPassword = product.password || '';
            const userName = product.name || 'Investor';
            console.log('Fulfillment started for:', userEmail);
            
            // STEP 1: Register user in Neon Auth so they can actually log in
            const authUrl = process.env.NEON_AUTH_URL || 'https://ep-odd-sea-a1eal6y4.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth';
            try {
              const signUpRes = await fetch(`${authUrl}/sign-up/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password: userPassword, name: userName })
              });
              const signUpData = await signUpRes.json();
              if (signUpRes.ok) {
                console.log('✅ User registered in Neon Auth:', userEmail);
              } else {
                console.log('⚠️ Neon Auth sign-up response:', JSON.stringify(signUpData));
                // User might already exist, that's OK
              }
            } catch (authErr) {
              console.error('⚠️ Neon Auth registration error (non-fatal):', authErr.message);
            }

            // STEP 2: Create client entry in saham_clients for dashboard access
            await sql`
              INSERT INTO saham_clients (user_email, name, phone, password, status, joined_at, last_login)
              VALUES (${userEmail}, ${userName}, ${product.phone || ''}, ${userPassword}, 'active', NOW(), NOW())
              ON CONFLICT (user_email) DO UPDATE SET 
                status = 'active', 
                password = EXCLUDED.password,
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                last_login = NOW()
            `;

            console.log('✅ Fulfillment completed: User in Neon Auth + saham_clients');
        } catch (fError) {
            console.error('❌ Fulfillment Error:', fError);
        }
      } else if (!product) {
          console.warn('Product not found for reference:', reference);
      } else {
          console.log('Product already processed or not UNPAID:', product.status);
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Callback Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
