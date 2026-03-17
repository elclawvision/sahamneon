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
    const { pixelId, eventName, eventSourceUrl, userData, customData } = req.body;
    const capiAccessToken = process.env.CAPI_SAHAM;

    if (!pixelId || !capiAccessToken) {
      console.log('CAPI Missing Pixel ID or Access Token');
      return res.status(200).json({ success: true, message: 'CAPI skipped (missing config)' });
    }

    console.log(`[CAPI] Event: ${eventName} for Pixel: ${pixelId}`);

    // Prepare Meta CAPI Payload
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${capiAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('CAPI Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
