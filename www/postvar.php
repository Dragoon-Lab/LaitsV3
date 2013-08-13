<?php
    session_start();
    
    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or die('Could not connect to database.');
    
    //retrieve POST variables
    $action = mysqli_real_escape_string($mysqli, $_POST['action']);
    $id = mysqli_real_escape_string($mysqli, $_POST['id']);
    $section = mysqli_real_escape_string($mysqli, $_POST['section']);
    $problemNum = mysqli_real_escape_string($mysqli, $_POST['problem']);
    $saveData = mysqli_real_escape_string($mysqli, $_POST['saveData']);
    
    //process request
    if(strcmp($action, "save") == 0){
        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $mysqli->query("INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemNum','$saveData')");
        } else {
            $mysqli->query("UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        }
    }elseif(strcmp($action, "load") == 0){
        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");

        $num_rows = $result->num_rows;

        if ($num_rows == 1) {
            while($row = $result->fetch_row()){
                printf("%s", $row[0]);
            }
        }
    }else{
        print "Unable to process request.";
    }

?>
