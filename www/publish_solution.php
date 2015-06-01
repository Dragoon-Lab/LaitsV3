<?php
require "pretty_print_json.php";

$model = $_REQUEST["sg"];



//pre processing the json before writing to file
//$modelTask["task"] = $task;
/*if(version_compare(PHP_VERSION, '5.4.0', '>=')){
	$model = json_encode($completeModel, JSON_PRETTY_PRINT);
} else {
	$model = json_encode($completeModel, 128);
}*/

try{
	$modelArray = json_decode($model, true);
	$completeModel = "{\"task\": $model}";
	$model = json_format($completeModel); // convert messy JSON to pretty JSON
}
catch(Exception $e){
	echo "{ \"error\":\"".$e->e=getMessage(). "\"}";
	// we need to log the error to the server log file	
}	
try {
	$name = $modelArray["taskName"];
	$name = str_replace(" ", "-", $name);
	$name = "problems/".$name.".json";
	//checking if the file name already exists
	if(file_exists($name))
		throw new Exception("File with same name already exist");
	//writing to file
	$file = fopen($name, "w");
	fwrite($file, stripslashes($model));
	fclose($file); 
	echo "done";
	
}
catch(Exception $e){
	echo "{ \"error\":\"".$e->getMessage(). "\"}";
	// we need to log the error to the server log file	
}
//echo "<pre>";
//echo stripslashes($model);
//echo "</pre>";

//writing to file
$file = fopen($name, "w");
//fwrite($file, stripslashes($model));
fwrite($file, $model);
fclose($file);
?>
