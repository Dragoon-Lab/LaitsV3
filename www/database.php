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
			$q['getNCModel'] = 'SELECT session_id, problem, user, `group`, solution_graph FROM session JOIN solutions USING (session_id) WHERE (user = "%s" OR `group` = "%s") AND problem = "%s" AND mode = "%s" ORDER BY session.time desc LIMIT 1;';
			$q['insertSession'] = 'INSERT INTO session (session_id, mode, user, section, problem, `group`, activity) VALUES ("%s", "%s", "%s", "%s", "%s", "%s", "%s");';
			$q['insertSolutionGraph'] = 'INSERT INTO solutions (session_id, share, deleted, solution_graph) VALUES ("%s", "%s", "%s", "%s");';

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
                $new_folder = ($user[1] == 'private') ? $user[0] : $user[1];
                $new_folder = $new_folder."-deleted";
                //escape quotes, make strings query safe
                $new_folder = $this->db_connection->real_escape_string($new_folder);
                $eachFolder = $this->db_connection->real_escape_string($eachFolder);
                $del_folder_query = "update session set `group` = '$new_folder',time = time where `group` = '$eachFolder' ";
                //echo $del_folder_query;
                $del_suc1 = $this->getDBResults($del_folder_query);
            }

            foreach($del_models as $name=>$group){
                $user = explode("-",$group);
                $new_folder = ($user[1] == 'private') ? $user[0] : $user[1];
                $new_folder = $new_folder.'-deleted';
                $new_folder = $this->db_connection->real_escape_string($new_folder);
                $name = $this->db_connection->real_escape_string($name);
                $del_folder_query = "update session set `group` = '$new_folder',time = time where `group` = '$group' and problem='$name' ";
                echo $del_folder_query;
                $del_suc2 = $this->getDBResults($del_folder_query);
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
            if($action == "moveModel"){
                //move Model
                $update_query = "update session set `group` = '$dest',time = time where `group`='$src' AND problem='$model' ";
                //echo $update_query;
                $update_res = $this->getDBResults($update_query);
                if($update_res)
                    return "success";
                else
                    return null;
            }
            else if($action == "copyModel"){
                //step 1 : retrieve the most recent copy of model authored ( session id and other params)
                $get_q = "select * from session where `group` = '$src' AND problem='$model' AND mode = 'AUTHOR' ORDER BY time DESC limit 1";
                $res = $this->getDBResults($get_q);
                if(!$res) {
                    //echo "session selection failed"."<br/>";
                    return null;
                }
                $data = mysqli_fetch_array($res);
                $old_session_id = $data["session_id"];

                //step 2: copy solution for the old session id which also has to be a fresh insert
                $get_sol_q = "select * from solutions where session_id='$old_session_id'";
                $sol_res = $this->getDBResults($get_sol_q);
                $sol_data = mysqli_fetch_array($sol_res);
                $solution_graph = $sol_data['solution_graph'];
                //step 3 : create a new session id with current micro timestamp and session_id
                //This is work around and in future we need a php session creator from username and section like in js
                $new_sess1 = explode("_",$old_session_id);
                $milliseconds = round(microtime(true) * 1000);
                $new_session_id = $new_sess1[0]."_".$milliseconds;

                //step 4 : insert new session

                $create_sess_q = "insert into session(`session_id`,`user`,problem,`mode`,`group`,`section`,`activity`)
                                  VALUES ('$new_session_id','$user','$model','AUTHOR','$dest','non-class-models','construction')";
                $create_sess_res = $this->getDBResults($create_sess_q);
                if(!$create_sess_res)
                    return null;

                $create_new_sol = "insert into solutions(`session_id`,`share`,`deleted`,`solution_graph`)
                                   VALUES ('$new_session_id',0,0,'$solution_graph')";
                $create_sol_res = $this->getDBResults($create_new_sol);
                //echo $create_new_sol;
                if($create_sol_res)
                    return "success";
                else
                    return null;
            }

        }

		function copy_nc_model_section($parameters){
			$u = $this->db_connection->real_escape_string($parameters['u']);
			$s = $this->db_connection->real_escape_string($parameters['s']);
			$p = $this->db_connection->real_escape_string($parameters['p']);

			$query = $this->getQuery('getNCModel');
			if($query != ''){
				$query = sprintf($query, $u, $p, $parameters['m']);
			} else {
				return null;
			}

			echo $query;

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
			if($query != ''){
				$query = sprintf($query, $session, $parameters['m'], $u, $s, $p, $row['group'], $parameters['a']);
			} else {
				return null;
			}
			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}
			$query = $this->getQuery('insertSolutionGraph');
			if($query != ''){
				$query = sprintf($query, $session, 1, 0, $this->db_connection->real_escape_string($row['solution_graph']));
			} else {
				return null;
			}
			echo $query;
			$result = $this->getDBResults($query);
			if(!$result){
				return null;
			}

			return "success";
		}
	}
?>
