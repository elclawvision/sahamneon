<?php
// ====================================
// TRIPAY PHP GENERIC PROXY - V2
// ====================================

// Strict error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set required CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Callback-Signature');

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- CONFIGURATION ---
// Load environment variables from a .env file
$env = parse_ini_file('.env');
if (!$env) {
    sendResponse(['success' => false, 'error' => 'Error: Unable to load .env configuration file.'], 500);
}

$tripayApiKey = $env['TRIPAY_API_KEY'] ?? null;
$tripayPrivateKey = $env['TRIPAY_PRIVATE_KEY'] ?? null;
$tripayMerchantCode = $env['TRIPAY_MERCHANT_CODE'] ?? null;

// Ensure all required environment variables are loaded
if (!$tripayApiKey || !$tripayPrivateKey || !$tripayMerchantCode) {
    sendResponse(['success' => false, 'error' => 'Error: Missing required Tripay environment variables.'], 500);
}

// --- HELPER FUNCTIONS ---

// Generic function to send a JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Log messages to the server's error log
function logMessage($message) {
    error_log(date('Y-m-d H:i:s') . ' - ' . $message);
}

// --- ROUTING ---
$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$input = json_decode(file_get_contents('php://input'), true);


// ====================================
// CREATE PAYMENT ENDPOINT (GENERIC)
// ====================================
if ($path === '/create-payment' && $requestMethod === 'POST') {
    try {
        logMessage('🚀 ===== GENERIC PROXY CREATE PAYMENT [V2] =====');
        logMessage('📦 Received generic payload: ' . json_encode($input));

        // 1. VALIDATE INPUT FROM EDGE FUNCTION
        $requiredFields = ['method', 'merchant_ref', 'amount', 'customer_name', 'customer_email', 'customer_phone', 'order_items'];
        foreach ($requiredFields as $field) {
            if (empty($input[$field])) {
                sendResponse(['success' => false, 'error' => "Proxy validation failed: Missing required field `{$field}` from Edge Function."], 400);
            }
        }
        
        $amount = $input['amount'];
        $merchantRef = $input['merchant_ref'];

        // 2. GENERATE TRIPAY SIGNATURE
        $signature = hash_hmac('sha256', $tripayMerchantCode . $merchantRef . $amount, $tripayPrivateKey);
        logMessage('🔐 Signature generated: ' . $signature);

        // 3. PREPARE FINAL TRIPAY PAYLOAD
        $tripayPayload = [
            'method'         => $input['method'],
            'merchant_ref'   => $merchantRef,
            'amount'         => $amount,
            'customer_name'  => $input['customer_name'],
            'customer_email' => $input['customer_email'],
            'customer_phone' => $input['customer_phone'],
            'order_items'    => $input['order_items'],
            'callback_url'   => 'https://payment.elvisiongroup.com/urlcallback', // Central callback handler
            'return_url'     => $input['return_url'] ?? 'https://elvisiongroup.com/payment/finish',
            'expired_time'   => intval(floor(time()) + (24 * 60 * 60)), // 24 hours expiry
            'signature'      => $signature
        ];

        logMessage('📤 Forwarding final payload to Tripay: ' . json_encode($tripayPayload));

        // 4. SEND REQUEST TO TRIPAY
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://tripay.co.id/api/transaction/create',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($tripayPayload),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $tripayApiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($error) {
            logMessage('❌ CURL Error to Tripay: ' . $error);
            sendResponse(['success' => false, 'error' => 'Connection error to Tripay gateway'], 500);
        }

        $tripayData = json_decode($response, true);
        logMessage('📡 Tripay response status: ' . $httpCode);
        logMessage('📡 Tripay response body: ' . $response);

        // 5. HANDLE TRIPAY RESPONSE
        if ($httpCode !== 200 || !$tripayData['success']) {
            logMessage('❌ Tripay API Error: ' . json_encode($tripayData));
            // Forward the error from Tripay to the Edge Function
            sendResponse([
                'success' => false,
                'error'   => 'TriPay API error',
                'details' => $tripayData
            ], $httpCode);
        }
        
        logMessage('✅ Transaction created successfully via proxy.');
        // The tripayData is already a well-formed JSON response.
        // We can add the merchant_ref to it for consistency if it's not already there.
        if (!isset($tripayData['merchant_ref'])) {
            $tripayData['merchant_ref'] = $merchantRef;
        }

        // 6. SUCCESS: FORWARD TRIPAY RESPONSE TO EDGE FUNCTION
        logMessage('🚀 ===== PROXY V2 COMPLETE =====');
        // The content type is already application/json, just echo the response from Tripay
        echo $response;
        exit();

    } catch (Exception $e) {
        logMessage('❌ ===== PROXY V2 CRITICAL ERROR =====');
        logMessage('❌ Error: ' . $e->getMessage());
        sendResponse(['success' => false, 'error' => 'Internal server error in PHP proxy', 'message' => $e->getMessage()], 500);
    }
}

// ====================================
// CALLBACK ENDPOINT (Unchanged)
// This endpoint remains crucial for receiving notifications from Tripay
// and forwarding them to the `tripay-callback` Edge Function.
// ====================================
if ($path === '/urlcallback' && $requestMethod === 'POST') {
    try {
        logMessage('🎯 ===== TRIPAY CALLBACK RECEIVED (via VPS proxy) =====');
        
        $allHeaders = getallheaders();
        $receivedSignature = $allHeaders['X-Callback-Signature'] ?? $allHeaders['x-callback-signature'] ?? $_SERVER['HTTP_X_CALLBACK_SIGNATURE'] ?? '';
        $jsonString = file_get_contents('php://input');
        $expectedSignature = hash_hmac('sha256', $jsonString, $tripayPrivateKey);
        
        if ($receivedSignature !== $expectedSignature) {
            logMessage('❌ Invalid callback signature. Received: ' . $receivedSignature);
            sendResponse(['success' => false, 'message' => 'Invalid signature'], 403);
        }
        
        $callbackData = json_decode($jsonString, true);
        logMessage('🎉 Valid signature. Processing callback for status: ' . ($callbackData['status'] ?? 'N/A'));

        if (($callbackData['status'] ?? null) === 'PAID') {
            logMessage('🚀 Triggering Supabase tripay-callback Edge Function...');
            
            // This Authorization token should be a securely stored service key
            $serviceRoleKey = $env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

            $headersToForward = [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $serviceRoleKey,
                'X-Callback-Signature: ' . $receivedSignature
            ];

            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => 'https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/tripay-callback',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $jsonString,
                CURLOPT_HTTPHEADER => $headersToForward,
                CURLOPT_TIMEOUT => 30
            ]);
            
            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
            
            logMessage("🚀 Edge Function tripay-callback response status: ${httpCode}. Body: ${response}");
        }
        
        // Always return 200 to Tripay to acknowledge receipt
        sendResponse(['success' => true, 'message' => 'Callback acknowledged']);
        
    } catch (Exception $e) {
        logMessage('❌ ===== CALLBACK ERROR =====');
        logMessage('❌ Error: ' . $e->getMessage());
        sendResponse(['success' => false, 'error' => 'Internal server error'], 500);
    }
}


// Fallback for any other route
sendResponse(['success' => false, 'error' => 'Endpoint not found', 'path' => $path], 404);
?>
