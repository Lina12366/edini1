<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Start transaction
mysqli_begin_transaction($con);

try {
    // Update any schedules associated with this route
    $update_schedules_sql = "UPDATE schedules SET route_id = NULL, status = 'cancelled' WHERE route_id = ?";
    $update_schedules_stmt = mysqli_prepare($con, $update_schedules_sql);
    mysqli_stmt_bind_param($update_schedules_stmt, 'i', $route_id);
    mysqli_stmt_execute($update_schedules_stmt);

    // Delete the route
    $delete_route_sql = "DELETE FROM routes WHERE route_id = ?";
    $delete_route_stmt = mysqli_prepare($con, $delete_route_sql);
    mysqli_stmt_bind_param($delete_route_stmt, 'i', $route_id);
    
    if (!mysqli_stmt_execute($delete_route_stmt)) {
        throw new Exception('Failed to delete route');
    }

    // If we get here, commit the transaction
    mysqli_commit($con);
    
    echo json_encode([
        'success' => true,
        'message' => 'Route deleted successfully'
    ]);

} catch (Exception $e) {
    // If there's an error, rollback the transaction
    mysqli_rollback($con);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to delete route',
        'details' => $e->getMessage()
    ]);
}

// Close prepared statements
if (isset($update_schedules_stmt)) {
    mysqli_stmt_close($update_schedules_stmt);
}
if (isset($delete_route_stmt)) {
    mysqli_stmt_close($delete_route_stmt);
}

mysqli_close($con);
?> 