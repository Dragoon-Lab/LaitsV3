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

mysqli_close($mysqli);  
?>
