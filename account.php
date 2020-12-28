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
        <label>Create account</label><br>
        <label for='name'>username:</label>
        <input type='text' placeholder='enter username' name='name' autocomplete='on' maxlength='127' required><br>
        <label for='pwd'>password:</label>
        <input type='password' placeholder='enter password' name='pwd' autocomplete='on' maxlength='127' required><br>
        <input type='submit' value='submit'>
        <input type='button' value='cancel' onclick='window.location.href = `index.php`'>
    </form>
    <?php
        include("php/database.php");
        
        if (isset($_POST["name"]) && strlen($_POST["name"]) != 0 && isset($_POST["pwd"]) && strlen($_POST["pwd"]) != 0)
        {
            $result = $pdo->query("SELECT UserName FROM `$schema`;");
            
            $exists = false;
            
            while ($row = $result->fetch())
            {
                if ($_POST["name"] == $row["UserName"])
                {
                    $exists = true;
                    break;
                }
            }
            
            if ($exists)
            {
                echo "that username is already used.";
            }
            
            else
            {
                $result = $pdo->prepare("INSERT INTO `$schema` (UserName, PassWord, Data) VALUES (?,?,?);");
                $result->execute([$_POST["name"], password_hash($_POST["pwd"], PASSWORD_DEFAULT), "{\"root\":{\"dirs\":[],\"files\":[]},\"vars\":[]}"]);
                
                $_SESSION["u_id"] = $pdo->lastInsertId();
                
                header("Location: terminal.php");
            }
        }
    ?>
</body>
</html>
