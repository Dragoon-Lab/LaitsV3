<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Homework problems for CPI 360</title>
</head>
<body>
<?php
	require "../www/db-login.php";
	require "../www/error-handler.php";
	$mysqli=mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or trigger_error('Could not connect to database.' . $mysqli->error, E_USER_ERROR);



	//author mode queries
	$authorStatusQuery = "Select author, problemName, date from unsolutions where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By author asc;";
	$authorResult = $mysqli->query($authorStatusQuery);
	$numRows = $authorResult->num_rows;
	//creating a table from the results
	echo "Author Mode Problems\n";
	echo "<table border='1'>\n";
	if($authorResult != null){
		$oldName = " ";
		while($author = $authorResult->fetch_assoc()){
			$newName = $author['author'];
			$jnlpAuthorURL = "http://dragoon.asu.edu/devel/startup.php?section=cpi-360&amp;problem_id=".$author['problemName']."&amp;mode=AUTHOR&amp;username=".$newName;
			echo "  <tr>";
				if($newName == $oldName){
					echo "<td></td>";
				} else {
					echo "<td>".$newName."</td>";
				}
				echo "<td>".$author['problemName']."</td>";
				echo "<td><a href=\"$jnlpAuthorURL\">\n    $jnlpAuthorURL</a></td>";
			echo "</tr>\n";
		}
	}
	echo "</table>\n";
echo "<br /><br />\n";
	//student mode queries
	$studentStatusQuery = "Select id, problemNum, date from autosave_table where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By id asc;";
	$studentResult =  $mysqli->query($studentStatusQuery);
	
	//creating a table from the results
	echo "Student Mode Problems\n";
	echo '<table border="1">\n';
	if($studentResult != null){
		$oldStudentName = " ";
		while($student = $studentResult->fetch_assoc()){
			$newStudentName = $student['id'];
			$problemNumber = $student['problemNum'];
			$jnlpStudentURL = "http://dragoon.asu.edu/devel/startup.php?section=cpi-360&amp;problem_id=".$problemNumber."&amp;mode=STUDENT&amp;username=".$newStudentName;
			echo "  <tr>";
				if($newStudentName == $oldStudentName){
					echo "<td> </td>";
				} else {
					echo "<td>".$newStudentName."</td>";
				}
				echo "<td>".$student['problemNum']."</td>";
				echo "<td><a href=\"$jnlpStudentURL\">\n    $jnlpStudentURL</a></td>";
			echo "</tr>\n";
		}
	}
	echo "</table>\n";
	mysqli_close($mysqli);
?>
</body>
</html>
