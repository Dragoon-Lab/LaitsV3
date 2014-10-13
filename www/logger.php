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
  Start up sessions and log various messages

  This script is stateless, so we don't need to worry about php sessions
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

// Old versions of PHP do not have JSON routines built-in.
if(!function_exists('json_decode')) {
    include 'JSON.php';
    $json = new Services_JSON();
    function json_decode($x){
        global $json;
        return $json->decode($x);
    } 
}

if (!function_exists('json_last_error_msg')) {
    function json_last_error_msg() {
        static $errors = array(
            JSON_ERROR_NONE             => null,
            JSON_ERROR_DEPTH            => 'Maximum stack depth exceeded',
            JSON_ERROR_STATE_MISMATCH   => 'Underflow or the modes mismatch',
            JSON_ERROR_CTRL_CHAR        => 'Unexpected control character found',
            JSON_ERROR_SYNTAX           => 'Syntax error, malformed JSON',
            JSON_ERROR_UTF8             => 'Malformed UTF-8 characters, possibly incorrectly encoded'
        );
        $error = json_last_error();
        return array_key_exists($error, $errors) ? $errors[$error] : "Unknown error ({$error})";
    }
}

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

$sessionId = $_POST['x'];
$method = $_POST['method']; // system generated choices
$message =  $_POST['message'];

/*
   Work-around in case magic quotes are enabled.
   See http://stackoverflow.com/questions/220437/magic-quotes-in-php
 */
if (get_magic_quotes_gpc()) {
    $message = stripslashes($message);
}

if($method == 'start-session'||$method == 'rename-problem'){
  /*
    Create a new session 
    In this case, the message contains a list of session parameters,
    which we decode.
  */
  
  $x = json_decode($message) or
    trigger_error("Bad json " . json_last_error_msg());
  foreach($x as &$value){
    $value =  mysqli_real_escape_string($mysqli, $value);
  }
  $problem = isset($x->p)?"'$x->p'":"DEFAULT";
  $group = isset($x->g)?"'$x->g'":"DEFAULT";
  // This should give an error if session id already exists.
  // Need to verify how error is handled.
  $query = "INSERT INTO session (session_id, mode, user, section, problem, `group`) " .
    "VALUES ('$sessionId','$x->m','$x->u','$x->s',$problem,$group)";
  // echo "Starting new session query $query\n";
  $mysqli->query($query)
    or trigger_error("Session creation failed: " . $mysqli->error);

} else {

  /* 
     Save log message, assuming session exists.
  */
  $message = mysqli_real_escape_string($mysqli, $message);
  $query = "INSERT INTO step (session_id,method,message) VALUES ('$sessionId','$method','$message')";
  $mysqli->query($query)
    or trigger_error("Logging failed.". $mysqli->error);
}

?>
