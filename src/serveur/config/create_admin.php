<?php
require_once 'db.php';

// Default admin credentials
$username = 'admin';
$password = 'admin123'; // This should be changed after first login
$email = 'admin@example.com';

// Hash the password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Check if admin already exists
$check_sql = "SELECT * FROM admins WHERE username = ?";
$check_stmt = $con->prepare($check_sql);
$check_stmt->bind_param("s", $username);
$check_stmt->execute();
$result = $check_stmt->get_result();

if ($result->num_rows === 0) {
    // Insert default admin
    $sql = "INSERT INTO admins (username, password, email) VALUES (?, ?, ?)";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("sss", $username, $hashed_password, $email);

    if ($stmt->execute()) {
        echo "Default admin created successfully\n";
        echo "Username: " . $username . "\n";
        echo "Password: " . $password . "\n";
        echo "Please change these credentials after first login!";
    } else {
        echo "Error creating default admin: " . $stmt->error;
    }
} else {
    echo "Admin user already exists";
}

$check_stmt->close();
$con->close();
?> 