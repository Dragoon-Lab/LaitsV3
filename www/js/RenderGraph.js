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
/**
 * @author: Deepak Bhosale
 * @brief: Graph rendering and related functions
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	'dojo/dom-attr',
	"dijit/registry",
	"dijit/form/ComboBox",
	"dojo/store/Memory",
	"dojox/charting/Chart",
	"dojox/charting/axis2d/Default",
	"dojox/charting/plot2d/Lines",
	"dojox/charting/plot2d/Grid",
	"dojox/charting/widget/Legend",
	"./calculations",
	"./logging",
	"dijit/_base",
	"dijit/layout/ContentPane",
	"./message-box",
	"dojo/dom",
	"dojo/dom-style",
	"dojo/dom-class",
	"./integrate",
	"dijit/Dialog",
	"dijit/layout/TabContainer",
	"dojo/domReady!"
], function(array, declare, lang, on, domAttr, registry, ComboBox, Memory, Chart, Default, Lines, Grid, Legend, calculations, logger, base, contentPane, messageBox, dom, domStyle, domClass, integrate, Dialog){

	// The calculations constructor is loaded before the RenderGraph constructor
	return declare(calculations, {
		dialogWindow: null,								// Solution Graph window
		type: "Graph",									//Rendering type
		textBoxID: "textGraph",							//ID for text-box DOM
		sliderID: "sliderGraph",						//ID for slider DOM
		chart: {},										//Object of a chart
		activeSolution: null,							//Current Active Solution
		givenSolution: null,							//Author solution

		charts: {},
		legends: {},
		legendStatic: {},
		chartsStatic: {},

		/*
		 *	@brief:constructor for a graph object
		 *	@param: noOfParam
		 */
		constructor: function(model, mode, logging, buttonClicked, activityConfig){
			this.buttonClicked = buttonClicked;
			this.activityConfig = activityConfig;
			logger.setSession(logging);
			console.log("***** In RenderGraph constructor");
			console.log(logging);
			//this.resizeWindow();
			if(this.active.timeStep){  // Abort if there is an error in timestep.
				this.initialize();
			}
		},

		setStateGraph : function(state) {
			this.setState(state);
		},

		initialize: function() {
			console.log("graphing");

			this.dialogWindow = registry.byId("solution");
			this.hideCallback = on(this.dialogWindow, "hide", lang.hitch(this, function(){
				this.closeDialog();
			}));

			var errorMessage = "";
			dom.byId("graphErrorMessage").innerHTML = "";
			dom.byId("SliderPane").innerHTML = "";

			this.tabContainer = registry.byId("GraphTabContainer");
			this.graphTab = registry.byId("GraphTab");
			this.tableTab = registry.byId("TableTab");

			domStyle.set(this.tabContainer.domNode, "display", "none");

			//create tab for table, chose to have it selected or not based on the button clicked by user
			if(this.buttonClicked == "graph")
				this.tabContainer.selectChild(this.graphTab);
			if(this.buttonClicked == "table")
				this.tabContainer.selectChild(this.tableTab);


			/* List of variables to plot: Include functions */
			this.active.plotVariables = this.active.timeStep.xvars.concat(this.active.timeStep.functions);
			this.plotVariables = this.active.plotVariables;

			//Checks if the mode is not in author mode, if not in author mode, find the "given" solution
			if (this.mode != "AUTHOR" && this.mode != "ROAUTHOR") {
				//check for author mode. Here we need to create just one graph.
				this.given.plotVariables = array.map(this.active.plotVariables, function (id) {
					var givenID = this.model.active.getDescriptionID ?
						this.model.active.getDescriptionID(id) : id;

					// givenID should always exist.
					console.assert(givenID, "Node '" + id + "' has no corresponding given node");
					var givenNode = this.model.given.getNode(givenID);
					return givenNode && ((!givenNode.genus || givenNode.genus === "required" || givenNode.genus === "allowed") ? givenID : null);
				}, this);

				//Calculate solutions for given model
				this.givenSolution = this.findSolution(false, this.given.plotVariables);
			}

			/*
			 Match list of given model variables.
			 If the given model node is not part of the given solution,
			 set variable to null to indicate that it should not
			 be calulated.

			 To include optional nodes,
			 one would need to order them using topologicalSort
			 */
			this.activeSolution = this.findSolution(true, this.active.plotVariables);
			console.log(this.activeSolution);
			if (this.activeSolution.status == "error" && this.activeSolution.type == "missing") {
				// Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
				errorMessage = this.generateMissingErrorMessage(this.activeSolution); //We show the error message like "A Node is Missing"
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
				return;
			} else if (this.activeSolution.status == "error" && this.activeSolution.type == "unknown") {
				//There is an unknown node in the expression of one of the nodes.
				errorMessage = this.generateUnknownErrorMessage(this.activeSolution);
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
				return;
			}

			//Checks if there are graphable nodes (only applicable in author mode)
			if (this.activeSolution.plotValues.length == 0) {
				errorMessage = "Please fill in some nodes before trying to graph"; //We show the error message like "A Node is Missing"
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
				return;
			}
			dom.byId("SliderPane").innerHTML = "<div id='graphHelpButton' data-dojo-type='dijit/form/Button'  class='fRight' type='button'>Help</div>" +
			"<div class='cBoth' id='solutionMessage'></div>";

			if(this.mode != "AUTHOR" && this.mode != "ROAUTHOR"  && this.mode != "EDITOR") {
				//Check if the solution matches Authors solution
				if (this.model.active.matchesGivenSolutionAndCorrect()) {
					this.isCorrect = true;
				}
				if (this.isCorrect) {
					//Correct Graph Message
					var successMsg = new messageBox("solutionMessage", "success", "Congratulations," +
					" your model's behavior matches the author's!", false);
					successMsg.show();
				} else {
					//Incorrect Graph Message
					if (this.model.active.checkStudentNodeCount() < 0)
						errorMessage = "Some nodes that the author requires are missing from your model," +
						" possibly because a subexpression in some node's expression needs to be turned into a node.";
					else if (this.model.active.checkStudentNodeCount() > 0) {
						errorMessage = "Your model does not match the author's.  You may have extra nodes in your model."
					}
					else {
						errorMessage = "Unfortunately, your model's behavior does not match the author's.";
					}
					var errMessageBox = new messageBox("solutionMessage", "error", errorMessage, false);
					errMessageBox.show();
				}
			}

			if( (this.mode === "AUTHOR" || this.mode === "ROAUTHOR" )&& this.checkForNan()) {
				var errorMessage = "The solution contains imaginary or overflowed numbers"; //We show the error message like "A Node is Missing"
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
			}

			//If no errors then show Tab Container
			domStyle.set(this.tabContainer.domNode, "display", "block");

			//Create Sliders
			this.createSliders();

			//Graph Tab
			this.initializeGraphTab();

			//Table Tab
			this.createTable(this.plotVariables);

			//checks if the given solution is a static solution
			this.isStatic = (this.mode === "AUTHOR" || this.mode === "ROAUTHOR") ? this.checkForStatic(this.activeSolution) :
				this.checkForStatic(this.givenSolution);
			if(this.isStatic) {
				//add static tab if solution is static
				this.initializeStaticTab();
			}else{
				//Hide static Tab
				this.staticTab = registry.byId("StaticTab");
				if(this.staticTab) {
					this.tabContainer.removeChild(this.staticTab);
					registry.byId("StaticTab").destroyRecursive();
				}
			}


			////logging listeners
			on(this.graphTab, "click", function(){
				console.log("graph tab clicked");
				logger.session.log('ui-action', {
					type: "solution-manipulation",
					name: "graph-tab"
				});
			});
			on( this.tableTab , "click", function(){
				console.log("table tab clicked");
				logger.session.log('ui-action', {
					type: "solution-manipulation",
					name: "table-tab"
				});
			});
			//Attach handlers for graph checkbox
			this.showHideGraphsHandler();

			//Add Hint button
			this.showHint();
			this.resizeWindow();
		},

		/*
		 * @brief: initialize Dialog/charts and sliders
		 *
		 */

		/*
		 =======================================
		 GRAPH FUNCTIONS
		 =======================================
		 */
		createChart: function(domNode, id, xAxis, yAxis, solution, index){
			//Chart Node
			var chart = new Chart(domNode);

			chart.addPlot("grid", {
				type: Grid,
				hMajorLines: true,
				hMinorLines: false,
				vMajorLines: true,
				vMinorLines: false,
				majorHLine: { color: "#CACACA", width: 1 },
				majorVLine: { color: "#CACACA", width: 1 }
				//markers: activeSolution.times.length < 25
			});

			chart.addAxis("x", {
				title: xAxis,
				titleOrientation: "away", titleGap: 5
			});

			var obj = this.getMinMaxFromArray(solution.plotValues[index]);
			/*if(obj.max - obj.min < Math.pow(10, -15)){
				var len = solution.plotValues[index].length;
				for(var i = 0; i < len; i++){
					solution.plotValues[index][i] = obj.max;
				}
				obj.min = obj.max;
			}*/
			debugger;
			if(this.activityConfig.get("plotAuthorSolution") && this.givenSolution.plotValues[index]){
				var step = (obj.max - obj.min)/10;
				if(obj.min >= this.givenSolution.plotValues[index][index] - step){
					obj.min = obj.min - step;
				}
				if(obj.max <= this.givenSolution.plotValues[index][index] + step){
					obj.max = obj.max + step;
				}
			}
			chart.addAxis("y", {
				vertical: true, // min: obj.min, max: obj.max,
				title: yAxis,
				titleGap: 20,
				min: obj.min,
				max: obj.max,
				labelFunc: this.formatAxes
			});

			if(this.isCorrect || this.mode == "AUTHOR" || this.mode == "ROAUTHOR") {
				//plot chart for student node
				chart.addSeries(
					"Your solution",
					this.formatSeriesForChart(solution, index),
					{stroke: {color: "#5cd65c", width: 1.5}}
				);
			}
			else {
				chart.addSeries(
					"Your solution",
					this.formatSeriesForChart(solution, index),
					{stroke: {color: "red", width: 1.5}}
				);
			}

			if(this.mode != "AUTHOR" && this.mode != "ROAUTHOR" && this.mode != "EDITOR" && solution.plotValues[index]){

				chart.addSeries(
					"Author's solution",
					this.formatSeriesForChart(this.givenSolution, index), {stroke: {color:"black", width:2}}
				);
			}

			//this check is handled in initializeGraphTab function.
			//if(obj.max - obj.min > (Math.pow(10,-15)) || (obj.max - obj.min === 0)) {
			chart.render();
			//}
			//else {
			//    dom.byId("solutionMessage").innerHTML = "Unable to graph, please increase the number of timesteps";
			//}
			return chart;
		},

		updateChart: function(id, solution, index, isStatic, updateAuthorGraph){

			var charts = isStatic? this.chartsStatic : this.charts;

			dom.byId("graphMessage" + id).innerHTML = "";
			var obj = this.getMinMaxFromArray(solution.plotValues[index]);


			if(this.mode !== "AUTHOR" && this.mode !== "ROAUTHOR") {
				var givenObj = this.getMinMaxFromArray(this.givenSolution.plotValues[index]);

				if (givenObj.min < obj.min) {
					obj.min = givenObj.min;
				}
				if (givenObj.max > obj.max) {
					obj.max = givenObj.max;
				}
			}
			var step = (obj.max - obj.min)/10;
			if(this.activityConfig.get("plotAuthorSolution") && this.givenSolution.plotValues[index]){
				if(obj.min >= this.givenSolution.plotValues[index][index] - step){
					obj.min = obj.min - step;
				}
				if(obj.max <= this.givenSolution.plotValues[index][index] + step){
					obj.max = obj.max + step;
				}
			}
			//Redraw y axis based on new min and max values
			charts[id].addAxis("y", {
				vertical: true,
				fixed: false,
				min: obj.min,
				max: obj.max,
				labelFunc: this.formatAxes,
				title: this.labelString(id)
			});

			if(isStatic){
				charts[id].addAxis("x", {
					title: dom.byId("staticSelect").value,
					titleOrientation: "away", titleGap: 5
				});

				if (updateAuthorGraph) {
					charts[id].updateSeries(
						"Author's solution",
						this.formatSeriesForChart(this.givenSolution, index),
						{stroke: {color: "black", width: 1.5}}
					);
				}
			}

			if(this.isCorrect || this.mode === "AUTHOR" || this.mode === "ROAUTHOR"){
				charts[id].updateSeries(
					"Your solution",
					this.formatSeriesForChart(solution, index),
					{stroke: {color: "green", width: 1.5}}
				);
			}
			else{
				charts[id].updateSeries(
					"Your solution",
					this.formatSeriesForChart(solution, index),
					{stroke: {color: "red", width: 1.5}}
				);
			}
			charts[id].render();
		},

		/*
		 * @brief: this functionformats array of node values into an array which consists of object of type
		 * {x: timestep, y: node value from array at timstep x}
		 */
		formatSeriesForChart: function(result, index){
			return array.map(result.times, function(time, k){
				return {x: time, y: result.plotValues[index][k]};
			});
		},

		initializeGraphTab: function(){
			//Graph Tab
			var graphContent = "";
			if(this.active.plotVariables.length > 0) {
				array.forEach(this.active.plotVariables, function (id) {
					//Create graph divs along with their error message
					var show = this.model.active.getType(id) == "accumulator" || this.model.given.getParent(this.model.active.getGivenID(id));
					var checked = show ? " checked='checked'" : "";
					graphContent += "<div><input id='sel" + id + "' data-dojo-type='dijit/form/CheckBox' class='show_graphs' thisid='" + id + "'" + checked + "/>" + " Show " + this.model.active.getName(id) + "</div>";
					var style = show ? "" : " style='display: none;'";
					//graph error message
					graphContent += "<font color='red' id='graphMessage" + id + "'></font>";
					graphContent += "<div	 id='chart" + id + "'" + style + ">";

					graphContent += "</div>";
					// Since the legend div is replaced, we cannot hide the legend here.
					graphContent += "<div class='legend' id='legend" + id + "'></div>";
				}, this);

				this.graphTab.set("content", graphContent);

				array.forEach(this.active.plotVariables, function (id, index) {
					var domNode = "chart" + id;
					var val = this.checkEpsilon(this.activeSolution, index);
					if(val){
						var len = this.activeSolution.plotValues[index].length;
						for(var i = 0; i < len; i++)
							this.activeSolution.plotValues[index][i] = val;
					}
					var xAxis = this.labelString();
					var yAxis = this.labelString(id);
					this.charts[id] = this.createChart(domNode, id, xAxis, yAxis, this.activeSolution, index);
					this.legends[id] = new Legend({chart: this.charts[id]}, "legend" + id);
				}, this);
			} else{
				var thisModel = this;
				var modStatus = true;
				array.forEach(this.model.active.getNodes(), function (thisnode) {
					if(thisModel.model.active.getType(thisnode.ID)=="function" || thisModel.model.active.getType(thisnode.ID)=="accumulator"){
						var errorMessage = this.generateMissingErrorMessage(thisModel.model.active.getName(thisnode.ID)); //We show the error message like "A Node is Missing"
						var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
						errMessageBox.show();
						modStatus = false;
					}
				});
				if(modStatus){
					var errorMessage = "<div>There isn't anything to plot. Try adding some accumulator or function nodes.</div>"; //We show the error message like "A Node is Missing"
					var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
					errMessageBox.show();
				}
			}
		},

		/*
		 =======================================
		 STATIC GRAPH FUNCTIONS
		 =======================================
		 */

		initializeStaticTab:function(){
			var staticContent = "";
			this.staticVar = 0;
			var staticNodes = this.checkForParameters();
			this.isStatic = this.isStatic && staticNodes.length > 0;
			dom.byId("StaticTab").innerHTML = "";
			if(this.isStatic){
				//TODO: Duplicate code in forEach
				array.forEach(this.active.plotVariables, function(id){
					var show = this.model.active.getType(id) == "accumulator" || this.model.given.getParent(this.model.active.getGivenID(id));
					var checked = show ? " checked='checked'" : "";
					staticContent += "<div><input id='selStatic" + id + "' data-dojo-type='dijit/form/CheckBox' class='show_graphs' thisid='" + id + "'" + checked + "/>" + " Show " + this.model.active.getName(id) + "</div>";
					var style = show ? "" : " style='display: none;'";
					staticContent += "<div	 id='chartStatic" + id + "'" + style + "></div>";

					//graph error message
					staticContent += "<font color='red' id='staticGraphMessage" + id + "'></font>";
					// Since the legend div is replaced, we cannot hide the legend here.
					staticContent += "<div class='legend' id='legendStatic" + id + "'></div>";
				}, this);

				this.staticTab = registry.byId("StaticTab");

				this.staticTab.set("content", "<div id='staticSelectContainer'></div>" + staticContent);

				this.createComboBox(staticNodes);
				var staticVar = this.checkStaticVar(true);
				this.staticPlot = this.findStaticSolution(true, staticVar, this.active.plotVariables);
				this.givenSolution = this.given.plotVariables ? this.findStaticSolution(false, staticNodes[this.staticVar], this.given.plotVariables) : "";

				array.forEach(this.active.plotVariables, function(id, index){
					var domNode = "chartStatic" + id ;
					var xAxis = dom.byId("staticSelect").value;
					var yAxis = this.labelString(id);
					this.chartsStatic[id] = this.createChart(domNode, id, xAxis, yAxis, this.staticPlot, index);
					this.legendStatic[id] = new Legend({chart: this.chartsStatic[id]}, "legendStatic" + id);
				}, this);

				if(this.buttonClicked == "graph") {
					this.tabContainer.selectChild(this.staticTab);
				}
			} else {
				var errorMessage  = "<div>There are no Parameters to graph against</div>";
				var errMessageBox = new messageBox("StaticTab", "warn", errorMessage, false);
				errMessageBox.show();
			}

		},

		//creates the dropdown menu for the static window
		createComboBox: function(staticNodes){
			var stateStore = new Memory();
			var combo = registry.byId("staticSelect");
			if(combo){
				combo.destroyRecursive();
			}
			array.forEach(staticNodes, function(node)
			{
				stateStore.put({id:node.name, name:node.name});
			});
			var comboBox = new ComboBox({
				id: "staticSelect",
				name: "state",
				value: staticNodes[0].name,
				store: stateStore,
				searchAttr: "name"
			}, "staticSelectContainer");
			//console.log(comboBox);
			this.disableStaticSlider();
			on(comboBox, "change", lang.hitch(this, function(){
				this.renderStaticDialog(true);// Call the function for updating both the author graph and the student graph
				this.disableStaticSlider();
			}));
		},

		//checks if the solution is static
		checkForStatic: function(solution) {
			var values = solution.plotValues;
			var temp = 0;
			var isStatic = true;
			if(values.length == 0){
				isStatic = false;
			}
			if(this.model.active.isNodeTypePresent("accumulator")){
				return false;
			}
			array.forEach(values, function(value)
			{
				temp = value[0];
				array.forEach(value, function(num)
				{
					if(num !== temp)
					{
						isStatic = false;
					}
					temp = num;
				});
			});
			return isStatic;
		},

		//checks if the difference between min and max values for plot is not less than 10^-15
		checkEpsilon: function(solution, index){
			var obj = this.getMinMaxFromArray(solution.plotValues[index]);
			return (obj.max - obj.min < Math.pow(10, -15)) && (obj.max != obj.min) && obj.max;
		},

		//hides the slider for the variable that is selected
		disableStaticSlider: function() {
			var staticVar = this.checkStaticVar(true);
			var id = staticVar.ID;
			var parameters = this.checkForParameters(true);
			array.forEach(parameters, function(parameter){
				dom.byId("labelGraph_" + parameter.ID).style.display = "initial";
				dom.byId("textGraph_" + parameter.ID).style.display = "initial";
				dom.byId("sliderGraph_" + parameter.ID).style.display = "initial";
				if(dom.byId("sliderUnits_" + parameter.ID)){ // Some nodes have no units.
					dom.byId("sliderUnits_" + parameter.ID).style.display = "initial"; 
				}
			});
			dom.byId("labelGraph_" +id).style.display = "none";
			dom.byId("textGraph_" + id).style.display = "none";
			dom.byId("sliderGraph_" + id).style.display = "none";
			if(dom.byId("sliderUnits_" + id)){  // Some nodes have no units
				dom.byId("sliderUnits_" + id).style.display = "none";
			}
		},


		//changes the static graph when sliders or dropdown change
		renderStaticDialog: function(updateAuthorGraph){
			console.log("rendering static");
			if(this.isStatic) {
				var staticVar = this.checkStaticVar(true);
				var activeSolution = this.findStaticSolution(true, staticVar, this.active.plotVariables);
				this.givenSolution = this.findStaticSolution(false, staticVar, this.given.plotVariables);
				//update and render the charts
				array.forEach(this.active.plotVariables, function(id, k){
					var inf = this.checkForInfinity(activeSolution.plotValues[k]);
					if(inf) {
						dom.byId("staticGraphMessage" + id).innerHTML = "The values you have chosen caused the graph to go infinite.";
						domStyle.set("chartStatic"+id, "display", "none");
						domStyle.set("legendStatic" + id, "display", "none");
						domAttr.remove("staticGraphMessage"+id, "style");
					}
					else {
						dom.byId("staticGraphMessage" + id).innerHTML = "";
						this.updateChart(id, activeSolution, k, true, updateAuthorGraph);
					}

				}, this);
			}
		},

		//checks for which variables are static
		checkStaticVar: function(choice){	//true is active, false is given
			var parameters = this.checkForParameters(choice);
			var result = parameters[0];
			var staticSelect = dom.byId("staticSelect");

			if(typeof parameters[0].description != 'undefined')
			{
				array.forEach(parameters, function(parameter){

					if(parameter.name == staticSelect.value)
					{
						result = parameter;
					}
				}, this);
			}
			else
			{
				var givenParameters = this.checkForParameters(false);
				var tempResult = givenParameters[0];
				array.forEach(givenParameters, function(parameter){
					if(parameter.name == staticSelect.value)
					{
						tempResult = parameter;
					}
				}, this);

				array.forEach(parameters, function(parameter){
					if(parameter.descriptionID == tempResult.ID)
					{
						result = parameter;
					}
				}, this);
			}
			return result;
		},

		/*
		 =======================================
		 SLIDER FUNCTIONS
		 =======================================
		 */

		showHideGraphsHandler: function(){
			//// The following loop makes sure legends of function node graphs are not visible initially
			//// until the user requests, we use the display : none property
			//// The legend div is replaced in the dom, so we must hide it dynamically.
			array.forEach(this.active.plotVariables, function(id){
				if(this.model.active.getType(id) == "function" && !this.model.given.getParent(this.model.active.getGivenID(id))){
					var leg_style = { display: "none" };
					domAttr.set("legend" + id, "style", leg_style);
					if(this.isStatic) {
						domAttr.set("legendStatic" + id, "style", leg_style);
					}
				}
				var check = registry.byId("sel" + id);
				check.on("Change", function(checked){
					if(checked) {
						domAttr.remove("chart" + id, "style");
						domAttr.remove("legend" + id, "style");
					}else{
						var obj = { display: "none" };
						domAttr.set("chart" + id, "style", obj);
						domAttr.set("legend" + id, "style", obj);
					}
				});
				if(this.isStatic) {
					var staticCheck = registry.byId("selStatic" + id);
					staticCheck.on("Change", function (checked) {
						if (checked) {
							if (dom.byId("staticGraphMessage" + id).innerHTML == "") {
								domAttr.remove("chartStatic" + id, "style");
								domAttr.remove("legendStatic" + id, "style");
							} else {
								var obj = {display: "none"};
								domAttr.set("chartStatic" + id, "style", obj);
								domAttr.set("legendStatic" + id, "style", obj);
								domAttr.remove("staticGraphMessage" + id, "style");
							}
						} else {
							var obj = {display: "none"};
							domAttr.set("chartStatic" + id, "style", obj);
							domAttr.set("legendStatic" + id, "style", obj);
							domAttr.set("staticGraphMessage" + id, "style", obj);
						}
					});
				}

			}, this);
		},

		/*
		 * @brief: this function re-renders dialog  when slider event is fired and
		 * new values for student nodes are calculated
		 */
		renderDialog: function(){
			console.log("rendering graph and table");
			var activeSolution = this.findSolution(true, this.active.plotVariables);
			//update and render the charts
			array.forEach(this.active.plotVariables, function(id, k){

				// Calculate Min and Max values to plot on y axis based on given solution and your solution
				var inf = this.checkForInfinity(activeSolution.plotValues[k]);
				if(inf) {
					dom.byId("graphMessage" + id).innerHTML = "The values you have chosen caused the graph to go infinite. (See table.)";
				}
				else {
					this.updateChart(id, activeSolution, k, false);
				}
			}, this);

			this.createTable(this.active.plotVariables);
		},

		closeDialog: function(){
			//Cleanup when dialog is closed

			if(this.helpDialog){
				this.helpDialog.destroyRecursive();
			}
			dom.byId("graphErrorMessage").innerHTML = "";
			dom.byId("SliderPane").innerHTML = "";
			this.hideCallback.remove();
		},



		/*
		 =======================================
		 TABLE FUNCTIONS
		 =======================================
		 */

		createTable: function(plotVariables){
			var paneText = "";
			if(plotVariables.length>0) {
				paneText += this.beginTable();
				paneText += this.setTableHeader();
				paneText += this.setTableContent();
				paneText += this.endTable();
			}else{
				//Error telling there are no nodes and Table cant be rendered
				paneText = "There is nothing to show in the table.	Please define some quantitites.";
			}
			this.tableTab.set("content", paneText);
		},

		/*
		 * @brief: function to begin table dom
		 */
		beginTable: function(){
			return "<div style='overflow:visible' align='center'>" + "<table class='solution' style='overflow:visible'>";
		},

		/*
		 * @brief: function to close table dom
		 */
		endTable: function(){
			return "</table>"+"</div>";
		},

		/*
		 * @brief: function to set headers of table
		 */
		setTableHeader: function(){
			var i, tableString = "";
			tableString += "<tr style='overflow:visible'>";
			//setup xunit (unit of timesteps)
			tableString += "<th style='overflow:visible'>" + this.labelString() + "</th>";
			array.forEach(this.plotVariables, function(id){
				tableString += "<th>" + this.labelString(id) + "</th>";
			}, this);
			tableString += "</tr>";
			return tableString;
		},

		/*
		 * @brief: function to set contents of table according to node values
		 */
		setTableContent: function(){
			var tableString="";
			var errorMessage = null;
			var solution = this.findSolution(true, this.plotVariables); // Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
			if(solution.status=="error" && solution.type=="missing"){
				errorMessage = this.generateMissingErrorMessage(solution); //We show the error message like "A Node is Missing"
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
				return "";
			}else if(solution.status == "error" && solution.type == "unknwon"){
				errorMessage = this.generateUnknownErrorMessage(solution); //We show the error message like "A Node is Missing"
				var errMessageBox = new messageBox("graphErrorMessage", "error", errorMessage, false);
				errMessageBox.show();
				return "";
			} else if(solution.status == "error" && solution.type == "unknwon"){
				this.dialogWidget.set("content", this.generateUnknownErrorMessage(solution));
				return "";
			}
			var j = 0;
			for(var i=0; i<solution.times.length; i++){
				tableString += "<tr style='overflow:visible'>";
				tableString += "<td align='center' style='overflow:visible' id ='row" + i + "col0'>" + solution.times[i].toPrecision(4) + "</td>";
				//set values in table according to their table-headers
				j = 1;
				array.forEach(solution.plotValues, function(value){
					tableString += "<td align='center' style='overflow:visible' id='row" + i + "col" + j + "'>" + value[i].toPrecision(3) + "</td>";
					j++;
				});
				tableString += "</tr>";
			}
			return tableString;
		},



		/*
		 =======================================
		 HELPER FUNCTIONS
		 =======================================
		 */

		/*
		 * @brief: this functionreturns object with min and max
		 * value from an array
		 */
		getMinMaxFromArray: function(array){
			var i;
			var min = array[0];
			var max = array[0];
			for(i = 1; i < array.length; i++){
				if(array[i] < min){
					min = array[i];
				}
				if(array[i] > max){
					max = array[i];
				}
			}
			// Check if the maximum and minimum are same and change the min and max values
			if(min == max){
				if (min < 0){
					min = min * 2;
					max = 0;
				} else if (min > 0) {
					min = 0;
					max = max * 2;
				} else {
					min = -1;
					max = +1;
				}
			}
			return {min: min, max: max};
		},

		//helper method for error messages
		generateMissingErrorMessage: function(solution){
			return "<div>Not all nodes have been completed. For example, "
			+ solution.missingNode + " has an empty "+ solution.missingField +
			" field.</div>";
		},

		generateUnknownErrorMessage: function(solution){
			return "<div>There is an unknown node <b>"+ solution.unknownNode +
			"</b> used in the <b>"+ solution.missingField +" field</b> of the <b>" + solution.missingNode +
			" node</b>. Please check the spelling of all the nodes you have entered in the expression</div>";
		},

		//checks if the solution goes to infinity at any point
		checkForInfinity: function(values) {
			var result = false;
			array.forEach(values, function(value){
				if(!isFinite(value))
				{
					result = true;
				}
			}, this);
			return result;
		},

		//checks if any part of the solution is not a number ie imaginary
		checkForNan: function(){
			var solution = this.findSolution(true, this.plotVariables);
			var nan = false;
			for(var i = 0; i < solution.times.length; i++){
				if(isNaN(solution.times[i].toPrecision(4)))
					nan = true;
				array.forEach(solution.plotValues, function(value){
					if(isNaN(value[i]))
						nan = true;
				});
			}
			return nan;
		},

		//checks for what parrameters are a in a solution
		checkForParameters: function(choice){ //true is active, false is given
			var result = [];
			if(choice === true)
			{
				array.forEach(this.model.active.getNodes(), function(node)
				{
					//console.log(node);
					if(node.type == "parameter")
					{
						result.push(node);
					}
				}, this);
			}
			else
			{
				array.forEach(this.model.given.getNodes(), function(node)
				{
					//console.log(node);
					if(node.type == "parameter")
					{
						result.push(node);
					}
				}, this);
			}
			return result;
		},

		//helper function for axes
		formatAxes: function(text, value, precision){
			if(value > 10000){
				return value.toPrecision(3);
			}else if(value % 1 != 0){
				return value.toPrecision(3);
			}
			else{
				return text;
			}
		},

		//Create Hint
		showHint: function(){
			var helpButton = registry.byId("graphHelpButton");

			on(helpButton, "click", lang.hitch(this, function () {
				if(!this.helpDialog) {
					this.helpDialog = new Dialog({
						"class": 'graphHintUnderLay',
						"title": "Graph Help",
						content: "<ul><li>Welcome to the graph window.  The results of the model’s computations are shown here as graphs and tables.  The model consists of inter-related numerical quantities.</li>" +
						"<li>The left side of the window displays the quantities in the model calculated by the equations in the accumulator and function nodes.</li>" +
						"<li>Any fixed quantity (parameters or accumulators’ initial value) can be temporarily adjusted using the sliders on the right side of this window.  " +
						"This updates the graphs/tables on the left immediately.  To reset the sliders, close and re-open the window.</li>" +
						"<li>The “static” tab appears when all graphed quantities are constant with time.  In this tab, you can select a quantity from the list and Dragoon will use it as the horizontal axis for every graph. </li>" +
						"</ul>"
					});
				}
				this.helpDialog.show();
				domClass.remove("graphHelpButton", "glowNode");
			}));

		},

		//Resize graph window
		resizeWindow: function(){
			console.log("resizing window");
			var dialogWindow = document.getElementById("solution");
			dialogWindow.style.height = "770px";
			dialogWindow.style.width = "70%";
			dialogWindow.style.left = "0px";
			dialogWindow.style.top = "0px";

			var tabContainer = document.getElementById("GraphTabContainer");
			tabContainer.style.height = "700px";
			//tabContainer.style.height = "";

		}

	});
});
