<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Model Changes due to interactions</title>
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
	include "modelChanges.php";

	require "../www/db-login.php";
	require "../www/error-handler.php";

	$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, "laits_fall_2013") or die("Connection not established. Check the user log file");
	//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_fall13") or die("Connection not established. Check the user log file");

	$model = new ModelChanges($mysqli);

	echo "Picking code from laits_fall_2013 database.";

	$model->getProblemPairs();

	mysqli_close($mysqli);
?>
</body>
</html>