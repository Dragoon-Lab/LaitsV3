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

		function getAffectedRows(){
			return mysqli_affected_rows($this->db_connection);
		}

		function setQueries(){
			$q = array();
			$q['classProblems'] = 'SELECT DISTINCT problem, user, `group` FROM session WHERE user = "%s" AND `group` IN (%s);';
			$q['getNCModelWithGroup'] = 'SELECT session_id, problem, user, `group`, solution_graph FROM session JOIN solutions USING (session_id) WHERE (user = "%s" OR `group` = "%s") AND problem = "%s" AND mode = "%s" AND section = "non-class-models" ORDER BY session.time desc LIMIT 1;';
			$q['getNCModel'] = 'SELECT session_id, problem, user, `group`, solution_graph FROM session JOIN solutions USING (session_id) WHERE user = "%s" AND problem = "%s" AND mode = "%s" AND section = "non-class-models" ORDER BY session.time desc LIMIT 1;';
			$q['insertSession'] = 'INSERT INTO session (session_id, mode, user, section, problem, `group`, activity) VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s");';
			$q['insertSolutionGraph'] = 'INSERT INTO solutions (session_id, share, deleted, solution_graph) VALUES ("%s", "%s", "%s", "%s");';
			$q['listNCModelsInGroup'] = 'SELECT DISTINCT problem FROM session WHERE `group` = "%s" AND section = "non-class-models";';
			$q['countModelsInFolder'] = 'SELECT COUNT(DISTINCT problem) AS model_count FROM session WHERE `group` = "%s" AND section = "non-class-models";';
			$q['updateFolderGivenFolder'] = 'UPDATE session SET `group` = "%s",time = time WHERE `group` = "%s" AND section = "non-class-models";';
			$q['updateFolderGivenProblemFolder'] = 'UPDATE session SET `group` = "%s",time = time WHERE `group` = "%s" AND problem="%s" AND section = "non-class-models";';
			$q['updateModelGivenProblemFolder'] = 'UPDATE session SET problem = "%s",time = time WHERE `group` = "%s" AND problem="%s" AND section = "non-class-models";';
			$q['getSolutionGraph'] = 'SELECT solutions.session_id,solutions.solution_graph FROM solutions INNER JOIN session ON solutions.session_id = session.session_id AND session.group = "%s" AND session.problem = "%s" AND session.mode = "%s" ORDER BY session.time DESC limit 1;';
			$q['checkDupModels'] = 'SELECT COUNT(*) AS modelCount FROM session WHERE `group` = "%s" AND problem = "%s" AND section = "non-class-models";';
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
			$query = $this->getQuery('listNCModelsInGroup');
			if($query != '')
				$query = sprintf($query, $group);
			$result = $this->getDBResults($query);
			$nc_probs = array();
			if($result->num_rows != 0){
				while($row = $result->fetch_assoc()){
					$nc_probs[$row['problem']] = $row['problem'];
				}
			} else {
				return null;
			}
			if($parameters['s'] == '1')
				ksort($nc_probs);
			return json_encode($nc_probs);

		}

		function getProblemCount($parameters){
			$group = $this->db_connection->real_escape_string($parameters['g']);
			$query = $this->getQuery('countModelsInFolder');
			if($query != '')
				$query = sprintf($query, $group);
			$result = $this->getDBResults($query);
			$count_det = $result->fetch_assoc();
			return $count_det['model_count'];
		}

		function deleteSpecificModels($parameters){
			$del_models = $parameters['dm'];
			$del_fails = array();
			if($del_models){
				foreach($del_models as $mname => $group){
					$user = explode("-",$group);
					$new_folder = ($user[1] == 'private') ? $user[0] : $user[1];
					$new_folder = $new_folder.'-deleted';
					$new_folder = $this->db_connection->real_escape_string($new_folder);
					$mname = $this->db_connection->real_escape_string($mname);
					$group = $this->db_connection->real_escape_string($group);
					$query = $this->getQuery('updateFolderGivenProblemFolder');
					if($query != ''){
						$query = sprintf($query, $new_folder, $group, $mname);
					} else {
						return null;
					}
					$result = $this->getDBResults($query);
					if(($this->getAffectedRows()) == 0)
						$del_fails[$mname] = $group;
				}	
				if(sizeof($del_fails) > 0)
					return json_encode($del_fails);
				else
					return "success";	
			}
			else{
				return null;
			}
		}

		function deleteAllModelsFromFolder($parameters){
			// This function is supposed to delete models from the passed folder
			$folder_id = $this->db_connection->real_escape_string($parameters['fol']);
			//check if the folder is empty and then return true
			//short hand arrays not allowed before 5.4
			$grp_ar = array('g' => $folder_id);
			$model_count = $this->getProblemCount($grp_ar);
			if($model_count == 0)
				return "success";
			$user = explode("-",$folder_id);
			$folder_name = ($user[1] == 'private') ? $user[0] : $user[1];
			$new_folder = $folder_name."-deleted";
			$new_folder = $this->db_connection->real_escape_string($new_folder);
			$folder_name = $this->db_connection->real_escape_string($folder_name);
			$query = $this->getQuery('updateFolderGivenFolder');
			if($query != ''){
				$query = sprintf($query, $new_folder, $folder_id);
			} else {
				return null;
			}
			$result = $this->getDBResults($query);
			if(($this->getAffectedRows()) > 0)
				return "success";
			else
				return null;
		}

		function modelAction($parameters){
			$src = $this->db_connection->real_escape_string($parameters['src']);
			$model = $this->db_connection->real_escape_string($parameters['mod']);
			$dest = $this->db_connection->real_escape_string($parameters['dest']);
			$action = $parameters['action'];
			$user = $this->db_connection->real_escape_string($parameters['user']);
			$copy_sec = "non-class-models";
			if(isset($parameters['section']) && $parameters['section'] != ""){
				$copy_sec = $parameters['section'];
			}

			if($action == "moveModel"){
				$query = $this->getQuery('updateFolderGivenProblemFolder');
				if($query != '')
					$query = sprintf($query, $dest, $src, $model);
				$update_res = $this->getDBResults($query);
				if(($this->getAffectedRows()) == 0)
					return null;
				else
					return "success";
			}
			else if($action == "copyModel"){
				//step 1: retrieve the most recent session for the specific problem and group which has a corresponding solutions entry
				//$get_sol_q = "select solutions.session_id,solutions.solution_graph from solutions INNER JOIN session ON solutions.session_id = session.session_id AND session.group = '$src' AND session.problem = '$model' AND session.mode = 'AUTHOR' ORDER BY session.time DESC limit 1";
				$query = $this->getQuery('getSolutionGraph');
				if($query != '')
					$query = sprintf($query, $src, $model, 'AUTHOR');
				else
					return null;
				$sol_res = $this->getDBResults($query);
				//number of rows selected has to be exactly 1
				if(mysqli_num_rows($sol_res) !== 1)
					return "source model cannot be found";
				$sol_data = mysqli_fetch_array($sol_res);
				$solution_graph = $this->db_connection->real_escape_string($sol_data['solution_graph']);
				$old_session_id = $sol_data['session_id'];

				//step 2 : create a new session id with current micro timestamp and session_id
				//This is work around and in future we need a php session creator from username and section like in js
				$new_sess1 = explode("_",$old_session_id);
				$milliseconds = round(microtime(true) * 1000);
				$new_session_id = $new_sess1[0]."_".$milliseconds;

				//step 3 : insert new session

				$new_model = $this->db_connection->real_escape_string($parameters['new_mod']);
				if($new_model == "")
					$new_model = $model;
				$query = $this->getQuery('insertSession');
				if($query != '')
					$query = sprintf($query, $new_session_id, 'AUTHOR', $user, $copy_sec, $new_model, $dest, 'construction');
				else
					return null;
				$create_sess_res = $this->getDBResults($query);
				
				if($this->getAffectedRows() != 1)
					return "could not create a new model";

				// insert solution
				$query = $this->getQuery('insertSolutionGraph');
				if($query != ''){
					$query = sprintf($query, $new_session_id, 0, 0, $solution_graph);
				} else {
					return null;
				}

				$create_sol_res = $this->getDBResults($query);
				//echo $create_new_sol;
				if($this->getAffectedRows() == 1)
					return "success";
				else
					return "could not create new model solution";
			}

		}

		function renameAction($parameters){
			$old_folder = $this->db_connection->real_escape_string($parameters['old_folder']);
			$new_name = $this->db_connection->real_escape_string($parameters['new_name']);
			$action = $parameters['action'];
			if($action == "Folder"){
				$grp_ar = array('g' => $old_folder);
				$model_count = $this->getProblemCount($grp_ar);
				if($model_count == 0)
					return "success";
				$query = $this->getQuery('updateFolderGivenFolder');
				if($query != ''){
					$query = sprintf($query, $new_name, $old_folder);
				} else {
					return null;
				}
				$result = $this->getDBResults($query);
				if(($this->getAffectedRows()) > 0)
					return "success";
				else
					return null;
			}
			else if($action == "Model"){
				$old_model = $this->db_connection->real_escape_string($parameters['old_model']);
				$dup_q = $this->getQuery('checkDupModels');
				if($dup_q != ''){
					$dup_query = sprintf($dup_q, $old_folder, $new_name);
				} else {
					return null;
				}
				$dup_res = $this->getDBResults($dup_query);
				$is_dup = mysqli_fetch_array($dup_res);
				if($is_dup['modelCount'] != 0)
					return "duplicate";
				$query = $this->getQuery('updateModelGivenProblemFolder');
				if($query != ''){
					$query = sprintf($query, $new_name, $old_folder, $old_model);
				} else {
					return null;
				}
				$result = $this->getDBResults($query);
				if(($this->getAffectedRows()) > 0)
					return "success";
				else
					return null;
			}
		}

		function copy_nc_model_section($parameters){
			$u = $this->db_connection->real_escape_string($parameters['u']);
			$s = $this->db_connection->real_escape_string($parameters['s']);
			$p = $this->db_connection->real_escape_string($parameters['p']);
			$newName = $this->db_connection->real_escape_string($parameters['nn']);

			$flag = false;
			if($parameters['g'] == ""){
				$query = $this->getQuery('getNCModel');
			} else {
				$query = $this->getQuery('getNCModelWithGroup');
				$flag = true;
			}

			if($query != '' && $flag){
				$query = sprintf($query, $u, $parameters['g'], $p, $parameters['m']);
			} else if ($query != '' && !$flag) {
				$query = sprintf($query, $u, $p, $parameters['m']);
			} else {
				return null;
			}

			$result = $this->getDBResults($query);
			$session = '';
			$row = '';
			if($result->num_rows != 0){
				$row = $result->fetch_assoc();
				$temp = explode("_", $row['session_id']);
				$session = $temp[0]."_".round(microtime(true) * 1000);
			} else {
				return null;
			}

			$query = $this->getQuery('insertSession');
			$probName = $p;
			if($newName != ""){
				$probName = $newName;
			}
			if($query != ''){
				$query = sprintf($query, $session, $parameters['m'], $u, $s, $probName, $row['group'], $parameters['a']);
			} else {
				return null;
			}
			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}
			$query = $this->getQuery('insertSolutionGraph');
			if($query != ''){
				$query = sprintf($query, $session, $this->db_connection->real_escape_string($row['solution_graph']));
			} else {
				return null;
			}

			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}

			return "success";
		}
	}
?>