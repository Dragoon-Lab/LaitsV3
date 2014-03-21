<?php
    require "common.php";
    
    $app_loader = new Startup;
    $app_loader->start_app();
    
    /**
     * Class to encapsulate all the startup checks.
     * TODO: Send appropriate error headers in case of failure. 
     * Improve error handling.
     * @author Ramayan Tiwari <rptiwari@asu.edu>
     */
    class Startup {
        private $username;
        private $mode;
        private $section;
        private $problem_name;
        private $author; // TODO
        private $hostURL;
        private $forumURL;
        private $common;
        
        // Constants to represent HTML login form params
        const USER_NAME_PARAM = "username";
        const MODE_PARAM = "mode";
        const SECTION_PARAM = "section";
        const PROBLEM_NAME_PARAM = "problem_id";    
        const AUTHOR_PARAM = "author";
        const DEFAULT_FORUM = "http://dragoon.asu.edu/forum/viewtopic.phpq";
         
        public function __construct() 
        {
            $this->common =  new Common;
        }
        
        public function start_app()
        {
            if($this->validate_request_param())
            {
                if($this->validate_param_value())
                {
                    $URI = $_SERVER['REQUEST_URI'];
                    $this->hostURL = "http://" . $_SERVER['SERVER_NAME'] . 
                    substr($URI, 0, strrpos($URI,'/') + 1);
            
                    $this->forumURL = isset($_REQUEST['forumurl']) ? $_REQUEST['forumurl'] : self::DEFAULT_FORUM;
                    $session_id = $this->common->generate_and_save_session_to_db($this->username, $this->mode, $this->section, $this->problem_name,$this->author);
                    $this->send_jnlp_response($session_id);
                }
                else
                {
                    error_log("Startup request is invalid. ");
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
            if(isset($_REQUEST[self::USER_NAME_PARAM]) &&
                    isset($_REQUEST[self::MODE_PARAM]) && 
                    isset($_REQUEST[self::SECTION_PARAM]) && 
                    isset($_REQUEST[self::PROBLEM_NAME_PARAM])) {
               
                // Initialize Variables
                $this->username = mysqli_real_escape_string($this->common->connection, $_REQUEST[self::USER_NAME_PARAM]);
                $this->mode = mysqli_real_escape_string($this->common->connection, $_REQUEST[self::MODE_PARAM]);
                $this->section = mysqli_real_escape_string($this->common->connection, $_REQUEST[self::SECTION_PARAM]);
                $this->problem_name = mysqli_real_escape_string($this->common->connection, $_REQUEST[self::PROBLEM_NAME_PARAM]);
                $this->author = mysqli_real_escape_string($this->common->connection, $_REQUEST[self::AUTHOR_PARAM]);
                // Mode will always be treated in uppercase
                $this->mode = strtoupper($this->mode);
                return true;
            } 
            return false;
        }
        
        // Server side validation of user params
        private function validate_param_value()
        {
            if(strlen($this->username) <= 30 && $this->is_valid_mode($this->mode) &&
                    strlen($this->section) <= 30 && strlen($this->problem_name) <= 30) {
                return true;
            }
            return false;            
        }
        
        // Check if user supplied a valid mode
        private function is_valid_mode($mode) 
        {    
            if(strcasecmp($mode, "STUDENT") == 0 || strcasecmp($mode, "AUTHOR") == 0 ||
               strcasecmp($mode, "TEST") == 0 ||strcasecmp($mode, "COACHED") == 0) {
                return true;
            }
            return false;        
        }
        
        private function generate_jnlp_source($session_id) 
        {
            $uri = $_SERVER['REQUEST_URI'];
            $codebase = "http://" . $_SERVER['SERVER_NAME'] . substr($uri,0,strrpos($uri,'/')+1);
            
            
            $jnlp_source =  "<?xml version='1.0' encoding='UTF-8'?>" . 
                    "<jnlp codebase=\"$codebase\" spec=\"1.0+\">"
                    ."<information><title>Dragoon</title><vendor>Arizona State University</vendor>"
                    ."<homepage href=\"dragoon.asu.edu\"/><description>Dragoon is a System Dynamics Modeling tool developed at the Arizona State University Computer Science department.</description>
                        <description kind=\"short\">Dragoon</description></information><update check=\"always\"/>
                        <security><all-permissions/></security><resources><j2se version=\"1.6+\"/><jar href=\"Laits.jar\" main=\"true\"/>" ;
            
                        foreach (glob("lib/*.jar") as $filename){
                            $jnlp_source .= "        <jar href=\"".$filename."\"/>";
                        }
         
            $jnlp_source .= "        <property name=\"jnlp.session_id\" value=\"$session_id\"/>";    
            $jnlp_source .= "        <property name=\"jnlp.host_url\" value=\"$this->hostURL\"/>";    
            $jnlp_source .= "        <property name=\"jnlp.forum_url\" value=\"$this->forumURL\"/>";    
            
            $jnlp_source .= "</resources><application-desc main-class=\"edu.asu.laits.gui.Application\"/></jnlp>";
            
            // Pretty print JNLP source file
            $doc = new DOMDocument();
            $doc->preserveWhiteSpace = false;
            $doc->loadXML($jnlp_source);
            $doc->formatOutput = true;
            $xml_string = $doc->saveXML();
              
            return $xml_string;
        }
        
        // Send genrated JNLP with correct headers
        private function send_jnlp_response($session_id) {
            header("Content-Disposition: attachment; filename=\"dragoon.jnlp\"");
            header('Content-type: application/x-java-jnlp-file');
            
            echo $this->generate_jnlp_source($session_id);
        }
    }