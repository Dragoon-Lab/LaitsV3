<?php
$model = $_REQUEST["sg"];

$modelArray = json_decode($model, true);
$task = $modelArray["task"];
//pre processing the json before writing to file
$modelTask["task"] = $task;
if(version_compare(PHP_VERSION, '5.4.0', '>=')){
	$model = json_encode($modelTask, JSON_PRETTY_PRINT);
} else {
	$model = json_encode($modelTask, 128);
}

$name = $task["taskName"];
$name = str_replace(" ", "-", $name);
$name = "problems/".$name.".json";

//writing to file
$file = fopen($name, "w");
fwrite($file, stripslashes($model));
fclose($file);
?>
