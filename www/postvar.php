<?php
    session_start();

    require "db-login.php";

    //connect to database
    $mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname)
            or die('Could not connect to database.');

    //retrieve POST variables
    $action = mysqli_real_escape_string($mysqli, $_POST['action']);
    $id = mysqli_real_escape_string($mysqli, $_POST['id']);
    $section = mysqli_real_escape_string($mysqli, $_POST['section']);
    $problemNum = mysqli_real_escape_string($mysqli, $_POST['problem']);
    $saveData = $_POST['saveData'];

    if (strcmp($action, "save") == 0) {
        saveGraphXMLtoDatabase($id,$section,$problemNum,$saveData,$mysqli);
    } elseif (strcmp($action, "load") == 0) {
        print loadGraphXMLfromDatabase($id,$section,$problemNum,$mysqli);
//  This should be removed.  See Bug #2222
    } elseif(strcmp($action, "author_load") == 0){
        // For author_load check if the problem directory contains a defined problem
        $result = loadGraphXMLfromDatabase($id,$section,$problemNum,$mysqli);
        if($result === "")
            print loadSolutionFileFromServer($problemNum);
        else
            print $result;
    } else {
        print "Unable to process request.";
    }

    function saveGraphXMLtoDatabase($id,$section,$problemNum,$saveData,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'";
        $result = $mysqli->query($queryString);
        $num_rows = $result->num_rows;

        if ($num_rows == 0) {
            $queryString = "INSERT INTO autosave_table(id,section,problemNum,saveData) VALUES ('$id','$section','$problemNum','$saveData')";
            $mysqli->query($queryString);
        } else {
            $queryString = "UPDATE autosave_table SET saveData='$saveData', date = CURRENT_TIMESTAMP WHERE id='$id' AND section='$section' AND problemNum='$problemNum'";
            $mysqli->query($queryString);
        }
    }
    
    function loadGraphXMLfromDatabase($id,$section,$problemNum,$mysqli){
        $queryString = "SELECT saveData FROM autosave_table WHERE id='$id' AND section='$section' AND problemNum='$problemNum'";
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
    function loadSolutionFileFromServer($problemNum){
        $host  = $_SERVER['HTTP_HOST'];
        $uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
        $relativeURL = 'problems/' . $problemNum . '.xml';
        
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
