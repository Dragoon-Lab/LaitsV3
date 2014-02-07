<?php

    session_start();
    //*****Load and save file for JavaScript version of Dragoon

    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or die('Could not connect to database.');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        // Get most recent model from autosave table, given sessionId
        // or (user, section, problem, (optionally) author).
        // Need to query sessions table to find most recent session, then the autosave table 
        // The code is not written, yet
	$sessionId = mysqli_real_escape_string($mysqli, $_GET['x']);
        $section = mysqli_real_escape_string($mysqli, $_GET['s']);
        $problemNum = mysqli_real_escape_string($mysqli, $_GET['problem']);       

        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");

        $num_rows = $result->num_rows;

        if ($num_rows == 1) {
            $_SESSION['theResults'] = "";
            while ($row = $result->fetch_row()) {
                $_SESSION['theResults'] .= $row[0];
            }
            print $_SESSION['theResults'];
        }

    } else if($_SERVER['REQUEST_METHOD'] === 'POST') {

        // Save model in autosave table, marked by session id.
        $sessionId = $_POST['x'];
        $model = $_POST['model'];

	// This code is not written, yet.
        $result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $mysqli->query("INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemNum','$saveData')");
        } else {
            $mysqli->query("UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
        }
    } else {
      trigger_error("Unsupported http method" + $_SERVER['REQUEST_METHOD']);
    }
    
?>