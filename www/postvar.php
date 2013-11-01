<?php
    session_start();

    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or die('Could not connect to database.');

    //retrieve POST variables
    $action = mysqli_real_escape_string($mysqli, $_POST['action']);
    $userid = mysqli_real_escape_string($mysqli, $_POST['id']);
    $section = mysqli_real_escape_string($mysqli, $_POST['section']);
    $problem = mysqli_real_escape_string($mysqli, $_POST['problem']);
    $author = mysqli_real_escape_string($mysqli, $_POST['author']);
    $saveData = $_POST['saveData'];
    
    error_log("action: $action | userid: $userid | section: $section | problem: $problem | author: $author | ");

    if (strcmp($action, "save") == 0) {
        saveGraphXMLtoDatabase($userid,$section,$problem,$saveData,$mysqli);
    } elseif(strcmp($action, "author_save") == 0) {
        saveAuthorGraphXMLtoDatabase($author,$section,$problem,$saveData,$mysqli);
    } elseif (strcmp($action, "load") == 0) {
        print loadGraphXMLfromDatabase($userid,$section,$problem,$mysqli);
//  This should be removed.  See Bug #2222
    } elseif(strcmp($action, "author_load") == 0){
        // For author_load check if the problem directory contains a defined problem
        $result = loadAuthorGraphXMLfromDatabase($author,$section,$problem,$mysqli);
        if($result === "")
            print loadSolutionFileFromServer($problem);
        else
            print $result;
    } else {
        print "Unable to process request.";
    }

    function saveGraphXMLtoDatabase($userid,$section,$problem,$saveData,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$userid' AND section='$section' AND problemNum='$problem'";
        $result = $mysqli->query($queryString);
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $queryString = "INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$userid','$section','$problem','$saveData')";
            $mysqli->query($queryString);
        } else {
            $queryString = "UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$userid' AND section='$section' AND problemNum='$problem'";
            $mysqli->query($queryString);
        }
    }
    function saveAuthorGraphXMLtoDatabase($author,$section,$problem,$saveData,$mysqli){
        $queryString = "SELECT saveData FROM unsolutions WHERE section='$section' AND problemName='$problem' AND author='$author'";
        $result = $mysqli->query($queryString);
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $queryString = "INSERT INTO unsolutions(author,section,problemName,saveData) VALUES ('$author','$section','$problem','$saveData')";
            $mysqli->query($queryString);
        } else {
            $queryString = "UPDATE unsolutions SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE section='$section' AND problemName='$problem' AND author='$author'";
            $mysqli->query($queryString);
        }
    }
    
    function loadGraphXMLfromDatabase($userid,$section,$problem,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$userid' AND section='$section' AND problemNum='$problem'";
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
    function loadSolutionFileFromServer($problem){
        $host  = $_SERVER['HTTP_HOST'];
        $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
        $relativeURL = 'problems/' . $problem . '.xml';
        
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
