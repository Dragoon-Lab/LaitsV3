/* global define, Image */
define([
    "dojo/dom",
    "dojo/on",
    "dojo/io-query",
    "dojo/ready",
    "./menu",
    "./load-save",
    "./model",
    "./RenderGraph", "./RenderTable", "./wraptext", 
    "./controller",
    "parser/parser",
    "./draw-model" 
],function(dom, on, ioQuery, ready, menu, loadSave, model, Graph, Table, wrapText, controller, Parser, drawmodel){ 

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

	var givenModel = new model();
	givenModel.loadModel(solutionGraph);
	
	
	/*
	@author: Deepak
	@brief: code for calculating the given and student solution.This code should be moved to calculatin.js
	*/
	
	
	
	var i=0;
	//get all nodes of given model
	var givenModelNodes;
	//get time parameters
	var startTime,endTime,timeStep;
	var expr,variable;
	//use this object to store current key/value pair of value of nodes e.g{id1:100,id2:200}
	var currentNodeValues = {};
	//create this object to store key/value pair of node equations
	var nodeEquations = {};
	//object to store array of values of nodes based on steps
	var arrayOfNodeValues = {};
	//array of name of 'parameter' nodes.this array is passed to 'graph' to place sliders
	var arrayOfParameterNames = {};
	//array of initial values of parameters
	var arrayOfParamInitialValues = {};
	//array of units of all nodes
	var arrayOfUnits = {};
	givenModelNodes = givenModel.getNodes();
	
	startTime = givenModel.getStartTime();
	endTime = givenModel.getEndTime();
	timeStep = givenModel.getTimeStep();
		
	//function to calculate no of 'parameter' nodes in graph
	var storeParametersNameValue = function(_givenModelNodes)
	{
		var i,count=0;
		for(i=0;i<_givenModelNodes.length;i++)
		{
			if(_givenModelNodes[i].type == 'parameter')
			{
				arrayOfParameterNames[_givenModelNodes[i].ID] = _givenModelNodes[i].name;
				arrayOfParamInitialValues[_givenModelNodes[i].ID] = _givenModelNodes[i].initial;
				count++;
			}
		}
		return count;
	};
	
	
	//this is a function used to find initial values of node of type function
	var calcNULLNodeValue = function(nodeID)
	{
		//object for storing values of variables to be passed to expression
		var _exprValues = {};
		var _expr,_variable,_k,_value;
		_expr = Parser.parse(nodeEquations[nodeID]);
		_variable = _expr.variables();
		for(_k=0;_k<_variable.length;_k++)
		{
			if(currentNodeValues[_variable[_k]] == null)
			{
					calcNULLNodeValue(_variable[_k]);
			}
			_exprValues[_variable[_k]] = currentNodeValues[_variable[_k]];
		}
		_value = _expr.evaluate(_exprValues);
		currentNodeValues[nodeID] = _value;
		
		return _value;
		
	};
	
	//get all node equations. Put this code in a function getNodEquation(givenModelNodes)
	for(i=0;i<givenModelNodes.length;i++)
	{
		nodeEquations[givenModelNodes[i].ID] = givenModel.getNodeEquation(givenModelNodes[i].ID);
	}
	
	//put this code in a function 'getInitialNodeValues(givenModelNodes)' to setup 'currentNodeValues' variable above to initial values
	for(i=0;i<givenModelNodes.length;i++)
	{
		currentNodeValues[givenModelNodes[i].ID] = givenModel.getNodeInitial(givenModelNodes[i].ID);
	}

	//create an array belonging to every node to store step values
	for(var j=0;j<givenModelNodes.length;j++)
	{
		if(givenModelNodes[j].type != 'parameter')
		{
			arrayOfNodeValues[givenModelNodes[j].ID] = new Array();
		}
	}
	
	/* calculate initial values of all nodes which are null */
	for(j=0;j<givenModelNodes.length;j++)
	{
		var _v;
		if(currentNodeValues[givenModelNodes[j].ID] == null)
		{
			_v = calcNULLNodeValue(givenModelNodes[j].ID);
		}
		else
		{
			_v = givenModelNodes[j].initial;
		}
		if(givenModelNodes[j].type != 'parameter')
		{
			arrayOfNodeValues[givenModelNodes[j].ID].push(_v);
		}	
	}
	
	//put this code in function calculateStepValues()
	for(i=1;i<(endTime-startTime)/timeStep;i++)
	{
		for(j=0;j<givenModelNodes.length;j++)
		{
			if(givenModelNodes[j].type != 'parameter')
			{
				arrayOfNodeValues[givenModelNodes[j].ID].push(calcNULLNodeValue(givenModelNodes[j].ID));
			}
		}
	}
	
	
	/*
	 start up controller
	 */
	 
	ready(function(){
	var drawModel = new drawmodel(givenModel);
	var controllerObject  = new controller(givenModel);

	/* add to menu */
	menu.add("createNodeButton", function(){
	    controllerObject.showNodeEditor();
	});

	/*
	 It would make more sense to call initHandles for each node as it is created
         on the canvas.
	 
	 In AUTHOR mode, this will break, since we want the solution
	 graph in that case.  See trello card https://trello.com/c/TDWdq6q6
	 */
	controllerObject.initHandles();
	
	/*
	 Make model solution plot using dummy data. 
	 This should be put in its own module.
	 */
	
	
	    // dummy parameter to be passed to graph class
		var noOfParams = storeParametersNameValue(givenModelNodes);;
	    
	    // values of parameters
	    //var paramValue = ['A','B','C'];
		var paramNames = arrayOfParameterNames;
		var paramValue = arrayOfParamInitialValues;
		var nodeValueArray = arrayOfNodeValues;
		var units = givenModel.getEachNodeUnits();
	        var xunits = givenModel.getUnits();
	    var slider = new Array();
	    
	    // instantiate graph object
	    var graph = new Graph(noOfParams,paramNames,paramValue,nodeValueArray,units,xunits);
	    
	    // show graph when button clicked
	    menu.add("graphButton",function(){
		console.debug("button clicked");	   
		graph.show();
	    }); 
	    
	    //dummy parameter to be passed to graph class
	    var inputParam = 5;
	    // values of parameters
	    paramValue = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
	    var tableHeader = ['time','Param1','Param2','Param3','Param4'];
	    slider = new Array();
	
	    // instantiate graph object
	    var table = new Table(inputParam,tableHeader,paramValue);
	
	    // show graph when button clicked
	    menu.add("tableButton", function(){        	
		console.debug("table button clicked");
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
      	imageObj.src = givenModel.getURL();

	});
    });    
});


