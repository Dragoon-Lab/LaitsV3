<?php
date_default_timezone_set('America/Phoenix');
require "db-login.php";
include "database.php";

$type = $_REQUEST['t'];
$mysql = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
						or trigger_error('Could not connect to database.', E_USER_ERROR);
$db = new Database($mysql);
$parameters = array();
$result = null;
switch($type){
	case 'classProblems':
		$parameters['u'] = $_REQUEST['u'];
		$parameters['g'] = $_REQUEST['g'];
		$result = $db->getClassProblemGroups($parameters);
		break;
	case 'reqNonClassProblems':
		$parameters['g'] = $_REQUEST['g'];
		$result = $db->getNonClassProblems($parameters);
		break;
	case 'deleteNonClassProblems':
		$parameters['df'] = $_REQUEST['df'];
		$parameters['dm'] = $_REQUEST['dm'];
		$result = $db->deleteNonClassProblems($parameters);
		break;
	case 'modelAction':
		//common for copy and move models
		$parameters['action'] = $_REQUEST['action'];
		$parameters['src'] = $_REQUEST['src'];
		$parameters['mod'] = $_REQUEST['mod'];
		$parameters['dest'] = $_REQUEST['dest'];
		$parameters['user'] = $_REQUEST['user'];
		$result = $db->modelAction($parameters);
		break;
	case 'copyNCModelToSection':
		$parameters['u'] = $_REQUEST['u'];
		$parameters['p'] = $_REQUEST['p'];
		$parameters['s'] = $_REQUEST['s'];
		$parameters['g'] = array_key_exists('g', $_REQUEST) ? $_REQUEST['g'] : "";
		$parameters['m'] = "AUTHOR";
		$parameters['a'] = "construction";
		$result = $db->copy_nc_model_section($parameters);
		break;
	case 'renameItems':
		$parameters['action'] = $_REQUEST['action'];
		$parameters['old_folder'] = $_REQUEST['old_folder'];
		if(isset($_REQUEST['old_model']))
			$parameters['old_model'] = $_REQUEST['old_model'];
		else
			$parameters['old_model'] = 'undefined';
		$parameters['new_item'] = $_REQUEST['new_item'];
		$result = $db->renameAction($parameters);
		break;
}

if($result == null)
	echo '{"error" : "No models"}';
else
	echo $result;

mysqli_close($mysql);
?>
