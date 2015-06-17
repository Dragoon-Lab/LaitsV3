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

session_start();

require "db-login.php";

// connect to database
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.',E_USER_ERROR);

//Fetch available folders for specific user in section
if(isset($_POST['username']) && isset($_POST['section'])){
	$section = mysqli_real_escape_string($mysqli, $_POST['section']);
	$username = mysqli_real_escape_string($mysqli, $_POST['username']);
	if($section!=""){
		$query = "SELECT groups FROM user_groups WHERE section = $section AND username = '$username'";
		if($result = $mysqli->query($query)){
		  $user_groups = "[]";
		  while($row = $result->fetch_row()){
		    $user_groups = $row;
		  }
		  $section_groups = "";
		  if(isset($_POST['combine']) && $_POST['combine'] == "true"){
		  	//Combine user specific folders with section folders if combine is true.
		  	 $query = "SELECT groups FROM sections WHERE section_id = $section";
			  if($result = $mysqli->query($query)){
				  while($row = $result->fetch_row()){
				    $section_groups = $row;
				  }
			  }else {
			 	 trigger_error("Query failed:  $query");
			 }
		  }

		//Merge results of user specific folders with section folders if combine is true.
		$final = "";
		$array1 = json_decode(json_decode($user_groups[0]),true);
		if(isset($_POST['combine']) && $_POST['combine'] == "true"){
			$array2 = json_decode(json_decode($section_groups[0]),true);
			$final = array_merge($array1, $array2);
		}else{
			$final = $array1; 
		}
		//Return json array of groups
		print(json_encode($final));
		} else {
		  trigger_error("Query failed:  $query");
		}
	}
}
//Fetch available folders in section
else if(!isset($_POST['username']) && isset($_POST['section'])){
	$section = mysqli_real_escape_string($mysqli, $_POST['section']);
	if($section!=""){
		$query = "SELECT groups FROM sections WHERE section_id = $section";
		if($result = $mysqli->query($query)){
		  $json = array(); 
		  while($row = $result->fetch_row()){
		    $json = $row;
		  }
		  //Return json array of groups
		 print(json_decode($json[0]));
		} else {
		  trigger_error("Query failed:  $query");
		}
	}
}  
?>