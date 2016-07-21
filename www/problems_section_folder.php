<?php
// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
	  or trigger_error('Could not connect to database.', E_USER_ERROR);

$section = $_REQUEST['s'];
$group = $_REQUEST['f'];

$query = <<<EOT
		SELECT DISTINCT problem FROM session WHERE section = '$section' AND `group` = '$group';
EOT;

$result = $mysqli->query($query) or
	trigger_error("query failed : ", $mysqli->error);
$problem = array();
if($result->num_rows != 0)
	while($p = $result->fetch_assoc()){
		array_push($problem, $p['problem']);
	}


echo json_encode($problem);
?>
