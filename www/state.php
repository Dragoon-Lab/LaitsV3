<?
/*
      Retrieve or set state

      This script itself is stateless, so we don't need to worry about php sessions.

      A possible extension is to retrieve all properties for a given
      apropos if the property is not specified in a GET.  This would
      allow the client to pre-fetch all properties for a given student model.
      The query would look something like:
          $query = "SELECT property, value FROM state WHERE section='$section' 
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

// user is "" or not supplied, SET/GET section default
$user = isset($_REQUEST['u'])?mysqli_real_escape_string($mysqli, $_REQUEST['u']):"";
$section = mysqli_real_escape_string($mysqli, $_REQUEST['s'])
  or trigger_error('User name not supplied.', E_USER_ERROR);
$apropos = mysqli_real_escape_string($mysqli, $_REQUEST['aps'])
  or trigger_error('State apropos not supplied.', E_USER_ERROR);
$property = mysqli_real_escape_string($mysqli, $_REQUEST['pry'])
  or trigger_error('State property not supplied.', E_USER_ERROR);

if($_POST){
  // Update or append property

  // If user is not given, then update or set section default.
  // Sending an empty string for value is used to delete a property.
  if(isset($_POST['vle']))
    $value = mysqli_real_escape_string($mysqli,$_POST['vle']);
  else
    trigger_error('State value not supplied.', E_USER_ERROR);
  // If max tid has not changed, this will overwrite old entry.
  $query = "REPLACE INTO state VALUES ('$section','$user','$apropos','$property', (SELECT max(tid) FROM step), '$value')"; 
  $result = $mysqli->query($query)
    or trigger_error("Property insert failed." . $mysqli->error);

} else if($_GET){
  // Get property

  /*
    Look for user value and any section default. Sort to choose user over default
    and then most recent.
  */
  $query = "SELECT value FROM state WHERE section='$section' AND (user='$user' OR user='') AND apropos='$apropos' AND property='$property' ORDER BY user DESC, tid DESC LIMIT 1";
  $result = $mysqli->query($query)
    or trigger_error("State query failed." . $mysqli->error);
  if($row = $result->fetch_row()){
    header("Content-type: application/json");
    print $row[0];
    exit;
  }

} else {
  trigger_error("Invalid method " . $_SERVER['REQUEST_METHOD'], E_USER_ERROR);
}