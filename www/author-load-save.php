<?php

    session_start();
    //*****Load and save file for JavaScript version of Dragoon

    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or die('Could not connect to database.');

    //retrieve GET variables if present
    //currently not using GET but plan to add GET functionality for loading data
    if ($_GET["action"] != null) {
        $action = mysqli_real_escape_string($mysqli, $_GET['action']);
        print $action;
        if($action != "load")
            exit("We are unable to process your request.");       
        $id = mysqli_real_escape_string($mysqli, $_GET['id']);
        $section = mysqli_real_escape_string($mysqli, $_GET['section']);
        $problemNum = mysqli_real_escape_string($mysqli, $_GET['problem']);       
    }else{
        //if no GET variables, retrieve POST variables
        $action = mysqli_real_escape_string($mysqli, $_POST['action']);
        $id = mysqli_real_escape_string($mysqli, $_POST['id']);
        $section = mysqli_real_escape_string($mysqli, $_POST['section']);
        $problemNum = mysqli_real_escape_string($mysqli, $_POST['problem']);
        $saveData = $_POST['saveData'];
    }

    //process request
    if (strcmp($action, "save") == 0) {
        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $mysqli->query("INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemNum','$saveData')");
        } else {
            $mysqli->query("UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        }
    } elseif (strcmp($action, "load") == 0) {
        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");

        $num_rows = $result->num_rows;

        if ($num_rows == 1) {
            $_SESSION['theResults'] = "";
            while ($row = $result->fetch_row()) {
                $_SESSION['theResults'] .= $row[0];
            }
            print $_SESSION['theResults'];
        }
    } else {
        print $action;
        print "\nUnable to processs request.";
    }
    
?>