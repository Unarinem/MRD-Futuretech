<?php
// Simple CSV submission endpoint (same-origin)
// Writes rows to ../data/submissions.csv with columns:
// timestamp, page_source, form_id, session_id, ip, user_agent, data_json
// Also updates Google Sheet in real-time

// Google Sheets integration via Apps Script webhook (more secure than service account)
// require_once 'google-sheets-api.php'; // Disabled - using webhook instead

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read JSON body
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Basic shape validation
// Accepts either { type: 'mrd_single_submit', submission: { .. } }
// or { submissions: [ {..}, {..} ] } but we treat all as a list
$submissions = [];
if (isset($payload['submission']) && is_array($payload['submission'])) {
    $submissions[] = $payload['submission'];
} elseif (isset($payload['submissions']) && is_array($payload['submissions'])) {
    $submissions = $payload['submissions'];
} else {
    // allow raw form data as well
    $submissions[] = $payload;
}

// Ensure data directory
$root = dirname(__DIR__);
$dataDir = $root . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0775, true);
}

$csvPath = $dataDir . DIRECTORY_SEPARATOR . 'submissions.csv';
$fileExists = file_exists($csvPath);

// Open file for append
$fh = fopen($csvPath, 'a');
if ($fh === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed to open storage']);
    exit;
}

// Lock file
flock($fh, LOCK_EX);

// Write header if new file
if (!$fileExists) {
    fputcsv($fh, ['timestamp', 'page_source', 'form_id', 'session_id', 'ip', 'user_agent', 'data_json']);
}

// Helper to safely get client IP
function client_ip() {
    foreach (['HTTP_CF_CONNECTING_IP','HTTP_X_FORWARDED_FOR','HTTP_CLIENT_IP','REMOTE_ADDR'] as $h) {
        if (!empty($_SERVER[$h])) {
            $val = $_SERVER[$h];
            if ($h === 'HTTP_X_FORWARDED_FOR') {
                $parts = explode(',', $val);
                return trim($parts[0]);
            }
            return $val;
        }
    }
    return '';
}

$ip = client_ip();
$ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : '';

$written = 0;
$sheetUpdated = false;
foreach ($submissions as $s) {
    if (!is_array($s)) continue;
    $timestamp = isset($s['timestamp']) ? $s['timestamp'] : gmdate('c');
    $page = isset($s['page_source']) ? (string)$s['page_source'] : (isset($s['page']) ? (string)$s['page'] : '');
    $formId = isset($s['form_id']) ? (string)$s['form_id'] : '';
    $sessionId = isset($s['session_id']) ? (string)$s['session_id'] : '';
    // Consolidate data: prefer nested data field else full object minus known keys
    $data = [];
    if (isset($s['data']) && is_array($s['data'])) {
        $data = $s['data'];
    } else {
        $data = $s;
        unset($data['timestamp'], $data['page'], $data['page_source'], $data['form_id'], $data['session_id']);
    }
    $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    fputcsv($fh, [$timestamp, $page, $formId, $sessionId, $ip, $ua, $dataJson]);
    
    // Update Google Sheet via Apps Script webhook
    $sheetData = array_merge($data, [
        'timestamp' => $timestamp,
        'page_source' => $page,
        'form_id' => $formId,
        'session_id' => $sessionId,
        'ip' => $ip,
        'user_agent' => $ua
    ]);
    
    if (sendToGoogleSheetsWebhook($sheetData)) {
        $sheetUpdated = true;
    }
    
    $written++;
}

// Unlock and close
flock($fh, LOCK_UN);
fclose($fh);

echo json_encode(['ok' => true, 'written' => $written, 'sheet_updated' => $sheetUpdated]);
?>

<?php
// Function to send data to Google Sheets via Apps Script webhook
function sendToGoogleSheetsWebhook($data) {
    // Your NEW Apps Script webhook URL
    $webhookUrl = 'https://script.google.com/macros/s/AKfycbzBO4RD99n35sLqCDMHgtI58b4lmKbOcwuQhsgyuLHD3bXrWmrfpTc18-vRqClAI1gubw/exec';
    
    $payload = json_encode([
        'type' => 'mrd_single_submit',
        'submission' => $data
    ]);
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $webhookUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ],
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $result = json_decode($response, true);
        return isset($result['success']) && $result['success'];
    }
    
    return false;
}
?>



