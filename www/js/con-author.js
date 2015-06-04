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
/*
 * AUTHOR mode-specific handlers
 */

define([
	"dojo/_base/array",
	'dojo/_base/declare',
	"dojo/_base/lang",
	'dojo/dom-style',
	'dojo/keys',
	'dojo/ready',
	"dojo/store/Memory",
	"dojo/aspect",
	'dijit/registry',
	'./controller',
	"./equation",
	"./typechecker",
    "dojo/dom",
	"dojo/domReady!"
], function(array, declare, lang, style, keys, ready, memory, aspect, registry, controller, equation, typechecker, dom){

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

                        //disable and uncheck root node
                        returnObj.push({attribute:"checked", id:"root", value:false});
                        returnObj.push({attribute:"disabled", id:"root", value:true});
					}else if(value == "function"){
						returnObj.push({attribute:"disabled", id:"initial", value:true});
						returnObj.push({attribute:"status", id:"initial", value:""});

						returnObj.push({attribute:"disabled", id:"inputs", value:false});

						returnObj.push({attribute:"disabled", id:"equation", value:false});

                        returnObj.push({attribute:"disabled", id:"root", value:false});
					}else if(value == "accumulator"){
						returnObj.push({attribute:"disabled", id:"initial", value:false});

						returnObj.push({attribute:"disabled", id:"inputs", value:false});

						returnObj.push({attribute:"disabled", id:"equation", value:false});

                        returnObj.push({attribute:"disabled", id:"root", value:false});
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
					}else if(value == "required"){
						message = "Solution quantity";
					}else{
						message = "Please select Kind of Quantity";
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
					if(validInput){
						returnObj.push({id:"initial", attribute:"status", value:"entered"});
					}else{
						// This never happens
						returnObj.push({id:"initial", attribute:"status", value:"incorrect"});
					}
					break;

				case "equation":
					if(validInput === false){
						returnObj.push({id:"equation", attribute:"status", value:"incorrect"});
					}
					else if(value){
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
		    //initialize error status array to track cleared expression for given model nodes
			this.errorStatus =[];
			ready(this, "initAuthorHandles");
		},

		resettableControls: ["name","description","initial","units","equation"],

		controlMap: {
			inputs: "setInput",
			name: "setName",
			description: "setDescription",
			kind: "selectKind",
			units: "setUnits",
			root: "markRootNode",
			student: "setStudentNode",
			modelType: "selectModel"
		},
		authorControls: function(){
			console.log("++++++++ Setting AUTHOR format in Node Editor.");
			style.set('nameControl', 'display', 'block');
			style.set('descriptionControlStudent', 'display', 'none');
			style.set('descriptionControlAuthor', 'display', 'block');
			style.set('selectUnitsControl', 'display', 'none');
			style.set('setUnitsControl', 'display', 'inline');
            style.set('setRootNode', 'display', 'block')
			style.set('inputControlAuthor', 'display', 'block');
			style.set('inputControlStudent', 'display', 'none');
			style.set('studentModelControl', 'display', 'inline-block');
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
			var root = registry.byId(this.controlMap.root);
			root.on('Change', lang.hitch(this, function(checked){
					return this.disableHandlers || this.handleRoot(checked);
			}));
			var setStudentNode = registry.byId(this.controlMap.student);
			setStudentNode.on('Change', lang.hitch(this, function(checked){
					return this.disableHandlers || this.handleSetStudentNode(checked);
			}));
			var selectModel = registry.byId(this.controlMap.modelType);
			selectModel.on('Change', lang.hitch(this, function(){
					return this.disableHandlers || this.handleSelectModel.apply(this, arguments);
			}));
			var givenEquation = registry.byId("givenEquationBox");
			givenEquation.on('Change', lang.hitch(this, function(){
					return this.disableHandlers || this.handleGivenEquation.apply(this, arguments);
			}));

			this.handleErrorMessage(); //binds a function to Display Error message if expression is cleared.
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
			
			var logObj = {};
			if(!this._model.given.getNodeIDByName(name) && equation.isVariable(name)){
				// check all nodes in the model for equations containing name of this node
				// replace name of this node in equation with its ID
				this._model.active.setName(this.currentID, name);
				this.updateNodes();
				//not required - because updateNodes() will add connections automatically
				//this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);
				this.updateEquationLabels();
				logObj = {
					error: false
				};
			} else {
				//logging the error case
				logObj = {
					error: true
				};
				if(this._model.given.getNodeIDByName(name)){
					lang.mixin(logObj, {
						message: "duplication"
					});
				} else if(equation.isVariable(name)){
					lang.mixin(logObj, {
						message: "parse"
					});
				}
			}
			this.enableDisableSetStudentNode();
			
			logObj = lang.mixin({
				type: "solution-enter",
				nodeID: this.currentID,
				propoerty: "name",
				node: name,
				value: name
			}, logObj);
			this.logging.log('solution-step', logObj);
		},

		updateInputNode: function(/** auto node id **/ id, /**variable name**/ variable){
			console.log("updating nodes in author controller");
			//update the name for nodeid
			// BvdS:  when we set the name we don't send to author PM
			// since there is nothing to update in the node editor since
			// this is a different node.
			this._model.active.setName(id, variable);
			// update Node labels upon exit
			this.updateNodeLabel(id);
		 },

		handleKind: function(kind){
			console.log("**************** in handleKind ", kind);
			if(kind == "defaultSelect" || kind == ''){
				this.logging.clientLog("error", {
					message: "no kind selected for author node type",
					functionTag: "handleKind"
				});
				kind = "defaultSelect";
				this._model.given.setGenus(this.currentID, kind);
			}else{
				this._model.given.setGenus(this.currentID, kind);
				this.applyDirectives(this. authorPM.process(this.currentID, "kind", kind));
			}

			this.logging.log('solution-step', {
				type: "solution-enter",
				nodeID: this.currentID,
				property: "kind",
				node: this._model.given.getName(this.currentID),
				value: kind
			});
		},

		handleDescription: function(description){
			// Summary: Checks to see if the given description exists; if the
			//		description doesn't exist, it sets the description of the current node.
			var descriptionID = this._model.given.getNodeIDByDescription(description);
			// If descriptionID is falsy give "null"; if it doesn't match, give "false"
			this.applyDirectives(this.authorPM.process(descriptionID?!(descriptionID==this.currentID):null, "description", description));
			
			var logObj = {};

			if(!this._model.active.getNodeIDByDescription(description)){
				this._model.active.setDescription(this.currentID, description);
				logObj = {
					error: false
				};
			}else {
				console.warn("In AUTHOR mode. Attempted to use description that already exists: " + description);
				logObj = {
					error: true,
					message: "duplication"
				};
			}
			if(this._forumparams){
				// enable forum button and activate event
				this.activateForumButton();
			}
			logObj = lang.mixin({
				type: "solution-enter",
				nodeID: this.currentID,
				property: "description",
				node: this._model.given.getName(this.currentID),
				value: description
			}, logObj);
			
			this.logging.log('solution-step', logObj);
			this.enableDisableSetStudentNode();
		},

        handleRoot: function(root){
            // Summary: Sets the current node to be parent node
            console.log("********************* in handleRoot", root);
            this._model.given.setParent(this.currentID, root);

			this.logging.log("solution-step", {
				type: "solution-enter",
				nodeID: this.currentID,
				property: "root",
				node: this._model.given.getName(this.currentID),
				value: root
			});
        },

		handleSetStudentNode: function(checked){
			console.log("********************* in handleSelecetModel", checked);
			if(checked){
				style.set('selectModelControl', 'display', 'block');
				var studentNode = this._model.student.getNodeIDFor(this.currentID);
				if(studentNode == null){
					this.addStudentNode(this.currentID);
				}
			}else{
				this._model.active = this._model.given;
				registry.byId("selectModel").set('value',"correct");
				style.set('selectModelControl', 'display', 'none');
				this.removeStudentNode(this.currentID);
			}
		},

		handleSelectModel: function(modelType){
			if(modelType === "correct"){
				this.controlMap.equation = "equationBox";
				style.set('equationBox', 'display', 'block');		//show EquationBox
				style.set('givenEquationBox', 'display', 'none');	//hide GivenEquationBox
				this._model.active = this._model.given;
				this.enableDisableFields(modelType);
				this.populateNodeEditorFields(this.currentID);

			}
			else if(modelType === "given"){
				var equation = registry.byId("equationBox");
				style.set('givenEquationBox', 'display', 'block'); //show GivenEquationBox
				style.set('equationBox', 'display', 'none');	   //hide EquationBox
				this.controlMap.equation = "givenEquationBox";	   //use "givenEquationBox" as current equationbox ID
				if(equation.value && !this.equationEntered){
					//Crisis alert popup if equation not checked
					this.applyDirectives([{
						id: "crisisAlert", attribute:
						"open", value: "Your expression has not been checked!  Go back and check your expression to verify it is correct, or delete the expression, before closing the node editor."
					}]);
					registry.byId("selectModel").set('value',"correct");
				}
				else{
					this._model.active = this._model.student;
					this.enableDisableFields(modelType);
					this.getStudentNodeValues(this.currentID);
				}
			}
		},
		
		handleType: function(type){            
            var studentNodeID = this._model.student.getNodeIDFor(this.currentID);
            if(this.getModelType() == "correct"){
				// Summary: Sets the type of the current node.				
				this.applyDirectives(this.authorPM.process(this.currentID,'type', type));
				if(type == 'defaultSelect' || type == ''){
					this.logging.clientLog("error", {
						message: "no type selected for author node type",
						functionTag: "handleType"
					});
					type = "";
				}
				this.updateType(type);
				//update student node status
                this.updateStatus("type", type,  this._model.student.getType(studentNodeID));
            }
			else if(this.getModelType() == "given"){
				this.controlMap.equation = "givenEquationBox";
				this._model.active.setType(studentNodeID, type);
				if(type == "function"){
					if(this._model.active.getInitial(studentNodeID) === "number"){
						var initialNode = registry.byId(this.controlMap.initial);
						initialNode.set("value", "");
						this._model.active.setInitial(studentNodeID, "");
					}
					registry.byId(this.controlMap.inputs).set("disabled", false);
					registry.byId(this.controlMap.equation).set("disabled", false);
					registry.byId(this.controlMap.initial).set("disabled", true);
				}
				if(type == "parameter"){
					var equationNode = registry.byId(this.controlMap.equation);
					equationNode.set("value", "");
					this._model.active.setEquation(studentNodeID, '');
                    registry.byId(this.controlMap.initial).set("disabled", false);
					registry.byId(this.controlMap.inputs).set("disabled", true);
					registry.byId(this.controlMap.equation).set("disabled", true);
				}
				if(type == "accumulator"){
                    registry.byId(this.controlMap.initial).set("disabled", false);
                    registry.byId(this.controlMap.inputs).set("disabled", false);
					registry.byId(this.controlMap.equation).set("disabled", false);
					//registry.byId(this.controlMap.equation).set("disabled", false);
				}
				//update student node status
                this.updateStatus("type", this._model.given.getType(this.currentID), type);
            }

			var valueFor = this.getModelType() == "given" ? "student-model": "author-model";
			this.logging.log("solution-step", {
				type: "solution-enter",
				nodeID: this.currentID,
				node: this._model.given.getName(this.currentID),
				property: "type",
				value: type,
				usage: valueFor
			});
		},

		handleUnits: function(units){
			console.log("**************** in handleUnits ", units);
			// Summary: Sets the units of the current node.
			var modelType = this.getModelType();
			this.applyDirectives(this.authorPM.process(this.currentID, "units", units));
			var studentNodeID = this._model.student.getNodeIDFor(this.currentID);

			if(modelType == "given"){
				this._model.active.setUnits(studentNodeID, units);
				this.updateStatus("units", this._model.given.getUnits(this.currentID), units);
			}
			else{
				this._model.active.setUnits(this.currentID, units);
				this.updateStatus("units", units, this._model.student.getUnits(studentNodeID));
			}

			//update student node status
			var valueFor = modelType == "given" ? "student-model": "author-model";
			this.logging.log("solution-step", {
				type: "solution-enter",
				nodeID: this.currentID,
				property: "units",
				value: units,
				node: this._model.given.getName(this.currentID),
				usage: valueFor
			});
		},
		/*
		 Handler for initial value input
		 */
		handleInitial: function(initial){
			//IniFlag contains the status and initial value
			var modelType = this.getModelType();
			var tempIni = dom.byId(this.widgetMap.initial);
			var tempInival = tempIni.value.trim();
			var IniFlag = {status: undefined, value: undefined };
			if(!((modelType === "given") && (tempInival == '') )){
				IniFlag = typechecker.checkInitialValue(this.widgetMap.initial, this.lastInitial);
			}
			else{
				IniFlag  = {status: true, value: undefined};
			}
			var logObj = {};
			if(IniFlag.status){
				// If the initial value is not a number or is unchanged from
				// previous value we dont process
				var newInitial = IniFlag.value;
				this.applyDirectives(this.authorPM.process(this.currentID, "initial", newInitial, true));
				var studentNodeID = this._model.student.getNodeIDFor(this.currentID);
				var studNodeInitial = this._model.student.getInitial(studentNodeID);
				if(modelType == "given"){
					//if the model type is given , the last initial value is the new student model value
					//which in this case is second parameter
					this._model.active.setInitial(studentNodeID, newInitial);
					this.updateStatus("initial", this._model.given.getInitial(this.currentID), newInitial);
				}
				else{
					this._model.active.setInitial(this.currentID, newInitial);
					//if the model type is not given , the last initial value is the new author model value
					//which in this case is first parameter
					//if(studentNodeID)
					this.updateStatus("initial", newInitial, studNodeInitial);

				}
				//update student node status
				logObj = {
					error: false
				};
			}else if(IniFlag.errorType){
				logObj = {
					error: true,
					message: IniFlag.errorType
				};
			}
			var valueFor = modelType == "given" ? "student-model": "author-model";
			logObj = lang.mixin({
				type: "solution-enter",
				node: this._model.active.getName(this.currentID),
				nodeID: this.currentID,
				property: "initial",
				value: initial,
				usage: valueFor
			}, logObj);

			this.logging.log("solution-step", logObj);
		},

		handleInputs: function(name){
			this.equationInsert(name);
			// After variable input, reset control to its initial state.
			// Third argument keeps handler from being called.
			var inputWidget = registry.byId(this.controlMap.inputs);
			inputWidget.set('value', '', false);
		},

		equationDoneHandler: function(){
			var model = registry.byId("selectModel").value;
			if(model && model == "correct"){
				var directives = [];
				var logObj = {};
				var parse = this.equationAnalysis(directives, true);
				if(parse){
					directives = directives.concat(this.authorPM.process(this.currentID, "equation", parse));
				} else {
					logObj = {
						error: true,
						message: "parse error"
					}
				}
                console.log("directives are", directives);
				this.applyDirectives(directives);
				this.createExpressionNodes(parse, true); 
			}
			else if(model && model =="given"){
				var studentNodeID = this._model.student.getNodeIDFor(this.currentID);
				var eqn = registry.byId(this.controlMap.equation).value;
				var inputs = [];
				if(typeof equation != "undefined" && eqn != null && eqn != ""){
					var parse = equation.parse(eqn);
                    console.log("parse is ", parse);
                    this.givenEquationEntered = true;
                    array.forEach(parse.variables(), lang.hitch(this, function(variable){
						console.log("there are variables");
                        var givenID = this._model.given.getNodeIDByName(variable);
						var studentID = this._model.student.getNodeIDFor(givenID);
					    eqn = eqn.replace(variable, studentID);
						inputs.push({"ID": studentID});
                        if(studentID == null){
							this.givenEquationEntered = false;
							eqn = "";
							this.applyDirectives([{
								id: "crisisAlert", attribute:
								"open", value: "You are trying to add a node that is not part of student model."
							}]);
							registry.byId(this.controlMap.equation).set("value", "");
						    return;
                        }
					}));

					this._model.student.setInputs(inputs, studentNodeID);
					this._model.student.setEquation(studentNodeID, eqn);
					if(this.givenEquationEntered){
						style.set(this.controlMap.equation, 'backgroundColor', "#2EFEF7");
					}
					var flag = equation.areEquivalent(this.currentID, this._model, eqn);
					//update student node status
					if(!flag){
						this._model.student.setStatus(studentNodeID, "equation" , {"disabled": false,"status":"incorrect"});
					}
					else{
						this._model.student.setStatus(studentNodeID, "equation" , {"disabled": false,"status":"correct"});
					}
				}else{
					 //set status if equation is empty
					 givenEqn = this._model.given.getEquation(this.currentID);
					 if(typeof givenEqn === 'undefined' || givenEqn === "" || givenEqn === null){
						this._model.student.setStatus(studentNodeID, "equation" , {"disabled": true,"status":"correct"});
					 }
					 else{
						this._model.student.setStatus(studentNodeID, "equation" , {"disabled": false,"status":"incorrect"});
					 }
					 this._model.student.setInputs(inputs, studentNodeID);
					 this._model.student.setEquation(studentNodeID, "");
				}
			}
			var valueFor = model == "given" ? "student-model": "author-model";
			logObj = lang.mixin({	
				type: "solution-enter",
				nodeID: this.currentID,
				node: this._model.given.getName(this.currentID),
				property: "equation",
				value: registry.byId(this.controlMap.equation).get("value"),
				usage: valueFor
			}, logObj);
			this.logging.log("solution-step", logObj);
		},
		
		handleGivenEquation: function(equation){
			//Summary: changes the status of givenEquationEntered when given equation is modified
			var w = registry.byId("givenEquationBox");
			// undo color when new value is entered in the given equation box widget
			w.on("keydown",lang.hitch(this,function(evt){
				if(evt.keyCode != keys.ENTER){					
					this.givenEquationEntered = false;
					style.set(this.controlMap.equation, 'backgroundColor', '');					
				}
			}));
		},
		
		handleErrorMessage: function(){
			//Summary: Displays a message on opening node editor if expression was cleared
			aspect.after(this, "showNodeEditor", lang.hitch(this, function(){
				if(this.errorStatus.length > 0){
					array.forEach(this.errorStatus, lang.hitch(this, function(errorNode, index){
						if(errorNode.id == this.currentID){
							registry.byId("selectModel").set('value',"given");
							this.handleSelectModel("given");
							this.errorStatus.splice(index, 1);
							this.applyDirectives([{
								id: "crisisAlert", attribute:
								"open", value: "The expression in Initial Student Values was cleared because nodes were missing from the student model."
							}]);
							return;
						}
					}));
				}
			}));
		},	
		
		initialControlSettings: function(nodeid){

			// Apply settings appropriate for a new node
			// This is the equivalent to newAction() in student mode.
			this.applyDirectives([
				{attribute:"disabled", id:"root", value:true}
			]);

			var name = this._model.given.getName(nodeid);
			registry.byId(this.controlMap.name).set('value', name || '', false);

			var desc = this._model.given.getDescription(nodeid);
			registry.byId(this.controlMap.description).set('value', desc || '', false);

            // Initialize root node checkbox
			registry.byId(this.controlMap.root).set('value', this._model.given.getParent(nodeid));

			// Initialize student node checkbox
				var givenNode = this._model.given.getNode(nodeid);
				var studentNodes = this._model.student.getNodes();
				var checked = false;
				checked = array.some(studentNodes, function(node){
					return node.descriptionID === givenNode.ID;
				}, this);
				registry.byId(this.controlMap.student).set('value', checked);
				this.handleSetStudentNode(checked);
			if(name != null && desc != null){
				registry.byId(this.controlMap.student).set('disabled', false);
			}
			else{
				registry.byId(this.controlMap.student).set('disabled', true);
			}

			// populate inputs
			var inputsWidget = registry.byId(this.controlMap.inputs);
			var nameWidget = registry.byId(this.controlMap.name);
			var descriptionWidget = registry.byId(this.controlMap.description);
			var unitsWidget = registry.byId(this.controlMap.units);
			var kind = registry.byId(this.controlMap.kind);
			
			var value = this._model.given.getGenus(this.currentID);
			if(!value)
				value='required';
			kind.set('value',value);

			/*
			*	populate the nodes in the Name, Description, Units, and Inputs tab
			*	For combo-box we need to setup a data-store which is collection of {name:'', id:''} object
			*
			*/
			var inputs = [];
			var descriptions = [];
			var units = [];

			// Get descriptions and units in AUTHOR mode to sort as alphabetic order
			var authorDesc = this._model.given.getDescriptions();
			authorDesc.sort(function(obj1, obj2){
				return obj1.label > obj2.label;
			});
			var authorUnits = this._model.getAllUnits();
			authorUnits.sort();

			array.forEach(authorDesc, function(desc){
				if(desc.label){
					var name = this._model.given.getName(desc.value);
					var obj = {name:name, id: desc.id};
					inputs.push(obj);
					descriptions.push({name: this._model.given.getDescription(desc.value), id: desc.id});
				}
			}, this);
			array.forEach(authorUnits, function(unit){
				units.push({name: unit, id: unit});
			}, this);

			// Sort inputs in AUTHOR mode as alphabetic order
			inputs.sort(function(obj1, obj2){
				return obj1.name > obj2.name;
			});

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
				var nodes = this._model.given.getNodes();
				var isDuplicateName = false;
				array.forEach(nodes, lang.hitch(this, function(node){
					if(node.name == this._model.given.getName(this.currentID) && node.ID != this.currentID)
						isDuplicateName = true;
				}));

				this.applyDirectives(this.authorPM.process(isDuplicateName, "name", name, equation.isVariable(name)));
			}
			//color kind widget
			if(this._model.given.getGenus(this.currentID) === '' || this._model.given.getGenus(this.currentID)){
				this.applyDirectives(this.authorPM.process(this.currentID, "kind", this._model.given.getGenus(this.currentID)));
			}
			//color description widget
			//uniqueness taken care of by the handler while adding a new value. So a false value sent.
			if(this._model.given.getDescription(this.currentID)){
				var nodes = this._model.given.getNodes();
				var isDuplicateDescription = false;
				array.forEach(nodes, lang.hitch(this, function(node){
					if(node.description == this._model.given.getDescription(this.currentID) && node.ID != this.currentID)
						isDuplicateDescription = true;
				}));

				this.applyDirectives(this.authorPM.process(isDuplicateDescription, "description", this._model.given.getDescription(this.currentID)));
			}
			//color units widget
			var unitsChoice = this._model.given.getUnits(this.currentID);
			if(unitsChoice && unitsChoice != 'defaultSelect'){
				this.applyDirectives(this.authorPM.process(this.currentID, 'units', this._model.given.getUnits(this.currentID)));
			}
			//color initial value widget
			if(typeof this._model.given.getInitial(this.currentID) === "number"){
				this.applyDirectives(this.authorPM.process(this.currentID, 'initial', this._model.given.getInitial(this.currentID), true));
			}
			//color Equation widget
			if(this._model.given.getEquation(this.currentID)){
				if(this._model.given.getStatus(this.currentID, "equation") && this._model.given.getStatus(this.currentID, "equation").status == "incorrect"){
					this.applyDirectives(this.authorPM.process(this.currentID, 'equation', this._model.given.getEquation(this.currentID), false));
				}else{
					this.applyDirectives(this.authorPM.process(this.currentID, 'equation', this._model.given.getEquation(this.currentID), true));
				}
			}
			var type = this._model.given.getType(this.currentID);
			//color type widget
			if(type){
				this.applyDirectives(this.authorPM.process(this.currentID, 'type', type));
			}
			if(type && type != 'function'){
				if(typeof this._model.given.getInitial(this.currentID) === "number")
					this.applyDirectives([{id:"initial", attribute:"status", value:"entered"}]);
			}
			if(type && type != 'parameter'){
				if(this._model.given.getEquation(this.currentID) && this._model.given.getStatus(this.currentID, "equation").status != "incorrect")
					this.applyDirectives([{id:"equation", attribute:"status", value:"entered"}]);
			}
		},
		updateModelStatus: function(desc, id){
			//stub for updateModelStatus
			id = id || this.currentID;
			if(this.validStatus[desc.attribute]){
				var opt = this._model.given.getStatus(id, desc.id) ? this._model.given.getStatus(id, desc.id) : {};
				opt[desc.attribute] = desc.value;
				this._model.given.setStatus(id, desc.id, opt);
			}
		},

		getModelType: function(){
			return registry.byId(this.controlMap.modelType).value;
		},

		addStudentNode: function(nodeid){
			//Adds the current node from student Model
			this.removeStudentNode(nodeid);
			var currentNode = this._model.given.getNode(nodeid);
			var newNodeID = this._model.student.addNode();

			//copy correct values into student node
			this._model.student.setDescriptionID(newNodeID, currentNode.ID);
			this._model.student.setInitial(newNodeID, currentNode.initial);
			this._model.student.setUnits(newNodeID, currentNode.units);
			this._model.student.setType(newNodeID, currentNode.type);
			if(currentNode.equation){
				var inputs = [];
				var isExpressionValid = true;
				var equation = currentNode.equation;
				array.forEach(currentNode.inputs, lang.hitch(this, function(input){
				     var studentNodeID = this._model.student.getNodeIDFor(input.ID);
					 if(studentNodeID){
						inputs.push({ "ID": studentNodeID});
						var regexp = "(" +input.ID +")([^0-9]?)";
						var re = new RegExp(regexp);
						equation = equation.replace(re, studentNodeID+"$2");
					}
					else{
						isExpressionValid = false;
					}
				}));
				if(isExpressionValid){
					this._model.student.setInputs(inputs, newNodeID);
					this._model.student.setEquation(newNodeID, equation);
					this.givenEquationEntered = true;
					this._model.student.setStatus(newNodeID, "equation" , {"disabled":true,"status":"correct"});
				}
				else{
					this._model.student.setInputs([], newNodeID);
					this._model.student.setEquation(newNodeID, "");
					this.errorStatus.push({"id": nodeid, "isExpressionCleared":true});
					this._model.student.setStatus(newNodeID, "equation" , {"disabled":false,"status":"incorrect"});
				}
			}
			this._model.student.setPosition(newNodeID, currentNode.position);

			//Set default status to correct for all the fields
			this._model.student.setStatus(newNodeID, "description" , {"disabled":true,"status":"correct"});
			this._model.student.setStatus(newNodeID, "type" , {"disabled":true,"status":"correct"});
			if(typeof currentNode.units !== "undefined"){
				this._model.student.setStatus(newNodeID, "units" , {"disabled":true,"status":"correct"});
		    }
			if(currentNode.type === "parameter" || currentNode.type === "accumulator" ){
				this._model.student.setStatus(newNodeID, "initial" , {"disabled":true,"status":"correct"});
			}
		},

		removeStudentNode: function(nodeid){
			// Track which expressions are cleared for given model on removing node
			var studentNodeID = this._model.student.getNodeIDFor(nodeid);
			if(studentNodeID){
				var nodes = this._model.student.getNodes();
				for(var i = 0; i < nodes.length; i++){
					var found = false;
					if(nodes[i].ID === studentNodeID)
						index = i;
					array.forEach(nodes[i].inputs, function(input){
						if(input.ID === studentNodeID){
							found = true;
							return;
						}
					});
					if(found){
						this.errorStatus.push({"id": nodes[i].descriptionID, "isExpressionCleared":true});
						console.log("error status: ", this.errorStatus);
					}
				}
				//Removes the current node from student Model
				this._model.student.deleteNode(studentNodeID);
			}
		},

		getStudentNodeValues: function(nodeid){
			var studentNodeID = this._model.student.getNodeIDFor(nodeid);
			if(studentNodeID){
				var type = this._model.student.getType(studentNodeID);
				registry.byId(this.controlMap.type).set('value', type || "defaultSelect");
				if(type == "parameter"){
					registry.byId(this.controlMap.equation).set("disabled", true);
				}
				else{
					registry.byId(this.controlMap.equation).set("disabled", false);
				}
				var initial = this._model.student.getInitial(studentNodeID);
				if(typeof initial !== "undefined" && initial != null)
					registry.byId(this.controlMap.initial).set('value', initial);

				var units = this._model.student.getUnits(studentNodeID);
				registry.byId(this.controlMap.units).set('value', units || "");

				//Replace the studentNodeIDs by corrosponding names before setting the equation field
				var inputs = this._model.student.getInputs(studentNodeID);
				var equation = this._model.student.getEquation(studentNodeID);
				if(typeof equation !== "undefined" && equation != ""){					
					style.set(this.controlMap.equation, 'backgroundColor', "#2EFEF7");
					array.forEach(inputs, lang.hitch(this, function(input){
						var node = this._model.given.getNode(this._model.student.getDescriptionID(input.ID));
						var name = node.name;
						var regexp = "(" + input.ID +")([^0-9]?)";
						var re = new RegExp(regexp);
						equation = equation.replace(re, name+"$2");
					}));
				}
					registry.byId(this.controlMap.equation).set('value', equation || "");
					this.givenEquationEntered = true;
			}
		},

		enableDisableFields: function(/*String*/modelType){
			//Summary: enable disable fields in the node editor based on selected model value
			if(modelType == "given"){
				registry.byId(this.controlMap.name).set("disabled",true);
				registry.byId(this.controlMap.description).set("disabled",true);
				registry.byId(this.controlMap.name).set("status",'');
				registry.byId(this.controlMap.description).set("status",'');

				registry.byId(this.controlMap.kind).set("disabled",true);
				registry.byId(this.controlMap.root).set("disabled",true);
			}
			else if(modelType == "correct"){
				registry.byId(this.controlMap.name).set("disabled",false);
				registry.byId(this.controlMap.description).set("disabled",false);
				registry.byId(this.controlMap.name).set("status","entered");
				registry.byId(this.controlMap.description).set("status","entered");

				registry.byId(this.controlMap.kind).set("disabled",false);
				registry.byId(this.controlMap.root).set("disabled",false);
			}
		},
		enableDisableSetStudentNode: function(){
			//Summary: Enable Set student mode checkbox only when name and description are filled
			var name = registry.byId(this.controlMap.name).value;
			var desc = registry.byId(this.controlMap.description).value;

			if(name != '' && desc != ''){
				registry.byId(this.controlMap.student).set("disabled",false);
			}
			else{
				registry.byId(this.controlMap.student).set("disabled",true);
			}
		},
		updateStatus: function(/*String*/control, /*String*/correctValue, /*String*/newValue){
			//Summary: Updates the status of the student model nodes
			var studentNodeID = this._model.student.getNodeIDFor(this.currentID);
			if(studentNodeID != null){
				if(newValue != correctValue){ //If given value not same as correct Value
					this._model.student.setStatus(studentNodeID, control , {"disabled": false,"status":"incorrect"});
				}
				else{
					this._model.student.setStatus(studentNodeID, control, {"disabled": true,"status":"correct"});
				}
			}
		},
		addAssistanceScore: function(/* String */ id){
			var studentNodeID = this._model.student.getNodeIDFor(id);
			if(studentNodeID){
				var isComplete = this._model.student.isComplete(studentNodeID);
				if(isComplete){
					this._model.student.setAssistanceScore(studentNodeID, 1);
				} else {
					this._model.student.setAssistanceScore(studentNodeID, 0);
				}
			}
		}

	});
});
