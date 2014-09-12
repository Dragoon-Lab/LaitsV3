<?php
	require "../www/db-login.php";
	require "../www/error-handler.php";

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

	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_js_dev1") or die("Connection not established. Check the user log file");

	$db = new Dashboard($mysqli);

	$resultObjects = $db->createDashboard($section, $mode, $user, $problem, $fromDate, $toDate, $fromTime, $toTime);

	print(json_encode($resultObjects));
	mysqli_close($mysqli);
?>