/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* global define */
define([
    'dojo/_base/lang',
    "dojo/dom",
    'dojo/dom-geometry',
    "dojo/on",
    'dojo/aspect',
    "dojo/io-query",
    "dojo/ready",
    'dijit/registry',
    "./menu",
    "./load-save",
    "./model",
    "./RenderGraph", "./RenderTable",
    "./con-student", './con-author',
    "parser/parser",
    "./draw-model",
    "./logging",
    "./equation",
    "./description",
	"./state"
], function(
        lang, dom, geometry, on, aspect, ioQuery, ready, registry,
        menu, loadSave, model,
        Graph, Table, controlStudent, controlAuthor, Parser, drawmodel, logging, expression, description, State
        ){

    console.log("load main.js");

    // Get session parameters
    var query = {};
    if(window.location.search){
        query = ioQuery.queryToObject(window.location.search.slice(1));
    }else {
        console.warn("Should have method for logging this to Apache log files.");
        console.warn("Dragoon log files won't work since we can't set up a session.");
        console.error("Function called without arguments");
    }

    // Start up new session and get model object from server
    var session = new loadSave(query);
    logging.setSession(session);  // Give logger message destination
    session.loadProblem(query).then(function(solutionGraph){

        var givenModel = new model(query.m, query.p);
        logging.session.log('open-problem', {problem : query.p});
        if(solutionGraph){
            givenModel.loadModel(solutionGraph);
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
        expression.setLogging(session);

	/*
	 Create state object
	 */
	var state = new State(query.u, query.s, "action");
	controllerObject.setState(state);
	
        ready(function(){

            var drawModel = new drawmodel(givenModel.active);
            drawModel.setLogging(session);
	    // Wire up send to server
	    aspect.after(drawModel, "updater", function(){
		session.saveProblem(givenModel.model);
	    });

            /* add "Create Node" button to menu */
            menu.add("createNodeButton", function(){

                if(controllerObject.checkDonenessMessage && 
		   controllerObject.checkDonenessMessage()){
                    return;
                }
		
                var id = givenModel.active.addNode();
                drawModel.addNode(givenModel.active.getNode(id));
                controllerObject.logging.log('ui-action', {type: "menu-choice", name: "create-node"});		
                controllerObject.showNodeEditor(id);
            });

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
                console.warn("This should take into account scrolling, Bug #2300.");
                givenModel.active.setPosition(mover.node.id, {"x": g.x, "y": g.y});
                // It would be more efficient if we only saved the changed node.
                session.saveProblem(givenModel.model);   // Autosave to server
            }, true);

            /*
             Add connection when inputs are updated
             */
            aspect.after(controllerObject, 'addQuantity',
                    lang.hitch(drawModel, drawModel.addQuantity), true);
            aspect.after(controllerObject, 'setConnections',
                    lang.hitch(drawModel, drawModel.setConnections), true);

            /*
             Autosave on close window
             It would be more efficient if we only saved the changed node.
             
             Connecting to controllerObject.closeEditor causes a race condition
             with code in controllerObject._setUpNodeEditor that wires up closeEditor.
             Instead, we connect directly to the widget.
             */
            aspect.after(registry.byId('nodeeditor'), "hide", function(){
                console.log("Calling session.saveProblem");
                controllerObject.logging.log("ui-action", {node: "name of the node", tab:"last value checked", type:"dialog-box-tab"});
                session.saveProblem(givenModel.model);
            });

            // Wire up close button...
            // This will trigger the above session.saveProblem()
            on(registry.byId("closeButton"), "click", function(){
                registry.byId("nodeeditor").hide();
            });

	    
	    // Also used in image loading below.
            var descObj = new description(givenModel);
	    
            if(query.m == "AUTHOR"){
                var db = registry.byId("descButton");
	        db.set("disabled", false);
		
		// Description button wiring
		menu.add("descButton", function(){
                    registry.byId("authorDescDialog").show();
                });
                aspect.after(registry.byId('authorDescDialog'), "hide", function(){
                    console.log("Saving Description/Timestep edits");
                    descObj.closeDescriptionEditor();
                    session.saveProblem(givenModel.model);
                });
		on(registry.byId("descCloseButton"), "click", function(){
                    registry.byId("authorDescDialog").hide();
            });
         }

            /*
             Make model solution plot using dummy data. 
             This should be put in its own module.
             */


            // show graph when button clicked
             menu.add("graphButton", function(){
                console.debug("button clicked");
                // instantiate graph object
                var graph = new Graph(givenModel, query.m, session);
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
                var table = new Table(givenModel, query.m, session);
                
                table._logging.log('ui-action', {
                    type: "menu-choice", 
                    name: "table-button"
                });
                table.show();
            });


        menu.add("doneButton", function(){
            console.debug("done button is clicked");
            var problemComplete = givenModel.matchesGivenSolution();

            var promise = controllerObject.logging.log('close-problem', {
                type: "menu-choice", 
                name: "done-button", 
                problemComplete: problemComplete
            });
            
            promise.then(function(){
                window.history.back();
            });
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
		window.open("https://www.youtube.com/watch_popup?v=gsrM07XfABk","newwindow",
			    "height=400, width=600, toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
			   );
	    });

            /*
             BvdS:  this doesn't look quite right.  We want to download
             the image and then get its dimensions.  (This is a property of 
             the image object) and use the dimensions to place the description
             
             In AUTHOR mode, make image clickable or put in "click here" box.
             Also, make description clickable, with default text "click here".
             These will be wired up to dialog boxes to set the image URL and
             the description.
             */

            descObj.showDescription();

        });
    });
});
