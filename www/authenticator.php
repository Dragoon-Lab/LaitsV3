<?php
	$username = $_POST['username'];
	$mode = $_POST['mode'];
	$problem_id = $_POST['problem_id'];
	
	if($mode == "AUTHOR"){
		$problem_id = "_Author";
	}

	//echo "result = ".$username."  ".$mode."  ".$problem_id;
	
	$string = file_get_contents("laits.jnlp");
        
	$filename = "laits".$username.$problem_id.".jnlp";
        
        
        $string = str_replace("laits.jnlp","",$string);
        
        $content = simplexml_load_string($string);
        
        $object = $content->xpath("application-desc");
	
	$array = $object[0][1];
	$arguments = $array->xpath("argument");
	
	$arguments[0][0] = $username;
	$arguments[1][0] = $mode;
	$arguments[2][0] = $problem_id;
	
	
        header('Content-type: application/x-java-jnlp-file');
        header('Content-Disposition: attachment; filename="'.$filename.'"');
	print $content->asXML();
	
?>
