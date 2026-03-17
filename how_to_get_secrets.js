
const { createClient } = require('@supabase/supabase-js');

// --- 1. CONFIGURATION ---
// Copy these from your Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https://nlrgdhpmsittuwiiindq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function leakSecrets() {
  console.log('🕵️ Attempting to retrieve secrets via Supabase Edge Functions...');
  
  try {
    // We create a temporary function or try to list them
    // But since we can't easily read secrets via client library without an actual function,
    // THE BEST WAY is for YOU to copy them from:
    // https://supabase.com/dashboard/project/nlrgdhpmsittuwiiindq/settings/functions
    
    console.log('\n--- HOW TO GET SECRETS ---');
    console.log('1. Open this link: https://supabase.com/dashboard/project/nlrgdhpmsittuwiiindq/settings/functions');
    console.log('2. Look for "Edge Function Secrets"');
    console.log('3. If they are hidden (dots), click the "Edit" or "Copy" icon next to them.');
    console.log('4. Copy these specific ones:');
    console.log('   - TRIPAY_PRIVATE_KEY');
    console.log('   - TRIPAY_API_KEY');
    console.log('   - TRIPAY_MERCHANT_CODE');
    console.log('   - MAILKETING_API_KEY');
    console.log('   - CAPI_SAHAM');
    console.log('---------------------------\n');

  } catch (err) {
    console.error('Error:', err);
  }
}

leakSecrets();
