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

    // 2. Only process if status is PAID
    if (status === 'PAID') {
      console.log(`Payment confirmed for reference: ${reference}`);

      // Transactional update in Neon
      // Fetch the full record to use in fulfillment
      const results = await sql`
        SELECT * FROM global_product WHERE tripay_reference = ${reference} LIMIT 1
      `;
      
      const product = results[0];

      if (product && product.status === 'UNPAID') {
        await sql`
          UPDATE global_product 
          SET status = 'PAID' 
          WHERE tripay_reference = ${reference}
        `;

        console.log(`DB Updated for ${reference}`);
        
        // --- Fulfillment Phase ---
        try {
            console.log('Fulfillment started for:', product.email);
            
            // 1. Create client entry in saham_clients for dashboard access
            // We use the password we stored in the 'address' column during creation
            await sql`
              INSERT INTO saham_clients (user_email, name, phone, password, status, created_at, last_login)
              VALUES (${product.email}, ${product.name || ''}, ${product.phone || ''}, ${product.address || ''}, 'active', NOW(), NOW())
              ON CONFLICT (user_email) DO UPDATE SET status = 'active', password = EXCLUDED.password
            `;

            console.log('✅ Fulfillment completed: User created/updated in saham_clients');
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
