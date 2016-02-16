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

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/keys",
	"dojo/on",
	"dojo/ready",
	"dijit/popup",
	"dijit/registry",
	"dijit/TooltipDialog",
	"dijit/focus",
	"./equation",
	"./graph-objects",
	"./typechecker",
	"./forum",
	"./autocomplete",
	"./tour",
	"./schemas-student"
], function(array, declare, lang, aspect, dom, domClass, domConstruct, domStyle, keys, on, ready, popup, registry, TooltipDialog, focusUtil, expression, graphObjects, typechecker, forum, AutoComplete, Tour){

	/* Summary:
	 *			Controller for the node editor, common to all modes
	 * Description:
	 *			Handles selections from the student or author as he/she
	 *			completes a model; inherited by con-student.js and con-author.js
	 * Tags:
	 *			controller, student mode, coached mode, test mode, author mode
	 */

	return declare(null, {
		_model: null,
		_nodeEditor: null, // node-editor object- will be used for populating fields
		_forumParams: null, // Addresses needed for linking to forum
		/*
		 * When opening the node editor, we need to populate the controls without
		 * evaluating those changes.
		 */
		disableHandlers: false,
		/* The last value entered into the intial value control */

		lastInitial: {value: null},
		logging: null,
		equationEntered: null,	// Variable to track if an equation has been entered and checked value is set when node editor opened
		// A list of common controls of student and author
		genericControlMap: {
			type: "typeId",
			initial: "initialValue",
			equation: "equationBox"
		},
		// A list of all widgets.  (The constructor mixes this with controlMap)
		widgetMap: {
			message: 'messageBox',
			crisisAlert: 'crisisAlertMessage'
		},

		// Controls that are select menus
		selects: ['description', 'type', 'units', 'inputs'],

		constructor: function(mode, subMode, model, inputStyle, ui_config, activity_config){

			console.log("+++++++++ In generic controller constructor");
			lang.mixin(this.controlMap, this.genericControlMap);

			this._model = model;
			this._mode = mode;
			this._inputStyle = inputStyle;
			this.activityConfig = activity_config;
			this._uiConfig = ui_config;
			// structured should be its own module.	 For now,
			// initialize
			this.structured._model = this._model;

			ready(this, this._initCrisisAlert);
			// The Node Editor widget must be set up before modifications
			// It might be a better idea to only  call the controller
			// after widgets are set up.
			if(this.activityConfig.get("showNodeEditor")){
				ready(this, this._setUpNodeEditor);
				ready(this, this._initHandles);
			}
		},

		setState: function(state){
			if(this.setPMState){
				this.setPMState(state);
			}
			ready(this, function(){
				/*
				 Hide/show fields based on inputStyle
				 If inputStyle is given with the URL, use that.
				 Otherwise, query the state table to see if style is set.
				 If not, use algebraic
				 */
				if(this._inputStyle){
					this.setEquationStyle(this._inputStyle);
				}else{
					state.get("mode").then(this.setEquationStyle);
				}
			});
		},

		setEquationStyle: function(style){
			var algebraic, structured;
			if(!style || style == "algebraic"){
				algebraic = ""; structured = "none";
				dom.byId("undoButton").innerHTML = "Clear";
			}else if(style=="structured"){
				algebraic = "none"; structured = "";
				dom.byId("undoButton").innerHTML = "Undo";
			}else{
				throw new Error("Invalid input style: "+style);
			}
			domStyle.set("algebraic", "display", algebraic);
			domStyle.set("structured", "display", structured);
			domStyle.set("equationBox", "display", algebraic);
			domStyle.set("equationText", "display", structured);
		},

		// A stub for connecting routine to draw new node.
		addNode: function(node, autoflag){
			console.log("Node Editor calling addNode() for ", node.id);
		},

		// A list of common controls of student and author
		genericControlMap: {
			type: "typeId",
			initial: "initialValue",
			equation: "equationBox",
			explanation:"explanationButton"
		},
		genericDivMap: {
			initial: "initialValueDiv",
			units: "unitDiv",
			equation: "expressionDiv"
		},
		// A list of all widgets.  (The constructor mixes this with controlMap)
		widgetMap: {
			message: 'messageBox',
			crisisAlert: 'crisisAlertMessage'
		},

		_initCrisisAlert: function(){
			//Crisis Alert widget
			var crisis = registry.byId(this.widgetMap.crisisAlert);
			var that = this;
			crisis._setOpenAttr = function(message){
				var crisisMessage = dom.byId('crisisMessage');
				console.log("crisis alert message ", message);
				crisisMessage.innerHTML = message;
				crisis.show();
			};
			on(registry.byId("OkButton"), "click", function(){
				if(crisis.title && crisis.title.indexOf("Equation for") >= 0){
					var nodeName = crisis.title.replace("Equation for ", "");
					that.logging.log('ui-action', {
						type: "close-equation", 
						node: nodeName
					});
				}
				if(crisis.title && crisis.title.indexOf("Iteration Has") >= 0){
					that.callNextIteration();
				}
				crisis.hide();
			});
		},
		_setStatus : function(value){
			var colorMap = {
				correct: "lightGreen",
				incorrect: "#FF8080",
				demo: "yellow",
				premature: "lightBlue",
				entered: "#2EFEF7"
			};
			if(value && !colorMap[value]){
				this.logging.clientLog("assert", {
					message: 'Invalid color specification, color value : '+value,
					functionTag: 'setStatus'
				});
			}
			/* BvdS:  I chose bgColor because it was easy to do
			 Might instead/also change text color?
			 Previously, just set domNode.bgcolor but this approach didn't work
			 for text boxes.   */
			// console.log(">>>>>>>>>>>>> setting color ", this.domNode.id, " to ", value);
			domStyle.set(this.domNode, 'backgroundColor', value ? colorMap[value] : '');
		},

		_setUpNodeEditor: function(){;
			// get Node Editor widget from tree
			this._nodeEditor = registry.byId('nodeeditor');
			this._nodeEditor.set("display", "block");
			// Wire up this.closeEditor.  Aspect.around is used so we can stop hide()
			// from firing if equation is not entered.
			aspect.around(this._nodeEditor, "hide", lang.hitch(this, function(doHide){
				//To keep the proper scope throughout
				var myThis = this;
				return function(){
					var equation = registry.byId("equationBox");
					
					if(equation.value && !myThis.equationEntered){
						var directives = myThis.equationDoneHandler();
						var isAlertShown = array.some(directives, function(directive){
							if(directive.id === 'crisisAlert'){
								return true;
							}
						});
						if(!isAlertShown) {
							doHide.apply(myThis._nodeEditor);
							myThis.closeEditor.call(myThis);
						}
					}
					else if(myThis._mode == "AUTHOR" && registry.byId("selectModel").value == "given"){
						var equation = registry.byId("givenEquationBox");
						if(equation.value && !myThis.givenEquationEntered){
							//Crisis alert popup if equation not checked
							myThis.applyDirectives([{
								id: "crisisAlert", attribute:
									"open", value: "Initial Student Expression value is not checked!  Go back and check your expression to verify it is correct, or delete the expression, before closing the node editor."
							}]);
						}
						else{
							// Else, do normal closeEditor routine and hide
							doHide.apply(myThis._nodeEditor);
							myThis.closeEditor.call(myThis);
						}
					}else{
						// Else, do normal closeEditor routine and hide
						doHide.apply(myThis._nodeEditor);
						myThis.closeEditor.call(myThis);
					}
				};
			}));

			/*
			 Add attribute handler to all of the controls
			 When "status" attribute is changed, then this function
			 is called.
			 */

			if(this.activityConfig.get("showFeedback")){
				for(var control in this.controlMap){
					var w = registry.byId(this.controlMap[control]);
					w._setStatusAttr = this._setStatus;
				}
				/*
				 * If the status is set for equationBox, we also need to set
				 * the status for equationText.  Since equationText is not a widget,
				 * we need to set it explicitly.
				 * Adding a watch method to the equationBox didn't work.
				 */
				aspect.after(registry.byId(this.controlMap.equation), "_setStatusAttr",
					lang.hitch({domNode: dom.byId("equationText")}, this._setStatus),
					true);
			}

			var setEnableOption = function(value){
				console.log("++++ in setEnableOption, scope=", this);
				array.forEach(this.options, function(option){
					if(!value || option.value == value)
						option.disabled = false;
				});
				this.startup();
			};
			var setDisableOption = function(value){
				console.log("++++ in setDisableOption, scope=", this);
				array.forEach(this.options, function(option){
					if(!value || option.value == value)
						option.disabled = true;
				});
				this.startup();
			};


			// All <select> controls
			array.forEach(this.selects, function(select){
				var w = registry.byId(this.controlMap[select]);
				w._setEnableOptionAttr = setEnableOption;
				w._setDisableOptionAttr = setDisableOption;
			}, this);

			// Add appender to message widget
			var messageWidget = registry.byId(this.widgetMap.message);
			messageWidget._setAppendAttr = function(message){
				var message_box_id=dom.byId("messageBox");

				// Set the background color for the new <p> element
				// then undo the background color after waiting.
				var element=domConstruct.place('<p style="background-color:#FFD700;">'
					+ message + '</p>', message_box_id);

				/*Set interval for message blink*/
				window.setTimeout(function(){
					// This unsets the "background-color" style
					domStyle.set(element, "backgroundColor", "");
				}, 3000);  // Wait in milliseconds

				// Scroll to bottoms
				this.domNode.scrollTop = this.domNode.scrollHeight;
			};

			/*
			 Add fields to units box, using units in model node
			 In author mode, this needs to be turned into a text box.
			 */
			var u = registry.byId("selectUnits");
			// console.log("units widget ", u);

			var units = this._model.getAllUnits();
			units.sort();

			array.forEach(units, function(unit){
				u.addOption({label: unit, value: unit});
			});

			if(this.activityConfig.get('showEquationAutoComplete')){
				var mathFunctions = dojo.xhrGet({
					url: 'mathFunctions.json',
					handleAs: 'json',
					load: lang.hitch(this, function(response){
						//get math functions
						var mathFunctions = Object.keys(response);

						//Add Node names
						var descriptions = this._model.given.getDescriptions();
						var nodeNames = [];
						array.forEach(descriptions, function (desc) {
							var name = this._model.given.getName(desc.value);
							nodeNames.push(name)
						}, this);

						//Combine node names and math functions
						nodeNames = nodeNames.concat(mathFunctions);

						var equationAutoComplete = new AutoComplete('equationBox', nodeNames ,[' ',  '+', '-' , '/', '*', '(' , ')', ','], response);
					}),
					error: function(){

					}
				});
			}
		},

		// Function called when node editor is closed.
		// This can be used as a hook for saving sessions and logging
		closeEditor: function(){
			console.log("++++++++++ entering closeEditor");
			if(this._mode == "AUTHOR"){
				//Reset to given on close of node editor
				this._model.active = this._model.given;
				registry.byId("selectModel").set('value',"correct");
				this.controlMap.equation = "equationBox";
				domStyle.set('equationBox', 'display', 'block');
				domStyle.set('givenEquationBox', 'display', 'none');
				var kind = registry.byId(this.controlMap.kind).value;
				if(kind == "required"){
					this._model.given.setGenus(this.currentID, kind);
				}
			}
			// Erase modifications to the control settings.
			// Enable all options in select controls.
			array.forEach(this.selects, function(control){
				var w = registry.byId(this.controlMap[control]);
				w.set("enableOption", null);  // enable all options
			}, this);
			// For all controls:
			for(var control in this.controlMap){
				var w = registry.byId(this.controlMap[control]);
				w.set("disabled", false);  // enable everything
				w.set("status", '');  // remove colors
			}

			this.addAssistanceScore(this.currentID);

			this.disableHandlers = true;
			// Undo Name value (only in AUTHOR mode)
			if(this.controlMap.name){
				var name = registry.byId(this.controlMap["name"]);
				name.set("value", "");
			}

			// Undo Description value (only needed in AUTHOR mode)
			if(this.controlMap.description){
				var description = registry.byId(this.controlMap.description);
				description.set("value", "");
			}

			// Undo any initial value
			var initial = registry.byId(this.controlMap["initial"]);
			initial.set("value", "");
			this.lastInitial.value = null;

			// Undo equation labels
			this.updateEquationLabels("none");

			// Reset equationText to be empty
			this.structured.reset();

			/* Erase messages
			 Eventually, we probably want to save and restore
			 messages for each node. */
			var messageWidget = registry.byId(this.widgetMap.message);
			messageWidget.set('content', '');

			// Color the borders of the Node
			if(this._mode !="TEST" && this._mode != "EDITOR")
				this.colorNodeBorder(this.currentID, true);

			// update Node labels upon exit
			this.updateNodeLabel(this.currentID);

			//end the tour
			if(this.tour){
				this.tour.end();
			}
			// In case any tool tips are still open.
			typechecker.closePops();
			//this.disableHandlers = false;
			this.logging.log('ui-action', {
				type: 'close-dialog-box',
				nodeID: this.currentID,
				node: this._model.active.getName(this.currentID),
				nodeComplete: this._model.active.isComplete(this.currentID)
			});

			if(this._mode == "EDITOR" || this._mode == "TEST"){
				if(typeof this._model.active.getType(this.currentID) !== "undefined"){
					var isComplete = this._model.active.isComplete(this.currentID)?'solid':'dashed';
					var borderColor = "3px "+isComplete+" gray";
					var boxshadow = 'inset 0px 0px 5px #000 , 0px 0px 10px #000';
					domStyle.set(this.currentID, 'box-shadow', boxshadow);
					domStyle.set(this.currentID, 'border', borderColor);	 // set border gray for studentModelNodes in TEST and EDITOR mode
				}
			}

			this.nodeCloseAssessment();

			if(this._previousExpression) //bug 2365
				this._previousExpression=null; //clear the expression

			// This cannot go in controller.js since _PM is only in
			// con-student.  You will need con-student to attach this
			// to closeEditor (maybe using aspect.after?).
		},

		//update the node label
		updateNodeLabel:function(nodeID){
			var nodeName = graphObjects.getNodeName(this._model.active,nodeID, this.activityConfig.get("nodeDetails"));
			if(nodeName && dom.byId(nodeID + 'Label')){
				domConstruct.place(nodeName, nodeID + 'Label', "replace");
			}
		},

		//set up event handling with UI components
		_initHandles: function(){
			// Summary: Set up Node Editor Handlers

			/*
			 Attach callbacks to each field in node Editor.

			 The lang.hitch sets the scope to the current scope
			 and then the handler is only called when disableHandlers
			 is false.

			 We could write a function to attach the handlers?
			 */

			var desc = registry.byId(this.controlMap.description);
			desc.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleDescription.apply(this, arguments);
			}));

			/*
			 *	 event handler for 'type' field
			 *	 'handleType' will be called in either Student or Author mode
			 * */
			var type = registry.byId(this.controlMap.type);
			type.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleType.apply(this, arguments);
			}));

			/*
			 *	 event handler for 'Initial' field
			 *	 'handleInitial' will be called in either Student or Author mode
			 * */

			var initialWidget = registry.byId(this.controlMap.initial);
			// This event gets fired if student hits TAB or input box
			// goes out of focus.
			initialWidget.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleInitial.apply(this, arguments);
			}));

			// Look for ENTER key event and fire 'Change' event, passing
			// value in box as argument.  This is then intercepted by the
			// regular handler.
			initialWidget.on("keydown", function(evt){
				// console.log("----------- input character ", evt.keyCode, this.get('value'));
				if(evt.keyCode == keys.ENTER){
					this.emit('Change', {}, [this.get('value')]);
				}
			});
			// undo color on change in the initial value widget
			initialWidget.on("keydown",lang.hitch(this,function(evt){
				if(evt.keyCode != keys.ENTER){
					var w = registry.byId(this.controlMap.initial);
					w.set('status','');
				}
			}));

			var inputsWidget = registry.byId(this.controlMap.inputs);
			inputsWidget.on('Change',  lang.hitch(this, function(){
				return this.disableHandlers || this.handleInputs.apply(this, arguments);
			}));

			var unitsWidget = registry.byId(this.controlMap.units);
			unitsWidget.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleUnits.apply(this, arguments);
			}));

			var positiveWidget = registry.byId("positiveInputs");
			positiveWidget.on('Change', lang.hitch(this.structured, this.structured.handlePositive));

			var negativeWidget = registry.byId("negativeInputs");
			negativeWidget.on('Change', lang.hitch(this.structured, this.structured.handleNegative));

			//workaround to handleInputs on Same Node Click
			/* inputsWidget.on('Click', lang.hitch(this, function(){
			 return this.disableHandlers || this.handleInputs.apply(this, arguments);
			 }));*/

			var equationWidget = registry.byId(this.controlMap.equation);
			equationWidget.on('Change', lang.hitch(this, function(){
				return this.disableHandlers || this.handleEquation.apply(this, arguments);
			}));

			// When the equation box is enabled/disabled, do the same for
			// the inputs widgets.
			array.forEach(["nodeInputs", "positiveInputs", "negativeInputs"], function(input){
				var widget = registry.byId(input);
				equationWidget.watch("disabled", function(attr, oldValue, newValue){
					// console.log("************* " + (newValue?"dis":"en") + "able inputs");
					widget.set("disabled", newValue);
				});
			});

			// For each button 'name', assume there is an associated widget in the HTML
			// with id 'nameButton' and associated handler 'nameHandler' below.
			var buttons = ["plus", "minus", "times", "divide", "undo", "equationDone", "sum", "product","explanation"];
			array.forEach(buttons, function(button){
				var w = registry.byId(button + 'Button');
				if(!w){
					this.logging.clientLog("assert", {
						message: "button not found, button id : "+button,
						functionTag: '_initHandles'
					});
				}
				var handler = this[button + 'Handler'];
				if(!handler){
					this.logging.clientLog("assert", {
						message: "button handler not found, handler id : "+handler,
						functionTag: '_initHandles'
					});
				}
				w.on('click', lang.hitch(this, handler));
				/*	When the equation box is enabled/disabled also do the same
				 for this button */
				equationWidget.watch("disabled", function(attr, oldValue, newValue){
					if (w.id!=="explanationButton") {
						// console.log("************* " + (newValue?"dis":"en") + "able " + button);
						w.set("disabled", newValue);
					}
				});
			}, this);

			//undo background color on change
			array.forEach(this.resettableControls, function(con){
				var w = registry.byId(this.controlMap[con]);
				w.on("keydown", lang.hitch(this, function(evt){
					if(evt.keyCode != keys.ENTER){
						w.set('status','');
					}
				}));
			}, this);

		},

		// Need to save state of the node editor in the status section
		// of the student model.  See documentation/json-format.md
		updateModelStatus: function(desc){
			//stub for updateModelStatus
			//actual implementation in con-student and con-author
		},

		// attributes that should be saved in the status section
		validStatus: {status: true, disabled: true},
		updateNodes: function(){
			// Update node editor and the model.
			this._nodeEditor.set('title', this._model.active.getName(this.currentID));

			// Update inputs and other equations based on new quantity.
			expression.addQuantity(this.currentID, this._model.active);

			// need to delete all existing outgoing connections
			// need to add connections based on new inputs in model.
			// add hook so we can do this in draw-model...
			this.addQuantity(this.currentID, this._model.active.getOutputs(this.currentID));
		},
		/* Stub to update connections in graph */
		addQuantity: function(source, destinations){
		},

		updateTweakDirection: function(direction){
			if(typeof direction !== 'undefined' && direction != null){
				this._model.active.setTweakDirection(this.currentID, direction);
				this.updateNodeLabel(this.currentID);
			}
		},

		updateExecutionValue: function(executionVal){
			if(typeof executionVal !== 'undefined' && executionVal != null){
				this._model.active.setExecutionValue(this.currentID, executionVal);
				//this.updateNodeLabel(this.currentID);
				registry.byId("executionValue").set("value", executionVal, false);
			}
		},

		updateWaveformValue: function(waveformValue){
			if(typeof waveformValue !== 'undefined' && waveformValue != null){
				this._model.active.setWaveformValue(this.currentID, waveformValue);
				this.updateNodeLabel(this.currentID);
				//Set selected value

			}
		},

		updateDescription: function(descID){
			console.log("===========>	changing node description to " + descID);
			if(typeof descID !== 'undefined' && descID != null){
				this._model.active.setDescriptionID(this.currentID, descID);
			}
		},

		updateType: function(type){
			//update node type on canvas
			console.log("===========>	changing node class to " + type);

			//if type is triangle, remove border and box-shadow
			if(type==''){
				domStyle.set(this.currentID,'border','');
				domStyle.set(this.currentID,'box-shadow','');
				domClass.replace(this.currentID, "triangle");
			}else{
				domClass.replace(this.currentID, type);
			}

			//resetting the value of initial and equation boxes when type is changed in author mode
			if(type == "function" && typeof this._model.active.getInitial(this.currentID) === "number"){
				var initialNode = registry.byId(this.controlMap.initial);
				initialNode.set("value", "");
				this._model.active.setInitial(this.currentID, "");
			}
			if(type == "parameter"){
				var equationNode = registry.byId(this.controlMap.equation);
				equationNode.set("value", "");
				//changing the equation value does not call the handler so setting the value explicitly using set equation.
				this._model.active.setEquation(this.currentID, '');
				//Clear the inputs and reset connections
				this._model.active.setInputs([], this.currentID);
				this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);
			}
			// updating the model and the equation labels
			this._model.active.setType(this.currentID, type);
			this.updateEquationLabels();

			var nodeName = graphObjects.getNodeName(this._model.active,this.currentID, this.activityConfig.get("nodeDetails"), type);
			if(nodeName != ''){
				if(dom.byId(this.currentID + 'Label'))
					domConstruct.place(nodeName, this.currentID + 'Label', "replace");
				else //new node
					domConstruct.place(nodeName, this.currentID);
			}
		},

		updateEquationLabels: function(typeIn){
			var type = typeIn || this._model.active.getType(this.currentID) || "none";
			var name = this._model.active.getName(this.currentID);
			var nodeName = "";
			var tt = "";
			// Only add label when name exists
			if(name){
				switch(type){
					case "accumulator":
						nodeName = 'new ' + name + ' = ' + 'current ' + name + ' +';
						//Commenting out Change in Time label per Dr. Kurt
						//tt = " * Change in Time";
						break;
					case "function":
						nodeName = name + ' = ';
						break;
					case "parameter":
					case "none":
						nodeName = "&nbsp;";
						break;
					default:
						this.logging.clientLog("error", {
							message: "Invalid node type, value selected : "+type,
							functionTag: "updateEquationLabels"
						});
				}
			}
			// Removing all the text is the same as setting display:none.
			dom.byId('equationLabel').innerHTML = nodeName;
			//dom.byId('timeStepLabel').innerHTML = tt;
		},

		equationInsert: function(text){
			var widget = registry.byId(this.controlMap.equation);
			var oldEqn = widget.get("value");
			// Get current cursor position or go to end of input
			// console.log("	   Got offsets, length: ", widget.domNode.selectionStart, widget.domNode.selectionEnd, oldEqn.length);
			var p1 = widget.domNode.selectionStart;
			var p2 = widget.domNode.selectionEnd;
			widget.set("value", oldEqn.substr(0, p1) + text + oldEqn.substr(p2));
			// Set cursor to end of current paste
			widget.domNode.selectionStart = widget.domNode.selectionEnd = p1 + text.length;
		},

		handleEquation: function(equation){
			var w = registry.byId(this.widgetMap.equation);
			this.equationEntered = false;
			w.set('status','');
			// undo color when new value is entered in the equation box widget
			w.on("keydown",lang.hitch(this,function(evt){
				if(evt.keyCode != keys.ENTER){
					w.set('status','');
				}
			}));
		},

		plusHandler: function(){
			console.log("****** plus button");
			this.equationInsert('+');
		},
		minusHandler: function(){
			console.log("****** minus button");
			this.equationInsert('-');
		},
		timesHandler: function(){
			console.log("****** times button");
			this.equationInsert('*');
		},
		divideHandler: function(){
			console.log("****** divide button");
			this.equationInsert('/');
		},
		sumHandler: function(){
			console.log("****** sum button");
			this.structured.setOperation("sum");
		},
		productHandler: function(){
			console.log("****** product button");
			this.structured.setOperation("product");
		},
		structured: {
			_model: null, // Needs to be set to to instance of model
			operation: "sum",
			positives: [],
			negatives: [],
			ops: [],
			setOperation: function(op){
				switch(op){
					case "sum":
						this.operation = op;
						dom.byId("positiveInputsText").innerHTML = "Add quantity:";
						dom.byId("negativeInputsText").innerHTML = "Subtract quantity:";
						break;
					case "product":
						this.operation = "product";
						dom.byId("positiveInputsText").innerHTML = "Multiply by quantity:";
						dom.byId("negativeInputsText").innerHTML = "Divide by quantity:";
						break;
					default:
						throw new Error("Invalid operation " + op);
				}
				this.update();
			},
			handlePositive: function(id){
				console.log("****** structured.handlePositives ", id);
				this.positives.push(this._model.given.getName(id));
				this.ops.push("positives");
				this.update();
				registry.byId("positiveInputs").set('value', 'defaultSelect', false);// restore to default
			},
			handleNegative: function(id){
				console.log("****** structured.handleNegatives ", id);
				this.negatives.push(this._model.given.getName(id));
				this.ops.push("negatives");
				this.update();
				registry.byId("negativeInputs").set('value', 'defaultSelect', false);// restore to default
			},
			pop: function () {
				var op = this.ops.pop();
				this[op].pop();
				this.update();
			},
			update: function(){
				// Update expression shown in equation box
				// And structured expression
				var pos = "";
				var op = this.operation == "sum" ? " + " : " * ";
				var nop = this.operation == "sum" ? " - " : " / ";
				array.forEach(this.positives, function(term, i){
					if(i > 0)
						pos += op;
					pos += term;
				});
				if(this.negatives.length > 0 && this.positives.length > 1)
					pos = "(" + pos + ")";
				if(this.positives.length == 0 && this.negatives.length > 0 && this.operation == "product")
					pos = "1";
				var neg = "";
				array.forEach(this.negatives, function(term, i){
					if(i > 0)
						neg += op;
					neg += term;
				});
				if(this.negatives.length > 1)
					neg = "(" + neg + ")";
				if(this.negatives.length > 0)
					neg = nop + neg;
				pos += neg;
				console.log("********* New equation is ", pos);

				// Print in equation box
				var equationWidget = registry.byId("equationBox");
				equationWidget.set("value", pos);
				dom.byId("equationText").innerHTML = pos;

			},
			reset: function(){
				this.positives.length = 0;
				this.negatives.length = 0;
				this.ops.length = 0;
				this.update();
			}
		},
		undoHandler: function(){
			if(this.structured.ops.length == 0) {
				var equationWidget = registry.byId("equationBox");
				equationWidget.set("value", "");
				var givenEquationWidget = registry.byId("givenEquationBox");//if value of selectModel was equal to "given"
				givenEquationWidget.set("value", "");
				dom.byId("equationText").innerHTML = "";
			}
			else {
				var widget = registry.byId(this.controlMap.equation);
				this.structured.pop();
			}
		},
		//Enables the Forum Button in node editor
		//Also uses the forum module to activate the event button click
		activateForumButton: function(){
			var nodeForumBut = registry.byId("nodeForumButton");
			nodeForumBut.set("disabled", false);
			//Attach the event
			console.log("attatching event",this.logging);
			forum.activateForum(this._model, this.currentID, this._forumparams, this.logging);
		},

		equationAnalysis: function(directives, ignoreUnknownTest){
			this.equationEntered = true;
			console.log("****** enter button");
			/*
			 This takes the contents of the equation box and parses it.

			 If the parse fails:
			 * send a warning message, and
			 * log attempt (the PM does not handle syntax errors).

			 Note: the model module may do some of these things automatically.

			 Also, the following section could just as well be placed in the PM?
			 */
			var widget = registry.byId(this.controlMap.equation);
			var inputEquation = widget.get("value");
			var cancelUpdate = false;
			var resetEquation = false;
			var descriptionID = this._model.active.getDescriptionID(this.currentID);

			var parse = null;
			if (inputEquation == "") {
				directives.push({id: 'message', attribute: 'append', value: 'There is no equation to check.'});
				return null;
			}
			try{
				parse = expression.parse(inputEquation);
			}catch(err){
				console.log("Parser error: ", err);
				console.log(err.message);
				console.log(err.Error);
				this._model.active.setEquation(this.currentID, inputEquation);
				if(err.message.includes("unexpected variable"))
					directives.push({id: 'message', attribute: 'append', value: 'The value entered for the equation is incorrect'});
				else
					directives.push({id: 'message', attribute: 'append', value: 'Incorrect equation syntax.'});
				directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
				this.logging.log("solution-step", {
					type: "parse-error",
					node: this._model.active.getName(this.currentID),
					nodeID: this.currentID,
					property: "equation",
					value: inputEquation,
					correctResult: this._model.given.getEquation(this.currentID),
					checkResult: "INCORRECT",
					message: err
				});

				return null;
			}
			var mapID = this._model.active.getDescriptionID || function(x){ return x; };
			var unMapID = this._model.active.getNodeIDFor || function(x){ return x; };
			//there is no error in parse. We check equation for validity
			//Check 1 - accumulator equation is not set to 0, basically the type of a node should be parameter.
			if(this._model.active.getType(this.currentID) === "accumulator" &&
				!parse.variables().length && parse.tokens.length == 1 && parse.tokens[0].number_ == 0){
				cancelUpdate = true;
				directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
				directives.push({
					id: 'crisisAlert',
					attribute: 'open',
					value: "Equation of accumulator can not be set to 0. If this is the case then please change the type of the node to parameter."
				});
				this.logging.log("solution-step", {
					type: "zero-equation-accumulator",
					node: this._model.active.getName(this.currentID),
					nodeID: this.currentID,
					property: "equation",
					value: inputEquation,
					correctResult: this._model.given.getEquation(this.currentID),
					checkResult: "INCORRECT"
				});
			}
			array.forEach(parse.variables(), function(variable){
				var givenID = this._model.given.getNodeIDByName(variable);
				var badVarCount = "";
				// Check 2 - Checks for nodes referencing themselves; this causes problems because
				//		functions will always evaluate to true if they reference themselves
				if(!givenID){
					if(!ignoreUnknownTest){
						// Check for number of unknown var, only in student mode.
						badVarCount = this._model.given.getAttemptCount(descriptionID, "unknownVar");
					}
					cancelUpdate = true;  // Don't update model or send ot PM.

					// The following if statement prevents a user from being endlessly stuck if he/she is using an incorrect variable.
					//		To organize this better in the future we may want to move this check into another file with the code from
					//		pedagogical_module.js that is responsible for deciding the correctness of a student's response.
					if(badVarCount){
						this._model.given.setAttemptCount(descriptionID, "unknownVar", badVarCount+1);
						if(badVarCount < 3){
							resetEquation = true;
						} else {
							this._model.given.setAttemptCount(descriptionID, "equation", badVarCount+1);
							cancelUpdate = false;
						}
					}else{
						this._model.given.setAttemptCount(descriptionID, "unknownVar", 1);
						resetEquation = true;
					}
					//directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
					directives.push({id: 'message', attribute: 'append', value: "Unknown variable '" + variable + "'."});
					directives.push({
						id: 'crisisAlert',
						attribute: 'open',
						value: "Unknown variable '" + variable + "' entered in equation."
					});
					this.logging.log("solution-step", {
						type: "unknown-variable",
						node: this._model.active.getName(this.currentID),
						nodeID: this.currentID,
						property: "equation",
						value: inputEquation,
						correctResult: this._model.given.getEquation(this.currentID),
						checkResult: "INCORRECT"
					});
				}

				if(givenID && this._model.active.getType(this.currentID) === "function" &&
					givenID === mapID.call(this._model.active, this.currentID)){
					cancelUpdate = true;
					directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
					directives.push({id: 'message', attribute: 'append', value: "You cannot use '" + variable + "' in the equation. Function nodes cannot reference themselves."});
					this.logging.log("solution-step", {
						type: "self-referencing-function",
						node: this._model.active.getName(this.currentID),
						nodeID: this.currentID,
						property: "equation",
						value: inputEquation,
						correctResult: this._model.given.getEquation(this.currentID),
						checkResult: "INCORRECT"
					});
				}
				//Check 3 - check if accumulator has a reference to itself as per the Trello card https://trello.com/c/0aqmwqqG
				if(givenID && this._model.active.getType(this.currentID) === "accumulator" &&
					givenID === mapID.call(this._model.active, this.currentID)){
					cancelUpdate = true;
					directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
					directives.push({
						id: 'crisisAlert',
						attribute: 'open',
						value: "The old value of the accumulator is already included in the expression, so you don't have to mention it in the expression.  Only put an expression for the change in the accumulators value."
					});
					this.logging.log("solution-step", {
						type: "self-referencing-accumulator",
						node: this._model.active.getName(this.currentID),
						nodeID: this.currentID,
						property: "equation",
						value: inputEquation,
						correctResult: this._model.given.getEquation(this.currentID),
						checkResult: "INCORRECT"
					});
				}
			}, this);

			if(resetEquation){
				this._model.student.setEquation(this.currentID, "");
				directives.push({id: 'equation', attribute: 'value', value: ""});
			}
			if(!cancelUpdate){
				return parse;
			}
			return null;
		},
		expressionSuggestor : function(id, answer){
			//output: message directive, suggestion message 
			id = this._model.active.getDescriptionID(id);
			var givenExpression = this._model.given.getEquation(id);
			var givenAnswer = expression.parse(givenExpression);
			var hash = {}
			var required = [];
			var not_required = [];
			var context = this;
			givenAnswer.tokens.every(function(ele){
				if(ele.type_ != 3) return true;
				hash[context._model.given.getName(ele.index_)] = 'given';
				return true;
			});
			answer.tokens.every(function(ele){
				if(ele.type_ != 3) return true;
				hash[ele.index_] = (typeof hash[ele.index_] == 'undefined') ? 'active' : false
				return true;
			});
			for(var key in hash){ 
				if(hash[key] == 'given') required.push({ 'name' : key, 'type' : 'node' });
				if(hash[key] == 'active') not_required.push({ 'name' : key, 'type' : 'node' });
			}
			var r_len = required.length;
			var nr_len = not_required.length;
			var rsp = null; 
			if(r_len == 0 && nr_len == 0){
				rsp = null;
			}
			else if(r_len && nr_len && required[r_len -1].type == not_required[nr_len -1].type) {
				rsp = "The author does not wants you to use " + not_required.pop().name + " in this expression,"
				rsp += " try using " + required.pop().name + " instead";
			}
			else if(r_len){
				rsp = "The author wants you to use " + required.pop().name + " in the expression";
			}
			else {
				rsp = "The author does not want you to use " + not_required.pop().name + " in the expression";
			}
			return rsp;
						
		},
		createExpressionNodes: function(parse, ignoreUnknownTest){
			/*
			 Create Expression nodes if equation is valid and parsed sucessfully.

			 If the parse succeeds:
			 * substitute in student id for variable names (when possible),
			 * save to model,
			 * update inputs,
			 * update the associated connections in the graph, and
			 * send the equation to the PM. **Done**
			 * Handle the reply from the PM. **Done**
			 * If the reply contains an update to the equation, the model should also be updated.

			 */
			if(parse){
				var inputNodesList = [];
				var cancelUpdate = false;
				var directives = [];

				var widget = registry.byId(this.controlMap.equation);
				var inputEquation = widget.get("value");

				//getDescriptionID is present only in student mode. So in author mode it will give an identity function. This is a work around in case when its in author mode at that time the given model is the actual model. So descriptionID etc are not available. 
				var mapID = this._model.active.getDescriptionID || function(x){ return x; };
				var unMapID = this._model.active.getNodeIDFor || function(x){ return x; };

				array.forEach(parse.variables(), function(variable){
					// Test if variable name can be found in given model

					var givenID = this._model.given.getNodeIDByName(variable);

					// autocreation flag will eventually be set from the URL
					// or from the state table.  Alternatively, we will show a list
					// of variables.
					var autocreationFlag = true;
					/*if(autocreationFlag && !this._model.active.isNode(givenID))
					 this.autocreateNodes(variable);*/
					// The variable "descriptionID" is the corresponding givenModelNodeID from the model (it is not equal to the givenID used here).
					// The variable "badVarCount" is used to track the number of times a user has attempted to use an incorrect variable to prevent
					//		him or her from being stuck indefinitely.

					var descriptionID = "";
					//var badVarCount = "";
					/*if (!ignoreUnknownTest) {
						// Check for number of unknown var, only in student mode.
						descriptionID = this._model.active.getDescriptionID(this.currentID);
						badVarCount = this._model.given.getAttemptCount(descriptionID, "unknownVar");
					}*/

					if(givenID){
						//|| ignoreUnknownTest || badVarCount > 3){
						// Test if variable has been defined already
						var subID = unMapID.call(this._model.active, givenID);
						if(subID){
							// console.log("	   substituting ", variable, " -> ", studentID);
							parse.substitute(variable, subID);
							//inputNodesList.push({ "id": subID, "variable":variable});
						}else if(autocreationFlag){
							//create node
							var id = this._model.active.addNode();
							this.addNode(this._model.active.getNode(id));
							this.setNodeDescription(id, variable);

							inputNodesList.push({ "id": id, "variable":variable});
							//get Node ID and substitute in equation
							var subID2 = unMapID.call(this._model.active, givenID||id);
							parse.substitute(variable, subID2); //this should handle createInputs and connections to automatic node
						}/*else{
							directives.push({id: 'message', attribute: 'append', value: "Quantity '" + variable + "' not defined yet."});
						}*/
					}
				}, this);
				if(directives.length > 0){
					this._model.active.setEquation(this.currentID, inputEquation);
					this.applyDirectives(directives);
					return;
				}
				//Check to see if there are unknown variables in parsedEquation if in student mode
				//If unknown variable exist, do not update equation in model. 
				//Do the same if a function node references itself.
				if (cancelUpdate){
					return null;
				}
				// Expression now is written in terms of student IDs, when possible.
				// Save with explicit parentheses for all binary operations.
				var parsedEquation = parse.toString(true);

				//Check to see if parsedEquation returns a string, change to string if not
				if (typeof parsedEquation == "number"){
					parsedEquation = parsedEquation.toString();
				}

				// This duplicates code in equationDoneHandler
				// console.log("********* Saving equation to model: ", parsedEquation);
				this._model.active.setEquation(this.currentID, parsedEquation);

				// Test if this is a pure sum or product
				// If so, determine connection labels
				var inputs = expression.createInputs(parse);

				// Update inputs and connections
				this._model.active.setInputs(inputs, this.currentID);
				this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);
				// console.log("************** equationAnalysis directives ", directives);

				array.forEach(inputNodesList, lang.hitch(this, function(node){
					this.updateInputNode(node.id, node.variable);
				}));

				// Send to PM if all variables are known.
				console.log(parse);
			}
		},
		// Stub to setting description for auto craeted nodes.
		setNodeDescription: function(id, variable){
		},
		// Stub to connect logging to record bad parse.
		badParse: function(inputEquation){
		},

		// Stub to set connections in the graph
		setConnections: function(from, to){
			// console.log("======== setConnections fired for node" + to);
		},

		// Stub to set connection in the graph / one to one
		setConnection: function(from, to){
			// console.log("======== setConnections fired for node" + to);
		},

		// Hide the value and expression controls in the node editor, depending on the type of node	
		/*adjustNodeEditor: function(type){
			if (type=="function"){
				domStyle.set('valueDiv','visibility', 'hidden');
				domStyle.set('expressionDiv', 'display', 'block');
			}
			else if (type=="parameter"){
				domStyle.set('valueDiv','visibility', 'visible');
				domStyle.set('initLabel', 'display', 'none');				
				domStyle.set('expressionDiv', 'display', 'none');
			}
			else{				
				domStyle.set('expressionDiv', 'display', 'block');
				domStyle.set('valueDiv','visibility', 'visible');	
				domStyle.set('initLabel', 'display', 'inline');
			}
		},*/

		//show node editor
		showNodeEditor: function(/*string*/ id){
			//Checks if the current mode is COACHED mode and exit from node editor if all the modes are defined
			console.log("showNodeEditor called for node ", id);
			this.currentID = id; //moved using inside populateNodeEditorFields
			this.nodeStartAssessment();
			this.disableHandlers = true;
			this.initialControlSettings(id);
			this.populateNodeEditorFields(id);

			// Hide the value and expression controls in the node editor, depending on the type of node		
			var type=this._model.active.getType(this.currentID);
			//this.adjustNodeEditor(type);

			this._nodeEditor.show().then(lang.hitch(this, function(){
				this.disableHandlers = false;
			}));
			var nodeForumBut = registry.byId("nodeForumButton");
			var check_desc=this._model.active.getGivenID(id);
			if(this._forumparams && check_desc && this._model.given.getDescription(check_desc)){
				try{
					var check_desc=this._model.active.getGivenID(id);
				}
				catch(err)
				{
					console.log(err);
				}
				if(this._forumparams && this._model.given.getDescription(check_desc)){
					nodeForumBut.set("disabled", false);
					forum.activateForum(this._model, this.currentID, this._forumparams,this.logging);
				}else{
					//In case there are many nodes,
					//make sure forum button is disabled
					nodeForumBut.set("disabled", true);
				}
			}
			if(this.activityConfig.get("showNodeEditorTour")) {
				var givenNodeID = this._model.active.getDescriptionID(id);
				var steps = this._PM.generateTourSteps(givenNodeID, id, this._model.getNodeEditorTutorialState());
				if (steps && steps.length > 0) {
					this.tour = new Tour(steps);
					this.tour.start();
					var currentButton = this.tour._steps[0];
					var currentStep = this.tour.getCurrentStep();
					if(currentStep!== "default" && currentStep["type"] !== "default") {
						domClass.toggle(dom.byId(currentButton["element"]), "active");
					}

					/** Check if Status counter for node editor tour be incremented
					 *  If the tour steps returns first element as "default": flag is set to false
					 *  else flag is true
					 **/
					this.incNodeTourCounter = steps[0] !== "default";
				} else {
					this.tour = null;
				}
			}
		},

		// Stub to be overwritten by student or author mode-specific method.
		initialControlSettings: function(id){
			console.error("initialControlSettings should be overwritten.");
			//log message added through aspect.
		},

		populateNodeEditorFields: function(nodeid){
			console.log("populate node editor fields enter");
			//populate description
			var model = this._model.active;
			var editor = this._nodeEditor;
			//set task name
			var nodeName = model.getName(nodeid) || "New quantity";
			editor.set('title', nodeName);

			/*
			 Set values and choices based on student model

			 Set selection for description, type, units, inputs (multiple selections)

			 Set value for initial value, equation (input),
			 */


			if(model.getNodeIDFor){
				var d = registry.byId(this.controlMap.description);
				array.forEach(this._model.given.getDescriptions(), function(desc){
					var exists =  model.getNodeIDFor(desc.value);
					d.getOptions(desc).disabled=exists;
					if(desc.value == nodeName){
						d.getOptions(desc).disabled=false;
					}});
			}

			var type = model.getType(nodeid);
			console.log('node type is', type || "not set");

			registry.byId(this.controlMap.type).set('value', type || 'defaultSelect');
			//update labels
			this.updateEquationLabels(type);

			var initial = model.getInitial(nodeid);
			console.log('initial value is ', initial, typeof initial);
			// Initial value will be undefined if it is not in the model
			var isInitial = typeof initial === "number";
			this.lastInitial.value = isInitial?initial.toString():null;
			registry.byId(this.controlMap.initial).attr('value', isInitial?initial:'');

			var unit = model.getUnits(nodeid);
			console.log('unit is', unit || "not set");
			// Initial input in Units box
			registry.byId(this.controlMap.units).set('value', unit || '');

			// Input choices are different in AUTHOR and student modes
			// So they are set in con-author.js and con-student.js

			var equation = model.getEquation(nodeid);
			console.log("equation before conversion ", equation);
			var mEquation = equation ? expression.convert(model, equation) : '';
			console.log("equation after conversion ", mEquation);
			/* mEquation is a number instead of a string if equation is just a number; convert to string before setting the value */
			registry.byId(this.controlMap.equation).set('value', mEquation.toString());
			dom.byId("equationText").innerHTML = mEquation;
			this.equationEntered = true;

			/*
			 The PM sets enabled/disabled and color for the controls

			 Set enabled/disabled for input, units, initial value, type
			 description

			 Color for Description, type, initial value, units, input,
			 and equation.

			 Note that if equation is disabled then
			 input, +, -, *, /, undo, and done should also be disabled.
			 */
		},
		setLogging: function(/*string*/ logging){
			this.logging = logging;
		},

		// Setting Forum Parameters
		setForum: function(forum_params){
			this._forumparams=forum_params;
		},

		continueTour: function(directive){
			var elements = {
				description: "descriptionQuestionMark",
				type: "typeQuestionMark",
				inputs: "inputsQuestionMark",
				equation: "expressionBoxQuestionMark",
				checkExpression: "equationDoneButton",
				initial: "initialValueQuestionMark",
				units: "unitsQuestionMark",
				operations: "operationsQuestionMark",
				done: "closeButton"
			};

			if(directive.id === "description" && directive.attribute === "status" && directive.value === "correct"){
				var givenNodeID = this._model.active.getDescriptionID(this.currentID);
				var steps = this._PM.generateTourSteps(givenNodeID ,this.currentID,  this._model.getNodeEditorTutorialState());
				if(steps && steps.length > 0) {
					if(this.tour) {
						this.tour.end();
					}
					this.tour = new Tour(steps);
					/** Check if Status counter for node editor tour be incremented
					 *  If the tour steps returns first element as "default": flag is set to false
					 *  else flag is true
					 **/
					this.incNodeTourCounter = steps[0] !== "default";
				}else{
					this.tour = null;
				}
			}
			if(this.tour && directive.attribute === "status" && directive.value !== "incorrect"){
				//Remove the step and add it to the end
				var currentStep = this.tour.getCurrentStep();
				if(currentStep!== "default" && currentStep["type"] !== "default") {
					domClass.remove(dom.byId(elements[directive.id]), "active");
				}
				this.tour.removeStep(elements[directive.id]);

				this.tour.start();

				var currentButton = this.tour.getStepByIndex(0);
				if(currentButton !== "default" && currentStep["type"] !== "default") {
					domClass.toggle(dom.byId(currentButton["element"]), "active");
				}
			}
		},

		/*
		 Take a list of directives and apply them to the Node Editor,
		 updating the model and updating the graph.

		 The format for directives is defined in documentation/node-editor.md
		 */
		applyDirectives: function(directives, noModelUpdate){
			// Apply directives, either from PM or the controller itself.
			var tempDirective = null;
			array.forEach(directives, function(directive) {
				if(!noModelUpdate)
					this.updateModelStatus(directive);
				if (directive.attribute != "display" && this.widgetMap[directive.id]) {
					var w = registry.byId(this.widgetMap[directive.id]);
					if (directive.attribute == 'value') {
						w.set("value", directive.value, false);
						if(w.id == 'typeId'){
							this.updateType(directive.value);
						} else if(w.id == 'initialValue'){
							this._model.active.setInitial(this.currentID, directive.value);
						} else if(w.id == 'selectUnits'){
							this.unitsSet(directive.value);
						} else if(w.id == 'equationBox'){
							this.equationSet(directive.value);
						} else if(w.id == 'selectDescription'){
							this.updateDescription(directive.value);
						}
						// Each control has its own function to update the
						// the model and the graph.
					}else{
						w.set(directive.attribute, directive.value);
						if(directive.attribute === "status"){
							tempDirective = directive;
						}
					}
				}else if(directive.attribute == "display"){
					if(this.genericDivMap[directive.id]){
						domStyle.set(this.genericDivMap[directive.id], directive.attribute, directive.value);
					}
				}else if(directive.id == "tweakDirection"){
					if (directive.attribute == 'value') {
						this.updateTweakDirection(directive.value);
					}
				}else if(directive.id == "executionValue"){
					if (directive.attribute == 'value') {
						this.updateExecutionValue(directive.value);
					}else{
						var w = registry.byId("executionValue");
						w.set(directive.attribute, directive.value, false);
					}
				}else if(directive.id == "waveformValue"){
					if (directive.attribute == 'value') {
						this.updateWaveformValue(directive.value);
					}
				}
				else{
					this.logging.clientLog("warning", {
						message: "Directive with unknown id, id :"+directive.id,
						functionTag: 'applyDirectives'
					});
				}
			}, this);

			if(tempDirective && this.activityConfig.get("showNodeEditorTour")) {
				this.continueTour(tempDirective);
			}
		},

		//Shows Node border help tooltip
		showNodeBorderTooltip: function (state) {
			if(registry.byId("NodeBorderTooltipPopup")){
				registry.byId("NodeBorderTooltipPopup").destroyRecursive();
			}
			var isMessageShown = false;
			//Messages to show for node border help
			var borderMessages = {
				"dashed": "A dashed border means your node is incomplete. Click on this node to finish entering its values.",
				"incorrect": "A <strong>red</strong> border means one of the values inside doesn't match the author. Click on the node to try again.",
				"demo": "A <strong>yellow</strong> border means Dragoon gave you one or more of the answers.<br/> Try to get green next time!",
				"correct": "A <strong>green</strong> border means you matched the author's model successfully. Good work!",
				"perfect": "A <strong>green filled node</strong> means you matched the author's model successfully with no mistakes. Great job!"
			};

			var message = "<div id='NodeBorderMessages' style='padding: 5px'>";
			//Check if node is complete
			if(this._model.active.isComplete(this.currentID)){
				//Get node correctness status
				var correctness = this._model.active.getCorrectness(this.currentID);
				if(correctness === "correct"){
					//Check for perfect node with green background
					if(this._model.active.getAssistanceScore(this.currentID) === 0  && !state["perfect"]) {
						message += borderMessages["perfect"];
						state["perfect"] = true;
						isMessageShown = true;
					}else if(this._model.active.getAssistanceScore(this.currentID) !== 0 && !state["correct"]){
						//Correct - Green border
						message += borderMessages[correctness];
						state["correct"] = true;
						isMessageShown = true;
					}
				}
				else if(correctness && !state[correctness]){
					//Incorrect or Demo - Red or yellow border
					message += borderMessages[correctness];
					state[correctness] = true;
					isMessageShown = true;
				}
			}else if(this._model.active.getType(this.currentID) && !state["dashed"]){
				//Incomplete Node - show dashed border message
				message += borderMessages["dashed"];
				state["dashed"] = true;
				isMessageShown = true;
			}

			if(isMessageShown) {
				message += '</div><button class="fRight" type="button" data-dojo-type="dijit/form/Button" id="nodeBorderOKBtn">OK</button><div class="spacer cBoth"></div>';
				var nodeBorderTooltip = new TooltipDialog({
					"id": "NodeBorderTooltipPopup",
					"style": "width: 300px;",
					"content": message,
					onShow: function () {
						console.log("Node border tooltip shown");
						on(dojo.byId('nodeBorderOKBtn'), 'click', function (e) {
							popup.close(nodeBorderTooltip);
							nodeBorderTooltip.destroyRecursive();
						});
						focusUtil.focus(dom.byId('nodeBorderOKBtn'));
					}
				});
				popup.open({
					popup: nodeBorderTooltip,
					around: dom.byId(this.currentID)
				});

				//Save tutorial state
				this._model.setNodeBorderTutorialState(state);
			}
		},

		// Stub to be overwritten by student or author mode-specific method.
		colorNodeBorder: function(nodeID, bool){
			console.log("colorNodeBorder stub called");
		},

		addAssistanceScore: function(/* String */ id){
			//stub over written in con-author. if there is a student specific implementation then kindly move this to con-student
		},

		nodeStartAssessment: function(){
			//stub over written in con-student. assessment function called at node start.
		},

		nodeCloseAssessment: function(){
			//stub over written in con-student. assessment function called at node close
		}

	});
});
