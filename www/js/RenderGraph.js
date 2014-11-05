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
	"dojo/_base/array", "dojo/_base/declare",
	"dojo/_base/lang", "dojo/on", 'dojo/dom-attr',
	"dijit/registry",
	"dojox/charting/Chart",
	"dojox/charting/axis2d/Default",
	"dojox/charting/plot2d/Lines",
	"dojox/charting/plot2d/Grid",
	"dojox/charting/widget/Legend",
	"./calculations",
	"dijit/_base",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
	"dojo/parser",	
	"dojo/domReady!"
], function(array, declare, lang, on, domAttr, registry, Chart, Default, Lines, Grid, Legend, calculations, base, contentPane){

	// The calculations constructor is loaded before the RenderGraph constructor
	return declare(calculations, {
		type: "Graph and Table",									//Rendering type
		textBoxID: "textGraph",							//ID for text-box DOM
		sliderID: "sliderGraph",						//ID for slider DOM
		chart: {},										//Object of a chart

		/*
		 *	@brief:constructor for a graph object
		 *	@param: noOfParam
		 */
		constructor: function(model, mode, logging, buttonClicked){
			this.buttonClicked = buttonClicked;
			console.log("***** In RenderGraph constructor");
			this.resizeWindow();
			if(this.active.timeStep){  // Abort if there is an error in timestep.
				this.initialize();
			}
		},

		/*
		 * @brief: initialize Dialog/charts and sliders
		 *
		 */
		initialize: function(){
			console.log("graphing");
			console.log(this.buttonClicked);
			/* List of variables to plot: Include functions */
			this.active.plotVariables = this.active.timeStep.xvars.concat(
				this.active.timeStep.functions);
			/*
			 Match list of given model variables.
			 If the given model node is not part of the given solution,
			 set variable to null to indicate that it should not
			 be calulated.

			 To include optional nodes,
			 one would need to order them using topologicalSort
			 */
            console.log("length of active plot variables",this.active.plotVariables.length);
            var activeSolution = this.findSolution(true, this.active.plotVariables);
            if(activeSolution.status == "error" && activeSolution.type == "missing") {
				// Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
				this.dialogWidget.set("content", "<div>Not all nodes have been completed. For example, \"" + activeSolution.missingNode + "\" is not yet fully defined.</div>"); //We show the error message like "A Node is Missing"
				return;
			}

			if(this.mode != "AUTHOR"){
				//check for author mode. Here we need to create just one graph.
				this.given.plotVariables = array.map(this.active.plotVariables, function(id){
					var givenID = this.model.active.getDescriptionID ?
							this.model.active.getDescriptionID(id) : id;
					// givenID should always exist.
					console.assert(givenID, "Node '" + id + "' has no corresponding given node");
					var givenNode = this.model.given.getNode(givenID); 
					return givenNode && (!givenNode.genus ? givenID : null);
				}, this);
				// Calculate solutions
				var givenSolution = this.findSolution(false, this.given.plotVariables);
			}
			this.resizeWindow();


			//create content pane for displaying graph/table and sliders
			this.dialogContent += "<div data-dojo-type= 'dijit/layout/ContentPane' style='overflow:visible; width:50%; float:left; height: 700px; background-color: #FFFFFF'>"
			//create tab container on left side for graph and table
			this.dialogContent += "<div data-dojo-type='dijit/layout/TabContainer' style='overflow:visible; height:700px; width:501px'>"
			//create tab for graph and fill it
			this.dialogContent += "<div data-dojo-type='dijit/layout/ContentPane' style='overflow:auto' data-dojo-props='title:\"Graph\"'>";
			array.forEach(this.active.plotVariables, function(id){
				var show = this.model.active.getType(id) == "accumulator";
				var checked = show ? " checked='checked'" : "";
				this.dialogContent += "<div><input id='sel" + id + "' data-dojo-type='dijit/form/CheckBox' class='show_graphs' thisid='" + id + "'" + checked + "/>" + " Show " + this.model.active.getName(id) + "</div>";
				var style = show ? "" : " style='display: none;'";
				this.dialogContent += "<div	 id='chart" + id + "'" + style + "></div>";
				// Since the legend div is replaced, we cannot hide the legend here.
				this.dialogContent += "<div class='legend' id='legend" + id + "'></div>";
			}, this);
			//create tab for table
			if(this.buttonClicked == "graph")
				this.dialogContent += "</div><div data-dojo-type='dijit/layout/ContentPane' style='overflow:visible' data-dojo-props='title:\"Table\"'>"
			if(this.buttonClicked == "table")
				this.dialogContent += "</div><div data-dojo-type='dijit/layout/ContentPane' style='overflow:visible' selected = true data-dojo-props='title:\"Table\"'>"
			//Render table here
			this.dialogContent += "<div id='table' stlye='overflow:visible'></div>";

			//end divs for graph and table 
			this.dialogContent += "</div></div></div>"

			//create content pane for sliders
			this.dialogContent += "<div data-dojo-type='dijit/layout/ContentPane' style='overflow:auto; width:40%; float:right; height: 100%; background-color: #FFFFFF'>";
			//text for correctness of solution
			
			
			if(this.mode != "AUTHOR"  && this.mode != "EDITOR" && this.mode != "TEST")
			{
				if(this.model.active.matchesGivenSolutionAndCorrect())
				{
					this.dialogContent += "<font color='green'>Congratulations, your model's behavior matches the author's</font><br>";
				}
				else
					this.dialogContent += "<font color='red'>Unfortunately, your model's behavior does not match the author's</font><br>";
			}
			this.dialogContent += "<p>To reset the sliders, close and reopen the window.</p>";
			//plot sliders

			this.createSliderAndDialogObject();

			this.dialogContent += "</div>";			
			var charts = {};
			var legends = {};
			var paneText="";

			/* List of variables to plot: Include functions */
			this.plotVariables = this.active.timeStep.xvars.concat(
				this.active.timeStep.functions);
			if(this.plotVariables.length>0){ //we check the length of object, if there are nodes , then we proceed else give an error and return
				paneText += this.initTable();
				paneText += this.setTableHeader();
				paneText += this.setTableContent();
				paneText += this.closeTable();
			}else{
				//Error telling there are no nodes and Table cant be rendered
				paneText = "There is nothing to show in the table.	Please define some quantitites."; 
			}
			this.contentPane = new contentPane({
				content:paneText
			}, "table");


			if(this.active.plotVariables.length > 0){ //we check the length of object, if there are nodes, then we proceed else give an error and return
				array.forEach(this.active.plotVariables, function(id, k){
					var str = "chart" + id;
					charts[id] = new Chart(str);
					charts[id].addPlot("default", {
						type: Lines,
						// Do not include markers if there are too
						// many plot points.  It looks ugly and slows down
						// plotting significantly.
						markers: activeSolution.times.length < 25
						});
					charts[id].addAxis("x", {
						title: this.labelString(),
						titleOrientation: "away", titleGap: 5
						});

					var obj = this.getMinMaxFromArray(activeSolution.plotValues[k]);
					charts[id].addAxis("y", {
						vertical: true,
						min: obj.min,
						max:obj.max,
						title: this.labelString(id)
						});

					if(this.mode != "AUTHOR"){
						var givenID = this.model.active.getDescriptionID(id);
					}
					//plot chart for student node
                    console.log("active solution",activeSolution);
					charts[id].addSeries(
						"Your solution",
						this.formatSeriesForChart(activeSolution, k),
						{stroke: "green"}
					);
					if(this.mode !== "AUTHOR"  && this.mode !== "EDITOR" && this.given.plotVariables[k]){
						charts[id].addSeries(
							"Author's solution",
							this.formatSeriesForChart(givenSolution, k), {stroke: "red"}
						);
					}
					charts[id].render();
					legends[id] = new Legend({chart: charts[id]}, "legend" + id);

				}, this);
			} else {
                //Now it is possible that there might be incomplete nodes which are not listed in active plot variables
                var thisModel = this;
                var modStatus = true;
                array.forEach(this.model.active.getNodes(), function (thisnode) {
                    if(thisModel.model.active.getType(thisnode.ID)=="function" || thisModel.model.active.getType(thisnode.ID)=="accumulator"){
                        thisModel.dialogWidget.set("content", "<div>Not all nodes have been completed. For example, \"" + thisModel.model.active.getName(thisnode.ID) + "\" is not yet fully defined.</div>");
                        modStatus = false;
                        return;
                    }
                });
                if(modStatus)
				    this.dialogWidget.set("content", "<div>There isn't anything to plot. Try adding some accumulator or function nodes.</div>"); //Error telling there are no nodes and graph cant be rendered
			}
			this.chart = charts;

			// The following loop makes sure legends of function node graphs are not visible initially
			// until the user requests, we use the display : none property
			// The legend div is replaced in the dom, so we must hide it dynamically.
			array.forEach(this.active.plotVariables, function(id){
				if(this.model.active.getType(id) == "function"){
					var leg_style = { display: "none" };
					var k = domAttr.set("legend" + id, "style", leg_style);
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
			}, this);
			this.resizeWindow();
		},

		/*
		 * @brief: this functionformats array of node values into an array which consists of object of type
		 * {x: timestep, y: node value from array at timstep x}
		 */
		formatSeriesForChart: function(result, j){
			return array.map(result.times, function(time, k){
				return {x: time, y: result.plotValues[j][k].toFixed(3)};
			});
		},

		doLayout: function()
		{},

		resizeWindow: function(){
			console.log("resizing window");
			var dialogWindow = document.getElementById("solution");
			dialogWindow.style.height = "750px";
			dialogWindow.style.width = "1000px";
			dialogWindow.style.left = "0px";
			dialogWindow.style.top = "0px";
		},
/*
			resetposition: function(){
		// summary: position modal dialog in center of screen
		
			if(dojo.hasClass(dojo.body(),"dojoMove")){ return; }
			var viewport = dijit.getViewport();
			var mb = dojo.marginBox(this.domNode);

			var style = this.style;
			style.left = Math.floor((viewport.l + (viewport.w - mb.w)/2)) + "px";
			
			// Change to avoid the dialog being outside the viewport
			var top = Math.floor((viewport.t + (viewport.h - mb.h)/2));
			
			// A standard margin is nice to have for layout reasons
			// I think it should be proportional to the page height
			var margin = Math.floor(viewport.h/30);
			
			// The top can't be less than viewport top
			if (top - margin < viewport.t)
			{
				top = viewport.t + margin;
			}
			
			// If the height of the box is the same or bigger than the viewport
			// it means that the box should be made scrollable and a bottom should be set

		},*/

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
				min = min - 1;
				max = max + 1;
			}
			return {min: min, max: max};
		},

		/*
		 * @brief: this functionrenders dialog again when slider event is fired and
		 * new values for student nodes are calculated
		 */
		renderDialog: function(calculationObj){
			var activeSolution = this.findSolution(true, this.active.plotVariables);
			var givenSolution;
            // TODO: Consider making this condition a function, like "givenGraphViewable()
           if (this.mode !== "AUTHOR" && this.mode !== "EDITOR"){
                givenSolution = this.findSolution(false, this.given.plotVariables);
            }
			//update and render the charts
			array.forEach(this.active.plotVariables, function(id, k){	
				// Calculate Min and Max values to plot on y axis based on your solution (and given, when applicable)
				var obj = this.getMinMaxFromArray(activeSolution.plotValues[k]);
                if (this.mode !== "AUTHOR" && this.mode !== "EDITOR") {
                    var givenObj = this.getMinMaxFromArray(givenSolution.plotValues[k]);
                    if (givenObj.min < obj.min) {
                        obj.min = givenObj.min;
                    }
                    if (givenObj.max > obj.max) {
                        obj.max = givenObj.max;
                    }
                }

				//Redraw y axis based on new min and max values
				this.chart[id].addAxis("y", {
						vertical: true,
						min: obj.min,
						max: obj.max,
						title: this.labelString(id)
						});

				this.chart[id].updateSeries(
					"Your solution",
					this.formatSeriesForChart(activeSolution, k),
					{stroke: "green"}
				);
				this.chart[id].render();
			}, this);

			var paneText = "";
			paneText += this.initTable();
			paneText += this.setTableHeader();
			paneText += this.setTableContent();
			paneText += this.closeTable();
			
			this.contentPane.setContent(paneText);
		},
		initTable: function(){
			return "<div style='overflow:visible' align='center'>" + "<table class='solution' style='overflow:visible'>";
		},
		
		/*
		 * @brief: function to close table dom
		 */
		closeTable: function(){
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
			var solution = this.findSolution(true, this.plotVariables); // Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
			if(solution.status=="error" && solution.type=="missing"){
				this.dialogWidget.set("content", "<div>Not all nodes have been completed. For example, \""+solution.missingNode+"\" is not yet fully defined."); //We show the error message like "A Node is Missing"
				// Not sure what the return should be here
				return "";
			}
			
			for(var i=0; i<solution.times.length; i++){
				tableString += "<tr style='overflow:visible'>";
				tableString += "<td align='center' style='overflow:visible'>" + solution.times[i].toPrecision(4) + "</td>";
				//set values in table according to their table-headers
				array.forEach(solution.plotValues, function(value){
					tableString += "<td align='center' style='overflow:visible'>" + value[i].toPrecision(3) + "</td>";
				});
				tableString += "</tr>";
			}
			return tableString;
		}
	});
});
