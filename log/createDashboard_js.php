<?php
	include "logAnalysis.php";
	include "logProblemObject.php";

	class Dashboard{
		public $al;

		function __construct($con){
			$this->al = new AnalyzeLogs($con);
		}

		function createDashboard($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate){
			$query = $this->getQuery($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate);
			echo $query;
			$result = $this->al->getResults($query);
			$objects = $this->parseMessages($result);
			return $objects;
		}

		function getQuery($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate){
			$userString = "AND user = '".$user."' ";
			$problemString = "AND problem = '".$problem."' ";
			$fromTimeString =  "AND time >= '".$fromDate." ".$fromTime."' ";
			$toTimeString = "AND time <= '".(!empty($toDate)?$toDate:$fromDate)." ".$toTime."' ";
			$queryString = 
			"SELECT 
				tid, session.session_id, user, problem, time, method, message, group 
			from 
				session JOIN step ON session.session_id = step.session_id 
			where 
				section = '".$section."' ".(!empty($fromDate)?$fromTimeString:"").
				" AND method != 'client-message' ".
				(!empty($user)?$userString:"").
				(!empty($problem) ?$problemString:"").
				(!empty($fromDate)?$toTimeString:"").
				" AND mode = '".$mode."' ".
			"ORDER BY user asc, problem_name asc, tid asc;";

			return $queryString;
		}

		function parseMessages($result){
			$resetVariables = true;
			$sessionTime; $outOfFocusTime; $wastedTime;
			$oldRow; $method; $oldMessage; $newMessage;
			$row; $oldSession; $newSession;
			$upObject; $currentNode;//up stands for user-problem
			$problemReOpen;
			$objectArray = array();
			$propertyStartTime;
			$totalChecks; $incorrectChecks; $errorRatio;
			while($row = $result->mysqli_fetch($result)){
				if($resetVariables){
					$sessionTime = 0; $outOfFocusTime = 0; $wastedTime=0;
					$problemReOpen = 1;
					$oldRow = $row;
					$upObject = new logProblemObject();
					$upObject->setSessionRunning(true);
					$totalChecks = 0; $incorrectChecks=0;
					$errorRatio = 0;
				}
				$resetVariables = false;
				$method = $row['method'];
				$newMessage = json_decode($row['message'], true);
				$oldMessage = json_decode($oldRow['message'], true);
				$oldSession = $oldRow['session'];
				$newSession = $row['session'];

				$stepTime = $newMessage['time'] - $oldMessage['time'];
				if($oldSession != $newSession){
					//this means either the problem was opened again or their is a new user problem combination.
					if(($oldRow['user'] == $row['user']) && ($oldRow['problem'] == $row['problem'])){
						$stepTime = 0;
						$upObject->setSessionRunning(true);
						$problemReOpen +=1;
					} else {
						$resetVariables = true;
						array_push($objectArray, $upObject);
					}
				}
				if($stepTime > $al->getActionTime() && $method != "window-focus"){
					$timeWasted += $stepTime;
				}
				$sessionTime += $stepTime;

				if($method === "start-session"){
					$upObject->setProblem($row['problem']);
				} else if($method === "ui-action"){
					$type = $newMessage['type'];
					if($type === "menu-choice"){
						//a new node created
						$name = $newMessage['name'];
						if($name === 'create-node'){
							if(!isset($currentNode)){
								$currentNode = new Node();
							} else {
								$upObject->setNodes($currentNode);
								$currentNode = new Node();
							}
						} else if($name === "graph-button"){
							$upObject->setProblemComplete($row['problemComplete']);
						} else if($name === "done-button"){
							$upObject->setProblemComplete($row['problemComplete']);
							$upObject->setSessionRunning(false);
						}
						$propertyStartTime = $newMessage['time'];
					} else if($type === "close-dialog-box"){
						if(isset($currentProerty)){
							$currentNode->setProperties($currentProperty);
						}
						$upObject->setNodes($currentNode);
						$currentNode = null;
					} else if($type === "node-delete"){
						$currentNode->setNodeExist(false);
					} else if($type === "open-dialog-box"){
						if(array_key_exists('node', $newMessage)){
							//node reopened
							$currentNode = $upObject->getNodeFromName($newMessage['node']);
							$currentNode->setOpenTimes(($currentNode->getOpenTimes())+1);
						}
					}
				} else if($method === "solution-step"){
					$type = $newMessage['type'];
					if($type === "solution-check"){
						$currentProperty = new Property();
						$currentProperty->setName($newMessage['property']);
						$checkResult = $newMessage['checkResult'];
						$currentProperty->setStatus($checkResult);
						$currentProperty->setCorrectValue($newMessage['correctValue']);
						$totalChecks = $totalChecks + 1;

						if($checkResult === "CORRECT"){
							$currentProperty->setTime($newMessage['time']-$propertyStartTime);
							$propertyStartTime = $newMessage['time'];
							$currentNode->setProperties($currentProperty);
							$currentProperty = null;
						} else if($checkResult === "INCORRECT"){
							$currentProperty->setAnswers($newMessage['value']);
							$incorrectChecks = $incorrectChecks+1;
							if($newMessage['solutionProvided'] == "true"){
								$currentProperty->setStatus("DEMO");
							}
						}
					}
				} else if($method === "window-focus"){
					if($type === "in-focus"){
						//window came back in focus
						$outOfFocusTime += $stepTime; // as previous message will be for out of focus.
					}
				}

				if($resetVariables){
					$errorRatio = $incorrectChecks/$totalChecks;

					$upObject->setWastedTime($wastedTime);
					$upObject->setTotalTime($sessionTime);
					$upObject->setOutOfFocusTime($outOfFocusTime);
					$upObject->setOpenTimes($problemReOpen);
					$upObject->setIncorrectChecks($incorrectChecks);
					$upObject->setTotalSolutionChecks($totalChecks);
					$upObject->setErrorRatio($errorRatio);
					array_push($objectArray, $upObject);
				}
			}
			$errorRatio = $incorrectChecks/$totalChecks;

			$upObject->setWastedTime($wastedTime);
			$upObject->setTotalTime($sessionTime);
			$upObject->setOutOfFocusTime($outOfFocusTime);
			$upObject->setOpenTimes($problemReOpen);
			$upObject->setIncorrectChecks($incorrectChecks);
			$upObject->setTotalSolutionChecks($totalChecks);
			$upObject->setErrorRatio($errorRatio);
			array_push($objectArray, $upObject);

			return $objectArray;
		}
	}

?>
