<?php
require "error-handler.php";
require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error('Could not connect to database.', E_USER_ERROR);

//$obj = json_decode($_REQUEST($obj));
$s = $_REQUEST["x"];
$sid = $_REQUEST["schema_id"];
$d = $_REQUEST["difficulty"];

if (get_magic_quotes_gpc()) {
	$d = stripslashes($d);
}

//escaping the jsons that are to be sent as texts
$d = mysqli_real_escape_string($mysqli, $d);

$query = "REPLACE INTO schema_session(session_id, schema_id, difficulty) VALUES ('$s', '$sid', '$d')";
$result = $mysqli->query($query) or trigger_error("schema application value save failed: ".$mysqli->error);

mysqli_close($mysqli);
?>