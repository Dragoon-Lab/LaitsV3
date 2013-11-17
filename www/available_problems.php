<?php
// Given a student name and section name, return a json formatted
// list of available custom problems.
//
// Currently, we do not have a mechanism for creating or handling
// deleted problems.

session_start();

require "db-login.php";

// connect to database
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

//retrieve POST variables
$student = isset($_GET['student'])?mysqli_real_escape_string($mysqli, $_GET['student']):'';
$section = mysqli_real_escape_string($mysqli, $_GET['section']);

$query="SELECT problemname,author FROM solutions WHERE section='$section' AND NOT deleted AND (share OR author='$student')";
if($result = $mysqli->query($query)){
  $json = array(); 
  while($row = $result->fetch_object()){
    $temp=$row;
    array_push($json,$temp);
  }
  echo json_encode($json);
} else {
  trigger_error("Query failed:  $query");
}

?>
