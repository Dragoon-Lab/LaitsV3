<?php
	include "problemObject.php";
	$updateType = "equal";
	$updateType = "oneSkill";
	$updateType = "minimum";
	$updateType = "ratio";
	main();
	function analyzeLogs(){
		$section = "";
		$prob = array(/*"rabbits-sum15",*/ "111", "107", "CPI-2014-ps2-01", "isle3-sum15-study", "retirement-sum15","CPI-2014-ps2-02","CPI-2014-ps2-04","CPI-2014-ps3-03","CPI-2014-ps4-02", "CPI-2014-ps3-07", "CPI-2014-ps5-04");
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
		$cp = null;
		$currentUser = null;
		$users = array();
		$oldRow = null;
		$currentNode = null;
		while($row = $result->fetch_assoc()){
			$message = json_decode($row["message"], true);
			if($first){
				$first = false;
				//$currentUser = new User($row["user"]);
				$cp = new Problem($row["problem"]);
				$oldRow = $row;
			}
			//echo json_encode($row)."<br/>";
			if($message['type'] === "solution-check"){
				//check for new user
				if($currentUser == null || $currentUser->name != $row['user']){
					if($currentNode != null)
						$currentUser->pushNode($currentNode);
					if($currentUser != null)
						array_push($users, $currentUser);
					$currentUser = new User($row["user"]);
					//echo json_encode($currentUser);
					array_push($currentUser->problemNames, $row["problem"]);
					$cp = new Problem($row["problem"]);
				} else if($oldRow['problem'] != $row['problem']){
					$cp = new Problem($row["problem"]);
					resetSchemas($currentUser);
					if(!in_array($row["problem"], $currentUser->problemNames)){
						array_push($currentUser->problemNames, $row["problem"]);
					}
				}

				//check for a new node and create it
				if($currentNode == null){
					$currentNode = createNode($cp, $currentUser, $row);
				} else if($currentNode->name != $message['node']){
					$currentUser->pushNode($currentNode);
					$tempNode = $currentUser->getNode($message['node']);
					if($tempNode != null){
						$currentNode = $tempNode;
					} else {
						$currentNode = createNode($cp, $currentUser, $row);
					}
				}

				if(array_key_exists("checkResult", $message)  && $message["checkResult"] == "INCORRECT"){
					updateCount($currentUser, $currentNode);
				}
			} else if($message["type"] === "self-referencing-accumulator" || $message["type"] === "self-referencing-function"){
				updateCount($currentUser, $currentNode);
			}

			$oldRow = $row;
		}
		array_push($users, $currentUser);
		echo (json_encode($users));
		return $users;
	}

	function createNode($cp, $cu, $row){
        $m = json_decode($row["message"], true);
        $n = new Node($m["node"]);
        $n->problem = $row["problem"];
        $n->schemas = $cp->getSchemaMap($m["node"]);
        $n->schemaNames = $cp->getNodeSchemaNames($m["node"]);
		$n->setSchemaName();
		//$n->setSkills();
		setCurrentIndexes($cu, $n);
        //$n->difficultyParams = $cp->getDifficultyParams($m["node"]);
        //$n->setSkills();
        $n->type = $cp->getNodeType($m["node"]);

        return $n; 
    }

	function updateCount(/* user */ $cu, /* node */ $n){
		$userSchema = null;
		if(count($n->schemas) < 1)
			return ;
		switch($GLOBALS["updateType"]){
			case "equal":
				foreach($n->schemas as $schemaID => $schema){
					$userSchema = $cu->getSchema($schema);
					if(!array_key_exists($schemaID, $userSchema->currentProblemIndexes))
						setCurrentIndexes($cu, $n);
					$userSchema->errorCounts[$userSchema->currentProblemIndexes[$schemaID]]++;
				}
				break;
			case "oneSkill":
				$userSchema = $cu->getSchema($n->schemaName);
				if(!array_key_exists($n->name, $userSchema->currentProblemIndexes))
					setCurrentIndexes($cu, $n);
				$userSchema->errorCounts[$userSchema->currentProblemIndexes[$n->name]]++;
				break;
			case "ratio":
				$counts = array();
				$numberSchemas = count($n->schemas);
				foreach($n->schemas as $schemaID => $schema){
					$userSchema = $cu->getSchema($schema);
					if(!array_key_exists($schemaID, $userSchema->currentProblemIndexes))
						setCurrentIndexes($cu, $n);
					$counts[$schemaID] = count($userSchema->errorCounts);
					if($numberSchemas == 1)
						$userSchema->errorCounts[$userSchema->currentProblemIndexes[$schemaID]]++;
				}
				if($numberSchemas > 1){
					$sum = ($numberSchemas - 1) * array_sum($counts);
					foreach($n->schemas as $schemaID => $schema){
						$userSchema = $cu->getSchema($schema);
						$userSchema->errorCounts[$userSchema->currentProblemIndexes[$schemaID]] += (($sum - $counts[$schemaID])/$sum);
					}
				}
				break;
			case "minimum":
				$counts = array();
				foreach($n->schemas as $schemaID => $schema){
					$userSchema = $cu->getSchema($schema);
					if(!array_key_exists($schemaID, $userSchema->currentProblemIndexes))
						setCurrentIndexes($cu, $n);$counts[$schemaID] = count($userSchema->errorCounts);
				}
				$min = array_keys($counts, min($counts));
				$count = count($min);
				if($count > 0){
					foreach($min as $m){
						$minSchema = $cu->getSchema($n->schemas[$m]);
						$minSchema->errorCounts[$minSchema->currentProblemIndexes[$m]] += 1/$count;
					}
				}
				break;
		}
	}

	function setCurrentIndexes($cu, $n){
		switch($GLOBALS["updateType"]){
			case "equal":
			case "ratio":
			case "minimum":
				foreach($n->schemas as $schemaID => $schema){
					$userSchema = $cu->getSchema($schema);
					if(!array_key_exists($schemaID, $userSchema->currentProblemIndexes)){
						$count = count($userSchema->errorCounts);
						$userSchema->errorCounts[$count] = 0;
						$userSchema->currentProblemIndexes[$schemaID] = $count;
					}
					$cu->pushSchema($userSchema);
				}
				break;
			case "oneSkill":
				$userSchema = $cu->getSchema($n->schemaName);
				if(!array_key_exists($n->name, $userSchema->currentProblemIndexes)){
					$count = count($userSchema->errorCounts);
					$userSchema->errorCounts[$count] = 0;
					$userSchema->currentProblemIndexes[$n->name] = $count;
				}
				$cu->pushSchema($userSchema);
				break;
		}
	}

	function resetSchemas($cu){
		foreach($cu->schemas as $schema){
			$schema->currentProblemIndexes = array();
			$cu->pushSchema($schema);
		}
	}

	function writeData($users){
		$schemas = array();
		$tab = "\t";
		$nextLine = "\n";
		foreach($users as $user){
			foreach($user->schemas as $schema){
				if(!array_key_exists($schema->name, $schemas))
					$schemas[$schema->name] = "";
				$str = $user->codeName.$tab;
				foreach($schema->errorCounts as $c){
					$str .= $c.$tab;
				}
				$str .= $nextLine;

				$schemas[$schema->name] .= $str;
			}
		}
		
		foreach($schemas as $schemaName => $schemaData){
			$name = $schemaName."_".$GLOBALS["updateType"].".xls";
			$file = fopen($name, "w");
			fwrite($file, $schemaData);
			fclose($file);
		}
	}

	function main(){
		$objs = analyzeLogs();
		writeData($objs);
	}
?>
