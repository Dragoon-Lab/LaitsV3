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
	$query = "";
 	$json = array();
 	$query = "SELECT section_id, section_name FROM sections";
 	if($result = $mysqli->query($query)){
		while($row = $result->fetch_object()){
			$temp=$row;
			array_push($json,$temp);
		}
	}else{
		trigger_error("Query failed:  $query");
	}
	echo json_encode($json);
}
//ADD SECTION	
else if(isset($_POST['op']) && $_POST['op'] == "add"){
	$query = "";
	if(isset($_POST['name'])){
		 $section_name = mysqli_real_escape_string($mysqli, $_POST['name']);
		 if($section_name != ""){
		 	$groups = json_encode('[]');
		 	$query = "INSERT INTO sections (section_name, groups) VALUES ('$section_name', '$groups')";
		 	if($result = $mysqli->query($query)){
		 		//Return ID of newly created section
		 		$json = "{'id':$mysqli->insert_id, 'name':$section_name }";
				echo json_encode($json);
			}else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: Section Name is required";
	}
}

//UPDATE SECTION
else if(isset($_POST['op']) && $_POST['op'] == "update"){
	$query = "";
	if(isset($_POST['section']) && isset($_POST['groups'])){
		$section_id = mysqli_real_escape_string($mysqli, $_POST['section']);
		$groups = mysqli_real_escape_string($mysqli, $_POST['groups']);
		if($section_id != "" && $groups != ""){
			$groups = json_encode($groups);
			$query = "UPDATE sections SET groups='$groups' WHERE section_id = $section_id";
			if($result = $mysqli->query($query)){
				echo "Section sucessfully updated";
			}else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: Section Id and groups parameters are required.";
	}
}

//DELETE SECTION
else if(isset($_POST['op']) && $_POST['op'] == "delete"){
	if(isset($_POST['section'])){
		$section_id = mysqli_real_escape_string($mysqli, $_POST['section']);
		if($section_id != ""){
			$query = "DELETE FROM sections WHERE section_id = $section_id";
			if($result = $mysqli->query($query)){
				echo "Section sucessfully deleted";
			} else{
				trigger_error("Query failed:  $query");
			}
		}
	}else{
		echo "Missing Parameters: Section Id is required.";
	}	
}
?>