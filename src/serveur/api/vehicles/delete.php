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

if (!isset($data['vehicle_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Vehicle ID is required']);
    exit();
}

$vehicle_id = (int)$data['vehicle_id'];

// Start transaction
mysqli_begin_transaction($con);

try {
    // First, update any schedules that use this vehicle
    $update_sql = "UPDATE schedules SET vehicle_id = NULL, status = 'cancelled' WHERE vehicle_id = ?";
    $update_stmt = mysqli_prepare($con, $update_sql);
    mysqli_stmt_bind_param($update_stmt, 'i', $vehicle_id);
    
    if (!mysqli_stmt_execute($update_stmt)) {
        throw new Exception('Failed to update schedules');
    }

    // Then delete the vehicle
    $delete_sql = "DELETE FROM vehicles WHERE vehicle_id = ?";
    $delete_stmt = mysqli_prepare($con, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, 'i', $vehicle_id);
    
    if (!mysqli_stmt_execute($delete_stmt)) {
        throw new Exception('Failed to delete vehicle');
    }

    // If everything is successful, commit the transaction
    mysqli_commit($con);
    
    echo json_encode([
        'success' => true,
        'message' => 'Vehicle and associated schedules have been updated successfully'
    ]);

} catch (Exception $e) {
    // If there's an error, rollback the transaction
    mysqli_rollback($con);
    
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'details' => mysqli_error($con)
    ]);
}

// Close statements and connection
if (isset($update_stmt)) mysqli_stmt_close($update_stmt);
if (isset($delete_stmt)) mysqli_stmt_close($delete_stmt);
mysqli_close($con);
?> 