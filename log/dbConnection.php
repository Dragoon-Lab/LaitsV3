<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Log Analysis</title>
</head>
<body>
<?php
	//require "../www/db-login.php";
	//require "../www/error-handler.php";
	
	set_time_limit(30000);
	inlcude 'logAnalysis.php';

	!empty($_REQUEST["section"])?($section[0] = $_REQUEST["section"]):($section = array("CPI-360", "SOS-326"));
	$student[0] = $_REQUEST["studentName"];
	$problem = $_REQUEST["problemName"];
	$fromDate = $_REQUEST["fromDate"];
	$toDate = $_REQUEST["toDate"];
	$tableName = $_REQUEST["db_table"];
	$functionality = $_REQUEST["logFunctionality"];
	!empty($_REQUEST["db_name"])?($dbname = $_REQUEST["db_name"]):'';
	!empty($_REQUEST["db_user"])?($dbuser = $_REQUEST["db_user"]):'';
	!empty($_REQUEST["db_name"])?($dbpassword = $_REQUEST["db_name"]):'';
	
	$mysqli = mysqli_connect("localhost","sachin", "miatdb211", "laits_devel") or die("Connection not established. Check the user log file");
	
	$al = new AnalyzeLogs($mysqli);
	if($functionality === "class-problem"){
		$al->class_problem($section, $student, $problem, $fromDate, $toDate);
	} elseif($functionality === "check-logs"){
		$al->show_logs($tableName, $toDate, $fromDate);
	} elseif($functionality === "Time-On-Task"){
		$al->solution_check($section, $student, $problem, $fromDate, $toDate);
	}
	mysqli_close($mysqli);
?>
</body>
</html>