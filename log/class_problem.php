<html>
<body>
<?php
	require "../db-login.php";
	$mysqli=mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or die("Connection not established. Check the user log file");	

	//author mode queries
	$authorStatusQuery = "Select author, problemName, date from unsolutions where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By author asc;";
	$authorResult = $mysqli->query($authorStatusQuery);
	
	//creating a table from the results
	echo "Author Mode Problems";
	echo "<table border='1'>";
	if($authorResult != null){
		$oldName = " ";
		foreach($authorResult as $author){
			$newName = $author['author'];
			$jnlpAuthorURL = "http://dragoon.asu.edu/demo/startup.php?section=cpi-360&problem_id=".$author['problemName']."&mode=AUTHOR&username=".$newName;;
			echo "<tr>";
				if($newName == $oldName){
					echo "<td> </td>";
				} else {
					echo "<td>".$newName."</td>";
				}
				echo "<td>".$author['problemName']."</td>";
				echo "<td><a href=".$jnlpAuthorURL.">".$jnlpAuthorURL."</a></td>";
			echo "</tr>";
		}
	}
	echo "</table>";
	echo "<br/><br/>"
	//student mode queries
	$studentStatusQuery = "Select id, problemNum, date from autosave_table where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By id asc;";
	$studentResult =  $mysqli->query($studentStatusQuery);
	
	//creating a table from the results
	echo "Student Mode Problems";
	echo '<table border="1">';
	if($studentResult != null){
		$oldStudentName = " ";
		foreach($studentResult as $student){
			$newStudentName = $student['id'];
			$problemNumber = $student['problemNum'];
			$jnlpStudentURL = "http://dragoon.asu.edu/demo/startup.php?section=cpi-360&problem_id=".$problemNumber."&mode=STUDENT&username=".$newStudentName;
			echo "<tr>";
				if($newStudentName == $oldStudentName){
					echo "<td> </td>";
				} else {
					echo "<td>".$newStudentName."</td>";
				}
				echo "<td>".$student['problemNum']."</td>";
				echo "<td><a href='".$jnlpStudentURL."'>".$jnlpStudentURL."</a></td>";
			echo "</tr>";
		}
	}
	echo "</table>";
	mysqli_close($mysqli);
?>
</body>
</html>