<?php
	class UserProblemObject{
		private $problem;
		private $user;
		private $totalTime; // total time for which the session is running
		private $outOfFocusTime; // time when the window was out of focus
		private $wastedTime; // for a long time when nothing was done, no logs for 420 seconds.
		private $problemComplete;
		private $problemReOpen;
		private $sessionRunning;
		private $incorrectChecks;
		private $totalSolutionChecks;
		private $errorRatio;
		private $nodes = array();

		//getter setters for each
		function setProblem($value){
			$this->problem = $value;
		}

		function getProblem(){
			return $this->problem;
		}

		function setUser($value){
			$this->user = $value;
		}

		function getUser(){
			return $this->user;
		}

		function setTotalTime($value){
			$this->totalTime = $value;
		}

		function getTotalTime(){
			return $this->totalTime;
		}

		function setOutOfFocusTime($value){
			$this->outOfFocusTime = $value;
		}

		function getOutOfFocusTime(){
			return $this->outOfFocusTime;
		}

		function setWastedTime($value){
			$this->wastedTime = $value;
		}

		function getWastedTime(){
			return $this->wastedTime;
		}

		function setProblemComplete($value){
			$this->problemComplete = $value;
		}

		function getProblemComplete(){
			return $this->problemComplete;
		}

		function setProblemReOpen($value){
			$this->problemReOpen = $value;
		}

		function getProblemReOpen(){
			return $this->problemReOpen;
		}

		function setSessionRunning($value){
			$this->sessionRunning = $value;
		}

		function getSessionRunning(){
			return $this->sessionRunning;
		}

		function setIncorrectChecks($value){
			$this->incorrectChecks = $value;
		}

		function getIncorrectChecks(){
			return $this->incorrectChecks;
		}

		function setTotalSolutionChecks($value){
			$this->totalSolutionChecks = $value;
		}

		function getIncorrectChecks(){
			return $this->incorrectChecks;
		}

		function setErrorRatio($value){
			$this->errorRatio = $value;
		}

		function getErrorRatio(){
			return $this->errorRatio;
		}

		function setNodes($value){
			array_push($this->nodes, $value);
		}

		function getNodes(){
			return $this->nodes;
		}

		function getNodeFromName($name){
		  var $allNodes = this->getNodes(); // BvdS:  my editor complained about this line, but it wouldn't tell me what was wrong
			var $resultNode = null;
			foreach($allNodes as $node){
				if($name == $node->getName()){
					$resultNode = $node;
					break;
				}
			}

			return $resultNode;
		}
	}

	class Node{
		private $name;
		private $nodeExist;
		private $openTimes;
		private $properties = array();

		function setName($value){
			$this->name = $value;
		}

		function getName(){
			return $this->name;
		}

		function setNodeExist($value){
			$this->nodeExist = $value;
		}

		function getNodeExist(){
			return $this->nodeExist;
		}

		function setOpenTimes($value){
			$this->openTimes = $value;
		}

		function getOpenTimes(){
			return $this->openTimes;
		}

		function setProperties($value){
			array_push($this->properties, $value);
		}

		function getProperties(){
			return $this->properties;
		}

		function getPropertyFromName($name){
			var $allProperties = this->getProperties();
			var $resultProperty = null;
			var $property;
			foreach($allProperties as $property){
				if($name == $property->getName()){
					$resultProperty = $property;
					break;
				}
			}

			return $resultNode
		}
	}

	class Property{
		private $name;
		private $time;
		private $correctValue;
		private $status = array();
		private $answers = array();

		function setName($value){
			$this->name = $value;
		}

		function getName(){
			return $this->name;
		}

		function setTime($value){
			$this->time = $value;
		}

		function getTime(){
			return $this->time;
		}

		function setCorrectValue($value){
			$this->correctValue = $value;
		}

		function getCorrectValue(){
			return $this->correctValue;
		}

		function setStatus($value){
			array_push($this->status, $value);
		}

		function getStatus(){
			return $this->status;
		}

		function setAnswers($value){
			array_push($this->answers, $value);
		}

		function getAnswers(){
			return $this->answers;
		}
	}
?>
