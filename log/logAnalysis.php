<?php
Class AnalyzeLogs{
	public $sqlConnection;
	private static $badUsers = array('bvds', 'reid', 'test', 'deepak', 'megha', 'ramayan', 'ram', 'tiwari', 'joiner');
	private static $goldenRatio = 0.6;//ratio of (number of times give up pressed)/(total number of solution checks)
	private static $minimumTime = 600; //minimum problem time, usually the time has to be greater than this to be considered. if a problem is done in less than this time then we do not check all the action times.
	private static $actionTime = 420; //time in seconds greater than this then student is not working on the problem.
	private static $problemLoadTime = 1; //used for multiple loading times of a problem.
	private static $tabReadingTime = 7; //minimum time to decide whether the tab was completely read or thought of properly
	
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
			
			$timeDifference = abs($endTimeStamp - $startTimeStamp);//these are the minutes for which a session is running
			
			//time Analysis for the problem time
			//if the session time is greater than 10 minutes then we check for all the actions if the log difference is greater than min action time
			if($timeDifference > $minProblemTime){
				$actionString = "SELECT * FROM dev_logs where USER_ID = '".$user."' AND DATED >='".$problemTime[$i]['startTime']."' AND DATED <= '".$problemTime[$i]['endTime']."' ORDER BY DATED asc;";
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
					
					$timeDiff = abs($newTime-$oldTime);//seconds difference between two consecutive action during the session.
					
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
		if(($totalCheckCount+$totalGiveUpCount) !=0){
			$gaming_system = (($totalGiveUpCount*100)/($totalCheckCount + $totalGiveUpCount));
		} else {
			$gaming_system = 'N/A';
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
			echo "<th>Total Time (in seconds)</th>\n";
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
	
	function show_logs($table, $toDate, $fromDate){
		date_default_timezone_set('America/Phoenix');
		$table = !empty($table)?$table:"dev_logs";
		$startDate = !empty($fromDate)?$fromDate: Date('Y-m-d', strtotime('-7 days'));
		if($table != 'tasks'){
			$colQuery = "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = '".$table."' AND (DATA_TYPE = 'timestamp' OR DATA_TYPE = 'datetime');";
			$colName = $this->getResults($colQuery);
			
			$colRow = $colName->fetch_assoc();
			$colName = $colRow['COLUMN_NAME'];
			$toDateString = "AND ".$colName." <='".$toDate."'";
			$queryString = "SELECT * from ".$table." Where ".$colName." >= '".$startDate."' ".(!empty($toDate)?$toDateString:"").";";
		} else {
			$queryString = "SELECT * from ".$table.";";
		}
		$result = $this->getResults($queryString);
		
		$columnsQuery = "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = '".$table."';";
		$columns = $this->getResults($columnsQuery);
	
		if($result != null && !empty($result)){
			echo '<table border="1">';
			echo "<tr>\n";
			$colNameArray = array();
			while($columnName = $columns->fetch_assoc()){
				echo "<th>".$columnName['COLUMN_NAME']."</th>\n";
				array_push($colNameArray, $columnName['COLUMN_NAME']);
			}
			echo "</tr>\n";
			
			while($row = $result->fetch_assoc()){
				echo " <tr>\n";
				$numberOfColumns = sizeof($colNameArray);
				for($i = 0; $i<$numberOfColumns; $i++){
					echo "<td>".$row[$colNameArray[$i]]."</td>\n";
				}
				echo "</tr>\n";
			}
			echo "</table>\n";
		} else {
			echo "no records found for the Date and Table specified. Please check and change the values entered.";
		}
	}

	function createDashboard($section, $mode, $date, $fromTime, $toTime, $user){
		//$sessionQuery = "SELECT * from session JOIN step ON session.session_id = step.session_id where time >= '2014-01-26 08:00:000' AND time <= '2014-01-29 16:15:000' AND mode = 'STUDENT' ORDER BY user asc, step.session_id asc, time asc;";
		//$sessionQuery = "select * from step where session_id = '4556e5121a83ecd679ebe6ecbd2a7aec' order by tid asc;";
		$userString = "AND user = '".$user."' ";
		$sessionQuery = "SELECT tid, session.session_id, user, problem_name, time, method, message, author from session JOIN step ON session.session_id = step.session_id where section = '".$section."' AND time >= '".$date." ".$fromTime."' AND time <= '".$date." ".$toTime."' AND mode = '".$mode."' ".($user != ''?$userString:'')."ORDER BY user asc, problem_name asc, tid asc;";
		
		$totalWork = $this->getResults($sessionQuery);
		$numResults = mysqli_num_rows($totalWork);
		
		$maxIdleTime = AnalyzeLogs::$actionTime;
		$counter = 1; $problemTime = 0;
		$resetNodeString = true;
		$oldSession; $oldRow; $help; $nodeDetailsArray;
		$nodeName =''; $nodeString = ''; $userGaming = false;
		$index = 0;
		$startTime = 0;
		$user; $problem; $lastAction = '';
		$tempNodeName = ''; $tempNodeString = ''; $startTimeTempNode = 0;
		$workingTempNode = false;
		
		if($numResults != 0){
			echo "<table border='1'>\n";
			echo "<tr>\n";
			echo "<th>User Name</th>\n";
			echo "<th>Problem Name</th>\n";
			echo "<th>Time Spent/Session Running Time</th>\n";
			echo "<th>Is User Working</th>\n";
			echo "<th>User Idle for time > ".AnalyzeLogs::$actionTime." seconds</th>\n";
			echo "<th>Nodes Created</th>\n";
			echo "<th>Last UI action</th>\n";
			echo "</tr>\n";

			while($row = $totalWork->fetch_assoc()){
				//echo $row['problem_name'].' '.$row['message'].'<br/>';
				if($index == 0){
					//this is where a new session starts. so I refresh all the data structures which I have created.
					$oldSession = $row['session_id'];
					if($counter == 1)
						$oldRow = $row;
					$problemTime = 0;
					$startTime = 0; $startTimeTempNode = 0;
					$lastAction = '';
					$userGaming = false;
					$sessionRunning = true;
					$problemComplete = false;
					$nodeDetailsArray = array();
					$noOfTimesProblemAccessed = 1;
					$workingTempNode = false;
					$tempNodeName = ''; $tempNodeString = '';
				}
				$message = $row['message'];
				$method = $row['method'];
				$newSession = $row['session_id'];
				
				if($oldRow['method'] != 'close-problem' && stripos($oldRow['message'], '"{')){
					$tempMessage = str_replace('"{', "{", $oldRow['message']);
					$tempMessage = str_replace('}"', "}", $tempMessage);
					
					$oldRow['message'] = $tempMessage;
				}
				if($method != 'close-problem' && stripos($row['message'], '"{')){
					$tempMessage = str_replace('"{', "{", $row['message']);
					$tempMessage = str_replace('}"', "}", $tempMessage);
					
					$row['message'] = $tempMessage;
				}
				
				$oldMessageJSON = json_decode($oldRow['message'], true);	
				$messageJSON = json_decode($row['message'], true);
				
				$continuedSession = true;
				if($oldSession != $newSession){
					if($row['user'] == $oldRow['user'] && $row['problem_name'] == $oldRow['problem_name']){
						$continuedSession = true;
						$startTime = 0; // used while calculating the tab time for the problem. Setting in case where the user had a node opened when it closed the problem.
					} else {
						$continuedSession = false;
					}

				}

				$timeDiff = $messageJSON['time']-$oldMessageJSON['time'];
				
				if($messageJSON['time'] > $oldMessageJSON['time'] && $timeDiff > $maxIdleTime){
					$userGaming = true;
				} else if($continuedSession) {
					$problemTime = $problemTime + $timeDiff;
				} else {
					$noOfTimesProblemAccessed++;
				}
				//echo 'start time  > '.$oldMessageJSON['time'].' end time > '.$messageJSON['time'].' difference > '.$timeDiff.' problem time > '.$problemTime.'<br/>';

				//this is the node related date. I keep appending it in all the steps and when that node is closed the set the flag of resetNodeString. Before pushing this the array of node Strings.
				if($resetNodeString){
					if(($nodeName!='') && ($nodeString!='')){
						$nodeDetailsArray[$nodeName] = $nodeString;
					}
					$nodeName = '';
					$nodeString = '';
					$resetNodeString = false;
				}

				if($method === 'close-problem'){
					$sessionRunning = false;
					if($messageJSON['Is Problem Solved']){
						$problemComplete = true;
					}
				} elseif($method === 'client-message'){
					if($messageJSON['text'] === 'Model ran successfully'){
						$problemComplete = true;
						$sessionRunning = false;
					}
				} elseif($method === 'solution-step' && array_key_exists('check-result', $messageJSON)){
					if($workingTempNode){					
						$tempNodeString = $tempNodeString.'<br/># Solution Checked in => DESCRIPTION tab and result is '.$messageJSON['check-result'];
						if(!(array_key_exists('name', $messageJSON)))
							$tempNodeName = $messageJSON['node'];
						else
							$tempNodeName = $messageJSON['name']; 
					} else {
						$nodeString = $nodeString.'<br/># Solution Checked in => '.$newTab.' and result is '.$messageJSON['check-result'];
						$nodeName = $messageJSON['node'];
					}
					if($messageJSON['check-result'] === 'INCORRECT' && array_key_exists('substeps', $messageJSON)){
						foreach($messageJSON['substeps'] as $step){
							$nodeString = $nodeString.'<br/># value checked => '.$step['value'].' && correct value => '.$step['correct-value'];
						}
					} elseif($messageJSON['check-result'] === 'INCORRECT'){
						if($workingTempNode){
							$tempNodeString = $tempNodeString.'<br/># node selected => '.$messageJSON['name'].' and node description => '.$messageJSON['text'];
						} else {
							if(array_key_exists('correct-result', $messageJSON)){
								$temp = $messageJSON['name'];
								if($temp === 'CONSTANT'){
									$temp = 'Parameter';
								} elseif($temp === 'STOCK'){
									$temp = 'Accumulator';
								} else {
									$temp = 'Function';
								}
								$nodeString = $nodeString.'<br/># type selected => '.$temp.' && correct value => '.$messageJSON['correct-result'];
							} else {
								$nodeString = $nodeString.'<br/># node selected => '.$messageJSON['name'].' and node description => '.$messageJSON['text'];
							}
						}
					}
					//after each solution step the node details are saved... in case problem stops earlier.
					if($nodeName != '')
						$nodeDetailsArray[$nodeName] = $nodeString;
				} elseif($method === 'seek-help'){
					//this is a demo button pressed action
					$tabName = $messageJSON['tab'];
					if($workingTempNode){
						$tempNodeString = $tempNodeString.'<br/># help button pressed on tab => '.$tabName;
						$tempNodeName = $messageJSON['name'];
					} else {
						$nodeString = $nodeString.'<br/># help button pressed on tab =>'.$tabName;
					}
					//$nodeName = $messageJSON[];
				} elseif($method === 'ui-action'){
					$actionType = $messageJSON['type'];
					// this is a UI action to give last 3 ui actions on the dash board.
					if($actionType === 'dialog-box-tab'){
						// this is the case where the user moves to the new tab
						$oldTab = $newTab;
						$newTab = $messageJSON['tab'];
						$tabTime = 0;
						if($startTime != 0 && (($messageJSON['time'] - $startTime)>1)){
							//echo 'andar aaya '.$startTime.' asdf node '.$nodeName.' tab '.$oldTab. ' new tab '.$newTab.'<br/>#';
							$tabTime = (float)$messageJSON['time'] - $startTime;
							$nodeString = $nodeString.'<br/># Time spent on '.$oldTab.' tab => '.$tabTime;
							//echo 'tab time '.$oldTab.' '.$tabTime.'<br/>#';
						}
						$startTime = (float)$messageJSON['time'];
					} elseif($actionType === 'open-dialog-box'){
						//opened the node
						$lastAction = 'node editor opened with tab - '.$messageJSON['tab'];
						$newTab = $messageJSON['tab'];
						$nodeName = $messageJSON['node'];
						if($nodeName != ''){
							//looking if the string was already created or not.
							$nodeString = (array_key_exists($nodeName, $nodeDetailsArray)?$nodeDetailsArray[$nodeName].'<br/># ':'').'Node opened in '.$newTab.' tab';

						} else {
							//otherwise initialized an empty string. Name will be set in the dialog-box-tab or in the check correct case on Plan tab or in seek help.
							$nodeString = 'Node Creation '.($newTab == 'DESCRIPTION'?' started in ':' continued from ').$newTab.' tab';
						}
						$startTime = $messageJSON['time'];
					} elseif($actionType === 'create-newnode-dialog-box'){
						$lastAction = 'create new node pressed from calculation tab in node'.$nodeName;
						$tempNodeString = 'Node Creation started from CALCULATION tab of <b>'.$nodeName.'</b>';
						$startTimeTempNode = $messageJSON['time'];
						$workingTempNode = true;
					} elseif($actionType === 'menu-choice'){
						//chose something from the top menu
						$lastAction = $messageJSON['name'].' clicked from the menu';
					} elseif($actionType === 'close-dialog-box'){
						$name = $messageJSON['node'];
						$tab = $messageJSON['tab'];
						$lastAction = 'Closed '.$messageJSON['name']." name => ".$name. " in tab => ".$tab;
						if($workingTempNode){
							//adding the node data for the node opened in the new node created from the calculation tab for the new node.
							$tempNodeString = $tempNodeString.'<br/># Time spent on '.$tab.' tab => '.($messageJSON['time']-$startTimeTempNode);
							$tempNodeName = $name;
							$nodeDetailsArray[$tempNodeName] = $tempNodeString;
							$tempNodeName = '';
							$tempNodeString = '';
						} else {
							$nodeString = $nodeString.'<br/># Time spent on '.$tab.' tab => '.($messageJSON['time']-$startTime).' seconds';
							$nodeName = $name;
							$resetNodeString = true;
						}
						$workingTempNode = false;
					} elseif($actionType === 'info'){
						$lastAction = $messageJSON['text']." Was Graph Correct => ".(($messageJSON['Is Problem Solved'])?"Yes":"No");
						if($messageJSON['Is Problem Solved']){
							$problemComplete = true;
							$sessionRunning = false;
						}
					}
				}

				//print_r($oldMessageJSON); echo '<br/>';

				if(!($continuedSession)){
					$user = $oldRow['user'];
					$problem = $oldRow['problem_name'];

					$finalTime = $oldMessageJSON['time'];
					$this->printData($user, $problem, $userGaming, $problemComplete, $sessionRunning, $problemTime, $nodeDetailsArray, $lastAction, $finalTime);
					$oldSession = $newSession;
					$oldRow = $row;
					$index = 0; // next time the data will be refreshed.
					
				} else {
					$oldSession = $newSession;
					$oldRow = $row;
					
					$index++;
				}
				$counter++;
				
			}
			$user = $oldRow['user'];
			$problem = $oldRow['problem_name'];

			$finalTime = $oldMessageJSON['time'];
			$this->printData($user, $problem, $userGaming, $problemComplete, $sessionRunning, $problemTime, $nodeDetailsArray, $lastAction, $finalTime);
			echo "</table>\n";
		} else {
			echo "No Action took place in this time";
		}
		//return $sessions;
	}

	function printData($user, $problemName, $userGaming, $problemComplete, $sessionRunning, $problemTime, $nodeDetailsArray, $lastAction, $sessionTime){
		echo "<tr>\n";
		echo "<td>".$user."</td>";
		if($sessionRunning && !($problemComplete)){
			echo "<td bgcolor='red'>".$problemName."</td>\n";	
		} else {
			echo "<td>".$problemName."</td>\n";
		}
		echo "<td>".$problemTime."/".$sessionTime."</td>\n";
		echo "<td>".(($sessionRunning)?"Yes":"No")."</td>\n";
		echo "<td>".(($userGaming)?"Yes":"No")."</td>\n";
		echo "<td>";
		//print_r($nodeDetailsArray);
		foreach($nodeDetailsArray as $nodeName=>$nodeDetails){
			echo "<b>".$nodeName."</b> => ".$nodeDetails.'<br/>';
		}
		echo "</td>\n";
		echo "<td>".$lastAction."</td>\n";
		echo "</tr>\n";
	}

	function createSmallDashboard($section, $mode, $date, $fromTime, $toTime, $user){
		$userString = "AND user = '".$user."' ";
		//$sessionQuery = "SELECT tid, session.session_id, user, problem_name, time, method, message, author from session JOIN step ON session.session_id = step.session_id where section = 'sos-326-spring14' AND time >= '2014-01-29 15:00' AND time <= '2014-01-29 16:15' AND mode = 'COACHED' AND (user = 'bstrong' OR user = 'cmflanne') ORDER BY user asc, problem_name asc, tid asc;";

		$sessionQuery = "SELECT tid, session.session_id, user, problem_name, time, method, message, author from session JOIN step ON session.session_id = step.session_id where section = '".$section."' AND time >= '".$date." ".$fromTime."' AND time <= '".$date." ".$toTime."' AND mode = '".$mode."' ".($user != ''?$userString:'')."ORDER BY user asc, problem_name asc, tid asc;";

		//echo $sessionQuery;

		$totalWork = $this->getResults($sessionQuery);
		$numResults = mysqli_num_rows($totalWork);
		$index = 0; $noOfTimesProblemAccessed=0; $problemTime = 0; $helpCounter = 0; $nodeIndex=0;
		$nodeTabCheck = 0;
		$UIaction = array();
		$tabReadTime = AnalyzeLogs::$tabReadingTime;
		$maxIdleTime = AnalyzeLogs::$actionTime;
		$runningProblems = array();
		$completeProblems = array();
		$workingTempNode = false;
		$resetNodeString = false;
		$nodeName = ''; $nodeString = '';
		$row = '';

		if($numResults != 0){
			while($row = $totalWork->fetch_assoc()){
				if($index == 0){
					//first session values
					$UIactions = array();
					$nodeDetailsArray = array();
					$oldRow = $row;
					$oldSession = $row['session_id'];
					$nodeIndex = 0; $helpCounter = 0;
					$problemTime = 0;
					$workingTempNode = false;
					$resetNodeString = false; $sessionRunning = true; $problemComplete = false;
					$nodeName = ''; $nodeString = '';
					$nodeTabCheck = 0;
				}
				$method = $row['method'];
				$message = $row['message'];
				$newSession = $row['session_id'];

				if($oldRow['method'] != 'close-problem' && stripos($oldRow['message'], '"{')){
					$tempMessage = str_replace('"{', "{", $oldRow['message']);
					$tempMessage = str_replace('}"', "}", $tempMessage);
					
					$oldRow['message'] = $tempMessage;
				}
				if($method != 'close-problem' && stripos($row['message'], '"{')){
					$tempMessage = str_replace('"{', "{", $row['message']);
					$tempMessage = str_replace('}"', "}", $tempMessage);
					
					$row['message'] = $tempMessage;
				}

				$oldMessageJSON = json_decode($oldRow['message'], true);	
				$messageJSON = json_decode($row['message'], true);

				$continuedSession = true;
				if($oldSession != $newSession){
					if($row['user'] == $oldRow['user'] && $row['problem_name'] == $oldRow['problem_name']){
						$continuedSession = true;
						$startTime = 0; // used while calculating the tab time for the problem. Setting in case where the user had a node opened when it closed the problem.
					} else {
						$continuedSession = false;
					}
				}

				$timeDiff = $messageJSON['time']-$oldMessageJSON['time'];
				
				if($messageJSON['time'] > $oldMessageJSON['time'] && $timeDiff > $maxIdleTime){
					$userGaming = true;
				}
				if($continuedSession && $oldSession==$newSession) {
					$problemTime = $problemTime + $timeDiff;
				} else {
					$noOfTimesProblemAccessed++;
				}

				if($resetNodeString){
					if(($nodeName!='') && ($nodeString!='')){
						$nodeDetailsArray[$nodeName] = $nodeString;
					}
					$nodeName = '';
					$nodeString = '';
					$resetNodeString = false;
				}

				if($method === 'ui-action'){
					$actionType = $messageJSON['type'];
					// this is a UI action to give last 3 ui actions on the dash board.
					if($actionType === 'dialog-box-tab'){
						// this is the case where the user moves to the new tab
						$oldTab = $newTab;
						$newTab = $messageJSON['tab'];
						$lastAction = 'Swiched Tab from => '.$oldTab.' to => '.$newTab.($nodeName != ''?(' in node => '.$nodeName):'');
						$tabCheckTime = $messageJSON['time'];
						$nodeCheck = 0;
					} elseif($actionType === 'open-dialog-box'){
						//opened the node
						$lastAction = 'node editor opened '.($nodeName != ''?(' for node => '.$nodeName):' for new node ').' in tab => '.$messageJSON['tab'];
						$newTab = $messageJSON['tab'];
						$nodeName = $messageJSON['node'];
						if($nodeName != ''){
							//looking if the string was already created or not.
							$nodeString = (array_key_exists($nodeName, $nodeDetailsArray)?$nodeDetailsArray[$nodeName].' || ':'').'Node re-opened in '.$newTab.' tab';

						} else {
							//otherwise initialized an empty string. Name will be set in the dialog-box-tab or in the check correct case on Plan tab or in seek help.
							$nodeIndex++;
							$nodeString = 'Node #'.$nodeIndex.' Created';
						}
						$startTime = $messageJSON['time'];
						$tabCheckTime = $messageJSON['time'];
						$nodeCheck = 0;
					} elseif($actionType === 'create-newnode-dialog-box'){
						$nodeIndex++; 
						$lastAction = 'Create new node pressed from calculation tab in node'.$nodeName;
						$tempNodeString = 'Node #'.$nodeIndex.' Created from '.$nodeName.'</b>';
						$startTimeTempNode = $messageJSON['time'];
						$tempTabCheckTime = $messageJSON['time'];
						$workingTempNode = true;
						$tempNodeCheck = 0;
					} elseif($actionType === 'menu-choice'){
						//chose something from the top menu
						$lastAction = $messageJSON['name'].' clicked from the menu';
					} elseif($actionType === 'close-dialog-box'){
						$name = $messageJSON['node'];
						$tab = $messageJSON['tab'];
						$lastAction = 'Closed '.$messageJSON['name']." name => ".$name. " in tab => ".$tab;
						if($workingTempNode){
							//adding the node data for the node opened in the new node created from the calculation tab for the new node.
							//$tempNodeString = $tempNodeString.'<br/># Time spent on '.$tab.' tab => '.($messageJSON['time']-$startTimeTempNode);
							$tempNodeName = $name;
							$nodeDetailsArray[$tempNodeName] = $tempNodeString;
							$tempNodeName = '';
							$tempNodeString = '';
						} else {
							//$nodeString = $nodeString.'<br/># Time spent on '.$tab.' tab => '.($messageJSON['time']-$startTime).' seconds';
							$nodeName = $name;
							$resetNodeString = true;
						}
						$workingTempNode = false;
					} elseif($actionType === 'info'){
						$lastAction = $messageJSON['text']." Was Graph Correct => ".(($messageJSON['Is Problem Solved'])?"Yes":"No");
						if($messageJSON['Is Problem Solved']){
							$problemComplete = true;
							$sessionRunning = false;
						}
					}
					array_push($UIactions, $lastAction);
				}elseif($method === 'solution-step' && array_key_exists('check-result', $messageJSON)){
					$nodeCheck++;
					$tempCheckTime = $tabReadTime+1;
					$CheckTime = $tabReadTime+1;
					$userTabGaming = false;
					
					if($workingTempNode)
						$lastAction = "Pressed check button in DISCUSSION tab for new Node";
					else
						$lastAction = "Pressed check button in ".$newTab." tab ".(($nodeName != ''):("for node =>".$nodeName):"";
					array_push($UIactions, $lastAction);

					if($workingTempNode){
						$tempCheckTime = $messageJSON['time'] - $tempTabCheckTime;
						$tempTabCheckTime = $messageJSON['time'];
						if(!(array_key_exists('name', $messageJSON)))
							$tempNodeName = $messageJSON['node'];
						else
							$tempNodeName = $messageJSON['name']; 
					} else {
						$checkTime = $messageJSON['time'] - $tabCheckTime;
						$tabCheckTime = $messageJSON['time'];
						$nodeName = $messageJSON['node'];						
					}
					if($nodeCheck>1 && ($tempCheckTime < $tabReadTime || $checkTime < $tabReadTime)){
						$userTabGaming = true;
					}
					if($messageJSON['check-result'] === 'INCORRECT' && array_key_exists('substeps', $messageJSON)){
						foreach($messageJSON['substeps'] as $step){
							$class = 'incorrectCheck'.($nodeCheck>2?'3':$nodeCheck);
							$nodeString = $nodeString.'||<span class="'.$class.'">'.$step['value'].' '.$newTab.($userTabGaming?'</span><span class="helpButtonPressed"> gamed ':'').'</span>';
						}
					} elseif($messageJSON['check-result'] === 'INCORRECT'){
						$class = 'incorrectCheck'.($nodeCheck>2?'3':$nodeCheck);
						if($workingTempNode){
							//$tempNodeString = $tempNodeString.'<br/># node selected => '.$messageJSON['name'].' and node description => '.$messageJSON['text'];
							$tempNodeString = $tempNodeString.'||<span class="'.$class.'">'.$messageJSON['name'].' DISCUSSION'.($userTabGaming?' </span><span class="helpButtonPressed"> gamed ':'').'</span>';
						} else {
							if(array_key_exists('correct-result', $messageJSON)){
								$temp = $messageJSON['name'];
								if($temp === 'CONSTANT'){
									$temp = 'Parameter';
								} elseif($temp === 'STOCK'){
									$temp = 'Accumulator';
								} else {
									$temp = 'Function';
								}
								$nodeString = $nodeString.'|| <span class="'.$class.'">'.$temp.($userTabGaming?' </span><span class="helpButtonPressed"> gamed ':'').'</span>';
							} else {
								$nodeString = $nodeString.'|| <span class="'.$class.'">'.$messageJSON['name'].($userTabGaming?' </span><span class="helpButtonPressed"> gamed ':'').'</span>';
							}
						}
					} elseif($messageJSON['check-result'] === 'CORRECT'){
						if($workingTempNode){
							$tempNodeString = $tempNodeString.'||<span class="correctCheck">DISCUSSION</span>';
						} else {
							$nodeString = $nodeString.'||<span class="correctCheck">'.$newTab.'</span>';
						}
					}
					//after each solution step the node details are saved... in case problem stops earlier.
					if($nodeName != '')
						$nodeDetailsArray[$nodeName] = $nodeString;
					if($messageJSON['check-result'] === 'CORRECT')
						$nodeCheck = 0;
				} elseif($method === 'seek-help'){
					//this is a demo button pressed action
					$helpCounter++;
					$tabName = $messageJSON['tab'];

					if($workingTempNode)
						$lastAction = "Pressed check button in DISCUSSION tab for new Node";
					else
						$lastAction = "Pressed check button in ".$newTab." tab ".(($nodeName != ''):("for node =>".$nodeName):"";
					array_push($UIactions, $lastAction);
					
					if($workingTempNode){
						$tempHelpTime = $messageJSON['time'] - $tempTabCheckTime;
						$tempTabCheckTime = $messageJSON['time'];
						$tempNodeString = $tempNodeString.' || <span class="helpButtonPressed">'.$tabName.' ('.$tempHelpTime.' s)</span>';
						$tempNodeName = $messageJSON['name'];
					} else {
						$helpTime = $messageJSON['time'] - $tabCheckTime;
						$tabCheckTime = $messageJSON['time'];
						$nodeString = $nodeString.'|| <span class="helpButtonPressed">'.$tabName.'</span>';
					}
					//$nodeName = $messageJSON[];
				}
				if(!($continuedSession)){
					$user = $oldRow['user'];
					$problem = $oldRow['problem_name'];

					$finalTime = $oldMessageJSON['time'];
					$newData = array('user' => $user, 'problem' => $problem, 'problemTime' => $problemTime, 'nodeDetails' => $nodeDetailsArray, 'uiActions' => $UIactions);

					if(!($problemComplete) && $sessionRunning){
						array_push($runningProblems, $newData);
					} else {
						array_push($completeProblems, $newData);
					}

					$oldSession = $newSession;
					$oldRow = $row;
					$index = 0; // next time the data will be refreshed.
					
				} else {
					$oldSession = $newSession;
					$oldRow = $row;
					
					$index++;
				}
			}
			$user = $oldRow['user'];
			$problem = $oldRow['problem_name'];
			$newData = array('user' => $user, 'problem' => $problem, 'problemTime' => $problemTime, 'nodeDetails' => $nodeDetailsArray, 'uiActions' => $UIactions);

			if(!($problemComplete)){
				array_push($runningProblems, $newData);
			} else {
				array_push($completeProblems, $newData);
			}

			$this->printSmallDashboard($runningProblems, $completeProblems);
		}
	}

	function printSmallDashboard($runningProblems, $completeProblems){
		echo "Color Scheme : \n";
		echo "<ul>\n";
		echo "<li><span style='color:Red'>Red</span> : Help Button Presesd</li>\n";
		echo "<li><span style='color:Yellow'>Yellow</span> : First incorrect check</li>\n";
		echo "<li><span style='color:Orange'>Orange</span> : Second incorrect check</li>\n";
		echo "<li><span style='color:Blue'>Blue</span> : Third incorrect check</li>\n";
		echo "<li><span style='color:Green'>Green</span> : Correct Check</li>\n";
		echo "</ul>\n";
		echo "<h2>Running Problems</h2>\n";
		echo "<table border='1'>\n";
		echo "<tr>\n";
		echo "<th>User Name</th>\n";
		echo "<th>Problem Name</th>\n";
		echo "<th>Time Spent/Session Running Time</th>\n";
		echo "<th>Nodes Details</th>\n";
		echo "<th>Last UI actions</th>\n";
		echo "</tr>\n";
		foreach ($runningProblems as $row){
			echo "<tr>\n";
			echo "<td>".$row['user']."</td>\n";
			echo "<td>".$row['problem']."</td>\n";
			echo "<td>".$row['problemTime']."</td>\n";
			echo "<td>\n";
			foreach($row['nodeDetails'] as $nodeName => $nodeDetails){
				echo "<b>".$nodeName."</b> => ".$nodeDetails.'<br/>';
			}
			echo "</td>\n";
			echo "<td>\n";
			$size = sizeof($row['uiActions']);
			$index = 0;
			if($size == 0){
				echo "User has not started the problem.";
			} else {
				if($size >= 3){
					$index = $size -3;
				} else {
					$index = $size;
				}
				for($i = $index; $i<$size; $i++){
					echo $row['uiActions'][$i]."<br/>\n";
				}
			}
			echo "</td>\n";
			echo "</tr>";
		}
		echo "</table>\n";

		echo "<h2>Complete Problems</h2>\n";
		echo "<table border='1'>\n";
		echo "<tr>\n";
		echo "<th>User Name</th>\n";
		echo "<th>Problem Name</th>\n";
		echo "<th>Time Spent/Session Running Time</th>\n";
		echo "<th>Nodes Details</th>\n";
		echo "<th>Last UI actions</th>\n";
		echo "</tr>\n";
		foreach ($completeProblems as $row){
			echo "<tr>\n";
			echo "<td>".$row['user']."</td>\n";
			echo "<td>".$row['problem']."</td>\n";
			echo "<td>".$row['problemTime']."</td>\n";
			echo "<td>\n";
			foreach($row['nodeDetails'] as $nodeName => $nodeDetails){
				echo "<b>".$nodeName."</b> => ".$nodeDetails.'<br/>';
			}
			echo "</td>\n";
			echo "<td>\n";
			$size = sizeof($row['uiActions']);
			$index = 0;
			if($size == 0){
				echo "User hasnt started the problem.";
			} else {
				if($size >= 3){
					$index = $size -3;
				} else {
					$index = $size;
				}
				for($i = $index; $i<$size; $i++){
					echo $row['uiActions'][$i]."<br/>\n";
				}
			}
			echo "</td>\n";
			echo "</tr>";
		}
		echo "</table>\n";
	}
}
?>