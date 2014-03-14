<?php
require "common.php";
    
    session_start();
    
    $solution_manager = new SolutionManager;
    $solution_manager->process_request();
    /**
     * SolutionManager class to load and save author's solutions.
     * 
     * @author Ramayan Tiwari <rptiwari@asu.edu>
     */
    
    class SolutionManager
    {
        private $author;
        private $action;
        private $section;
        private $problem_name;
        private $solution_xml;
        private $share;
        private $common;
        
        public function __construct()
        {
            $this->common = new Common;
            
            $this->action = $_REQUEST['action'];
            $this->author = isset($_REQUEST['author']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['author']) : '';
            $this->section = isset($_REQUEST['section']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['section']) : '';
            $this->problem_name = isset($_REQUEST['problem_name']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['problem_name']) : '';
            $this->solution_xml = isset($_REQUEST['solution_xml']) ? mysqli_real_escape_string($this->common->connection, $_REQUEST['solution_xml']) : '';            
            $this->share = (!isset($_REQUEST['share']) || $_REQUEST['share']) ? 1 : 0;       
            
            // Save data needs to be URL decoded
            $this->solution_xml = urldecode($this->solution_xml); 
        }
        
        public function __destruct() {
            $this->common->connection->close();
        }
        
        public function process_request()
        {
            switch ($this->action) 
            {
                case "author_save" :
                    $this->save_author_solution_to_DB();
                    break;
                
                case "author_load" :
                    $this->load_author_solution_from_DB();
                    break;

                default:
                    //error_log("Unauthorized Request Recived ");
                    header('HTTP/1.0 401 Unauthorized');                     
            }
        }
        
        private function save_author_solution_to_DB()
        {
            $query = "INSERT INTO solutions(author, section, problemName, solutionGraph, share) 
                    VALUES ('$this->author','$this->section', '$this->problem_name', '$this->solution_xml', '$this->share') 
                    ON DUPLICATE KEY UPDATE solutionGraph=values(solutionGraph), time = CURRENT_TIMESTAMP";
            error_log("Executing " . $query);
            $this->common->connection->query($query) or trigger_error("insert/update to solutions failed" .$this->common->connection->error);            
        }
        
        private function load_author_solution_from_DB()
        {
            $queryString = "SELECT solutionGraph FROM solutions WHERE author=? AND section=? AND problemName=?";
           
            if ($stmt = mysqli_prepare($this->common->connection, $queryString)) {
                
                $stmt -> bind_param("sss", $this->author, $this->section, $this->problem_name);
                
                $stmt->execute() or trigger_error("select from solutions failed" .$this->common->connection->error);;
                $stmt->bind_result($save_data);
                $stmt->fetch();
                
                print($save_data);                
            }
        }
    }

?>
