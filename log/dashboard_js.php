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
	require "../www/db-login.php";
	require "../www/error-handler.php";

	set_time_limit(30000);
	include "createDashboard_js.php";

	date_default_timezone_set('America/Phoenix');
	!empty($_REQUEST["fd"])?($fromDate = $_REQUEST["fd"]):($fromDate = '');
	!empty($_REQUEST["td"])?($toDate = $_REQUEST["td"]):($toDate = '');
	!empty($_REQUEST["ft"])?($fromTime = $_REQUEST["ft"]):($fromTime = '');
	!empty($_REQUEST["tt"])?($toTime = $_REQUEST["tt"]):($toTime = '');
	!empty($_REQUEST["s"])?($section = $_REQUEST["s"]):($section = 'login.html');
	!empty($_REQUEST["m"])?($mode = $_REQUEST["m"]):$mode = 'STUDENT';
	!empty($_REQUEST["u"])?($user = $_REQUEST["u"]):$user = '';
	!empty($_REQUEST["p"])?($sproblem = $_REQUEST["p"]):$sproblem = '';
	//trimming the problem name
	$problem = (strlen($sproblem) > 30) ? substr($sproblem, 0,30) : $sproblem;
	!empty($_REQUEST["db_name"])?($dbname = $_REQUEST["db_name"]):'';
	!empty($_REQUEST["db_user"])?($dbuser = $_REQUEST["db_user"]):'';
	!empty($_REQUEST["db_name"])?($dbpass = $_REQUEST["db_password"]):'';
	
	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_cpi") or die("Connection not established. Check the user log file");

	$db = new Dashboard($mysqli);

	$resultObjects = $db->createDashboard($section, $mode, $user, $problem, $fromDate, $toDate, $fromTime, $toTime);

	print(json_encode($resultObjects));
	mysqli_close($mysqli);
?>
