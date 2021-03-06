<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
	<title>Dragoon</title>
	<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon"/>
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="./dijit/themes/claro/claro.css">

	<script type = "text/javascript" src = "version.js"></script>
	<script src="tincan/tincan-min.js"></script>

	<script type="text/javascript">
		var version = "";

		if(window.location.hostname == "dragoon.asu.edu"){
			version = getVersion();  // Get version from version.js
		}else{
			version = new Date();
		}

		dojoConfig = {
			isDebug:true,
			parseOnLoad:true,
			async: true,
			// popup:true,
			baseUrl: "./",
			cacheBust: version,
			packages: [
				{name: "dojo", location: "dojo"},
				{name: "dijit", location: "dijit"},
				{name: "dojox", location: "dojox"},
				{name: "ET", location: "ET"},
				{name: "jsPlumb", location: "jsPlumb/src"},
				{name: "dragoon", location: "js"},
				{name: "parser", location: "math-parser"},
				// AMD doesn't handle file names with dots,
				// need to specify explicitly
				{name: "jsBezier", location: "jsPlumb/lib", main: "jsBezier-0.6"},
				{name: "jsplumb-geom", location: "jsPlumb/lib", main: "jsplumb-geom-0.1"},
				{name: "demo", location: "jsPlumb/demo"}
			]
		};
		if(dojoConfig.isDebug){
			document.write('<link href="css/dragoon.css?'+ version+'" rel="stylesheet" />');
			document.write('<scr'+'ipt src="dojo/dojo.js"></scr'+'ipt>');
		} else {
			document.write('<link href="release/css/dragoon.css?'+ version+'"  rel="stylesheet" />');
			document.write('<scr'+'ipt src="release/dojo/dojo.js"></scr'+'ipt>');
		};
	</script>

	<script type="text/javascript">
		/*
		 This require should include all of the packages
		 needed by widgets defined in the html below.

		 Most widgets have an associated css style sheet that is
		 loaded by css/dragoon.css
		 */
		require(["dojo/domReady!"], function() {
			//Load once dom is ready
			require([
				"dojo/parser",
				"dijit/Dialog",
				"dijit/Editor",
				"dijit/_editor/plugins/LinkDialog",
				"dijit/MenuBar", "dijit/PopupMenuBarItem",
				"dijit/layout/BorderContainer", "dijit/MenuItem",
				"dijit/form/Select", "dijit/form/Textarea",
				"dijit/form/Button", "dijit/form/CheckBox", "dijit/form/TextBox",
				"dijit/form/ComboBox", "dijit/form/Textarea", "dijit/form/RadioButton",
				"dijit/form/SimpleTextarea", "dijit/Menu",
				"dijit/layout/ContentPane", "dijit/registry",
				"dijit/TooltipDialog",
				"dragoon/menu", // Wire up menus
				"dragoon" // Load up Dragoon itself
			]);
		});
	</script>


	<!-- jsPlumb Libs Start Here -->
	<!-- Once AMD is correctly implemented in jsPlumb, these should go away -->

	<script type="text/javascript">
		// Use AMD to get jsPlumb
		require([
			// support lib for bezier stuff
			"jsBezier",
			// jsplumb geom functions
			"jsplumb-geom",
			// base DOM adapter 
			"jsPlumb/dom-adapter",
			// main jsplumb engine 
			"jsPlumb/jsPlumb",
			// endpoint 
			"jsPlumb/endpoint",
			// connection 
			"jsPlumb/connection",
			// anchors 
			"jsPlumb/anchors",
			// connectors, endpoint and overlays  
			"jsPlumb/defaults",
			// bezier connectors 
			// "jsPlumb/connectors-bezier",
			// state machine connectors 
			"jsPlumb/connectors-statemachine",
			// flowchart connectors 
			"jsPlumb/connectors-flowchart",
			"jsPlumb/connector-editors",
			// SVG renderer 
			"jsPlumb/renderers-svg",
			// canvas renderer 
			"jsPlumb/renderers-canvas",
			// vml renderer 
			"jsPlumb/renderers-vml",
			// jquery jsPlumb adapter 
			"jsPlumb/dojo-adapter",
			// Dojo interface layer
			"demo/demo-helper-dojo"
		]);
	</script>

	<!-- jsPlumb Libs End Here -->
	<!-- SuperGLU javascript files -->
	<script type = "text/javascript">
		document.write("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />");
		document.write("<meta name=\"google\" value=\"notranslate\" />");
		//import utitilities
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/emacs5-compatibility-patches.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/general-utilities.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/encoder.js"></scr'+'ipt>');
		//superGLU imports
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/uuid.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/zet.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/super-glu.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Util/serialization.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Core/messaging.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Core/messaging-gateway.js"></scr'+'ipt>');

		//superglu services
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Services/Orchestration/heartbeat-service.js"></scr'+'ipt>');
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/SuperGLU/Services/LoggingService/standard-its-logging.js"></scr'+'ipt>');

		//reference implementation data
		document.write('<scr'+'ipt type="text/javascript" src="ET/js/reference-data.js"></scr'+'ipt>');

		//ET New libraries
			document.write('<scr'+'ipt type="text/javascript" src="ET-2.0/lib/xapiwrapper.min.js"></scr'+'ipt>');
			document.write('<scr'+'ipt src="ET-config.json"></scr'+'ipt>');
			document.write('<scr'+'ipt type="text/javascript" src="ET-2.0/lib/myxapiclient.js"></scr'+'ipt>');
	</script>

