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
    $solutionGraph = mysqli_real_escape_string($_POST['saveData']);
    // share is optional, default value 1.
    // Need to see what values client can send
    // Mysql encodes true and false as 1 and 0.
    $share = (!isset($_POST['share']) || $_POST['share'])?1:0;
    
    //process request
    if(strcmp($action, "author_save") == 0){
        $result = $mysqli->query("SELECT solutionGraph FROM solutions WHERE author='$author' AND section='$section' AND problemName='$problemName'");
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
	  $query="INSERT INTO solutions(author,section,problemName,solutionGraph,share) VALUES ('$author','$section','$problemName','$solutionGraph',$share)";
            $result=$mysqli->query($query);
	    // error_log("query= $query");
	    // On OS X, TRUE is returned even for bad queries!
	    // error_log("hi1: " . $result?"TRUE":"FALSE");
        } else {
            $result=$mysqli->query("UPDATE solutions SET solutionGraph='$solutionGraph', share='$share', 
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
