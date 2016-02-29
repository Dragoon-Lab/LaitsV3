<?php
	Class Problem{
		private static $problems = array();
		private $folderName = "../../www/problems/";
		public $currentProblem;
		private static $genusCache = array();

		function __construct($name){
			if(array_key_exists($name, self::$problems)){
				$this->currentProblem = json_decode(self::$problems[$name], true);
				return;
			}
			$fileString = file_get_contents($this->folderName.$name.".json");
			$this->currentProblem = json_decode($fileString, true);
			$this->initNodeSchema();
			$this->setNodeSchemaNames();
			self::$problems[$name] = json_encode($this->currentProblem, true);
			
			return;
		}

		private function initNodeSchema(){
			$nodes = $this->getNodes();
			$index = 0;
			foreach($nodes as $node){
				$node["schemas"] = array();
				//$node["schemas2"] = array();
				$this->pushNode($node, $index);
				$index++;
			}
			return;
		}

		private function getNodes(){
			return $this->currentProblem["task"]["givenModelNodes"];
		}

		private function pushNode($node, $index){
			$push = false;
			if($index != null && $index >= 0){
				$push = true;
			} else {
				$index = $this->getIndex($node["name"]);
				if($index >= 0){
					$push = true;
				}
			}
			$this->currentProblem["task"]["givenModelNodes"][$index] = $node;
		}

		private function getSchemas(){
			return $this->currentProblem["task"]["schemas"];
		}

		public function getIndex($n){
			$nodes = $this->getNodes();
			$index = 0;

			foreach($nodes as $node){
				if($node["name"] == $n || $node["ID"] == $n)
					return $index;
				$index++;
			}

			return -1;
		}

		public function getNode($name){
			$nodes = $this->getNodes();

			foreach($nodes as $node){
				if($node["name"] == $name || $node["ID"] == $name){
					return $node;
				}
			}

			return null;
		}

		public function getNodeID($name){
			$nodes = $this->getNodes();
			
			foreach($nodes as $node){
				if($node["name"] == $name){
					return $node["ID"];
				}
			}

			return null;
		}

		public function getGenus($name){
			if(!in_array($name, self::$genusCache)){
				$node = $this->getNode($name);

				self::$genusCache[$name] = (array_key_exists("genus", $node) && $node["genus"] != "") ? $node["genus"] : "required";
			}
			return self::$genusCache[$name];
		}

		/*public function getNodeFromID($ID){
			$nodes = $this->getNodes();

			foreach($nodes as $node){
				if($node["ID"] == $ID || $node["name"] == $ID){
					return $node;
				}
			}

			return null;
		}*/

		function getNodeType($ID){
			$node = $this->getNode($ID);
			
			return ($node != null ? $node["type"] : null);
		}

		function getSchemasForNode($name){
			$ID = $this->getNodeID($name);
			$schemas = $this->getSchemas();
			$schemaIDs = array();

			foreach($schemas as $schema){
				$schemaArray = explode(", ", $schema["nodes"]);
				if(in_array($ID, $schemaArray)){
					array_push($schemaIDs, $schema["schemaClass"]);
				}
			}
			usort($schemaIDs, array("Problem", "cmp"));

			return $schemaIDs;
		}

		function getSchemaMap($name){
			$ID = $this->getNodeID($name);
			$schemas = $this->getSchemas();
			$schemaIDs = array();

			foreach($schemas as $schema){
				$schemaArray = explode(", ", $schema["nodes"]);
				if(in_array($ID, $schemaArray)){
					$schemaIDs[$schema["ID"]] = $schema["schemaClass"];
				}
			}

			return $schemaIDs;
		}

		static function cmp($a, $b){
			return strcmp($a, $b);
		}

		function getDifficultyParams($name){
			$ID = $this->getNodeID($name);
			$schemas = $this->getSchemas();
			$difficultyParams = array("cues" => 0, "isolation" => 0, "phrases" => 0);
			$cues = 0;
			$isolation = 0;
			$phrases = 0;

			foreach($schemas as $schema){
				//echo json_encode($schema)."<br/>";
				$schemaArray = explode(", ", $schema["nodes"]);
				/*if(in_array($ID, $schemaArray)){
					echo print_r($schema["difficulty"])."<br/>";
					array_push($difficultyParams, $schema["difficulty"]);
				}*/
				if(in_array($ID, $schemaArray)){
					$cues += $schema["difficulty"]["cues"];
					$isolation += $schema["difficulty"]["isolation"];
					$phrases += $schema["difficulty"]["phrases"];
				}
			}

			if($cues > 0){
				$difficultyParams["cues"] = 1;
			}
			if($isolation > 0){
				$difficultyParams["isolation"] = 1;
			}
			if($phrases > 0){
				$difficultyParams["phrases"] = 1;
			}

			return $difficultyParams;
		}

		private function setUniqueNodeName($ID, $schemaName){
			$node = $this->getNode($ID);
			array_push($node["schemas"], $schemaName);
			$this->pushNode($node, -1);
		}

		private function setNodeName($ID, $schemaID, $schemaName){
			$node = $this->getNode($ID);
			$node["schemas2"][$schemaID] = $schemaName;
			$this->pushNode($node, -1);
		}

		function getNodeSchemaNames($n){
			$node = $this->getNode($n);
			return ($node != null)?$node["schemas"]:null;
		}

		/*function getNodeSchemaNamesID($n){
			$node = $this->getNode($n);
			return ($node != null)?$node["schemas2"]:null;
		}*/

		private function setNodeSchemaNames(){
			$schemas = $this->getSchemas();

			foreach($schemas as $schema){
				$nodeIDs = explode(", ", $schema["nodes"]);
				$count = array("accumulator" => 1, "function" => 1, "parameter" => 1);

				foreach($nodeIDs as $ID){
					$type = $this->getNodeType($ID);
					$n = explode("_", $schema["schemaClass"])[0]."_".$type;
					//$this->setNodeName($ID, $schema["ID"], $schema["schemaClass"]);
					$this->setUniqueNodeName($ID, $n);
					//echo $type;
					$count[$type]++;
				}
			}

			return;
		}

		function getSchemaNodeTypes(){
			$schemas = $this->getSchemas();
			$typeCount = array();

			foreach($schemas as $schema){
				$nodeIDs = explode(", ", $schema["nodes"]);
				$count = array();
				foreach($nodeIDs as $ID){
					$type = $this->getNodeType($ID);
					if($type != null){
						$count[$type]++;
					}
				}
				
				$typeCount[$schema["schemaClass"]] = $count;
			}

			return $typeCount;
		}
	}

	Class User{
		private static $name_prefix = "PW";
		private static $name_counter = 1;
		public $problemNames = array();
		public $pNodes = array();
		public $name;
		public $codeName;
		public $schemas = array(); //holds all the schema that user made with error count
		public $currentProblemNodes = 0;

		function __construct($n){
			$this->name = $n;
			$this->codeName = self::$name_prefix.self::$name_counter++;
			//echo "new user created ".$n." ".$this->codeName."<br/>";
		}

		function getNode($name){
			foreach($this->pNodes as $node){
				if($node->name == $name){
					return $node;
				}
			}

			return null;
		}

		function getIndex($name){
			$index = 0;
			foreach($this->pNodes as $node){
				if($node->name == $name)
					return $index;
				$index++;
			}

			return -1;
		}
		
		function pushNode($node){
			$index = $this->getIndex($node->name); 
			if($index >= 0){ 
				$this->pNodes[$index] = $node; 
			} else { 
				array_push($this->pNodes, $node);
			}

			return;
		}

		function pushSchema($schema){
			$index = $this->getSchemaIndex($schema->name);
			if($index >= 0)
				$this->schemas[$index] = $schema;
			else
				array_push($this->schemas, $schema);

			return;
		}

		function getSchemaIndex($name){
			$index = 0;
			foreach($this->schemas as $schema){
				if($schema->name == $name)
					return $index;
				$index++;
			}

			return -1;
		}

		function getSchema($name){
			forEach($this->schemas as $schema){
				if($name == $schema->name)
					return $schema;
			}

			$schema = new Schema($name);
			return $schema;
		}
	}

	Class Node{
		public $problem;
		public $name;
		public $schemas = array();
		public $difficultyParams = array();
		public $properties = array();
		public $propertyNames = array();
		public $type;
		public $schemaNames;
		public $schemaName;
		public $skill = array();

		function __construct($n){
			$this->name = $n;
		}

		function setSkills(){
			$s = "";
			foreach($this->schemas as $key => $schema){
				$s .= explode("_", $schema)[0]."_";
			}
			$s1 = $s.$this->type;
			$s = substr($s, 0, -1);
			array_push($this->skill, $s1);
			array_push($this->skill, $s);
			array_push($this->skill, $s);
			array_push($this->skill, $this->type);
		}

		function setSchemaName(){
			$s = "";
			foreach($this->schemaNames as $schema){
				$s .= explode("_", $schema)[0]."_";
			}

			$s = substr($s, 0, -1);
			$this->schemaName = $s;
		}
	}

	Class Property{
		public $name;
		public $value;
		public $schemaName = array();
		public $schemaName2 = array();
		public $schemaName3 = array();

		function __construct($n){
			$this->name = $n;
		}

		function addSchema($n, $int){
			switch($int){
				case 1:
					array_push($this->schemaName, $n);
					break;
				case 2:
					array_push($this->schemaName2, $n);
					break;
				case 3:
					array_push($this->schemaName3, $n);
					break;
				default:
					break;
			}
		}
	}

	Class Schema{
		public $errorCounts = array(); //each index represents the error count at that stage
		public $name;
		public $IDs = array(); //the schema IDs in the problem.
		public $currentProblemIndexes = array(); //this schema is error for which index in for the current problem.

		function __construct($n){
			$this->name = $n;
		}
	}
?>
