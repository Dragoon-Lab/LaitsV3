<?php
require "../www/db-login.php";
require "../www/error-handler.php";

set_time_limit(30000);
include "create_schema_dashboard.php";


!empty($_REQUEST["s"])?($section = $_REQUEST["s"]):($section = 'login.html');
!empty($_REQUEST["m"])?($mode = $_REQUEST["m"]):$mode = 'STUDENT';
!empty($_REQUEST["u"])?($user = $_REQUEST["u"]):$user = '';
!empty($_REQUEST["p"])?($problem = $_REQUEST["p"]):$problem = '';

$mysqli = mysqli_connect("localhost",$dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");
//$mysqli = mysqli_connect("localhost", "root", "qwerty211", "laits_cpi") or die("Connection not established. Check the user log file");

$db = new SchemaDashboard($mysqli);
$resultObjects = $db->createDashboard($section, $mode, $user, $problem);

print(json_encode($resultObjects));
mysqli_close($mysqli);
?>
