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
		if($result == null)
			echo '{"error" : "No models"}';
		else
			echo $result;
		break;
	
	case 'reqNonClassProblems':
		$parameters['g'] = isset($_REQUEST['g'])? $_REQUEST['g'] : '';
		$parameters['s'] = isset($_REQUEST['s'])? $_REQUEST['s'] : '0';
		$result = $db->getNonClassProblems($parameters);
		if($result == null)
			echo '{"error" : "No models"}';
		else
			echo $result;
		break;

	case 'deleteSpecificModels':
		$parameters['dm'] = isset($_REQUEST['dm'])? $_REQUEST['dm']: null;
		if(!empty($parameters['dm']))
			$result = $db->deleteSpecificModels($parameters);
		if($result == null)
			echo 'fail';
		else 
			echo $result;		
		break;

	case 'modelAction':
		$parameters['action'] = isset($_REQUEST['action']) ? $_REQUEST['action'] : "";
		$parameters['src'] = isset($_REQUEST['src']) ? $_REQUEST['src'] : "";
		$parameters['mod'] = isset($_REQUEST['mod']) ? $_REQUEST['mod'] : "";
		$parameters['dest'] = isset($_REQUEST['dest']) ? $_REQUEST['dest'] : "";
		$parameters['user'] = isset($_REQUEST['user']) ? $_REQUEST['user'] : "";
		if(empty($parameters['action']) || empty($parameters['src']) || empty($parameters['mod']) || empty($parameters['dest']) || empty($parameters['user'])){
			echo 'make sure all fields are valid and not empty';
			break;
		} 
		//new model name can be empty
		$parameters['new_mod'] = isset($_REQUEST['new_mod']) ? $_REQUEST['new_mod'] : "";
		$parameters['section'] = isset($_REQUEST['section']) ? $_REQUEST['section'] : "";
		$result = $db->modelAction($parameters);
		if($result == null)
			echo 'fail';
		else
			echo $result;
		break;

	case 'copyNCModelToSection':
		$parameters['u'] = $_REQUEST['u'];
		$parameters['p'] = $_REQUEST['p'];
		$parameters['s'] = $_REQUEST['s'];
		$parameters['g'] = array_key_exists('g', $_REQUEST) ? $_REQUEST['g'] : "";
		$parameters['m'] = "AUTHOR";
		$parameters['a'] = "construction";
		//incase new name is sent, assignments use this
		$parameters['nn'] = isset($_REQUEST['aname']) ? $_REQUEST['aname']: "";
		$result = $db->copy_nc_model_section($parameters);
		if($result == null)
			echo '{"error" : "No models"}';
		else
			echo $result;
		break;

	case 'renameItems':
		$parameters['action'] = isset($_REQUEST['action']) ? $_REQUEST['action'] : "";
		$parameters['old_folder'] = isset($_REQUEST['old_folder']) ? $_REQUEST['old_folder']: "";
		$parameters['new_name'] = isset($_REQUEST['new_name']) ? $_REQUEST['new_name'] : "";
		if(empty($parameters['action']) || empty($parameters['old_folder']) || empty($parameters['new_name'])){
			echo 'fail';
			break;
		}

		if($parameters['action'] == "Model"){
			$parameters['old_model'] = isset($_REQUEST['old_model']) ? $_REQUEST['old_model']: "";
			if(empty($parameters['old_model'])){
				echo 'fail';
				break;
			}
		}	
		
		$result = $db->renameAction($parameters);
		if($result == null)
			echo 'fail';
		else
			echo $result;
		break;

	case 'deleteFolderModels':
		$parameters['fol'] = isset($_REQUEST['fid'])? $_REQUEST['fid'] : "";
		if($parameters['fol'] !== ""){
			$result = $db->deleteAllModelsFromFolder($parameters);
		}
		if($result == null)
			echo 'fail';
		else
			echo $result;
		break;

}
mysqli_close($mysql);
?>