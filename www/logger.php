<?php
    require "db-login.php";
    ini_set("log_errors", 1);
    ini_set("error_log", "/tmp/php-error-ram.log"); 
    
    $logger = new Logger;
    $logger->save_log();
    
    /**
     * Class to persist client logs into database.
     * @author Ramayan Tiwari <rptiwari@asu.edu>
     */
    class Logger {
        private $logger;
        private $session_id;
        private $log_level;
        private $message;
        
        private $connection;
        
        // Constants to represent HTML login form params
        const USER_NAME_PARAM = "username";
        const SESSION_ID_PARAM = "session_id";
        const LOG_LEVEL_PARAM = "loglevel";
        const LOGGER_NAME_PARAM = "logger";
        const LOG_MESSAGE_PARAM = "message";
        const TIME_PARAM = "time";
        const LOCATION_PARAM = "location";
        
        public function __construct() 
        {
            global $dbuser, $dbpass, $dbname;
            
            // Connect to db
            $this->connection = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or trigger_error('Could not connect to database.');            
        }
        
        public function save_log()
        {
            if($this->validate_request_param())
            {
                if($this->logger == "DevLogs")
                {
                    $this->save_dev_log();
                }
                else
                {
                    $this->save_activity_log();
                }
            }
            else
            {
                error_log("Startup request does not contain all the required parameters. ");
            }
        }        
        
        // Validate Request - check mandatory parameters
        private function validate_request_param() 
        {
            if(isset($_REQUEST[self::SESSION_ID_PARAM]) &&
                    isset($_REQUEST[self::LOGGER_NAME_PARAM])) {
               
                // Initialize Variables
                $this->session_id = urldecode($_REQUEST[self::SESSION_ID_PARAM]);
                $this->log_level = $_REQUEST[self::LOG_LEVEL_PARAM];
                $this->logger = $_REQUEST[self::LOGGER_NAME_PARAM];
                $this->message = urldecode($_REQUEST[self::LOG_MESSAGE_PARAM]);
                $this->message = stripslashes($this->message);
                return true;
            } 
            return false;
        }
        
        private function save_activity_log() 
        {
            $queryString = "INSERT INTO step (session_id, method, message) VALUE (?,?,?)";
            
            if ($stmt = mysqli_prepare($this->connection, $queryString)) 
            {
                $stmt -> bind_param("sss", $this->session_id, $this->log_level, $this->message);                
                $stmt->execute() or trigger_error("Insert into table step failed" .$this->connection->error);;                
            }            
        }
        
        private function save_dev_log() 
        {            
            $queryString = "INSERT INTO dev_logs (session_id, location, level, message) VALUE (?,?,?,?)";
           
            if ($stmt = mysqli_prepare($this->connection, $queryString)) 
            {
                $location = mysqli_real_escape_string($this->connection, $_REQUEST[self::LOCATION_PARAM]);
                $stmt -> bind_param("ssss", $this->session_id, $location, $this->log_level, $this->message);                
                $stmt->execute() or trigger_error("Insert into table dev_logs failed" .$this->connection->error);;                
            }
        }
    }
    
?>
