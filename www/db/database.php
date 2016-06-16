<?php
	Class Database{
		private $db_connection;
		private static $queries = array();

		function __construct($con){
			self::$db_connection = $con;
			self::$queries = setQueries();
		}

		function getDBResults($query){
			return mysql_query(self::$db_connection, $query);
		}

		function getQuery($name){
			return (array_key_exists(self::$queries, $name) ? self::$queries[$name] : '');		
		}

		function setQueries(){
			$q = array();
			$q['classProblems'] = 'SELECT DISTINCT on problem, user, `group` FROM session WHERE user = "%s" AND `group` IN (%s)'

			return $q;
		}

		function getClassProblemGroups($parameters){
			$query = $this->getQuery('classProblems');
			$result = null;
			if($query != ''){
				$query = sprintf($query, $parameters['u'], $parameters['g']);
				$result = $this->getDBResults($query);
			} else {
				return null;
			}

			$problems = array();
			if($result->num_rows != 0){
				while($row = $result->fetch_assoc()){
					if(!array_key_exists($problems, $row['group']))
						$problems[$row['group']] = array();
					$problems[$row['group']][count($problems[$row['group']])] = $problem;
				}
			} else {
				return null;
			}

			return json_encode($problems);
		}
	}
?>
