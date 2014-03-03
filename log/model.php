<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Model Changes due to interactions</title>
</head>
<body>
<?php
	include "modelChanges.php";

	//require "../www/db-login.php";
	//require "../www/error-handler.php";

	//$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
	$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_fall13") or die("Connection not established. Check the user log file");

	$model = new ModelChanges($mysqli);

	$model->getProblemPairs();

	mysqli_close($mysqli);
?>
</body>
</html>