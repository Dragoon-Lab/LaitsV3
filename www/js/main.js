/* global define, Image */
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
    "./RenderGraph", "./RenderTable", "./wraptext", 
    "./controller",
    "parser/parser",
    "./draw-model",
    "./calculations",
    "./logging",
    './author'
],function(
    lang, dom, geometry, on, aspect, ioQuery, ready, registry, 
    menu, loadSave, model, 
    Graph, Table, wrapText, controller, Parser, drawmodel, calculations, logging, author
){ 
    
    console.log("load main.js");
    
    // Get session parameters
    var query={};
    if(window.location.search){
	query = ioQuery.queryToObject(window.location.search.slice(1));
    } else {
        console.warn("Should have method for logging this to Apache log files.");
        console.warn("Dragoon log files won't work since we can't set up a session.");
	console.error("Function called without arguments");
    }
    
    // Start up new session and get model object from server
    var session = new loadSave(query);	   
    logging.setSession(session);  // Give logger message destination
    session.loadProblem(query).then(function(solutionGraph){

	var givenModel = new model(query.m);
	givenModel.loadModel(solutionGraph);

	/*
	 start up controller
	 */
	 
	ready(function(){
	    
	    var drawModel = new drawmodel(givenModel);
	    /* 
	     The sub-mode of STUDENT mode can be either "feedback" or "power"
	     This is eventually supposed to be supplied by the student model.
	     In the mean time, allow it as a GET parameter.
	     */
	    var subMode = query.sm || "feedback";
	    var controllerObject  = new controller(query.m, subMode, givenModel);
	    controllerObject._PM.setLogging(session);  // Set up direct logging in PM
	    
	    /* add "Create Node" button to menu */
	    menu.add("createNodeButton", function(){
		var id = givenModel.active.addNode();
		drawModel.addNode(givenModel.active.getNode(id));
		controllerObject.showNodeEditor(id);
	    });

	    /* 
	     Set up author-mode stuff
	     */
	    registry.byId("authorMenu").set("disabled", query.m != 'AUTHOR');
	    if(query.m == 'AUTHOR')
		author.setup(menu, givenModel);
	    
	    /*
	     Connect node editor to "click with no move" events.
	     */
	    aspect.after(drawModel, "onClickNoMove", function(mover){
            if(mover.mouseButton!=2) //check if not right click
		        controllerObject.showNodeEditor(mover.node.id);
	    }, true);
	    
	    /* 
	     After moving node, save coordinates to model, and autosave
	     */	     
	    aspect.after(drawModel, "onClickMoved", function(mover){
		var g = geometry.position(mover.node, true);  // take into account scrolling
		console.log("Update model coordinates for ", mover.node.id, g);
		console.warn("This should take into account scrolling, Bug #2300.");
		givenModel.setStudentNodeXY(mover.node.id, g.x, g.y);
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
	     */
	    aspect.after(controllerObject, 'closeEditor', function(){
		session.saveProblem(givenModel.model);
	    });
	    
	    /*
	     Make model solution plot using dummy data. 
	     This should be put in its own module.
	     */	
	    
	    
	    // show graph when button clicked
	    menu.add("graphButton",function(){
		console.debug("button clicked");
		
		var calc = new calculations(solutionGraph,true);
		var obj = calc.gerParametersForRendering(solutionGraph,true);
		
		// instantiate graph object
		var graph = new Graph(obj);
		graph.show();
	    }); 
	    
	    
	    // show table when button clicked
	    menu.add("tableButton", function(){        	
		console.debug("table button clicked");
		
		var calc = new calculations(solutionGraph,true);
		var obj = calc.gerParametersForRendering(solutionGraph,true);
		
		var table = new Table(obj);
		table.show();
	    });
	    
	    var canvas = document.getElementById('myCanvas');
      	    var context = canvas.getContext('2d');
      	    var imageObj = new Image();
      	    var desc_text = givenModel.getTaskDescription();
	    
      	    imageObj.onload = function() {
        	context.drawImage(imageObj, 69, 50);
        	wrapText(context, desc_text, 70, 400, 400, 20);
      	    };
      	    imageObj.src = givenModel.getImageURL();
	    
	});
    });    
});


