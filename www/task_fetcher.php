<?php

  // To log into database, create file db_user_password
  // with user name and password.  then "chmod 600 db_user_password"
$myFile = "db_user_password";
$fh = fopen($myFile, 'r');
$dbuser = chop(fgets($fh));
$dbpass = chop(fgets($fh));
$dbname = chop(fgets($fh));
if(strlen($dbname)==0){
  $dbname='laitsad_laitsdb';
}
fclose($fh);

    $con = mysql_pconnect("localhost", $dbuser, $dbpass) ;
    
    if (!$con)
    {
        die('Could not connect: ' . mysql_error());
    }

    mysql_select_db($dbname, $con) or die("Could not find database");
     
    $user = urldecode($_GET['taskid']);
    
    $query = "SELECT task_name,task_details FROM tasks WHERE task_id='$user'";
    
    //echo $query;
    
    $result = mysql_query($query);
    $row = mysql_fetch_array($result);
    //echo $row['task_details'];
    $cleanText = iconv('UTF-8','ISO-8859-1//TRANSLIT//IGNORE', $row['task_details']);
    $content = simplexml_load_string($cleanText);
    
    $content->addChild('TaskName', $row['task_name']);
    header("Content-type: text/xml");
    print $content ->asXML();

?>