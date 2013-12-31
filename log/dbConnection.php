<html>
<body>
<?php
	require "../www/db-login.php";
	require "../www/error-handler.php";

	!empty($_REQUEST["section"])?($section[0] = $_REQUEST["section"]):($section = array("CPI-360", "SOS-326"));
	$student[0] = $_REQUEST["studentName"];
	$problem = $_REQUEST["problemName"];
	$fromDate = $_REQUEST["fromDate"];
	$toDate = $_REQUEST["toDate"];
	$tableName = $_REQUEST["db_table"];
	$functionality = $_REQUEST["logFunctionality"];
	!empty($_REQUEST["db_name"])?($dbname = $_REQUEST["db_name"]):'';
	!empty($_REQUEST["db_user"])?($dbuser = $_REQUEST["db_user"]):'';
	!empty($_REQUEST["db_name"])?($dbpassword = $_REQUEST["db_name"]):'';
	
	$mysqli = mysqli_connect("localhost", $dbuser, $dbpass, $dbname) or die("Connection not established. Error ->".$mysqli->error, E_USER_ERROR);
	
	$al = new AnalyzeLogs($mysqli);
	if($functionality === "class-problem"){
		$al->class_problem($section, $student, $problem, $fromDate, $toDate);
	} elseif($functionality === "check_logs"){
		$al->show_logs($table, $toDate, $fromDate, $dbname);
	} elseif($functionality === "Time-On-Task"){
		$al->solution_check($section, $student, $problem, $fromDate, $toDate);
	}
	
