import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

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

  try {
    const { 
      subscriptionType, 
      paymentMethod, 
      userName, 
      userEmail, 
      phoneNumber, 
      amount, 
      productName, 
      purchasePassword 
    } = req.body;

    // 1. Validation
    if (!userEmail || !paymentMethod || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 2. Configuration (from Vercel Env)
    // TriPay keys are NO LONGER needed on Vercel as the Bridge handles signature generation.
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error('Missing DATABASE_URL configuration');
      return res.status(500).json({ success: false, error: 'Database configuration error' });
    }

    const sql = neon(databaseUrl);

    // 3. Prepare Payload for Bridge
    const merchantRef = `SAHAM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const expiredTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

    const tripayPayload = {
      method: paymentMethod,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: userName || 'Customer',
      customer_email: userEmail,
      customer_phone: phoneNumber || '',
      order_items: [
        {
          sku: subscriptionType || 'SAHAM_ULTIMATE',
          name: productName || 'Saham Ultimate Subscription',
          price: amount,
          quantity: 1,
        }
      ],
      expired_time: expiredTime
      // Signature and callback_url will be handled by the VPS Bridge
    };

    console.log('Sending to TriPay via Bridge:', JSON.stringify(tripayPayload));

    // 4. Call TriPay API via VPS Bridge
    let tripayData;
    let responseText = '';
    const bridgeSecret = process.env.BRIDGE_SECRET_TOKEN;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': `https://${req.headers.host}`,
        'Referer': `https://${req.headers.host}/`
      };

      if (bridgeSecret) {
        headers['X-Bridge-Token'] = bridgeSecret;
      }

      const bridgeResponse = await fetch('https://payment.elvisiongroup.com/create-payment', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(tripayPayload)
      });

      responseText = await bridgeResponse.text();
      
      if (!bridgeResponse.ok) {
        console.error(`Bridge HTTP Error ${bridgeResponse.status}:`, responseText);
        return res.status(bridgeResponse.status).json({ 
          success: false, 
          error: `Bridge Error (${bridgeResponse.status})`,
          details: responseText.substring(0, 500)
        });
      }

      try {
        tripayData = JSON.parse(responseText);
      } catch (e) {
        console.error('Bridge returned non-JSON:', responseText);
        return res.status(500).json({ 
          success: false, 
          error: 'Bridge returned an invalid response format',
          rawResponse: responseText.substring(0, 500)
        });
      }

      if (!tripayData.success) {
        console.error('TriPay Logic Error:', tripayData);
        return res.status(400).json({ 
          success: false, 
          error: tripayData.message || tripayData.error || 'TriPay API Error', 
          details: tripayData 
        });
      }
    } catch (e) {
      console.error('Fetch error:', e);
      return res.status(500).json({ success: false, error: 'Failed to connect to bridge: ' + e.message });
    }

    const data = tripayData.data;

    // 5. Save "UNPAID" record to global_product
    await sql`
      INSERT INTO global_product (
        email, name, phone, amount, 
        status, tripay_reference, merchant_ref, product_name, address, password, created_at
      ) VALUES (
        ${userEmail}, ${userName || ''}, ${phoneNumber || ''}, ${amount},
        'UNPAID', ${data.reference}, ${merchantRef}, ${productName || 'Saham Ultimate'}, 
        ${paymentMethod}, ${purchasePassword || ''}, NOW()
      )
    `;

    // 6. Return response to frontend
    return res.status(200).json({
      success: true,
      tripay_reference: data.reference,
      merchant_ref: merchantRef,
      checkout_url: data.checkout_url,
      payCode: data.pay_code,
      qrUrl: data.qr_url,
      qrString: data.qr_string,
      instructions: data.instructions,
      amount: amount,
      status: 'UNPAID'
    });

  } catch (error) {
    console.error('Critical Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
