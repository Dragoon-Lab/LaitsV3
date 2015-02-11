<?php
/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
require "error-handler.php";
require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error('Could not connect to database.', E_USER_ERROR);

//$obj = json_decode($_REQUEST($obj));
$s = $_REQUEST["x"];
$sid = $_REQUEST["schema_id"];
$c = $_REQUEST["competence"];
$co = $_REQUEST["count"];

if (get_magic_quotes_gpc()) {
	$c = stripslashes($c);
}

//escaping the jsons that are to be sent as texts
$c = mysqli_real_escape_string($mysqli, $c);

$query = "REPLACE INTO schema_application(session_id, schema_id, competence, counter) VALUES ('$s', '$sid', '$c', '$co')";
$result = $mysqli->query($query) or trigger_error("schema application value save failed: ".$mysqli->error);

mysqli_close($mysqli);

?>
