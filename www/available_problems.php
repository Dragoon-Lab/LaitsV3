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

// Given a student name and section name, return a json formatted
// list of available custom problems.
//
// Currently, we do not have a mechanism for creating or handling
// deleted problems.

session_start();

require "db-login.php";

// connect to database
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

//retrieve POST variables
$student = isset($_GET['student'])?mysqli_real_escape_string($mysqli, $_GET['student']):'';
$section = mysqli_real_escape_string($mysqli, $_GET['section']);

$query="SELECT problem,author FROM solutions WHERE section='$section' AND NOT deleted AND (share OR author='$student')";
if($result = $mysqli->query($query)){
  $json = array(); 
  while($row = $result->fetch_object()){
    $temp=$row;
    array_push($json,$temp);
  }
  echo json_encode($json);
} else {
  trigger_error("Query failed:  $query");
}

?>
