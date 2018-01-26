/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* global define */
define([
	"dojo/_base/array",
	'dojo/_base/lang',
	"dojo/dom",
	'dojo/dom-geometry',
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/on",
	'dojo/aspect',
	"dojo/io-query",
	"dojo/query",
	"dojo/ready",
	'dijit/registry',
	"dijit/Tooltip",
	"dijit/TooltipDialog",
	"dijit/popup",
	"./menu",
	"./load-save",
	"./model",
	"./RenderGraph",
	"./con-student",
	"./con-author",
	"./draw-model",
	"./logging",
	"./equation",
	"./description",
	"./state",
	"./typechecker",
	"./createSlides",
	"./lessons-learned",
	"./schemas-author",
	"./message-box",
	"./tincan",
	"./activity-parameters",
	"dojo/store/Memory",
	"dojo/_base/event",
	"./ui-parameter",
	"dijit/Dialog",
	"./image-box",
	"./modelChanges",
	"./tutorialWidget",
	"./zoom-correction",
	"./history-widget",
	"./ET-Helper",
], function(
	array, lang, dom, geometry, style, domClass, on, aspect, ioQuery, DQuery, ready, registry, toolTip, tooltipDialog, popup,
	menu, loadSave, model, Graph, controlStudent, controlAuthor, drawmodel, logging, equation,
	description, State, typechecker, slides, lessonsLearned, schemaAuthor, messageBox, tincan,
	activityParameters, memory, event, UI, Dialog, ImageBox, modelUpdates, TutorialWidget, ZoomCorrector, HistoryWidget, ETHelper){

	/*  Summary:
	 *			Menu controller
	 *  Description:
	 *			Acts as the controller for the buttons on the menu
	 *  Tags:
	 *			menu, buttons, controller
	 */

	console.log("load main.js");
	// Get session parameters
	var query = {};
	//this change will keep it backward compatible
	//as $_REQUEST is used at the place instead of $_POST.
	if(dom.byId("query").value){
		query = ioQuery.queryToObject(dom.byId("query").value);
		//new problem is being opened with fresh params
		//update the local session storage
		for(var prop in query){
			sessionStorage.setItem("drag"+prop,query[prop]);
		}
	}else{
		//trying to open an old problem using a refresh or it is a bad request
		//check sessionStorage for a reload
		//else leave console warnings
		if(sessionStorage.getItem("dragp")){
			//check for dragp item which implies all other params are stored
			for(var key in sessionStorage){
				var temp = (key.substring(0,4) == "drag") && key.substring(4);
				if(temp)
					query[temp] = sessionStorage.getItem(key);
			}
		}
		else {
			console.warn("Should have method for logging this to Apache log files.");
			console.warn("Dragoon log files won't work since we can't set up a session.");
			console.error("Function called without arguments");
			// show error message and exit
			var errorMessage = new messageBox("errorMessageBox", "error", "Missing information, please recheck the query");
			errorMessage.show();
			throw Error("please retry, insufficient information");
		}
	}

	// PAL3 HACK - for pal3 sections only!
	if (query.s.substring(0,4) === "PAL3"){
		console.log("In pal3 hack, query.a: " + query.a)
		if(query.a === "" || query.a === undefined || query.a === null){
			console.log("no activity found...")
			// if the problem name ends in "-incremental" or "-waveform"
			var activitySuffix = query.p.split("-").slice(-1)[0];
			console.log("suffix: " + activitySuffix);
			if (activitySuffix === "construction" || activitySuffix === "incremental" || activitySuffix === "waveform"){
				// set that as the activity
				query.a = activitySuffix;
				// truncate the problem name
				query.p = query.p.substring(0,query.p.indexOf("-"+activitySuffix));
			} else {
				// if no recognized extension was given
				query.a = "construction";
			}
		}
	}

	//Load Activity Parameters
	//query.a gives the input activity through url
	// If query.a is missing, warn and then default to construction
	if (typeof query.a == 'undefined'){
		console.warn("The activity URL parameter is undefined. Loading construction activity by default.");
		query.a = "construction";
	}
	var activity_config;
	try{
		activity_config = new activityParameters(query.m, query.a);
		console.log("ACTIVITY PARAMS", activity_config);
	}catch(error){
		throw Error("Problem in creating activity configurations: "+error);
	}
	var ui_config = new UI(query.m , query.a);
	// get the UI state for the given state and activity
	console.info("UI Parameters created:",ui_config);
	console.log("sm ini ?",activity_config);

	//activity_config.set("ElectronixTutor", false);
	if(activity_config && query.s === "ElectronixTutor"){
		activity_config.set("ElectronixTutor", true);
		ui_config.set("doneButton", "none");
		/*if(typeof query.p1 != 'undefined' && typeof query.p2 != 'undefined'){
			// santization required
			query.u = 'ETUser_' + query.p1;
			query.s = 'ETClass_' + query.p2;
		}*/

	}
	// Start up new session and get model object from server
	try {
		var session = new loadSave(query);
	}
	catch(error){
		console.log("error appeared");
		var errorMessage = new messageBox("errorMessageBox", "error", error.message);
		errorMessage.show();
		throw Error("problem in creating sessions");
	}

	console.log("session is",session);
	logging.setSession(session);  // Give logger message destination
	session.loadProblem(query).then(function(solutionGraph){

		/*
		 * removing the overlay as the actual computation does not take much time
		 * and it causes errors to stay hidden behind the overlay which continues infinitely.
		 */

		//display warning message if not using the supported browser and version
		var checkBrowser = session.browser.name;
		var checkVersion = session.browser.version;
		if((checkBrowser ==="Chrome" && checkVersion<41) ||
			(checkBrowser==="Safari" && checkVersion<8) ||
			(checkBrowser==="msie" && checkVersion<11) ||
			(checkBrowser==="Firefox") || (checkBrowser==="Opera")){
			var errorMessage = new messageBox("errorMessageBox", "warn","You are using "+ session.browser.name+
				" version "+session.browser.version +
				". Dragoon is known to work well in these (or higher) browser versions: Google Chrome v41 or later Safari v8 or later Internet Explorer v11 or later");
			// adding close callback to update the state for browser message
			var compatibiltyState = new State(query.u, query.s, "action");
			errorMessage.addCallback(function(){
				compatibiltyState.put("browserCompatibility", "ack_" + getVersion());
			});
			compatibiltyState.get("browserCompatibility").then(function(res) {
				if(!(res && res == "ack_" + getVersion())){
					errorMessage.show();
				}
			});
		}

		var givenModel = new model(query.m, query.p);
		logging.session.log('open-problem', {problem : query.p});
		console.log("solution graph is",solutionGraph);

		//if(solutionGraph) {

		if(solutionGraph) {
			//loadModel does sanity check of the model coming from database. Everything should be done afterwards.
			try {
				givenModel.loadModel(solutionGraph);
			} catch (error) {
				if (query.m == "AUTHOR") {
					var errorMessage = new messageBox("errorMessageBox", "error", error.message);
					errorMessage.show();
				} else {
					var errorMessage = new messageBox("errorMessageBox", "error", "This problem could not be loaded. Please contact the problem's author.");
					errorMessage.show();
					throw Error("Model could not be loaded.");
				}
			}

			// This version of code addresses loading errors in cases where problem is empty, incomplete or has no root node in coached mode
			if (query.m !== "AUTHOR" && query.m !== "ROAUTHOR") {
				//check if the problem is empty
				try {
					console.log("checking for emptiness");
					var count = 0;
					array.forEach(givenModel.given.getNodes(), function (node) {
						//for each node increment the counter
						count++;
					});
					console.log("count of nodes is", count);
					if (count == 0) {
						//if count is zero we throw a error
						throw new Error("Problem is Empty");
					}
					//check for completeness of all nodes
					console.log("inside completeness verifying function");
					array.forEach(givenModel.given.getNodes(), function (node) {
						console.log("node is", node, givenModel.given.isComplete(node.ID));
						if (!givenModel.given.isComplete(node.ID)) {
							throw new Error("Problem is Incomplete");
						}
					});
					if (query.m === "COACHED") {
						//checks for root node if the mode is coached
						console.log("inside coached mode root verifying function");
						var hasParentFlag = false;
						array.forEach(givenModel.given.getNodes(), function (node) {
							console.log("node is", node);
							if (givenModel.given.getParent(node.ID)) {
								hasParentFlag = true;
							}
						});
						if (!hasParentFlag) {
							// throw an error if root node is absent
							throw new Error("Root Node Missing");
						}
					}
					if(solutionGraph.hasOwnProperty("restart")){
						givenModel.setProblemReopened(solutionGraph.restart);
					}
				}catch (error) {
					var errorMessage = new messageBox("errorMessageBox", "error", error.message);
					errorMessage.show();
				}
			}
		} else {
			if(query.g && query.m === "AUTHOR"){
				var messageHtml = "You have successfully created a new problem named <strong>"+ query.p
					+ "</strong>.<br/> <br/> If you expected this problem to exist already,"+
					" please double check the problem name and folder and try again.";
				var infoMessage = new messageBox("errorMessageBox", "info", messageHtml);
				infoMessage.show();
			} else if(query.g){
				var errorMessage = new messageBox("errorMessageBox", "error", "Problem not found.");
				errorMessage.show();
			}
		}

		ready(function(){
			//remove the loading division, now that the problem is being loaded
			var loading = document.getElementById('loadingOverlay');
			loading.style.display = "none";

			//Set Tab title
			var taskString = givenModel.getTaskName();
			document.title ="Dragoon" + ((taskString) ? " - " + taskString : "");

			/*
			 * start up controller
			 */

			/*
			 * The sub-mode of STUDENT mode can be either "feedback" or "power"
			 * This is eventually supposed to be supplied by the student model.
			 * In the mean time, allow it as a GET parameter.
			 */
			var subMode = query.sm || "feedback";

			/* In principle, we could load just one controller or the other. */
			var controllerObject = (query.m == 'ROAUTHOR' || query.m == 'AUTHOR') ?
				new controlAuthor(query.m, subMode, givenModel, query.is, ui_config, activity_config) :
				new controlStudent(query.m, subMode, givenModel, query.is, ui_config, activity_config);

			//setting up logging for different modules.
			if(controllerObject._PM){
				controllerObject._PM.setLogging(session);  // Set up direct logging in PM
			}
			controllerObject.setLogging(session); // set up direct logging in controller
			equation.setLogging(session);

			/*
			 * Create state object
			 */

			var state = new State(query.u, query.s, "action");

			/*state.get("isLessonLearnedShown").then(function(reply) {

			 if(reply) givenModel.setLessonLearned(reply);
			 }); */
			state.get("isDoneButtonShown").then(function(reply){
				console.log("reply for done",reply);
				if(reply === true || reply === false)
					givenModel.setDoneMessageShown(reply);
			});
			state.get("isGraphHelpShown").then(function(reply){
				console.log("reply for graph",reply);
				if(reply === true || reply === false)
					givenModel.setGraphHelpShown(reply);
			});
			if(activity_config.get("showNodeEditorTour")) {
				state.get("NodeEditorTutorialState").then(function (resp) {
					console.log("NodeEditorTutorialState", resp);
					if (resp) {
						givenModel.setNodeEditorTutorialState(resp);
					}
				});
			}
			if(activity_config.get("showNodeBorderTutorial")) {
				state.get("NodeBorderTutorialState").then(function (resp) {
					console.log("NodeBorderTutorialState", resp);
					if (resp) {
						givenModel.setNodeBorderTutorialState(resp);
					}
				});
			}
			controllerObject.setState(state);

			//check if the use has already completed the tutorial
			var twidget = new TutorialWidget();
			var tutorialState = new State(query.u, query.s, "action");
			if(!twidget.avoidTutorial(query))
				tutorialState.get("tutorialShown").then(function(res){
					if(res != "" || res == "true") return;
					twidget.setState();
					twidget.begin(function(){
						tutorialState.put("tutorialShown", "true");
					});

				});


			//This array is used later to called the setSelected function for all the buttons in the menu bar
			//moved this at the start so that the buttons flicker at the start rather than at the end.
			var menuButtons=[];
			menuButtons.push("createNodeButton","graphButton","tableButton",
				"schemaButton","descButton","saveButton","mergeButton",
				"previewButton","slidesButton","lessonsLearnedButton","resetButton","doneButton", "prettifyButton", "imageButton","historyButton");


			array.forEach(menuButtons, function(button){
				//setting display for each menu button
				console.log(button);
				style.set(registry.byId(button).domNode, "display", ui_config.get(button));

				/*
				 * This is a work-around for getting a button to work inside a MenuBar.
				 * Otherwise, there is a superfluous error message.
				 */
				registry.byId(button)._setSelected = function(arg){
					console.log(button+" _setSelected called with ", arg);
				}
			}, this);

			dojo.style(dom.byId("zoomButtons"), "display", ui_config.get("zoomButtons"));

			var updateModel = new modelUpdates(givenModel, query.m, session, activity_config);
			//if (activity_config.get("setTweakDirections")){
			//	console.log("initial tweak: "+givenModel.getInitialTweakedNode());
			//	console.log("initial tweak: "+givenModel.getInitialTweakDirection());
			//}

			//set tweak directions if needed by the activity and the model has tweak directions.
			var setTweak = activity_config.get("setTweakDirections");
			var setExecution = activity_config.get("setExecutionValues");
			if (setTweak && (!givenModel.getInitialTweakedNode() || !givenModel.getInitialTweakDirection())) {
				//show a message that this problem is not right for incremental activity
				var errorMessage = new messageBox("errorMessageBox", "error", "The author of this problem has not set up the initial "+
																			"incremental change node, so this model cannot be done "+
																			"in this activity. "+
																			"Please contact the author of the problem.");
				errorMessage.show();
				throw Error("problem does not have tweaked nodes");
			}else if(setExecution && givenModel.getTime().step != 1){
				var errorMessage = new messageBox("errorMessageBox", "error", "The author of this problem has not set up the execution "+
																			"step size and so this model cannot be done in this activity. "+
																			"Please contact the author of the problem.");
				errorMessage.show();
				throw Error("time step for the problem is " + givenModel.getTime().step + " which is not 1.");
			}else if(setTweak && !givenModel.given.validateTweakDirections()){
				//changes to model for incremental activity
				updateModel.calculateTweakDirections();
			}else if(setExecution && !givenModel.given.validateExecutionValues()){
				//changes to model for execution activity
				updateModel.calculateExecutionValues();
			}
			//uncomment the line below if you want to copy the author solution for testing ;)
			//updateModel.initializeStudentModel(["description", "type", "initial", "units", "equation"]);
			//copy problem to student model
			if(activity_config.get("initializeStudentModel") && !givenModel.areRequiredNodesVisible()){
				console.log("student model being initialized");
				updateModel.initializeStudentModel(activity_config.get("copyFields"));

				//sets student values for parameters.
				if(activity_config.get("setStudentTweakDirections")){
					updateModel.initializeStudentTweakDirection();
				}

				if(activity_config.get("setStudentExecutionValues")){
					updateModel.initializeStudentExecutionValue();
					updateModel.setExecutionIteration();
				}
			}
			//setting the node order for demo activities
			if(activity_config.get("getNodeOrder") && controllerObject._PM){
				controllerObject._PM.nodeOrder = controllerObject._PM.createNodeOrder();
				controllerObject._PM.setNodeCounter();
			}


			// update the menu bar based on model state
			if(query.m != "AUTHOR") {
				if(givenModel.getLessonLearnedShown())
					registry.byId("lessonsLearnedButton").set("disabled", false);
			}

			//Initialie TC, GET problem-topic index for PAL problems
			palTopicIndex = "";
			var tc = null;
			var searchPattern = new RegExp('^pal3', 'i');
			if(query.m !== "AUTHOR" && searchPattern.test(query.s)){
				activity_config["PAL3"] = true;
				var xhrArgs = {
					url: "problems/PAL3-problem-topics.json",
					handleAs: "json",
					load: function(data){
						palTopicIndex = data;
						tc = new tincan(givenModel, controllerObject._assessment,session, palTopicIndex);
					},
					error: function(error){
						console.log("error retrieving file name");
					}
				}
				dojo.xhrGet(xhrArgs);
				aspect.after(controllerObject._PM, "notifyCompleteness", function(){
					if(!tc ||  !tc.needsToSendScore || !givenModel.isCompleteFlag) return;
					tc.connect();
					tc.sendStatements();
				});
			}
			// setting environment for loading dragoon inside ET

			var etHelper = null;
			if(activity_config.get("ElectronixTutor") && query.m !== "AUTHOR" ){
				var etHelper = new ETHelper(query, ETConfig.problemLsrMap, ETConfig.schemaETKCMap);
				// send score after student complete the model
				aspect.after(controllerObject._PM, " notifyCompleteness", function(){
					if( !sendKCScore || !givenModel.isCompleteFlag) return;
					var learningResourceName = etHelper.getLearningResourceName();
					var KCScores = controllerObject._assessment.getSchemaSuccessFactor();
					var learningResourceName = etHelper.getLearningResourceName();
					if(Object.keys(KCScores).length > 0) {
						console.log("Sending KC Scores", KCScores);
						sendKCScore(ETConfig.config.learningResource,learningResourceName, KCScores);
					}
				}, this);

				/*
				etConnect = new ETConnector(query);
				etConnect.startService();
				//set ET Connector in controller
				controllerObject.setETConnector(etConnect);

				// send score after student complete the model
				aspect.after(controllerObject._PM, "notifyCompleteness", function(){
					if(!etConnect || !givenModel.isCompleteFlag) return;

					//Send KC Scores
					var KCScores = controllerObject._assessment.getSchemaSuccessFactor();
					if(Object.keys(KCScores).length > 0) {
						console.log("Sending KC Scores", KCScores);
						etConnect.sendKCScore(KCScores);
					}

					//Complete Task Score
					var score=controllerObject._assessment.getSchemasAverageFactor();
					etConnect.sendScore(score);
					console.log("sending score(successfactor):", score);

					//Sending percent complete after problem is complete
					etConnect.sendCompletedAllSteps(100);
				});
				*/
			}

			if(activity_config.get("targetNodeStrategy")){
				// Only in construction activity when in COACHED mode
				var rootNodes = givenModel.given.getRootNodes();
				var studentNodes = givenModel.active.getNodes();

				// Getting existing nodes
				var currentNodes=[];
				array.forEach(studentNodes,function(node){
					currentNodes.push(node.descriptionID);
				});

				// Creating the root node if missing
				array.forEach(rootNodes, function(rootNode){
					if (currentNodes.indexOf(rootNode.ID)<0){ // Checks if any root node is missing
						var id=updateModel.copyGivenNode(rootNode.ID);
						// var id = givenModel.active.addNode();
						// givenModel.student.setDescriptionID(id, rootNode.ID);
						// givenModel.student.setStatus(id, "description", {"disabled": true, "status": "correct"});
						// givenModel.student.setStatus(id, "type", {"disabled": false});
						//drawModel.addNode(givenModel.active.getNode(id));
					}
				});
			}

			var drawModel = new drawmodel(givenModel.active, ui_config.get("showColor"), activity_config);
			drawModel.setLogging(session);

			if(query.m != 'AUTHOR' && query.m != 'ROAUTHOR'){
				controllerObject.setAssessment(session); //set up assessment for student.
			}
			// add mouse enter and mouse leave event for every new node
			var iBoxController = new ImageBox(givenModel.getImageURL(), givenModel);

			iBoxController.initNodeMouseEvents();
			// for the new nodes added during the session
			aspect.after(drawModel, "addNode", function(vertex){

				var context = iBoxController;
				console.log("AddNode Called", vertex);
				var target = document.getElementById(vertex.ID);
				if(!target) return;
				target.addEventListener('mouseenter', function(event){

					if(context.imageMarked) return;
					var nodeId = event.srcElement["id"];
					if(nodeId) iBoxController.markImage(nodeId);
					context.imageMarked = true;
				});
				target.addEventListener('mouseleave', function(event){
					if(!context.imageMarked) return;
					iBoxController.clear();
					context.imageMarked = false;
				});

			}, true);

			// Wire up drawing new node
			aspect.after(controllerObject, "addNode",
				lang.hitch(drawModel, drawModel.addNode),
				true);

			// updating model after lessonlearned is shown
			aspect.after(registry.byId("lesson"), "show", function(){
				givenModel.setLessonLearnedShown(true);
				if(!(activity_config.get("demoExecutionFeatures") || activity_config.get("demoIncrementalFeatures")))
					session.saveProblem(givenModel.model);
			});

			// Wire up send to server
			aspect.after(drawModel, "updater", function(){
				if(!(activity_config.get("demoExecutionFeatures") || activity_config.get("demoIncrementalFeatures")))
					session.saveProblem(givenModel.model);
			});

			// When the node editor controller wants to update node style, inform
			// the controller for the drawing su
			aspect.after(controllerObject, "colorNodeBorder",
				lang.hitch(drawModel, drawModel.colorNodeBorder),
				true);

			/*
			 * Connect node editor to "click with no move" events.
			 */
			aspect.after(drawModel, "checkNodeClick", function(res) {
				if(activity_config.get("showNodeEditor")){
					controllerObject.showNodeEditor(res.ID);
				}
			},true);

			aspect.after(drawModel, "onClickNoMove", function(mover){
				console.log("mover",mover);
				if(activity_config.get("showNodeEditor")){
					if(mover.mouseButton != 2) { //check if not right click
						controllerObject.showNodeEditor(mover.node.id);
					}
					if(givenModel.getImageURL())
						registry.byId('imageButton').set('disabled', false);
					else
						registry.byId('imageButton').set('disabled', true);

				}else if(activity_config.get("showIncrementalEditor")){
					if(activity_config.get("demoIncrementalFeatures")){
						controllerObject.showIncrementalAnswer(mover.node.id);
					}
					controllerObject.showIncrementalEditor(mover.node.id);
				}else if(activity_config.get("showExecutionEditor")){
					if(activity_config.get("demoExecutionFeatures")){
						controllerObject.showExecutionAnswer(mover.node.id);
					}
					/*
					else if(activity_config.get("executionExercise")){
						var tab_data = new Graph(givenModel, query.m, session, "forExecIterations");
						tab_data.findSolution()

					}
					*/
					controllerObject.showExecutionMenu(mover.node.id);
				}
				else if(activity_config.get("showWaveformEditor")){
					controllerObject.showWaveformEditor(mover.node.id);
				}
			}, true);

			/*
			 * After moving node, save coordinates to model, and autosave
			 */
			aspect.after(drawModel, "onClickMoved", function(mover){
				var g = geometry.position(mover.node, true);  // take into account scrolling
				console.log("Update model coordinates for ", mover.node.id, g);
				var scrollTop = document.getElementById("drawingPane").scrollTop;
				var node = registry.byId(mover.node);
				var widthLimit = document.documentElement.clientWidth - 110;
				var topLimit = 20;

				if(g.x > widthLimit) {
					g.x = widthLimit;
					node.style.left = widthLimit+"px";
				}

				if(g.x < 0) {
					g.x = 0;
					node.style.left = "0px";
				}

				if((g.y + scrollTop) < topLimit){
					//check if bounds inside
					if(g.y < topLimit) { // BUG: this g.y should be absolute coordinates instead
						g.y = topLimit;
						node.style.top = topLimit+"px";  // BUG: This needs to correct for scroll
					}
				}
				givenModel.active.setPosition(mover.node.id, {"x": g.x, "y": g.y+scrollTop});

				//Update position for student node
				if(controllerObject._mode == "AUTHOR"){
					var studentNodeID = givenModel.student.getNodeIDFor(mover.node.id);
					if(typeof studentNodeID !== "undefined" && studentNodeID != null ){
						givenModel.student.setPosition(studentNodeID, {"x": g.x, "y": g.y+scrollTop});
					}
				}
				// It would be more efficient if we only saved the changed node.
				session.saveProblem(givenModel.model);	 // Autosave to server
			}, true);

			/*
			 * Add connection when inputs are updated
			 */
			aspect.after(controllerObject, 'addQuantity',
				lang.hitch(drawModel, drawModel.addQuantity), true);
			aspect.after(controllerObject, 'setConnections',
				lang.hitch(drawModel, drawModel.setConnections), true);
			aspect.after(controllerObject, 'setConnection',
				lang.hitch(drawModel, drawModel.setConnection), true);
			aspect.after(drawModel, 'onPrettifyComplete', function(){
				var prettifyConfirmDialog = new tooltipDialog({
					style: "width: 300px;",
					content: '<p>Your model is prettified. Keep Changes?</p>'+
					' <button type="button" data-dojo-type="dijit/form/Button" id="savePrettify">Yes</button>'+
					' <button type="button" data-dojo-type="dijit/form/Button" id="undoPrettify">No</button>',
					onShow: function(){
						on(dojo.byId('undoPrettify'), 'click', function(e){
							event.stop(e);
							popup.close(prettifyConfirmDialog);
							prettifyConfirmDialog.destroyRecursive();
							drawModel.undoPrettify();
							session.saveProblem(givenModel.model);
							registry.byId("prettifyButton").set("disabled", false);
						});
						on(dojo.byId('savePrettify'), 'click', function(e){
							event.stop(e);
							popup.close(prettifyConfirmDialog);
							session.saveProblem(givenModel.model);
							prettifyConfirmDialog.destroyRecursive();
							registry.byId("prettifyButton").set("disabled", false);
						});
					}
				});
				popup.open({
					popup: prettifyConfirmDialog,
					around: dom.byId('prettifyButton')
				});
			});
			//Remove nodes from student model(if added) when author deletes the node from given model
			if(controllerObject._mode == "AUTHOR"){
				aspect.after(drawModel,
					"deleteNode",
					lang.hitch(controllerObject, controllerObject.removeStudentNode),
					true);
			}

			// Also used in image loading below.
			var descObj = new description(givenModel, query.a);

			// Render image description on canvas
			descObj.showDescription();

			if(activity_config.get("allowCreateNode")){
				var createNodeButton = registry.byId("createNodeButton");
				createNodeButton.set("disabled", false);

				/* add "Create Node" button to menu */
				menu.add("createNodeButton", function(e){
					event.stop(e);
					if(controllerObject.checkDonenessMessage &&
						controllerObject.checkDonenessMessage()){
						return;
					}

					var id = givenModel.active.addNode();
					controllerObject.logging.log('ui-action', {type: "menu-choice", name: "create-node"});
					drawModel.addNode(givenModel.active.getNode(id));
					controllerObject.showNodeEditor(id);

					if(givenModel.getImageURL())
						registry.byId('imageButton').set('disabled', false);
					else
						registry.byId('imageButton').set('disabled', true);

					domClass.remove(dom.byId("createNodeButton"), "glowButton");
				});
			}

			if(activity_config.get("allowPrettify")){
				var prettifyButton = registry.byId("prettifyButton");
				prettifyButton.set("disabled", false);
			}

			if(activity_config.get("allowProblemTimes")){
				var descButton = registry.byId("descButton");
				descButton.set("disabled", false);
				//descObj.initializeAuthorWindow();

				// Description button wiring
				menu.add("descButton", function(e){
					event.stop(e);
					descObj.initializeAuthorWindow();
					style.set(dom.byId("publishResponse"), "display", "none");
					//Display publish problem button on devel and localhost
					if(window.location.hostname === "localhost" ||
						window.location.pathname.indexOf("/devel/") === 0){
						style.set(registry.byId("problemPublishButton").domNode, "display", "inline-block");
					}
					//This check has to be performed exclusively for now for ROAuthor mode property disableTimesUnitsFields
					if(activity_config.get("disableTimesUnitsFields")){
						DQuery("#authorDescDialog input").attr("readOnly",true);
						DQuery("#authorDescDialog textarea").attr("readOnly",true);
						dijit.byId("authorProblemCheck").disabled = true;
						dijit.byId("problemPublishButton").disabled = true;
						dijit.byId("authorSetTimeStepUnits").readOnly = true;
						dijit.byId("authorSetIntegrationMethod").readOnly = true;
						dijit.byId("authorSetParameters").readOnly = true;
						dijit.byId("authorSetParamDir").readOnly=true;
						dijit.byId("authorSetDescriptionType").readOnly = true;
					}
					registry.byId("authorDescDialog").show();

				});

				aspect.after(registry.byId('authorDescDialog'), "hide", function(){
					console.log("Saving Description/Timestep edits");

					session.saveProblem(givenModel.model);

					if(iBoxController) iBoxController.updateImage(givenModel.getImageURL());
					if(imgMarker) imgMarker.updateImage(givenModel.getImageURL());
				});

				on(registry.byId("descCloseButton"), "click", lang.hitch(this, function(){
					descObj.descDoneHandler();
					registry.byId("authorDescDialog").hide();
				}));


				on(registry.byId("problemPublishButton"), "click", function(){
					var w = confirm("Are you sure you want to publish the problem");
					var response = "There was some error while publishing the problem.";
					if(w == true){
						descObj.updateModel();
						var request_promise = session.publishProblem(givenModel.model);
						var responseWidget = dom.byId("publishResponse");
						request_promise.then(function(response_status){
							if(response_status.status && response_status.status == "done"){
								responseWidget.innerHTML = "Your problem has been successfully published";
								style.set(responseWidget, "color", "green");
							} else {
								responseWidget.innerHTML = response_status.error;
								style.set(responseWidget, "color", "red");
							}
							style.set(responseWidget, "display", "block");
						});

					}
				});

				// Show tips for Root in node modifier and Share Bit in Description and Time
				var makeTooltip  = function(id,content){
					new toolTip({
						connectId: [id],
						label: content
					});
				};
				makeTooltip('questionMarkRoot',"When running in COACHED mode, the system will guide the student through <br>" +
					"the construction of the model beginning with this node, then proceeding with <br>" +
					"this node's inputs, then their inputs, and so forth until the model is complete.");
				makeTooltip('questionMarkShare', "When checked, your problem appears in the list <br>" +
					"of custom problems for other users to solve.");
				makeTooltip('questionMarkURL', "If you wish to use an image from your computer, <br>" +
					"you must first upload it to a website and then copy <br>" +
					"the URL of the image into this box.");
				makeTooltip('questionMarkLessons', "The 'Lessons Learned' message will display once the student has successfully replicated <br>" +
					"and graphed the author's model, providing an opportunity for retrospection.");
				makeTooltip('integrationMethod', "Euler's method - Best for functions that occur every tick of the time frame <br>" +
					"Midpoint - Best for continuous functions <br>");
				makeTooltip('authorDescriptionQuestionMark', "The quantity computed by the node");
			}



			if(activity_config.get("allowSaveAs")){

				var saveButton = registry.byId("saveButton");
				saveButton.set("disabled", false);

				// Save As button wiring
				menu.add("saveButton", function(e){
					event.stop(e);
					registry.byId("authorSaveDialog").show();
				});

				// Set the default save as folder parameters
				var saveGroupCombo = registry.byId("authorSaveGroup");
				var saveGroupArr = [{name: "Private("+query.u+")", id: query.u},
									{name: "public", id: "public"}];

				// TODO: move this data to a json, or pull from forum database (longer term)
				//       be sure to change the other sos326_f15 reference in the merge code as well!
				if (query.s == "sos326_f15"){
					saveGroupArr=[{name: "Group 1-Water Challenges", id:"grp_1"},
						  {name: "Group 2-Parks Challenges", id:"grp_2"},
						  {name: "Group 3-Transportation Challenges", id:"grp_3"},
						  {name: "Group 4-Water Challenges", id:"grp_4"},
						  {name: "Group 5-Parks Challenges", id:"grp_5"},
						  {name: "Group 6-Transportation Challenges", id:"grp_6"},
						  {name: "Water Consensus", id:"grp_W"},
						  {name: "Parks Consensus", id:"grp_P"},
						  {name: "Transportation Consensus", id:"grp_T"},
						  {name: "Whole System Group 1", id:"ws_grp_1"},
						  {name: "Whole System Group 2", id:"ws_grp_2"},
						  {name: "Whole System Group 3", id:"ws_grp_3"},
						  {name: "Whole System Group 4", id:"ws_grp_4"},
						  {name: "Whole System Group 5", id:"ws_grp_5"},
						  {name: "Whole System Group 6", id:"ws_grp_6"}
						  ];
				   }
				var saveGroupMem = new memory({data: saveGroupArr});
				saveGroupCombo.set("store", saveGroupMem);
				if (query.s == "sos326_f15"){
					saveGroupCombo.set("value","Group 1-Water Challenges");
				} else{
					saveGroupCombo.set("value","Private("+query.u+")")//default to private
				}

				//Author Save Dialog
				on(registry.byId("saveCloseButton"), "click", function(){
					console.log("Rename and Save Problem edits");
					// Save problem
					var problemName = registry.byId("authorSaveProblem").value;
					var groupName = registry.byId("authorSaveGroup").value;
					var checkProblemName = new RegExp('^[A-Za-z0-9\-]+$');

					if(typeof problemName !== 'undefined' && problemName==''){
						alert('Missing Problem Name');
						return;
					}else if(typeof groupName!=='undefined' && groupName==''){
						alert('Missing Group Name');
						return;
					}else if(problemName && problemName.length > 0 && problemName.length<=50 && checkProblemName.test(problemName)){
						var checkHyphen = new RegExp('^[\-]+$');
						if(!checkHyphen.test(problemName)){
							var results = saveGroupMem.query({name:groupName});
							if (results.length > 0){
								groupName = results[0].id;
							}
							session.saveAsProblem(givenModel.model,problemName,groupName);
						}
						else{
							alert("Problem names must contain atleast one alphanumeric character.");
							return;
						}
					}else{
						alert("Problem names must be between 1 and 50 characters, and may only include alphanumeric characters and the \"-\" symbol");
						return;
					}

				});

				//Author Save Dialog - check for name conflict on losing focus
				//from textboxes of Rename dialog
				on(registry.byId("authorSaveProblem"), "blur", function() {
					var problemName = registry.byId("authorSaveProblem").value;
					var groupName = registry.byId("authorSaveGroup").value;
					var results = saveGroupMem.query({name:groupName});
					if (results.length > 0){
						groupName = results[0].id;
					}
					session.isProblemNameConflict(problemName,groupName).then(function(isConflict) {
						if(isConflict) {
							registry.byId("saveCloseButton").set("disabled",true);
							registry.byId("saveCloseButton").set("title","Problem name conflict");
						} else {
							registry.byId("saveCloseButton").set("disabled",false);
							registry.byId("saveCloseButton").set("title","Problem name doesn't conflict");
						}
					});
				});
				on(registry.byId("authorSaveGroup"), "blur", function() {
					var problemName = registry.byId("authorSaveProblem").value;
					var groupName = registry.byId("authorSaveGroup").value;
					var results = saveGroupMem.query({name:groupName});
					if (results.length > 0){
						groupName = results[0].id;
					}
					session.isProblemNameConflict(problemName,groupName).then(function(isConflict) {
						if(isConflict) {
							registry.byId("saveCloseButton").set("disabled",true);
							registry.byId("saveCloseButton").set("title","Problem name conflict");
						} else {
							registry.byId("saveCloseButton").set("disabled",false);
							registry.byId("saveCloseButton").set("title","Problem name doesn't conflict");
						}
					});
				});
			}

			if(activity_config.get("allowPreview")){
				var previewButton = registry.byId("previewButton");
				if(query.g) {
					previewButton.set("disabled", false);
					//activity names and menu Ids should be same
					var activities = activity_config.getAllActivitesNames();
					array.forEach(activities, function(activity){
						if(registry.byId("menu_"+activity)) {
							on(registry.byId("menu_" + activity), "click", function () {
								var timestamp = new Date().getTime();
								var mode = query.m;
								if(query.m === "AUTHOR" || query.m === "ROAUTHOR") {
									mode = "STUDENT";
								}
								var url = document.URL.replace(".php",".html");
								url = url+
									"?"+"u=" + query.u + "-" + timestamp+
									"&p="+query.p+
									"&a=" + activity+
									"&m="+mode+
									"&s="+query.s+
									"&sm="+query.sm+
									"&is=algebraic&c=continue&l=false";
								if(query.g)
									url = url+"&g="+query.g;
								window.open(url,"newwindow");
							});
						}
					});
				}
				else{
					previewButton.set("disabled", true);
					new toolTip({
						connectId: ["previewButton"],
						label: "You must save your problem in a folder before it can be previewed." +
								"<br/>Click \"Save As\" to do so.",
						position:["below"]
					});
				}
			}

			if(activity_config.get("allowCreateSchema")){
				var schemaButton = registry.byId("schemaButton");
				schemaButton.set("disabled", false);
				if(activity_config.get("disableSchemaFields")){
					DQuery("#schemaAuthorBox input").attr("disabled",true);
				}
				var schema = new schemaAuthor(givenModel, session, activity_config.get("disableSchemaFields"));
				menu.add("schemaButton", function(e){
					event.stop(e);
					schema.showSchemaWindow();
				});
			}

			if(activity_config.get("allowMerge")){
				var mergeButton = registry.byId("mergeButton");
				mergeButton.set("disabled", false);

				var problemArray;
				// Merge button wiring
				menu.add("mergeButton", function(e){
					event.stop(e);
					var widget = registry.byId("authorMergeProblem");
					if(!problemArray){
						session.getProblemForFolderSection().then(function(data){
							problemArray = data;
						});

						if(problemArray && problemArray.length > 0){
							var options = [];
							array.forEach(problemArray, function(p){
								if(p != session.params.p)
									options.push({label: p, value: p});
							});

							widget.addOption(options);
						}
					}

					registry.byId("authorMergeDialog").show();
					/*var combo = registry.byId("authorMergeGroup");
					var arr=[{name: "Private("+query.u+")", id: "query.u"},
						{name: "public", id: "public"},
						{name:"Official Problems",id:""}
					];
					// TODO: move this data to a json, or pull from forum database (longer term)
					//       be sure to change the other sos326_f15 reference in the save as code as well!
					if (query.s == "sos326_f15"){
						arr=[{name: "Group 1-Water Challenges", id:"grp_1"},
						 {name: "Group 2-Parks Challenges", id:"grp_2"},
						 {name: "Group 3-Transportation Challenges", id:"grp_3"},
						 {name: "Group 4-Water Challenges", id:"grp_4"},
						 {name: "Group 5-Parks Challenges", id:"grp_5"},
						 {name: "Group 6-Transportation Challenges", id:"grp_6"},
						 {name: "Water Consensus", id:"grp_W"},
						 {name: "Parks Consensus", id:"grp_P"},
						 {name: "Transportation Consensus", id:"grp_T"},
						 {name: "Whole System Group 1", id:"ws_grp_1"},
						 {name: "Whole System Group 2", id:"ws_grp_2"},
						 {name: "Whole System Group 3", id:"ws_grp_3"},
						 {name: "Whole System Group 4", id:"ws_grp_4"},
						 {name: "Whole System Group 5", id:"ws_grp_5"},
						 {name: "Whole System Group 6", id:"ws_grp_6"}];
						var sectionBox = registry.byId("authorMergeSection");
						sectionBox.set("value","sos326_f15");
						sectionBox.set("disabled",true);
					}
					var m = new memory({data: arr});
					combo.set("store", m);
					if (query.s == "sos326_f15"){
						combo.set("value","Group 1-Water Challenges");
					} else {
						combo.set("value","Private("+query.u+")"); //setting the default
					}*/
				});

				on(registry.byId("mergeDialogButton"),"click",function(){
					/*var group = registry.byId("authorMergeGroup").value;
					var results = saveGroupMem.query({name:group});
					if (results.length > 0){
						group = results[0].id;
					}*/
					var group = session.params.g;
					var section = session.params.s;
					var problem = registry.byId("authorMergeProblem").value;
					if(!problem){
						alert("Problem field can't be empty");
						return;
					}
					/*if (group.split("(")[0]+"("=="Private("){
						group=group.split(")")[0].substr(8);//Private(username)=>username
					} else if (group === "Official Problems"){
						group=null;
						section=null;
					}*/
					var query = {g:group,m:"AUTHOR",s:section,p:problem,a:"construction"};
					session.loadProblem(query).then(function(solutionGraph){
						console.log("Merge problem is loaded "+solutionGraph);
						if(solutionGraph){
							//var nodes = solutionGraph.task.givenModelNodes;
							var ids = givenModel.active.mergeNodes(solutionGraph);
							//var snodes = solutionGraph.task.studentModelNodes;
							//var sids = givenModel.active.mergeNodes(snodes,true);
							givenModel.loadModel(givenModel.model);

							//add merged nodes
							array.forEach(ids,function(id){
								var node = 	givenModel.active.getNode(id);
								drawModel.addNode(node);
							},this);
							//set connections for merged nodes
							array.forEach(ids,function(id){
								var node = 	givenModel.active.getNode(id);
								drawModel.setConnections(node.inputs,dojo.byId(id));
							},this);
							session.saveProblem(givenModel.model); //moved the saving part to the end of the function call so that if anything breaks the broken model is not saved.
							registry.byId("authorMergeDialog").hide();
						}else{
							console.log("Problem Not found");
							alert("Problem Not found, please check the problem name you have entered.");
						}
					});
				});

				// Image Highlighting events
				var imgMarker = new ImageBox(givenModel.getImageURL(), givenModel);


				on(registry.byId('markImageAdd'), "click", function(event){
					event.preventDefault();
					imgMarker.addMark();
				});
				on(registry.byId('markImageRemove'), "click", function(event){
					event.preventDefault();
					imgMarker.removeMap();
				});
				on(registry.byId('markImageClear'), "click", function(event){
					event.preventDefault();
					imgMarker.clear();
				});
				on(registry.byId('markImageDone'),'click', function(event){
					event.preventDefault();
					imgMarker.saveMarks();
					registry.byId("markImageBox").hide();
				});
				on(registry.byId('markImageCancel'),'click', function(event){
					event.preventDefault();
					registry.byId("markImageBox").hide();
				});
				// code for image marker button
				on(registry.byId("imageButton"), "click", function(event){
					event.preventDefault();
					// handling no image found error state
					if(imgMarker.imageNode == null){
						var errorDialog = new Dialog({
							content : "No image found for highlighting!",
							title : "Error",
							hide: function(){
								this.destroyRecursive();
							}
						});
						errorDialog.show();
						return;
					}

					imgMarker.initMarkImageDialog(controllerObject);
					// check if image is initialilzed in ImageBox, if it was not initialized before, initialize it nw
					//if(!imgMarker.url) imgMarker.initMarkImageDialog(controllerObject);
					//display the box
					//if currentID present , update the savedmarks from the model
					registry.byId('savedMark').getOptions().every(function(ele, idx, array){
						registry.byId('savedMark').removeOption(ele);
						return true;
					});
					//registry.byId('savedMark').dropDown.destory();
					imgMarker.clear();

					var savedMarks = givenModel.active.getImageMarks(controllerObject.currentID);
					console.log("saved marks for node", controllerObject.currentID, savedMarks);
					if(savedMarks)
						savedMarks.every(function(ele, idx, array){
							console.log("Trying to add mark", ele);
							var mark = {
								value : ele,
								label : ele,
								selected : false
							}
							console.log(mark);
							registry.byId("savedMark").addOption(mark);
							return true;
						});
					registry.byId("markImageBox").show();
					//imgMarker.showGrid(true);
				});
			}

			if(activity_config.get("allowHints")){
				if(givenModel.model.task.slides){
					var sb = registry.byId("slidesButton");
					sb.set("disabled", false);
					var createSlides = new slides(givenModel);
					menu.add("slidesButton", function(e){
						event.stop(e);
						createSlides.show();
						createSlides.log(controllerObject.logging);
					});

					on(registry.byId("prevSlide"), "click", function(){
						createSlides.changeSlides("prev");
						createSlides.log(controllerObject.logging);
					});

					on(registry.byId("nextSlide"), "click", function(){
						createSlides.changeSlides("next");
						createSlides.log(controllerObject.logging);
					});
				}
			}
			//  To show the graph and table window in excution demo activity
			var crisis=registry.byId("crisisAlertMessage");
			aspect.after(crisis, "hide", function(){
				if (crisis.title && crisis.title.indexOf("Demonstration Completed") >= 0) {

					var tableButton = registry.byId("tableButton");
					tableButton.set("disabled", false);
					var graphButton = registry.byId("graphButton");
					graphButton.set("disabled", false);
					style.set(graphButton.domNode, "display","inline-block");
					style.set(tableButton.domNode, "display","inline-block");

					// instantiate graph object to show the graph after clicking OK
					startGraph();

					//adding the event now so that graph opens up again when graph button is clicked.
					menu.add("graphButton", function(e){
						event.stop(e);
						startGraph();
					});

					menu.add("tableButton", function(e){
						event.stop(e);
						startTable();
					});
				}
			});

			var problemDoneHint;
			var showProblemDoneHint = function(){
				problemDoneHint = new tooltipDialog({
					style: "width: 300px;",
					content: '<p>Click "Done" when you are ready to save and submit your work.</p>' +
						' <button type="button" data-dojo-type="dijit/form/Button" id="closeHint">Ok</button>',
					onShow: function () {
						on(registry.byId('closeHint'), 'click', function () {
							console.log("clicked prob done hint closed");
							popup.close(problemDoneHint);
						});
					},
					onBlur: function(){
						popup.close(problemDoneHint);
					}
				});
				popup.open({
					popup: problemDoneHint,
					around: dom.byId('doneButton')
				});
				givenModel.isDoneMessageShown = true;
				state.put("isDoneMessageShown",true);
			};

			var startGraph = function(){
				// instantiate graph object
				console.debug("button clicked");
				var buttonClicked = "graph";
				var graph = new Graph(givenModel, query.m, session, buttonClicked);
				graph.setStateGraph(state);
				var problemComplete = givenModel.matchesGivenSolution();
				graph._logging.log('ui-action', {
					type: "menu-choice",
					name: "graph-button",
					problemComplete: problemComplete
				});
				var dialogWidget = registry.byId("solution");

				var content = dialogWidget.get("content").toString();
				if(registry.byId("closeHint")) {
					var closeHintId = registry.byId("closeHint");
					closeHintId.destroyRecursive(false);
				}
				//close popup each time graph is shown
				if(problemDoneHint)
					popup.close(problemDoneHint);
				graph.show();

				var graphHelpButton = dom.byId('graphHelpButton');
				console.log("graph help shown",givenModel.getGraphHelpShown());
				if(!givenModel.getGraphHelpShown()&&graphHelpButton ) {
					domClass.add(graphHelpButton, "glowNode");
					givenModel.setGraphHelpShown(true);
					state.put("isGraphHelpShown",true);
				}
			};

			var startTable = function(){
				console.debug("table button clicked");
				var buttonClicked = "table";
				var table = new Graph(givenModel, query.m, session, buttonClicked);
				table.setStateGraph(state);
				table._logging.log('ui-action', {
					type: "menu-choice",
					name: "table-button"
				});
				table.show();
			};

			if(activity_config.get("allowGraph")){
				var graphButton = registry.byId("graphButton");
				graphButton.set("disabled", false);

				// show graph when button clicked
				menu.add("graphButton", function(e){
					event.stop(e);
					startGraph();
				});
			}

			//the solution div which shows graph/table when closed
			//should disable all the pop ups
			aspect.after(registry.byId('solution'), "hide", function(){
				console.log("Calling graph/table to be closed");
				controllerObject.logging.log('ui-action', {
					type: "menu-choice",
					name: "graph-closed"
				});
				typechecker.closePops();
				if(activity_config.get("showDoneMessage")){
					var problemComplete = givenModel.student.matchesGivenSolutionAndCorrect();
					if(problemComplete){
						var contentMsg = givenModel.getTaskLessonsLearned();

						if (contentMsg.length === 0 || contentMsg[0] == "") {
							console.log("lessons learned is empty");
							if(ui_config.get("doneButton") != "none" && !givenModel.isDoneMessageShown) {
								showProblemDoneHint();
							}
						}else{
							if(givenModel.getLessonLearnedShown() === false){
								lessonsLearned.displayLessonsLearned(contentMsg);
								var lessonsLearnedButton = registry.byId("lessonsLearnedButton");
								lessonsLearnedButton.set("disabled", false);
								//this._state.put("isLessonLearnedShown",true);
								aspect.after(registry.byId("lesson"),"hide", lang.hitch(this,function () {
								if(ui_config.get("doneButton") != "none" && !givenModel.isDoneMessageShown) {
										showProblemDoneHint();
									}
								}));
							}
						}
					}
				}
			});

			aspect.after(registry.byId('waveformEditor'), "hide", function(){
				//Check if problem is complete should be irrelevent of done message
				//removing out of if loop
				controllerObject.notifyCompleteness();

				//Show Done message hint
				if(activity_config.get("showDoneMessage") && ui_config.get("doneButton") != "none" &&
					givenModel.student.matchesGivenSolutionAndCorrect() && !givenModel.isDoneMessageShown){
					showProblemDoneHint();
				}
			});

			if(activity_config.get("allowTable")){
				var tableButton = registry.byId("tableButton");
				tableButton.set("disabled", false);

				// show table when button clicked
				menu.add("tableButton", function(e){
					event.stop(e);
					startTable();
				});
			}
			//Forum Button no longer in use
			/*
			if(activity_config.get("allowForum")){
				// checks if forumurl is present
				if(query.f && query.fe=="true") {
					//Enable the forum button in the menu
					var forumBut = registry.byId("forumButton");
					forumBut.set("disabled", false);
					//For redirecting to the forum from forum button click on header, only incase enabled
					menu.add("forumButton",function(e){
						event.stop(e);
						//  Some portion of this function body should be moved to forum.js, Bug #2424
						console.log("clicked on main forum button");
						controllerObject.logging.log('ui-action', {
							type: "menu-forum-button",
							name: "forum"
						});
						var prob_name=givenModel.getTaskName();
						console.log("problem name is ", prob_name);
						window.open(query.f+"?&n="+prob_name+"&s="+query.s+"&fid="+query.fid+"&sid="+query.sid, "_blank" );
					});
					//setter function used for setting forum parameters
					//inside controller
					controllerObject.setForum(query);
				}
			} */

			if(activity_config.get("allowLessonsLearned")){

				//Enable the lessonsLearnedButton
				//var lessonsLearnedButton = registry.byId("lessonsLearnedButton");
				//lessonsLearnedButton.set("disabled", true);
				//Bind lessonsLearnedButton to the click event

				menu.add("lessonsLearnedButton", function(e){
					// preventing default execution of click handler
					event.stop(e);
					console.log("inside handler");
					if(givenModel.getLessonLearnedShown() == true){
						contentMsg = givenModel.getTaskLessonsLearned();
						lessonsLearned.displayLessonsLearned(contentMsg);
					}
				});
			}

			//Wiring up history button
			if(activity_config.get("historyButton")){
				/*var historyButton = registry.byId("historyButton");
				historyButton.set("disabled", false);
				menu.add("historyButton", function(e){
					event.stop(e);
					session.getHistory(query).then(function(history){
						console.log("history for now is:", history);
					})
					//registry.byId("historyDialog").show();
				});*/
			}

			if(activity_config.get("allowHelp")){
				/*
				 Add link to intro video
				 */
				var video = dom.byId("menuIntroText");
				on(video, "click", function(){
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "introduction"
					});
					// "newwindow": the pop-out window name, not required, could be empty
					// "height" and "width": pop-out window size
					// Other properties could be changed as the value of yes or no
					window.open("https://dragoon.asu.edu/about.php","newwindow",
						"toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
					);
				});

				/*
				 Add link to intro video
				 */
				var video = dom.byId("menuIntroVideo");
				on(video, "click", function(){
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "intro-video"
					});
					// "newwindow": the pop-out window name, not required, could be empty
					// "height" and "width": pop-out window size
					// Other properties could be changed as the value of yes or no
					window.open("https://www.youtube.com/watch_popup?v=7w6_CA0NlqY","newwindow",
						"height=400, width=600, toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
					);
				});
				/*
				 Add link to old intro video
				 */
				var video = dom.byId("menuOldIntroVideo");
				on(video, "click", function(){
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "intro-video"
					});
					// "newwindow": the pop-out window name, not required, could be empty
					// "height" and "width": pop-out window size
					// Other properties could be changed as the value of yes or no
					window.open("https://www.youtube.com/watch_popup?v=Pll8iyDzcUs","newwindow",
						"height=400, width=600, toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
					);
				});
				/*
				 Add link to list of math functions
				 */
				var math_func = dom.byId("menuMathFunctions");
				on(math_func, "click", function(){
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "math-functions"
					});
					// "newwindow": the pop-out window name, not required, could be empty
					// "height" and "width": pop-out window size
					// Other properties could be changed as the value of yes or no
					window.open("math-probs.html","newwindow",
						"height=400, width=600, toolbar =no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no"
					);
				});
				/*
				 Add link to list of Intro to Dragoon concepts
				 */
				var introConcept = dom.byId("menuIntroConcept");
				on(introConcept, "click", function(){
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "introConcept"
					});
					// "newwindow": the pop-out window name, not required, could be empty
					// "height" and "width": pop-out window size
					// Other properties could be changed as the value of yes or no
					window.open("DragoonConcepts.html","newwindow",
						"height=400, width=600, toolbar =no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no"
					);
				});
				var introTutorial = dom.byId("menuIntroTutorial");
				on(introTutorial, "click", function(){
					var tutorialBox = registry.byId("tutorialBox");
					//tutorialBox.show();
					twidget.begin(function(){

					});
				});


			}

			if(activity_config.get("allowZoom")){
				var body = dojo.body();
				var pane = dom.byId("drawingPane");
				var menuBar = dom.byId("menuBar");
				on(dom.byId("zoomIn"), "click", function(){
					var newZoom = session.zoom + session.step;
					if(newZoom < 3){
						if(checkBrowser == "Firefox"){
							var wide = ((newZoom > 1)?(100/newZoom):100);
							dojo.style(body, "MozTransform", "scale("+newZoom+")");
							dojo.style(body, "transform-origin", "0 0");
							dojo.style(menuBar, "width", wide+"%");
							dojo.style(pane, "width", wide+"%");
						} else {
							dojo.style(body, "zoom", " " + newZoom*100 + "%");
							dojo.style(pane, "width", 100+"%");
							dojo.style(menuBar, "width", 100+"%");
						}
						dojo.style(pane, "top", menuBar.clientHeight + "px");
						session.zoom = newZoom;
					} else {
						var errorMessage = new messageBox("errorMessageBox", "error", "This is the maximum zoom available for the window");
						errorMessage.show();
					}

				});

				on(dom.byId("zoomOut"), "click", function(){
					var newZoom = session.zoom - session.step;
					if(newZoom > 0.5){
						if(checkBrowser == "Firefox"){
							var wide = ((newZoom > 1)?(100/newZoom):100);
							dojo.style(body, "MozTransform", "scale("+newZoom+", "+newZoom+")");
							dojo.style(body, "transform-origin", "0 0");
							dojo.style(menuBar, "width", wide+"%");
							dojo.style(pane, "width", wide+"%");
						} else {
							dojo.style(body, "zoom", " " + newZoom*100 + "%");
							dojo.style(pane, "width", 100+"%");
							dojo.style(menuBar, "width", 100+"%");
						}
						dojo.style(pane, "top", menuBar.clientHeight + "px");
						session.zoom = newZoom;
					} else {
						var errorMessage = new messageBox("errorMessageBox", "error", "This is the minimum zoom available for the window.");
						errorMessage.show();
					}

				});
			}

			if(activity_config.get("promptSaveAs")) {
				// If we are loading a published problem in author mode, prompt user to perform a save-as immediately
				if (!query.g) {
					var message = '<strong>You must choose a name and folder for the new copy of this problem.</strong>';
					var dialog = registry.byId("authorSaveDialog");
					registry.byId("authorSaveProblem").set("value", query.p);
					dom.byId("saveMessage").innerHTML = message;
					dialog.show();
				} else if (givenModel.getTime().step != 1) {
					var givenTime = givenModel.getTime();
					var oldStep = givenTime.step; // Save this for use in message
					givenModel.setTime({
						start: givenTime.start,
						end: givenTime.end,
						step: 1
					});
					//show message on canvas that step size has been updated to 1
					var timeStepWarning = new messageBox("errorMessageBox", "warn",
						"The model you have loaded had a timestep size which was " + oldStep +
						" instead of one. It has been changed to one. Please open to the " +
						"problem and times window and update the units of time and end time" +
						" to compensate.");
					timeStepWarning.show();

				}
			}

			if(activity_config.get("showWaveformEditor")){
				aspect.after(registry.byId('waveformEditor'), "hide", function(){
					if(activity_config.get("showNodeBorderTutorial")) {
						var nodeBorderTutorialState = givenModel.getNodeBorderTutorialState();
						controllerObject.showNodeBorderTooltip(nodeBorderTutorialState);
						state.put("NodeBorderTutorialState", givenModel.getNodeBorderTutorialState());
					}
				});
			}

			if(activity_config.get("showNodeEditor")){
				//Initialize Tooltips
				var questionMarkButtons = {
					"descriptionQuestionMark": "The quantity computed by the node ",
					"typeQuestionMark": "Each quantity has a type.  To illustrate, suppose you are defining a quantity called zorch: <br>"+
					"<ul><li>A Parameter is a quantity whose value is given to you.  If zorch=50.3, then it is a parameter.</li>"+
					"<li> A Function is a quantity whose value is a function of the node’s inputs.<br>"+
					"If zorch=foo*baz, then it is a Function and its inputs are foo and baz.  * means multiplication.</li>"+
					"<li>An Accumulator is a quantity whose next value is the sum of its current value and its inputs.<br>" +
					"If the next value of zorch is its current value + foo – baz, then it is an Accumulator and its " +
					"<br>inputs are foo and baz.</li></ul>",
					"inputsQuestionMark": "Select a quantity to enter into the expression above.  Much faster than typing.",
					"expressionBoxQuestionMark": "Determines the value of the quantity. Additional math functions are available in the help menu",
					"initialValueQuestionMark": "This is a number, typically given to you in the system description.",
					"unitsQuestionMark": "Some quantities are measured in units, such as feet, volts or dollars.<br>  Pick one here, or “No Units” if this quantity doesn’t need units.",
					"operationsQuestionMark": "Click one of these to enter it in the expression above. <br> See the Help menu at the top of the screen for a list of other mathematical operators and functions that you can type in."
				};

				if(!activity_config.get("showNodeEditorTour")) {
					// Show tips for Root in node modifier and Share Bit in Description and Time
					var toggleTooltip = function(id){
						//Hide Tooltip
						if(! domClass.contains(dom.byId(id), "active")) {
							toolTip.show(questionMarkButtons[id], dom.byId(id), ["before-centered"]);
						}else{
							toolTip.hide(dom.byId(id));
						}
						domClass.toggle(dom.byId(id), "active");

						//Reset Buttons
						array.forEach(Object.keys(questionMarkButtons), function(buttonID){
							if(buttonID !== id) {
								domClass.remove(dom.byId(buttonID), "active");
							}
						});
					};

					//Add event handlers on questionmark buttons
					array.forEach(Object.keys(questionMarkButtons), function(buttonID){
						on(dom.byId(buttonID), "click", function(evt){
							toggleTooltip(buttonID)
						});
					});
				}

				//Clear Tooltips on hide of node editor
				aspect.after(registry.byId('nodeeditor'), "hide", function(){
					array.forEach(Object.keys(questionMarkButtons), function(buttonID){
						domClass.remove(dom.byId(buttonID), "active");
						toolTip.hide(dom.byId(buttonID));
					});

					if( !sendKCScore || !givenModel.isCompleteFlag) return;
					var learningResourceName = etHelper.getLearningResourceName();
					var KCScores = controllerObject._assessment.getSchemaSuccessFactor();
					if(Object.keys(KCScores).length > 0) {
						Object.keys(KCScores).forEach(function(key) {
							// Get new KCs Mapped to schemas
							var newkey = etHelper.getKCForSchema(key);
							KCScores[newkey] = KCScores[key];
							delete KCScores[key];
						});

						console.log("Sending KC Scores", KCScores);
						sendKCScore(ETConfig.config.learningResource,learningResourceName, KCScores);
					}
				}, this);
				// Wire up close button...
				// This will trigger the above session.saveProblem()
				on(registry.byId("closeButton"), "click", function(){
					registry.byId("nodeeditor").hide();
				});

				if(activity_config.get("allowDeleteNode")) {
					on(registry.byId("deleteButton"), "click", function () {
						//delete node from model and remove from display
						drawModel.deleteNode(controllerObject.currentID);
						registry.byId("nodeeditor").hide();
					});
				}
				style.set(registry.byId("deleteButton").domNode, "display", ui_config.get("nodeEditorDeleteButton"));

				// attaching author History widget
				if(activity_config.get("allowHistory")) {
					var historyWidget = new HistoryWidget(query, session.sessionId);
					registry.byId("historyButton").set("disabled", false);
					on(registry.byId("historyButton"), "click", function (e) {
						event.stop(e);
						historyWidget.show();
					});
				}

				/*
				 Autosave on close window
				 It would be more efficient if we only saved the changed node.

				 Connecting to controllerObject.closeEditor causes a race condition
				 with code in controllerObject._setUpNodeEditor that wires up closeEditor.
				 Instead, we connect directly to the widget.
				 */
				aspect.after(registry.byId('nodeeditor'), "hide", function(){
					console.log("Calling session.saveProblem");
					if(controllerObject._mode == "AUTHOR")
					{
						array.forEach(givenModel.model.task.givenModelNodes, function(node){
							if(node.ID === controllerObject.currentID)
							{
								console.log(node.description);
								if(node.description === "" || node.description == null)
								{
									console.log("Changing description to match name");
									node.description = node.name;
								}
							}
						}, this);
						if(typeof controllerObject._model.active.getType(controllerObject.currentID) !== "undefined"){
							var isComplete = givenModel.given.isComplete(controllerObject.currentID)?ui_config.get('nodeBorderCompleteStyle'):ui_config.get('nodeBorderInCompleteStyle');
							//var borderColor = "3px "+isComplete+" gray";
							var borderStyle = ui_config.get('nodeBorderSize') + isComplete+ ui_config.get('nodeBorderCompleteColor');
							style.set(controllerObject.currentID, 'border', borderStyle);
							style.set(controllerObject.currentID, 'backgroundColor', "white");
						}
					}
					session.saveProblem(givenModel.model);
					//This section errors out in author mode
					if(controllerObject._mode !== "AUTHOR"){
						var descDirective=controllerObject._model.student.getStatusDirectives(controllerObject.currentID);
						var directive = null;
						for(i=0;i<descDirective.length;i++){
							if(descDirective[i].id=="description")
								directive=descDirective[i];

						}
						if(controllerObject._mode !== "TEST" && controllerObject._mode !== "EDITOR"){
							if(directive&&(directive.value=="incorrect" || directive.value=="premature"))
								drawModel.deleteNode(controllerObject.currentID);
						}
					}

					if(activity_config.get("showNodeEditorTour") && controllerObject.incNodeTourCounter &&
						controllerObject._model.active.isComplete(controllerObject.currentID)){
						var nodeTutorialState = givenModel.getNodeEditorTutorialState();
						// Increment count for nodeType when the node is completed for the first time
						var nodeType = controllerObject._model.active.getType(controllerObject.currentID);
						if(nodeType) {
							nodeTutorialState[nodeType] = nodeTutorialState[nodeType] ? nodeTutorialState[nodeType] : 0;
							nodeTutorialState[nodeType] += 1;
						}
						console.log("SET TUTORIAL STATE", nodeTutorialState);
						//Save tutorial state
						givenModel.setNodeEditorTutorialState(nodeTutorialState);
						state.put("NodeEditorTutorialState", nodeTutorialState)
					}

					//Show Node border Help tooltip
					if(activity_config.get("showNodeBorderTutorial")) {
						var nodeBorderTutorialState = givenModel.getNodeBorderTutorialState();
						controllerObject.showNodeBorderTooltip(nodeBorderTutorialState);
						state.put("NodeBorderTutorialState", givenModel.getNodeBorderTutorialState());
					}

					//Send complete step message on close node editor
					/*
					if(activity_config.get("ElectronixTutor") &&
						controllerObject._model.active.isComplete(controllerObject.currentID)){
						var taskname = query.p;
						var nodename = controllerObject._model.active.getName(controllerObject.currentID).split(' ').join('-');
						var step_id = taskname +"_"+ nodename;
						// Send Complete step message
						etConnect.sendCompletedStep(step_id, true);
					}*/

				});
			}

			if(activity_config.get("showIncrementalEditor")){
				//Save session on closing incremental popup
				//Saving incremental activity to DB
				//Not Saving demoIncremental activity to DB
				aspect.after(controllerObject, "closeIncrementalMenu", function(){
					controllerObject.notifyCompleteness();
					if(activity_config.get("showDoneMessage") && ui_config.get("doneButton") != "none" &&
						givenModel.student.matchesGivenSolutionAndCorrect() && !givenModel.isDoneMessageShown){
						showProblemDoneHint();
					}
					if(!activity_config.get("demoIncrementalFeatures"))
						session.saveProblem(givenModel.model);
				});
			}

			if(activity_config.get("allowAssignWaveFormButton")){
				console.log("wave form button can be clicked");

					on(registry.byId("assignWaveFormButton"),"click", function(){
						console.log("initializing wave form assigner");
						console.log("showing waveform assigner")
						controllerObject.showWaveformAssignerAuthor(controllerObject.currentID);
					});
		//       });
			}


			if(activity_config.get("targetNodeStrategy")){

				function checkForHint(){
					var rootNodes = givenModel.given.getRootNodes();

					//check if all present nodes are complete but model is node complete
					var studentNodes = givenModel.active.getNodes();
					var someNodeIncomplete = array.some(studentNodes, lang.hitch(this, function(node){
						if(!givenModel.active.isComplete(node.ID)){ return true; }
					}));

					var rootNodeMising=array.some(rootNodes, function(rootNode){
						if(givenModel.active.getNodeIDFor(rootNode.ID) === null){ return true; }
					});

					//set class to flash createNode button
					if(!someNodeIncomplete && (!givenModel.isCompleteFlag || rootNodeMising)){
						domClass.add(dom.byId("createNodeButton"), "glowButton");
					}
				}

				checkForHint();
				aspect.after(drawModel, "deleteNode", lang.hitch(this, checkForHint));
				aspect.after(registry.byId("nodeeditor"), "hide", lang.hitch(this, checkForHint));

				// Delete premature nodes for Coached Mode - Target node strategy
				aspect.after(controllerObject, "deleteNode", lang.hitch(drawModel, drawModel.deleteNode));
			}
			/*
			 * Add Done Button to Menu
			 */
			menu.add("doneButton", function(e){
				event.stop(e);
				console.debug("done button is clicked");
				var problemComplete = givenModel.matchesGivenSolution();

				// if in preview mode , Logging is not required:
				if(controllerObject.logging.doLogging)
					controllerObject.logging.log('close-problem', {
						type: "menu-choice",
						name: "done-button",
						problemComplete: problemComplete
					}).then(function(){
						if(window.history.length == 1)
							window.close();
						else
							window.history.back();
					});
				else {
					if(window.history.length == 1)
						window.close();
					else
						window.history.back();
				}

				session.setModelChanged(false);

				var searchPattern = new RegExp('^pal3', 'i');
				if(activity_config["PAL3"] && tc){ // check if session name starts with pal
					if(tc.needsToSendScore) {
						tc.connect();
						tc.sendStatements();
					}

				}
				/*
				if(activity_config.get("ElectronixTutor") && etConnect){
					if(etConnect.needsToSendsScore) {
						var score = controllerObject._assessment.getSuccessFactor();
						etConnect.sendScore(score);
						console.log("sending score(successfactor):", score);
					}
					else
						etConnect.stopService();
				}*/
			});

			menu.add("prettifyButton", function(e){
				event.stop(e);
				registry.byId("prettifyButton").set("disabled", true);
				console.log("Pretify---------------");
				drawModel.prettify();
			});
			menu.add("resetButton", function(e){
				event.stop(e);
				//call resetNodeInc demo in con student to reset the nodes
				if(activity_config.get("demoIncrementalFeatures")){
					controllerObject.resetNodesIncDemo();
				}
				//call resetNodeExec demo in con student to reset the nodes
				if(activity_config.get("demoExecutionFeatures")){
					controllerObject.resetNodesExecDemo();
				}
			});
			if(activity_config.get("demoIncrementalFeatures") || activity_config.get("demoExecutionFeatures")) {
				controllerObject.highlightNextNode();
			}
		});

	});

	function removeURLParam(param,url){
		var paramStart = url.indexOf("?"+param+"=")+1;
		if (paramStart == 0){
			paramStart = url.indexOf("&"+param+"=")+1;
		}
		if (paramStart == 0){
			return url;
		}

		var paramEnd = url.indexOf("&",paramStart) + 1;
		if (paramEnd == 0){
			// it's the last parameter, just cut it
			return url.slice(0,paramStart-1); // subtract 1 to remove the preceding & or ? as well.
		} else {
			return url.slice(0,paramStart)+url.slice(paramEnd,url.length);
		}

	}

	// Remove rp= and x= parameters from browers's url history
	window.history.replaceState("object or string","Title",removeURLParam("x",removeURLParam("rp",window.location.href)));
});
