<?php
    session_start();

    require "db-login.php";
    require "error-handler.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
      or trigger_error('Could not connect to database.' . $mysqli->error,
		       E_USER_ERROR);

    //retrieve POST variables
    $action = mysqli_real_escape_string($mysqli, $_POST['action']);
    $userid = mysqli_real_escape_string($mysqli, $_POST['id']);
    $section = mysqli_real_escape_string($mysqli, $_POST['section']);
    // Needed to identify problem for student mode work on custom problems
    // Do not include for author mode work or for published problems.
    $author = isset($_POST['author'])?
      mysqli_real_escape_string($mysqli, $_POST['author']):'';
    $problemName = mysqli_real_escape_string($mysqli, $_POST['problem']);
    $saveData = $_POST['saveData'];
    
    error_log("action: $action | userid: $userid | section: $section | problem: $problem | author: $author | ");

    if (strcmp($action, "save") == 0) {

        saveGraphXMLtoDatabase($id,$section,$problemName,$saveData,$mysqli);
    } elseif(strcmp($action, "author_save") == 0) {
      	saveAuthorGraphXMLtoDatabase($author,$section,$problemName,$saveData,$mysqli);
    } elseif (strcmp($action, "load") == 0) {
        print loadGraphXMLfromDatabase($id,$section,$problemName,$mysqli);
//  This should be removed.  See Bug #2222
    } elseif(strcmp($action, "author_load") == 0){
        // For author_load check if the problem directory contains a defined problem
        $result = loadGraphXMLfromDatabase($id,$section,$problemName,$mysqli);
        if($result === "")
            print loadSolutionFileFromServer($problemName);
        else
            print $result;
    } else {
        print "Unable to process request.";
    }


    function saveGraphXMLtoDatabase($id,$section,$problemName,$saveData,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemName'";
        $result = $mysqli->query($queryString);
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $query = "INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemName','$saveData')";
            $mysqli->query($query)
	      or trigger_error("insert into autosave_table failed" . 
			       $mysqli->error);
        } else {
            $queryString = "UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemName'";
            $mysqli->query($queryString)
	      or trigger_error("update autosave_table failed" . 
			       $mysqli->error);
        }
    }
    
	function saveAuthorGraphXMLtoDatabase($author,$section,$problemName,$saveData,$mysqli){
        $queryString = "SELECT saveData FROM unsolutions WHERE section='$section' AND problemName='$problemName' AND author='$author'";
        $result = $mysqli->query($queryString);
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $queryString = "INSERT INTO unsolutions(author,section,problemName,saveData) VALUES ('$author','$section','$problemName','$saveData')";
            $mysqli->query($queryString);
        } else {
            $queryString = "UPDATE unsolutions SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE section='$section' AND problemName='$problem' AND author='$author'";
            $mysqli->query($queryString);
        }
    }
    
    function loadGraphXMLfromDatabase($id,$section,$problemName,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemName'";
        $result = $mysqli->query($queryString)
	  or trigger_error("select from autosave_table failed" . 
			   $mysqli->error);
        $returnString = "";
        $num_rows = $result->num_rows;

        if ($num_rows == 1) {
            while ($row = $result->fetch_row()) {
                //printf("%s", $row[0]);
                $returnString .= $row[0];
            }
        }
        return $returnString;
    }
    
        function loadAuthorGraphXMLfromDatabase($author,$section,$problem,$mysqli){
        $queryString = "SELECT saveData FROM unsolutions WHERE author='$author' AND section='$section' AND problemName='$problem'";
        $result = $mysqli->query($queryString);
        $returnString = "";
        $num_rows = $result->num_rows;

        if ($num_rows == 1) {
            while ($row = $result->fetch_row()) {
                //printf("%s", $row[0]);
                $returnString .= $row[0];
            }
        }
        return $returnString;
    }

//  This should be removed.  See Bug #2222
//  Also, task_fetcher.php shows how to properly do a redirect.

    function loadSolutionFileFromServer($problemName){
        $host  = $_SERVER['HTTP_HOST'];
        $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
        $relativeURL = 'problems/' . $problemName . '.xml';
        
        $location = "http://$host$uri/$relativeURL";
        
        $response_xml_data = "";
        if (($response_xml_data = file_get_contents($location)) === false){
            return "";
        }
        else {
            return $response_xml_data;
        }
    }
?>
