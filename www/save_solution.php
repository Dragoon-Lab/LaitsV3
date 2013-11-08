<?php
session_start();

require "db-login.php";
require "error-handler.php";

// Using trigger_error() so logging level and destination can be modified.

//connect to database
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

//retrieve POST variables
$action = mysqli_real_escape_string($mysqli,$_POST['action']);
$author = mysqli_real_escape_string($mysqli,$_POST['id']);
$section = mysqli_real_escape_string($mysqli,$_POST['section']);
$problemName = mysqli_real_escape_string($mysqli,$_POST['problem']);
$solutionGraph = mysqli_real_escape_string($mysqli,$_POST['saveData']);
// share is optional, default value 1.
// Need to see what values client can send
// Mysql encodes true and false as 1 and 0.
$share = (!isset($_POST['share']) || $_POST['share'])?1:0;

//process request
if(strcmp($action, "author_save") == 0){
  $query="SELECT solutionGraph FROM solutions WHERE author='$author' AND section='$section' AND problemName='$problemName'";
  $result = $mysqli->query($query)
    or trigger_error("author_save lookup failed: " . $mysqli->error,
		     E_USER_ERROR);
  $num_rows = $result->num_rows;
  
  if ($num_rows == 0) {
    $query="INSERT INTO solutions(author,section,problemName,solutionGraph,share) VALUES ('$author','$section','$problemName','$solutionGraph',$share)";
    $result=$mysqli->query($query)
      or trigger_error("author_save insert failed: " . $mysqli->error);
    // error_log("query= $query");
    // On OS X, TRUE is returned even for bad queries!
    // error_log("hi1: " . $result?"TRUE":"FALSE");
  } else {
    $query="UPDATE solutions SET solutionGraph='$solutionGraph', share='$share', 
                time = CURRENT_TIMESTAMP WHERE author='$author' AND section='$section' AND problemName='$problemName'";
    $result=$mysqli->query($query)
      or trigger_error("author_save update failed: " . $mysqli->error);
  }
} elseif(strcmp($action, "author_load") == 0) {
  $query="SELECT solutionGraph FROM solutions WHERE author='$author' AND section='$section' AND problemName='$problemName'";
  $result = $mysqli->query($query)
    or trigger_error("author_load failed: " . $mysqli->error);
  
  $num_rows = $result->num_rows;
  
  if ($num_rows == 1) {
    while($row = $result->fetch_row()){
      printf("%s", $row[0]);
    }
  }
} else {
  trigger_error("Invalid action $action.");
}

?>
