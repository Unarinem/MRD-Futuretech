<?php
// Simple email service for MRD website
// Sends welcome emails and form notifications

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Read JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Validate required fields
if (!isset($data['to']) || !isset($data['subject'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Email configuration
$to = $data['to'];
$from = $data['from'] ?? 'info@mphod.com';
$subject = $data['subject'];
$template = $data['template'] ?? 'default';
$userData = $data['data'] ?? [];

// Generate email content based on template
$message = generateEmailContent($template, $userData);

// Email headers
$headers = [
    'From: ' . $from,
    'Reply-To: ' . $from,
    'X-Mailer: PHP/' . phpversion(),
    'Content-Type: text/html; charset=UTF-8'
];

// Send email
$success = mail($to, $subject, $message, implode("\r\n", $headers));

if ($success) {
    // Log email sent
    logEmailSent($to, $subject, $template);
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to send email']);
}

function generateEmailContent($template, $data) {
    switch ($template) {
        case 'welcome':
            return generateWelcomeEmail($data);
        case 'form_notification':
            return generateFormNotificationEmail($data);
        default:
            return generateDefaultEmail($data);
    }
}

function generateWelcomeEmail($data) {
    $name = $data['name'] ?? 'Valued Member';
    $joinDate = $data['joinDate'] ?? date('Y-m-d');
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(45deg, #FFD700, #FFA500); color: #000; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎉 Welcome to MRD AI & Blockchain!</h1>
            </div>
            <div class='content'>
                <h2>Hello " . htmlspecialchars($name) . "!</h2>
                
                <p>Welcome to the MRD AI & Blockchain community! We're thrilled to have you join us on this exciting journey of innovation and automation.</p>
                
                <h3>What's Next?</h3>
                <ul>
                    <li>📚 Explore our comprehensive AI courses</li>
                    <li>🤖 Learn automation techniques</li>
                    <li>💼 Connect with like-minded professionals</li>
                    <li>🚀 Build your AI-powered future</li>
                </ul>
                
                <p>Join Date: " . htmlspecialchars($joinDate) . "</p>
                
                <a href='#' class='button'>Get Started Now</a>
                
                <p>If you have any questions, feel free to reach out to us at <strong>info@mphod.com</strong></p>
                
                <p>Best regards,<br>The MRD Team</p>
            </div>
            <div class='footer'>
                <p>MRD AI & Blockchain Consulting | info@mphod.com</p>
                <p>This email was sent because you joined our community.</p>
            </div>
        </div>
    </body>
    </html>
    ";
}

function generateFormNotificationEmail($data) {
    $formType = $data['form_type'] ?? 'Contact Form';
    $name = $data['name'] ?? 'Unknown';
    $email = $data['email'] ?? 'Unknown';
    $message = $data['message'] ?? 'No message provided';
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FFD700; color: #000; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin: 15px 0; }
            .label { font-weight: bold; color: #FFD700; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>📧 New " . htmlspecialchars($formType) . " Submission</h1>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Name:</span> " . htmlspecialchars($name) . "
                </div>
                <div class='field'>
                    <span class='label'>Email:</span> " . htmlspecialchars($email) . "
                </div>
                <div class='field'>
                    <span class='label'>Message:</span><br>
                    " . nl2br(htmlspecialchars($message)) . "
                </div>
                <div class='field'>
                    <span class='label'>Submitted:</span> " . date('Y-m-d H:i:s') . "
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
}

function generateDefaultEmail($data) {
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FFD700; color: #000; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>MRD AI & Blockchain</h1>
            </div>
            <div class='content'>
                <p>Thank you for your interest in MRD AI & Blockchain!</p>
                <p>We'll get back to you soon.</p>
                <p>Best regards,<br>The MRD Team</p>
            </div>
        </div>
    </body>
    </html>
    ";
}

function logEmailSent($to, $subject, $template) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'to' => $to,
        'subject' => $subject,
        'template' => $template
    ];
    
    $logFile = '../data/email-log.json';
    $logs = [];
    
    if (file_exists($logFile)) {
        $logs = json_decode(file_get_contents($logFile), true) ?: [];
    }
    
    $logs[] = $logEntry;
    
    // Keep only last 100 entries
    if (count($logs) > 100) {
        $logs = array_slice($logs, -100);
    }
    
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
}
?>
