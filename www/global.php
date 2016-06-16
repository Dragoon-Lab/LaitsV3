<?php

require "db-login.php";
include "database.php";

$type = $_REQUEST['t'];
$mysql = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
						or trigger_error('Could not connect to database.', E_USER_ERROR);
$db = new Database($mysql);
$parameters = array();
switch($type){
	case 'classProblems':
		$parameters['u'] = $_REQUEST['u'];
		$parameters['g'] = $_REQUEST['g'];
		$result = $db->getClassProblemGroups($parameters);
		break;
}

if($result == null)
	echo '{"error" : "no data found"}';
else
	echo $result;

mysqli_close($mysql);
?>
