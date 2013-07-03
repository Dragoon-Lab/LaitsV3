<?php
  // Get database login parameters.
  // This is meant to be require'd by scripts that 
  // access the database.
  
  // To log into database, create file db_user_password in 
  // project root directory containing username, password
  // and database name.  Then "chmod 600 db_user_password"
$myFile = "../db_user_password";
$fh = fopen($myFile, 'r') or die("Could not find password file");
$dbuser = chop(fgets($fh));
$dbpass = chop(fgets($fh));
$dbname = chop(fgets($fh));
if(strlen($dbname)==0){
  $dbname='lait-devel';
}
fclose($fh);
