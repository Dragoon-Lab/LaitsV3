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

$con = mysql_pconnect("localhost", $dbuser, $dbpass) or
        die('Could not connect: ' . mysql_error());

mysql_select_db($dbname, $con) or die("Could not find database");

$id = addslashes($_GET['id']);
$groupNum = addslashes($_GET['groupNum']);
$problemNum = addslashes($_GET['problemNum']);
$saveData = addslashes($_GET['saveData']);

$query = "SELECT saveData FROM autosave_table WHERE id='$id' AND groupNum='$groupNum' AND problemNum='$problemNum'";
$result = mysql_query($query);
$num_rows = mysql_num_rows($result);

$updateQuery = "";
if ($num_rows == 0) {
    $updateQuery = "INSERT INTO autosave_table(id,groupNum,problemNum,saveData) VALUES ('$id','$groupNum','$problemNum','$saveData')";
} else {
    $updateQuery = "UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND groupNum='$groupNum' AND problemNum='$problemNum'";
}

mysql_query($updateQuery);
?>
