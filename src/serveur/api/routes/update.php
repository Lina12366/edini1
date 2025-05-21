<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['route_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Route ID is required']);
    exit();
}

$route_id = (int)$data['route_id'];
$updates = [];
$params = [];
$types = '';

if (isset($data['from_location'])) {
    $updates[] = 'from_location = ?';
    $params[] = $data['from_location'];
    $types .= 's';
}

if (isset($data['to_location'])) {
    $updates[] = 'to_location = ?';
    $params[] = $data['to_location'];
    $types .= 's';
}

if (isset($data['distance'])) {
    $updates[] = 'distance = ?';
    $params[] = (float)$data['distance'];
    $types .= 'd';
}

if (isset($data['estimated_time'])) {
    $updates[] = 'estimated_time = ?';
    $params[] = (int)$data['estimated_time'];
    $types .= 'i';
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit();
}

// Check if route exists
$check_sql = "SELECT route_id FROM routes WHERE route_id = ?";
$check_stmt = mysqli_prepare($con, $check_sql);
mysqli_stmt_bind_param($check_stmt, 'i', $route_id);
mysqli_stmt_execute($check_stmt);
$result = mysqli_stmt_get_result($check_stmt);

if (mysqli_num_rows($result) === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
    exit();
}

$sql = "UPDATE routes SET " . implode(', ', $updates) . " WHERE route_id = ?";
$types .= 'i';
$params[] = $route_id;

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, $types, ...$params);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        'success' => true,
        'message' => 'Route updated successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to update route',
        'details' => mysqli_error($con)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($con);
?>