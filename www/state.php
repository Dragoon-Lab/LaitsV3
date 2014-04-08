<?
/*
      Retrieve or set state

      This script itself is stateless, so we don't need to worry about php sessions.
*/

// Using trigger_error() so logging level and destination can be modified.
require "error-handler.php";

//connect to database
require "db-login.php";
$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
  or trigger_error('Could not connect to database.', E_USER_ERROR);

// Must always provide section, apropos, and property.
// Omitting user is equivalent to accessing the section default
// tid is found by looking at the step table

$user = isset($_REQUEST['u'])?mysqli_real_escape_string($mysqli,$_REQUEST['u']):null;
$section = mysqli_real_escape_string($mysqli,$_REQUEST['s'])
  or trigger_error('User name not supplied.', E_USER_ERROR);
$apropos = mysqli_real_escape_string($mysqli,$_REQUEST['aps'])
  or trigger_error('State apropos not supplied.', E_USER_ERROR);
  $property = mysqli_real_escape_string($mysqli,$_POST['pry'])
    or trigger_error('State property not supplied.', E_USER_ERROR);

if($_POST){
  // Update or append property
  // If user is not given, then update or set section default
  $value = mysqli_real_escape_string($mysqli,$_POST['vle'])
    or trigger_error('State value not supplied.', E_USER_ERROR);
  $query = "SELECT max(tid) FROM state";
  $result = $mysqli->query($query)
    or trigger_error("State query failed." . $mysqli->error);
  $tid = $result->fecth_row()[0];
  $userE = $user || "";
  // Should always have a new tid when updating value.
  $query = "INSERT INTO state ('$section','$userE','$apropos','$property', $tid, '$value')"; 
  $result = $mysqli->query($query)
    or trigger_error("Property insert failed." . $mysqli->error);
} else if($_GET){
  // Get property
  // If user is not given, return section default
  $userE = $user?"user='$user' AND":"";
  $noUser = false;
  // Try it once with user name and if that fails, look for section default
  $tryIt = true;
  while($tryIt){
    $query = "SELECT value FROM state WHERE $userE section='$section' AND apropos='$aprops' AND property='$property' ORDER BY tid DESC LIMIT 1";
    $result = $mysqli->query($query)
      or trigger_error("State query failed." . $mysqli->error);
    if($row = $result->fetch_row()){
      header("Content-type: application/json");
      print $row[0];
      exit;
    }
    if($userE)
      $userE="";
    else
      $tryIt = false;
  }
} else {
  trigger_error("Invalid method " . $_SERVER['REQUEST_METHOD'], E_USER_ERROR);
}