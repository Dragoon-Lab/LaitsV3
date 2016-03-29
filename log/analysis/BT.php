<?php
	include "data.php";
	include "problemObject.php";
	
	$uniqueSchemas = true;

	runBT();
	function initBT(){
		$m = new StudentModel();

		return $m;
	}
	//based on the initial values it will calculate the posterior value
	//this will become priori value for the next step
	function calculatePosterior($studentModel, $problem, $node, $property){
		$guess = getGuessFactor();
		$slip = getSlipFactor();
		$transition = getTransitionFactor();
		$ck = calculateCurrentknowledge($node);
		$schemas = $uniqueSchemas ? $node->uniqueSchemas : $node->schemas;

		$posterior = array();
		if($property->value == "CORRECT"){
			foreach($schemas as $schema){
				$posterior[$schema] = $ck*(1 - $slip) + $user->model[$schema]*((1-$ck/$user->model[$schema])*$guess)/($ck*(1-$slip) + (1-$ck)*$guess);
			}
		} else if($property->value == "INCORRECT"){
			foreach($schemas as $schema){
				$posterior[$schema] = $ck*$slip + $user->model[$schema]*((1-$ck/$user->model[$schema])*(1 - $guess))/($ck*$slip + (1-$ck)*(1 - $guess));
			}
		} else {
			echo "something is wrong, unknown value of property ".$property->value."<br/>";
		}
	}

	function runBT(){
		$objs = main();
		$problem = null;
		foreach($objs as $usr){
			$usr->model = initBT();
			foreach($usr->pNodes as $node){
				if($problem == null || $node->problem != $problem->getName())
					$problem = new Problem($node->problem);
				$schemas = $uniqueSchemas ? $node->uniqueSchemas : $node->schemas;
				foreach($schemas as $schema){
					$usr->model->initiateSchema($schema);
				}

				foreach($node->properties as $property){
					$posterior = $calculatePosterior($usr->model, $problem, $node, $property);

					foreach($posterior as $schema => $val)
						$user->model->setKnowledge($schema, $val);
					$property->posterior = calcualateCurrentKnowledge($usr, $node);
				}
			}
		}

		return $objs;
	}

	function getGuessFactor($problem, $node, $property){
		switch($property){
			case "type":
				$guess = 1/3;
				break;
			case "initial":
				$guess = 1/$problem->getAccParNodeCount();
				break;
			case "units":
				$allUnits = $problem->getAllUnits();
				$guess = 1/count($allUnits);
				break;
			case "equation":
				$value = $problem->getValue($node, $property);
				if($value != null){
					switch(count(explode($value, $id))){
						case 0:
							$guess = 0;
							break;
						case 1:
							$guess = 1/count($problem->getNodeCount());
							break;
						default:
							$guess = 0.05;
					}
				}
			default:
				$guess = 0.1;
		}
	}

	function getTransitionFactor(){
		return 0.3;
	}

	function getSlipFactor($problem, $node, $property){
		switch($property){
			case "type":
				$slip = 1/6;
				break;
			case "initial":
				$slip = 0.3;
				break;
			case "units":
				$slip = $getGuessFactor($problem, $node, $property)/2;
				break;
			case "expression":
				$value = $problem->getValue($node, $property);
				switch(count(explode($value, "id"))){
					case 0:
						$slip = 0;
					case 1:
						$slip = 0.2;
						break;
					case 2:
						$slip = 0.4;
						break;
					case 3:
						$slip = 0.45;
						break;
					default:
						$slip = 0.5;
				}
				break;
			default:
				$slip = 0.1;
				break;
		}

		return $slip;
	}

	function calculateCurrentKnowledge($user, $node){
		$prob = 1;
		$schemas = $multiplyUnique ? $node->uniqueSchemas : $node->schemas;
		foreach($schemas as $schema){
			$prob *= $user->model[$schema];
		}

		return $prob;
	}

	function printBTvalues($objs){
		$data = array();
		$tab = "\t";
		$newLine = "\n";
		$heading = "user".$tab."problem".$tab."node".$tab."property".$tab."status".$tab."posterior".$newLine;
		array_push($data, $heading);
		$fileName = "BayesianModel.csv";
		foreach($objs as $usr){
			$strUsr = $usr->codeName.$tab;
			foreach($usr->pNodes as $node){
				$strNode = $strUser.$node->problem.$tab.$node->name.$tab;
				foreach($node->properties as $property){
					$line = $strNode.$property->name.$tab;
					if($property->value == "CORRECT")
						$line .= 1.$tab;
					else 
						$line .= 0.$tab;

					$line .= $property->posterior.$newLine;

					array_push($data, $heading);
				}
			}
		}

		$file = fopen($fileName, "w");
		foreach($data as $row)
			fwrite($file, $row);
	}

	public class StudentModel{
		private $knowledge = array();
		private static $initialKnowledge = 0.1;

		function getKnowledge($schema){
			if(!array_key_exists($this->knowledge, $schema)){
				$this->knowledge[$schema] = $this->initialKnowledge;

			return $this->knowledge[$schema];
		}

		function setKnowledge($schema, $val){
			$this->knowledge[$schema] = $val;
		}

		function initiateSchema($schema){
			if(!in_array($schema, $knowledge){
				$knowledge[$schema]  = self::initialKnowledge;
			}
		}
	}
?>
