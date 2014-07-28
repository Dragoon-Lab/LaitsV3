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

// For debugging, show all notices:
// error_reporting(E_ALL);

// Send an HTTP response code back to the client if an error occurs
function sendResponseCode($errno, $errstr){
  $statusCode=500;
  if (function_exists('http_response_code')){
    http_response_code($statusCode);
    echo 'Internal server error: ' . $statusCode;
  } else {
    header('Internal server error: ' . $statusCode, true, $statusCode);
  }
  return FALSE;  // Continue on to default error handling/logging
}

set_error_handler("sendResponseCode");
