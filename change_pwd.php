<?php
    session_start();
?>
<!doctype html>
<html>
<head>
    <link rel='shortcut icon' href='images/C.PNG' type='image/x-icon'>
    <link rel='stylesheet' href='style/terminal.css'>
    <meta charset='utf-8'>
    <title>Create Account</title>
</head>
<body>
    <form method='post'>
        <label>Change password</label><br>
        <label for='name'>username:</label>
        <input type='text' placeholder='enter username' name='name' autocomplete='on' maxlength='127' required><br>
        <label for='old_pwd'>old password:</label>
        <input type='text' placeholder='old password' name='old_pwd' autocomplete='on' maxlength='127' required><br>
        <label for='new_pwd'>new password:</label>
        <input type='password' placeholder='new password' name='new_pwd' autocomplete='on' maxlength='127' required><br>
        <input type='submit' value='submit'>
        <input type='button' value='cancel' onclick='window.location.href = `index.php`'>
    </form>
    <?php
        include("php/database.php");
        
        if (isset($_POST["name"]) && strlen($_POST["name"]) != 0 && isset($_POST["old_pwd"]) && strlen($_POST["old_pwd"]) != 0 && isset($_POST["new_pwd"]) && strlen($_POST["new_pwd"]) != 0)
        {
            $result = $pdo->query("SELECT * FROM `$schema`;");
            
            while ($row = $result->fetch())
            {
                if ($_POST["name"] == $row["UserName"] && password_verify($_POST["old_pwd"], $row["PassWord"]))
                {
                    $result = $pdo->prepare("UPDATE `$schema` SET PassWord = ? WHERE ID = ?;");
                    $result->execute([password_hash($_POST["new_pwd"], PASSWORD_DEFAULT), $row["ID"]]);
                    
                    header("Location: index.php");
                }
            }
            
            echo "invalid username or password.";
        }
    ?>
</body>
</html>
