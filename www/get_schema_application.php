<?php
require "error-handler.php"
require "db-login.php";

function printSchema($comp){
	print "{\"competence\": ".$comp."}";
}

$mysqli  = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) 
	or trigger_error('Could not connect to database.', E_USER_ERROR);

$obj = json_decode($_REQUEST($obj));
$user = $obj["u"];
$schema = $obj["s"];
$section = $obj["sec"];
$problemString = "AND problem = '".$obj["p"]."' ";
$query = 
"SELECT 
	competence 
from 
	schema_application JOIN session on session.session_id = schema_application.session_id 
where 
	schema_id = '".$schema."' 
	AND user = '".$user."' 
	AND section = '".$section."' ".
	(isset($obj["p"])?$problemString:"")."
ORDER BY time desc limit 1;";

$result = $mysqli->query($query)
	or trigger_error("Previous schema query failed ".$mysqli->error );

if($row = $result->fetch_row()){
	printSchema($row["comptence"];
} else {
	printSchema("");
}

mysqli_close($mysqli);
?>
