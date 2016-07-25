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

			$result = $this->getDBResults($query);
			$problems = array();
			if($result->num_rows != 0){
				while($row = $result->fetch_assoc()){
					if(!array_key_exists($row['group'], $problems))
						$problems[$row['group']] = array();
					array_push($problems[$row['group']], $row['problem']);
				}
			} else {
				return null;
			}

			return json_encode($problems);
		}

        function getNonClassProblems($parameters){
            $group = $this->db_connection->real_escape_string($parameters['g']);
            //we made sure group is unique each time
            //query by group name and return problem names
            $query = "select DISTINCT problem from session where `group` = '$group'";
            $result = $this->getDBResults($query);
            $nc_probs = array();
            if($result->num_rows != 0){
                while($row = $result->fetch_assoc()){
                    $nc_probs[$row['problem']] = $row['problem'];
                }
            } else {
                return null;
            }

            return json_encode($nc_probs);

        }

        function deleteNonClassProblems($parameters){
            //first delete folders which implies updating the group ids with tag deleted
            $del_folders = $parameters['df'];
            $del_models = $parameters['dm'];
            $del_suc1=$del_suc2=false;

            foreach($del_folders as $eachFolder){
                $user = explode("-",$eachFolder);
                $user=$user[1];
                $new_folder = $user.'-deleted';
                $del_folder_query = "update session set `group` = '$new_folder' where `group` = '$eachFolder' ";
                echo $del_folder_query;
                $del_suc1 = $this->getDBResults($del_folder_query);
            }

            foreach($del_models as $name=>$group){
                $user = explode("-",$group);
                $user=$user[1];
                $new_folder = $user.'-deleted';
                $del_folder_query = "update session set `group` = '$new_folder' where `group` = '$group' and problem='$name' ";
                echo $del_folder_query;
                $del_suc2 = $this->getDBResults($del_folder_query);
            }
            if($del_suc1 && $del_suc2)
                return $del_folders;
            else return null;

        }
	}
?>
