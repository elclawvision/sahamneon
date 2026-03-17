import { neon } from '@neondatabase/serverless';

export default async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail, userName, phone, id } = req.body;

  if (!userEmail) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const databaseUrl = process.env.DATABASE_URL;
    const sql = neon(databaseUrl);

    console.log(`[FREE EBOOK] Triggered for ${userEmail} (${userName})`);

    // Save "FREE_EBOOK" record to global_product
    await sql`
      INSERT INTO global_product (
        email, name, phone, amount, 
        status, product_name, address, created_at
      ) VALUES (
        ${userEmail}, ${userName || ''}, ${phone || ''}, 0,
        'PAID', 'FREE_EBOOK', 'FREE', NOW()
      )
    `;

    return res.status(200).json({ success: true, message: 'Free ebook fulfillment triggered' });
  } catch (error) {
    console.error('Free Ebook fulfillment error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
