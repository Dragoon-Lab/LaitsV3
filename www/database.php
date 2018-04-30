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
			$q['getNCModelWithGroup'] = 'SELECT session_id, problem, user, `group`, solution_graph FROM session JOIN solutions USING (session_id) WHERE (user = "%s" OR `group` = "%s") AND problem = "%s" AND mode = "%s" AND section = "non-class-models" ORDER BY session.time desc LIMIT 1;';
			$q['getNCModel'] = 'SELECT session_id, problem, user, `group`, solution_graph FROM session JOIN solutions USING (session_id) WHERE user = "%s" AND problem = "%s" AND mode = "%s" AND section = "non-class-models" ORDER BY session.time desc LIMIT 1;';
			$q['insertSession'] = 'INSERT INTO session (session_id, mode, user, section, problem, `group`, activity) VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s");';
			$q['insertSolutionGraph'] = 'INSERT INTO solutions (session_id, share, deleted, solution_graph) VALUES ("%s", "%s", "%s", "%s");';
			$q['listNCModelsInGroup'] = 'SELECT DISTINCT problem FROM session WHERE `group` = "%s" AND section = "non-class-models";';
			$q['updateFolderGivenFolder'] = 'UPDATE session SET `group` = "%s",time = time WHERE `group` = "%s" AND section = "non-class-models";';
			$q['updateFolderGivenProblemFolder'] = 'UPDATE session SET `group` = "%s",time = time WHERE `group` = "%s" AND problem="%s" AND section = "non-class-models";';
			$q['updateModelGivenProblemFolder'] = 'UPDATE session SET problem = "%s",time = time WHERE `group` = "%s" AND problem="%s" AND section = "non-class-models";';
			$q['getSolutionGraph'] = 'SELECT solutions.session_id,solutions.solution_graph FROM solutions INNER JOIN session ON solutions.session_id = session.session_id AND session.group = "%s" AND session.problem = "%s" AND session.mode = "%s" AND session.section = "non-class-models" ORDER BY session.time DESC limit 1;';

			return $q;
		}

		function getClassProblemGroups($parameters){
			$query = $this->getQuery('classProblems');
			$result = null;
			if($query != '')
				$query = sprintf($query, $parameters['u'], $parameters['g']);
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
			//$query = "select DISTINCT problem from session where `group` = '$group'";
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

			return json_encode($nc_probs);

		}

		function deleteNonClassProblems($parameters){
			//first delete folders which implies updating the group ids with tag deleted
			$del_folders = $parameters['df'];
			$del_models = $parameters['dm'];
			$del_suc1=$del_suc2=false;

			foreach($del_folders as $each_folder){
				$user = explode("-",$each_folder);
				$new_folder = ($user[1] == 'private') ? $user[0] : $user[1];
				$new_folder = $new_folder."-deleted";
				//escape quotes, make strings query safe
				$new_folder = $this->db_connection->real_escape_string($new_folder);
				$each_folder = $this->db_connection->real_escape_string($each_folder);
				//$del_folder_query = "update session set `group` = '$new_folder',time = time where `group` = '$eachFolder' ";
				//echo $del_folder_query;
				$query = $this->getQuery('updateFolderGivenFolder');
				if($query != '')
					$query = sprintf($query, $new_folder, $each_folder);
				$del_suc1 = $this->getDBResults($query);
			}

			foreach($del_models as $name=>$group){
				$user = explode("-",$group);
				$new_folder = ($user[1] == 'private') ? $user[0] : $user[1];
				$new_folder = $new_folder.'-deleted';
				$new_folder = $this->db_connection->real_escape_string($new_folder);
				$name = $this->db_connection->real_escape_string($name);
				//$del_folder_query = "update session set `group` = '$new_folder',time = time where `group` = '$group' and problem='$name' ";
				//echo $del_folder_query;
				$query = $this->getQuery('updateFolderGivenProblemFolder');
				if($query != '')
					$query = sprintf($query, $new_folder, $group, $name);
				$del_suc2 = $this->getDBResults($query);
			}
			if($del_suc1 && $del_suc2)
				return $del_folders;
			else return null;

		}

		function modelAction($parameters){
			$src = $this->db_connection->real_escape_string($parameters['src']);
			$model = $this->db_connection->real_escape_string($parameters['mod']);
			$dest = $this->db_connection->real_escape_string($parameters['dest']);
			$action = $parameters['action'];
			$user = $this->db_connection->real_escape_string($parameters['user']);
			$copy_sec = "non-class-models";
			//print_r($parameters);
			if(isset($parameters['section'])){
				$copy_sec = $parameters['section'];
			}

			if($action == "moveModel"){
				//move Model
				//$update_query = "update session set `group` = '$dest',time = time where `group`='$src' AND problem='$model' ";
				//echo $update_query;
				$query = $this->getQuery('updateFolderGivenProblemFolder');
				if($query != '')
					$query = sprintf($query, $dest, $src, $model);
				$update_res = $this->getDBResults($query);
				if($update_res)
					return "success";
				else
					return null;
			}
			else if($action == "copyModel"){
				//step 1: retrieve the most recent session for the specific problem and group which has a corresponding solutions entry

				//$get_sol_q = "select solutions.session_id,solutions.solution_graph from solutions INNER JOIN session ON solutions.session_id = session.session_id AND session.group = '$src' AND session.problem = '$model' AND session.mode = 'AUTHOR' ORDER BY session.time DESC limit 1";
				$query = $this->getQuery('getSolutionGraph');
				if($query != '')
					$query = sprintf($query, $src, $model, 'AUTHOR');
				$sol_res = $this->getDBResults($query);
				$sol_data = mysqli_fetch_array($sol_res);
				$solution_graph = $this->db_connection->real_escape_string($sol_data['solution_graph']);
				$old_session_id = $sol_data['session_id'];

				//step 2 : create a new session id with current micro timestamp and session_id
				//This is work around and in future we need a php session creator from username and section like in js
				$new_sess1 = explode("_",$old_session_id);
				$milliseconds = round(microtime(true) * 1000);
				$new_session_id = $new_sess1[0]."_".$milliseconds;

				//step 3 : insert new session
				/*
				$create_sess_q = "insert into session(`session_id`,`user`,problem,`mode`,`group`,`section`,`activity`)
								  VALUES ('$new_session_id','$user','$model','AUTHOR','$dest','$copy_sec','construction')";
				*/
				$query = $this->getQuery('insertSession');
				if($query != '')
					$query = sprintf($query, $new_session_id, 'AUTHOR', $user, $copy_sec, $model, $dest, 'construction');
				$create_sess_res = $this->getDBResults($query);
				if(!$create_sess_res)
					return null;
				/*
				$create_new_sol = "insert into solutions(`session_id`,`share`,`deleted`,`solution_graph`)
								   VALUES ('$new_session_id',0,0,'$solution_graph')";
				*/
				$query = $this->getQuery('insertSolutionGraph');
				if($query != ''){
					$query = sprintf($query, $new_session_id, 0, 0, $solution_graph);
				} else {
					return null;
				}

				$create_sol_res = $this->getDBResults($query);
				//echo $create_new_sol;
				if($create_sol_res)
					return "success";
				else
					return null;
			}

		}

		function renameAction($parameters){
			$old_folder = $this->db_connection->real_escape_string($parameters['old_folder']);
			$old_model = $this->db_connection->real_escape_string($parameters['old_model']);
			$new_item = $this->db_connection->real_escape_string($parameters['new_item']);
			$action = $parameters['action'];
			if($action == "Folder"){
				
				//$update_query = "update session set `group` = '$new_item',time = time where `group`='$old_folder'";
				//echo $update_query;
				$query = $this->getQuery('updateFolderGivenFolder');
				if($query != '')
					$query = sprintf($query, $new_item, $old_folder);
				$update_res = $this->getDBResults($query);
				//echo $update_query;
				if($update_res)
					return "success";
				else
					return null;
			}
			else if($action == "Model"){
				//$update_query = "update session set problem = '$new_item',time = time where `group`='$old_folder' AND problem='$old_model' ";
				//echo $update_query;
				$query = $this->getQuery('updateModelGivenProblemFolder');
				if($query != '')
					$query = sprintf($query, $new_item, $old_folder, $old_model);
				$update_res = $this->getDBResults($query);
				if($update_res)
					return "success";
				else
					return null;
			}
		}

		function copy_nc_model_section($parameters){
			$u = $this->db_connection->real_escape_string($parameters['u']);
			$s = $this->db_connection->real_escape_string($parameters['s']);
			$p = $this->db_connection->real_escape_string($parameters['p']);

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
			if($query != '')
				$query = sprintf($query, $session, $parameters['m'], $u, $s, $p, $row['group'], $parameters['a']);
			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}
			$query = $this->getQuery('insertSolutionGraph');
			if($query != '')
				$query = sprintf($query, $session, 1, 0, $this->db_connection->real_escape_string($row['solution_graph']));

			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}

			return "success";
		}
	}
?>
