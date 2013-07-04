<?php
session_start();

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass,$dbname);

if(isset($_GET["user"])){            
  $query = "INSERT into table_name (id, groupNum, problemNum, saveData)
            VALUES ('".$_GET["user"]."', 
            '".$_GET["group"]."', 
            '".$_GET["problem"]."', 
            '".$_GET["data"]."'";
  $runQuery = mysqli_query($mysqli, $query)
    or die(mysqli_error($mysqli));
  exit;            
}else{
  //send error report if needed
  exit;
}
