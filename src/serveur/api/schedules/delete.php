<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

// Log the request method and headers
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request headers: " . print_r(getallheaders(), true));

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get schedule_id from URL query parameters
$schedule_id = isset($_GET['schedule_id']) ? intval($_GET['schedule_id']) : 0;

// Validate schedule_id
if (!$schedule_id) {
    error_log("Missing or invalid schedule_id in URL");
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Schedule ID is required']);
    exit();
}

error_log("Schedule ID from URL: " . $schedule_id);

// Database connection
require_once '../../config/db.php';

try {
    // Start transaction
    mysqli_begin_transaction($con);

    // Check if schedule exists
    $checkStmt = mysqli_prepare($con, "SELECT schedule_id FROM schedules WHERE schedule_id = ?");
    if (!$checkStmt) {
        throw new Exception("Failed to prepare check statement: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($checkStmt, "i", $schedule_id);
    if (!mysqli_stmt_execute($checkStmt)) {
        throw new Exception("Failed to execute check statement: " . mysqli_stmt_error($checkStmt));
    }
    
    $result = mysqli_stmt_get_result($checkStmt);
    if (mysqli_num_rows($result) === 0) {
        throw new Exception("Schedule not found");
    }

    // First, update any bookings to cancelled status
    $updateBookingsStmt = mysqli_prepare($con, "UPDATE bookings SET status = 'cancelled' WHERE schedule_id = ?");
    if (!$updateBookingsStmt) {
        throw new Exception("Failed to prepare update bookings statement: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($updateBookingsStmt, "i", $schedule_id);
    if (!mysqli_stmt_execute($updateBookingsStmt)) {
        throw new Exception("Failed to execute update bookings statement: " . mysqli_stmt_error($updateBookingsStmt));
    }

    // Then delete the schedule
    $deleteStmt = mysqli_prepare($con, "DELETE FROM schedules WHERE schedule_id = ?");
    if (!$deleteStmt) {
        throw new Exception("Failed to prepare delete statement: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($deleteStmt, "i", $schedule_id);
    if (!mysqli_stmt_execute($deleteStmt)) {
        throw new Exception("Failed to execute delete statement: " . mysqli_stmt_error($deleteStmt));
    }

    // Check if any rows were affected
    if (mysqli_stmt_affected_rows($deleteStmt) === 0) {
        throw new Exception("No schedule was deleted");
    }

    // Commit transaction
    if (!mysqli_commit($con)) {
        throw new Exception("Failed to commit transaction: " . mysqli_error($con));
    }

    error_log("Schedule deleted successfully");
    echo json_encode(['success' => true, 'message' => 'Schedule deleted successfully']);

} catch (Exception $e) {
    // Log the error
    error_log("Error in delete.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Rollback transaction on error
    if (mysqli_ping($con)) {
        mysqli_rollback($con);
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    // Close prepared statements
    if (isset($checkStmt)) mysqli_stmt_close($checkStmt);
    if (isset($updateBookingsStmt)) mysqli_stmt_close($updateBookingsStmt);
    if (isset($deleteStmt)) mysqli_stmt_close($deleteStmt);
    
    // Close database connection
    mysqli_close($con);
}
?> 