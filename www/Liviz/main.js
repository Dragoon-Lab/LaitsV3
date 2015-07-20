"use strict";
var window = {};
if (!this.console) {
	this.console = { log: function(a) { sendLog(a); } };
}

// The layout engine/algorithm to be used.
// Should be either: "dot", "fdp", "sfdp", "neato", "twopi", or "circo".
var LAYOUT_ENGINE = "sfdp";
window.EmscriptenModule = {noInitialRun: true};

importScripts("./global-util.js?v=3");
importScripts("./stopgo.js?v=3");
importScripts("./progress-model.js?v=3");
importScripts("./graph-model.js?v=3");
importScripts("./errorsink.js?v=3");

if(LAYOUT_ENGINE == "fdp")
{ // import fdp layout engine
    importScripts("./em-fdpgen.min.js?v=3");
}
else if(LAYOUT_ENGINE == "sfdp")
{ // import sfdp layout engine
    importScripts("./em-sfdpgen.min.js?v=3");
}
else if(LAYOUT_ENGINE == "neato")
{ // import neato layout engine
    importScripts("./em-neatogen.min.js?v=3");
}
else if(LAYOUT_ENGINE == "twopi")
{ // import twopi layout engine
    importScripts("./em-twopigen.min.js?v=3");
}
else if(LAYOUT_ENGINE == "circo")
{ // import circo layout engine
    importScripts("./em-circogen.min.js?v=3");
}
else
{ // import dot layout engine
    importScripts("./em-dotgen.min.js?v=3");
}

var emModule = null;
var workerGlobal = this;
var print = function(msg) { throw ("BAD PRINT!: " + msg); };
var STOP_FUNC_LABEL, SENDRK_FUNC_LABEL;
var nodeNameMap = {__proto__:null};

var GV = {
	gvc: null,
	verbose: 0,
	pGraph: null,
	errorSink: null,
	rankMap: {},
	edgeList: [],
	progressList: [],
	prevSent: 0,
	useProgress: false
};

var theStopGo = new WorkerStopGo.Worker(this, function(stopgo){
	runDotLayout();
	stopgo.setCompleted();
});

// OUTGOING MESSAGES - - - - - - - -

function afterInit() {
	postArgMessage(workerGlobal, "afterInit"); }
function afterSetupGVContext(param) {
	postArgMessage(workerGlobal, "afterSetupGVContext", param); }
function afterRunDotLayout(param) {
	postArgMessage(workerGlobal, "afterRunDotLayout", param); }
function afterErrorCheck(param) {
	postArgMessage(workerGlobal, "afterErrorCheck", param); }
function sendProgressMessage(param) {
	postArgMessage(workerGlobal, "sendProgress", param); }
function initializeNodePosition(param) {
	postArgMessage(workerGlobal, "initializeNodePosition", param); }
function sendLog(s) {
	postArgMessage(workerGlobal, "log", s); }

// INCOMING MESSAGES - - - - - - - -
addEventListener("message", function(event){
	var etype  = event.data.type;
	var arg0   = event.data.arg0 || null;

	switch(etype) {
	case "init":
		initDotgenWorker();
		break;
	case "setWorkerSTDIN":
		emModule.setStdinArray(arg0.split(/[\r\n]+/));
		break;
	case "setupGVContext":
		setupGVContext(arg0);
		break;
	}
}, false);

function initDotgenWorker() {
	emModule = window.EmscriptenModule;
	STOP_FUNC_LABEL   = emModule.addFunctionEntry();
	SENDRK_FUNC_LABEL = emModule.addFunctionEntry();

	GV.errorSink = new window.JSViz.ErrorSink(emModule);
	afterInit();
}

function setupGVContext(options) {
	GV.useProgress = options.prog;
	emModule.forceRewindStdin();
	GV.gvc = emModule._prepareGVContext();
	GV.errorSink.clear();
	var g_ptr = emModule._beginGVJob(GV.gvc, GV.verbose, GV.errorSink.funcLabel);
	GV.errorSink.checkGraph(emModule, g_ptr);
	afterErrorCheck(GV.errorSink.stringify());
	GV.pGraph = g_ptr;
	afterSetupGVContext( GV.errorSink.stringify() );
}

function shouldStopLayout(progress) {
	sendLog("SS : "+ progress);

	if (GV.useProgress) {
		initRankNodePool();
		emModule._extractRanks(GV.pGraph, SENDRK_FUNC_LABEL);
		//emModule._extractEdgesEarly(GV.pGraph, SENDEG_FUNC_LABEL);
		addProgressData(progress);
	}
	
	return theStopGo.shouldStop() ? 1 : 0;
}

function runDotLayout() {
	emModule.FUNCTION_TABLE[ STOP_FUNC_LABEL   ] = shouldStopLayout;
	emModule.FUNCTION_TABLE[ SENDRK_FUNC_LABEL ] = recvRankNode;
	clearProgressList();
	
	emModule._runDotLayout(GV.pGraph, GV.gvc, STOP_FUNC_LABEL);
	var extractor = new window.JSViz.GraphExtractor();
	extractor.extract(emModule, GV.pGraph, true);
	
	var node;
	for (var i in extractor.g.nodeMap)
	{
		node = extractor.g.nodeMap[i];
		
		if(!!node)
		{
			nodeNameMap[node.name] = node;
			
			initializeNodePosition(JSON.stringify({"name": node.name, "x": node.sx, "y": node.sy}));
		}
	}
	
	var ginfo = {
		type: "G",
		displayWidth:  emModule._getGraphWidth(GV.gvc),
		displayHeight: emModule._getGraphHeight(GV.gvc)
	};
	
	afterRunDotLayout(extractor.stringify(ginfo));
}

function clearProgressList() {
	GV.progressList.length = 0;
	GV.prevSent = 0;
}

function initRankNodePool() {
	GV.edgeList.length = 0;
	var m = GV.rankMap;
	for (var i in m) {delete m[i];}
}

function recvRankNode(rankIndex, pNode, isVirtual, coordX) {
	var m = GV.rankMap;
	
	if (!m[rankIndex]) {
		m[rankIndex] = [];
	}
	
	m[rankIndex].push({ptr: pNode, v: isVirtual, x: coordX});
}

function addProgressData(progressState) {
	var pg = new window.JSViz.ProgressModel(progressState);
	pg.registerNodes(GV.rankMap, emModule);
	//pg.registerEdges(GV.edgeList);
	GV.progressList.push(pg);
	
	sendProgress();
}

function sendProgress() {
	var PG_INTERVAL = 450;
	var nomore = true;
	var ls = GV.progressList;
	var t = new Date();
	
	if (ls.length) {
		if ((t - GV.prevSent) > PG_INTERVAL) {
			var pg = ls.shift();
			sendProgressMessage(pg.stringify());
			GV.prevSent = t;
		}
		nomore = false;
	}
	
	if (!nomore) {
		setTimeout(sendProgress, 50);
	}
}