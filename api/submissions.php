<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/../submissions_data.json';

// Initialize data if file doesn't exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

// Helper to read data
function readData($file) {
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Helper to write data
function writeData($file, $data) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $submissions = readData($dataFile);
    
    // Sort by createdAt descending (if dates are present)
    usort($submissions, function($a, $b) {
        $dateA = isset($a['dateSubmitted']) ? strtotime($a['dateSubmitted']) : 0;
        $dateB = isset($b['dateSubmitted']) ? strtotime($b['dateSubmitted']) : 0;
        return $dateB - $dateA;
    });

    // Check if a specific appNo is requested via query param
    if (isset($_GET['appNo'])) {
        $appNo = $_GET['appNo'];
        $found = array_filter($submissions, function($s) use ($appNo) {
            return $s['appNo'] === $appNo;
        });
        if (!empty($found)) {
            echo json_encode(['success' => true, 'data' => array_values($found)[0]]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Submission not found']);
        }
        exit;
    }

    echo json_encode(['success' => true, 'data' => $submissions]);
} 
elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
        exit;
    }

    if (empty($data['appNo'])) {
        $data['appNo'] = 'VPF-' . date('Y') . '-' . rand(1000, 9999);
    }
    if (empty($data['dateSubmitted'])) {
        $data['dateSubmitted'] = date('Y-m-d');
    }

    $submissions = readData($dataFile);
    array_unshift($submissions, $data); // Add to beginning
    writeData($dataFile, $submissions);

    http_response_code(201);
    echo json_encode(['success' => true, 'data' => $data]);
} 
elseif ($method === 'DELETE') {
    if (isset($_GET['appNo'])) {
        $appNo = $_GET['appNo'];
        $submissions = readData($dataFile);
        $submissions = array_filter($submissions, function($s) use ($appNo) {
            return $s['appNo'] !== $appNo;
        });
        
        // Re-index array
        $submissions = array_values($submissions);
        writeData($dataFile, $submissions);

        echo json_encode(['success' => true, 'message' => 'Deleted successfully', 'appNo' => $appNo]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'appNo query parameter is required']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
