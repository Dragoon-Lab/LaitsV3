<?php
include('../db-login.php');
include('database.php');

$type = $_REQUEST['t'];
$db = new Database();
$parameters = array();
switch(type){
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

?>
