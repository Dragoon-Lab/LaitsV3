<?php

$problem = $_GET['taskid'];

if(isset($_GET['section']))
  {
    /*
      If section is given as argument, then look for 
      section-authored problems stored in database.
    */
    $section=$_GET['section'];
    $user = $_GET['user'];

    require "db-login.php";
    $con = new mysqli("localhost", $dbuser, $dbpass,$dbname);
    if ($con->connect_errno) {
      echo "Failed to connect to MySQL: (" . $con->connect_errno . ") " . $con->connect_error;
    }
    
    /* 
       The remaining code needs to be modified to look for section-specific
       problems in the database.

       Since searching may be by name, include a copy of the problem name 
       outside the xml.
     */
    
    //Commented out for bug 2172
    //$query = "SELECT task_name,task_details FROM tasks WHERE task_id='$problem'";
    
    //echo $query;
    
    $result = $con->query($query);
    $row = $result->fetch_assoc();
    //echo $row['task_details'];
    $cleanText = iconv('UTF-8','ISO-8859-1//TRANSLIT//IGNORE', $row['task_details']);
    $content = simplexml_load_string($cleanText);
    
    $content->addChild('TaskName', $row['task_name']);
    header("Content-type: text/xml");
    print $content ->asXML();
  } 
else 
  {
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
