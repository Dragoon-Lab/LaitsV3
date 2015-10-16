<?php
/*
     Dragoon Project
     Arizona State University
     (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
     
     This file is a part of Dragoon
     Dragoon is free software: you can redistribute it and/or modify
     it under the terms of the GNU Lesser General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
     
     Dragoon is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU Lesser General Public License for more details.
     
     You should have received a copy of the GNU Lesser General Public License
     along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
*/
     
/*
    given the following info from the active session:
      section
      problem name
      group
      mode (AUTHOR, always)
    retrieves a table (json) with at most 100 rows ordered by time
    and the following columns:
      session id
      time
      user
      solution Graph
           
    
     This script is stateless, so we don't need to worry about php sessions.
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.', E_USER_ERROR);

// Must always provide problem name
$problem =  mysqli_real_escape_string($mysqli,$_GET['p'])
  or trigger_error('Problem name not supplied.', E_USER_ERROR);
$shortProblemName = (strlen($problem) > 50) ? substr($problem, 0,50) : $problem;

// Group is optional
$group = isset($_GET['g'])?mysqli_real_escape_string($mysqli,$_GET['g']):null;
$userPrecedence = true;
if(isset($_GET['m']) && $_GET['m'] == "AUTHOR"){
  $userPrecedence = isset($_GET['up'])?($_GET['up'] == "true"):false;
}
$restartProblemFlag = isset($_GET['rp'])?$_GET['rp']:false;

$activity = "construction";


/*
  Print out JSON object
*/
function printHistory($row){
  header("Content-type: application/json");
  echo json_encode($row);
}
if(isset($_GET['u']) && isset($_GET['s']) && isset($_GET['m'])){
	$user = mysqli_real_escape_string($mysqli,$_GET['u']);
	$section = mysqli_real_escape_string($mysqli,$_GET['s']);
	$mode ="AUTHOR";
	if(isset($_GET['g']) && !$userPrecedence){
		//group takes precedence over user, quick fix for sustainability class
		// $query = "SELECT t1.user, t1.session_id, t1.time, solutions.solution_graph FROM session AS t1 JOIN solutions USING (session_id)  where t1.section = '$section' AND t1.mode = '$mode' 
		//       AND t1.problem = '$shortProblemName' AND t1.group = '$group' AND t1.activity = '$activity' ORDER BY t1.time DESC LIMIT 100";
	$query = <<<EOT
		SELECT t1.session_id,	t1.time,	t1.user, solutions.solution_graph FROM session AS t1 JOIN solutions USING (session_id)  where t1.section = '$section' AND t1.mode = '$mode' 
			AND t1.problem = '$shortProblemName' AND t1.group = '$group' AND t1.activity = '$activity' ORDER BY t1.time DESC LIMIT 100
EOT;
	} else {
		$gs = isset($_GET['g'])?"= '$group'":'IS NULL';
		if($activity == 'construction'){
			$query = <<<EOT
				SELECT t1.user, t1.session_id, t1.time, solutions.solution_graph FROM session AS t1 JOIN solutions USING (session_id)  where t1.section = '$section' AND t1.mode = '$mode' 
					AND t1.problem = '$shortProblemName' AND  t1.activity = '$activity' AND t1.group $gs ORDER BY time DESC LIMIT 100
EOT;
		} 
	}

	$result = $mysqli->query($query)
		or trigger_error("Previous work query failed." . $mysqli->error);
	$data=array();
	while($row = $result->fetch_array(MYSQLI_ASSOC)){   
		$data[]=$row;    
	}
	printHistory($data);  
	mysqli_close($mysqli);
	exit;
}


mysqli_close($mysqli);
?>
