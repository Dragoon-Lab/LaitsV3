<?php

/*
  Start up sessions and log various messages

  This script is stateless, so we don't need to worry about php sessions
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_erro('Could not connect to database.',E_USER_ERROR);

$sessionId = $_POST['x'];
$method = $_POST['method']; // system generated choices
$message =  mysqli_real_escape_string($mysqli,$_POST['message']);

if($method == 'start-session'){
  /*
    Create a new session 
    In this case, the message contains a list of session parameters,
    which we decode.
  */
  
  $x = json_decode($message);
  $problem = issset($x->problem)?"'$x->problem'":"DEFAULT";
  $author = issset($x->author)?"'$x->author'":"DEFAULT";
  // This should give an error if session id already exists.
  // Need to verify how error is handled.
  $query = "INSERT INTO session VALUES ('$session_id','$x->mode','$x->user'," .
    "'$x->section',$problem,$author)";
  $mysqli->query($query)
    or trigger_error("Session creation failed.");

} else {

  /* 
     Save log message, assuming session exists.
  */

  $query = "INSERT INTO step (session_id,method,message) VALUES ('$sessionId','$method','$message')";
  $mysqli->query($query)
    or trigger_error("Logging message failed.");
}

?>
