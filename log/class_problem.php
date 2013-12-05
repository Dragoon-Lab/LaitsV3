<html>
<body>
<?php
	require "../db-login.php";
	var $con=mysqli_connect("localhost", $dbuser, $dbpass, $dbname);	
	
	if(mysqli_connect_errno()){
		echo "Connection Failed, error : " . mysqli_connect_errno();
	} else {
		//author mode queries
		var $authorStatusQuery = "Select author, problemName, date from unsolutions where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By author asc;";
		$authorResult = mysqli_query($con, $authorStatusQuery);
		
		//creating a table from the results
		echo "Author Mode Problems";
		echo "<table border='1'>"
		if($authorResult != null){
			var $oldName = " ";
			foreach($authorResult as $author){
				var $newName = $author['author'];
				var $jnlpAuthorURL = "http://dragoon.asu.edu/demo/startup.php?section=cpi-360&problem_id="+$author['problemName']+"&mode=AUTHOR&username="+$newStudentName;;
				echo "<tr>";
					if($newName == $oldName){
						echo "<td> </td>";
					} else {
						echo "<td>"+$newName+"</td>";
					}
					echo "<td>"+$author['problemName']+"</td>";
					echo "<td>"+$jnlpAuthorURL+"</td>";
				echo "</tr>";
			}
		}
		echo "</table>";
		
		//student mode queries
		var $studentStatusQuery = "Select id, problemNum, date from autosave_table where date >= '2013-11-06 15:00:00.000000' AND date <= '2013-11-06 16:30:00.000000' AND section='cpi-360' Order By id asc;";
		var $studentResult =  mysqli_query($con, $studentStatusQuery);
		
		//creating a table from the results
		echo "Student Mode Problems"
		echo "<table border='1'>";
		if($studentResult != null){
			$oldStudentName = " ";
			foreach($studentResult as $student){
				var $jnlpStudentURL = "http://dragoon.asu.edu/demo/startup.php?section=cpi-360&problem_id="+$student['problemNum']+"&mode=STUDENT&username="+$newStudentName;
				var $newStudentName = $student['id'];
				echo "<tr>";
					if($newStudentName == $oldStudentName){
						echo "<td> </td>";
					} else {
						echo "<td>"+$newStudentName+"</td>";
					}
					echo "<td>"+$author['problemNum']+"</td>";
					echo "<td>"+$jnlpStudentURL+"</td>";
				echo "</tr>";
			}
		}
		echo "</table>";
	}
	mysqli_close($con);
?>
</body>
</html>