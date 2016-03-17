
var cmdLineArgs = require('command-line-args');
var http = require('http');
var testPath = require('./test-paths');
var request = require('request');


// import chai assertion library
var assert = require('chai').assert;
// import dragoon test library module
var dtest = require('./dtestlib.js');
// import dragoon assertion library
var atest = require('./assertTestLib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

//Setup initial variables
var Mocha = require('mocha');
var Suite = Mocha.Suite;
var Test = Mocha.Test;

//Define command line options
var cli = cmdLineArgs([
	{name: "target", alias: "t",  type: String,  defaultValue: "local", description:"Optional, DefauDefault Valuelt: local"},
	{name: "user", alias: "u", type: String, defaultValue: getDate(), description:"Optional, Default Value: timestamp"},
	{name: "problem", alias: "p",  type: String,  defaultValue: getDate(), description:"Required"},
	{name: "mode", alias: "m",  type: String, defaultValue: "STUDENT", description:"Optional, Default Value: STUDENT"},
	{name: "submode", alias: "b",  type: String, defaultValue: "algebraic", description:"Optional, Default Value: algebric"},
	{name: "section", alias: "s",  type: String, defaultValue: "autoTest", description:"Optional, Default Value: autoTest"},
	{name: "activity", alias: "a",  type: String, defaultValue: "construction", description:"Optional, Default Value: construction"},
	{name: "restart", alias:"r", type:String, defaultValue:"", description:"Optional, Default Value: false"},
	{name: "group", alias:"g", type:String, defaultValue:"", description:"Optional, Default Value: No Group provided"},
	{name: "logging", alias: "l", type: String, defaultValue: "", description:"Optional, Default Value: true"}
]);
//map of cli options -> url parameters
var urlParams = {
	"problem" : "p",
	"mode": "m",
	"submode": "sm",
	"section": "s",
	"activity": "a",
	"user" : "u",
	"restart" : "rp",
	"group" : "g",
	"logging": "l"
};

//create a global client
var client = require('webdriverio').remote({
	//logLevel: "verbose",
	desiredCapabilities: {
		// See other browers at:
		// http://code.google.com/p/selenium/wiki/DesiredCapabilities
		browserName: 'chrome'

	}
});

if(process.argv.length < 3){
	console.log("Please provide valid options: (Only -p is required others are optional) " +cli.getUsage());
	return;
}

//Fetch the problem
var options = cli.parse();
var problems = options.problem.split(" ").join("");
var problemIndex = 0;
problems = problems.split(",");
var next = function(){
	if(problems[problemIndex]) {
		options.problem = problems[problemIndex];
		fetchProblem(options);
		problemIndex++;
	}
};

//Start first Test
next();

function fetchProblem(options){
	if(!options.target || options.target == "local"){
		var localhost = testPath.getLocalPath();
		localhost = localhost.substring(0, localhost.lastIndexOf('/')+1);
	}
	//Build URL
	var url = "";
	for(var op in options){
		if(urlParams[op] && options[op]) {
			url += url === "" ? "?" : "&";
			url += urlParams[op] + "=" + options[op];
		}
	}
	var host = localhost || "https://dragoon.asu.edu/"+ options.target +"/";
	//console.log(host + "task_fetcher.php" + url);
	request({ url: host + "task_fetcher.php" + url},  function(error, response, body) {
		 if(body){
			//Generate the test
			 generateConstructionTests(options, body);
		 }
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Generate Test Cases -- Construction
////////////////////////////////////////////////////////////////////////////////////////////////////
function generateConstructionTests(options, model){

	var mocha = new Mocha({
		timeout: 15000
	});
	try{
		this.problem = JSON.parse(model);
	}
	catch(e){
		console.error("INVALID PROBLEM JSON: " + e);
		return;
	}

	var suiteName = options.mode + " Mode with correct " + this.problem.task.taskName;
	var parentSuite = Suite.create(mocha.suite, suiteName);

	parentSuite.beforeAll("Open Problem", async(function (done) {
		dtest.openProblem(client,[["user", options.user], ["problem", options.problem],["mode", options.mode],
			["section", options.section],
			["logging", options.logging]]);
	}));
	//Create Nodes
	var createNodesSuite = generateCreateNodeTests();
	parentSuite.addSuite(createNodesSuite);
	var checkNodeBorders = generateCorrectNodeBorderAndColorTest();
	parentSuite.addSuite(checkNodeBorders);
	var checkNodeValues = generateCorrectNodeValuesTest();
	parentSuite.addSuite(checkNodeValues);
	var checkGraphWindow = generateGraphWindowTest();
	parentSuite.addSuite(checkGraphWindow);

	parentSuite.afterAll(async(function(){
		dtest.endTest(client);
		//Test next problem
		next();
	}));

	mocha.run();
}

function generateCreateNodeTests(){
	var mocha = new Mocha({
		timeout: 15000
	});
	var createNodesSuite = "Create Nodes:";
	var suite = Suite.create(mocha.suite, createNodesSuite);

	var queue = [];
	var visited = [];

	var rootNode = getRootNode();
	var rootNodeCreated = false;
	//Create Root Node
	if(rootNode) {
		queue.push(rootNode);
		rootNodeCreated = true;
	}else{
		console.error("No root node found");
		return;
	}

	while(queue.length > 0){
		var node = queue.shift();
		if(node){
			//Node Test
			var testName = "Should create " + node.type + " node - " + node.name;
			(function(node) {
				suite.addTest(new Test(testName, async(function () {
					if(dtest.nodeExists(client, node.name)){
						openNodeEditor(node.name);
					}
					else {
						createNode(node);
					}
					//Fill node editor values
					fillNodeValues(node);

				})));
			})(node);
			//Add to visited
			visited.push(node.ID);

			//Add inputs to the queue
			node.inputs.forEach(function(input){
				if(visited.indexOf(input.ID) == -1){
					var nextNode = getNode(input.ID);
					if(nextNode !== null) {
						queue.push(nextNode);
					}
				}
			});
		}
	}

	suite.afterEach(async(function(){
		dtest.nodeEditorDone(client);
		if(dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}));
	return suite;
}

function generateCorrectNodeBorderAndColorTest(){
	var nodesToCheck = [];
	this.problem.task.givenModelNodes.forEach(function(node){
		if((!node.genus || node.genus === "required")){
			nodesToCheck.push(node.name);
		}
	});

	var mocha = new Mocha({
		timeout: 15000
	});
	var checkNodesSuite = "Check Node border and colors:";
	var suite = Suite.create(mocha.suite, checkNodesSuite);
	var testName = "Nodes should have correct border and fill colors";

	suite.addTest(new Test(testName, async(function(){
		nodesToCheck.forEach(function(element){
			//Gets values
			var nodeBorderColor = dtest.getNodeBorderColor(client, element);
			var nodeBorderStyle = dtest.getNodeBorderStyle(client, element);
			var nodeFillColor = dtest.getNodeFillColor(client, element);
			//Asserts values
			assert(nodeBorderColor === "green",
				"Node border color for " + element + " was " + nodeBorderColor + " instead of green");
			assert(nodeBorderStyle === "solid",
				"Node border style for " + element + " was " + nodeBorderStyle + " instead of solid");
			assert(nodeFillColor === "green",
				"Node fill color for " + element + " was " + nodeFillColor + " instead of green");
		});
	})));

	return suite;
}

function generateCorrectNodeValuesTest(){
	var mocha = new Mocha({
		timeout: 15000
	});
	var checkNodesSuite = "Check Node Values:";
	var suite = Suite.create(mocha.suite, checkNodesSuite);
	var testName = "Checking Node: ";

	this.problem.task.givenModelNodes.forEach(function(node){
		if(!node.genus || node.genus === "required") {
			(function (currentNode) {
				suite.addTest(new Test(testName + currentNode.name, async(function () {
					checkNodeValues(currentNode);
				})));
			})(node);
		}
	});

	suite.afterEach(async(function(){
		dtest.nodeEditorDone(client);
	}));

	return suite;
}

function generateGraphWindowTest(){
	var mocha = new Mocha({
		timeout: 15000
	});
	var checkGraphSuite = "Check Graph/Table Window: - Does not check graph/table values yet";
	var suite = Suite.create(mocha.suite, checkGraphSuite);
	var testName = "Should open Graph/Table window ";

	suite.addTest(new Test(testName, async(function(){
		dtest.menuOpenTable(client);
	})));

	testName = "Should switch to Graph tab ";

	suite.addTest(new Test(testName, async(function(){
		dtest.selectGraphTab(client);
	})));

	return suite;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////////////////////////

function createNode(/*Object*/node){
	dtest.menuCreateNode(client);
	if(!dtest.isNodeDescriptionDisabled(client)){
		dtest.setNodeDescription(client, node.description);
	}
	if(dtest.isCrisisPopupVisible(client)) {
		dtest.popupWindowPressOk(client);
	}
}

function openNodeEditor(/*String*/nodeName){
	dtest.openEditorForNode(client, nodeName);
}

function fillNodeValues(/*Object*/node){

	if(!dtest.isNodeTypeDisabled(client)) {
		var typeValue = node.type.charAt(0).toUpperCase() + node.type.slice(1);
		dtest.setNodeType(client, typeValue);
		if(dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}

	if(node.type !== "function" && !dtest.isNodeInitialValueDisabled(client)) {
		dtest.setNodeInitialValue(client, node.initial);
		if (dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}

	if(node.units && node.units !== "" && !dtest.isNodeUnitsDisabled(client)) {
		dtest.setNodeUnits(client, node.units);
		if(dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}
	if(node.type !== "parameter" && !dtest.isNodeExpressionDisabled(client)) {
		var nodeExp = node.equation.split(' ').join('');
		dtest.setNodeExpression(client, parseExpression(node, nodeExp));
		dtest.checkExpression(client);
		if (dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}
}

function checkNodeValues(/*Object*/node){
	dtest.openEditorForNode(client, node.name);

	var nodeValues = [];
	nodeValues.push(["nodeName", node.name]);

	nodeValues.push(["expectedDescription", node.description]);
	nodeValues.push(["expectedDescriptionColor", "green"]);

	var typeValue = node.type.charAt(0).toUpperCase() + node.type.slice(1);
	nodeValues.push(["expectedNodeType", typeValue]);
	nodeValues.push(["expectedTypeColor", "green"]);

	if(node.type !== "function") {
		nodeValues.push(["expectedInitialValue", node.initial+""]);
		nodeValues.push(["expectedInitialColor", "green"]);
	}

	if(node.units && node.units !== "") {
		nodeValues.push(["expectedNodeUnits", node.units]);
		nodeValues.push(["expectedUnitsColor", "green"]);
	}

	if(node.type !== "parameter") {
		var nodeExp = node.equation.split(' ').join('');
		nodeValues.push(["expectedExpression", parseExpression(node, nodeExp)]);
		nodeValues.push(["expectedExpressionColor", "green"]);
	}
	atest.checkNodeValues(nodeValues, dtest, client);
}

function getNode(/*String*/id){
	// Return node object for given node ID
	var node = null;
	this.problem.task.givenModelNodes.forEach(function(n){
		if(n.ID === id){
			node = n;
		}
	});
	return node;
}

function parseExpression(/*Object*/node, /*String*/equation){
	//Summary:
	//Replaces the node id with node names in the equation
	//does note check validity of the equation

	if(typeof equation !== "undefined" && equation != ""){
		node.inputs.forEach(function(input){
			var inputNode = null;
			this.problem.task.givenModelNodes.forEach(function(n){
				if(n.ID === input.ID){
					inputNode = n;
				}
			});
			if(inputNode){
				var name = inputNode.name;
				var regexp = "(" + input.ID + ")([^0-9]?)";
				var re = new RegExp(regexp);
				equation = equation.replace(re, name + "$2");
			}
		});
		return equation;
	}
	return "";
}

function getRootNode(){
	//Summary:
	//Returns a root node of the model
	//Root node is marked with property 'parentNode' : true
	//Returns null if no root node is found.

	var rootNode = null;
	this.problem.task.givenModelNodes.forEach(function(node){
		if(node.parentNode && (!node.genus || node.genus == "required")){
			rootNode = node;
		}
	});

	return rootNode;
}

function getDate(){
	// Returns formatted date time - used as unique username
	var date = new Date();
	var dd = date.getDate();
	var mm = date.getMonth()+1;
	var yyyy = date.getFullYear();
	var seconds = Math.floor(date.getTime()/1000);

	date = mm+'/'+dd+'/'+yyyy+'/'+seconds;
	return date;
}

