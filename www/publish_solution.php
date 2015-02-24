<?php
require "pretty_print_json.php";

$model = $_REQUEST["sg"];

$modelArray = json_decode($model, true);
$completeModel = "{\"task\": $model}";

//pre processing the json before writing to file
//$modelTask["task"] = $task;
/*if(version_compare(PHP_VERSION, '5.4.0', '>=')){
	$model = json_encode($completeModel, JSON_PRETTY_PRINT);
} else {
	$model = json_encode($completeModel, 128);
}*/

$model = json_format($completeModel);

$name = $modelArray["taskName"];
$name = str_replace(" ", "-", $name);
$name = "problems/".$name.".json";
//echo "<pre>";
//echo stripslashes($model);
//echo "</pre>";

//writing to file
$file = fopen($name, "w");
fwrite($file, stripslashes($model));
fclose($file);
?>
