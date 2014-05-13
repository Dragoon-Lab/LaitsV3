/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: Table rendering and related functions
 * 
 */

define([
    "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang",
    "dojo/on",
    "dijit/layout/ContentPane",
    "./calculations",
    "dojo/domReady!" 
], function(array, declare, lang, on, contentPane, calculations){
    return declare(calculations, {
	
	type: "Table",                      // Type for dialog title
	textBoxID:"textTable",              //ID for text-box DOM
	sliderID: "sliderTable",            //ID for slider DOM
	contentPane : null,             	//contentPane for table
	
	/*
	 *  @brief:constructor for Table
	 */
	constructor: function(){
            console.log("***** In RenderTable constructor");
     	    this.initialize();
	},
	
	/*
	 * @brief: initialize Dialog/charts and sliders
	 */
	initialize: function(){
            //initialize dom for plotting table
            this.dialogContent += "<div id='table'></div>";
            //plot sliders and dialog for table
            this.createSliderAndDialogObject();
            /*check if array of node values is empty
             plot table if these values are not empty*/
            var paneText="";
	    /* List of variables to plot: Include functions */
	    this.plotVariables = this.active.timeStep.xvars.concat(
		this.active.timeStep.functions);
            if(this.plotVariables){
		paneText += this.initTable();
		paneText += this.setTableHeader();
		paneText += this.setTableContent();
		paneText += this.closeTable();
            }
            else
            {
		paneText = "Nothing to plot.  Please define some quantitites";
            }
            this.contentPane = new contentPane({
		content:paneText
            }, "table");
	},
	
	/*
	 * @brief: initialize table contents
	 */
	initTable: function(){
            return "<div align='center'>" + "<table class='solution'>";
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
	    tableString += "<tr>";
	    //setup xunit (unit of timesteps)
	    tableString += "<th>" + this.labelString() + "</th>";
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
	    var solution = this.findSolution(true, this.plotVariables);
            for(var i=0; i<solution.times.length; i++){
		tableString += "<tr>";
		tableString += "<td align='center'>" + solution.times[i] + "</td>";
		//set values in table according to their table-headers
		array.forEach(solution.plotValues, function(value){
                    tableString += "<td align='center'>" + value[i].toFixed(2) + "</td>";
		});
		tableString += "</tr>";
            }
            return tableString;
	},
	
	/*
	 * @brief: this function renders dialog again when slider event is fired and
	 * new values for student nodes are calculated
	 */
	renderDialog: function(calculationObj){
            var paneText = "";
            paneText += this.initTable();
            paneText += this.setTableHeader();
            paneText += this.setTableContent();
            paneText += this.closeTable();
	    
            this.contentPane.setContent(paneText);
	}
    });
});
