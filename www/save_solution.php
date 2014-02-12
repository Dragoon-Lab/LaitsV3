<?php
/*
         Save solutions in the solutions table
 
         This script is stateless, so we don't need to worry about php sessions.
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

/*
   Work-around in case magic quotes are enabled.
   See http://stackoverflow.com/questions/220437/magic-quotes-in-php
 */
if (get_magic_quotes_gpc()) {
    $_POST['sg'] = stripslashes($_POST['sg']);
}

//retrieve POST variables
$sessionId = $_POST['x']; // system generated
$solutionGraph = mysqli_real_escape_string($mysqli,$_POST['sg']);

// share is optional, default value 1.
// Need to see what values client can send
// Mysql encodes true and false as 1 and 0.
$share = isset($_POST['share'])?($_POST['share']?"1":"0"):"DEFAULT";
// deleted is optional, default value 0
$deleted = isset($_POST['delete'])?($_POST['delete']?'1':'0'):"DEFAULT";

//process request
// If session doesn't exist, this should give an error.
// Need to verify.
$query="REPLACE INTO solutions(session_id,share,deleted,solution_graph) VALUES ('$sessionId',$share,$deleted,'$solutionGraph')";
$result=$mysqli->query($query)
  or trigger_error("author_save insert failed: " . $mysqli->error);

?>
