
var cmdLineArgs = require('command-line-args');
var cmdLineUsage = require('command-line-args');
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

// exec for running system commands
var exec = require('child_process').exec;

//Setup initial variables
var Mocha = require('mocha');
var Suite = Mocha.Suite;
var Test = Mocha.Test;

//Define command line options
var cli = cmdLineArgs([
	{name: "target", alias: "t",  type: String,  defaultValue: "local", description:"Optional, Defaut Value: local"},
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
	console.log("Please provide valid options: (Only -p is required others are optional) ");
	return;
}

//Start Selenium
var startSelenium = function(){
	console.log("Starting Selenium ....");
	var cmd = 'java -jar ../selenium-server-standalone-2.46.0.jar -log selenium.log &';

	exec(cmd, function(error, stdout1, stderr1) {
		if(!error){
		}
	});
	//Hack to start Selenium in one run by executing same command twice.
	exec(cmd, function(err, stdout2, stderr2) {
		if(!err){
			next();
		}
	});

};

startSelenium();

//Fetch the problem
var options = cli; //.parse();
var problems = options.problem.split(" ").join("");
var problemIndex = 0;
problems = problems.split(",");
var next = function(){
	if(problems[problemIndex]) {
		options.problem = problems[problemIndex];
		fetchProblem(options);
		problemIndex++;
	}else{
		stopSelenium();
	}

};


function stopSelenium(){
	var cmd = "curl localhost:4444/selenium-server/driver/?cmd=shutDownSeleniumServer";
	exec(cmd, function(error, stdout1, stderr1) {
		if(!error){
			console.log("Selenium shutdown");
		}
	});
}

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
	console.log("Fetching: "+ host + "task_fetcher.php" + url);
	request({ url: host + "task_fetcher.php" + url},  function(error, response, body) {
		 if(body){
			//Generate the test based on activity
			 if(options.activity === "construction") {
				 generateConstructionTests(options, body);
			 }else if(options.activity === "waveform"){
				 generateWaveformTests(options, body);
			 }else if(options.activity === "incremental"){
				 generateIncrementalTests(options, body);
			 }
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
		//console.log(model);
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
	var createNodesSuite = generateCreateAndCheckNodeTests();
	parentSuite.addSuite(createNodesSuite);
	var checkNodeBorders = generateCorrectNodeBorderAndColorTest();
	parentSuite.addSuite(checkNodeBorders);
	var checkGraphWindow = generateGraphWindowTest();
	parentSuite.addSuite(checkGraphWindow);

	parentSuite.afterAll(async(function(){
		dtest.endTest(client);
		//Test next problem
		next();
	}));

	mocha.run();
}

function generateCreateAndCheckNodeTests(){
	var mocha = new Mocha({
		timeout: 20000
	});
	var createNodesSuite = "Create Nodes and Check Values:";
	var suite = Suite.create(mocha.suite, createNodesSuite);

	var queue = [];
	var visited = [];
	this.nodesToCheck = [];
	var rootNode = getRootNode();
	//Create Root Node
	if(rootNode) {
		queue.push(rootNode);
	}else{
		console.error("No root node found");
		return;
	}
	//push given student nodes to visited
	if(this.problem.task.studentModelNodes.length > 0){
		this.problem.task.studentModelNodes.forEach(function(node){
			visited.push(node.descriptionID);
		});
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
					//Check Values
					checkNodeValues(node);

				})));
			})(node);
			//Add to visited
			visited.push(node.ID);
			this.nodesToCheck.push(node.name);
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
	var mocha = new Mocha({
		timeout: 25000
	});
	var checkNodesSuite = "Check Node border and colors:";
	var suite = Suite.create(mocha.suite, checkNodesSuite);
	var testName = "Nodes should have correct border and fill colors";
	var that = this;
	suite.addTest(new Test(testName, async(function(){
		that.nodesToCheck.forEach(function(element){
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
// Waveform Functions
////////////////////////////////////////////////////////////////////////////////////////////////////
function generateWaveformTests(options, model){
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

	var suiteName = "Waveform - "+ options.mode + " Mode  " + this.problem.task.taskName;
	var parentSuite = Suite.create(mocha.suite, suiteName);

	parentSuite.beforeAll("Open Problem", async(function (done) {
		dtest.openProblem(client,[["user", options.user], ["problem", options.problem],["mode", options.mode],
			["activity", options.activity],
			["section", options.section],
			["logging", options.logging]]);
	}));
	//Create Nodes
	var selWaveformSuite = generateSelectWaveformTests();
	parentSuite.addSuite(selWaveformSuite);

	parentSuite.afterAll(async(function(){
		dtest.endTest(client);
		//Test next problem
		next();
	}));

	mocha.run();
}

function generateSelectWaveformTests(){

	var mocha = new Mocha({
		timeout: 25000
	});
	var selectWaveformSuite = "Select Waveform for nodes:";
	var suite = Suite.create(mocha.suite, selectWaveformSuite);

	//push given student nodes to visited
	if(this.problem.task.givenModelNodes.length > 0){
		this.problem.task.givenModelNodes.forEach(function(node){
			if(node.waveformValue) {
				//Node Test
				var testName = "Should select " + node.waveformValue + " node - " + node.name;
				(function (node) {
					suite.addTest(new Test(testName, async(function () {
						if (dtest.nodeExists(client, node.name)) {
							openNodeEditor(node.name);
						}
						//Fill node waveform
						selectNodeWaveform(node);

						//Check Node border and color
						atest.checkNodeValue(dtest.getNodeBorderColor(client, node.name), "green", "net growth border");
						atest.checkNodeValue(dtest.getNodeFillColor(client, node.name), "green", "net growth fill");
					})));
				})(node);
			}
		});
	}

	suite.addTest(new Test("Should show Done message and close", async(function(){
			// close done window
			assert(dtest.isDonePopupVisible(client), "The Done hint popup is not visible, but it should be!");
			dtest.closeMenuDonePopup(client);
		})
	));

	return suite;
}

function selectNodeWaveform(node){
	if(node && node.waveformValue) {
		dtest.selectWaveform(client, node.waveformValue);
	}
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// Incremental Functions
////////////////////////////////////////////////////////////////////////////////////////////////////
function generateIncrementalTests(options, model){
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

	var suiteName = "Incremental - "+ options.mode + " Mode  " + this.problem.task.taskName;
	var parentSuite = Suite.create(mocha.suite, suiteName);

	parentSuite.beforeAll("Open Problem", async(function (done) {
		dtest.openProblem(client,[["user", options.user], ["problem", options.problem],["mode", options.mode],
			["activity", options.activity],
			["section", options.section],
			["logging", options.logging]]);
	}));
	//Create Nodes
	var selIncSuite = generateSelectIncrementalTests();
	parentSuite.addSuite(selIncSuite);

	parentSuite.afterAll(async(function(){
		dtest.endTest(client);
		//Test next problem
		next();
	}));

	mocha.run();
}

function generateSelectIncrementalTests() {

	var mocha = new Mocha({
		timeout: 25000
	});
	var selectWaveformSuite = "Select Waveform for nodes:";
	var suite = Suite.create(mocha.suite, selectWaveformSuite);

	////push given student nodes to visited
	if(this.problem.task.givenModelNodes.length > 0){
		this.problem.task.givenModelNodes.forEach(function(node){

			//Node Test
			var testName = "Should select option" + " node - " + node.name;
			(function (node) {
				if(!node.genus || node.genus == "required") {
					suite.addTest(new Test(testName, async(function () {
						var nodeBorderStyle = dtest.getNodeBorderStyle(client, node.name);
						var nodeBorderColor = dtest.getNodeBorderColor(client, node.name);
						while (dtest.nodeExists(client, node.name) && (nodeBorderStyle !== "solid" || nodeBorderColor == "red")) {
							openNodeEditor(node.name);
							//Fill node waveform
							selectNodeIncremental(node);
							nodeBorderStyle = dtest.getNodeBorderStyle(client, node.name);
							nodeBorderColor = dtest.getNodeBorderColor(client, node.name);
						}
					})));
				}
			})(node);


		});
	}


	suite.addTest(new Test("Should show Done message and close", async(function(){
			// close done window
			assert(dtest.isDonePopupVisible(client), "The Done hint popup is not visible, but it should be!");
			dtest.closeMenuDonePopup(client);
		})
	));

	var that = this;

	suite.addTest(new Test("Should check if all nodes are complete", async(function(){
			if(that.problem.task.givenModelNodes.length > 0){
				that.problem.task.givenModelNodes.forEach(function(node) {
					if(!node.genus || node.genus == "required") {
						var nodeBorderStyle = dtest.getNodeBorderStyle(client, node.name);
						assert(nodeBorderStyle === "solid", "Node " + node.name + " is not complete");
					}
				});
			}
		})
	));

	return suite;
}

function selectNodeIncremental(node){
	var opt = Math.floor(Math.random()*4);
	//Randomly select the option from incremental editor
	if(node) {
		if(opt == 0){
			dtest.clickIncrementalDecrease(client);
		}else if(opt == 1){
			dtest.clickIncrementalIncrease(client);
		}else if(opt == 2){
			dtest.clickIncrementalStaysSame(client);
		}else{
			dtest.clickIncrementalUnknown(client);
		}
	}
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

	if(!(dtest.isNodeTypeDisabled(client) && assertCorrectField(node.name , "type", dtest.getNodeTypeColor(client)))) {
		var typeValue = node.type.charAt(0).toUpperCase() + node.type.slice(1);
		dtest.setNodeType(client, typeValue);
		if(dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}

	if(node.type !== "function" && !(dtest.isNodeInitialValueDisabled(client) && assertCorrectField(node.name , "initial", dtest.getNodeInitialValueColor(client)))) {
		dtest.setNodeInitialValue(client, node.initial);
		if (dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}

	if(node.units && node.units !== "" && !(dtest.isNodeUnitsDisabled(client) && assertCorrectField(node.name, "units", dtest.getNodeUnitsColor(client)))) {
		dtest.setNodeUnits(client, node.units);
		if(dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}
	if(node.type !== "parameter" && !(dtest.isNodeExpressionDisabled(client) && assertCorrectField(node.name, "equation", dtest.getNodeExpressionColor(client)))) {
		var nodeExp = node.equation.split(' ').join('');
		dtest.setNodeExpression(client, parseExpression(node, nodeExp));
		dtest.checkExpression(client);
		if (dtest.isCrisisPopupVisible(client)) {
			dtest.popupWindowPressOk(client);
		}
	}
}

function checkNodeValues(/*Object*/node){
	//dtest.openEditorForNode(client, node.name);

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
				//Find all ids in the equation
				var regexp = "(id[0-9]+)";
				var re = new RegExp(regexp, 'g');
				var givenModelNodes = this.problem.task.givenModelNodes;
				// replace all occurrences of each id in the equation
				var ids = equation.match(re);
				ids.forEach(function(id){
					var inputNode = null;
					// Find matching givenmodel node
					givenModelNodes.forEach(function (n) {
						if (n.ID === id) {
							inputNode = n;
						}
					});
					//Replace each occurrence of id with its name
					equation = equation.replace(new RegExp(id+"([^0-9]|$)", 'g'), function(m){
						if(Math.floor(m[m.length-1]) == m[m.length-1]){
							return inputNode.name ;
						}else{
							return inputNode.name + m[m.length-1];
						}

					});
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

function assertCorrectField(nodeName, field, color){
	assert(color === "green", field + "for "+ nodeName +" is disabled but contains an incorrect value");
}