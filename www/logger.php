<?php

require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
        or die('Could not connect to database.');
     
$user = mysqli_real_escape_string($mysqli, $_GET['user']);
$date = mysqli_real_escape_string($mysqli, $_GET['date']);
$logger = mysqli_real_escape_string($mysqli, $_GET['logger']);
$level = mysqli_real_escape_string($mysqli, $_GET['level']);
$msg = mysqli_real_escape_string($mysqli, $_GET['msg']);

if($logger == "DevLogs"){
  $location = mysqli_real_escape_string($mysqli, $_GET['location']);
  $mysqli->query("INSERT INTO dev_logs VALUES ('$user','$date','$location','$level','$msg')");
}else{
  $mysqli->query("INSERT INTO activity_logs VALUES ('$user','$date','$level','$msg')");
}

?>
