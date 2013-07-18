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

$id = urldecode($_GET['id']);
$groupNum = urldecode($_GET['groupNum']);
$problemNum = urldecode($_GET['problemNum']);
$saveData = urldecode($_GET['saveData']);

$query = "SELECT saveData FROM autosave_table WHERE id='$id' AND groupNum='$groupNum' AND problemNum='$problemNum'";
$result = mysql_query($query);
$num_rows = mysql_num_rows($result);

$updateQuery = "";
if ($num_rows == 1) {
    $row = mysql_fetch_assoc($result);
    printf("%s\n",$row['data']);
}
printf("Yo, ho, ho");//test line--remove when query is passed back to file.
mysql_query($updateQuery);

?>