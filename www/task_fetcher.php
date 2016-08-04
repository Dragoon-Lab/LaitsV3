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
     Retrieve previous work from solutions table or 
     a custom problem from the solutions table or
     a published problem

     This script is stateless, so we don't need to worry about php sessions.
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.', E_USER_ERROR);

// Must always provide problem name
$problem =  mysqli_real_escape_string($mysqli,$_REQUEST['p'])
  or trigger_error('Problem name not supplied.', E_USER_ERROR);
$shortProblemName = (strlen($problem) > 50) ? substr($problem, 0,50) : $problem;

// Group is optional
$group = isset($_REQUEST['g'])?mysqli_real_escape_string($mysqli,$_REQUEST['g']):null;
$userPrecedence = true;
if(isset($_REQUEST['m']) && $_REQUEST['m'] == "AUTHOR"){
  $userPrecedence = isset($_REQUEST['up'])?($_REQUEST['up'] == "true"):false;
}
$restartProblemFlag = (isset($_REQUEST['rp']) && $_REQUEST['rp'] == 'on')?$_REQUEST['rp']:false;

$activity = !empty($_REQUEST['a'])?$_REQUEST['a']:"construction";
// Check if the session is public and expired
date_default_timezone_set('America/Phoenix'); 
$subtime =  date('Y-m-d h:m:s', strtotime('-1 minutes')); // Get the time stamp for 24h ago
if (isset($_REQUEST['s'])) { 
   $section = mysqli_real_escape_string($mysqli,$_REQUEST['s']);
   if ($section=='public-login.html') {
     if(isset($_REQUEST['u']) && isset($_REQUEST['m'])){
      $user = mysqli_real_escape_string($mysqli,$_REQUEST['u']);
      $mode = $_REQUEST['m'];
      $query = <<<EOT
      SELECT * FROM session WHERE session.user = '$user' AND session.section = '$section' AND session.mode = '$mode' AND session.activity = '$activity' AND session.problem = '$shortProblemName' ORDER BY session.time DESC LIMIT 1
EOT;

     $result = $mysqli->query($query)
      or trigger_error(" query failed." . $mysqli->error);
       if($row = $result->fetch_row()){
        if ($row[0]<$subtime) {
          $restartProblemFlag=true; // Restart the problem
        }
      }      
    }
  }
}



/*
  Print out JSON object containing the model task and the share bit
*/
function printModel($row){
  header("Content-type: application/json");
  print "{\"task\":$row[0],\"restart\": true, \"share\":" . ($row[1]?"true":"false") . "}";
}

/* 
   Not providing the group is equivalent to saying that this is 
   a published problem.

   If student, section, and mode have been provided, see if there has been 
   previous work by the student (same mode) and return solution graph.

   If group and section are specified, then 
       look for solution from AUTHOR mode sessions with matching group, session
       and problem (if none is found, then log an error.)         
   else
       forward to published problems

*/
if(isset($_REQUEST['x'])){
  
  $session_id = mysqli_real_escape_string($mysqli,$_REQUEST['x']);

    $query = <<<EOT
    SELECT solution_graph, share from solutions where session_id = '$session_id'      
EOT;

  $result = $mysqli->query($query)
    or trigger_error("Previous work query failed." . $mysqli->error);
  if($row = $result->fetch_row()){
    printModel($row);
  mysqli_close($mysqli);
    exit;
  } 
 }

