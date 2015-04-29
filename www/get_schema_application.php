<?php
require "error-handler.php";
require "db-login.php";

function printSchema($comp){
	print "{\"competence\": ".$comp."}";
}

$mysqli  = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) 
	or trigger_error('Could not connect to database.', E_USER_ERROR);

//$obj = json_decode($_REQUEST['obj']);
//echo print_r($_REQUEST['obj']);
$user = $_REQUEST["u"];
$schema = $_REQUEST["s"];
$section = $_REQUEST["sec"];
$problem = isset($_REQUEST['p'])?$_REQUEST['p']:"";
$problemString = "AND problem = '".$problem."' ";
$query = 
"SELECT 
	competence 
from 
	schema_application JOIN session on session.session_id = schema_application.session_id 
where 
	schema_id = '".$schema."' 
	AND user = '".$user."' 
	AND section = '".$section."' ".
	(($problem != "")?$problemString:"")."
ORDER BY tid desc limit 1;";

$result = $mysqli->query($query)
	or trigger_error("Previous schema query failed ".$mysqli->error );

if($row = $result->fetch_row()){
	printSchema($row[0]);
} else {
	printSchema("null");
}

mysqli_close($mysqli);
?>
