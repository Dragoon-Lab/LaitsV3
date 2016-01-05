<?php
	include "problemObject.php";

	$allSchemas = array();//"line_acc_description", "line_acc_type", "line_acc_initial", "line_par_description", "line_acc_equation", "line_par_type", "line_par_initial", "expo_fun_description", "expo_fun_type", "expo_acc_description", "expo_par_description", "expo_fun_equation", "expo_acc_type", "expo_acc_initial", "expo_acc_equation", "expo_par_type", "expo_par_initial", "expo_acc_units", "line_acc_units", "expo_fun_units", "line_par_units", "acce_acc_description", "acce_acc_type", "acce_acc_initial", "acce_fun_description", "acce_acc_equation", "acce_fun_type", "acce_par_description", "acce_fun_equation", "acce_par_type", "acce_par_initial");  //schema(4)_node type(3)count_property
	$allSchemas2 = array(); //schema(4)_node type(3)
	$allSchemas3 = array();//"line_description", "line_type", "line_initial", "line_equation", "expo_description", "expo_type", "expo_equation", "expo_initial", "expo_units", "line_units", "acce_description", "acce_type", "acce_initial", "acce_equation"); //schema(4)_property
	$allSchemas4 = array("description", "type", "initial", "units", "equation");

	main();
	function analyzeLogs(){
		$section = "public-workbook";
		$allSchemas = $GLOBALS["allSchemas"];
		$allSchemas2 = $GLOBALS["allSchemas2"];
		$allSchemas3 = $GLOBALS["allSchemas3"];
		$prob = array(/*"rabbits-sum15",*/ "111", "107", "CPI-2014-ps2-01","isle3-sum15-study", "retirement-sum15","CPI-2014-ps2-02","CPI-2014-ps2-04","CPI-2014-ps3-03","CPI-2014-ps4-02", "CPI-2014-ps3-07", "CPI-2014-ps5-04");
		//$prob = array("CPI-2014-ps5-04");

		$str = '(';
		foreach($prob as $p)
			$str .= "'".$p."', ";
		$problemString = substr($str, 0, -2).")";

		//database variables
		$user = "root";
		$password = "qwerty211";
		$db_name = "laits_experiments";

		$mysqli = mysqli_connect("localhost", $user, $password, $db_name);
		
		$query = <<<EOT
		SELECT t1.user, t1.problem, t1.session_id, t2.method, t2.message FROM (SELECT user, problem, session_id, time FROM session WHERE section = "$section" AND mode = "STUDENT" AND problem IN $problemString) AS t1 JOIN (SELECT tid, method, message, session_id FROM step WHERE method = "solution-step") as t2 USING (session_id) ORDER BY user ASC, problem ASC, time ASC, tid ASC;
EOT;
		//echo $query;

		$result = mysqli_query($mysqli, $query);
		$first = true;
		$currentUser;
		$currentNode = null;
		//$currentProperty = null;
		$users = array();
		$cp = null;

		while($row = $result->fetch_assoc()){
			$cp = new Problem($row["problem"]);
			//echo json_encode($row, true)."<br/>";
			$message = json_decode($row["message"], true);
			//$schemas = $cp->getSchemaForNode($message["node"]);
			if($first){
				$oldRow = $row;
				$oldMessage = $message;
				//$oldSchemas = $schemas;
				$currentUser = new User($row["user"]);
				array_push($currentUser->problemNames, $row["problem"]);
				$first = false;
			}
			if($message["type"] === "solution-check"){
				if($currentUser == null || $currentUser->name != $row['user']){
					if($currentUser != null){
						array_push($users, $currentUser);
					}
					//new user
					$currentUser = new User($row['user']);
					array_push($currentUser->problemNames, $row["problem"]);
					$cp = new Problem($row["problem"]);
				} else if($oldRow["problem"] != $row["problem"]){
					$cp = new Problem($row["problem"]);
					if(!in_array($row["problem"], $currentUser->problemNames)){
						array_push($currentUser->problemNames, $row["problem"]);
					}
				}

				if($currentNode == null){
					$currentNode = createNode($cp, $row);
				}

				if($currentNode->name != $message["node"]){
					/*$i = $cp->getIndex($currentNode->name);
					if($i >= 0){
						$currentUser->pNodes[$i] = $currentNode;
					} else {
						array_push($currentUser->pNodes, $currentNode);
					}*/
					$currentNode->setSkills();
					array_push($currentUser->pNodes, $currentNode);
					$tempNode = $currentUser->getNode($message["node"]);
					$currentNode = createNode($cp, $row);
					if($tempNode != null){
						$currentNode->propertyNames = $tempNode->propertyNames;
						/*foreach($schema in $currentNode->schemas){
							if(!in_array($schema, $allSchemas2){
								array_push($allSchemas, $schema);
							}
						}*/
					}
				}

				if(!in_array($message["property"], $currentNode->propertyNames)){
					if($message["property"] == "description" && (!array_key_exists("checkResult", $message) || 
						array_key_exists("pmInterpretation", $message) && ($message["pmInterpretation"] == "extra" || $message["pmInterpretation"] == "irrelevant"))){
						//this is the case where all the nodes have been creating and user is trying to create still available nodes.
						continue;
					} elseif($cp->getGenus($message["node"]) != "extra" && $cp->getGenus($message["node"]) != "irrelevant"){
					$prop = new Property($message["property"]);
					$prop->value = $message["checkResult"];
					array_push($currentNode->propertyNames, $message["property"]);
					//$prop->skill = $currentNode->type."_".$message["property"];

					$schemas = $currentNode->schemaNames;
					foreach($schemas as $schema){
						$schemaName = $schema."_".$prop->name;
						if(!in_array($schemaName, $allSchemas)){
							array_push($allSchemas, $schemaName);
						}
						$prop->addSchema($schemaName, 1);

						if(!in_array($schema, $allSchemas2)){
							array_push($allSchemas2, $schema);
						}
						$prop->addSchema($schema, 2);

						$schemaName = explode("_", $schema)[0]."_".$prop->name;
						if(!in_array($schemaName, $allSchemas3)){
							array_push($allSchemas3, $schemaName);
						}
						$prop->addSchema($schemaName, 3);
					}
					array_push($currentNode->properties, $prop);
					}
				}
			}

			$oldRow = $row;
		}
		$currentNode->setSkills();
		array_push($currentUser->pNodes, $currentNode);
		array_push($users, $currentUser);
		print_r($allSchemas);
		print_r($allSchemas2);
		print_r($allSchemas3);
		$GLOBALS["allSchemas"] = $allSchemas;
		$GLOBALS["allSchemas2"] = $allSchemas2;
		$GLOBALS["allSchemas3"] = $allSchemas3;
		
		mysqli_close($mysqli);
		return $users;
	}

	function createNode($cp, $row){
		$m = json_decode($row["message"], true);
		$n = new Node($m["node"]);
		$n->problem = $row["problem"];
		$n->schemas = $cp->getSchemasForNode($m["node"]);
		$n->schemaNames = $cp->getNodeSchemaNames($m["node"]);
		$n->difficultyParams = $cp->getDifficultyParams($m["node"]);
		//$n->setSkills();
		$n->type = $cp->getNodeType($m["node"]);

		return $n;
	}

	function createDataRows($objs, $fastData){
		$fileName = "data.train.xls";
		$includeDifficulty = true;
		//$fileName = "data.test.xls";
		if($fastData){
			$fileName = ".cvs";
		}
		
		$allSchemas = $GLOBALS["allSchemas"];
		$allSchemas2 = $GLOBALS["allSchemas2"];
		$allSchemas3 = $GLOBALS["allSchemas3"];
		$allSchemas4 = $GLOBALS["allSchemas4"];

		$data = array();
		$data2 = array();
		$data3 = array();
		$data4 = array();
		$data5 = array();
		$data6 = array();
		$data7 = array();

		$tab = "\t";
		$schemaExist = "2";
		$schemaNotExist = "1";
		$propertyCorrect = "2";
		$propertyIncorrect = "1";
		$kcString = "kc_";
		$schemaNotPresent = "NULL";
		$diffString = "emit_feature_";
		if($fastData){
			$schemaExist = "1";
			$schemaNotExist = "0";
			//$propertyCorrect = ""
			$kcString = "tran_feature_";
		}
		if(!$fastData){
			$text = "user".$tab."skill".$tab;
			$text2 = $text;
			$text3 = $text;
			$text4 = $text;
			$text5 = $text;
			$text6 = $text;
			$text7 = $text;
		} else {
			$text = "student".$tab."KCs".$tab;
			$text2 = $text;
			$text3 = $text;
			$text4 = $text;
			$text5 = $text;
			$text6 = $text;
			$text7 = $text;
		}

		foreach($allSchemas as $schemas){
			$text .= $kcString.$schemas.$tab;
			$text5 .= $kcString.$schemas.$tab;
		}
		
		foreach($allSchemas2 as $schemas){
			$text2 .= $kcString.$schemas.$tab;
			$text6 .= $kcString.$schemas.$tab;
		}

		foreach($allSchemas3 as $schemas){
			$text3 .= $kcString.$schemas.$tab;
			$text7 .= $kcString.$schemas.$tab;
		}

		foreach($allSchemas4 as $schemas){
			$text4 .= $kcString.$schemas.$tab;
		}
		if($includeDifficulty){
			$text .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text2 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text3 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text4 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text5 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text6 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
			$text7 .= $diffString."isolation".$tab.$diffString."cues".$tab.$diffString."phrases".$tab;
		}
		if(!$fastData){
			$text .= "pknow".$tab."check\n";
			$text2 .= "pknow".$tab."check\n";
			$text3 .= "pknow".$tab."check\n";
			$text4 .= "pknow".$tab."check\n";
			$text5 .= "pknow".$tab."check\n";
			$text6 .= "pknow".$tab."check\n";
			$text7 .= "pknow".$tab."check\n";
		} else {
			$text .= "outcome".$tab."problem\n";
			$text2 .= "outcome".$tab."problem\n";
			$text3 .= "outcome".$tab."problem\n";
			$text4 .= "outcome".$tab."problem\n";
			$text5 .= "outcome".$tab."problem\n";
			$text6 .= "outcome".$tab."problem\n";
			$text7 .= "outcome".$tab."problem\n";
		}

		array_push($data, $text);
		array_push($data2, $text2);
		array_push($data3, $text3);
		array_push($data4, $text4);
		array_push($data5, $text5);
		array_push($data6, $text6);
		array_push($data7, $text7);

		foreach($objs as $usr){
			echo $usr->name."<br/>";
			$nodes = $usr->pNodes;
			foreach($nodes as $node){
				$schemas = $node->schemas;
				foreach($node->properties as $property){
					$text = $usr->codeName.$tab.$node->skill[0].$tab;
					$text2 = $usr->codeName.$tab.$node->skill[0].$tab;
					$text3 = $usr->codeName.$tab.$node->skill[0].$tab;
					$text4 = $usr->codeName.$tab.$node->skill[3].$tab;
					$text5 = $usr->codeName.$tab.$node->skill[1].$tab;
					$text6 = $usr->codeName.$tab.$node->skill[1].$tab;
					$text7 = $usr->codeName.$tab.$node->skill[1].$tab;
					foreach($allSchemas as $schema){
						$type = explode("_", $schema)[1];
						if(!$fastData || (
							(strpos($node->skill[0], substr($schema, 0, 4)) !== false) && 
							strpos($node->skill[0], $type) !== false)){
							if(in_array($schema, $property->schemaName)){
								$text .= $schemaExist.$tab;
							} else {
								$text .= $schemaNotExist.$tab;
							}
						} else {
							$text .= $schemaNotPresent.$tab;
						}
					}
					
					foreach($allSchemas as $schema){
						$type = explode("_", $schema)[1];
						if(!$fastData || 
							(strpos($node->skill[1], substr($schema, 0, 4)) !== false)){
							if(in_array($schema, $property->schemaName)){
								$text5 .= $schemaExist.$tab;
							} else {
								$text5 .= $schemaNotExist.$tab;
							}
						} else {
							$text5 .= $schemaNotPresent.$tab;
						}
					}

					foreach($allSchemas2 as $schema){
						$type = explode("_", $schema)[1];
						if(!$fastData || (
							(strpos($node->skill[0], substr($schema, 0, 4)) !== false) && 
							strpos($node->skill[0], $type) !== false)){
							if(in_array($schema, $property->schemaName)){
								$text2 .= $schemaExist.$tab;
							} else {
								$text2 .= $schemaNotExist.$tab;
							}
						} else {
							$text2 .= $schemaNotPresent.$tab;
						}
					}

					foreach($allSchemas2 as $schema){
						if(!$fastData || (strpos($node->skill[1], substr($schema, 0, 4)) !== false)){
							if(in_array($schema, $property->schemaName2)){
								$text6 .= $schemaExist.$tab;
							} else {
								$text6 .= $schemaNotExist.$tab;
							}
						} else {
							$text6 .= $schemaNotPresent.$tab;
						}
					}

					foreach($allSchemas3 as $schema){
						if(!$fastData || (strpos($node->skill[2], substr($schema, 0, 4)) !== false)){
							if(in_array($schema, $property->schemaName3)){
								$text3 .= $schemaExist.$tab;
								$text7 .= $schemaExist.$tab;
							} else {
								$text3 .= $schemaNotExist.$tab;
								$text7 .= $schemaNotExist.$tab;
							}
						} else {
							$text3 .= $schemaNotPresent.$tab;
							$text7 .= $schemaNotPresent.$tab;
						}
					}
					
					foreach($allSchemas4 as $schema){
						if(!$fastData || ($node->type == "accumulator") || 
							($node->type == "parameter" && $schema != "equation") ||
							($node->type == "function" && $schema != "initial")){
							if($property->name == $schema){
								$text4 .= $schemaExist.$tab;
							} else {
								$text4 .= $schemaNotExist.$tab;
							}
						} else {
							$text4 .= $schemaNotPresent.$tab;
						}

					}
					if($includeDifficulty){
						$dp = $node->difficultyParams;
						$text .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text2 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text3 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text4 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text5 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text6 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
						$text7 .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab;
					}
					if(!$fastData){
						//$text4 .= $kcString.$property->skill.$tab."?".$tab;
						$text .= "NULL".$tab;
						$text2 .= "NULL".$tab;
						$text3 .= "NULL".$tab;
						$text4 .= "NULL".$tab;
						$text5 .= "NULL".$tab;
						$text6 .= "NULL".$tab;
						$text7 .= "NULL".$tab;
					}
					
					if(!$fastData){
						if($property->value == "CORRECT"){
							$text .= $propertyCorrect;
							$text2 .= $propertyCorrect;
							$text3 .= $propertyCorrect;
							$text4 .= $propertyCorrect;
							$text5 .= $propertyCorrect;
							$text6 .= $propertyCorrect;
							$text7 .= $propertyCorrect;
						} else {
							$text .= $propertyIncorrect;
							$text2 .= $propertyIncorrect;
							$text3 .= $propertyIncorrect;
							$text4 .= $propertyIncorrect;
							$text5 .= $propertyIncorrect;
							$text6 .= $propertyIncorrect;
							$text7 .= $propertyIncorrect;
						}
					} else {
						$text .= strtolower($property->value);
						$text2 .= strtolower($property->value);
						$text3 .= strtolower($property->value);
						$text4 .= strtolower($property->value);
						$text5 .= strtolower($property->value);
						$text6 .= strtolower($property->value);
						$text7 .= strtolower($property->value);
					}

					if($fastData){
						$text .= $tab.$node->problem;
						$text2 .= $tab.$node->problem;
						$text3 .= $tab.$node->problem;
						$text4 .= $tab.$node->problem;
						$text5 .= $tab.$node->problem;
						$text6 .= $tab.$node->problem;
						$text7 .= $tab.$node->problem;
					}
					$text .= "\n";
					$text2 .= "\n";
					$text3 .= "\n";
					$text4 .= "\n";
					$text5 .= "\n";
					$text6 .= "\n";
					$text7 .= "\n";
					array_push($data, $text);
					array_push($data2, $text2);
					array_push($data3, $text3);
					array_push($data4, $text4);
					array_push($data5, $text5);
					array_push($data6, $text6);
					array_push($data7, $text7);
				}
			}
		}
		$i = 0;
		$temp = "train";
		if($includeDifficulty){
			$temp = "diff_train";
		}
		$str = "model1";
		if($fastData){
			$str = $temp.$i++;
		}
		$file = fopen($str.$fileName, "w");
		foreach($data as $row){
			fwrite($file, $row);
		}
		fclose($file);

		$str = "model2";
		if($fastData){
			$str = $temp.$i++;
		}
		$file2 = fopen($str.$fileName, "w");
		foreach($data2 as $row){
			fwrite($file2, $row);
		}
		fclose($file2);
		
		$str = "model3";
		if($fastData){
			$str = $temp.$i++;
		}
		$file3 = fopen($str.$fileName, "w");
		foreach($data3 as $row){
			fwrite($file3, $row);
		}
		
		$str = "control";
		if($fastData){
			$str = $temp.$i++;
		}
		$file4 = fopen($str.$fileName, "w");
		foreach($data4 as $row){
			fwrite($file4, $row);
		}
		fclose($file4);
		
		$str = "model4";
		if($fastData){
			$str = $temp.$i++;
		}
		$file5 = fopen($str.$fileName, "w");
		foreach($data5 as $row){
			fwrite($file5, $row);
		}
		fclose($file5);
		
		$str = "model5";
		if($fastData){
			$str = $temp.$i++;
		}
		$file6 = fopen($str.$fileName, "w");
		foreach($data6 as $row){
			fwrite($file6, $row);
		}
		fclose($file6);
		
		$str = "model6";
		if($fastData){
			$str = $temp.$i++;
		}
		$file7 = fopen($str.$fileName, "w");
		foreach($data7 as $row){
			fwrite($file7, $row);
		}
		fclose($file7);
	}

	function createFastData($objs, $fastData){
		$fileName = "data.cvs";
		$allSchemas = $GLOBALS["allSchemas3"];
		$data = array();
		$tab = "\t";
		$kcString = $fastData ? "emit_feature_" : "*feature_";
		$text = "student".$tab."KCs".$tab;
		if($fastData){
			$schemaString = "tran_feature_";
			foreach($allSchemas as $schema){
				$text .= $schemaString.$schema.$tab;
			}
		}
		$schemaExist = "1";
		$schemaNotExist = "0";

		$text .= $kcString."isolation".$tab.$kcString."cues".$tab.$kcString."phrases".$tab."outcome".$tab."problem\n";
		array_push($data, $text);
		foreach($objs as $usr){
			$nodes = $usr->pNodes;
			$temp = $usr->codeName.$tab;
			foreach($nodes as $node){
				$schemas = $node->schemas;
				foreach($node->properties as $property){
					$index = 0;

					foreach($schemas as $schema){
						$text = $temp;
						$skill = explode("_", $schema)[0];
						$text .= $skill.$tab;
						if($fastData){
							foreach($allSchemas as $s){
								if(strpos($skill, explode("_", $s)[0]) !== false){
									if(in_array($s, $property->schemaName3)){
										$text .= $schemaExist.$tab;
									} else {
										$text .= $schemaNotExist.$tab;
									}
								} else {
									$text .= "NULL".$tab;
								}
							}
						}
						$dp = $node->difficultyParams[$index];
						$text .= $dp["isolation"].$tab.$dp["cues"].$tab.$dp["phrases"].$tab.strtolower($property->value).$tab.$node->problem."\n";
						array_push($data, $text);
						$index++;
					}
				}
			}
		}

		$file = fopen("train".$fileName, "w");
		foreach($data as $row){
			fwrite($file, $row);
		}
		fclose($file);
	}

	function  main(){
		$objs = analyzeLogs();
		//echo json_encode($objs);
		$fastData = false;
		createDataRows($objs, $fastData);
		//createFastData($objs, $fastData);
	}
?>
