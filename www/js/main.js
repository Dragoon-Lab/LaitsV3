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
	"dojo/on",
	'dojo/aspect',
	"dojo/io-query",
	"dojo/ready",
	'dijit/registry',
    "dijit/Tooltip",
	"./menu",
	"./load-save",
	"./model",
	"./RenderGraph", 
	"./RenderTable",
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
	"./tincan"
], function(
		array, lang, dom, geometry, style, on, aspect, ioQuery, ready, registry, toolTip,
		menu, loadSave, model,
		Graph, Table, controlStudent, controlAuthor, drawmodel, logging, equation, 
		description, State, typechecker, slides, lessonsLearned, schemaAuthor, messageBox, tincan
){
	// Summary: 
	//			Menu controller
	// Description:
	//			Acts as the controller for the buttons on the menu
	// Tags:
	//			menu, buttons, controller
	
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
		//removing the overlay as the actual computation does not take much time and it causes errors to stay hidden behind the overlay which continues infinitely.
		var loading = document.getElementById('loadingOverlay');
		loading.style.display = "none";
		var givenModel = new model(query.m, query.p);
		logging.session.log('open-problem', {problem : query.p});
        console.log("solution graph is",solutionGraph);
		if(solutionGraph) {

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

        }else {
			if(query.g && query.m === "AUTHOR"){
				var messageHtml = "You have successfully created a new problem named <strong>"+ query.p +"</strong>.<br/> <br/> If you expected this problem to exist already, please double check the problem name and folder and try again.";
				var infoMessage = new messageBox("errorMessageBox", "info", messageHtml);
				infoMessage.show();
			} else if(query.g){
				var errorMessage = new messageBox("errorMessageBox", "error", "Problem not found.");
				errorMessage.show();
			}
		}
		/*
		 start up controller
		 */
		
		/* 
		 The sub-mode of STUDENT mode can be either "feedback" or "power"
		 This is eventually supposed to be supplied by the student model.
		 In the mean time, allow it as a GET parameter.
		 */
		var subMode = query.sm || "feedback";
		/* In principle, we could load just one controller or the other. */
		var controllerObject = query.m == 'AUTHOR' ? new controlAuthor(query.m, subMode, givenModel, query.is) :
				new controlStudent(query.m, subMode, givenModel, query.is);
		
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
		 Create state object
		 */
		var state = new State(query.u, query.s, "action");
		state.get("isLessonLearnedShown").then(function(reply) {
			givenModel.setLessonLearned(reply);
		});
		controllerObject.setState(state);

		ready(function(){
			var taskString = givenModel.getTaskName();
			document.title ="Dragoon" + ((taskString) ? " - " + taskString : "");
			
			//In TEST and EDITOR mode remove background color and border colors		 
			if(controllerObject._mode == "TEST" || controllerObject._mode == "EDITOR"){
				showColor = false;
			}else{
				showColor = true;
			}

			var drawModel = new drawmodel(givenModel.active, showColor);
			drawModel.setLogging(session);

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

			/* add "Create Node" button to menu */
			menu.add("createNodeButton", function(){

				if(controllerObject.checkDonenessMessage && 
				   controllerObject.checkDonenessMessage()){
					return;
				}
				
				var id = givenModel.active.addNode();
				controllerObject.logging.log('ui-action', {type: "menu-choice", name: "create-node"});
				drawModel.addNode(givenModel.active.getNode(id));		
				controllerObject.showNodeEditor(id);
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
			/*
			 Connect node editor to "click with no move" events.
			 */
			aspect.after(drawModel, "onClickNoMove", function(mover){
				if(mover.mouseButton != 2) //check if not right click
					controllerObject.showNodeEditor(mover.node.id);
			}, true);
			
			/* 
			 After moving node, save coordinates to model, and autosave
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
				givenModel.active.setPosition(mover.node.id, {"x": g.x, "y": g.y});

				//Update position for student node
				if(controllerObject._mode == "AUTHOR"){
					var studentNodeID = givenModel.student.getNodeIDFor(mover.node.id);
					if(typeof studentNodeID !== "undefined" && studentNodeID != null ){
						givenModel.student.setPosition(studentNodeID, {"x": g.x, "y": g.y});
					}
				}
				// It would be more efficient if we only saved the changed node.
				session.saveProblem(givenModel.model);	 // Autosave to server
			}, true);
			
			/*
			 Add connection when inputs are updated
			 */
			aspect.after(controllerObject, 'addQuantity',
					lang.hitch(drawModel, drawModel.addQuantity), true);
			aspect.after(controllerObject, 'setConnections',
						 lang.hitch(drawModel, drawModel.setConnections), true);
			aspect.after(controllerObject, 'setConnection',
                                                 lang.hitch(drawModel, drawModel.setConnection), true);
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
						var isComplete = givenModel.given.isComplete(controllerObject.currentID, true)?'solid':'dashed';
						var borderColor = "3px "+isComplete+" gray";
						style.set(controllerObject.currentID, 'border', borderColor);
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
			
			// Wire up close button...
			// This will trigger the above session.saveProblem()
			on(registry.byId("closeButton"), "click", function(){
				registry.byId("nodeeditor").hide();
			});

			on(registry.byId("deleteButton"), "click", function(){
				//delete node from model and remove from display
				drawModel.deleteNode(controllerObject.currentID);
				registry.byId("nodeeditor").hide();
			});
			if(controllerObject._mode == "AUTHOR"){
				aspect.after(drawModel, "deleteNode",
							 lang.hitch(controllerObject, controllerObject.removeStudentNode), true);
			}

			// checks if forumurl is present
			if(query.f && query.fe=="true") {
				//Enable the forum button in the menu
				var forumBut=registry.byId("forumButton");
				forumBut.set("disabled", false);
                //For redirecting to the forum from forum button click on header, only incase enabled
                menu.add("forumButton",function(){
                    //  Some portion of this function body should be moved to forum.js, Bug #2424
                    console.log("clicked on main forum button");
                    controllerObject.logging.log('ui-action', {
                        type: "menu-forum-button",
                        name: "forum"
                    });
                    var prob_name=givenModel.getTaskName();
                    console.log("problem name is ", prob_name);
                    // "newwindow": the pop-out window name, not required, could be empty
                    // "height" and "width": pop-out window size
                    // Other properties could be changed as the value of yes or no
                    //
                    // The parameters should be escaped, Bug #2423
                    // Should add logging, Bug #2424
                    window.open(query.f+"?&n="+prob_name+"&s="+query.s+"&fid="+query.fid+"&sid="+query.sid, "_blank" );
                });
				//setter function used for setting forum parameters
				//inside controller
				controllerObject.setForum(query);
			}
			// Also used in image loading below.
			var descObj = new description(givenModel);
			if(query.m == "AUTHOR"){
				var db = registry.byId("descButton");
				db.set("disabled", false);
                db = registry.byId("saveButton");
                db.set("disabled", false);
                db = registry.byId("mergeButton");
                db.set("disabled", false);
				db = registry.byId("previewButton");
				db.set("disabled", false);
				db = registry.byId("schemaButton");
				db.set("disabled", false);

				// Description button wiring
				menu.add("descButton", function(){
					style.set(dom.byId("publishResponse"), "display", "none");
					//Display publish problem button on devel and localhost
					if(window.location.hostname === "localhost" ||
					   window.location.pathname.indexOf("/devel/") === 0){
						style.set(registry.byId("problemPublishButton").domNode, "display", "inline");
					}
					registry.byId("authorDescDialog").show();
				});
				aspect.after(registry.byId('authorDescDialog'), "hide", function(){
					console.log("Saving Description/Timestep edits");
					session.saveProblem(givenModel.model);
				});
				on(registry.byId("descCloseButton"), "click", function(){
					registry.byId("authorDescDialog").hide();
				});

				on(registry.byId("problemPublishButton"), "click", function(){
					var w = confirm("Are you sure you want to publish the problem");
					var response = "There was some error while publishing the problem.";
					if(w == true){
						session.publishProblem(givenModel.model).then(function(reply){
							response = "The problem has been successfully published.";
						});
					
						var responseWidget = dom.byId("publishResponse");
						responseWidget.innerHTML = response;
						if(response.indexOf("error") >=0){
							style.set(responseWidget, "color", "red");
						} else {
							style.set(responseWidget, "color", "green");
						}
						style.set(responseWidget, "display", "block");
					}
				});

				on(registry.byId("previewButton"),"click",function(){
					var user = query.u;
					var timestamp = new Date().getTime();
					var url = document.URL.replace("u="+query.u,"u="+query.u+"-"+timestamp);
					//console.log(url);
					url=url+"&l=false";
					window.open(url.replace("m=AUTHOR","m=STUDENT"),"newwindow");
				});

				var schema = new schemaAuthor(givenModel, session);
				menu.add("schemaButton", function(){
					schema.showSchemaWindow();
				});


                // Rename button wiring
                menu.add("saveButton", function(){
                    registry.byId("authorSaveDialog").show();
                });

                //authorMergeDialog
                menu.add("mergeButton", function(){
                    registry.byId("authorMergeDialog").show();
             	});

				on(registry.byId("mergeDialogButton"),"click",function(){
					 var group = registry.byId("authorMergeGroup").value;
					 var section = registry.byId("authorMergeSection").value;
					 var problem = registry.byId("authorMergeProblem").value;

					 if(!problem || !section)
					 	{
					 		alert("Problem/Section can't be empty");
					 		return;
					 	}

					 var query = {g:group,m:"AUTHOR",s:section,p:problem};
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
					}else if(problemName && problemName.length > 0 && problemName.length<=30 && checkProblemName.test(problemName)){
						var checkHyphen = new RegExp('^[\-]+$');
						if(!checkHyphen.test(problemName)){
							session.saveAsProblem(givenModel.model,problemName,groupName); 
						} else{
							alert("Problem names must contain atleast one alphanumeric character.");
							return;
						}
					}else{
						alert("Problem names must be between 1 and 30 characters, and may only include alphanumeric characters and the \"-\" symbol");
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

			if(query.m == "EDITOR"){
				if(givenModel.model.task.slides){
					var sb = registry.byId("slidesButton");
					sb.set("disabled", false);
					var createSlides = new slides(givenModel);
					menu.add("slidesButton", function(){
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

			// Render image description on canvas
			descObj.showDescription();

			/*
			 Make model solution plot using dummy data. 
			 This should be put in its own module.
			 */
			
			// show graph when button clicked
			menu.add("graphButton", function(){
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

			
			// show table when button clicked
			menu.add("tableButton", function(){
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
            //the solution div which shows graph/table when closed
            //should disable all the pop ups
            aspect.after(registry.byId('solution'), "hide", function(){
                console.log("Calling graph/table to be closed");
                controllerObject.logging.log('ui-action', {
                    type: "menu-choice",
                    name: "graph-closed"
                });
                typechecker.closePops();
                //session.saveProblem(givenModel.model);
            });

			menu.add("doneButton", function(){
				console.debug("done button is clicked");
			var problemComplete = givenModel.matchesGivenSolution();
				
				var promise = controllerObject.logging.log('close-problem', {
				type: "menu-choice", 
					name: "done-button", 
					problemComplete: problemComplete
				});
				
				var searchPattern = new RegExp('^pal3', 'i'); 
				if(query.m != "AUTHOR" && searchPattern.test(query.s)){ // check if session name starts with pal
					var tc = new tincan(givenModel, controllerObject._assessment,session, palTopicIndex);
					//Connect to learning record store
					tc.connect();
					//Send Statements
					tc.sendStatements();
				}

				promise.then(function(){
					 if(window.history.length == 1)
                                                window.close();
                                        else
                                                window.history.back();
				});
			});

			//Disable the lessonsLearnedButton
			//var lessonsLearnedButton = registry.byId("lessonsLearnedButton");   
			//lessonsLearnedButton.set("disabled", true);
			//Bind lessonsLearnedButton to the click event	
			if(query.m == "STUDENT" || query.m == "COACHED"){
				menu.add("lessonsLearnedButton", function(){
					if(givenModel.isLessonLearnedShown == true){
						contentMsg = givenModel.getTaskLessonsLearned();
						lessonsLearned.displayLessonsLearned(contentMsg);
					}		
				});
			}
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
		});
	});
});
