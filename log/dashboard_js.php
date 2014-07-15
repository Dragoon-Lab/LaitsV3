<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Detailed Dashboard</title>
<script type="text/javascript">
	
</script>
</head>
<body>

<?php
	//require "../www/db-login.php";
	//require "../www/error-handler.php";

	set_time_limit(30000);
	include "createDashboard_js.php";
	
	date_default_timezone_set('America/Phoenix');
	!empty($_REQUEST["fromDate"])?($fromDate = $_REQUEST["fromDate"]):($fromDate = Date("Y-m-d"));
	!empty($_REQUEST["toDate"])?($toDate = $_REQUEST["toDate"]):'';
	!empty($_REQUEST["fromTime"])?($fromTime = $_REQUEST["fromTime"]):($fromTime = '15:00:000');
	!empty($_REQUEST["toTime"])?($toTime = $_REQUEST["toTime"]):($toTime = '16:15:000');
	!empty($_REQUEST["section"])?($section = $_REQUEST["section"]):($section = 'sos-326-spring14');
	!empty($_REQUEST["mode"])?($mode = $_REQUEST["mode"]):$mode = 'STUDENT';
	!empty($_REQUEST["user"])?($user = $_REQUEST["user"]):$user = '';
	(!empty($_REQUEST["dashboard"]) &&($_REQUEST["dashboard"] === 'small'))?($smallDashboard = true):($smallDashboard=false);
	
	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_stable14") or die("Connection not established. Check the user log file");

	$db = new Dashboard($mysqli);

	$resultObjects = $db->createSmallDashboard($section, $mode, $user, $problem, $fromDate, $toDate, $fromTime, $toTime);

	print(json_encode($resultObjects));
	mysqli_close($mysqli);
?>
</body>
</html>