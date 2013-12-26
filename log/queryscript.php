<?php
//file in progress to run queries on databases
//
//user only is allowed to use select queries

//connect to database
require "../www/db-research-login.php";

$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) 
        or trigger_error ('Could not connect to database.' . $mysqli->error, E_USER_ERROR);

if ($_POST["query"] != null || $_GET["query"] != null){
    if($_POST["query"] != null) {
        $query = str_replace('select', '', $query);
        $query = "select ".$_POST["query"];
    }
    
    if($_GET["query"] != null) {
        $query = $_GET["query"];
        $query = str_replace('select', '', $query);
        $query = "select".$query;
    }
    
    if($_POST["sort"] != null){
        $query .= " ORDER BY ".$_POST["sort"];
    }
    
    echo "Ignore: " .$_POST["ignore"];
    echo "<br/>";
    $ignore = $_POST["ignore"];
    echo "Query results for \"" . $query . "\"<br/>";
    $currentURL = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    echo $currentURL;

    $result = $mysqli->query($query) or die("The query failed. Error " . mysql_error());
    $colNum = $result->field_count;   
    $row = $result->num_rows;
    $rowNum = 1;
    $query .= "&".$ignore;
    $id2 = "";
        
    $counter = 0;
    
    echo "<form action=\"".$currentURL."?query=".$query."\" method=\"POST\" \">";
    echo "<table cellpadding=5 border=1>";
    while ($row = mysqli_fetch_row($result)) {
        $counter++;

        $id1 = htmlspecialchars($row[0]);
        

        for ($i = 0; $i < $colNum; $i++) {
            $col[$i] = htmlspecialchars($row[$i]);
        }

        if (strcmp($id1, $id2) != 0) {
            if ($rowNum !== 1) {
                echo "</table></div></td></tr>";
            }
            echo "<tr><td>" . $col[0] . "</td>";
            echo "<td width='1000'><div style=\"width: 1000px; height: 400px; overflow: auto\"><table border=1 cellpadding=5>";
        }
		
        echo "<tr>";
        for ($i = 1; $i < $colNum; $i++) {
            if($i==3) $width = "950px";
            else $width = "200px";
            $ignore = str_replace(' ', '%20', $col[$i]);
            //I am right here, trying to pass the a value to the $ignore variable
            echo "<td width=\"".$width."\"><input type=\"hidden\" name=\"ignore\" value=\"".$col[$i]."\"><input type=\"submit\" class=\"button\" value=\"Hide\">".$col[$i]."</td>";
        }
        echo "</tr>";
        
        $id2 = $id1;
        $rowNum++;
        
    }
    echo "</table></div></td></tr></table>";
    echo "</form>";
    echo "Number of rows: ".$counter;
} else {
    ?>
    <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
          Enter your SELECT query: SELECT
          <input type="text" size="100" name="query"/><br/><br/>
          Enter the sort criteria (the column name):
          <input type="text" size="15" name="sort"/><br/><br/>
          <input type="submit" class ="button" value="Run Query"/>
    </form>

    <?php
}
?>

