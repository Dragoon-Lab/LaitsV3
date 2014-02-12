<?php
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
