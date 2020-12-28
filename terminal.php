<?php
    session_start();
    
    if (!isset($_SESSION["u_id"])) { header("Location: index.php"); }
?>
<!doctype html>
<html>
<head>
    <link rel='shortcut icon' href='images/C.PNG' type='image/x-icon'>
    <link rel='stylesheet' href='style/terminal.css'>
    <meta charset='utf-8'>
    <title>Terminal</title>
</head>
<body>
    <canvas id='terminal'></canvas>
    <script src='script/script.js'></script>
    <script>
        <?php echo "user_init(" . $_SESSION["u_id"] . ");"; ?>
    </script>
</body>
</html>
