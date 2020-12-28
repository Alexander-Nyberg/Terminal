<?php
    $username = "########";
    $password = "########";
    
    $servername = "########";
    $dbname = "########";
    $schema = "########";
    
    try
    {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    
    catch (Exception $e)
    {
        die("server connection failed: " . $e->getMessage());
    }
?>
