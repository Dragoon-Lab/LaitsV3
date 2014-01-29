<?php
    require "db-login.php";
    ini_set("log_errors", 1);
    ini_set("error_log", "/tmp/php-error-ram.log"); 
    
    class Common{
        public $connection;
        
        public function __construct() 
        {
            global $dbuser, $dbpass, $dbname;
            
            // Connect to db
            $this->connection = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or trigger_error('Could not connect to database.'); 
        }
        
        private function generate_session_id($username, $section)
        {
            // Using MD5 of user + section + current_time
            $id = $username . $section . time();
            $hash = md5($id);
            return $hash;
        }
        
        /*
         * 1. See if this user had any saved data for this problem id, session and mode combination
         *    a) Get most recent session_id for this user
         *    b) get saved_data for this session
         * 2. Generate new session_id, store it in sessions, and create new entry in autosave_table with this new session and saved data from old session
         * 3. Send jnlp with this new session_id
         */
        public function generate_and_save_session_to_db($user, $mode, $section, $problem) 
        {
            // Check if previous session exists for this user, mode, problem and section
            $query = "SELECT save_data from autosave_table WHERE session_id=(SELECT session_id FROM session WHERE mode='$mode' 
                AND user='$user' AND section='$section' AND problem_name='$problem' ORDER BY time DESC LIMIT 1)";
            
            $result = mysqli_query($this->connection, $query);
            $row = mysqli_fetch_array($result, MYSQLI_NUM);
            $previous_session_data = $row[0];
            
            // Create New session
            $session_id = $this->generate_session_id($user, $section);
            $query = "INSERT INTO session (session_id, mode, user, section, problem_name) 
                    VALUES ('$session_id','$mode','$user','$section','$problem') ";
            
            $this->connection->query($query) or trigger_error("insert/update to session failed" .$this->connection->error);
            
            // If previous session data was found, update it to new autosave
            if($previous_session_data != "") {
                //error_log("inserting old session data to new session ". $session_id);
                $query = "INSERT INTO autosave_table (session_id, save_data) 
                        VALUES ('$session_id','$previous_session_data') 
                        ON DUPLICATE KEY UPDATE save_data=values(save_data), date = CURRENT_TIMESTAMP";
                
                $this->connection->query($query) or trigger_error("insert/update to autosave_table failed" .$this->connection->error);
            }
            
            return $session_id;            
        }
    }     
?>