if(!$restartProblemFlag) /* if rp(restart problem) not set check in previously sovled problems */
{
  if(isset($_REQUEST['u']) && isset($_REQUEST['s']) && isset($_REQUEST['m'])){
     $user = mysqli_real_escape_string($mysqli,$_REQUEST['u']);
     $section = mysqli_real_escape_string($mysqli,$_REQUEST['s']);
     $mode = $_REQUEST['m'];  // only four choices
   if(isset($_REQUEST['g']) && !$userPrecedence){
      //group takes precedence over user, quick fix for sustainability class
        $query = <<<EOT
         SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id) 
              WHERE t2.section = '$section' AND t2.mode = '$mode' 
              AND t2.problem = '$shortProblemName' AND t2.group = '$group' AND t2.activity = '$activity' ORDER BY t1.time DESC LIMIT 1
EOT;
	  
    } else {
     $gs = isset($_REQUEST['g'])?"= '$group'":'IS NULL';
	  if($activity == 'construction'){
     	$query = <<<EOT
          SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id)
            WHERE t2.user = '$user' AND t2.section = '$section' AND t2.mode = '$mode' AND t2.activity = '$activity'
             AND t2.problem = '$shortProblemName' AND t2.group $gs ORDER BY t1.time DESC LIMIT 1
EOT;
    } else {
		//case where user opens a non-published problem and in a different activity, but author always opens in construction activity
		$query = <<<EOT
         SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id)
              WHERE t2.section = '$section' AND t2.mode = '$mode' AND t2.user = '$user'
              AND t2.problem = '$shortProblemName' AND t2.group $gs
			  AND (t2.activity = '$activity' OR t2.activity = 'construction') ORDER BY t1.time DESC LIMIT 1
EOT;
	  }
	}
   $result = $mysqli->query($query)
     or trigger_error("Previous work query failed." . $mysqli->error);

      //Ritesh: this is piece of code to retrieve query from a copy parameter , if it is set and existing folder does not contain the specific problem
      if($result->num_rows == 0 && isset($_REQUEST['cp'])){
          $new_group = $_REQUEST['cp'];
          $query = <<<EOT
         SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id)
              WHERE t2.section = '$section' AND t2.mode = '$mode'
              AND t2.problem = '$shortProblemName' AND t2.group = '$new_group' AND t2.activity = '$activity' ORDER BY t1.time DESC LIMIT 1
EOT;
      $result = $mysqli->query($query);
      }
   if($row = $result->fetch_row()){
       printModel($row);
    mysqli_close($mysqli);
        exit;
      }
  }
}

/*
     No previous work found: treat this as starting a new problem.
     Look for a matching custom problem or look for
     a matching published problem
*/

if(isset($_REQUEST['g']) && !empty($_REQUEST['g']) && isset($_REQUEST['s']) && !empty($_REQUEST['s'])){
  /*
    If group and section are supplied, then look for 
    custom problem stored in database.
  */

  $section = mysqli_real_escape_string($mysqli,$_REQUEST['s']);
  if($activity == "construction"){
    $query = <<<EOT
      SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2
          USING (session_id)
      WHERE t2.section = '$section' AND t2.mode = 'AUTHOR'
          AND t2.problem = '$shortProblemName' AND t2.group = '$group' AND t2.activity = '$activity' ORDER BY t1.time DESC LIMIT 1
EOT;
  } else {
	$query = <<<EOT
	  SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2
	   	  USING(session_id)
	  WHERE t2.section = '$section' AND t2.mode = 'AUTHOR'
	      AND t2.problem = '$shortProblemName' AND t2.group = '$group' AND t2.activity = 'CONSTRUCTION' ORDER BY t1.time DESC LIMIT 1
EOT;
  }

  $result = $mysqli->query($query)
    or trigger_error("Custom solution query failed.");
  if($row = $result->fetch_row()){
    printModel($row);
  } else {
    // No previous work found:  assume that this is a new problem  
    $statusCode=204;
    if (function_exists('http_response_code')){
      // Only exists for php versions >= 5.4.0
      http_response_code($statusCode);
    } else {
      header('HTTP/1.0 ' . $statusCode + ' No Content');
    }
  }

} else {

  /* If group and section is not supplied, then use published problems. */
  $host  = $_SERVER['HTTP_HOST'];
  $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
  // To support Java, one would need to switch this to xml
  // To avoid forceful browsing, further santazing problem name 
  // REGEX: Replace any character other than alphabat, number, underscore or hypen with underscore 
  $problem = preg_replace('/[^A-Za-z0-9_\-]/', '_', $problem);
  $extra = 'problems/' . $problem . '.json';
  /* Redirect to a page relative to the current directory.
     HTTP/1.1 requires an absolute URI as argument to Location. */
  if(isset($_SERVER['HTTPS'])){
  	header("Location: https://$host$uri/$extra");
  } else {
	header("Location: http://$host$uri/$extra");
  }
}
mysqli_close($mysqli);
?>
