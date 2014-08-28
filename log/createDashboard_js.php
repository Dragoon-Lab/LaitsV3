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
			$objects = null;
			if($result != null)
				$objects = $this->parseMessages($result);

			return $objects;
		}

		function getQuery($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate){
			$userString = "AND user = '".$user."' ";
			$problemString = "AND problem = '".$problem."' ";
			$fromTimeString =  "AND time >= '".$fromDate." ".$fromTime."' ";
			$toTimeString = "AND time <= '".(!empty($toDate)?$toDate:$fromDate)." ".$toTime."' ";
			/*$queryString = 
			"SELECT 
				tid, session.session_id, user, problem, time, method, message, `group` 
			from 
				session JOIN step ON session.session_id = step.session_id 
			where 
				section = '".$section."' ".(!empty($fromDate)?$fromTimeString:"").
				" AND method != 'client-message' ".
				(!empty($user)?$userString:"").
				(!empty($problem) ?$problemString:"").
				(!empty($fromDate)?$toTimeString:"").
				" AND mode = '".$mode."' ".
			"ORDER BY user asc, problem asc, tid asc;"; */
			$queryString = "SELECT tid, session.session_id, user, problem, time, method, message, `group` from session JOIN step ON session.session_id = step.session_id where section = 'student101' AND method != 'client-message' AND mode = 'STUDENT' AND user = 'st1' ORDER BY user asc, problem asc, tid asc;";

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
			while($row = $result->fetch_assoc()){
				if($resetVariables){
					$sessionTime = 0; $outOfFocusTime = 0; $wastedTime=0;
					$problemReOpen = 1;
					$oldRow = $row;
					$upObject = new UserProblemObject ();
					$upObject->sessionRunning = true;
					$totalChecks = 0; $incorrectChecks=0;
					$errorRatio = 0;
				}
				$resetVariables = false;
				$method = $row['method'];
				$newMessage = json_decode($row['message'], true);
				$oldMessage = json_decode($oldRow['message'], true);
				$oldSession = $oldRow['session_id'];
				$newSession = $row['session_id'];

				$stepTime = $newMessage['time'] - $oldMessage['time'];
				if($oldSession != $newSession){
					//this means either the problem was opened again or their is a new user problem combination.
					if(($oldRow['user'] == $row['user']) && ($oldRow['problem'] == $row['problem'])){
						$stepTime = 0;
						$upObject->ssessionRunning = true;
						$problemReOpen +=1;
					} else {
						$resetVariables = true;
						array_push($objectArray, $upObject);
					}
				}
				if($stepTime > $this->al->getActionTime() && $method != "window-focus"){
					$timeWasted += $stepTime;
				}
				$sessionTime += $stepTime;

				if($method === "start-session"){
					$upObject->problem = $row['problem'];
				} else if($method === "ui-action"){
					$type = $newMessage['type'];
					if($type === "menu-choice"){
						//a new node created
						$name = $newMessage['name'];
						if($name === 'create-node'){
							if(!isset($currentNode)){
								$currentNode = new Node();
							} else {
								array_push($upObject->nodes, $currentNode);
								$currentNode = new Node();
							}
							$currentNode->openTimes = 1;
							$currentNode->nodeExist = true;
							$currentNode->newMessage['nodeID'];
						} else if($name === "graph-button"){
							$upObject->problemComplete = $newMessage['problemComplete'];
						} else if($name === "done-button"){
							$upObject->problemComplete = $newMessage['problemComplete'];
							$upObject->sessionRunning = false;
						}
						$propertyStartTime = $newMessage['time'];
					} else if($type === "close-dialog-box"){
						if(isset($currentProerty)){
							array_push($currentNode->properties, $currentProperty);
						}
						array_push($upObject->nodes, $currentNode);
						$currentNode = null;
					} else if($type === "node-delete"){
						$deletedNode = $upObject->getNodeFromName($newMessage['node']);
						$deletedNode->nodeExist = false;
						$index = $upObject->getIndex($newMessage['node']);
						$upObject->nodes[$index] = $deletedNode;
					} else if($type === "open-dialog-box"){
						if(array_key_exists('node', $newMessage)){
							//node reopened
							$currentNode = $upObject->getNodeFromName($newMessage['node']);
							if(count($currentNode->properties) > 1){
								$currentNode->openTimes = $currentNode->openTimes+1;
							}
							//otherwise auto created node with the property of description was created.
						}
					}
				} else if($method === "solution-step"){
					$type = $newMessage['type'];
					if($type === "solution-check"){
						$autoCreated = false;
						if($currentProperty == null)
							$currentProperty = new Property();
						$currentProperty->name = $newMessage['property'];
						if($newMessage['property'] === "description"){
							if(count($currentNode->properties) == 0){
								$currentNode->name = $newMessage['node'];
								$autoCreated = false;
							}else{
								//autocreated node
								$newNode = new Node();
								$newNode->openTimes = 1;
								$newNode->nodeExist = true;
								$newNode->name = $newMessage['node'];
								$newNode->id = $newMessage['nodeID'];
								$autoCreated = true;
							} 

						}
						$checkResult = $newMessage['checkResult'];
						$currentProperty->status = $checkResult;						
						$totalChecks = $totalChecks + 1;

						if($checkResult === "CORRECT"){
							$currentProperty->time = $newMessage['time']-$propertyStartTime;
							$propertyStartTime = $newMessage['time'];
							$currentNode->properties = $currentProperty;
							$currentProperty->correctValue = $newMessage['value'];
							if(!$autoCreated){
								array_push($currentNode->properties, $currentProperty);
							} else {
								array_push($newNode->properties, $currentProperty);
								array_push($upObject, $newNode);
								$newNode = null;
							}
							$currentProperty = null;
						} else if($checkResult === "INCORRECT"){
							array_push($currentProperty->answers, $newMessage['value']);
							$incorrectChecks = $incorrectChecks+1;
							$currentProperty->correctValue = $newMessage['correctValue'];
							if($newMessage['solutionProvided'] == "true"){
								$currentProperty->status = "DEMO";
							}
						}
					}
				} else if($method === "window-focus"){
					$type = $newMessage['type'];
					if($type === "in-focus"){
						//window came back in focus
						$outOfFocusTime += $stepTime; // as previous message will be for out of focus.
					}
				}

				if($resetVariables){
					$errorRatio = $incorrectChecks/$totalChecks;

					$upObject->wastedTime = $wastedTime;
					$upObject->totalTime = $sessionTime;
					$upObject->outOfFocusTime = $outOfFocusTime;
					$upObject->openTimes = $problemReOpen;
					$upObject->incorrectChecks = $incorrectChecks;
					$upObject->totalSolutionChecks = $totalChecks;
					$upObject->errorRatio = $errorRatio;
					array_push($objectArray, $upObject);
				}
			}
			$errorRatio = $incorrectChecks/$totalChecks;

			$upObject->wastedTime = $wastedTime;
			$upObject->totalTime = $sessionTime;
			$upObject->outOfFocusTime = $outOfFocusTime;
			$upObject->openTimes = $problemReOpen;
			$upObject->incorrectChecks = $incorrectChecks;
			$upObject->totalSolutionChecks = $totalChecks;
			$upObject->errorRatio = $errorRatio;
			array_push($objectArray, $upObject);

			print_r($upObject);

			return $objectArray;
		}
	}

?>
