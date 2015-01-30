<?php
	class UserProblemObject{
		public $problem;
		public $user;
		public $mode;
		public $totalTime; // total time for which the session is running
		public $outOfFocusTime; // time when the window was out of focus
		public $wastedTime; // for a long time when nothing was done, no logs for 420 seconds.
		public $focusTime; // exact time for which the problem was solved, can calculated normally just like totalTime - wastedTime - outOfFocustTime.
		public $problemComplete;
		public $problemReOpen;
		public $openTimes;
		public $sessionRunning;
		public $incorrectChecks;
		public $totalSolutionChecks;
		public $errorRatio;
		public $slides = array();
		public $nodes = array();

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
			foreach($allNodes as $node){
				if($nodeName == $node->name || strpos($node->id, $nodeName) !== false){
					return $i;
				}
				$i += 1;
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
		public $time;
		public $correctValue;
		public $status = array();
		public $answers = array();
	}
?>
