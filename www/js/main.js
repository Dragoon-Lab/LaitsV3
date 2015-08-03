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
	"./modelChanges"
], function(
	array, lang, dom, geometry, style, domClass, on, aspect, ioQuery, ready, registry, toolTip, tooltipDialog, popup,
	menu, loadSave, model, Graph, controlStudent, controlAuthor, drawmodel, logging, equation,
	description, State, typechecker, slides, lessonsLearned, schemaAuthor, messageBox, tincan,
	activityParameters, memory, event, UI, Dialog, ImageBox, modelUpdates){

	/*  Summary:
	 *			Menu controller
	 *  Description:
	 *			Acts as the controller for the buttons on the menu
	 *  Tags:
	 *			menu, buttons, controller
	 */

	console.log("load main.js");

	//remove the loading division, now that the problem is being loaded
	var loading = document.getElementById('loadingOverlay');
	loading.style.display = "none";

	// Get session parameters
	var query = {};
	if(window.location.search){
		query = ioQuery.queryToObject(window.location.search.slice(1));
	}else{
		console.warn("Should have method for logging this to Apache log files.");
		console.warn("Dragoon log files won't work since we can't set up a session.");
		console.error("Function called without arguments");
		// show error message and exit
		var errorMessage = new messageBox("errorMessageBox", "error", "Missing information, please recheck the query");
		errorMessage.show();
		throw Error("please retry, insufficient information");
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
	var activity_config;
	try{		
		activity_config = new activityParameters(query.m, query.a);
		console.log("ACTIVITY PARAMS", activity_config);
	}catch(error){
		throw Error("problem in creating activity configurations");
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

		var loading = document.getElementById('loadingOverlay');
		loading.style.display = "none";

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

		// get the UI state for the given state and activity
		var ui_config = new UI(query.m , query.a);
		console.info("UI Parameters created:",ui_config);
		console.log("sm ini ?",activity_config);

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
			if (query.m !== "AUTHOR") {
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
		var controllerObject = query.m == 'AUTHOR' ?
			new controlAuthor(query.m, subMode, givenModel, query.is, ui_config, activity_config) :
			new controlStudent(query.m, subMode, givenModel, query.is, ui_config, activity_config);

		//setting up logging for different modules.
		if(controllerObject._PM){
			controllerObject._PM.setLogging(session);  // Set up direct logging in PM
		}
		controllerObject.setLogging(session); // set up direct logging in controller
		if(query.m != 'AUTHOR'){
			controllerObject.setAssessment(session); //set up assessment for student.
		}
		equation.setLogging(session);

		/*
		 * Create state object
		 */

		var state = new State(query.u, query.s, "action");
		state.get("isLessonLearnedShown").then(function(reply) {
			givenModel.setLessonLearned(reply);
		});
		controllerObject.setState(state);

		ready(function(){
			var updateModel = new modelUpdates(givenModel, query.m, session);
			if(activity_config.get("setTweakDirections") && !givenModel.given.validateTweakDirections()){	
				updateModel.calculateTweakDirections();
			}
			
			if(activity_config.get("initializeStudentModel") && !givenModel.areRequiredNodesVisible()){
				console.log("student model being initialized");
				updateModel.initializeStudentModel(activity_config.get("setStudentTweakDirection"));
			}
			
			var taskString = givenModel.getTaskName();
			document.title ="Dragoon" + ((taskString) ? " - " + taskString : "");

			//configuring DOM UI 
			style.set(registry.byId('imageButton').domNode, "display", "none");

			//update the menu bar//  // This should check based on UI parameters instead
			if(query.m == "AUTHOR"){
				style.set(registry.byId('forumButton').domNode, "display", "inline-block");
				style.set(registry.byId('schemaButton').domNode, "display", "inline-block");
				style.set(registry.byId('descButton').domNode, "display", "inline-block");
				style.set(registry.byId('saveButton').domNode, "display", "inline-block");
				style.set(registry.byId('mergeButton').domNode, "display", "inline-block");
				style.set(registry.byId('previewButton').domNode, "display", "inline-block");
				style.set(registry.byId('imageButton').domNode, "display", "inline-block");
			}

			//GET problem-topic index for PAL problems
			palTopicIndex = "";
			var searchPattern = new RegExp('^pal3', 'i');
			if(query.m != "AUTHOR" && searchPattern.test(query.s)){
				var xhrArgs = {
					url: "problems/PAL3-problem-topics.json",
					handleAs: "json",
					load: function(data){
						palTopicIndex = data;
					},
					error: function(error){
						console.log("error retrieving file name");
					}
				}
				dojo.xhrGet(xhrArgs);
			}

			var drawModel = new drawmodel(givenModel.active, ui_config.get("showColor"), activity_config);
			drawModel.setLogging(session);

			
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

			

			// Wire up send to server
			aspect.after(drawModel, "updater", function(){
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
			aspect.after(drawModel, "onClickNoMove", function(mover){
				if(activity_config.get("showNodeEditor")){
					if(mover.mouseButton != 2) { //check if not right click
						controllerObject.showNodeEditor(mover.node.id);
					}
			
					if(givenModel.getImageURL())
						registry.byId('imageButton').set('disabled', false);
					else
						registry.byId('imageButton').set('disabled', true);
						
				}else if(activity_config.get("showIncrementalEditor")){
					controllerObject.showIncrementalEditor(mover.node.id);
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

			if(activity_config.get("allowProblemTimes")){
				var descButton = registry.byId("descButton");
				descButton.set("disabled", false);
				descObj.initializeAuthorWindow();

				// Description button wiring
				menu.add("descButton", function(e){
					event.stop(e);
					style.set(dom.byId("publishResponse"), "display", "none");
					//Display publish problem button on devel and localhost
					if(window.location.hostname === "localhost" ||
						window.location.pathname.indexOf("/devel/") === 0){
						style.set(registry.byId("problemPublishButton").domNode, "display", "inline-block");
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
				makeTooltip('descriptionQuestionMark', " The quantity computed by the node ");
				makeTooltip('typeQuestionMark', "<strong>Parameters</strong> represent fixed quantities that never change.<br>"+
					"<strong>Accumulators</strong> represent a quantity that accumulates the values of its inputs over time.<br>"+
					"<strong>Functions</strong> represent a value that is directly related to the values of its inputs, without regard to its <br>own previous value.");
				makeTooltip('inputsQuestionMark', "Select a node name to quickly insert it into the expression.");
				makeTooltip('expressionBoxQuestionMark', "Determines the value of the quantity. Additional math functions are available in the help menu");
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
				var saveGroupArr=[{name: "Private("+query.u+")", id: "Private"},
					{name: "public", id: "Public"}];
				var saveGroupMem = new memory({data: saveGroupArr});
				saveGroupCombo.set("store", saveGroupMem);
				saveGroupCombo.set("value","Private("+query.u+")")//default to private

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
							if (groupName.split("(")[0]+"("=="Private("){
								groupName=groupName.split(")")[0].substr(8);//Privte(username)=>username
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
				previewButton.set("disabled", false);
				on(registry.byId("previewButton"),"click",function(){
					var user = query.u;
					var timestamp = new Date().getTime();
					var url = document.URL.replace("u="+query.u,"u="+query.u+"-"+timestamp);
					//console.log(url);
					url=url+"&l=false";
					window.open(url.replace("m=AUTHOR","m=STUDENT"),"newwindow");
				});
			}

			if(activity_config.get("allowCreateSchema")){
				var schemaButton = registry.byId("schemaButton");
				schemaButton.set("disabled", false);

				var schema = new schemaAuthor(givenModel, session);
				menu.add("schemaButton", function(e){
					event.stop(e);
					schema.showSchemaWindow();
				});
			}

			if(activity_config.get("allowMerge")){
				var mergeButton = registry.byId("mergeButton");
				mergeButton.set("disabled", false);
				// Merge button wiring
				menu.add("mergeButton", function(e){
					event.stop(e);
					registry.byId("authorMergeDialog").show();
					var combo = registry.byId("authorMergeGroup");
					var arr=[{name: "Private("+query.u+")", id: "Private"},
						{name: "Public", id: "Public"},
						{name:"Official Problems",id:"Official Problems"}
					];
					var m = new memory({data: arr});
					combo.set("store", m);
					combo.set("value","Private("+query.u+")")//setting the default
				});

				on(registry.byId("mergeDialogButton"),"click",function(){
					var group = registry.byId("authorMergeGroup").value;
					var section = registry.byId("authorMergeSection").value;
					var problem = registry.byId("authorMergeProblem").value;
					if(!problem){
						alert("Problem field can't be empty");
						return;
					}
					if (group.split("(")[0]+"("=="Private("){
						group=group.split(")")[0].substr(8);//Private(username)=>username
					} else if (group === "Official Problems"){
						group=null;
						section=null;
					}
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

			if(activity_config.get("allowGraph")){
		
				var graphButton = registry.byId("graphButton");
				graphButton.set("disabled", false);

				// show graph when button clicked
				menu.add("graphButton", function(e){
					event.stop(e);
					console.debug("button clicked");
							
					// instantiate graph object
					var buttonClicked = "graph";
					var graph = new Graph(givenModel, query.m, session, buttonClicked);
					graph.setStateGraph(state);
					var problemComplete = givenModel.matchesGivenSolution();

					graph._logging.log('ui-action', {
						type: "menu-choice",
						name: "graph-button",
						problemComplete: problemComplete
					});
					graph.show();
				});

				//the solution div which shows graph/table when closed
				//should disable all the pop ups
				aspect.after(registry.byId('solution'), "hide", function(){
					
					console.log("Calling graph/table to be closed");
					controllerObject.logging.log('ui-action', {
						type: "menu-choice",
						name: "graph-closed"
					});
					typechecker.closePops();
				});
			}

			if(activity_config.get("allowTable")){
				var tableButton = registry.byId("tableButton");
				tableButton.set("disabled", false);

				// show table when button clicked
				menu.add("tableButton", function(e){
					event.stop(e);
					console.debug("table button clicked");
					var buttonClicked = "table";
					var table = new Graph(givenModel, query.m, session, buttonClicked);
					table.setStateGraph(state);
					table._logging.log('ui-action', {
						type: "menu-choice",
						name: "table-button"
					});
					table.show();
				});
			}

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
			}
			
			if(activity_config.get("allowLessonsLearned")){

				//Enable the lessonsLearnedButton
				//var lessonsLearnedButton = registry.byId("lessonsLearnedButton");
				//lessonsLearnedButton.set("disabled", true);
				//Bind lessonsLearnedButton to the click event

				menu.add("lessonsLearnedButton", function(e){
					// preventing default execution of click handler
					event.stop(e);
					console.log("inside handler");
					if(givenModel.isLessonLearnedShown == true){
						contentMsg = givenModel.getTaskLessonsLearned();
						lessonsLearned.displayLessonsLearned(contentMsg);
					}
				});
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
					window.open("http://dragoon.asu.edu","newwindow",
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

			}

			if(activity_config.get("promptSaveAs")){
				// If we are loading a published problem in author mode, prompt user to perform a save-as immediately
				if(!query.g) {
					var message = '<strong>You must choose a name and folder for the new copy of this problem.</strong>';
					var dialog = registry.byId("authorSaveDialog");
					registry.byId("authorSaveProblem").set("value", query.p);
					dom.byId("saveMessage").innerHTML = message;
					dialog.show();
				}
			}

			if(activity_config.get("showNodeEditor")){
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
				});
			}

			if(activity_config.get("showIncrementalEditor")){
				//Save session on closing incremental popup
				aspect.after(controllerObject, "closeIncrementalPopup", function(){
					session.saveProblem(givenModel.model);
				});
			}

			if(activity_config.get("targetNodeStrategy")){
				//Only for coached mode
				function checkForHint(){
					//Check for root node in student model
					var givenNodes = givenModel.given.getNodes();
					var rootNode = null;
					array.some(givenNodes, function(node){
						if(givenModel.isParentNode(node.ID)){
							rootNode = node;
							return true;
						}
					});

					//check if all present nodes are complete but model is node complete
					var studentNodes = givenModel.active.getNodes();
					var someNodeIncomplete = array.some(studentNodes, lang.hitch(this, function(node){
						if(!givenModel.active.isComplete(node.ID)){ return true; }
					}));

					//set class to flash createNode button
					if(!someNodeIncomplete && (!givenModel.isCompleteFlag ||
						givenModel.active.getNodeIDFor(rootNode.ID) === null)){
						domClass.add(dom.byId("createNodeButton"), "glowButton");
					}
				}
				debugger;
				checkForHint();
				aspect.after(drawModel, "deleteNode", lang.hitch(this, checkForHint));
				aspect.after(registry.byId("nodeeditor"), "hide", lang.hitch(this, checkForHint));
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

				var searchPattern = new RegExp('^pal3', 'i');
				if(query.m != "AUTHOR" && searchPattern.test(query.s)){ // check if session name starts with pal
					var tc = new tincan(givenModel, controllerObject._assessment,session, palTopicIndex);
					//Connect to learning record store
					tc.connect();
					//Send Statements
					tc.sendStatements();
				}
			});

			menu.add("prettifyButton", function(e){
				event.stop(e);
				registry.byId("prettifyButton").set("disabled", true);
				console.log("Pretify---------------");
				drawModel.prettify();
			});

			//This array is used later to called the setSelected function for all the buttons in the menu bar
			var menuButtons=[];
			menuButtons.push("createNodeButton","graphButton","tableButton","forumButton",
				"schemaButton","descButton","saveButton","mergeButton",
				"previewButton","slidesButton","lessonsLearnedButton","doneButton", "prettifyButton");

			if(query.m == "STUDENT"){
				style.set(registry.byId('forumButton').domNode, "display", "none");
				style.set(registry.byId('schemaButton').domNode, "display", "none");
				style.set(registry.byId('descButton').domNode, "display", "none");
				style.set(registry.byId('saveButton').domNode, "display", "none");
				style.set(registry.byId('mergeButton').domNode, "display", "none");
				style.set(registry.byId('previewButton').domNode, "display", "none");
			}

			/*
			 * This is a work-around for getting a button to work inside a MenuBar.
			 * Otherwise, there is a superfluous error message.
			 */
			array.forEach(menuButtons,function(menuButton){
				registry.byId(menuButton)._setSelected = function(arg){
					console.log(menuButton+" _setSelected called with ", arg);
				}
			});

		});

	});
});
