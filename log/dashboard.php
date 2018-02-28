<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
<title>Dragoon Dashboard</title>
<script type="text/javascript">
	dojoConfig = {
		parseOnLoad:true,
	    async: true,
	    baseUrl: "./",
	    packages: [
	    	{name:'dashboard', location: 'js'},
	    	{name: 'dojo', location: '../dojo'},
	    	{name: 'dijit', location: '../dijit'}
	    ]
	};

</script>
<script src="../dojo/dojo.js"></script>
<script type="text/javascript">
	require([
		"dashboard",
		"dijit/form/RadioButton"
	]);

</script>
<script type="text/javascript">
	document.write('<link href="default.css" rel="stylesheet" />');
</script>
</head>
<body>
	<?php
		$data = $_REQUEST;

		$params = ""; 
		if(count($data) != 0)
			foreach($data as $key => $value){
				$params .= $key."=".$value."&";
			}
		$params = substr($params, 0, -1);
	?>
	<input type = "hidden" id = "params" value = "<?php echo $params?>"></input>
	<p id="wait">Please Wait while we are analysing the data.</p>
	<div class = "wrapper left">
		<h2 id ="heading"></h2> <!-- Place holder for the page heading, which changes with every type of the dashboard. defined in dashboard. js -->
		<h4 id = "sub-heading"></h4> <!-- Place holder for the page sub heading -->
	</div>
	<div id="key" class = "right hidden">
		<p>Color Key</p>
		<ul>
			<li><span class="green border">Problem Completed</span></li>
			<li><span class="yellow border">Problem Incomplete & Session Running</span></li>
			<li><span class="border">Problem not Started or Incomplete</span></li>
			<li><span class="light-blue border">Current User</span></li>
		</ul>
	</div>
	<div class="clear"></div>

	<div id="table">
		<!--div to render the table -->
	</div>

	<fieldset id="tableType" class = "hidden">
		<div id="choice change" class="choice">
			<div class="newLine">
				<input type="radio" name="type" value="default" id="default" data-dojo-type="dijit/form/RadioButton" checked/>
				<label for="default">Blank</label>
			</div>
			<div class="newLine">
				<input type="radio" name="type" value="time" id="time" data-dojo-type="dijit/form/RadioButton"/>
				<label for="time">Running Time (in minutes, Total time spent - time for which window was not in focus)</label>
			</div>
			 <div class="newLine">
				<input type="radio" name="type" value="errors" id="errors" data-dojo-type="dijit/form/RadioButton"/>
				<label for="errors">Problem Accuracy (Correct choices / Total choices)</label>	
			</div>
			<div class="newLine">
				<input type="radio" name="type" value="revisits" id="revisits" data-dojo-type="dijit/form/RadioButton"/>
				<label for="revisits">Number of times problem Reopened</label>
			</div>
			<div class="newLine">
			    <input type="radio" name="type" value="nodes" id="nodes" data-dojo-type="dijit/form/RadioButton"/>
				<label for="nodes">Nodes Attempted</label>
			</div>
		</div>
	</fieldset>

</body>
</html>
