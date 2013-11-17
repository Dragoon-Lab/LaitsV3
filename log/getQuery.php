<?php

//connect to database
require "db-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error ('Could not connect to database.' . $mysqli->error, E_USER_ERROR);

if ($_GET["query"] != null) {
    $query = $_GET["query"];
    $ignore = $_GET["ignore"];
    echo "Query results for \"" . $query . "\"<br/>";
    $currentURL = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";   
    echo $currentURL;

    $result = $mysqli->query($query) or die("The query failed. Error " . mysql_error());
    $colNum = $result->field_count;   
    $row = $result->num_rows;
    $rowNum = 1;
    $id2 = "";
    echo "<form method=\"POST\" action=\"".$currentURL."&ignore=".$ignore."\">";
    echo "<table cellpadding=5 border=1>";
    while ($row = mysqli_fetch_row($result)) {

        $id1 = htmlspecialchars($row[0]);
        

        for ($i = 0; $i < $colNum; $i++) {
            $col[$i] = htmlspecialchars($row[$i]);
        }

        if (strcmp($id1, $id2) != 0) {
            if ($rowNum !== 1) {
                echo "</table></div></td></tr>";
            }
            echo "<tr><td>" . $col[0] . "</td>";
            echo "<td width='800'><div style=\"width: 800px; height: 100px; overflow: auto\"><table border=1 cellpadding=5>";
        }
		
        echo "<tr>";
        for ($i = 1; $i < $colNum; $i++) {
            if($i==1) $width = "600px";
            else $width = "150px";
            $ignore = $col[$i];
            echo "<td width=\"".$width."\"><input type=\"submit\" class=\"button\" value=\"Hide\">".$col[$i]."</td>";
        }
        echo "</tr>";
        
        $id2 = $id1;
        $rowNum++;
        
    }
    echo "</table></div></td></tr></table>";
    echo "</form>";
} else {
    echo "No query received.";
}
?>

