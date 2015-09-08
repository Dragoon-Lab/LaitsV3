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

   // connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname);

    // Check the connection
     if (!$mysqli) { die("Connection failed: " . mysqli_connect_error());  }
     //else {echo "connection succeeded";}
     $user = "";
     $section ="";
     $group = "";
     $problem = "";
     //retrieve POST variables
     if(isset($_GET['s']))
       $section = mysqli_real_escape_string($mysqli, $_GET['s']);
     if(isset($_GET['u']))
       $user = mysqli_real_escape_string($mysqli, $_GET['u']);
     if(isset($_GET['g']))
       $group = mysqli_real_escape_string($mysqli, $_GET['g']);
     if(isset($_GET['p']))
       $problem = mysqli_real_escape_string($mysqli, $_GET['p']);

      //Update the session table to set the group to DELETED
      $query = "UPDATE session S SET S.group = 'DELETED' WHERE S.section='$section' AND S.user='$user' AND S.mode='AUTHOR' AND S.group='$group' AND S.problem='$problem'";

       if (mysqli_query($mysqli, $query)) {
         echo "Record updated successfully";
       } else {
         echo "Error updating record: " . mysqli_error($mysqli);
       }

     //close the connection
     mysqli_close($mysqli);

?>
