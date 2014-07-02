<?php
/*
	This script is obtaining Share Bit date from database.
*/

require "error-handler.php";

require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.', E_USER_ERROR);

$user = $_GET['u'];
$section = $_GET['s'];
$problem = $_GET['p'];

$query = "SELECT t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id) WHERE t2.user = '$user' AND t2.section = '$section' AND t2.mode = 'AUTHOR' AND t2.problem = '$problem' order by t1.time desc;";

$result = $mysqli->query($query)
  or trigger_error("Could not find the corresponding share bit.".$mysql->error);
if($row = $result->fetch_row()){
  header("Content-type: application/json");
  print $row[0];
  exit;
}

mysqli_close($mysqli);
?>
