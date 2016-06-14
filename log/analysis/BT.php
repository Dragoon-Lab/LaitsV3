<?php
	include "data.php";
	//include "problemObject.php";
	
	$uniqueSchemas = true;
	$sameTransition = false;
	set_time_limit(300000);

	BTmain();
	function initBT(){
		$m = new StudentModel();

		return $m;
	}
	//based on the initial values it will calculate the posterior value
	//this will become priori value for the next step
	function calculatePosterior($user, $problem, $node, $property){
		$guess = getGuessFactor($problem, $node, $property);
		$slip = getSlipFactor($problem, $node, $property);
		//echo "**********************************************<br/>";
		//echo "guess ".$guess." slip ".$slip." property ".$property->name." node ".$node->name." solution check ".$property->value."<br/>";
		$transition = getTransitionFactor();
		$ck = calculateCurrentKnowledge($user, $node);
		$schemas = $GLOBALS["uniqueSchemas"] ? $node->uniqueSchemas : $node->schemas;
		//echo "schemas involved ".json_encode($schemas)."<br/>";
		$posterior = array();
		foreach($schemas as $schema){
			$k = $user->model->getKnowledge($schema);
			//echo $schema." knowledge ".$k."<br/>";
			if($property->value == "CORRECT"){
				$posterior[$schema] = ($ck*(1 - $slip) + $k*((1- ($ck/$k))*$guess))/($ck*(1-$slip) + (1-$ck)*$guess);
			} else if($property->value == "INCORRECT"){ // && $guess != 1){
				$posterior[$schema] = ($ck*$slip + $k*(1 - ($ck/$k))*(1 - $guess))/($ck*$slip + (1-$ck)*(1 - $guess));
			} /*else if($property->value == "INCORRECT" && $guess == 1){
				$posterior[$schema] = $k;
			}*/ else {
				echo "something is wrong, unknown value of property ".$property->value."<br/>";
			}
		}
		//echo "posterior calculated ".json_encode($posterior)."<br/>";

		return $posterior;
	}

	function runBT($objs){
		$problem = null;
		$BTindex = 0;
		$objsCount = count($objs);
		$i = 0;
		$loopCount = 0;
		foreach($objs as $usr){
			$usr->model = initBT();
			$nodesCount = count($usr->pNodes);
			$j = 0;
			foreach($usr->pNodes as $node){
				$node = $usr->pNodes[$j];
				if($problem == null || $node->problem != $problem->getName())
					$problem = new Problem($node->problem);

				$schemas = $GLOBALS["uniqueSchemas"] ? $node->uniqueSchemas : $node->schemas;
				foreach($schemas as $schema){
					$usr->model->initiateSchema($schema);
				}

				$k = 0;
				foreach($node->properties as $property){
					//echo $loopCount."<br/>";
					$posterior = calculatePosterior($usr, $problem, $node, $property);

					foreach($posterior as $schema => $val){
						$usr->model->setKnowledge($schema, $val);
					}

					$priori = array();
					if($GLOBALS["sameTransition"])
						$priori = calculatePriori($usr, $node);
					else
						$priori = calculateSchemaPriori($usr, $node);
					
					foreach($priori as $schema => $val)
						$usr->model->setKnowledge($schema, $val);
					
					//echo print_r($usr->model)."<br/>";
					$property->posterior = calculateCurrentKnowledge($usr, $node);
					$property->knowledge = $usr->model->getKnowledgeArray();
					$node->properties[$k] = $property;
					$k++;
					//echo json_encode($property)."<br/>";
					$loopCount++;
				}
				$usr->pNodes[$j] = $node;
				$j++;
			}
			$obj[$i] = $usr;
			$i++;
		}

		//echo json_encode($objs);
		return $objs;
	}
	
	//this function multiplies the transition probability to the posteriori of the step which becomes the priori for next step.
	function calculatePriori($user, $node){
		$schemas = $GLOBALS["uniqueSchemas"] ? $node->uniqueSchemas : $node->schemas;
		$prob = array();
		$transition = getTransitionFactor();
		foreach($schemas as $schema){
			$k = $user->model->getKnowledge($schema);
			$prob[$schema] = (1 - $k)*$transition["learn"] + (1 - $transition["forget"])*$k;
		}

		return $prob;
	}

	function getGuessFactor($problem, $node, $property){
		$guess = 1;
		switch($property->name){
			case "type":
				$guess = 1/3;
				break;
			case "initial":
				$guess = 1/$problem->getAccParNodeCount();
				break;
			case "units":
				$allUnits = $problem->getAllUnits();
				$guess = 1/(count($allUnits) + 1);
				break;
			case "equation":
				$value = $problem->getValue($node->name, $property->name);
				if($value != null){
					$count = count(explode("id", $value)) - 1;
					switch($count){
						case "0":
							$guess = 0;
							break;
						case "1":
							$guess = 1/count($problem->getNodeCount());
							break;
						default:
							$guess = 0.05;
					}
				}
				break;
			case "description":
				$guess = $problem->getInModelNodeRatio();
				break;
			default:
				$guess = 0.3;
		}

		return $guess;
	}

	function getTransitionFactor(){
		return array("learn"=> 0.05, "forget" => 0.05);
	}

	function getSchemaTransitionFactor($schema){
		$transitionFactor = array(
			"linear_transfer" => array("learn" => 0.2, "forget" => 0.0),
			"exponential_transfer" => array("learn" => 0.2, "forget" => 0.0)
		);

		return array_key_exists($schema, $transitionFactor) ? $transitionFactor[$schema] : null;
	}

	function calculateSchemaPriori($user, $node){
		//$s is the schema for which the priori has to be calculated
		$schemas = $node->uniqueSchemas;
		$t = array();
		$k = array();

		foreach($schemas as $schema){
			$t[$schema] = getSchemaTransitionFactor($schema);
			$k[$schema] = $user->model->getKnowledge($schema);
		}

		$keys = array_keys($k);
		$priori = array();
		if(count($keys) == 2){
			$ok = ""; //other key
			foreach($k as $key => $value){
				$s = $key;
				foreach($keys as $key){
					if($key != $s){
						$ok = $key;
					}
				}
				$priori[$s] = $k[$s] * (1 - $t[$s]["forget"]) + ((1 - $k[$s])*$t[$s]["learn"]*($k[$ok]*(1 - $t[$ok]["forget"]) + ((1 - $k[$ok])*$t[$ok]["learn"])));
			}
		} else {
			// for now there are only two schemas so the other case is 1
			$s = $keys[0];
			$priori[$s] = $k[$s]*(1 - $t[$s]["forget"]) + (1 - $k[$s])*$t[$s]["learn"];
		}

		return $priori;
	}

	function getSlipFactor($problem, $node, $property){
		switch($property->name){
			case "type":
				$slip = 0.1;
				break;
			case "initial":
				$slip = 0.1;
				break;
			case "units":
				$flag = 1-getGuessFactor($problem, $node, $property);
				$slip = $flag > 0.1 ? 0.1 : flag ;
				break;
			case "equation":
				$value = $problem->getValue($node->name, $property->name);
				if($value != null){
					$count = count(explode("id", $value)) - 1;
					switch($count){
						case "0":
							$slip = 0;
							break;
						case "1":
							$slip = 0.1;
							break;
						case "2":
							$slip = 0.15;
							break;
						case "3":
							$slip = 0.2;
							break;
						default:
							$slip = 0.25;
					}
				}
				break;
			default:
				$slip = 1 - getGuessFactor($problem, $node, $property);
				break;
		}

		return $slip;
	}

	function calculateCurrentKnowledge($user, $node){
		$prob = 1;
		$schemas = $GLOBALS["uniqueSchemas"] ? $node->uniqueSchemas : $node->schemas;
		foreach($schemas as $schema){
			$prob *= $user->model->getknowledge($schema);
		}

		return $prob;
	}

	function printBTvalues($objs){
		echo "writing data to file<br/>";
		$data = array();
		$tab = ",";
		$newLine = "\n";
		$heading = "user".$tab."problem".$tab."node".$tab."schemas".$tab."property".$tab."status".$tab."posterior".$tab."linear_transfer".$tab."exponential_transfer".$newLine;
		array_push($data, $heading);
		$fileName = "BayesianModel.csv";
		$finalSchemas = array("linear_transfer", "exponential_transfer");
		$index = 0;
		foreach($objs as $usr){
			$strUsr = $usr->codeName.$tab;
			foreach($usr->pNodes as $node){
				$str = "";
				foreach($node->schemas as $schema){
					$str .= $schema."| ";
				}
				$strNode = $strUsr.$node->problem.$tab.$node->name.$tab.substr($str, 0, -2).$tab;
				foreach($node->properties as $property){
					$line = $strNode.$property->name.$tab;
					if($property->value == "CORRECT"){
						$line .= "1".$tab;
					} else {
						$line .= "0".$tab;
					}

					$line .= $property->posterior.$tab;

					foreach($finalSchemas as $s){
						if(array_key_exists($s, $property->knowledge))
							$line .= $property->knowledge[$s].$tab;
						else
							$line .= "0".$tab;
					}
					$line1 = (substr($line, 0, -2)).$newLine;

					$index++;
					array_push($data, $line1);
				}
			}
		}

		echo "lines to be written ".count($data)." loop ran for ".$index."<br/>";
		$file = fopen($fileName, "w");
		foreach($data as $row)
			fwrite($file, $row) or die("fwrite failed");
		echo "<br/>writing file to data completed<br/>";
		fclose($file);
	}

	function BTMain(){
		$objs = main();
		$objs = runBT($objs);

		printBTvalues($objs);
	}

	class StudentModel{
		private $knowledge = array();
		private static $initialKnowledge = 0.1;

		function getKnowledge($schema){
			if(!array_key_exists($schema, $this->knowledge)){
				$this->knowledge[$schema] = self::$initialKnowledge;
			}
			return $this->knowledge[$schema];
		}

		function setKnowledge($schema, $val){
			$this->knowledge[$schema] = $val;
		}

		function initiateSchema($schema){
			if(!array_key_exists($schema, $this->knowledge)){
				$this->knowledge[$schema]  = self::$initialKnowledge;
			}
		}

		function getKnowledgeArray(){
			return $this->knowledge;
		}
	}
?>
