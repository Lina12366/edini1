<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['route_id']) || !isset($data['vehicle_id']) || 
    !isset($data['departure_time']) || !isset($data['arrival_time']) || 
    !isset($data['price']) || !isset($data['available_seats'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Validate data types
if (!is_numeric($data['route_id']) || !is_numeric($data['vehicle_id']) || 
    !is_numeric($data['price']) || !is_numeric($data['available_seats'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data types']);
    exit();
}

// Prepare data
$route_id = (int)$data['route_id'];
$vehicle_id = (int)$data['vehicle_id'];
$departure_time = mysqli_real_escape_string($con, $data['departure_time']);
$arrival_time = mysqli_real_escape_string($con, $data['arrival_time']);
$price = (float)$data['price'];
$available_seats = (int)$data['available_seats'];

// Validate dates
if (strtotime($departure_time) >= strtotime($arrival_time)) {
    http_response_code(400);
    echo json_encode(['error' => 'Arrival time must be after departure time']);
    exit();
}

// Check if route exists
$route_check = mysqli_query($con, "SELECT route_id FROM routes WHERE route_id = $route_id");
if (mysqli_num_rows($route_check) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid route ID']);
    exit();
}

// Check if vehicle exists
$vehicle_check = mysqli_query($con, "SELECT vehicle_id FROM vehicles WHERE vehicle_id = $vehicle_id");
if (mysqli_num_rows($vehicle_check) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid vehicle ID']);
    exit();
}

// Create schedule
$sql = "INSERT INTO schedules (route_id, vehicle_id, departure_time, arrival_time, price, available_seats, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'active')";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, 'iissdi', $route_id, $vehicle_id, $departure_time, $arrival_time, $price, $available_seats);

if (mysqli_stmt_execute($stmt)) {
    $schedule_id = mysqli_insert_id($con);
    echo json_encode([
        'success' => true,
        'message' => 'Schedule created successfully',
        'schedule_id' => $schedule_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to create schedule',
        'details' => mysqli_error($con)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($con);
?>