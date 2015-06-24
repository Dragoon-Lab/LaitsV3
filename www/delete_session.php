<?php
/*
     Dragoon Project
     Arizona State University
     (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
     
     This file is a part of Dragoon
     Dragoon is free software: you can redistribute it and/or modify
     it under the terms of the GNU Lesser General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
     
     Dragoon is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU Lesser General Public License for more details.
     
     You should have received a copy of the GNU Lesser General Public License
     along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
*/
 
  require "db-login.php"; 
  
 //get the time stamp for 24h ago
  $subtime =  date('Y-m-d', strtotime('-1 day'));
  
  
 // connect to database
  $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname);
  
  
 // Check the connection
  if (!$mysqli) { die("Connection failed: " . mysqli_connect_error());  }
  //else {echo "connection succeeded";}  
  
  
  //delete the expired sessions in public section
   $query = "DELETE FROM session WHERE time < $subtime AND section='public-login.html'";
   //time < $subtime
   if (mysqli_query($mysqli, $query)) {
   echo "Record deleted successfully";
  } else {
   echo "Error deleting record: " . mysqli_error($mysqli);
   }
    
  //close the connection
  mysqli_close($mysqli);
?>