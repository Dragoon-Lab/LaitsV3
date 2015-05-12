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
$user = "";
$section ="";
$group = "";
//retrieve POST variables
if(isset($_GET['s']))
  $section = mysqli_real_escape_string($mysqli, $_GET['s']);
if(isset($_GET['u']))
  $user = mysqli_real_escape_string($mysqli, $_GET['u']);
if(isset($_GET['g']))
  $group = mysqli_real_escape_string($mysqli, $_GET['g']);

$query = "";
if ($user != ""){
  $query = "SELECT DISTINCT S.problem, S.group FROM session S, solutions T WHERE S.section='$section' AND S.mode='AUTHOR' AND S.user='$user' AND S.session_id=T.session_id";
} else if($group != ""){
  if($group == "public"){
    //query to sort public problems by created date
    $query = "SELECT S.problem, T.minTime FROM session S
              INNER JOIN (
                SELECT Sess.problem, Sess.group, MIN(Sess.time) as minTime
                FROM session Sess
                WHERE Sess.section='$section' AND Sess.mode='AUTHOR' AND Sess.group='$group'
                GROUP BY Sess.problem ) T
              ON S.problem = T.problem AND S.group = T.group AND S.time = T.minTime
              ORDER BY T.minTime DESC";
  }else{
    //query to sort other problems by last accessed time
    $query = "SELECT DISTINCT problem FROM (
                SELECT S.problem, S.time FROM session S
                WHERE S.section='$section' AND S.mode='AUTHOR' AND S.group='$group'
                ORDER BY S.time DESC )
              AS problems";
  }
} else{
  $query = "SELECT S.* FROM session S,solutions T  WHERE S.section='$section' AND S.mode='AUTHOR' AND S.session_id=T.session_id AND (T.share)";
}

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
mysqli_close($mysqli);
?>
