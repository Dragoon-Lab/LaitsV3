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

define(["dojo/aspect",
	"dojo/_base/array",
	'dojo/_base/declare',
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/ready",
	"dojo/on",
	"dijit/focus",
	'dijit/registry',
	"dijit/TooltipDialog",
	"dijit/popup",
	'./controller',
	"./pedagogical_module",
	"./typechecker",
	"./equation",
	"./schemas-student"
], function(aspect, array, declare, lang, dom, domClass, style, ready,on, focusUtil, registry, tooltipDialog, popup, controller, PM, typechecker, expression, schemaStudent) {
	/* Summary:	// Summary:
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
		_previousExpression: null,
		_assessment: null,
		constructor: function (mode, subMode, model) {
			console.log("++++++++ In student constructor");
			this._PM = new PM(mode, subMode, model, this.activityConfig);

			if (this.activityConfig.get("showNodeEditor")) {
				lang.mixin(this.widgetMap, this.controlMap);
				ready(this, "populateSelections");
				this.init();
			} else if (this.activityConfig.get("showIncrementalEditor")) {
				this.initIncrementalMenu();
			}else if(this.activityConfig.get("showExecutionEditor")){
				this.initExecutionEditor();
			}
		},

		resettableControls: ["initial", "equation"],
		incButtons: ["Increase", "Decrease", "Stays-Same", "Unknown"],

		init: function () {
			aspect.after(this, "closeEditor", function () {
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

		setPMState: function (state) {
			this._PM.setState(state);
		},

		setAssessment: function (session) {
			if (this._model.active.getSchemas()) {
				this._assessment = new schemaStudent(this._model, session);
			}

			this._PM.setAssessment(this._assessment);
		},

		populateSelections: function () {
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
			if (!t) {
				this.logging.clientLog("assert", {
					message: "Can't find widget for " + this.controlMap.inputs,
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
			array.forEach(descriptions, function (desc) {
				descNameMap[desc.value] = this._model.given.getName(desc.value);
			}, this);
			descriptions.sort(function (obj1, obj2) {
				//return obj1.label > obj2.label;
				return descNameMap[obj1.value] > descNameMap[obj2.value];
			}, this);

			array.forEach(descriptions, function (desc) {
				d.addOption(desc);
				var name = this._model.given.getName(desc.value);
				var option = {label: name + " (" + desc.label + ")", value: desc.value};
				t.addOption(option);
				positiveInputs.addOption(option);
				negativeInputs.addOption(option);
			}, this);
		},

		//  should be moved to a function in controller.js
		updateInputNode: function (/** auto node id **/ id, /**variable name**/ variable) {
			console.log("updating nodes student controller");
			//getDescriptionID using variable name
			var descID = this._model.given.getNodeIDByName(variable);
			var directives = this._PM.processAnswer(id, 'description', descID, this._model.given.getName(descID));
			// Need to send to PM and update status, but don't actually
			// apply directives since they are for a different node.
			array.forEach(directives, function (directive) {
				this.updateModelStatus(directive, id);
			}, this);
		},
		isExpressionChanged: function () {
			var evalue = registry.byId(this.controlMap.equation).get("value");
			if (this._previousExpression) {
				var expr = evalue;
				expr = expr.replace(/\s+/g, '');
				if (expr == this._previousExpression) {
					alert("Expression is same, Please modify the expression.");
					return true;
				} else {
					this._previousExpression = expr;
				}
			} else {
				this._previousExpression = evalue.replace(/\s+/g, '');
			}
			return false;
		},

		handleDescription: function (selectDescription) {
			console.log("****** in handleDescription ", this.currentID, selectDescription);
			if (selectDescription == 'defaultSelect') {
				return; // don't do anything if they choose default
			}
			this._model.active.setDescriptionID(this.currentID, selectDescription);
			this.updateNodes();

			// This is only needed if the type has already been set,
			// something that is generally only possible in TEST mode.
			this.updateEquationLabels();
			this.applyDirectives(
				this._PM.processAnswer(this.currentID, 'description', selectDescription, this._model.given.getName(selectDescription)));
			if (this._forumparams) {
				// enable forum button and activate the event
				this.activateForumButton();
			}
		},

		explanationHandler: function () {
			var givenID = this._model.student.getGivenID(this.currentID);
			var editorWidget = registry.byId("editorContent");
			var content = this._model.given.getExplanation(givenID);
			editorWidget.set('value', content); // load the explanation in the editor
			editorWidget.set('disabled', 'true');
			var toolWidget = registry.byId("dijit_Toolbar_0");
			var cancelButtonWidget = registry.byId("cancelEditorButton");
			cancelButtonWidget.domNode.style.display = "none";// Hide the cancel button
			toolWidget.domNode.style.display = "none"; // Hide the toolbar
		},

		handleType: function (type) {
			console.log("****** Student has chosen type ", type, this);
			if (type == 'defaultSelect')
				return; // don't do anything if they choose default
			this.updateType(type);
			this.applyDirectives(this._PM.processAnswer(this.currentID, 'type', type));
		},

		typeSet: function (value) {
			this.updateType(value);
		},

		/*
		 Handler for initial value input
		 */

		handleInitial: function (initial) {
			//IniFlag returns the status and initial value
			var IniFlag = typechecker.checkInitialValue(this.widgetMap.initial, this.lastInitial);
			if (IniFlag.status) {
				//If the initial value is not a number or is unchanged from
				// previous value we dont process
				var newInitial = IniFlag.value;
				this._model.active.setInitial(this.currentID, newInitial);
				console.log("ini value action");
				console.log("current ID", this.currentID, newInitial);
				this.applyDirectives(this._PM.processAnswer(this.currentID, 'initial', newInitial));
			} else if (IniFlag.errorType) {
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

		initialSet: function (value) {
			this._model.active.setInitial(this.currentID, value);
		},

		/*
		 *	 handle event on inputs box
		 */
		handleInputs: function (id) {
			//check if id is  not select else return

			console.log("*******Student has chosen input", id, this);
			// Should add name associated with id to equation
			// at position of cursor or at the end.

			var expr = this._model.given.getName(id);

			// if user selected selectdefault selection [--select--] no action required, calling return on handler
			if (expr === null) return;

			this.equationInsert(expr);
			//restore to default  - creating select input as stateless
			registry.byId(this.controlMap.inputs).set('value', 'defaultSelect', false);
		},
		handleUnits: function (unit) {
			console.log("*******Student has chosen unit", unit, this);

			// updating node editor and the model.
			this._model.student.setUnits(this.currentID, unit);
			this.applyDirectives(this._PM.processAnswer(this.currentID, 'units', unit));
		},
		unitsSet: function (value) {
			// Update the model.
			this._model.student.setUnits(this.currentID, value);
		},
		equationDoneHandler: function () {
			var directives = [];
			if (this.isExpressionChanged())
				return; //2365 fix, just to check pattern change, not evaluating
			var parse = this.equationAnalysis(directives, false);
			if (parse) {
				var dd = this._PM.processAnswer(this.currentID, 'equation', parse, registry.byId(this.controlMap.equation).get("value"));
				directives = directives.concat(dd);
			}

			this.applyDirectives(directives);

			var isDemo = false;
			if (directives.length > 0) {
				isDemo = array.some(directives, function (directive) {
					if (directive.attribute == "status" && directive.value == "demo") return true;
				});
			}
			if (!isDemo) {
				this.createExpressionNodes(parse, false);
			}
			return directives;
		},

		equationSet: function (value) {
			// applyDirectives updates equationBox, but not equationText:
			dom.byId("equationText").innerHTML = value;

			var directives = [];
			// Parse and update model, connections, etc.
			var parse = this.equationAnalysis(directives);
			// Generally, since this is the correct solution, there should be no directives
			this.applyDirectives(directives);

			//Set equation and process answer
			var parsedEquation = parse.toString(true);
			this._model.active.setEquation(this.currentID, parsedEquation);
			var dd = this._PM.processAnswer(this.currentID, 'equation', parse, registry.byId(this.controlMap.equation).get("value"));
			this.applyDirectives(dd);

			//Create expression nodes for parsed equation
			this.createExpressionNodes(parse);
		},

		//Set description for autocreated Nodes
		setNodeDescription: function (id, variable) {
			//getDescriptionID using variable name
			var descID = this._model.given.getNodeIDByName(variable);
			//setDescriptionID for the node id
			this._model.active.setDescriptionID(id, descID);

			this.updateNodeLabel(id);
		},

		/*
		 Settings for a new node, as supplied by the PM.
		 These don't need to be recorded in the model, since they
		 are applied each time the node editor is opened.
		 */
		initialControlSettings: function (nodeid) {
			// Apply settings from PM
			this.applyDirectives(this._PM.newAction(), true);

			// Set the selected value in the description.
			var desc = this._model.student.getDescriptionID(nodeid);
			console.log('description is', desc || "not set");
			registry.byId(this.controlMap.description).set('value', desc || 'defaultSelect', false);

			/*
			 Set color and enable/disable
			 */
			array.forEach(this._model.student.getStatusDirectives(nodeid), function (directive) {
				var w = registry.byId(this.controlMap[directive.id]);
				w.set(directive.attribute, directive.value);
				// The actual values should be in the model itself, not in status directives.
				if (directive.attribute == "value") {
					this.logging.clientLog("error", {
						message: "Values should not be set in status directives",
						functionTag: 'initialControlSettings'
					});
				}
			}, this);
		},

		// Need to save state of the node editor in the status section
		// of the student model.  See documentation/json-format.md
		updateModelStatus: function (desc, id) {
			//in case of autocreation nodes, id must be passed explicitly
			id = id || this.currentID;
			if (this.validStatus[desc.attribute]) {
				var opt = {};
				opt[desc.attribute] = desc.value;
				this._model.student.setStatus(id, desc.id, opt);
			} else {
				// There are some directives that should update
				// the student model node (but not the status section).

				// console.warn("======= not saving in status, node=" + this.currentID + ": ", desc);
			}
		},

		checkDonenessMessage: function () {
			// Returns true if model is not complete.
			var directives = this._PM.checkDoneness(this._model);
			this.applyDirectives(directives);
			return directives;
		},

		nodeStartAssessment: function () {
			if (this._assessment) {
				this._assessment.nodeStart(this.currentID);
			}
		},

		nodeCloseAssessment: function () {
			if (this._assessment && this._assessment.currentNodeTime) {
				this._assessment.nodeClose(this.currentID);
			}
		},


		/*
		 * Common functions for Incremental and Execution activities
		 */

		getChangeDescriptionText:function(changeDesc){
			var changeDescript;
			switch(changeDesc) {
				case "Increase":
					changeDescript=" has been increased."
					break;
				case "Decrease":
					changeDescript=" has been decreased."
					break;
				case "Stays-Same":
					changeDescript=" stays the same."
					break;
				case "Unknown":
					changeDescript=" will sometimes increase and sometimes decrease."
					break;
				default:
					changeDescript=""
			}
			return changeDescript;
		},

		formatEquationMessage: function(){
			/*
			 * Summary: Formats the message to be displayed by equation dialog
			 * Used by showEquationDialog
			 */

			var type = this._model.active.getType(this.currentID);
			var equationMessage = "";
			var equation = expression.convert(this._model.active, this._model.active.getEquation(this.currentID));
			var nodeName = this._model.active.getName(this.currentID);
			var inputs=this._model.active.getInputs(this.currentID);

			if (type == "accumulator") {
				equationMessage = "<p><b>"+"new " + nodeName + " = " + "current " + nodeName + " + " + equation+"</b></p>";
			} else if (type == "function") {
				equationMessage = "<p><b>"+ nodeName + " = " + equation+"</b></p>";
			}

			if (this.activityConfig._activity=="incrementalDemo") {
				equationMessage+="<p><div style='text-align:left'>"+"Compared to the original model:"+"</p>";
				equationMessage+="<ul>";
				array.forEach(inputs, lang.hitch(this, function(node){
					var nodeType=this._model.active.getType(node.ID);
					var changeDesc=this._model.active.getTweakDirection(node.ID);
					var changeDescription=this.getChangeDescriptionText(changeDesc);
					if (nodeType==="accumulator")
						equationMessage+="<li>"+"Initial value for the "+this._model.active.getName(node.ID)+" stays the same"+"</li>";

					else
						equationMessage+="<li>"+this._model.active.getName(node.ID)+changeDescription+"</li>";
				}));
				equationMessage+="</ul><p>"+ "Therefore, "+nodeName+this.getChangeDescriptionText(this._model.active.getTweakDirection(this.currentID))+"</p>";
			}
			return equationMessage
		},

		showEquationDialog: function(){
			/*
			 * Summary: Shows the equation of the node in a popup dialog with correct formatting
			 * Used by initIncrementalMenu and initExecutionMenu
			 */

			var nodeName = this._model.active.getName(this.currentID);

			var equationMessage = this.formatEquationMessage();
			this.logging.log('ui-action', {
				type: "open-equation",
				node: this._model.active.getName(this.currentID),
				nodeID: this.currentID
			});

			this.applyDirectives([{
				id: "crisisAlert",
				attribute: "title",
				value: "Equation for " + nodeName
			}, {
				id: "crisisAlert",
				attribute: "open",
				value: equationMessage
			}]);
		},

		showExplanationDialog: function(){
			/*
			 * Summary: Shows the explanation(if exists) for the node in a popup dialog
			 * Used by initIncrementalMenu and initExecutionMenu
			 */
			var givenID = this._model.active.getDescriptionID(this.currentID);
			if (this._model.given.getExplanation(givenID)) {
				var nodeName = this._model.active.getName(this.currentID);
				this.logging.log('ui-action', {
					type: "open-explanation",
					node: nodeName,
					nodeID: this.currentID
				});

				this.applyDirectives([{
					id: "crisisAlert",
					attribute: "title",
					value: "Explanation for " + nodeName
				}, {
					id: "crisisAlert",
					attribute: "open",
					value: this._model.given.getExplanation(givenID)
				}]);
			}
		},


		/*
		 * Incremental Menu
		 * Summary: initialize, add event handlers and show incremental menu tooltipDialog
		 */

		showIncrementalEditor: function (id) {
			this.currentID = id;
			var type = this._model.active.getType(id);
			var givenID = this._model.active.getDescriptionID(id);
			var nodeName = this._model.active.getName(id);

			var showEquationButton = registry.byId("EquationButton").domNode;
			var showExplanationButton = registry.byId("ShowExplanationButton").domNode;

			if (type != "accumulator" && type != "function") {
				style.set(showEquationButton, "display", "none");
				this.closeIncrementalMenu();
			} else {
				if (!this.activityConfig.get("showPopupIfComplete") || (this.activityConfig.get("showPopupIfComplete")
					&& this._model.active.isComplete(id))) {
					//Set Node Name
					dom.byId("IncrementalNodeName").innerHTML = "<strong>" + nodeName + "</strong>";

					//Show hide explanation button
					this._model.given.getExplanation(givenID) ? style.set(showExplanationButton, "display", "block") :
						style.set(showExplanationButton, "display", "none");

					style.set(showEquationButton, "display", "block");
					var tweakStatus = this._model.active.getNode(id).status["tweakDirection"];

					//Enable/Disable incremental buttons
					if (tweakStatus && tweakStatus.disabled) {
						array.forEach(this.incButtons, function (widget) {
							var w = registry.byId(widget + "Button");
							w.set("disabled", tweakStatus.disabled);
						});
					} else {
						array.forEach(this.incButtons, function (widget) {
							var w = registry.byId(widget + "Button");
							w.set("disabled", false);
						});
					}
					popup.open({
						popup: this._incrementalMenu,
						around: dom.byId(id)
					});


					this._incrementalMenu.onBlur = lang.hitch(this, function () {
						this.closeIncrementalMenu();
					});

					if(this.activityConfig.get("demoIncremental")) {
						console.log("can show done popup called inside inc demo");
						if(!this.shownDone){
							this.canShowDonePopup();
						}
					}
				}
			}
		},

		initIncrementalMenu: function () {
			var that = this;

			//Hide or show inc Buttons
			array.forEach(this.incButtons, lang.hitch(this, function (buttonID) {
				var button = registry.byId(buttonID + "Button").domNode;
				style.set(button, "display", this._uiConfig.get("qualitativeChangeButtons"));
			}));

			//Initialize incremental popup
			this._incrementalMenu = registry.byId("incrementalMenu");
			this._incrementalMenu.onShow = lang.hitch(this, function () {
				//logging for pop up start
				that.logging.log('ui-action', {
					type: "open-tweak-popup",
					node: that._model.active.getName(that.currentID),
					nodeID: that.currentID
				});
				//assessment for tweak pop up
				that.nodeStartAssessment(that.currentID);
				focusUtil.focus(dom.byId("IncreaseButton"));
			});

			this.incButtons.forEach(function (item) {
				var btn = registry.byId(item + "Button");
				on(btn, "click", function (e) {
					e.preventDefault();
					//Set in the model
					that._model.active.setTweakDirection(that.currentID, item);

					//Process Answer
					var result = that._PM.processAnswer(that.currentID, "tweakDirection", item);
					that.applyDirectives(result);

					//Update Node Label
					that.updateNodeLabel(that.currentID);

					//Close popup
					that.closeIncrementalMenu(true);
					that.canShowDonePopup();
				});
			});

			var showEquationButton = registry.byId("EquationButton");
			on(showEquationButton, "click", lang.hitch(this, function () {
				this.showEquationDialog();
			}));

			var showExplanationButton = registry.byId("ShowExplanationButton");
			on(showExplanationButton, 'click', lang.hitch(this, function () {
				this.showExplanationDialog();
			}));
		},

		closeIncrementalMenu: function (doColorNodeBorder) {
			this.logging.log('ui-action', {
				type: "close-tweak-popup",
				node: this._model.active.getName(this.currentID),
				nodeID: this.currentID
			});
			this.nodeCloseAssessment(this.currentID);
			popup.close(this._incrementalMenu);
			if (doColorNodeBorder) {
				this.colorNodeBorder(this.currentID, true);
			}

		},

		canShowDonePopup: function () {
			studId = this._model.active.getNodes();
			console.log("student id is ", studId);
			var isFinished = true;
			studId.forEach(lang.hitch(this, function (newId) {
				//each node should be complete and correct else set isFinished to false
				if (!this._model.active.isComplete(newId.ID) || this._model.student.getCorrectness(newId.ID) === "incorrect") isFinished = false;
			}));
			if (isFinished) {
				if (registry.byId("closeHint")) {
					var closeHintId = registry.byId("closeHint");
					closeHintId.destroyRecursive(false);
				}
				//close popup each time
				popup.close(problemDoneHint);
				var problemDoneHint = new tooltipDialog({
					style: "width: 300px;",
					content: '<p>You have completed this activity. Click "Done" when you are ready to save and submit your work.</p>' +
					' <button type="button" data-dojo-type="dijit/form/Button" id="closeHint">Ok</button>',
					onShow: function () {
						on(registry.byId('closeHint'), 'click', function () {
							console.log("clicked prob done hint closed");
							popup.close(problemDoneHint);
						});
					},
					onBlur: function () {
						popup.close(problemDoneHint);
					}
				});
				var res=popup.open({
					popup: problemDoneHint,
					around: dom.byId('doneButton')
				});
				this.shownDone = true;
				console.log("popup is",res);
			}
		},

		highlightNextNode: function () {
			if (this.activityConfig.get("demoIncremental") || this.activityConfig.get("demoExecution")) {
				//Get next node in the list from PM
				var nextID = this._PM.getNextNode();
				console.log("next node is", nextID);
				if (nextID) {
					var node = dom.byId(nextID);
					domClass.add(node, "glowNode");
					this.currentHighLight = nextID;
				}
				return;
			}
		},

		showIncrementalAnswer: function (id) {
			this.currentID = id;
			if (id === this.currentHighLight) {
				//remove glow
				var node = dom.byId(id);
				domClass.remove(node, "glowNode");

				//Process Answer
				var givenID = this._model.active.getDescriptionID(id);
				var answer = this._model.given.getTweakDirection(givenID);
				var result = this._PM.processAnswer(this.currentID, "tweakDirection", answer);
				this.applyDirectives(result);

				//Set correct answer in model
				this._model.active.setTweakDirection(this.currentID, answer);

				//Update Node Label
				this.updateNodeLabel(id);
				this.colorNodeBorder(this.currentID, true);

				//highlight next node in the list
				this.highlightNextNode();
			}
		},

		resetNodesIncDemo: function (){
			var studId = this._model.active.getNodes();
			var nowHighLighted = this.currentHighLight;
			studId.forEach(lang.hitch(this, function (newId) {
				//remove the glow for current highlighted node as a part of reset
				if(newId.ID === nowHighLighted) {
					var noHighlight = dom.byId(newId.ID);
					domClass.remove(noHighlight, "glowNode");
				}
				if(newId.type!=="parameter"){
					//set tweak direction to null and status none
					this._model.active.setTweakDirection(newId.ID,null);
					this._model.active.setStatus(newId.ID,"tweakDirection","");
					//update node label and border color
					this.updateNodeLabel(newId.ID);
					this.colorNodeBorder(newId.ID, true);
				}
			}));
			//highlight next (should be the first) node in the list
			console.log("highlighting after reset called");
			//reset the node counter to 0 before highlighting
			this._PM.nodeCounter = 0;
			this.highlightNextNode();
			this.shownDone = false;
		},

		resetNodesExecDemo: function(){
			var studId = this._model.active.getNodes();
			var nowHighLighted = this.currentHighLight;
			this._model.student.setIteration(0);
			studId.forEach(lang.hitch(this, function (newId) {
				//remove the glow for current highlighted node as a part of reset
				if(newId.ID === nowHighLighted) {
					var noHighlight = dom.byId(newId.ID);
					domClass.remove(noHighlight, "glowNode");
				}
				if(newId.type!=="parameter"){
					//empty the execution values
					this._model.student.emptyExecutionValues(newId.ID);
					//update node label and border color
					this.updateNodeLabel(newId.ID);
					this.colorNodeBorder(newId.ID, true);					
				}

			}));
			//highlight next (should be the first) node in the list
			console.log("highlighting after reset called");
			this._PM.nodeCounter = 0;
			
			this.highlightNextNode();
			

		},


		resetIterationExecDemo: function(){
			var studId = this._model.active.getNodes();
			var nowHighLighted = this.currentHighLight;
			studId.forEach(lang.hitch(this, function (newId) {
				//remove the glow for current highlighted node as a part of reset
				if(newId.ID === nowHighLighted) {
					var noHighlight = dom.byId(newId.ID);
					domClass.remove(noHighlight, "glowNode");
				}
				if(newId.type!=="parameter"){
					//update node label and border color
					this.updateNodeLabel(newId.ID);
					this.colorNodeBorder(newId.ID, true);
				}
			}));
			//highlight next (should be the first) node in the list
			console.log("highlighting after reset called");
			this._PM.nodeCounter = 0;
			this.highlightNextNode();
		},

		/*
		 * Execution Editor
		 * Summary: initialize, add event handlers and show execution menu tooltipDialog
		 */

		initExecutionEditor: function (){
			var that = this;

			this._executionMenu = registry.byId("executionMenu");
			this._executionMenu.onShow = lang.hitch(this, function () {
				//logging for pop up start
				that.logging.log('ui-action', {
					type: "open-execution-popup",
					node: that._model.active.getName(that.currentID),
					nodeID: that.currentID
				});
				//assessment for tweak pop up
				that.nodeStartAssessment(that.currentID);
				focusUtil.focus(dom.byId("executionValue"));
			});

			var showEquationButton = registry.byId("ExecEquationButton");
			on(showEquationButton, "click", lang.hitch(this, function () {
				this.showEquationDialog();
			}));

			var showExplanationButton = registry.byId("ExecShowExplanationButton");
			on(showExplanationButton, 'click', lang.hitch(this, function () {
				this.showExplanationDialog();
			}));

			var checkValueButton = registry.byId("execCheckValueButton");
			on(checkValueButton, "click", lang.hitch(this, function (e) {
				e.preventDefault();
				//Set in the model
				var answer = registry.byId("executionValue").value;
				var result = this._PM.processAnswer(this.currentID, "executionValue", answer);
				this.applyDirectives(result);
				this._model.active.setExecutionValue(this.currentID, answer);

				//Update Node Label
				this.updateNodeLabel(this.currentID);
				this.colorNodeBorder(this.currentID, true);

				//Close popup
				that.closeExecutionMenu();
			}));
			this._executionMenu.onBlur = lang.hitch(this, function () {
				this.closeExecutionMenu();
			});

			var executionValText = registry.byId("executionValue");
			executionValText._setStatusAttr = this._setStatus;
		},

		showExecutionMenu: function (id){
			this.currentID = id;
			var givenID = this._model.active.getDescriptionID(id);
			var type = this._model.active.getType(id);
			var nodeName = this._model.active.getName(id);
			var showExplanationButton = registry.byId("ExecShowExplanationButton").domNode;

			if (type != "accumulator" && type != "function") {
				this.closeExecutionMenu();
			} else {
				if (!this.activityConfig.get("showPopupIfComplete") || (this.activityConfig.get("showPopupIfComplete")
					&& this._model.active.isComplete(id))) {
					//logging for pop up start
					this.logging.log('ui-action', {
						type: "open-execution-popup",
						node: this._model.active.getName(this.currentID),
						nodeID: this.currentID
					});

					//set node name
					dom.byId("executionNodeName").innerHTML = "<strong>" + nodeName + "</strong>";
					var executionValue = registry.byId("executionValue");
					var checkValueButton = registry.byId("execCheckValueButton");

					//Show hide explanation button
					this._model.given.getExplanation(givenID) ? style.set(showExplanationButton, "display", "block") :
						style.set(showExplanationButton, "display", "none");
					var answer = this._model.active.getExecutionValue(id)|| "";
					executionValue.set("value", answer);

					//enable/disable textbox and button
					var execValStatus = this._model.active.getNode(id).status["executionValue"] || false;
					executionValue.set("status", execValStatus.status|| "");
					if (execValStatus && execValStatus.disabled) {
						checkValueButton.set("disabled", execValStatus.disabled);
						executionValue.set("disabled", execValStatus.disabled);
					}else{
						checkValueButton.set("disabled", false);
						executionValue.set("disabled", false);
					}
					//open execution menu
					popup.open({
						popup: this._executionMenu,
						around: dom.byId(id)
					});
				}
			}
			//check if is the end of iteration with the current node completion
			this.canRunNextIteration();
		},

		showExecutionAnswer : function (id){
			this.currentID = id;
			if(id === this.currentHighLight){
				//remove glow
				var node = dom.byId(id);
				domClass.remove(node, "glowNode");
				// process answer
				var givenID = this._model.active.getDescriptionID(id);
				var answer = this._model.given.getExecutionValue(givenID);
				var result = this._PM.processAnswer(id, "executionValue", answer);
				this.applyDirectives(result);

				//Set correct answer in model
				this._model.active.setExecutionValue(this.currentID, answer);
				registry.byId("executionValue").set("value", answer);

				//Update Node Label
				this.updateNodeLabel(id);
				this.colorNodeBorder(this.currentID, true);

				//highlight next node in the list
				this.highlightNextNode();
			}
		},

		closeExecutionMenu: function (){
			this.logging.log('ui-action', {
				type: "close-execution-popup",
				node: this._model.active.getName(this.currentID),
				nodeID: this.currentID
			});
			this.nodeCloseAssessment(this.currentID);
			popup.close(this._executionMenu);
		},

		canRunNextIteration: function () {	
			
			var crisis=registry.byId(this.widgetMap.crisisAlert); 
			crisis._onKey=function(){}; // Override the _onKey function to prevent crisis dialogbox from closing when ESC is pressed
			style.set(crisis.closeButtonNode,"display","none"); // Hide the close button 

			var inFirstIteration=false;		
			inFirstIteration=(this._model.student.getIteration() <1) ? true : false;

			studId = this._model.active.getNodes();
			var isFinished = true;
			var inFirstIteration=false;
			studId.forEach(lang.hitch(this, function (newId) {
			//each node should be complete and correct else set isFinished to false
				if (!this._model.active.isComplete(newId.ID) || this._model.student.getCorrectness(newId.ID) === "incorrect") isFinished = false;
			}));		

			if (isFinished & inFirstIteration) {
				this.applyDirectives([{
					id: "crisisAlert",
					attribute: "title",
					value: "Iteration Has Completed"
				}, {
					id: "crisisAlert",
					attribute: "open",
					value: "You have completed all the values for this time step.  Click 'Ok' to proceed to the next time step."
			    }]);			
			} else if (isFinished) {
				this.applyDirectives([{
					id: "crisisAlert",
					attribute: "title",
					value: "Demonstration Completed" 
				}, {
					id: "crisisAlert",
					attribute: "open",
					value: "Good work, now Dragoon will compute the rest of the values for you and display them as a table and as a graph in the next window."
				}]);				
				console.log("activity ended time to show the graph");
			}											
			//console.log("model is",this._model);
		},

		callNextIteration: function () {
			this._model.student.incrementIteration();
			console.log("iteration count is",this._model.student.getIteration());
			var crisis = registry.byId(this.widgetMap.crisisAlert); 
			if(this._model.student.getIteration() <2) {
				this.resetIterationExecDemo();
			}
		}
	});
});

