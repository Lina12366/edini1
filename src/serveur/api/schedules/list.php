<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get query parameters for filtering
$route_id = isset($_GET['route_id']) ? (int)$_GET['route_id'] : null;
$date = isset($_GET['date']) ? mysqli_real_escape_string($con, $_GET['date']) : null;

// Build query with correct column names
$sql = "SELECT s.*, r.from_location, r.to_location, v.vehicle_number, v.vehicle_type 
        FROM schedules s 
        JOIN routes r ON s.route_id = r.route_id 
        JOIN vehicles v ON s.vehicle_id = v.vehicle_id";

// Add WHERE clause if there are filters
$where_clauses = [];
if ($route_id) {
    $where_clauses[] = "s.route_id = $route_id";
}
if ($date) {
    $where_clauses[] = "DATE(s.departure_time) = '$date'";
}

if (!empty($where_clauses)) {
    $sql .= " WHERE " . implode(" AND ", $where_clauses);
}

$sql .= " ORDER BY s.departure_time ASC";

$result = mysqli_query($con, $sql);

if ($result) {
    $schedules = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Format dates for better display
        $row['departure_time'] = date('Y-m-d H:i:s', strtotime($row['departure_time']));
        $row['arrival_time'] = date('Y-m-d H:i:s', strtotime($row['arrival_time']));
        $schedules[] = $row;
    }
    echo json_encode([
        'success' => true,
        'schedules' => $schedules
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch schedules',
        'details' => mysqli_error($con)
    ]);
}

mysqli_close($con);
?>