Class AnalyzeLogs{
	public $sqlConnection;
	private static $badUsers = array('bvds', 'reid', 'test', 'deepak', 'megha', 'ramayan', 'ram', 'tiwari', 'joiner');
	private static $goldenRatio = 0.6;//ratio of (number of times give up pressed)/(total number of solution checks)
	private static $minimumTime = 10; //minimum problem time, usually the time has to be greater than this to be considered. if a problem is done in less than this time then we do not check all the action times.
	private static $actionTime = 7; //time greater than this then student is not working on the problem.
	private static $problemLoadTime = 1; //used for multiple loading times of a problem.
	
	function checkBadUsers($user){
		$bad = AnalyzeLogs::$badUsers;
		for($i = 0; $i<sizeof($bad); $i++){
			if(stripos($user, $bad[$i]) !== false){
				return false;
			}
		}
		return true;
	}
	function __construct($con){
		$this->sqlConnection = $con;
	}
	
	function getProblems($userName, $startTime, $endTime){
		$queryString = "SELECT DISTINCT problemNum from autosave_table WHERE id = '".$userName."'".(!empty($startTime)?"AND date >= '".$startTime."'":"").(!empty($endTime)?"AND date <= '".$endTime."'":"").";";
		$userProblems = $this->getResults($queryString);
		return $userProblems;
		/*add show results*/
	}
	
	function getUserProblemTime($student, $problem){
		date_default_timezone_set('America/Phoenix');
		$newDate = Date("Y-m-d");
		$problemTime = array();
		$studentString = " AND USER_ID = '".$student."'";
		$problemString = " AND MESSAGE LIKE '%".$problem."%'";
		$queryStartString = "SELECT USER_ID, DATED, Message from dev_logs where (MESSAGE LIKE '%Task URL%' OR MESSAGE LIKE '%author_load%')".(!empty($problem)?$problemString:"").(!empty($student)?$studentString:" ORDER BY USER_ID asc, DATED asc;");
		$problemStartResults = $this->getResults($queryStartString);
		
		$numRows = mysqli_num_rows($problemStartResults);
		if($numRows > 1){
			$oldDate = Date("Y-m-d H:m:s");
			$index = 0;
			$timeIndex = 0;
			$problemLoad = AnalyzeLogs::$problemLoadTime;
			
			// this means that problem was started and saved multiple times.
			while($row = $problemStartResults->fetch_assoc()){
				if($index == 0){
					// for first row we can not have a old time and a new time. so when then value goes to one that is when the fun starts.
					$oldDate = $row['DATED'];
					$oldTimeStamp = strtotime($oldDate);
					$index++;
					continue;
				} 
				$newDate = $row['DATED'];
				$newTimeStamp = strtotime($newDate);
				$difference = abs($newTimeStamp - $oldTimeStamp)/60; //difference in minutes, this is the difference in the multiple start times that we have.
				
				//if the problem has been loaded multiple times in less than 1 minute then we take the last load time to be the session start time.
				if($difference>$problemLoad){
					$endIndex = 0;
					$startTime = $oldDate;
					$queryEndString = "SELECT USER_ID, DATED, Message from dev_logs where (MESSAGE LIKE '%Successfully Written%' OR MESSAGE LIKE '%Post Variables Sending%') ".(!empty($problem)?$problemString:"").(!empty($student)?$studentString:"")." AND DATED <= '".$newDate."' ORDER BY USER_ID, DATED desc LIMIT 1;";
					$endResult = $this->getResults($queryEndString);
					
					$endRow = $endResult->fetch_assoc();
					$endTime = $endRow['DATED'];
					
					$newData = array('startTime' => $startTime, 'endTime' => $endTime);
					array_push($problemTime, $newData);
					$timeIndex = $timeIndex+1;
				} 
				$oldDate = $newDate;
				$oldTimeStamp = $newTimeStamp;			
			}
		}
		//setting the ending time of the last session
		if($numRows == 1){
			$row = $problemStartResults->fetch_assoc();
			$newDate = $row['DATED'];
		}
		
		$queryEndString = "SELECT USER_ID, DATED, Message from dev_logs where (MESSAGE LIKE '%Successfully Written%' OR MESSAGE LIKE '%Post Variables Sending%') ".(!empty($problem)?$problemString:"").(!empty($student)?$studentString:"")." AND DATED >= '".$newDate."' ORDER BY USER_ID, DATED desc LIMIT 1;";
		
		$endResult = $this->getResults($queryEndString);
		
		$endRow = $endResult->fetch_assoc();
		$endTime = $endRow['DATED'];
		
		$newData = array('startTime' => $newDate, 'endTime' => $endTime);
		if($endTime != null || !empty($endTime))
			array_push($problemTime, $newData);
		
		return $problemTime;
	}
	
	function getClassStudents($className){
		if(!empty($className)){
			$queryString = "SELECT DISTINCT id from autosave_table where section = '".$className."';";
			$result = $this->getResults($queryString);
			$index = 0;
			$goodUser = array();
			while($student = $result->fetch_assoc()){
				if(!empty($student['id']) && $this->checkBadUsers($student['id'])){
					$goodUser[$index] = $student['id'];
					$index++;
				}
			}
			return $goodUser;
		} else {
			return null;
		}
	}
	
	function getResults($query){
		$result = mysqli_query($this->sqlConnection, $query);
		return $result;
	}
	
	function problem_analysis($user, $problem){
		$problemTime = $this->getUserProblemTime($user, $problem);
		$sizeTime = sizeof($problemTime);
		$totalGiveUpCount = 0;
		$totalCheckCount = 0;
		$totalTime = 0;
		//$problemLoad = AnalyzeLogs::$problemLoadTime;
		$minActionTime = AnalyzeLogs::$actionTime;
		$minProblemTime = AnalyzeLogs::$minimumTime;
		$ratioGiveUpAllowed = AnalyzeLogs::$goldenRatio;
		
		for($i = 0; $i<$sizeTime ; $i++){
			$giveUpCountQuery = "SELECT COUNT(*) from activity_logs where USER_ID = '".$user."' AND MESSAGE LIKE '%Giveup%' AND DATED >='".$problemTime[$i]['startTime']."' AND DATED <= '".$problemTime[$i]['endTime']."';";
			$result = $this->getResults($giveUpCountQuery);
			$row = mysqli_fetch_assoc($result);
			
			$count = $row['COUNT(*)'];
			$totalGiveUpCount = $totalGiveUpCount + $count;
			
			$checkSolutionQuery = "SELECT COUNT(*) from activity_logs where USER_ID = '".$user."' AND MESSAGE LIKE '%Check button%' AND DATED >='".$problemTime[$i]['startTime']."' AND DATED <= '".$problemTime[$i]['endTime']."';";
			$check_result = $this->getResults($checkSolutionQuery);
			$check_row = $check_result->fetch_assoc();
			$check_count = $check_row['COUNT(*)'];
			$totalCheckCount = $totalCheckCount + $check_count;			
					
			$startTimeStamp = strtotime($problemTime[$i]['startTime']);
			$endTimeStamp = strtotime($problemTime[$i]['endTime']);
			
			$timeDifference = abs($endTimeStamp - $startTimeStamp)/60;//these are the minutes for which a session is running
			//time Analysis for the problem time
			//if the session time is greater than 10 minutes then we check for all the actions if the log difference is greater than min action time
			if($timeDifference > $minProblemTime){
				$actionString = "SELECT * FROM dev_logs where USER_ID = '".$user."' AND DATED >='".$problemTime[$i]['startTime']."' AND DATED <= '".$problemTime[$i]['endTime']."';";
				$actions = $this->getResults($actionString);
				$index = 0;
				
				while($actionRow = $actions->fetch_assoc()){
					if($index == 0){
						$oldTime = strtotime($actionRow['DATED']);
						$index++;
						$newTime = $oldTime;
						continue;
					} else {
						$oldTime = $newTime;
					}
					$newTime = strtoTime($actionRow['DATED']);
					
					$timeDiff = abs($newTime-$oldTime)/60;//minutes difference between two consecutive action during the session.
					
					//checking if the system is idle for more than 5/7 minute. Value kept at the start of the class.
					if($timeDiff < $minActionTime){
						$totalTime = $totalTime + $timeDiff;
					}
					$index++;
				}
			} else {
				$totalTime = $timeDifference+$totalTime;
			}
		}
		$gaming_system = false;
		if($totalCheckCount !=0 && $totalGiveUpCount != 0){
			$gaming_system = (($totalGivUpCount*100)/($totalCheckCount + $totalGiveUpCount));
		} else {
			$gaming_system = 'N/A'
		}
		
		$userProblemAnalysis = array('user' => $user, 'problem' => $problem, 'totalTime' => $totalTime, 'giveUpCount' => $totalGiveUpCount, 'totalCheckCount' => $totalCheckCount, 'gamingTheSystem' => $gaming_system);
		
		return $userProblemAnalysis;
	}
	
	function solution_check($section, $students, $problemName, $startTime, $endTime){
		//this means that data has to be analysed for the whole class
		if(empty($students) || $students == null){
			for($i=0; $i<sizeof($section); $i++){
				$studentArray = $this->getClassStudents($section[$i]);
				$this->print_solution_check($studentArray, $startTime, $endTime);
			}
		} else {
			$this->print_solution_check($students, $startTime, $endTime);
		}
	}
	
	function print_solution_check($userArray, $startTime, $endTime){
		foreach($userArray as $user){
			$problems = $this->getProblems($user, $startTime, $endTime);
			echo "<p style='font-weight:bold;'>".$user."</p><br/>\n";
			echo "<table border = '1'>\n";
			echo "<tr>\n";
			echo "<th>Problem Name</th>\n";
			echo "<th>Total Time (in minutes)</th>\n";
			echo "<th>Number of Time Give Up Pressed</th>\n";
			echo "<th>Check button pressed</th>\n";
			echo "<th>% of Give Up button pressed</th>\n";
			echo "</tr>\n";
			while($problem = $problems->fetch_assoc()){
				echo "<tr>\n";
				echo "<td>".$problem['problemNum']."</td>\n";
				$userProblemAnalysis = $this->problem_analysis($user, $problem['problemNum']);
				
				echo "<td>".$userProblemAnalysis['totalTime']."</td>\n";
				echo "<td>".$userProblemAnalysis['giveUpCount']."</td>\n";
				echo "<td>".$userProblemAnalysis['totalCheckCount']."</td>\n";
				echo "<td>".$userProblemAnalysis['gamingTheSystem']."</td>\n";
				echo "</tr>\n";
			}
			echo "</table>\n";
		}		
	}
	
	function class_problem($section, $problemName, $fromDate, $toDate){
		//author mode queries
		$startDate = $fromDate;
		$endDate = $toDate;
		if(empty($fromDate)){
			$startDate = '2013-11-06 15:00:00.000000';
			if(empty($toDate)){
				$endDate = '2013-11-06 16:30:00.000000';
			}
		}
		for($i = 0 ; $i < sizeof($section); $i++){
			$endDateString = " AND date <= '".$endDate."'";
			$authorStatusQuery = "Select author, problemName, date from unsolutions where date >= '".$startDate."'".(!empty($endDate)?$endDateString:"")." AND section='".$section[$i]."' Order By author asc;";
			$authorResult = $this->getResults($authorStatusQuery);

			//creating a table from the results
			echo "Author Mode Problems\n";
			if($authorResult != null){
				echo "<table border='1'>\n";
				$oldName = " ";
				while($author = $authorResult->fetch_assoc()){
					$newName = $author['author'];
					$jnlpAuthorURL = "http://dragoon.asu.edu/devel/startup.php?section=".$section[$i]."&amp;problem_id=".$author['problemName']."&amp;mode=AUTHOR&amp;username=".$newName;
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
				echo "</table>\n";
			}
			echo "<br /><br />\n";
			//student mode queries
			$studentStatusQuery = "Select id, problemNum, date from autosave_table where date >= '".$startDate."'".(!empty($endDate)?$endDateString:"")." AND section='".$section[$i]."' Order By id asc;";
			$studentResult =  $this->getResults($studentStatusQuery);
			
			//creating a table from the results
			echo "Student Mode Problems";
			if(!empty($studentResult)){
				echo '<table border="1">\n';
				$oldStudentName = " ";
				while($student = $studentResult->fetch_assoc()){
					$newStudentName = $student['id'];
					$problemNumber = $student['problemNum'];
					$jnlpStudentURL = "http://dragoon.asu.edu/devel/startup.php?section=".$section[$i]."&amp;problem_id=".$problemNumber."&amp;mode=STUDENT&amp;username=".$newStudentName;
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
				echo "</table>\n";
			} else {
				echo "NO Results found between - Date ".$startDate." AND ".$endDate;
			}
		}
	}
	
	function checkLogs($table, $toDate, $fromDate, $dbname){
		date_default_timezone_set('America/Phoenix');
		$table = !empty($table)?$table:"dev_logs";
		$startDate = !empty($fromDate)?$fromDate: Date('Y-m-d', strtotime('-7 days'));
		if($table != 'tasks'){
			$colQuery = "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '".$dbname."' AND TABLE_NAME = '".$table."' AND DATA_TYPE = 'timestamp' OR DATA_TYPE = 'datetime';";
			$colName = $this->{getResults($colQuery)};
			
			$toDateString = 'AND '.$colName.' <="'.$toDate.'"';
			$queryString = "SELECT * from ".$table." Where ".$colName." >= '".$fromDate."' ".!empty($toDate)?$toDateString:"".";";
		} else {
			$queryString = "SELECT * from ".$table.";";
		}
		$result = $this->{getResults($queryString)};
		
		$columnsQuery = "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = '".$dbname."' AND TABLE_NAME = '".$table."';";
		$columns = $this->{getResults($columnsQuery)};
		
		if($result != null){
			echo '<table border="1">\n';
			echo '<tr>\n';
			while($columnName = $columns->fetch_assoc()){
				echo '<th>'.$columnName['COLUMN_NAME'].'</th>\n';
			}
			echo '</tr>\n';
			
			while($row = $result->fetch_assoc()){
				echo " <tr>\n";
				while($columnName = $columns->fetch_assoc()){
					echo "<td>".$row[$columnName['COLUMN_NAME']]."</td>\n";
				}
				echo "</tr>\n";
			}
			echo "</table>\n";
		} else {
			echo "no records found for the Date and Table specified. Please check and change the values entered.";
		}
	}
}
?>
</body>
</html>