</head>

<div id="loadingOverlay" class="loadingOverlay pageOverlay" style = "top: 0;
	left: 0;
	position: absolute;
	height: 100%;
	width: 100%;
	z-index: 1001;
	display: block;
	background:  #fff url('images/DragoonMountains.png') no-repeat;
	background-position: center;
	background-color: #d9baa3;"></div>

<body class="claro" style = "top: 0;
	left: 0;
	position: fixed;
	height: 100%;
	width: 100%;">
<?php
	$data = $_REQUEST;

	$params = "";
	if(count($data) != 0)
		foreach($data as $key => $value){
			$params .= $key."=".$value."&";
		}

	$params = substr($params, 0, -1);
?>
<input type = "hidden" id = "query" value = "<?php echo $params?>"/>
<div id="main" data-dojo-type="dijit/layout/BorderContainer" gutters="false">
	<div data-dojo-type="dijit/MenuBar" id="menuBar" region="top" splitter="false">
		<button type="button" data-dojo-type="dijit/form/Button" id="createNodeButton" disabled="true" style="display: none">Create Node</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="graphButton" disabled="true" style="display: none">Graph</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="tableButton" disabled="true" style="display: none">Table</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="schemaButton" disabled="true" style="display: none">Schemas</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="descButton" disabled="true" style="display: none">Problem &amp; Times</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="saveButton" disabled="true" style="display: none">Save As</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="mergeButton" disabled="true" style="display: none">Merge </button>
		<!--<button type="button" data-dojo-type="dijit/form/Button" id="previewButton" disabled="true" style="display: none">Preview</button>-->
		<div id="previewButton" data-dojo-type="dijit/PopupMenuBarItem">
			<span>Preview</span>
			<div data-dojo-type="dijit/Menu" id="menuPreview">
				<div id="menu_construction" data-dojo-type="dijit/MenuItem">Construction</div>
				<div id="menu_incremental" data-dojo-type="dijit/MenuItem">Incremental</div>
				<div id="menu_incrementalDemo" data-dojo-type="dijit/MenuItem">Incremental Demo</div>
				<div id="menu_execution" data-dojo-type="dijit/MenuItem">Execution</div>
				<div id="menu_executionDemo" data-dojo-type="dijit/MenuItem">Execution Demo</div>
				<div id="menu_waveform" data-dojo-type="dijit/MenuItem">Waveform</div>
			</div>
		</div>
		<button type="button" data-dojo-type="dijit/form/Button" id="slidesButton" disabled="true" style="display: none">Hints</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="prettifyButton" disabled="true" style="display: none">Prettify</button>
		<div data-dojo-type="dijit/PopupMenuBarItem">
			<span>Help</span>
			<div data-dojo-type="dijit/Menu" id="menuHelp">                
				<div id="menuIntroTutorial" data-dojo-type="dijit/MenuItem">Introduction</div>
				<div id="menuIntroVideo" data-dojo-type="dijit/MenuItem">Electronics Tutorial Video</div>
				<div id="menuIntroConcept" data-dojo-type="dijit/MenuItem">Intro to Dragoon concepts</div>
				<div id="menuOldIntroVideo" data-dojo-type="dijit/MenuItem">Slightly older intro video</div>
				<div id="menuMathFunctions" data-dojo-type="dijit/MenuItem">Math functions</div>
			</div>
		</div>
		<button type="button" data-dojo-type="dijit/form/Button" id="lessonsLearnedButton" disabled="true" style="display: none">Lessons Learned</button>
		<button type="button" data-dojo-type="dijit/form/Button" id="resetButton" style="display: none">Reset</button>
		 <button type="button" data-dojo-type="dijit/form/Button" id="historyButton" disabled="true" style="display: none">History </button>
		<button type="button" data-dojo-type="dijit/form/Button" id="doneButton" style="display: none">Done</button>
		<div id="zoomButtons" class = "zoomButtons">
			<!--<button type = "button" data-dojo-type="dijit/form/Button" id="zoomIn">Zoom In</button>
			<button type = "button" data-dojo-type="dijit/form/Button" id="zoomOut">Zoom Out</button>-->
			<img src = "images/zoom_in.png" id = "zoomIn" class = "zoomImage"/>
			<img src = "images/zoom_out.png" id = "zoomOut" class = "zoomImage"/>
		</div>
   
	</div> <!-- Menubar -->

	<div id="drawingPane" class="restrict-vscroll" data-dojo-type="dijit/layout/ContentPane" region="center">
		<div id="errorMessageBox"></div>
		<!--<div id="tableGrid" data-dojo-type="dijit/layout/ContentPane" region="center"></div>-->
		<!-- Putting jsPlumb-stuff for demo -->
		<canvas id="myCanvas" height = "1000" width="800"></canvas>
		<div class="demo statemachine-demo" id="statemachine-demo">
		</div>

		<!-- Putting jsPlumb-stuff for demo  end-->
	</div>

	<!-- Dialog showing plot or table of solution  -->
	<div class="claro dijitLayoutContainer dijitDialog" id="solution" data-dojo-type="dijit.Dialog" style="min-width:70%; min-height: 80%; background-color: #FFFFFF">
		<div id= 'graphErrorMessage'></div>
		<div data-dojo-type= 'dijit/layout/ContentPane' style='overflow:visible; width:55%; min-height:95%; float:left; background-color: #FFFFFF;'>
			<div id="GraphTabContainer" data-dojo-type='dijit/layout/TabContainer' style='overflow:visible; display:none;'>
				<div id='GraphTab' data-dojo-type='dijit/layout/ContentPane' style='overflow:auto;' title="Graph"></div>
				<div id='TableTab' data-dojo-type='dijit/layout/ContentPane' style='overflow:auto' title="Table"></div>
				<div id='StaticTab' data-dojo-type='dijit/layout/ContentPane' style='overflow:auto' title="Static"></div>
			</div>
		 </div>
		<div id="SliderPane" data-dojo-type='dijit/layout/ContentPane' style='overflow:visible; min-height: 95%; width:40%; float:right; background-color: #FFFFFF'>
			<div id= 'solutionMessage'></div>
		</div>
	</div>

	<!-- Dialog showing lessonsLearned  -->
	<div class="claro" id="lesson" data-dojo-type="dijit.Dialog">
	</div>
	<!-- Putting crisis-Alert Dialog stuff -->

	<div class="claro crisisDialog" id="crisisAlertMessage" data-dojo-type="dijit.Dialog" title="Message">
		<div id = "crisisMessage"> </div>
		<button id="OkButton" type="button" data-dojo-type="dijit/form/Button">OK</button>
	</div>
	<!-- Putting crisis-Alert Dialog stuff end -->
	<!-- Putting crisis-Alert Dialog stuff end -->

	<!--  authorSetDescription, authorSetTimeStart, authorSetTimeEnd, authorSetTimeStep, authorSetTimeStepUnits, authorSetImage) -->
	<div class="claro sameedit" data-dojo-type="dijit/Dialog" id="authorDescDialog" title="Edit Times, Image, and Problem Statement">
		<div class="fieldgroup" >
			<label for="taskName">Problem Title</label>
			<input id="taskName" style="width:15em" data-dojo-type="dijit/form/TextBox">
		</div> 
		<div class="fieldgroup">
			<label for="authorSetTimeStepUnits">Units:</label>
			<select data-dojo-type="dijit/form/ComboBox" id="authorSetTimeStepUnits" name="authorSetTimeStepUnits" class="timeStepAuthor">
				<option>microseconds</option>
				<option>milliseconds</option>
				<option>hundredths of a second</option>
				<option>tenths of a second</option>
				<option>seconds</option>
				<option>minutes</option>
				<option>hours</option>
				<option>days</option>
				<option>weeks</option>
				<option>months</option>
				<option>years</option>
			</select>
		</div>
		<div class="fieldgroup">
			<label for="authorSetTimeStart">Start Time:</label>
			<input id="authorSetTimeStart" style="width:5em" value="0" data-dojo-type="dijit/form/TextBox"/>
			<div id="timeStartUnits">seconds</div>
		</div>
		<div class="fieldgroup">
			<label for="authorSetTimeEnd">End Time:</label>
			<input id="authorSetTimeEnd" style="width:5em" value="10" data-dojo-type="dijit/form/TextBox"/>
			<div id="timeEndUnits">seconds</div>
		   <!--  <div id="start_end_errorbox" style="border: 2px solid #ff0000; display: none;">Start time must be less than end time</div> -->

		</div>
		<div class="fieldgroup">
			<label for="authorSetIntegrationMethod">Integration Method:</label>
			<select data-dojo-type="dijit/form/ComboBox" id="authorSetIntegrationMethod" name="authorSetIntegrationMethod" class="integrationMethodAuthor">
				<option>Eulers Method</option>
				<option>Midpoint Method</option>
			</select> <img id="integrationMethod"  class="questionMark" src="images/help-active.png"/>

		</div>
		<div class="fieldgroup">
			<label for="authorSetImage">URL for Image:</label>
			<input id="authorSetImage"/>
			<img id="questionMarkURL"  class="questionMark" src="images/help-active.png"/>
		</div>

		  <div class="fieldgroup">
			<label for="authorSetParameters" >Node to adjust: </label>    
			<select id="authorSetParameters" name="authorSetParameters" data-dojo-type="dijit/form/Select" style="border:solid black 1px;">
			<!-- <option value='defaultSelect'>--Select--</option> -->
			</select>
		</div>        

		<div class="fieldgroup">
			<label for="authorSetParamDir" > Direction of adjustment: </label>
			<select id="authorSetParamDir" name="authorSetParamDir" data-dojo-type="dijit/form/Select" style="border:solid black 1px;">
				<option value='defaultSelect'>--Select--</option>
				<option value="Increase">Increase</option>
				<option value="Decrease">Decrease</option>
			</select>
		</div>

		<div class="fieldgroup">
			<label for="authorSetDescription">Problem Statement:</label>
			<select id="authorSetDescriptionType" name="authorSetDescriptionType" data-dojo-type="dijit/form/Select" style="border:solid black 1px;">
				<option value="construction">Construction</option>
				<option value="incremental">Incremental</option>
				<option value="execution">Execution</option>
				<option value="waveform">Waveform</option>
			</select>
			<textarea id="authorSetDescription" name="authorSetDescription" data-dojo-type="dijit/form/SimpleTextarea" value="Enter Description here..."></textarea>
		</div>

		<div class="fieldgroup">
			<label for="authorSetLessonsLearned">Lessons Learned:</label>
			<img id="questionMarkLessons"  class="questionMark" src="images/help-active.png"/>
			<textarea id="authorSetLessonsLearned" name="authorSetLessonsLearned" data-dojo-type="dijit/form/SimpleTextarea" value="Enter Lessons Learned here..."></textarea>
		</div>

		 <div id="start_end_errorbox" style="border: 2px solid #ff0000; display: none;"></div>
		<div class="fieldgroup" style="visibility: hidden;">
			<label for="authorProblemShare" title="Share this problem with students.">Share Problem:</label>
			<input id="authorProblemShare" name="authorProblemShare" data-dojo-type="dijit/form/CheckBox" value="agreed" checked="false"/>
			<img id="questionMarkShare"  class="questionMark" src="images/help-active.png"/>
		</div>
		<div id="publishResponse" style = "display:none;"></div>
		<div class="fieldgroup" align="right">
			<button id="authorProblemCheck" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Check Problem</button>
			<button id="problemPublishButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style = "display:none;">Publish</button>
			<button id="descCloseButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Done</button>
		</div>
	</div>

	<!-- authorSaveProblem, authorSaveGroup -->
	<div class="claro sameedit" data-dojo-type="dijit/Dialog" id="authorSaveDialog" title="Save As...">
		<div class="fieldgroup">
			<label for="authorSaveProblem" style="width:7em">Problem Name:</label>
			<input id="authorSaveProblem" style="width:20em" value="0" data-dojo-type="dijit/form/TextBox"/>
		</div>
		<div class="fieldgroup">
			<label for="authorSaveGroup" style="width:7em">Folder Name:</label>
			<select id="authorSaveGroup" style="width:20em" data-dojo-type="dijit/form/ComboBox" searchAttr="id">
			</select>
		</div>
		<div class="fieldgroup" aligh="right" id="authorSaveStatus">
		</div>
		<div class="fieldgroup" align="left">Note: Any forum posts attached to this model will not be copied.</div>
		<div id="saveMessage"></div>
		<div class="fieldgroup" align="right">
			<button id="saveCloseButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Save</button>
		</div>
	</div>

	<!-- authorMergeProblem -->
	<div class="claro sameedit" data-dojo-type="dijit/Dialog" id="authorMergeDialog" title="Merge Problem">
		<div class="fieldgroup">
			<label for="authorMergeProblem" style="width:7em">Problem Name:</label>
			<!--input id="authorMergeProblem" style="width:10em" value="" data-dojo-type="dijit/form/TextBox"/-->
			<select id = "authorMergeProblem" style="width:20em" data-dojo-type="dijit/form/Select">
			</select>
		</div>
		<!--div class="fieldgroup">
			<label for="authorMergeSection" style="width:7em">Section Name:</label>
			<input id="authorMergeSection" style="width:10em" value="" data-dojo-type="dijit/form/TextBox"/>
		</div>
		<div class="fieldgroup">
			<label for="authorMergeGroup" style="width:7em">Folder Name:</label>
			<select id="authorMergeGroup" style="width:20em" data-dojo-type="dijit/form/ComboBox">
			</select>
		</div-->
		<div class="fieldgroup" align="left">Note: Any forum posts attached to the source model will not be copied.</div>
		<div class="fieldgroup" align="right">
			<button id="mergeDialogButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Merge</button>
		</div>
	</div>

	<!-- Putting Node-Editor -Dialog stuff for demo -->
	<div class="claro sameedit" data-dojo-type="dijit/Dialog" id="nodeeditor">
		<div id="studentModelControl" class="fieldgroup" style="display:none;" >
			<label style="width:20ex;" for="setStudentNode">Show in Student Model</label>
			<input id="setStudentNode" name="markStudentNode" data-dojo-type="dijit/form/CheckBox" checked="false"/>
		</div>
		<div id="selectModelControl" class="fieldgroup" style="display:none" >
			<label for="selectModel">Select Model</label>
			<select id="selectModel" data-dojo-type="dijit/form/Select">
				<option value='correct' selected>Author's Values</option>
				<option value='given'>Initial Student Values</option>

			</select>
		</div>
		<div id="nameControl" class="fieldgroup" style="display:none">
			<label for="setName">Name</label>
			<input id="setName" data-dojo-type="dijit/form/ComboBox">
			<label for="selectKind">Kind of quantity:</label>
			<select id="selectKind" data-dojo-type="dijit/form/Select">
				<option value='defaultSelect'>--Select--</option>
				<option value='required'>in model & required</option>
				<option value='allowed'>in model & optional</option>
				<option value='extra'>in problem statement but not in model</option>
				<option value='irrelevant'>not in model or problem statement</option>
			</select>
		</div>
		<div class="fieldgroup">
			<div id="descriptionControlStudent" class="fieldgroup">
				<span class="fixedwidth">
					<div id="descriptionQuestionMark" class="questionMark"></div>
					<label for="selectDescription">Description</label>
				</span>
				<select id="selectDescription" data-dojo-type="dijit/form/Select">
					<option value='defaultSelect'>--Select--</option>
				</select>
			</div>
			<div id="descriptionControlAuthor" class="fieldgroup" style="display:none">
				  <span class="fixedwidth">
					  <div id="authorDescriptionQuestionMark" class="questionMark"></div>
			 <label for="setDescription">Description</label>
				  </span>
				<input id="setDescription" data-dojo-type="dijit/form/ComboBox">
			</div>
			<!-- Explanation button -->
			<div data-dojo-type="dijit/Dialog" data-dojo-id="myFormDialog" title="Explanation">

				<div class="dijitDialogPaneContentArea" data-dojo-attach-point="name">
					<label id="editorLabel" for="editorInput" style="display:none"><b>Insert your explanation below: </b></label>
					<input id="editorInput" type="hidden" name="editorContent" data-dojo-attach-point="name" style="display:none"/>
					<div  id="editorContent" dojoType="dijit/Editor"
						  height="200px"
						  extraPlugins=" ['createLink', 'unlink', 'insertImage'] " >
					</div>
				</div>

				<div class="dijitDialogPaneActionBar">
					<button id="OKEditorButton" data-dojo-type="dijit/form/Button" type="submit" onClick="return myFormDialog.isValid();" >
						OK
					</button>
					<button id="cancelEditorButton" data-dojo-type="dijit/form/Button" type="button" onClick="myFormDialog.hide()">
						Cancel
					</button>
				</div>
			</div>
			<div class="buttonBox">
				<button id="explanationButton" data-dojo-type="dijit/form/Button" type="button" iconClass="dijitNoIcon" onclick="myFormDialog.show()">
					Explanation
				</button>
			</div>
			<!--  End of explanation part -->

		</div>
		<div class="fieldgroup">
				<span class="fixedwidth">
					 <div id="typeQuestionMark" class="questionMark"></div>
					<label for="typeId">Type</label>
				</span>
			<select id="typeId" data-dojo-type="dijit/form/Select">
				<option value='defaultSelect'>--Select--</option>
				<option value="parameter">Parameter</option>
				<option value="accumulator">Accumulator</option>
				<option value="function">Function</option>
			</select>
			<!-- adding a div for value field to control its display in UI -->
			<div id="initialValueDiv" style="display: none">
				<span>
					<div id="initialValueQuestionMark" class="questionMark"></div>
					<label for="initialValue"><p id="initLabel" style="display:inline">Initial </p>Value</label>
				</span>
				<input id="initialValue" type="text" style="width:5em" data-dojo-type="dijit/form/TextBox">
			</div>
			 <div id = "unitDiv" style="display: none">
					<div id="unitsQuestionMark" class="questionMark"></div>
					<label id="selectUnitsControl">Units
						<select id="selectUnits" data-dojo-type="dijit/form/Select">
							<option value='defaultSelect' disabled="disabled" selected ="selected" style="display: none;">--Select--</option>
							<option value=null>No Units</option>
						</select>
					</label>
			 </div>
			<div id="setUnitsControl" style="display: none">
				<!-- Setting display:none in the widget itself doesn't work.
					 setting display:none in the label doesn't work in FireFox. -->
				<label for="setUnits">Units
					<input id="setUnits" data-dojo-type="dijit/form/ComboBox" style="width:6em">
				</label>
			</div>
		</div>
		<div id="setRootNode" class="fieldgroup" style="display:none">
			<label for ="markRootNode" title ="Mark this node as a root node.">Root:</label>
			<input id ="markRootNode" name ="markRootNode" data-dojo-type="dijit/form/CheckBox" value="agreed" checked="false"/>
			<div id="questionMarkRoot" class="questionMark"></div>
		</div>
		<div class="ExpressionContainer" id="expressionDiv" style="display: none">
			<div class="fieldgroup">
					 <span class="fixedwidth">
						 <div id="expressionBoxQuestionMark" class="questionMark"></div>
						 <label for="equationBox">Expression</label>
					 </span>
				<div class="vertical">
					<div id="equationLabel"></div>
					<textarea id="equationBox" rows=2 cols=35 data-dojo-type="dijit/form/SimpleTextarea"></textarea>
					<!-- adding givenEquationBox for equations in given model for author , hidden in student mode -->
					<textarea id="givenEquationBox" rows=2 cols=35 data-dojo-type="dijit/form/SimpleTextarea" style="display:none; min-height:48px;"></textarea>
					<div id="equationText"></div>
					<!--<div id="timeStepLabel"></div>-->
				</div>
				<div class="buttonBox">
					<button id="undoButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Undo</button>
					<button id="equationDoneButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Check Expression</button>
				</div>
			</div>
			<div class="fieldgroup" id="algebraic">
					<span class="fixedwidth">
						<div id="inputsQuestionMark" class="questionMark"></div>
						<label>Insert above </label>
					</span>
				<div class="vertical">
					<div id="inputControlStudent" style="background-color:#fff;">
						<select id="nodeInputs" data-dojo-type="dijit/form/Select">
							<option value='defaultSelect'>--Select--</option>
						</select>
					</div>

					<div id="inputControlAuthor" style="display:none; background-color:#fff;">
						<select id="setInput" data-dojo-type="dijit/form/ComboBox">
						</select>
					</div>
				</div>
			</div>
			<div class="fieldgroup" id="operations">
					<span class="fixedwidth">
						 <div id="operationsQuestionMark" class="questionMark" style="margin-top:4px;"></div>
					</span>

				<div>
					<button id="plusButton" title="Plus" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon"><span class="fa fa-plus"></span></button>
					<button id="minusButton" title="Minus" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon"><span class="fa fa-minus"></span></button>
					<button id="timesButton"  title="Times" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon"><span class="fa fa-asterisk"></span></button>
					<button id="divideButton"  title="Divide" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon"><strong class="fa fa-minus fa-division"></strong></button>
				</div>
			</div>
			<div class="fieldgroup" id="structured">
				<label>Insert above </label>
				<div class="vertical">
					<div class="horizontal">
						<button id="sumButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Sum</button>
						<button id="productButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Product</button>
					</div>
					<div class="horizontal">
						<label id="positiveInputsText" for="positiveInputs" style="display:inline">Add quantity:</label><br>
						<select id="positiveInputs" data-dojo-type="dijit/form/Select" style="display:inline-block">
							<option value='defaultSelect'>--Select--</option>
						</select>
					</div>
					<div class="horizontal">
						<label id="negativeInputsText" for="negativeInputs" style="display:inline">Subtract quantity:</label><br>
						<select id="negativeInputs" data-dojo-type="dijit/form/Select" style="display:inline-block">
							<option value='defaultSelect'>--Select--</option>
						</select>
					</div>
				</div>
			</div>
		</div>
		<div class="fieldgroup">
			<div id="assignButtonBox" style="padding-top:0px; display: none" >
				<button id="assignWaveFormButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style="float: left; margin-right: 5px;">Assign Waveform</button>
				<div id="waveformStore" style="float: left"></div>
				<div id="removeWaveform" style="float: left; color: #ff0000; display: none; cursor: pointer; margin-left: 5px;">X</div>
			</div>
		</div>
		<div class="fieldgroup">
			<label for="messageBox">Messages</label>
			<div id="messageBox" class="textscroll" data-dojo-type="dijit/layout/ContentPane"></div>
			<div class="buttonBox" style="padding-top:0px">
				<!-- Strut to move close button down.  It would be
						better to do this with css... -->
			</div>
			<div style="margin-bottom:10px; display:block">
				<span>&nbsp;</span>
				<button id="closeButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style="float:right;">Done</button>
				<button id="deleteButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style="float:left;">Delete Node</button>
				<button id="imageButton" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style="float:left; " disabled="true">Image Highlighting</button>
			</div>
		</div>
		<div class="claro sameedit" id="markImageBox" data-dojo-type="dijit/Dialog" title="Image Highlighting" style="width:600px;">
			<div class="imagebox-container" >
				<div class="image-container" style="float:left; margin-left:20px; position:relative; width:44%">
					<canvas id="markImageCanvas"></canvas>
					</br>
					<label style="color:grey;">Click and drag to mark the region of the image you wish to highlight when the user puts their mouse over the node.  Then click "Add" to add it to the list of regions to highlight.</label>
				</div>
				<div class="coordinates-container" style="float:right; width:44%; position:relative; text-align:right; padding-top:25px; padding-right:15px;">
					<div class="fieldgroup">
						<label style="width:80px; padding-left:5px;padding-right:5px;text-align:right; margin-left:0px;">Selected Region</label>
						<input type="text" id="newMark" data-dojo-type="dijit/form/TextBox" style="width:128px"readonly/>
					</div>
					<div class="fieldgroup" style="text-align:right">
						<button id="markImageAdd" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" >Add</button>
						<button id="markImageClear" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" >Clear Selection</button>
					</div>

					<div class="fieldgroup" style="text-align:right;">
						<label style="width:80px; padding-left:5px;padding-right:5px; text-align:right; margin-left:0px;">Regions to Highlight</label>
						<select id="savedMark" data-dojo-type="dijit/form/Select" style="width:128px"></select><br/>
						<div class="fieldgroup" style="text-align: right; display:block;"> <button id="markImageRemove" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" style="text-align:right;" >Remove</button> </div>
					</div>
				</div>
			</div>
			<div class="fieldgroup" style="text-align:right;padding-right:15px;">
				<button id="markImageCancel" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" >Cancel</button>
				<button id="markImageDone" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Done</button>
			</div>
		</div>
	</div> <!-- end of node editor -->
	<!-- Putting Node-Editor stuff for demo  end -->
	<!-- begin of the intro tutorial -->
	<div class="claro sameedit tutorialBox" id="tutorialBox" data-dojo-type="dijit/Dialog" title="Tutorial" >
		<div id="container">
			<!--<p id="tutorialHeading" class="tutorialHeading"></p> -->
			<div id="tutorialImageContainer">
				<image id="tutorialImage" width="580" height="300" style="border:1px solid grey" class="tutorialBoxImage"/>
				<!--<image id="tutorialImage2" width="580" height="300" />
				<image id="tutorialImage3" width="580" height="300" />-->
			</div>
			<div id="tutorialContent" class="tutorialContent"></div>
			<div id="tutorialNav" class="tutorialNav">
				<button id="tutorialPrev" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon" >Previous</button>
				<button id="tutorialNext" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Next</button>
				<button id="tutorialShow" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Show Me</button>
			</div>
		</div>
	</div>
	<!-- end of the intro tutorial -->

	<div class="claro slides" id="slidesBox" data-dojo-type="dijit/Dialog" title="Hints">
		<div id="buttons">
			<button id="prevSlide" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Previous Slide</button>
			<button id="nextSlide" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Next Slide</button>
		</div>
		<div id="slideWrapper"> <!--container for slides --></div>
	</div>

	<div class="claro sameedit schema" id="schemaAuthorBox" data-dojo-type="dijit/Dialog" title="Schema Author">
		<div id = "errorBox" class = "error"></div>
		<div class = "fieldgroup">
			<label for="accordion">Schemas</label>
			<div id="accordion" /><!--div for schema box-->
		</div>
		<div class = "fieldgroup">
			<label for="isolationCheckbox">This is the only schema application.</label>
			<input id="isolationCheckbox" name="isolation" data-dojo-type="dijit/form/CheckBox" value="agreed" checked="false"/>
		</div>
		<div class = "fieldgroup">
			<label for="cuesCheckbox">The description mentions the schema.</label>
			<input id="cuesCheckbox" name="cues" data-dojo-type="dijit/form/CheckBox" value="agreed" checked="false"/>
		</div>
		<div class = "fieldgroup">
			<label for="phrasesCheckbox">One or more node names mention the schema.</label>
			<input id="phrasesCheckbox" name="phrases" data-dojo-type="dijit/form/CheckBox" value="agreed" checked="false"/>
		</div>
		<div class="fieldgroup">
			<label for="nodesDropdown">Nodes: </label>
			<div id="nodesDropdown">
				<select class="nodesDropdown" id="nodes1" data-dojo-type="dijit/form/Select"></select>
			</div> <!-- place holder for nodes dropdown -->
		</div>
		<div id="buttons">
			<button id="showAllSchemas" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">View All Schemas</button>
			<button id="goToFactors" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Next</button>
			<button id="resetSchema" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Reset</button>
		</div>

	</div>

	<div class = "claro sameedit schemaFactor" id="schemaFactorBox" data-dojo-type="dijit/Dialog" title="Schema Author">
		<div id = "factors">
			<div class="heading">
				<span class="slip">Slip</span>
				<span class="guess">Guess</span>
			</div>
			<div class = "clear"></div> <!-- clear float -->
			<div id = "fValues"></div><!-- place holder for input text boxes -->
		</div>
		<div id="schmaFactorButtons">
			<button id="saveSchema" type="button" data-dojo-type="dijit/form/Button" iconClass="dijitNoIcon">Save</button>
		</div>
	</div> <!-- div for schema factor values -->

	<!--Putting Incremental Editor popup -->
	<div class="claro sameedit" data-dojo-type="dijit/TooltipDialog" id="incrementalMenu" style="display:none;">
		<div id="IncrementalNodeName" class="incrementalButton" style="text-align: center"></div>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button" iconClass="fa fa-arrow-up inc-button" id="IncreaseButton"> Increase</button>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button" iconClass="fa fa-arrow-down inc-button"  id="DecreaseButton"> Decrease</button>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa fa-equal inc-button"  id="Stays-SameButton"><strong>&#x003d;</strong> Stays same</button>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa fa-question inc-button" id="UnknownButton"> Varies</button>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="EquationButton"> Show Equation</button>
		<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="ShowExplanationButton"> Show Explanation</button>
	</div>
	<!--end of Incremental popup-->


	<!--Putting Execution Editor popup -->
	<div class="claro sameedit" data-dojo-type="dijit/TooltipDialog" id="executionMenu" style="display:none;">
		<div id="executionNodeName" class="incrementalButton" style="text-align: center"></div>

		<label for="executionValue">New Value:</label>
		<select id="executionValue"  data-dojo-type="dijit/form/Select">
			<option value='defaultSelect'>--Select--</option>
		</select>

		<div style="text-align:center">
			 <button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="ExecEquationButton"> Show Equation</button><br/>
			 <button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="ExecShowExplanationButton"> Show Explanation</button>
		</div>
	</div>
	<!--end of Execution popup-->

	<!-- start of Waveform Editor -->
	<div class="claro sameedit" data-dojo-type="dijit/Dialog" id="waveformEditor">
		<div class="waveform-grid" id="waveform-container">

		</div>
		<div style="min-width:250px; text-align:center" id="waveButtonStore">
			<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="WaveformEquationButton"> Show Equation</button>
			<button type="button" class="incrementalButton" data-dojo-type="dijit/form/Button"  iconClass="fa inc-button" id="WaveformExplanationButton"> Show Explanation</button>
		</div>
	</div>
	<!-- end of Waveform Editor -->

	<div class="claro sameedit" id="viewAllSchemaDialog" data-dojo-type="dijit/Dialog" title="Edit Schemas" style="width:300px;">
	</div>

	<div data-dojo-type="dijit/Dialog" data-dojo-id="alertDialog" id ="alertDialog" title="Message" style="width:300px; position: absolute; top: 150px; right: 300px;"> If you want to keep the values you set here, write them down because they won't be installed in the model automatically.</div>

	<div id="ETContainer" style="visibility: hidden; width: 0; height: 0;"></div> <!-- container for SuperGLU integration for Electronix Tutor -->

</div>  <!-- main -->

<!-- import liviz -->
<script type="text/javascript" src="Liviz/global-util.js?v=2"></script>
<script type="text/javascript" src="Liviz/workered.js?v=2"></script>
<script type="text/javascript" src="Liviz/progress-view.js?v=2"></script>
<script type="text/javascript" src="Liviz/progress-model.js?v=2"></script>
<script type="text/javascript" src="Liviz/stopgo.js?v=2"></script>
<script type="text/javascript" src="cryptoJS/sha256.js"></script>
</body>
</html>
