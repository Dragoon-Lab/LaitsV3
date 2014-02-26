<?php
include "logAnalysis.php";

Class ModelChanges(){
	$sqlConnection;
	function __construct($con){
		$this->sqlConnection = $con;
	}

	$al = new AnalyzeLogs($this->$sqlConnection);
}
?>