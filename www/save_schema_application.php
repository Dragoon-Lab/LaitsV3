<?php
require "error-handler.php";
require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error('Could not connect to database.', E_USER_ERROR);

//$obj = json_decode($_REQUEST($obj));
$s = $_REQUEST["x"];
$sid = $_REQUEST["schema_id"];
$c = $_REQUEST["competence"];
$co = $_REQUEST["count"];

if (get_magic_quotes_gpc()) {
	$c = stripslashes($c);
}

//escaping the jsons that are to be sent as texts
$c = mysqli_real_escape_string($mysqli, $c);

$query = "REPLACE INTO schema_application(session_id, schema_id, competence, counter) VALUES ('$s', '$sid', '$c', '$co')";
$result = $mysqli->query($query) or trigger_error("schema application value save failed: ".$mysqli->error);

mysqli_close($mysqli);

?>
