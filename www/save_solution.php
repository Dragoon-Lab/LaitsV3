<?php
    session_start();
    
    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or die('Could not connect to database.');
    
    //retrieve POST variables
    $action = mysqli_real_escape_string($mysqli, $_POST['action']);
    $author = mysqli_real_escape_string($mysqli, $_POST['id']);
    $section = mysqli_real_escape_string($mysqli, $_POST['section']);
    $problemName = mysqli_real_escape_string($mysqli, $_POST['problem']);
    $solutionGraph = $_POST['saveData'];
    $share = $_POST['share'];
    
    //process request
    if(strcmp($action, "author_save") == 0){
        $result = $mysqli->query("SELECT solutionGraph FROM solutions WHERE author='$author' AND section='$section' AND problemName='$problemName'");
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $mysqli->query("INSERT INTO solutions(author,section,problemName,solutionGraph,share) 
                VALUES ('$author','$section','$problemName','$solutionGraph','$share')");
        } else {
            $mysqli->query("UPDATE solutions SET solutionGraph='$solutionGraph', share='$share', 
                time = CURRENT_TIMESTAMP WHERE author='$author' AND section='$section' AND problemName='$problemName'");
        }
    }elseif(strcmp($action, "author_load") == 0){
        $result = $mysqli->query("SELECT solutionGraph FROM solutions WHERE author='$author' AND section='$section' AND problemName='$problemName'");

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
