<?php
include "logAnalysis.php";

Class ModelChanges{
	private static $sqlConnection;
	public $al;

	function __construct($con){
		ModelChanges::$sqlConnection = $con;
		$this->al = new AnalyzeLogs(ModelChanges::$sqlConnection);
	}

	function getProblemPairs(){
		$sqlQuery = "SELECT autosave_table.id, autosave_table.problemNum, autosave_table.section, unsolutions.problemName, unsolutions.author from autosave_table JOIN unsolutions on autosave_table.problemNum = unsolutions.problemName where autosave_table.id != unsolutions.author and autosave_table.section = 'SOS-326' and autosave_table.date > '2013-10-29' and unsolutions.date > '2013-10-29' order by author;";

		$problemPairs = $this->al->getResults($sqlQuery);

		echo "<table border='1'>\n";
		echo "<tr>\n<th>Author name</th>\n<th>Authored Problem</th>\n<th>Model testing URL</th>\n";
		echo "<th>Student Tester name</th>\n<th>Student Problem</th>\n<th>Model testing URL</th>\n</tr>\n";
	 	while($row = $problemPairs->fetch_assoc()){
	 		if(($this->al->checkBadUsers($row['id'])) || ($this->al->checkBadUsers($row['author']))){
	 			continue;
	 		}
	 		//$studentUserType = $this->al->checkBadUsers($row['id']);
	 		//$authorUserType = $this->al->checkBadUsers($row['author']);
	 		echo "<tr>\n";
	 		$authorURL = "http://dragoon.asu.edu/devel/startup.php?section=".$row['section']."&amp;problem_id=".$row['problemName']."&amp;mode=AUTHOR&amp;username=".$row['author'];
	 		$studentURL = "http://dragoon.asu.edu/devel/startup.php?section=".$row['section']."&amp;problem_id=".$row['problemNum']."&amp;mode=STUDENT&amp;username=".$row['id'];
	 		echo "<td>".$row['author']."</td>\n";
	 		echo "<td>".$row['problemName']."</td>\n";
	 		echo '<td><a href = "'.$authorURL.'">Final Authored model</a></td>';
	 		echo "<td>".$row['id']."</td>\n";
	 		echo "<td>".$row['problemName']."</td>\n";
	 		echo '<td><a href = "'.$studentURL.'">Student Tested model</a></td>';
	 		echo "</tr>\n";
	 	}
	 	echo "</table>\n";
	}
}
?>