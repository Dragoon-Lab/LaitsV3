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

		function getQuery($section, $mode, $user, $problem, $fromTime, $fromDate, $toTime, $toDate){
			$userString = "AND user = '".$user."' ";
			$problemString = "AND problem = '".$problem."' ";
			$fromTimeString =  "AND time >= '".$fromDate." ".$fromTime."' ";
			$toTimeString = "AND time <= '".(!empty($toDate)?$toDate:$fromDate)." ".$toTime."' ";
			$queryString = 
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
			"ORDER BY user asc, problem asc, tid asc;";
			//$queryString = "SELECT tid, session.session_id, user, problem, time, method, message, `group` from session JOIN step ON session.session_id = step.session_id where method != 'client-message' AND mode = 'STUDENT' AND user = '202gold' AND problem = '115' ORDER BY user asc, problem asc, tid asc;";

			return $queryString;
		}

		function parseMessages($result){
			$resetVariables = true;
			$sessionTime; $outOfFocusTime; $timeWasted	;
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
			while($row = $result->fetch_assoc()){
				if($resetVariables){
					$sessionTime = 0; $outOfFocusTime = 0; $timeWasted=0;
					$problemReOpen = 1;
					$oldRow = $row;
					$upObject = new UserProblemObject ();
					$upObject->sessionRunning = true;
					$upObject->problemComplete = false;
					$upObject->problemReOpen = false;
					$totalChecks = 0; $incorrectChecks=0;
					$errorRatio = 0;
					$currentProperty = null;
					$nodeUpdate = false;
					$upObject->problem = $row['problem'];
					$upObject->user = $row['user'];
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
						$stepTime = 0;
						$upObject->sessionRunning = true;
						$problemReOpen +=1;
						$upObject->problemReOpen = true;
						$timeSkip = true;
					} else {
						$resetVariables = true;
						$timeSkip = true;
						//array_push($objectArray, $upObject);
					}
				}

				$stepTime = $newMessage['time'] - $oldMessage['time'];
				if($stepTime > $this->al->getActionTime() && $method != "window-focus"){
					$timeWasted += $stepTime;
				}
				if(!$timeSkip)
					$sessionTime += $stepTime;
				
				if($slidesOpen && $slideIndex > 0){
					//added because there is no close slides log message.
					//echo print_r($newMessage)."</br>".$stepTime." ".$slideIndex;
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
							if($currentNode->id == $newMessage['nodeID']){
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
						//echo print_r($newMessage)."</br>".$stepTime." ".$slideIndex;
						
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
							if($newMessage['property'] != "description" && $newNode == null){
								//for some reason node was not found and no node was opened. so we will go get the node
								$newNode = new Node();
								$newNode->name = $newMessage['node'];
								$newNode->id = $nodeID;
								$newNode->openTimes = 1;
								$newNode->nodeExist = true;
								$pushNodeBack = true;
							} else if($newMessage['property'] === "description"){
								// this means that current node did not exist.. the description for which solution is checked is a new node and for some reason open node log is missing.
								$propertyStartTime = $oldMessage['time'];
								$currentNode = new Node();
								$currentNode->id = $nodeID;
								$currentNode->name = $newMessage['node'];
								$currentNode->openTimes = 1;
								$currentNode->nodeExist = true;
							} else if($newNode != null){
								$pushNodeBack = true;
							}
						} else if($currentNode->id != $newMessage['nodeID']){
							// the case when the property check does not belong to the currentNode
							if($newMessage['property'] === "description"){
								// then the node is mostly autocreated
								$newNode = new Node();
								$newNode->openTimes = 1;
								$newNode->nodeExist = true;
								$newNode->name = $newMessage['node'];
								$newNode->id = $newMessage['nodeID'];
								$autoCreated = true;
							} else {
								$newNode = $upObject->getNodeFromID($nodeID);
								if($newNode == null){
									//for some reason node was not found and no node was opened. so we will go get the node
									$newNode = new Node();
									$newNode->name = $newMessage['node'];
									$newNode->id = $nodeID;
									$newNode->openTimes = 1;
									$newNode->nodeExist = true;
								}
								$pushNodeBack = true;
							}
						} else {
							//normal case
							$currentNode->name = $newMessage['node'];
							$tempNode = $upObject->getNodeFromID($nodeID);
							if($tempNode != null){
								$currentNode = $tempNode;
								$nodeUpdate = true;
							}
						}

						//a hack for earlier messages when checkResult was missing for testing. This has been fixed in JS and it will never go to the else case.
						if(array_key_exists('checkResult', $newMessage))
							$checkResult = $newMessage['checkResult'];
						else
							$checkResult = "CORRECT";
						
						array_push($currentProperty->status, $checkResult);						
						$totalChecks = $totalChecks + 1;

						if($checkResult === "CORRECT"){
							$currentProperty->time = $newMessage['time']-$propertyStartTime;
							$propertyStartTime = $newMessage['time'];
							$currentProperty->correctValue = $newMessage['value'];
							if(!$autoCreated && !$pushNodeBack){
								array_push($currentNode->properties, $currentProperty);
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
								array_push($currentNode->properties, $currentProperty);
								$currentProperty = null;
							}
						}
						if($autoCreated || $pushNodeBack){
							array_push($newNode->properties, $currentProperty);
							$index = $upObject->getIndex($newNode->id);
							if($index < 0)
								array_push($upObject->nodes, $newNode);
							else 
								$upObject->nodes[$index] = $newNode;
							$newNode = null;
							$currentProperty = null;
							$pushNodeBack = false;
							$autoCreated = false;
						}
					}
				} else if($method === "window-focus"){
					$type = $newMessage['type'];
					//echo print_r($row)." reset variable -> ".$resetVariables." <- <br/>";
					if($newMessage['time'] > 1 && $type === "in-focus"){
						//window came back in focus
						$outOfFocusTime += $stepTime; // as previous message will be for out of focus.
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
					$upObject->openTimes = $problemReOpen;
					$upObject->incorrectChecks = $incorrectChecks;
					$upObject->totalSolutionChecks = $totalChecks;
					$upObject->errorRatio = $errorRatio;
					$upObject->slides = $slides;
					array_push($objectArray, $upObject);
				}else{
					$oldRow = $row;
					$oldMessage= $newMessage;
					$timeSkip = false;
				}
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
