<?php
    session_start();

    //connect to database
    $mysqli = mysqli_connect("localhost", "root", "sin(0)=0", "laits_devel");

    if(isset($_GET["user"])){            
        $query = "INSERT into table_name (id, groupNum, problemNum, saveData)
            VALUES ('".$_GET["user"]."', 
            '".$_GET["group"]."', 
            '".$_GET["problem"]."', 
            '".$_GET["data"]."'";
        $runQuery = mysqli_query($mysqli, $query)
            or die(mysqli_error($mysqli));
        exit;            
    }else{
        //send error report if needed
        exit;
    }
?>