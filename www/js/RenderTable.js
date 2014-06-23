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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
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
	return declare(calculations, {	 //calculations constructor is loaded here before RenderGraph constructor is 
	
	type: "Table",						// Type for dialog title
	textBoxID:"textTable",				//ID for text-box DOM
	sliderID: "sliderTable",			//ID for slider DOM
	contentPane : null,					//contentPane for table
	
	/*
	 *	@brief:constructor for Table
	 */
	constructor: function(){
			console.log("***** In RenderTable constructor");
		if(this.active.timeStep){  // Abort if there is an error in timSstep.
		this.initialize();
		}
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
			if(this.plotVariables.length>0){ //we check the length of object, if there are nodes , then we proceed else give an error and return
		paneText += this.initTable();
		paneText += this.setTableHeader();
		paneText += this.setTableContent();
		paneText += this.closeTable();
			} 
			else //Error telling there are no nodes and Table cant be rendered
			{
		paneText = "There is nothing to show in the table.	Please define some quantitites."; 
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
		var solution = this.findSolution(true, this.plotVariables); // Return value from findSlution in calculation, returns an array and we check for status and any missing nodes
		if(solution.status=="error" && solution.type=="missing")
		{
		   this.dialogWidget.set("content", "<div>Not all nodes have been completed. For example, \""+solution.missingNode+"\" is not yet fully defined."); //We show the error message like "A Node is Missing"
		   return;
		}
		
		
			for(var i=0; i<solution.times.length; i++){
		tableString += "<tr>";
		tableString += "<td align='center'>" + solution.times[i].toPrecision(4) + "</td>";
		//set values in table according to their table-headers
		array.forEach(solution.plotValues, function(value){
					tableString += "<td align='center'>" + value[i].toPrecision(3) + "</td>";
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
