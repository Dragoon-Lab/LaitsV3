<?php

$problem = $_GET['taskid'];
$section = isset($_GET['group'])?$_GET['group']:'';
if(isset($_GET['author'])){
  /*
    If section is given as argument, then look for 
    section-authored problems stored in database.
  */
  $author=$_GET['author'];
  
  require "db-login.php";
  $con = new mysqli("localhost", $dbuser, $dbpass,$dbname)
    or trigger_error("Failed to connect to MySQL: (" . $con->connect_errno . ") " . $con->connect_error,E_USER_ERROR);
  
  /* 
     The remaining code needs to be modified to look for section-specific
     problems in the database.
     
     Since searching may be by name, include a copy of the problem name 
     outside the xml.
  */
  
  //Commented out for bug 2172
  $query = "SELECT solutionGraph FROM solutions WHERE problemName='$problem' AND author='$author' AND section='$section'";
  
  //echo $query;
  
  $result = $con->query($query)
    or trigger_error("Select from solutions failed");
  if($row = $result->fetch_row()){
    //echo $row['task_details'];
    header("Content-type: text/xml");
    print $row[0];
  } else {
    	http_response_code(500);
  }
} else {
  /* If section is not supplied, then use published problems. */
  
  $host  = $_SERVER['HTTP_HOST'];
  $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
  $extra = 'problems/' . $problem . '.xml';
  /* Redirect to a page relative to the current directory.
     HTTP/1.1 requires an absolute URI as argument to Location. */
  header("Location: http://$host$uri/$extra");
  exit;
}
?>
