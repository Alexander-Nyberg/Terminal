<?php
    include("database.php");
    
    $init = false;
    
    if (isset($_GET["init"]))
    {
        $init = true;
    }
    
    
    $u_id = $_GET["id"];
    
    if ($init)
    {
        $result = $pdo->query("SELECT ID, Data FROM `$schema`;");
        
        while ($row = $result->fetch())
        {
            if ($row["ID"] == $u_id)
            {
                echo $row["Data"];
                break;
            }
        }
    }
    
    else
    {
        $data = file_get_contents("php://input");
        
        $result = $pdo->prepare("UPDATE `$schema` SET Data = ? WHERE ID = ?;");
        $result->execute([$data, $u_id]);
        
        echo 1;
    }
?>
