<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Log Analysis</title>
</head>
<body>
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
 */
	require "../www/db-login.php";
	require "../www/error-handler.php";
	
	set_time_limit(30000);
	include "logAnalysis.php";

	!empty($_REQUEST["section"])?($section[0] = $_REQUEST["section"]):($section = array("CPI-360", "SOS-326"));
	$student[0] = $_REQUEST["studentName"];
	$problem = $_REQUEST["problemName"];
	$fromDate = $_REQUEST["fromDate"];
	$toDate = $_REQUEST["toDate"];
	$tableName = $_REQUEST["db_table"];
	$functionality = $_REQUEST["logFunctionality"];
	!empty($_REQUEST["db_name"])?($dbname = $_REQUEST["db_name"]):'';
	!empty($_REQUEST["db_user"])?($dbuser = $_REQUEST["db_user"]):'';
	!empty($_REQUEST["db_name"])?($dbpass = $_REQUEST["db_password"]):'';
	
	//$mysqli = mysqli_connect("localhost","root", "qwerty211", $dbname) or die("Connection not established. Check the user log file");
	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	
	$al = new AnalyzeLogs($mysqli);
	if($functionality === "class-problem"){
		$al->class_problem($section, $student, $problem, $fromDate, $toDate);
	} elseif($functionality === "check-logs"){
		$al->show_logs($tableName, $toDate, $fromDate, $student);
	} elseif($functionality === "Time-On-Task"){
		$al->solution_check($section, $student, $problem, $fromDate, $toDate);
	}
	mysqli_close($mysqli);
?>
</body>
</html>