<?php

$myFile = "../db_user_password";
$fh = fopen($myFile, 'r') or die("Could not access password file.");
$dbuser = chop(fgets($fh));
$dbpass = chop(fgets($fh));
$dbname = chop(fgets($fh));
if (strlen($dbname) == 0) {
    $dbname = 'laits_devel';
}
fclose($fh);

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
        or die('Could not connect to database.');

$id = mysqli_real_escape_string($mysqli, $_GET['id']);
$section = mysqli_real_escape_string($mysqli, $_GET['section']);
$problemNum = mysqli_real_escape_string($mysqli, $_GET['problemNum']);
$saveData = mysqli_real_escape_string($mysqli, $_GET['saveData']);

$result = $mysqli->query("SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
$num_rows = $result->num_rows;

if ($num_rows == 0) {
    $mysqli->query("INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemNum','$saveData')");
} else {
    $mysqli->query("UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemNum'");
}
?>
