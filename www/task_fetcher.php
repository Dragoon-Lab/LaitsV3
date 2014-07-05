<?php
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
$problem =  mysqli_real_escape_string($mysqli,$_GET['p'])
  or trigger_error('Problem name not supplied.', E_USER_ERROR);
// Author is optional
$author = isset($_GET['a'])?mysqli_real_escape_string($mysqli,$_GET['a']):null;

/*
  Print out JSON object containing the model task and the share bit
*/
function printModel($row){
  header("Content-type: application/json");
  print "{\"task\":$row[0],\"share\":" . ($row[1]?"true":"false") . "}";
}

/* 
   Not providing the author is equivalent to saying that this is 
   a published problem.

   If student, section, and mode have been provided, see if there has been 
   previous work by the student (same mode) and return solution graph.

   If author and section are specified, then 
       look for solution from author mode sessions with matching author, session
       and problem (if none is found, then log an error.)         
   else
       forward to published problems

*/

if(isset($_GET['u']) && isset($_GET['s']) && isset($_GET['m'])){
  $user = mysqli_real_escape_string($mysqli,$_GET['u']);
  $section = mysqli_real_escape_string($mysqli,$_GET['s']);
  $mode = $_GET['m'];  // only four choices
  $as = isset($_GET['a'])? "= '$author'":'IS NULL';

  $query = <<<EOT
    SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 USING (session_id) 
      WHERE t2.user = '$user' AND t2.section = '$section' AND t2.mode = '$mode' 
          AND t2.problem = '$problem' AND t2.author $as ORDER BY t1.time DESC LIMIT 1
EOT;

  $result = $mysqli->query($query)
    or trigger_error("Previous work query failed." . $mysqli->error);
  if($row = $result->fetch_row()){
    printModel($row);
    exit;
  }
}

/*
     No previous work found: treat this as starting a new problem.
     Look for a matching custom problem or look for
     a matching published problem
*/

if(isset($_GET['a']) && isset($_GET['s'])){
  /*
    If author and section are supplied, then look for 
    custom problem stored in database.
  */

  $section = mysqli_real_escape_string($mysqli,$_GET['s']);

  $query = <<<EOT
    SELECT t1.solution_graph, t1.share FROM solutions AS t1 JOIN session AS t2 
          USING (session_id) 
      WHERE t2.section = '$section' AND t2.mode = 'AUTHOR' 
          AND t2.problem = '$problem' AND t2.author = '$author' ORDER BY t1.time DESC LIMIT 1
EOT;

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

  /* If author and section is not supplied, then use published problems. */
  $host  = $_SERVER['HTTP_HOST'];
  $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
  // To support Java, one would need to switch this to xml
  $extra = 'problems/' . $problem . '.json';
  /* Redirect to a page relative to the current directory.
     HTTP/1.1 requires an absolute URI as argument to Location. */
  header("Location: http://$host$uri/$extra");
}

?>
