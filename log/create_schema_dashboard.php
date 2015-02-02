<?php
include "logAnalysis.php";

class SchemaDashboard{
	public $al;

	function __construct($con){
		$this->al = new AnalyzeLogs($con);
	}

	function createDashboard($section, $mode, $user, $problem){
		$query = $this->getQuery($section, $mode, $user, $problem);
		$result = $this->al->getResults($query);
		$objects = null;
		if($result->num_rows > 0)
			$objects = $this->parseMessages($result);

		return $objects;
	}

	function getQuery($section, $mode, $user, $problem){
		$userString = "AND user = '".$user."' ";
		$modeString = "AND mode = '".$mode."' ";
		$sectionString = "AND section = '".$section."' ";
		$problemString = "AND $problem = '".$problem."' ";
		$queryString = 
		"SELECT 
			session.user, session.problem, session.mode, schema_session.schema_id, schema_application.competence, schema_session.difficulty, schema_application.counter 
		from schema_application 
			join schema_session ON schema_session.session_id = schema_application.session_id 
			join session ON schema_application.session_id = session.session_id
		where
			schema_application.schema_id = schema_session.schema_id ".
			(!empty($section)?$sectionString:"").
			(!empty($mode)?$modeString:"").
			(!empty($user)?$userString:"").
			(!empty($problem)?$problemString:"").
		"ORDER BY user asc, time asc, schema_session.schema_id asc, counter asc;";

		//echo $queryString;
		return $queryString;
	}

	function parseMessages($result){
		$objectArray = array();
		$first = true;
		$resetVariables = true;
		while($row = $result->fetch_assoc()){
			if($first){
				$oldRow = $row;
			}
			$first = false;
			if($row["user"] != $oldRow["user"]){
				$resetVariables = true;
				array_push($objectArray, $usObject);
			}
			if($resetVariables){
				$competence = array();
				$difficulties = array();
				$usObject = new UserSchemaObject();
				$compValue = array();
				$usObject->user = $row["user"];
				$usObject->mode = $row["mode"];
				$currentSchema; $currentDifficulty;
				$userData = array();
			}
			$resetVariables = false;

			$compValue = json_encode($row["competence"], true);
			$schemaName = $row["schema_id"];
			$currentSchema = $usObject->getSchema($schemaName);

			if($currentSchema == null){
				$currentSchema = new Schema;
				$currentSchema->ID = $schemaName;
			}

			if(!(in_array($row["problem"], $currentSchema->problems))){
				array_push($currentSchema->problems, $row["problem"]);
			}

			$difficulty = json_decode($row["difficulty"], true);
			$iso = $difficulty["isolation"];
			$cues = $difficulty["cues"];
			$ph = $difficulty["phrases"];
			$currentDifficulty = $currentSchema->getDifficulty($iso, $cues, $ph);

			if($currentDifficulty == null){
				$currentDifficulty = new Difficulty();
				$currentDifficulty->isolation = $iso;
				$currentDifficulty->cues = $cues;
				$currentDifficulty->phrases = $ph;
			}

			$comp = json_decode($row["competence"], true);
			$compValues = $comp["values"];
			//print_r($compValues);
			foreach($compValues as $value){
				//print_r($value);
				$currentDifficulty->competence[key($compValues)] = $value;
			}

			//$userData = array();
			$currentDifficulty->userData["errors"] = $comp["errors"];
			$currentDifficulty->userData["timeSpent"] = $comp["timeSpent"]/(60*1000);
			$currentDifficulty->userData["total"] = $comp["total"];

			//$currentDifficulty->userData = $userData;
			//pushing the data back to the user schema object.
			//first we add difficulty to the schema
			$diffIndex = $currentSchema->getDifficultyIndex($iso, $ph, $cues);
			if($diffIndex < 0){
				array_push($currentSchema->difficulties, $currentDifficulty);
			} else {
				$currentSchema->difficulties[$diffIndex] = $currentDifficulty;
			}
			$currentDifficulty = null;

			//now add schema to the user object
			$schemaIndex = $usObject->getSchemaIndex($currentSchema->ID);
			if($schemaIndex < 0){
				array_push($usObject->schemas, $currentSchema);
			} else {
				$usObject->schemas[$schemaIndex] = $currentSchema;
			}
			$currentSchema = null;

			$oldRow = $row;
			
 		}
 		array_push($objectArray, $usObject);

 		return $objectArray;
	}
}

/*	
* Schema Object that we will use is defined here 
* first object is a mapping of user with the schemas that he might work. For each user there will be one such object.
*/
Class UserSchemaObject{
	public $user;
	public $mode;
	public $schemas = array();
	function getSchema($schemaID){
		$allSchemas = $this->schemas;
		foreach($allSchemas as $schema){
			if($schema->ID == $schemaID){
				return $schema;
			}
		}

		return null;
	}

	function getSchemaIndex($schemaID){
		$allSchemas = $this->schemas;
		$index = 0;
		foreach($allSchemas as $schema){
			if($schema->ID == $schemaID){
				return $index;
			}
			$index++;
		}

		return -1;
	}
}

Class Schema{
	public $ID;
	public $problems = array(); //has all the problem names that are part of this schema.
	public $difficulties = array();

	function isProblemPresent($name){
		$allProblems = $this->problems;
		foreach($allProblems as $problem){
			if($problem == $name){
				return true;
			}
		}

		return false;
	}

	function getDifficulty($i, $c, $p){
		$allDifficulties = $this->difficulties;
		foreach($allDifficulties as $difficulty){
			if($difficulty->isolation == $i && $difficulty->cues == $c && $difficulty->phrases == $p){
				return $difficulty;
			}
		}

		return null;
	}
	
	function getDifficultyIndex($i, $c, $p){
		$allDifficulties = $this->difficulties;
		$index = 0;
		foreach($allDifficulties as $difficulty){
			if($difficulty->isolation == $i && $difficulty->cues == $c && $difficulty->phrases == $p){
				return $index;
			}
			$index++;
		}

		return -1;
	}
}

Class Difficulty{
	public $isolation;
	public $cues;
	public $phrases;
	public $competence = array();
	public $userData = array();
}
?>
