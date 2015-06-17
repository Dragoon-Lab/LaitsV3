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

if(!isset($_POST['op'])){
	//If Get Request then return users in specific section.
	if(isset($_GET['section'])){
		$query = "";
		$section = mysqli_real_escape_string($mysqli, $_GET['section']);
	 	$json = array();
	 	$query = "SELECT username FROM user_groups WHERE section = $section";
	 	if($result = $mysqli->query($query)){
			while($row = $result->fetch_object()){
				$temp=$row;
				array_push($json,$temp);
			}
		}else{
			trigger_error("Query failed:  $query");
		}
		echo json_encode($json);
	}else{
		echo "Missing Parameter: section is required.";
	}
}

//CREATE User 	
else if(isset($_POST['op']) && $_POST['op'] == "add"){
	$query = "";
	if(isset($_POST['username']) &&  isset($_POST['section'])){
		 $username = mysqli_real_escape_string($mysqli, $_POST['username']);
		 $section_id = mysqli_real_escape_string($mysqli, $_POST['section']);
		 if($section_id != ""){
		 	$groups = json_encode('[]');
		 	$query = "INSERT INTO user_groups (username, section, groups) VALUES ('$username', $section_id , '$groups')";
		 	if($result = $mysqli->query($query)){
		 		echo "New user added sucessfully!";
			}else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: username and section is required";
	}
}

//UPDATE USER GROUPS
else if(isset($_POST['op']) && $_POST['op'] == "update"){
	$query = "";
	if(isset($_POST['username']) && isset($_POST['section']) && isset($_POST['groups'])){
		$username = mysqli_real_escape_string($mysqli, $_POST['username']);
		$section_id = mysqli_real_escape_string($mysqli, $_POST['section']);
		$groups = mysqli_real_escape_string($mysqli, $_POST['groups']);
		if($username!= "" && $section_id != "" && $groups != ""){
			$groups = json_encode($groups);
			$query = "UPDATE user_groups SET groups='$groups' WHERE username= '$username' AND section = $section_id";
			if($result = $mysqli->query($query)){
				echo "User groups sucessfully updated";
			}else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: username, section and groups parameters are required.";
	}
}

//DELETE USER
else if(isset($_POST['op']) && $_POST['op'] == "delete"){
	if(isset($_POST['username']) && isset($_POST['section'])){
		$section_id = mysqli_real_escape_string($mysqli, $_POST['section']);
		$username = mysqli_real_escape_string($mysqli, $_POST['username']);
		if($section_id != "" && $username != null){
			$query = "DELETE FROM user_groups WHERE section = $section_id AND username = '$username'";
			if($result = $mysqli->query($query)){
				echo "User sucessfully deleted";
			} else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: section and username is required.";
	}	
}
?>