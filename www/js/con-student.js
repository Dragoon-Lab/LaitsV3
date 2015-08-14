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
				if (!this.activityConfig.get("showPopupIfComplete") || (this.activityConfig.get("showPopupIfComplete") && this._model.active.isComplete(id))) {
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
				}
			}
		},


		initIncrementalMenu: function () {
			var that = this;
			that._buttonHandlers = {};

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

				this.incButtons.forEach(function (item) {
					var btn = registry.byId(item + "Button");
					that._buttonHandlers[item] = on(btn, "click", function (e) {
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
			});

			var showEquationButton = registry.byId("EquationButton");

			on(showEquationButton, "click", function () {
				//close incremental menu is being called twice when clicking show equation. There is one at showIncementalEditor function at the top.
				//not sure which is to be removed. For now I am commenting this ~ Sachin
				//that.closeIncrementalMenu();
				var type = that._model.active.getType(that.currentID);
				var equationMessage = "";
				var equation = expression.convert(that._model.active, that._model.active.getEquation(that.currentID));
				var nodeName = that._model.active.getName(that.currentID);
				if (type == "accumulator") {
					equationMessage = "new " + nodeName + " = " + "current " + nodeName + " + " + equation;
				} else if (type == "function") {
					equationMessage = nodeName + " = " + equation;
				}
				that.logging.log('ui-action', {
					type: "open-tweak-equation",
					node: that._model.active.getName(that.currentID),
					nodeID: that.currentID
				});

				that.applyDirectives([{
					id: "crisisAlert",
					attribute: "title",
					value: "Equation for " + nodeName
				}, {
					id: "crisisAlert",
					attribute: "open",
					value: equationMessage
				}]);
			});

			var showExplanationButton = registry.byId("ShowExplanationButton");
			on(showExplanationButton, 'click', function () {
				var givenID = that._model.active.getDescriptionID(that.currentID);
				if (that._model.given.getExplanation(givenID)) {
					var nodeName = that._model.active.getName(that.currentID);
					that.logging.log('ui-action', {
						type: "open-tweak-explanation",
						node: nodeName,
						nodeID: that.currentID
					});

					that.applyDirectives([{
						id: "crisisAlert",
						attribute: "title",
						value: "Explanation for " + nodeName
					}, {
						id: "crisisAlert",
						attribute: "open",
						value: that._model.given.getExplanation(givenID)
					}]);
				}
			});

		},

		closeIncrementalMenu: function (doColorNodeBorder) {
			this.logging.log('ui-action', {
				type: "close-tweak-popup",
				node: this._model.active.getName(this.currentID),
				nodeID: this.currentID
			});
			this.nodeCloseAssessment(this.currentID);
			popup.close(this._incrementalMenu);
			this.incButtons.forEach(lang.hitch(this, function (item) {
				this._buttonHandlers[item].remove();
			}));
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
				popup.open({
					popup: problemDoneHint,
					around: dom.byId('doneButton')
				});
			}
		},

		highlightNextNode: function () {
			if (this.activityConfig.get("demoIncremental")) {
				//Get next node in the list from PM
				var nextID = ""
				/*this._PM.getNextNode();*/ // Uncomment this once function is ready
				if (nextID) {
					var node = dom.byId(nextID);
					domClass.add(node, "glowNode");
					this.currentHighLight = nextID;
				}
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
		}

	});
});

