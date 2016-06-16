<?php
	Class Database{
		private $db_connection = null;
		private static $queries = array();

		function __construct($con){
			$this->db_connection = $con;
			self::$queries = $this->setQueries();
		}

		function getDBResults($query){
			return mysqli_query($this->db_connection, $query);
		}

		function getQuery($name){
			return (array_key_exists($name, self::$queries) ? self::$queries[$name] : '');		
		}

		function setQueries(){
			$q = array();
			$q['classProblems'] = 'SELECT DISTINCT problem, user, `group` FROM session WHERE user = "%s" AND `group` IN (%s);';

			return $q;
		}

		function getClassProblemGroups($parameters){
			$query = $this->getQuery('classProblems');
			$result = null;
			if($query != ''){
				$query = sprintf($query, $parameters['u'], $parameters['g']);
			} else {
				return null;
			}
			echo $query;
			$result = $this->getDBResults($query);
			$problems = array();
			if($result->num_rows != 0){
				while($row = $result->fetch_assoc()){
					if(!array_key_exists($row['group'], $problems))
						$problems[$row['group']] = array();
					$problems[$row['group']][count($problems[$row['group']])] = $row['problem'];
				}
			} else {
				return null;
			}

			return json_encode($problems);
		}
	}
?>
