<?php

    session_start();

    require "db-login.php";
    //require "error-handler.php";
    ini_set("log_errors", 1);
    ini_set("error_log", "/tmp/php-error-ram.log");
    /*
     * I am trying to implement error logging to go to file, whenever I use error_log, but error_handler.php is messing this up 
    ini_set("log_errors", 1);
    ini_set("error_log", "/tmp/php-error.log"); */

    $request_handler = new RequestHandler;
    $request_handler->process_request();
    
    /**
     * Request Handler class to load and save user/author sessions.
     * autosave_table and unsolutions tables are used to load/save session for user and authors
     * 
     * @author Ramayan Tiwari <rptiwari@asu.edu>
     */
    class RequestHandler 
    {
        private $id;
        private $section;
        private $author;
        private $problem_name;
        private $xml_to_save;
        private $action;
        private $connection;
        
        public function __construct() 
        {
            global $dbuser, $dbpass, $dbname;
            
            // Connect to db
            $this->connection = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or trigger_error('Could not connect to database.');
            
            // Initialize Variables for REQUEST
            $this->action = $_REQUEST['action'];
            $this->id = isset($_REQUEST['id']) ? mysqli_real_escape_string($this->connection, $_REQUEST['id']) : '';
            $this->section = isset($_REQUEST['section']) ? mysqli_real_escape_string($this->connection, $_REQUEST['section']) : '';
            
            // Needed to identify problem for student mode work on custom problems
            // Do not include for author mode work or for published problems.
            $this->author = isset($_REQUEST['author']) ? mysqli_real_escape_string($this->connection, $_REQUEST['author']) : '';
            $this->problem_name = isset($_REQUEST['problem']) ? mysqli_real_escape_string($this->connection, $_REQUEST['problem']) : '';
            $this->xml_to_save = isset($_REQUEST['saveData']) ? mysqli_real_escape_string($this->connection, $_REQUEST['saveData']) : '';

            // Save data needs to be URL decoded
            $this->xml_to_save = urldecode($this->xml_to_save);  
        }
        
        public function __destruct() {
            $this->connection->close();
        }
   
        public function process_request()
        {
            switch ($this->action) 
            {
                case AvailableActions::LOAD :
                    $this->load_graph_XML_from_DB();
                    break;
                case AvailableActions::SAVE :
                    $this->save_graph_XML_to_DB();
                    break;

                case AvailableActions::AUTHOR_LOAD :
                    $this->handle_author_load();                    
                    break;

                case AvailableActions::AUTHOR_SAVE :
                    $this->save_author_graph_XML_to_DB();
                    break;

                case AvailableActions::SEND_SESSION_DETAILS :
                    $this->send_session_details();
                    break;
                
                default:
                    //error_log("Unauthorized Request Recived ");
                    header('HTTP/1.0 401 Unauthorized');                     
            }
        }
        
        private function handle_author_load()
        {
            // This is trying to load Auhor's saved sessions from unsolutions table. supplied id is used as author
            $result = $this->load_author_graph_XML_from_DB();
            if ($result === "")
                print $this->load_solution_file_from_server();
            else 
            {
                print $result;
            }                    
        }
        
        private function save_graph_XML_to_DB() 
        {
            $query = "INSERT INTO autosave_table (id, author, section, problemNum, saveData) 
                    VALUES ('$this->id','$this->author','$this->section','$this->problem_name','$this->xml_to_save') 
                    ON DUPLICATE KEY UPDATE author=values(author), saveData=values(saveData), date = CURRENT_TIMESTAMP";
            //error_log("Executing " . $query);
            $this->connection->query($query) or trigger_error("insert/update to autosave_table failed" .$this->connection->error);            
        }

        private function save_author_graph_XML_to_DB() 
        {
            $query = "INSERT INTO unsolutions (author, section, problemName, saveData) 
                    VALUES ('$this->author','$this->section','$this->problem_name','$this->xml_to_save') 
                    ON DUPLICATE KEY UPDATE saveData=values(saveData), date = CURRENT_TIMESTAMP";
            //error_log("Executing " . $query);
            $this->connection->query($query) or trigger_error("insert/update to unsolutions failed" .$this->connection->error);            
        }

        private function load_graph_XML_from_DB() 
        {
            //error_log("Executing Load Action ");
            
            $queryString = "SELECT saveData FROM autosave_table WHERE id=? AND author=? AND section=? AND problemNum=?";
           
            if ($stmt = mysqli_prepare($this->connection, $queryString)) {
                
                $stmt -> bind_param("ssss", $this->id, $this->author, $this->section, $this->problem_name);
                
                $stmt->execute() or trigger_error("select from autosave_table failed" .$this->connection->error);;
                $stmt->bind_result($save_data);
                $stmt->fetch();
                
                print($save_data);                
            }
        }

        private function load_author_graph_XML_from_DB() 
        {
            //error_log("Executing Load Author Action ");
            
            $queryString = "SELECT saveData FROM unsolutions WHERE author=? AND section=? AND problemName=?";
           
            if ($stmt = mysqli_prepare($this->connection, $queryString)) {
                
                $stmt -> bind_param("sss", $this->author, $this->section, $this->problem_name);
                
                $stmt->execute() or trigger_error("select from unsolutions failed" .$this->connection->error);;
                $stmt->bind_result($save_data);
                $stmt->fetch();
                
                print($save_data);                
            }           
        }
        
        private function send_session_details() 
        {
            //error_log("Executing Load Author Action ");
            $session_id = (isset($_REQUEST['session_id'])) ? $_REQUEST['session_id'] : "";
            if($session_id != "")
            {
                $queryString = "SELECT * FROM session WHERE session_id='$session_id'";
                $result = $this->connection->query($queryString);
                $arr = array();
                
                while ($row = $result->fetch_assoc()) {
                    $arr["session_id"] = $row["session_id"];
                    $arr["mode"] = $row["mode"];
                    $arr["user"] = $row["user"];
                    $arr["section"] = $row["section"];
                    $arr["problem_name"] = $row["problem_name"];
                }
                header('Content-Type: application/json');                   
                echo json_encode($arr);
            }
                       
        }

        //  This should be removed.  See Bug #2222
        //  Also, task_fetcher.php shows how to properly do a redirect.

        private function load_solution_file_from_server() 
        {
            $host = $_SERVER['HTTP_HOST'];
            $uri = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
            $relativeURL = 'problems/' . $this->problem_name . '.xml';

            $location = "http://$host$uri/$relativeURL";
            //error_log("Loading XML from  " . $location);
            
            $response_xml_data = "";
            if (($response_xml_data = file_get_contents($location)) === false) {
                return "";
            } else {
                return $response_xml_data;
            }
        }

        private function print_debug_info() 
        {
            echo "ID = ".$this->id."<br/>"; 
            echo "Action = ".$this->action."<br/>"; 
            echo "Problem Name = ".$this->problem_name."<br/>"; 
            echo "Author = ".$this->author."<br/>"; 
            echo "Section = ".$this->section."<br/>"; 
            echo "XML Data = ".$this->xml_to_save."<br/>"; 
        }
    }
    
    /**
     * Class specifying all valid actions that can be request by client.
     * Used in switch case to call appropriate methods based on action.
     */
    class AvailableActions
    {
        const SAVE = "save";
        const AUTHOR_SAVE = "author_save";
        const LOAD = "load";
        const AUTHOR_LOAD = "author_load";
        const SEND_SESSION_DETAILS = "get_session_info";
    }
?>
