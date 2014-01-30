<?php
    require "common.php";
    
    session_start();
    
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
        private $session_id;
        private $id;
        private $section;
        private $author;
        private $problem_name;
        private $xml_to_save;
        private $action;
        private $common;
        
        public function __construct() 
        {
            $this->common =  new Common;
            
            // Initialize Variables for REQUEST
            $this->session_id = $_REQUEST['session_id'];
            $this->action = $_REQUEST['action'];
            $this->id = isset($_REQUEST['id']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['id']) : '';
            $this->section = isset($_REQUEST['section']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['section']) : '';
            
            // Needed to identify problem for student mode work on custom problems
            // Do not include for author mode work or for published problems.
            $this->author = isset($_REQUEST['author']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['author']) : '';
            $this->problem_name = isset($_REQUEST['problem']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['problem']) : '';
            $this->xml_to_save = isset($_REQUEST['save_data']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['save_data']) : '';

            // Save data needs to be URL decoded
            $this->xml_to_save = urldecode($this->xml_to_save);  
        }
        
        public function __destruct() {
            $this->common->connection->close();
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
            $query = "INSERT INTO autosave_table (session_id, save_data) 
                    VALUES ('$this->session_id','$this->xml_to_save') 
                    ON DUPLICATE KEY UPDATE save_data=values(save_data), date = CURRENT_TIMESTAMP";
            //error_log("Executing " . $query);
            $this->common->connection->query($query) or trigger_error("insert/update to autosave_table failed" .$this->common->connection->error);            
        }

        private function save_author_graph_XML_to_DB() 
        {
            $query = "INSERT INTO unsolutions (author, section, problemName, saveData) 
                    VALUES ('$this->author','$this->section','$this->problem_name','$this->xml_to_save') 
                    ON DUPLICATE KEY UPDATE saveData=values(saveData), date = CURRENT_TIMESTAMP";
            //error_log("Executing " . $query);
            $this->common->connection->query($query) or trigger_error("insert/update to unsolutions failed" .$this->common->connection->error);            
        }

        private function load_graph_XML_from_DB() 
        {
            $queryString = "SELECT save_data FROM autosave_table WHERE session_id=?";
           
            if ($stmt = mysqli_prepare($this->common->connection, $queryString)) {
                
                $stmt -> bind_param("s", $this->session_id);
                
                $stmt->execute() or trigger_error("select from autosave_table failed" .$this->common->connection->error);;
                $stmt->bind_result($save_data);
                $stmt->fetch();
                
                print($save_data);                
            }
        }

        private function load_author_graph_XML_from_DB() 
        {
            //error_log("Executing Load Author Action ");
            
            $queryString = "SELECT saveData FROM unsolutions WHERE author=? AND section=? AND problemName=?";
           
            if ($stmt = mysqli_prepare($this->common->connection, $queryString)) {
                
                $stmt -> bind_param("sss", $this->author, $this->section, $this->problem_name);
                
                $stmt->execute() or trigger_error("select from unsolutions failed" .$this->common->connection->error);;
                $stmt->bind_result($save_data);
                $stmt->fetch();
                
                print($save_data);                
            }           
        }
        
        /*
         * 1. Get correct session details
         *    a) Set session to expired
         *    b) send session details in JSON format
         * 2. If it was expired, find most recent session for this user, problem, mode and section
         * 3. Create a new session, copy over details from previous session
         */
        private function send_session_details() 
        {
            if($this->session_id != "")
            {
                $queryString = "SELECT * FROM session WHERE session_id='$this->session_id'";
                $result = mysqli_query($this->common->connection, $queryString);
                
                $arr = mysqli_fetch_array($result, MYSQLI_ASSOC);
                if(count($arr) == 0) return;
                 
                $json_array = array();
                
                $json_array["username"] = $arr["user"];
                $json_array["section"] = $arr["section"];
                $json_array["mode"] = $arr["mode"];
                $json_array["problem_name"] = $arr["problem_name"];
                $json_array["session_id"] = $arr["session_id"];
                
                if($arr["expired"] == 1)  
                {
                    //error_log("Session Is Expried. Creating a new session ");
                    $this->session_id = $this->common->generate_and_save_session_to_db($arr["user"], $arr["mode"], $arr["section"], $arr["problem_name"]);
                    $json_array["session_id"] = $this->session_id;
                } 
                 
                // Set this session to expired
                $query = "UPDATE session SET expired=1 WHERE session_id='$this->session_id'";
                $this->common->connection->query($query) or trigger_error("insert/update to session failed" .$this->common->connection->error);
                
                header('Content-Type: application/json');     
                echo json_encode($json_array);
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
