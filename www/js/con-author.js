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
/*
 * AUTHOR mode-specific handlers
 */

define([
	"dojo/_base/array", 
	'dojo/_base/declare', 
	"dojo/_base/lang",
	'dojo/dom-style', 
	'dojo/ready',
	"dojo/store/Memory",
	'dijit/registry',
	'./controller',
	"./equation",
	"./typechecker",
	"dojo/domReady!"
], function(array, declare, lang, style, ready, memory, registry, controller, equation, typechecker){

	// Summary: 
	//			MVC for the node editor, for authors
	// Description:
	//			Makes pedagogical desicions for author mode; handles selections 
	//			from the author; inherits controller.js
	// Tags:
	//			controller, pedagogical module, author mode
	
	return declare(controller, {

		//pedagogical module class for author
		authorPM:{
			process: function(nodeID, nodeType, value, validInput){
				var returnObj=[];
				switch(nodeType){
				case "type":
					returnObj.push({attribute:"status", id:"type", value:"entered"});
					if(value == "parameter"){
						//disable inputs and expression
						returnObj.push({attribute:"disabled", id:"initial", value:false});

						returnObj.push({attribute:"disabled", id:"inputs", value:true});
						returnObj.push({attribute:"status", id:"inputs", value:""});

						returnObj.push({attribute:"disabled", id:"equation", value:true});
						returnObj.push({attribute:"status", id:"equation", value:""});
					}else if(value == "function"){
						returnObj.push({attribute:"disabled", id:"initial", value:true});
						returnObj.push({attribute:"status", id:"initial", value:""});

						returnObj.push({attribute:"disabled", id:"inputs", value:false});

						returnObj.push({attribute:"disabled", id:"equation", value:false});
					}else if(value == "accumulator"){
						returnObj.push({attribute:"disabled", id:"initial", value:false});

						returnObj.push({attribute:"disabled", id:"inputs", value:false});

						returnObj.push({attribute:"disabled", id:"equation", value:false});
					}
					else{
						returnObj.push({id:"type", attribute:"status", value:""});
						returnObj.push({id:"message", attribute:"append", value:"Please select node type"});
						returnObj.push({attribute:"disabled", id:"initial", value:false});

						returnObj.push({attribute:"disabled", id:"inputs", value:false});

						returnObj.push({attribute:"disabled", id:"equation", value:false});
					}
					break;

				case "name":
					if(!nodeID && validInput){
						returnObj.push({id:"message", attribute:"append", value:"node name is available for use"});
						returnObj.push({id:"name", attribute:"status", value:"entered"});
					}else if(!validInput){
						returnObj.push({id:"message", attribute:"append", value:"Please enter a valid name without using numbers"});
						returnObj.push({id:"name", attribute:"status", value:"incorrect"});
					}else{
						returnObj.push({id:"message", attribute:"append", value:"Node name is already in use"});
						returnObj.push({id:"name", attribute:"status", value:"incorrect"});
					}
					break;

				case "kind":
					var message="";
					returnObj.push({id:"kind", attribute:"status", value:"entered"});
					if(value == "allowed"){
						message	 = "One may include this quantity in a solution, but they can solve the problem without it.";
					}else if(value == "extra"){
						message	 = "This quantity is mentioned in the problem description, but it not part of a valid model.";
					}else if(value == "irrelevant"){
						message	 = "This quantity is not part of a valid solution and is not mentioned in the description.";
					}else{
						message = "Solution quantity";
					}
					returnObj.push({id:"message", attribute:"append", value:message});
					break;

				case "description":
					if(!value){
						returnObj.push({id:"description", attribute:"status", value:""});
					}else if(nodeID && value){
						returnObj.push({id:"description", attribute:"status", value:"incorrect"});
						returnObj.push({id:"message", attribute:"append", value:"Description is already in use"});
					}else{
						returnObj.push({id:"description", attribute:"status", value:"entered"});
					}
					break;

				case "initial":
					if(value && validInput){
						returnObj.push({id:"initial", attribute:"status", value:"entered"});
					} else if(value && !validInput){
						returnObj.push({id:"initial", attribute:"status", value:"incorrect"});
					}else{
						returnObj.push({id:"initial", attribute:"status", value:""});
					}
					break;

				case "equation":
					if(value){
						returnObj.push({id:"equation", attribute:"status", value:"entered"});
					} else {
						returnObj.push({id:"equation", attribute:"status", value:""});
					}
					break;

				case "units":
					if(value){
						returnObj.push({id:"units", attribute:"status", value:"entered"});
					}else{
						returnObj.push({id:"units", attribute:"status", value:""});
					}
					break;

				default:
			throw new Error("Unknown type: "+ nodeType + ".");
		}
				return returnObj;
		}
		},

		constructor: function(){
		console.log("++++++++ In author constructor");
		lang.mixin(this.widgetMap, this.controlMap);
		this.authorControls();
		ready(this, "initAuthorHandles");
		},

        shareBit: false,
	   resettableControls: ["name","description","initial","units","equation"],

		/*
		 Stub for setting up state saving in AUTHOR mode.
		 */


		controlMap: {
		inputs:"setInput",
		name:"setName",
		description:"setDescription",
		kind:"selectKind",
		units:"setUnits"
		},
		authorControls: function(){
		console.log("++++++++ Setting AUTHOR format in Node Editor.");
		style.set('nameControl', 'display', 'block');
		style.set('descriptionControlStudent', 'display', 'none');
		style.set('descriptionControlAuthor', 'display', 'block');
		style.set('selectUnitsControl', 'display', 'none');
		style.set('setUnitsControl', 'display', 'inline');
		style.set('inputControlAuthor', 'display', 'block');
		style.set('inputControlStudent', 'display', 'none');
		},
		initAuthorHandles: function(){
		var name = registry.byId(this.controlMap.name);
		name.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleName.apply(this, arguments);
		}));
		var kind = registry.byId(this.controlMap.kind);
		kind.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleKind.apply(this, arguments);
		}));
	  },
		/*
		 Handler for type selector
		 */
		handleName: function(name){
		console.log("**************** in handleName ", name);

		/* check if node with name already exists and
			 if name is parsed as valid variable
			 */
			var nameID = this._model.given.getNodeIDByName(name);
			// If nameID is falsy give "null"; if it doesn't match, give "false"
			this.applyDirectives(this.authorPM.process(nameID?!(nameID==this.currentID):null,'name',name, equation.isVariable(name)));

			if(!this._model.given.getNodeIDByName(name) && equation.isVariable(name)){
				// check all nodes in the model for equations containing name of this node
				// replace name of this node in equation with its ID
				this._model.active.setName(this.currentID, name);
				this.updateNodes();
				this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);

				this.updateEquationLabels();
			}
		},

		handleKind: function(kind){
			console.log("**************** in handleKind ", kind);
			this._model.given.setGenus(this.currentID, kind);
			this.applyDirectives(this. authorPM.process(this.currentID, "kind", kind));
		},

		handleDescription: function(description){
			// Summary: Checks to see if the given description exists; if the
			//		description doesn't exist, it sets the description of the current node.
			var descriptionID = this._model.given.getNodeIDByDescription(description);
			// If descriptionID is falsy give "null"; if it doesn't match, give "false"
			this.applyDirectives(this.authorPM.process(descriptionID?!(descriptionID==this.currentID):null, "description", description));

			if(!this._model.active.getNodeIDByDescription(description)){

				this._model.active.setDescription(this.currentID, description);
				console.log("In AUTHOR mode. Description value is: " + description);
			}else {
				console.warn("In AUTHOR mode. Attempted to use description that already exists: " + description);
			}
		},

		handleType: function(type){
			// Summary: Sets the type of the current node.
			console.log("****** AUTHOR has chosen type ", type, this);
			this.applyDirectives(this.authorPM.process(this.currentID,'type', type));
			if(type == 'defaultSelect' || type == ''){
				console.log("undo type selection");
				this.logging.clientLog("error", {
					message: "no type selected for author node type",
					functionTag: "handleType"
				});
				type = "";
			}
			this.updateType(type);
		},
		handleUnits: function(units){
			console.log("**************** in handleUnits ", units);
			// Summary: Sets the units of the current node.
			this._model.active.setUnits(this.currentID, units);
			this.applyDirectives(this.authorPM.process(this.currentID, "units", units));

		},
		/*
		 Handler for initial value input
		 */
		handleInitial: function(initial){
			//IniFlag contains the status and initial value
			var IniFlag = typechecker.checkInitialValue(this.widgetMap.initial, this.lastInitial);
			if(IniFlag.status){
				// If the initial value is not a number or is unchanged from 
				// previous value we dont process
				var newInitial = IniFlag.value;
				this.applyDirectives(this.authorPM.process(this.currentID, "initial", newInitial, true));
				console.log("In AUTHOR mode. Initial value is: " + newInitial);
				this._model.active.setInitial(this.currentID,newInitial);
			}else if(IniFlag.errorType){
				this.logging.log('solution-step', {
					type: IniFlag.errorType,
					node: this._model.active.getName(this.currentID),
					property: "initial-value",
					value: initial
				});
			}
		},

		handleInputs: function(name){
			console.log("In AUTHOR mode. Input selected is: " + name);
			this.equationInsert(name);
		// After variable input, reset control to its initial state.
		// Third argument keeps handler from being called.
		var inputWidget = registry.byId(this.controlMap.inputs);
		 inputWidget.set('value', '', false);
		},
		equationDoneHandler: function(){
			var directives = [];
			var parse = this.equationAnalysis(directives, true);

			if(parse){
				directives = directives.concat(this.authorPM.process(this.currentID, "equation", parse));
			}
			this.applyDirectives(directives);

		},

		initialControlSettings: function(nodeid){
			var name = this._model.given.getName(nodeid);
			registry.byId(this.controlMap.name).set('value', name || '', false);

			var desc = this._model.given.getDescription(nodeid);
			console.log('description is', desc || "not set");
			registry.byId(this.controlMap.description).set('value', desc || '', false);

			// populate inputs
			var inputsWidget = registry.byId(this.controlMap.inputs);
			var nameWidget = registry.byId(this.controlMap.name);
			var descriptionWidget = registry.byId(this.controlMap.description);
			var unitsWidget = registry.byId(this.controlMap.units);

			/*
			*	populate the nodes in the Name, Description, Units, and Inputs tab
			*	For combo-box we need to setup a data-store which is collection of {name:'', id:''} object
			*
			*/
			var inputs = [];
			var descriptions = [];
			var units = [];
			array.forEach(this._model.given.getDescriptions(), function(desc){
				if(desc.label){
					var name = this._model.given.getName(desc.value);
					var obj = {name:name, id: desc.id};
					inputs.push(obj);
			descriptions.push({name: this._model.given.getDescription(desc.value), id: desc.id});
				}
			}, this);
			array.forEach(this._model.getAllUnits(), function(unit){
				units.push({name: unit, id: unit});
			}, this);
			var m = new memory({data: inputs});
			inputsWidget.set("store", m);
			nameWidget.set("store", m);
			m = new memory({data: descriptions});
			descriptionWidget.set("store", m);
			m = new memory({data: units});
			unitsWidget.set("store", m);

			var value;
			//node is not created for the first time. apply colors to widgets
			//color name widget

			//false value is set because while creating a name we are already checking for uniqueness and checking again while re-opening the node is not needed.
			if(name){
				this.applyDirectives(this.authorPM.process(false, "name", name, equation.isVariable(name)));
		}
			//color kind widget
			if(this._model.given.getGenus(this.currentID)){
				this.applyDirectives(this.authorPM.process(this.currentID, "kind", this._model.given.getGenus(this.currentID)));
		}
			//color description widget
			//uniqueness taken care of by the handler while adding a new value. So a false value sent.
			if(this._model.given.getDescription(this.currentID)){
				this.applyDirectives(this.authorPM.process(false, "description", this._model.given.getDescription(this.currentID)));
		}
			//color units widget
			var unitsChoice = this._model.given.getUnits(this.currentID);
			if(unitsChoice && unitsChoice != 'defaultSelect'){
				this.applyDirectives(this.authorPM.process(this.currentID, 'units', this._model.given.getUnits(this.currentID)));
		}
			//color initial value widget
			if(this._model.given.getInitial(this.currentID)){
				this.applyDirectives(this.authorPM.process(this.currentID, 'initial', this._model.given.getInitial(this.currentID), true));
		}
			//color units widget
			if(this._model.given.getEquation(this.currentID)){
				this.applyDirectives(this.authorPM.process(this.currentID, 'initial', this._model.given.getInitial(this.currentID), true));
		}
			var type = this._model.given.getType(this.currentID);
			//color type widget
			if(type){
				this.applyDirectives(this.authorPM.process(this.currentID, 'type', type));
		}
			if(type && type != 'function'){
				if(this._model.given.getInitial(this.currentID))
					this.applyDirectives([{id:"initial", attribute:"status", value:"entered"}]);
			}
			if(type && type != 'parameter'){
				if(this._model.given.getEquation(this.currentID))
					this.applyDirectives([{id:"equation", attribute:"status", value:"entered"}]);
			}
		},
		updateModelStatus: function(desc){
			//stub for updateModelStatus
		},

        setShareBit:function(value){
            console.log("con author value "+value);
            this.shareBit = value;
        }
	});
});
