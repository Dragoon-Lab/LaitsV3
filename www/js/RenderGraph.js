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
/**
 * @author: Deepak Bhosale
 * @brief: Graph rendering and related functions
 */

define([
    "dojo/_base/array", "dojo/_base/declare",
    "dojo/_base/lang", "dojo/on",
    "dojox/charting/Chart",
    "dojox/charting/axis2d/Default",
    "dojox/charting/plot2d/Lines",
    "dojox/charting/plot2d/Grid",
    "dojox/charting/widget/Legend",
    "./calculations",
    "dojo/domReady!"
], function(array, declare, lang, on, Chart, Default, Lines, Grid, Legend, calculations){

    // The calculations constructor is loaded before the RenderGraph constructor
    return declare(calculations, {
	
	type: "Graph",                                  //Rendering type
	textBoxID:"textGraph",                          //ID for text-box DOM
	sliderID: "sliderGraph",                        //ID for slider DOM
	chart: {},                                      //Object of a chart
	
	/*
	 *  @brief:constructor for a graph object
	 *  @param: noOfParam
	 */
	
	constructor: function(){
            console.log("***** In RenderGraph constructor");
	    if(this.active.timeStep){  // Abort if there is an error in timSstep.
		this.initialize();
	    }
	},
	
	/*
	 * @brief: initialize Dialog/charts and sliders
	 *
	 */
	initialize: function(){
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
	    var activeSolution = this.findSolution(true, this.active.plotVariables);
        if(activeSolution.status=="error" && activeSolution.type=="missing") // Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
	    {
	       this.dialogWidget.set("content", "<div>Not all nodes have been completed. For example, \""+activeSolution.missingNode+"\" is not yet fully defined.</div>"); //We show the error message like "A Node is Missing"
           return;
	    }
        
        
        if(this.mode != "AUTHOR"){
	    	//check for author mode. Here we need to create just one graph.
		    this.given.plotVariables = array.map(this.active.plotVariables, function(id){
			var givenID = this.model.active.getDescriptionID?
				this.model.active.getDescriptionID(id):id;
			// givenID should always exist.
			console.assert(givenID, "Node '" + id + "' has no corresponding given node");
			var givenNode = this.model.given.getNode(givenID);
			return givenNode && (!givenNode.genus?givenID:null);
		    }, this);

            // Calculate solutions
		    var givenSolution = this.findSolution(false, this.given.plotVariables);
            
		}

		 array.forEach(this.active.plotVariables, function(id){
             this.dialogContent += "<div id='chart" + id + "'> " + "\</div>";
             this.dialogContent += "<div class='legend' id='legend" + id + "'> " + "\</div>";
	            }, this);
		    //plot sliders 
	            this.createSliderAndDialogObject();

            var charts = {};
            var legends = {};
            
            if(this.active.plotVariables.length>0){ //we check the length of object, if there are nodes , then we proceed else give an error and return
		array.forEach(this.active.plotVariables, function(id, k){
                    var str = "chart" + id;
                    charts[id] = new Chart(str);
                    charts[id].addPlot("default", {
			type: Lines, 
			// Do not include markers if there are too
			// many plot points.  It looks ugly and slows down
			// plotting significantly.
			markers: activeSolution.times.length<25
		    });
                    charts[id].addAxis("x", {
			title: this.labelString(),
			titleOrientation: "away", titleGap: 5
                    });
		    
                    // var obj = this.getMinMaxFromArray(this.student.arrayOfNodeValues[j]);
                    charts[id].addAxis("y", {
			vertical: true, // min: obj.min, max: obj.max,
			title: this.labelString(id)
                    });

		    if(this.mode != "AUTHOR")	
                var givenID = this.model.active.getDescriptionID(id);
		    
                    //plot chart for student node
                    charts[id].addSeries(
			"Variable solution", 
			this.formatSeriesForChart(activeSolution, k), 
			{stroke: "green"}
		    );
		    if(this.mode != "AUTHOR" && this.given.plotVariables[k]){
			charts[id].addSeries(
			    "correct solution", 
			    this.formatSeriesForChart(givenSolution, k), {stroke: "red"});
                    }
                    charts[id].render();
                    legends[id] = new Legend({chart: charts[id]}, "legend" + id);

		}, this);
            }else{
		this.dialogWidget.set("content", "<div>There isn't anything to plot. Try adding some accumulator or function nodes.</div>" ); //Error telling there are no nodes and graph cant be rendered
            }
            this.chart = charts;
	},
	
	/*
	 * @brief: this function formats array of node values into an array which consists of object of type
	 * {x: timestep, y: node value from array at timstep x}
	 */
	formatSeriesForChart: function(result, j){
	    return array.map(result.times, function(time, k){
		return {x: time, y: result.plotValues[j][k]};
	    });
	},
	
	/*
	 * @brief: this function returns object with min and max
	 * value from an array
	 */
	getMinMaxFromArray:function(array){
            var i;
            var min= array[0];
            var max = array[0];
            for(i=1; i<array.length; i++){
		if(array[i] < min){
                    min = array[i];
		}
		if(array[i] > max){
                    max = array[i];
		}
            }
            return {min:min, max:max};
	},
	
	/*
	 * @brief: this function renders dialog again when slider event is fired and
	 * new values for student nodes are calculated
	 */
	renderDialog: function(calculationObj){
	    var activeSolution = this.findSolution(true, this.active.plotVariables);
            //update and render the charts
            array.forEach(this.active.plotVariables, function(id, k){
		this.chart[id].updateSeries(
		    "Variable solution", 
		    this.formatSeriesForChart(activeSolution, k),
		    {stroke: "green"}
		);
		this.chart[id].render();
            }, this);
	}
    });
});
