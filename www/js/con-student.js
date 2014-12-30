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

/*
 * Student mode-specific handlers
 */

define([
	"dojo/aspect",
	"dojo/_base/array", 
	'dojo/_base/declare', 
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/ready",
	'dijit/registry',
	'./controller',
	"./pedagogical_module",
	"./typechecker"
], function(aspect, array, declare, lang, dom, ready, registry, controller, PM, typechecker){
	// Summary: 
	//			MVC for the node editor, for students
	// Description:
	//			Handles selections from the student as he/she completes a model;
	//			inherits controller.js
	// Tags:
	//			controller, student mode, coached mode, test mode
	
	/*
	 Methods in controller specific to the student modes
	 */

	return declare(controller, {
		_PM: null,
        _previousExpression:null,
		constructor: function(mode, subMode, model){
			console.log("++++++++ In student constructor");
			this._PM = new PM(mode, subMode, model);
			lang.mixin(this.widgetMap, this.controlMap);
			ready(this, "populateSelections");
			this.init();
		},

		resettableControls: ["initial","equation"],

		init:function(){
			aspect.after(this, "closeEditor", function(){
				var directives = this._PM.notifyCompleteness(this._model);
				this.applyDirectives(directives);
			}, true);
		},
		// A list of control map specific to students
		controlMap: {
			description: "selectDescription",
			units: "selectUnits",
			inputs: "nodeInputs"
		},

		setPMState: function(state){
			this._PM.setState(state);
		},

		populateSelections: function(){
			/*
			 Initialize select options in the node editor that are
			 common to all nodes in a problem.
			 
			 In AUTHOR mode, this needs to be done when the
			 node editor is opened.
			 */
			// Add fields to Description box and inputs box
			// In author mode, the description control must be a text box
			var d = registry.byId(this.controlMap.description);
			// populate input field
			var t = registry.byId(this.controlMap.inputs);
			if(!t){
				this.logging.clientLog("assert", {
					message: "Can't find widget for "+this.controlMap.inputs,
					functionTag: 'populateSelections'
				});
			}

			var positiveInputs = registry.byId("positiveInputs");
			var negativeInputs = registry.byId("negativeInputs");
			console.log("description widget = ", d, this.controlMap.description);
			//  d.removeOption(d.getOptions()); // Delete all options

			//get descriptions to sort as alphabetic order
			var descriptions = this._model.given.getDescriptions();
            //create map of names for sorting
            var descNameMap = {};
            array.forEach(descriptions,function(desc){
                descNameMap[desc.value]=this._model.given.getName(desc.value);
            },this);
			descriptions.sort(function(obj1, obj2){
				//return obj1.label > obj2.label;
                    return descNameMap[obj1.value] > descNameMap[obj2.value];
			},this);

			array.forEach(descriptions, function(desc){
				d.addOption(desc);
				var name = this._model.given.getName(desc.value);
				var option = {label: name + " (" + desc.label + ")", value: desc.value};
				t.addOption(option);
				positiveInputs.addOption(option);
				negativeInputs.addOption(option);
			}, this);
		},

		//  should be moved to a function in controller.js
		autocreateNodes:function(/** auto node id **/ id, /**variable name**/ variable){
			console.log("auto creating nodes student controller");
			//getDescriptionID using variable name
			var descID = this._model.given.getNodeIDByName(variable);
			//setDescriptionID for the node id
			this._model.active.setDescriptionID(id, descID);
			var directives = this._PM.processAnswer(id, 'description', descID, this._model.given.getName(descID));
			// Need to send to PM and update status, but don't actually
			// apply directives since they are for a different node.
			array.forEach(directives,function(directive){
                this.updateModelStatus(directive,id);
            }, this);
			this.updateNodeLabel(id);
		},
        isExpressionChanged:function(){
            var evalue=registry.byId(this.controlMap.equation).get("value");
            if(this._previousExpression)
            {
                var expr=evalue;
                expr=expr.replace(/\s+/g, '');
                if(expr==this._previousExpression)
                {
                    alert("Expression is same, Please modify the expression.");
                    return true;
                }else{
                    this._previousExpression=expr;
                }
            }else{
                this._previousExpression=evalue.replace(/\s+/g,'');
            }
            return false;
        },
		handleDescription: function(selectDescription){
			console.log("****** in handleDescription ", this.currentID, selectDescription);
			if(selectDescription == 'defaultSelect'){
				return; // don't do anything if they choose default
			}
			this._model.active.setDescriptionID(this.currentID, selectDescription);
			this.updateNodes();

			// This is only needed if the type has already been set,
			// something that is generally only possible in TEST mode.
			this.updateEquationLabels();

			this.applyDirectives(this._PM.processAnswer(this.currentID, 'description', selectDescription, this._model.given.getName(selectDescription)));
			if(this._forumparams){
				// enable forum button and activate the event
				this.activateForumButton();
			}
		},

		handleType: function(type){
			console.log("****** Student has chosen type ", type, this);
			if(type == 'defaultSelect')
				return; // don't do anything if they choose default
			this.updateType(type);
			this.applyDirectives(this._PM.processAnswer(this.currentID, 'type', type));
		},
		typeSet: function(value){
			this.updateType(value);
		},
	
		/*
		 Handler for initial value input
		 */
	
		handleInitial: function(initial){
			//IniFlag returns the status and initial value
			var IniFlag = typechecker.checkInitialValue(this.widgetMap.initial, this.lastInitial);
			if(IniFlag.status){ 
				//If the initial value is not a number or is unchanged from 
				// previous value we dont process
				var newInitial = IniFlag.value;
				this._model.active.setInitial(this.currentID, newInitial);
				this.applyDirectives(this._PM.processAnswer(this.currentID, 'initial', newInitial));
			}else if(IniFlag.errorType){
				this.logging.log('solution-step', {
					type: IniFlag.errorType,
					node: this._model.active.getName(this.currentID),
					property: "initial-value",
					value: initial,
					correctResult: this._model.active.getInitial(this.currentID),
					checkResult: "INCORRECT"
				});
			}

		},
		
		initialSet: function(value){
			this._model.active.setInitial(this.currentID, value);
		},

		/*
		*	 handle event on inputs box
		* */
		handleInputs: function(id){
			//check if id is  not select else return

			console.log("*******Student has chosen input", id, this);
			// Should add name associated with id to equation
			// at position of cursor or at the end.
			var expr = this._model.given.getName(id);
			this.equationInsert(expr);
			//restore to default  - creating select input as stateless
			registry.byId(this.controlMap.inputs).set('value', 'defaultSelect', false);
		},
		handleUnits: function(unit){
			console.log("*******Student has chosen unit", unit, this);

			// updating node editor and the model.
			this._model.student.setUnits(this.currentID, unit);
			this.applyDirectives(this._PM.processAnswer(this.currentID, 'units', unit));
		},
		unitsSet: function(value){
			// Update the model.
			this._model.student.setUnits(this.currentID, value);
		},
		equationDoneHandler: function(){
			var directives = [];
            if(this.isExpressionChanged())
                    return; //2365 fix, just to check pattern change, not evaluating 
			var parse = this.equationAnalysis(directives, false);
			if(parse){
				var dd = this._PM.processAnswer(this.currentID, 'equation', parse, registry.byId(this.controlMap.equation).get("value"));
				directives = directives.concat(dd);
			}
			this.applyDirectives(directives);
		},
		equationSet: function(value){
			// applyDirectives updates equationBox, but not equationText:
			dom.byId("equationText").innerHTML = value;

			var directives = [];
			// Parse and update model, connections, etc.
				this.equationAnalysis(directives);
			// Generally, since this is the correct solution, there should be no directives
			this.applyDirectives(directives);
		},

		/* 
		 Settings for a new node, as supplied by the PM.
		 These don't need to be recorded in the model, since they
		 are applied each time the node editor is opened.
		 */
		initialControlSettings: function(nodeid){
			// Apply settings from PM
			this.applyDirectives(this._PM.newAction(), true);

			// Set the selected value in the description.
			var desc = this._model.student.getDescriptionID(nodeid);
			console.log('description is', desc || "not set");
			registry.byId(this.controlMap.description).set('value', desc || 'defaultSelect', false);

			/*
			 Set color and enable/disable
			 */
			array.forEach(this._model.student.getStatusDirectives(nodeid), function(directive){
				var w = registry.byId(this.controlMap[directive.id]);
				w.set(directive.attribute, directive.value);
				// The actual values should be in the model itself, not in status directives.
				if(directive.attribute == "value"){
					this.logging.clientLog("error", {
						message: "Values should not be set in status directives",
						functionTag: 'initialControlSettings'
					});
				}
			}, this);
		},

		// Need to save state of the node editor in the status section
		// of the student model.  See documentation/json-format.md
		updateModelStatus: function(desc, id){
			//in case of autocreation nodes, id must be passed explicitly
			id = id || this.currentID;
			if(this.validStatus[desc.attribute]){
				var opt = {};
				opt[desc.attribute] = desc.value;
				this._model.student.setStatus(id, desc.id, opt);
			}else{
				// There are some directives that should update
				// the student model node (but not the status section).

				// console.warn("======= not saving in status, node=" + this.currentID + ": ", desc);
			}
		},

		checkDonenessMessage: function (){
			// Returns true if model is not complete.
			var directives = this._PM.checkDoneness(this._model);
			this.applyDirectives(directives);
			return directives;
		}

	});
});
