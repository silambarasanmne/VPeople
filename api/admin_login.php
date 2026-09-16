<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (isset($data['username']) && isset($data['password'])) {
        if ($data['username'] === 'admin' && $data['password'] === 'admin123') {
            echo json_encode(['success' => true, 'token' => 'vpf_admin_token_2026']);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid Username or Password']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and password required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
