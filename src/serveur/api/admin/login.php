<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get the request body
$raw_data = file_get_contents('php://input');
error_log('Raw request data: ' . $raw_data);

$data = json_decode($raw_data, true);
error_log('Decoded data: ' . print_r($data, true));

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password are required']);
    exit();
}

require_once '../../config/db.php';

// Prepare the query
$sql = "SELECT * FROM admins WHERE email = ?";
$stmt = $con->prepare($sql);

if (!$stmt) {
    error_log('Prepare statement error: ' . $con->error);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
    exit();
}

// Bind parameters
$stmt->bind_param("s", $data['email']);

// Execute the query
if (!$stmt->execute()) {
    error_log('Execute error: ' . $stmt->error);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
    exit();
}

$result = $stmt->get_result();
error_log('Number of rows found: ' . $result->num_rows);

// Check if user exists
if ($result->num_rows === 0) {
    error_log('User not found: ' . $data['email']);
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit();
}

$admin = $result->fetch_assoc();
error_log('Found admin: ' . print_r($admin, true));

// Verify password
if (!password_verify($data['password'], $admin['password'])) {
    error_log('Invalid password for user: ' . $data['email']);
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid password']);
    exit();
}

// Start session
session_start();
$_SESSION['admin_id'] = $admin['admin_id'];
$_SESSION['username'] = $admin['username'];

// Remove password from response
unset($admin['password']);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'admin' => $admin
]);

$stmt->close();
$con->close();
?> 