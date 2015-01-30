<?php
/*
     Dragoon Project
     Arizona State University
     (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
     
     This file is a part of Dragoon
     Dragoon is free software: you can redistribute it and/or modify
     it under the terms of the GNU Lesser General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
     
     Dragoon is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU Lesser General Public License for more details.
     
     You should have received a copy of the GNU Lesser General Public License
     along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
*/
	include "logAnalysis.php";
	include "logProblemObject.php";

	class Dashboard{
		public $al;

		function __construct($con){
			$this->al = new AnalyzeLogs($con);
		}

		function createDashboard($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate){
			$query = $this->getQuery($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate);
			$result = $this->al->getResults($query);
			$objects = null;
			if($result != null)
				$objects = $this->parseMessages($result);

			return $objects;
		}

		function getQuery($section, $mode, $user, $problem, $fromDate, $toDate, $fromTime, $toTime){
			$userString = "AND user = '".$user."' ";
			$fromTimeString =  "AND time >= '".$fromDate.(!empty($fromTime)?(" ".$fromTime):"")."' ";
			$toTimeString = "AND time <= '".(!empty($toDate)?$toDate:$fromDate).(!empty($toTime)?(" ".$toTime):"")."' ";
			
			$notMode = false;
			if(substr($mode, 0, 1) == "!"){
				$notMode = true;
				$mode = substr($mode, 1);
			}
			$likeProblem = false;
			if(substr($problem, 0, 1) == "%"){
				$likeProblem = true;
			}
			$likeSection = false;
			if(substr($section, 0, 1) == "%"){
				$likeSection = true;
			}
			$problemString = "AND problem ".($likeProblem?"LIKE":"=")." '".$problem."' ";
			$modeString = " AND mode ".($notMode?"!":"")."= '".$mode."' ";
			$sectionString = " section ".($likeSection?"LIKE":"=")." '".$section."' ";
			$queryString = 
			"SELECT 
				tid, session.session_id, mode, user, problem, time, method, message, `group` 
			from 
				session JOIN step ON session.session_id = step.session_id 
			where". 
				$sectionString.
				(!empty($fromDate)?$fromTimeString:"").
				" AND method != 'client-message' ".
				(!empty($user)?$userString:"").
				(!empty($problem) ?$problemString:"").
				(!empty($fromDate)?$toTimeString:"").
				(!empty($mode)?$modeString:"").
			"ORDER BY user asc, problem asc, time asc, tid asc;";
		//	$queryString = "SELECT tid, mode, session.session_id, user, problem, time, method, message, `group` from session JOIN step ON session.session_id = step.session_id where method != 'client-message' AND mode != 'AUTHOR' AND user = 'cdluna' AND problem LIKE '%ps3-0%' ORDER BY user asc, problem asc, tid asc;";
			//echo $queryString;

			return $queryString;
		}

		function parseMessages($result){
			$resetVariables = true;
			$sessionTime; $outOfFocusTime; $timeWasted; $focustTime;
			$oldRow; $method; $oldMessage; $newMessage;
			$row; $oldSession; $newSession;
			$upObject; $currentNode = null;//up stands for user-problem
			$problemReOpen;
			$objectArray = array();
			$propertyStartTime;
			$totalChecks; $incorrectChecks; $errorRatio;
			$currentProperty;
			$nodeUpdate; $timeSkip;
			$currentTime = date("c");
			$slideIndex; $slidesOpen;
			$first = true;
			while($row = $result->fetch_assoc()){
				if($first){
					$oldRow = $row;
				}
				$first = false;
				if($resetVariables){
					$sessionTime = 0; $outOfFocusTime = 0; $timeWasted=0; $focusTime = 0; $propertyStartTime = 0; 
					$inFocus = true;
					$problemReOpen = 1;
					$upObject = new UserProblemObject ();
					$upObject->sessionRunning = true;
					$upObject->problemComplete = false;
					$upObject->problemReOpen = false;
					$totalChecks = 0; $incorrectChecks=0;
					$errorRatio = 0;
					$currentNode = null;
					$currentProperty = null;
					$nodeUpdate = false;
					$upObject->problem = $row['problem'];
					$upObject->user = $row['user'];
					$upObject->mode = $row['mode'];
					$timeSkip = false;
					$slideIndex = -1;
					$slidesOpen = false;
					$slides = array();
				}
				$resetVariables = false;
				$method = $row['method'];
				$newMessage = json_decode($row['message'], true);
				$oldMessage = json_decode($oldRow['message'], true);
				$oldSession = $oldRow['session_id'];
				$newSession = $row['session_id'];	
				if($oldSession != $newSession){
					//this means either the problem was opened again or their is a new user problem combination.
					if(($oldRow['user'] == $row['user']) && ($oldRow['problem'] == $row['problem'])){
						//$stepTime = 0;
						$upObject->sessionRunning = true;
						$problemReOpen +=1;
						$upObject->problemReOpen = true;
						$timeSkip = true;
						$inFocus = true;
					} else {
						$resetVariables = true;
						$timeSkip = true;
						//array_push($objectArray, $upObject);
					}
				}
				
				//echo "row -> ".json_encode($row)." <- <br/>";
				$stepTime = $newMessage['time'] - $oldMessage['time'];
				//echo $newMessage['time']." - ".$oldMessage['time']." = ".$stepTime."<br/>";	
				if($stepTime > $this->al->getActionTime() && $inFocus){
					$timeWasted += $stepTime;
				}
				
				if(!($inFocus) && $method == "window-focus" && $newMessage['type'] == "out-of-focus"){
					$outOfFocusTime += $stepTime;
				} else if(!($inFocus) && $method != "window-focus" && !($timeSkip)){
					$outOfFocusTime += $stepTime;
					$inFocus = true;
				}
				if(!$timeSkip){
					//this is when a new session is started, so the time goes to -ve value, we dont have to add this.
					$sessionTime += $stepTime;
				}
				
				//echo "out of focus ".$outOfFocusTime." step ".$stepTime." session ".$sessionTime." wasted ".$timeWasted."<br/>";
				if($slidesOpen && $slideIndex > 0){
					//added because there is no close slides log message.
					if(!array_key_exists($slideIndex-1, $slides))
						$slides[$slideIndex-1] = $stepTime; // as prior to this there was a slide open.
					else 
						$slides[$slideIndex-1] += $stepTime;
					$slideIndex = -1;
					$slidesOpen = false;
				}

				if($method === "ui-action"){
					$type = $newMessage['type'];
					if($type === "menu-choice"){
						//a new node created
						$name = $newMessage['name'];
						if($name === 'create-node'){
							$index = -1;
							if(isset($currentNode) && $currentNode->id != null){
								$index = $upObject->getIndex($currentNode->id);
							}

							if(!isset($currentNode)){
								$currentNode = new Node();
							} else if($currentNode != null && count($currentNode->properties) > 0 && $index <0){
								array_push($upObject->nodes, $currentNode);
								$currentNode = new Node();
							} else if($currentNode != null && count($currentNode->properties) > 0 && $index >=0){
								$upObject->nodes[$index] = $currentNode;
								$currentNode = new Node();
							}
							$currentNode->openTimes = 1;
							$currentNode->nodeExist = true;
						} else if($name === "graph-button"){
							$upObject->problemComplete = $newMessage['problemComplete'];
						} else if($name === "done-button"){
							$upObject->problemComplete = $newMessage['problemComplete'];
							$upObject->sessionRunning = false;
						}
						$propertyStartTime = $newMessage['time'];
					} else if($type === "close-dialog-box"){
						if($currentNode != null && $currentNode->name != null){
							if(isset($currentProerty)){
								array_push($currentNode->properties, $currentProperty);
							}
							$index = -1;
							if($currentNode->name != null){
								$index = $upObject->getIndex($currentNode->name);
							}
							//echo print_r($newMessage)."</br>";
							if(strpos($currentNode->id, $newMessage['nodeID']) !== false){
								if($index < 0){
									array_push($upObject->nodes, $currentNode);
								} else {
									//handling conflicts to just make sure that the replication of nodes is minimized. 
									$originalNode = $upObject->nodes[$index];
									if(count($originalNode->properties) == 0){
										$upObject->nodes[$index] = $currentNode;
									} else {
										$num = count($currentNode->properties);
										for($i=0; $i<$num; $i++){
											if($currentNode->properties[$i] != null){
												$pIndex = $originalNode->getIndex($currentNode->properties[$i]->name);
												if($pIndex >=0){
													$originalNode->properties[$pIndex] = $currentNode->properties[$i];
												} else {
													array_push($originalNode->properties, $currentNode->properties[$i]);
												}
											}
										}
										$upObject->nodes[$index] = $originalNode;
									}
								}
								$currentNode = null;
							}
						} else {
							$index = $upObject->getIndex($newMessage['nodeID']);
							if($index >= 0){
								continue;
							}
						}
					} else if($type === "node-delete"){
						//echo print_r($row)."<br/>";
						$deletedNode = $upObject->getNodeFromID($newMessage['nodeID']);
						if($deletedNode == null){
							//node to be deleted is not found for some log missing or something. So creating a node for that and information cant be found.
							$deletedNode = new Node();
							$deletedNode->id = $newMessage['nodeID'];
							$deletedNode->openTimes = 1;
							array_push($upObject->nodes, $deletedNode);
						}
						$deletedNode->nodeExist = false;
						$index = $upObject->getIndex($newMessage['nodeID']);
						$upObject->nodes[$index] = $deletedNode;
					} else if($type === "open-dialog-box"){ 
						if(array_key_exists('node', $newMessage)){
							//node reopened
							$currentNode = $upObject->getNodeFromName($newMessage['node']);
							if($currentNode != null && count($currentNode->properties) > 1){
								$currentNode->openTimes = $currentNode->openTimes+1;
							} else if($currentNode == null){
								// this is for the case when the node has already been given to the student. 
								$currentNode = new Node();
								$currentNode->id = $newMessage['nodeID'];
								$currentNode->openTimes = 1;
								$currentNode->nodeExist = true;
							}
							//otherwise auto created node with the property of description was created.
						} else {
							//node is new after create node node is opened
							if(!isset($currentNode)){
								$currentNode = new Node;
							}
							$currentNode->id = $newMessage['nodeID'];
						}
						$propertyStartTime = $newMessage['time'];
					} else if($type === "window"){
						$upObject->sessionRunning = false;
						//$resetVariable = true;
					} else if($type === "slide-change"){
						$slideIndex = $newMessage['slide'];
						$slidesOpen = true;
					}
				} else if($method === "solution-step"){
					$type = $newMessage['type'];
					if($type === "solution-check"){
						$autoCreated = false;
						$newNode;
						$pushNodeBack = false; // in case of some discrepency in log order the solution check message is sent after the node has been closed.
						if($currentProperty == null || !isset($currentProperty)){
							$currentProperty = new Property();
						}
						
						$currentProperty->name = $newMessage['property'];
						$nodeID = $newMessage['nodeID'];
						
						if($currentNode == null){
							$newNode = $upObject->getNodeFromID($nodeID);
							if($newNode == null){
								//for some reason node was not found and no node was opened. so we will go get the node
								$newNode = new Node();
								$newNode->name = $newMessage['node'];
								$newNode->id = $nodeID;
								$newNode->openTimes = 1;
								$newNode->nodeExist = true;
							}
							//$currentNode = $newNode;
							$pushNodeBack = true;
						}
						
						//hack for a not correctly ordered opening a node message.
						if($currentNode != null && $currentNode->id == "")
							$currentNode->id = $newMessage['nodeID'];

						//a hack for earlier messages when checkResult was missing for testing. This has been fixed in JS and it will never go to the else case.
						if(array_key_exists('checkResult', $newMessage))
							$checkResult = $newMessage['checkResult'];
						else
							$checkResult = "CORRECT";
						
						$currentIndex = -1;

						if($newMessage['property'] == "description"){
							$newNode = $upObject->getNodeFromName($newMessage['node']);
							if($currentNode != null && count($currentNode->properties) >= 1){
								//case when auto created. check if the currently autocreated node was not already deleted
								$autoCreated = true;
								if($newNode == null){
									$newNode = new Node();
									$newNode->name = $newMessage['node'];
									$newNode->id = $nodeID;
									$newNode->openTimes = 0;
									$newNode->nodeExist = true;
								} else {
									$newNode->id = $newNode->id."|".$newMessage['nodeID'];
									$newNode->nodeExist = true;
								}
							}else if($newNode != null && strpos($newNode->id, $newMessage['nodeID']) === false && !($newNode->nodeExist)){
								//case 1 deleted and recreated node.
								$currentNode = $newNode;
								$currentNode->id = $currentNode->id."|".$newMessage['nodeID'];//added new id as well to the previous deleted id
								$currentNode->nodeExist = true;
							} else if($newNode == null && $currentNode != null && strpos($currentNode->id, $newMessage['nodeID']) === false){
								// case when no node exists and an out of order message. this issue has been fixed but still for fall 14 analysis it is needed
								$newNode = new Node();
								$newNode->name = $newMessage['node'];
								$newNode->id = $nodeID;
								$newNode->openTimes = 0;
								$newNode->nodeExist = true;
								$pushNodeBack = true;
							} else if($currentNode != null){
								$currentNode->name = $newMessage['node'];
							} else if($currentNode == null){
								//because the description call is for none of the above cases which should mean that create node and open node messages were missing. so creating a current node.
								$currentNode = new Node();
								$currentNode->id = $nodeID;
								$currentNode->openTimes = 1;
								$currentNode->nodeExist = true;
								$pushNodeBack = false;
							}
						} else {
							//when some other property came and is not for the current node. this is primarily because some log messages just didnt reach the database
							if($currentNode!=null && strpos($currentNode->id, $newMessage['nodeID']) === false){
								$pushNodeBack = true;
								$newNode = $upObject->getNodeFromName($newMessage['node']);
								if($newNode != null && !($newNode->nodeExist)){
									//the node was deleted and without the description for re creation did not reach. so just start from the value that you have.
									$newNode->id = $newNode->id."|".$newMessage['nodeID'];
									$newNode->nodeExist = true;
								} else if($newNode == null) {
									$newNode = new Node();
									$newNode->id = $newMessage['nodeID'];
									$newNode->name = $newMessage['node']; //has come after description so the node name will always be there.
									$newNode->openTimes = 1;
									$newNode->nodeExist = true;
								}
							} else if($currentNode == null && count($upObject->nodes) == 0){
								//first message is out of order
								$currentNode = new Node();
								$currentNode->id = $newMessage['nodeID'];
								$currentNode->name = $newMessage['node'];
								$currentNode->nodeExist = true;
								$currentNode->openTimes = 1;
							}
						}

						array_push($currentProperty->status, $checkResult);
						$totalChecks = $totalChecks + 1;

						if($checkResult === "CORRECT"){
							$currentProperty->time = $newMessage['time']-$propertyStartTime;

							$currentProperty->correctValue = $newMessage['value'];
							if(!$autoCreated && !$pushNodeBack){
								//in case the node was autocreated then we cant update the property start time as equation time is coming wrong.
								$currentIndex = $currentNode->getIndex($currentProperty->name);
								if($currentIndex >= 0){
									//case where the current property anwers need to be pushed and time needs to be added)
									$tempProperty = $currentNode->getPropertyFromName($currentProperty->name);
									$tempProperty->time = $tempProperty->time + $currentProperty->time;
									$tempProperty->answers = array_merge($tempProperty->answers, $currentProperty->answers);
									$tempProperty->status = array_merge($tempProperty->status, $currentProperty->status);
									$currentNode->properties[$currentIndex] = $tempProperty;
								} else {
									array_push($currentNode->properties, $currentProperty);
								}

								$propertyStartTime = $newMessage['time'];
								$currentProperty = null;
							}
						} else if($checkResult === "INCORRECT"){
							array_push($currentProperty->answers, $newMessage['value']);
							$incorrectChecks = $incorrectChecks+1;
							$currentProperty->correctValue = $newMessage['correctValue'];
							if($newMessage['solutionProvided'] == "true" && !$autoCreated){
								array_push($currentProperty->status, "DEMO");
								$currentProperty->time = $newMessage['time'] - $propertyStartTime;
								$propertyStartTime = $newMessage['time'];
								//echo "row - ".print_r($row)."</br>";

								$currentIndex = $currentNode->getIndex($currentProperty->name);
								if($currentIndex >= 0){
									//case where the current property anwers need to be pushed and time needs to be added)
									$tempProperty = $currentNode->getPropertyFromName($currentProperty->name);
									$tempProperty->time = $tempProperty->time + $currentProperty->time;
									$tempProperty->answers = array_merge($tempProperty->answers, $currentProperty->answers);
									$tempProperty->status = array_merge($tempProperty->status, $currentProperty->status);
									$currentNode->properties[$currentIndex] = $tempProperty;
								} else {
									array_push($currentNode->properties, $currentProperty);
								}
								$currentProperty = null;
								$autoCreated = false;
								$pushNodeBack = false;
							}
						}
						if($autoCreated || $pushNodeBack){
							if(count($newNode->properties) > 0)
								$currentIndex = $newNode->getIndex($currentProperty->name);
							
							if($currentIndex >= 0){
								$tempProperty = $newNode->getPropertyFromName($currentProperty->name);
								$tempProperty->time = $tempProperty->time + $currentProperty->time;
								$tempProperty->answers = array_merge($tempProperty->answers, $currentProperty->answers);
								$tempProperty->status = array_merge($tempProperty->status, $currentProperty->status);
								$newNode->properties[$currentIndex] = $tempProperty;	
							} else {
								array_push($newNode->properties, $currentProperty);
							}
							$index = $upObject->getIndex($newNode->id);
							if($index < 0){
								array_push($upObject->nodes, $newNode);
							}else{ 
								$upObject->nodes[$index] = $newNode;
							}
							$newNode = null;
							$currentProperty = null;
							$pushNodeBack = false;
							$autoCreated = false;
						}
					}
				} else if($method === "window-focus"){
					$type = $newMessage['type'];
					if($newMessage['time'] > 1 && $type === "in-focus" && !($inFocus)){
						//window came back in focus
						$outOfFocusTime += $stepTime; // as previous message will be for out of focus.
						$inFocus = true;
					} else if($type === "out-of-focus"){
						$inFocus = false;
					}
				} else if($method === "close-problem"){
					//$resetVariables = true;
					$upObject->sessionRunning = false;
				}

				if($resetVariables){
					if($totalChecks >0){
						$errorRatio = $incorrectChecks/$totalChecks;
					}

					$diff = strtotime($currentTime) - strtotime($row['time']) - $newMessage['time'];
					if($upObject->sessionRunning && $diff > 7200){
						$upObject->sessionRunning = false;
					}

					$upObject->wastedTime = $timeWasted/60;
					$upObject->totalTime = $sessionTime/60;
					$upObject->outOfFocusTime = $outOfFocusTime/60;
					$upObject->focusTime = ($sessionTime - $outOfFocusTime)/60;
					$upObject->openTimes = $problemReOpen;
					$upObject->incorrectChecks = $incorrectChecks;
					$upObject->totalSolutionChecks = $totalChecks;
					$upObject->errorRatio = $errorRatio;
					$upObject->slides = $slides;
					array_push($objectArray, $upObject);
				}
				$oldRow = $row;
				$oldMessage= $newMessage;
				$timeSkip = false;
			}
			
			if($totalChecks >0){
				$errorRatio = $incorrectChecks/$totalChecks;
			}

			$diff = strtotime($currentTime) - strtotime($row['time']) - $newMessage['time'];
			if($upObject->sessionRunning && $diff > 7200){
				$upObject->sessionRunning = false;
			}

			$upObject->wastedTime = $timeWasted/60;
			$upObject->totalTime = $sessionTime/60;
			$upObject->outOfFocusTime = $outOfFocusTime/60;
			$upObject->focusTime = ($sessionTime - $outOfFocusTime)/60;
			$upObject->openTimes = $problemReOpen;
			$upObject->incorrectChecks = $incorrectChecks;
			$upObject->totalSolutionChecks = $totalChecks;
			$upObject->errorRatio = $errorRatio;
			$upObject->slides = $slides;
			array_push($objectArray, $upObject);
			
			return $objectArray;
		}
	}

?>
