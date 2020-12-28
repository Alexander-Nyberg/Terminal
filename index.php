<?php
    session_start();
?>
<!doctype html>
<html>
<head>
    <link rel='shortcut icon' href='images/C.PNG' type='image/x-icon'>
    <link rel='stylesheet' href='style/terminal.css'>
    <meta charset='utf-8'>
    <title>Login</title>
</head>
<body>
    <form method='post'>
        <label>Sign in</label><br>
        <label for='name'>username:</label>
        <input type='text' placeholder='enter username' name='name' autocomplete='on' maxlength='127' required><br>
        <label for='pwd'>password:</label>
        <input type='password' placeholder='enter password' name='pwd' autocomplete='on' maxlength='127' required><br>
        <input type='submit' value='submit'>
        <input type='button' value='change password' onclick='window.location.href = `change_pwd.php`'>
        <input type='button' value='create account' onclick='window.location.href = `account.php`'>
    </form>
    <?php
        include("php/database.php");
        
        if (isset($_POST["name"]) && strlen($_POST["name"]) != 0 && isset($_POST["pwd"]) && strlen($_POST["pwd"]) != 0)
        {
            $result = $pdo->query("SELECT ID, UserName, PassWord FROM `$schema`;");
            
            while ($row = $result->fetch())
            {
                if ($_POST["name"] == $row["UserName"] && password_verify($_POST["pwd"], $row["PassWord"]))
                {
                    $_SESSION["u_id"] = $row["ID"];
                    header("Location: terminal.php");
                }
            }
            
            echo "invalid username or password.";
        }
    ?>
</body>
</html>
