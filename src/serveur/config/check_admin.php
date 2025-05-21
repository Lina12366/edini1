<?php
require_once 'db.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if admins table exists
$check_table = "SHOW TABLES LIKE 'admins'";
$table_result = $con->query($check_table);

if ($table_result->num_rows === 0) {
    echo "Admins table does not exist!";
    exit;
}

// Get all admins
$sql = "SELECT * FROM admins";
$result = $con->query($sql);

if ($result) {
    echo "Number of admins found: " . $result->num_rows . "\n\n";
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            echo "Admin ID: " . $row['admin_id'] . "\n";
            echo "Username: " . $row['username'] . "\n";
            echo "Email: " . $row['email'] . "\n";
            echo "Created at: " . $row['created_at'] . "\n";
            echo "-------------------\n";
        }
    } else {
        echo "No admins found in the database!";
    }
} else {
    echo "Error querying admins table: " . $con->error;
}

$con->close();
?> 