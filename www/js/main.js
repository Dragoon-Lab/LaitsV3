/* global define */
define([
    "dojo/dom",
    "dojo/on",
    "dojo/io-query",
    "dojo/ready",
    "./load-save",
    "./model",
    "./RenderGraph", "./RenderTable", "./wraptext"
],function(dom, on, ioQuery, ready, loadSave, model, Graph, Table, wrapText){ 
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
    session.loadProblem(query).then(function(solutionGraph){
	console.info("Have solution: ", solutionGraph);
	
	/*
	 Make model solution plot using dummy data. 
	 This should be put in its own module.
	 */
	
	ready(function(){
	    // dummy parameter to be passed to graph class
	    var inputParam = 3;
	    // values of parameters
	    var paramValue = ['A','B','C'];
	    var slider = new Array();
	    var button = dom.byId("graphButton");
	    
	    // instantiate graph object
	    var graph = new Graph(inputParam,paramValue);
	    
	    // show graph when button clicked
	    on(button,"click",function(){
		console.debug("button clicked");	   
            graph.show();
	    }); 
	    
	    //dummy parameter to be passed to graph class
	    inputParam = 5;
	    // values of parameters
	    paramValue = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	    var tableHeader = ['time','Param1','Param2','Param3','Param4'];
	    slider = new Array();
	    button = dom.byId("tableButton");
	
	    // instantiate graph object
	    var table = new Table(inputParam,tableHeader,paramValue);
	
	    // show graph when button clicked
	    on(button,"click",function(){        	
		console.debug("table button clicked");
		table.show();
	    });

	    var givenmodel = new model();
	    givenmodel.loadModel(solutionGraph);
	    var canvas = document.getElementById('myCanvas');
      	var context = canvas.getContext('2d');
      	var imageObj = new Image();
      	var desc_text = givenmodel.getTaskDescription();

      	imageObj.onload = function() {
        	context.drawImage(imageObj, 69, 50);
        	wrapText(context, desc_text, 70, 400, 400, 20)
      	};
      	imageObj.src = givenmodel.getURL();

		 
	});
    });    
});


