<?php
require_once 'db.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Delete existing admin
$delete_sql = "DELETE FROM admins";
if ($con->query($delete_sql)) {
    echo "Old admins deleted successfully\n";
} else {
    echo "Error deleting old admins: " . $con->error . "\n";
}

// Create new admin
$username = 'admin';
$password = 'admin'; // Simple password
$email = 'admin@admin.com'; // Simple email

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert new admin
$sql = "INSERT INTO admins (username, password, email) VALUES (?, ?, ?)";
$stmt = $con->prepare($sql);
$stmt->bind_param("sss", $username, $hashed_password, $email);

if ($stmt->execute()) {
    echo "\nNew admin created successfully!\n";
    echo "Email: " . $email . "\n";
    echo "Password: " . $password . "\n";
} else {
    echo "Error creating new admin: " . $stmt->error . "\n";
}

$stmt->close();
$con->close();
?> 