<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['vehicle_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Vehicle ID is required']);
    exit();
}

$vehicle_id = (int)$data['vehicle_id'];
$updates = [];
$params = [];
$types = '';

if (isset($data['vehicle_number'])) {
    $updates[] = 'vehicle_number = ?';
    $params[] = $data['vehicle_number'];
    $types .= 's';
}

if (isset($data['vehicle_type'])) {
    $updates[] = 'vehicle_type = ?';
    $params[] = $data['vehicle_type'];
    $types .= 's';
}

if (isset($data['total_seats'])) {
    $updates[] = 'total_seats = ?';
    $params[] = (int)$data['total_seats'];
    $types .= 'i';
}

if (isset($data['status'])) {
    $updates[] = 'status = ?';
    $params[] = $data['status'];
    $types .= 's';
}

if (empty($updates)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update']);
    exit();
}

// Check if vehicle exists
$check_sql = "SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?";
$check_stmt = mysqli_prepare($con, $check_sql);
mysqli_stmt_bind_param($check_stmt, 'i', $vehicle_id);
mysqli_stmt_execute($check_stmt);
$result = mysqli_stmt_get_result($check_stmt);

if (mysqli_num_rows($result) === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Vehicle not found']);
    exit();
}

$sql = "UPDATE vehicles SET " . implode(', ', $updates) . " WHERE vehicle_id = ?";
$types .= 'i';
$params[] = $vehicle_id;

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, $types, ...$params);

if (mysqli_stmt_execute($stmt)) {
    echo json_encode([
        'success' => true,
        'message' => 'Vehicle updated successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to update vehicle',
        'details' => mysqli_error($con)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($con);
?>