<?php
<<<<<<< HEAD
	//require "../www/db-login.php";
	//require "../www/error-handler.php";
=======
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
	require "../www/db-login.php";
	require "../www/error-handler.php";
>>>>>>> master

	set_time_limit(30000);
	include "createDashboard_js.php";

	date_default_timezone_set('America/Phoenix');
	!empty($_REQUEST["fromDate"])?($fromDate = $_REQUEST["fromDate"]):($fromDate = '');
	!empty($_REQUEST["toDate"])?($toDate = $_REQUEST["toDate"]):($toDate = '');
	!empty($_REQUEST["fromTime"])?($fromTime = $_REQUEST["fromTime"]):($fromTime = '');
	!empty($_REQUEST["toTime"])?($toTime = $_REQUEST["toTime"]):($toTime = '');
	!empty($_REQUEST["section"])?($section = $_REQUEST["section"]):($section = 'login.html');
	!empty($_REQUEST["mode"])?($mode = $_REQUEST["mode"]):$mode = 'STUDENT';
	!empty($_REQUEST["user"])?($user = $_REQUEST["user"]):$user = '';
	!empty($_REQUEST["problem"])?($problem = $_REQUEST["problem"]):$problem = '';
	(!empty($_REQUEST["dashboard"]) &&($_REQUEST["dashboard"] === 'small'))?($smallDashboard = true):($smallDashboard=false);

<<<<<<< HEAD
	//$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_eno") or die("Connection not established. Check the user log file");
=======
	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_eno") or die("Connection not established. Check the user log file");
>>>>>>> master

	$db = new Dashboard($mysqli);

	$resultObjects = $db->createDashboard($section, $mode, $user, $problem, $fromDate, $toDate, $fromTime, $toTime);

	print(json_encode($resultObjects));
	mysqli_close($mysqli);
?>