<?php

  // To log into database, create file db_user_password
  // with user name and password.  then "chmod 600 db_user_password"
$myFile = "../db_user_password";
$fh = fopen($myFile, 'r') or die("Could not access password file.");
$dbuser = chop(fgets($fh));
$dbpass = chop(fgets($fh));
$dbname = chop(fgets($fh));
if(strlen($dbname)==0){
  $dbname='laitsad_stable';
}
fclose($fh);

    $con = mysql_pconnect("localhost",$dbuser, $dbpass) or
        die('Could not connect: ' . mysql_error());

    mysql_select_db($dbname, $con) or die("Could not find database");
     
    $user = urldecode($_GET['user']);
    $date = urldecode($_GET['date']);
    $logger = urldecode($_GET['logger']);
    $level = urldecode($_GET['level']);
    $msg = urldecode($_GET['msg']);
    $location = urldecode($_GET['location']);

    $query = "";
    if($logger == "DevLogs"){
        $query = "INSERT INTO dev_logs VALUES ('$user','$date','$location','$level','$msg')";
    }else{
        $query = "INSERT INTO activity_logs VALUES ('$user','$date','$level','$msg')";
    }
    
    mysql_query($query);

?>
