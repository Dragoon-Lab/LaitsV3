/* global define */
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

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dijit/registry",
	"dijit/form/HorizontalSlider",
	"./equation",
	"./integrate","./typechecker"
], function(array, declare, lang, on, dom, registry, HorizontalSlider, equation, integrate, typechecker){
	// Summary: 
	//			Finds model solutions and sets up the sliders
	// Description:
	//			Sets up and manages the sliders; listens for and registers 
	//			changes in the sliders; 
	// Tags:
	//			sliders, slider listener
	
	return declare(null, {
		
		model: null,						// model
		active: {},							// set current mode. TRUE = givenModel / FALSE = StudentModel
		
		/* variables specific to rendering graph and table */
		given: {},							// object to store calculated parameters from given model
		dialog: "",							// dialog box to be displayed
		dialogContent: "",					// Parameter to set DOM in a dialog dynamically
		sliders: {},						// Parameter to create slider objects
		_logging : null,
		mode : null,						// Parameter to hold the mode value to differentiate graphs for author and student mode.
		constructor: function(model, mode, logging){
			console.log("***** In calculations constructor", this.given);
			this.model = model;
			this.mode = mode;
			this.dialogWidget = registry.byId("solution");
			this.setLogging(logging);
			/*
			 In AUTHOR mode, plot solution for all given nodes of genus false
			 and type "accumulator" or "function""
			 The table contains the same nodes.
			 
			 In student modes, plot solution for all student nodes (of type
			 "accumulator" or "function") as well
			 as any matching given model node of genus false.
			 The table contains only the student nodes.
			 */
            this.active.timeStep = this.initializeSolution(model.active);
			if(!this.active.timeStep){
				return; // abort on error in constructing timeStep
			}
			
			this.active.initialValues = array.map(
				this.active.timeStep.xvars, 
				model.active.getInitial,
				model.active
			);
			this.active.xvarMap = {};
			array.forEach(this.active.timeStep.xvars, function(xvar, i){
				this.active.xvarMap[xvar] = i;
				
			}, this);
			
			// These are not used for the tables
			if(mode != "AUTHOR"){
				console.log("now in given model");
				this.given.timeStep = this.initializeSolution(model.given);
				if(!this.given.timeStep){
					return;	 // abort on error
				}
				this.given.initialValues = array.map(
					this.given.timeStep.xvars, 
					model.given.getInitial,
					model.given
				);
			}else{
				console.log("-------- no given solution for mode", mode); 
			}
		},
		
		initializeSolution: function(model){
			//Summary:	Initialize solution and give a message if a cycle is found.
			var timeStep = null;
			try{
				timeStep = equation.initializeTimeStep(model);
			}catch(e){
				if(e.name == "graph-cycle"){
					this.dialogWidget.set("content", "<div>This model cannot be solved:<br>The function nodes depend on each other in an inconsistant manner.</div>");
					this._logging.clientLog("warning", {
						message: "there is a cycle in the model and thus graph cant be shown",
						functionTag : "initializeSolution"
					});
				}
			}
			return timeStep;
		},
		
		findSolution: function(isActive, plotVariables){ 
			// Summary:	 Find a solution
			// Returns:	 an object of the form
			//			{status: s, type: m, missingNode: n/soln: solution}
		    var choice = isActive?this.active:this.given;
            /*
			 Calculate solution by solving differential 
			 equation for accumulator nodes
			 */
			try { // we try to run the method because there might be some nodes missing and an error is generated
				var solution;
				console.log(this.model.getIntegrationMethod());
                if(this.model.getIntegrationMethod() == "Midpoint Method")
					solution = integrate.midpointMethod(
					choice.timeStep, 
					equation.evaluateTimeStep,
					choice.initialValues, 
					this.model.getTime());
				else
					solution = integrate.eulersMethod(
					choice.timeStep, 
					equation.evaluateTimeStep,
					choice.initialValues, 
					this.model.getTime());
			}
			catch(err){ // we catch the correspoding error here
            	var if_id=err.message.substr(19).trim(); //In case the name is not generated and a node id is , we have to get the name from the active object for the user to understand
				console.log("catch error",this.model.active.getName(if_id));  
				if(this.model.active.getName(if_id)){
					var miss_node=this.model.active.getName(if_id); // In case a node is incomplete
				}else{
					miss_node=if_id;
				}
				this._logging.clientLog("error", {
					message:"graph/table created with missing node : "+miss_node,
					functionTag : "findSolution"
				});
				return {status: 'error', type: 'missing', missingNode: miss_node};
			}
			/*
			 Given a solution, create an array of values for the
			 list of plot variables.  The list may include function nodes.
			 */
			if(plotVariables){
				// If id is null, then make row null
				var plotValues = array.map(plotVariables, function(x){
					return x?[]:null;
				});
				var timeStep = choice.timeStep;
				// Copy parameters object.
				var variables = lang.mixin({}, timeStep.parameters);
				for(var i=0; i<solution.times.length; i++){
					for(var j=0; j<timeStep.xvars.length; j++){
						variables[timeStep.xvars[j]] = solution.values[j][i];
					}
					array.forEach(timeStep.functions, function(id){
						variables[id] = timeStep.parse[id].evaluate(variables, solution.times[i]);
					});
					array.forEach(plotVariables, function(id, k){
						if(id){
							plotValues[k].push(variables[id]);
						}
					});
				}		
				return {times: solution.times, plotValues: plotValues};
			}else{
				return {status: 'solution', soln: solution};
			}
		},

		labelString: function(id){
			// Summary:	 Return a string containing the quantity name and any units.
			// id:	Node id for active model; null returns time label
			var label = id?this.model.active.getName(id):"time";
			var units = id?this.model.active.getUnits(id):this.model.getUnits();
			if(units){
				label += " (" + units + ")";
			}
			return label;
		},

		/* @brief: this function registers event on slider from graph and table
		 *	graph and table-specific functionality is carried out in renderGraph/renderTable
		 */
		registerEventOnSlider: function(slider, index, paramID, transform){
			// Summary:	 When slider is changed, put value in textbox 
			//			 and emit change event
			/* 
			 If plotting is too slow, then "change" makes the
			 slider appear "stuck."	 Need to find some way to update
			 the plots without blocking all other processes.
			 */
			// Can use "change" or "mouseup"
			on(slider, "change", lang.hitch(this, function(){
				var input = dom.byId(index);
				// Print slider value in box.
				input.value = transform(slider.value).toPrecision(3);
				// Fire an "onchange" event since the value has changed.
				on.emit(input, "change", {});
			}));
		},
		_rendering: false,

		getTime: function(){
			// Returns time in seconds since start of session.
			return	((new Date()).getTime() - this._startTime)/1000.0;
		},

		_startTime: (new Date()).getTime(),

		/*
		 * @brief: create a dom based on input parameters
		 * @param: domType - type of dom to be created (e.g div, input, label)
		 * @param: domId - Id to be assigned
		 * @param: domParam - parameters to be passed to a dom. this will be a string describing node properties. e.g style="width:200px" will be passed
		 * to domParam to assign it to the node
		 * @param: domText - text to be contained in dom. e.g <label>TEXT</label>. domText = TEXT in this case
		 */

		// This function is simply helping text handlers to apply the value to new graphs
		applyTextValueToGraph: function(textBoxID, paramID){
			// Using a JavaScript closure:
			// The value of 'index' is still available when the change event is fired.
			var index = dom.byId(textBoxID[paramID]);
            var last_index_value={value: index.value};
			on(index, "change",	 lang.hitch(this, function(){
				console.log("---- value box change ", this.getTime());
                //We use a Non-numeric value check from typechecker to make sure
                //non numeric values shouldn't be sent to graph/table for a change
                var temp_ret=typechecker.checkInitialValue(textBoxID[paramID], last_index_value);
                //if there is an error returned typechecker shows the error
                //and at the same time we return without further rendering grpah/table
                if(temp_ret.errorType) return;
                if(this._rendering){
					console.log("	  returning");
					return;
				}
				this._rendering = true;
				var active = this.active;
				console.log("--> paramID is: ", paramID);
				if(paramID in active.timeStep.parameters){
					active.timeStep.parameters[paramID] = temp_ret.value;
					console.log("Time step: ", temp_ret.value);
				}else if(paramID in active.xvarMap){
					active.initialValues[active.xvarMap[paramID]] = temp_ret.value;
					console.log("Initial value: ", temp_ret.value);
				}else{
					throw new Error("Invalid id", paramID);
				}
				this.findSolution(true); // Solve active model
				console.log("	   new solution", this.getTime());
				//this function is specific to graph/table
				this.renderDialog();
				this._rendering = false;
				console.log("	   new plot done", this.getTime());
			}));
		},

		/*
		 * @brief: create slider object for graphs and table
		 */
		createSliderAndDialogObject: function(){
			var units;
			var sliderVars = lang.clone(this.active.timeStep.parameters);
			for(var j=0; j<this.active.timeStep.xvars.length; j++){
				sliderVars[this.active.timeStep.xvars[j]] = this.active.initialValues[j];
			}
			var textBoxID = {}, sliderID = {};
			//create sliders based on number of input parameters
			for(var paramID in sliderVars){

				/*
				 Determine range and transform to use for slider
				 */
				var val = sliderVars[paramID], min, max, transform;
				if(val==0){
					transform = function(x){ return x; }; // identity function
					min = -1;
					max = 1;
				}else if(val>0){
					// Range from 1/10 to 10 times the nominal value
					// Use logarithmic scale for the slider.
					transform = Math.exp;
					val = Math.log(val);
					min = val - Math.log(10);
					max = val + Math.log(10);
				}else{
					transform = function(x){ return x; }; // identity function
					min = 2*val;
					max = -2*val;
				}

				// create slider
				// The associated css style sheet is loaded by css/dragoon.css
				this.sliders[paramID] = new HorizontalSlider({
					name: this.sliderID + paramID,
					value: val,
					minimum: min,
					maximum: max,
					intermediateChanges: true,
					style: "width:300px;margin:3px;"
				}, this.sliderID + paramID);

				var labelText = this.model.active.getName(paramID);
				if(paramID in this.active.xvarMap){
					labelText = "Initial " + labelText;
				}
				// DOM id for the text <input>.
				textBoxID[paramID] = this.textBoxID + "_" + paramID;
				this.registerEventOnSlider(this.sliders[paramID], textBoxID[paramID], paramID, transform);
				//create label for name of a textbox
				//create input for a textbox
				//create div for embedding a slider
				this.dialogContent += "\<label>" + labelText + " = " + "\</label>";
				// The input element does not have an end tag so we can't use
				// this.createDom().
				// Set width as number of characters.
				this.dialogContent += "<input id=\"" + textBoxID[paramID] + "\" type=\"text\" size=10>";
				units = this.model.active.getUnits(paramID);
				if(units){
					this.dialogContent += " " + units;
				}
				this.dialogContent += "<br>";
				// DOM id for slider <div>
				sliderID[paramID] = this.sliderID + "_" + paramID;
				this.dialogContent += "<div id='" + sliderID[paramID] + "'> " + "\</div>";
			}

			var dialogWidget = registry.byId("solution");
			dialogWidget.set("title", this.model.getTaskName() + " - " + this.type);
			// Attach contents of dialog box to DOM all at once
			dialogWidget.set("content", this.dialogContent);

			// Attach slider widget to DOM
			for(paramID in sliderVars){
				dom.byId(textBoxID[paramID]).value = sliderVars[paramID];
				dom.byId(sliderID[paramID]).appendChild(this.sliders[paramID].domNode);
			}

			// Attach text handles to slider text box
			for(paramID in sliderVars){
				this.applyTextValueToGraph(textBoxID, paramID);
			}
		},

		/* @brief: display the graph*/
		show: function(){
			this.dialogWidget.show();
			var content = this.dialogWidget.get("content").toString();
			if(content.search("There isn't anything to plot. Try adding some accumulator or functionnodes.") >= 0 
					||content.search("There is nothing to show in the table.	Please define some quantitites.") >= 0 ||
					this.mode == "EDITOR" || !this.model.isCompleteFlag) {
				return;
			}
			var contentMsg = this.model.getTaskLessonsLearned();
			var shown = this.model.isLessonLearnedShown;
			this.model.isLessonLearnedShown = true;
			var lessonsLearnedButton = registry.byId("lessonsLearnedButton");   
			lessonsLearnedButton.set("disabled", false);
			
			var handle = this.dialogWidget.connect(this.dialogWidget,"hide",function(e) {
				if(!contentMsg || shown) {
					if(!contentMsg) {
						lessonsLearnedButton.set("disabled", true);
					}
					return;
				}
				var lessonLearnedDialog = registry.byId("lesson");
				var titleMsg = "Lessons Learned";
				var contentHTML = "<font size='2'>" + contentMsg[0];
				for(var i=1;i<contentMsg.length;i++) {
					contentHTML = contentHTML +"<br>"+contentMsg[i];
				}
				contentHTML = contentHTML + "</font>";
				lessonLearnedDialog.set("content", contentHTML);
				lessonLearnedDialog.set("title", titleMsg);
				lessonLearnedDialog.show();
				dojo.disconnect(handle);
			});
			
			lang.hitch(this, handle);
		},

		setLogging: function(/*string*/ logging){
			this._logging = logging;
		}

	});
});
