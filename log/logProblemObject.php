<?php
	class UserProblemObject{
		public $problem;
		public $user;
		public $mode;
		public $activity;
		public $group;
		public $totalTime; // total time for which the session is running
		public $outOfFocusTime; // time when the window was out of focus
		public $wastedTime; // for a long time when nothing was done, no logs for 420 seconds.
		public $focusTime; // exact time for which the problem was solved, can calculated normally just like totalTime - wastedTime - outOfFocustTime.
		public $problemComplete;
		public $problemReOpen;
		public $openTimes;
		public $sessionRunning;
		public $incorrectChecks;
		public $incorrectNodes = array();
		public $totalSolutionChecks;
		public $errorRatio;
		public $slides = array();
		public $nodes = array();
		public $sessions = array();

		function getNodeFromName($checkName){
			$allNodes = $this->nodes; // BvdS:  my editor complained about this line, but it wouldn't tell me what was wrong
			$resultNode = null;
			foreach($allNodes as $node){
				if($checkName == $node->name){
					$resultNode = $node;
					break;
				}
			}
			return $resultNode;
		}

		function getIndex($nodeName){
			$allNodes = $this->nodes;
			$i = 0;
			if($nodeName != null || $nodeName != ""){
				foreach($allNodes as $node){
					if($nodeName == $node->name || strpos($node->id, $nodeName) !== false){
						return $i;
					}
					$i += 1;
				}
			}
			return -1;
		}

		function getNodeFromID($nodeID){
			$allNodes = $this->nodes;
			$resultNode = null;
			foreach($allNodes as $node){
				if(strpos($node->id, $nodeID) !== false){
					$resultNode = $node;
					break;
				}
			}
			return $resultNode;
		}
	}

	Class Session{
		public $timeStamp;
		public $isProblemChanged = false; //tells if node was changed in this session
		public $isGraphOpened = false; //tells if graph was opened during this session. 
		public $time; // this is session time, which is equivalent to last logging time - wasted time
		public $lastLogTime; // last log message time to know absolute time as well
		//public $isGraphManipulated;
		public $graphs = array(); // holds graph actions details of this session
		public $nodesChanged = array(); // holds the nodes that have been changed in the session
	}

	class Node{
		public $name;
		public $id;
		public $nodeExist;
		public $openTimes;
		public $properties = array();

		function getPropertyFromName($name){
			$allProperties = $this->properties;
			$resultProperty = null;
			$property;
			foreach($allProperties as $property){
				if($name == $property->name){
					$resultProperty = $property;
					break;
				}
			}

			return $resultProperty;
		}

		function getIndex($name){
			$allProperties = $this->properties;
			$i = 0;
			if($allProperties != null){
				foreach($allProperties as $property){
					if($property != null && $name == $property->name){
						return $i;
					}
					$i += 1;
				}
			}

			return -1;
		}
	}

	class Property{
		public $name;
		public $sessionTimeStamp;
		public $time = 0;
		public $correctValue = array();
		public $status = array();
		public $answers = array();
		public $values = array();
	}

	/* this is the object for two UI actions uptill now
	* Graph/Table UI actions - value = true/false when graph has been changed
	* Property enterning of node - value = property value that was added. For each value entering there is one action.
	*/
	class Action{
		public $startTime;
		public $sessionStamp;
		public $endTime;
		public $actionTime;
		public $value;
	}
?>
