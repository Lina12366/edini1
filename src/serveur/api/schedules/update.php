<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if the request method is PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get the request body
$input = file_get_contents('php://input');
error_log("Raw input: " . $input);

$data = json_decode($input, true);
error_log("Decoded data: " . print_r($data, true));

// Validate required fields
if (!isset($data['schedule_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Schedule ID is required']);
    exit();
}

// Database connection
require_once '../config/database.php';

try {
    // Start transaction
    $conn->begin_transaction();

    // Check if schedule exists
    $checkStmt = $conn->prepare("SELECT schedule_id FROM schedules WHERE schedule_id = ?");
    if (!$checkStmt) {
        throw new Exception("Failed to prepare check statement: " . $conn->error);
    }
    
    $checkStmt->bind_param("i", $data['schedule_id']);
    if (!$checkStmt->execute()) {
        throw new Exception("Failed to execute check statement: " . $checkStmt->error);
    }
    
    $result = $checkStmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Schedule not found");
    }

    // Update bookings to cancelled status
    $updateBookingsStmt = $conn->prepare("UPDATE bookings SET status = 'cancelled' WHERE schedule_id = ?");
    if (!$updateBookingsStmt) {
        throw new Exception("Failed to prepare update bookings statement: " . $conn->error);
    }
    
    $updateBookingsStmt->bind_param("i", $data['schedule_id']);
    if (!$updateBookingsStmt->execute()) {
        throw new Exception("Failed to execute update bookings statement: " . $updateBookingsStmt->error);
    }

    // Commit transaction
    if (!$conn->commit()) {
        throw new Exception("Failed to commit transaction: " . $conn->error);
    }

    echo json_encode(['success' => true, 'message' => 'Bookings updated successfully']);

} catch (Exception $e) {
    // Log the error
    error_log("Error in update.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Rollback transaction on error
    if ($conn->inTransaction()) {
        $conn->rollback();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
    // Close prepared statements
    if (isset($checkStmt)) $checkStmt->close();
    if (isset($updateBookingsStmt)) $updateBookingsStmt->close();
    
    // Close database connection
    $conn->close();
}
?>