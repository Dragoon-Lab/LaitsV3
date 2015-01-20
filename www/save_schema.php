<?php
require "error-handler.php";
require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error('Could not connect to database.', E_USER_ERROR);

$schema = json_decode($_REQUEST($obj))
$p = $schema["problem"];
$sid = $schema["schema_id"];
$i = $schema["isolated"];
$c = $schema["cues"];
$ph = $schema["phrases"];
$n = $schema["nodes"];
$id = $schema["id"];

$query = "REPLACE INTO schema_opportunity(problem, schema_id, isolated, cues, phrases, nodes, id) VALUES ('$p', '$sid', '$i', '$c', '$ph', '$n', '$id')";
$result = $mysqli->query($query) or trigger_error("schema save failed: ".$mysqli->error);

mysqli_close($mysqli);
?>
