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
/*
 *                               Controller for Node Editor
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang",
    'dojo/aspect', 'dojo/dom', "dojo/dom-class", "dojo/dom-construct", 'dojo/dom-style',
    'dojo/keys', 'dojo/on', "dojo/ready", 
    "dijit/popup", 'dijit/registry', "dijit/TooltipDialog",
    './equation', './graph-objects'
], function(array, declare, lang, aspect, dom, domClass, domConstruct, domStyle, keys, on, ready, popup, registry, TooltipDialog, expression, graphObjects){

    return declare(null, {
        _model: null,
        _nodeEditor: null, // node-editor object- will be used for populating fields
        /*
         When opening the node editor, we need to populate the controls without
         evaluating those changes.
         */
        disableHandlers: false,
        /* The last value entered into the intial value control */
        lastInitialValue: null,
        logging: null,
        // Variable to track if an equation has been entered and checked
	equationEntered: null,  // value is set when node editor opened

        constructor: function(mode, subMode, model, inputStyle){

            console.log("+++++++++ In generic controller constructor");
            lang.mixin(this.controlMap, this.genericControlMap);
            this._model = model;
            this._mode = mode;
            this._inputStyle = inputStyle;

            // structured should be its own module.  For now,
            // initialize
            this.structured._model = this._model;

            // The Node Editor widget must be set up before modifications
            // It might be a better idea to only  call the controller
            // after widgets are set up.
            ready(this, this._setUpNodeEditor);
            ready(this, this._initHandles);

	    // Tool Tip for indicating use of decimals instead of percentages
            this.myTooltipDialog = new TooltipDialog({ 
                style: "width: 150px;",
                content: "Use decimals instead of percent."
            });
	    // Tool Tip for indicating non numeric data is not accepted
            this.myTooltipDialog2 = new TooltipDialog({
                style: "width: 150px;",
                content: "Non-numeric data not accepted"
            });
        },
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
        _setUpNodeEditor: function(){

            // get Node Editor widget from tree
            this._nodeEditor = registry.byId('nodeeditor');

            // Wire up this.closeEditor.  Aspect.around is used so we can stop hide()
	    // from firing if equation is not entered.
            aspect.around(this._nodeEditor, "hide", lang.hitch(this, function(doHide){
                //To keep the proper scope throughout
                var myThis = this;
                return function(){
                    var equation = registry.byId("equationBox");
                    if(equation.value && !myThis.equationEntered){
			//Crisis alert popup if equation not checked
			myThis.applyDirectives([{
			    id: "crisisAlert", attribute:
			    "open", value: "Your expression has not been checked!  Go back and check your expression to verify it is correct, or delete the expression, before closing the node editor."
			}]);
                    }else{
			// Else, do normal closeEditor routine and hide
			doHide.apply(myThis._nodeEditor);
			myThis.closeEditor.call(myThis);
                    }
        };
	    }));

            /*
             Hide/show fields based on inputStyle
             If this can change during a session, then we
             should move this to this.showNodeEditor()
             */
            var algebraic = (this._inputStyle == "algebraic" ? "" : "none");
            var structured = (this._inputStyle == "structured" ? "" : "none");
            domStyle.set("algebraic", "display", algebraic);
            domStyle.set("structured", "display", structured);
            domStyle.set("equationBox", "display", algebraic);
            domStyle.set("equationText", "display", structured);

            /*
             Add attribute handler to all of the controls
             When "status" attribute is changed, then this function
             is called.
             */
            var setStatus = function(value){
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
            };
            for(var control in this.controlMap){
                var w = registry.byId(this.controlMap[control]);
                w._setStatusAttr = setStatus;
            }
            /*
             If the status is set for equationBox, we also need to set
             the status for equationText.  Since equationText is not a widget,
             we need to set it explicitly.
             
             Adding a watch method to the equationBox didn't work.
             */
            aspect.after(registry.byId(this.controlMap.equation), "_setStatusAttr",
                    lang.hitch({domNode: dom.byId("equationText")}, setStatus),
                    true);

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

                var crisis = registry.byId(this.widgetMap.crisisAlert);
                crisis._setOpenAttr = function(message){
                    var crisisMessage = dom.byId('crisisMessage');
                    console.log("crisis alert message ", message);
                    crisisMessage.innerHTML = message;
                    this.show();
                };
                on(registry.byId("OkButton"), "click", function(){
                    console.log("this is called");
                    crisis.hide();
                });

            // Add appender to message widget
            var messageWidget = registry.byId(this.widgetMap.message);
            messageWidget._setAppendAttr = function(message){
                var message_box_id=dom.byId("messageBox");
		
		// Set the background color for the new <p> element
		// then undo the background color after waiting.
                var element=domConstruct.place('<p style="background-color:#FFD700;">' 
					       + message + '</p>', message_box_id);
                window.setTimeout(function(){ 
		    // This unsets the "background-color" style
                    domStyle.set(element, "backgroundColor", "");
                }, 3000);  // Wait in milliseconds

                // Scroll to bottoms
                this.domNode.scrollTop = this.domNode.scrollHeight;
            };
             /*Set interval for message blink*/
             
            
            /*
             Add fields to units box, using units in model node
             In author mode, this needs to be turned into a text box.
             */
            var u = registry.byId("selectUnits");
            // console.log("units widget ", u);
            array.forEach(this._model.getAllUnits(), function(unit){
                u.addOption({label: unit, value: unit});
            });
        },
         
         
        // Function called when node editor is closed.
        // This can be used as a hook for saving sessions and logging
        closeEditor: function(){
            console.log("++++++++++ entering closeEditor");
            // Erase modifications to the control settingse.
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
            this.lastInitialValue = "";

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
            this.colorNodeBorder(this.currentID);

            // update Node labels upon exit	
            var nodeName = graphObjects.getNodeName(this._model.active,this.currentID);
            if(dom.byId(this.currentID + 'Label'))
                domConstruct.place(nodeName, this.currentID + 'Label', "replace");

	    // In case any tool tips are still open.
            this.closePops();
            //this.disableHandlers = false;

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
             *   event handler for 'type' field
             *   'handleType' will be called in either Student or Author mode
             * */
            var type = registry.byId(this.controlMap.type);
            type.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleType.apply(this, arguments);
            }));

            /*
             *   event handler for 'Initial' field
             *   'handleInitial' will be called in either Student or Author mode
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
                if(evt.keyCode == keys.ENTER)
                    this.emit('Change', {}, [this.get('value')]);
            });

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
            var buttons = ["plus", "minus", "times", "divide", "undo", "equationDone", "sum", "product"];
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
                /*  When the equation box is enabled/disabled also do the same
                 for this button */
                equationWidget.watch("disabled", function(attr, oldValue, newValue){
                    // console.log("************* " + (newValue?"dis":"en") + "able " + button);
                    w.set("disabled", newValue);
                });
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
        closePops: function(){
            popup.close(this.myTooltipDialog);
            popup.close(this.myTooltipDialog2);
    	},
        checkNumber: function(initialString){
            var initialWidget = dom.byId(this.widgetMap.initial);
            // Popups only occur for an error, so leave it up until
            // the next time the student attempts to enter a number.
	    this.closePops();
            // we do this type conversion because we used a textbox for initialvalue input which is a numerical
            var initial= +initialString; // usage of + unary operator converts a string to number 
            // use isNaN to test if conversion worked.
            if(isNaN(initial)){
                // Put in checks here
                console.log('not a number');
                //initialValue is the id of the textbox, we get the value in the textbox
                if(!initialString.match('%')){ //To check the decimals against percentages
                    console.warn("Sachin should log when this happens");
                    popup.open({
                        popup: this.myTooltipDialog2,
                        around: initialWidget
                    });
                }else{ 
		    // if entered string has percentage symbol, pop up a message to use decimals
                    console.warn("Sachin should log when this happens");
                    popup.open({
                        popup: this.myTooltipDialog,
                        around: initialWidget
                    });
                }            
                return false; 
            }
            return true;
        },
        updateType: function(type){
            //update node type on canvas
            console.log("===========>   changing node class to " + type);

            //if type is triangle, remove border and box-shadow
            if(type==''){
  		domStyle.set(this.currentID,'border','');
		domStyle.set(this.currentID,'box-shadow','');
		domClass.replace(this.currentID, "triangle");
            } else {
                domClass.replace(this.currentID, type);
            }

            // updating the model and the equation labels
            this._model.active.setType(this.currentID, type);
            this.updateEquationLabels();
            
            var nodeName = graphObjects.getNodeName(this._model.active,this.currentID,type);
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
                        nodeName = 'new ' + name + ' = ' + 'old ' + name + ' +';
                        tt = " * Change in Time";
                        break;
                    case "function":
                        nodeName = name + ' = ';
                        break;
                    case "parameter":
                    case "none":
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
            dom.byId('timeStepLabel').innerHTML = tt;
        },
        equationInsert: function(text){
            var widget = registry.byId(this.controlMap.equation);
            var oldEqn = widget.get("value");
            // Get current cursor position or go to end of input
            // console.log("       Got offsets, length: ", widget.domNode.selectionStart, widget.domNode.selectionEnd, oldEqn.length);
            var p1 = widget.domNode.selectionStart;
            var p2 = widget.domNode.selectionEnd;
            widget.set("value", oldEqn.substr(0, p1) + text + oldEqn.substr(p2));
            // Set cursor to end of current paste
            widget.domNode.selectionStart = widget.domNode.selectionEnd = p1 + text.length;
        },

        handleEquation: function(equation){
            var w = registry.byId(this.widgetMap.equation);
            this.equationEntered = false;
            w.set("status", "");
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
				dom.byId("equationText").innerHTML = ""
			}
			else {
				var widget = registry.byId(this.controlMap.equation);
				this.structured.pop();
			}
        },
        equationAnalysis: function(directives){
            this.equationEntered = true;
            console.log("****** enter button");
            /*
             This takes the contents of the equation box and parses it.
             
             If the parse fails:
             * send a warning message, and
             * log attempt (the PM does not handle syntax errors).
             
             If the parse succeeds:
             * substitute in student id for variable names (when possible),
             * save to model,
             * update inputs,
             * update the associated connections in the graph, and
             * send the equation to the PM. **Done**
             * Handle the reply from the PM. **Done**
             * If the reply contains an update to the equation, the model should also be updated.
             
             Note: the model module may do some of these things automatically.
             
             Also, the following section could just as well be placed in the PM?
             */
            var widget = registry.byId(this.controlMap.equation);
            var inputEquation = widget.get("value");
            var parse = null;
            try {
                parse = expression.parse(inputEquation);
            }catch(err){
                console.log("Parser error: ", err);
                this._model.active.setEquation(this.currentID, inputEquation);
                directives.push({id: 'message', attribute: 'append', value: 'Incorrect equation syntax.'});
                directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
                // Call hook for bad parse
                this.badParse(inputEquation);
            }

            if(parse){
                var toPM = true;
                array.forEach(parse.variables(), function(variable){
                    // Test if variable name can be found in given model
                    var givenID = this._model.given.getNodeIDByName(variable);
                    // Checks for nodes referencing themselves; this causes problems because
                    //      functions will always evaluate to true if they reference themselves
                    if(this._model.student.getType(this.currentID) === "function"){
                        if(givenID === this._model.student.getDescriptionID(this.currentID)){
                            toPM = false;
                            directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
                            directives.push({id: 'message', attribute: 'append', value: "You cannot use '" + variable + "' in the equation. Function nodes cannot reference themselves."});
                        }
                    }
                    if(givenID){
                        // Test if variable has been defined already
                        var studentID = this._model.active.getNodeIDFor(givenID);
                        if(studentID){
                            // console.log("       substituting ", variable, " -> ", studentID);
                            parse.substitute(variable, studentID);
                        }else {
                            directives.push({id: 'message', attribute: 'append', value: "Quantity '" + variable + "' not defined yet."});
                        }
                    }else {
                        toPM = false;  // Don't send to PM
                        directives.push({id: 'message', attribute: 'append', value: "Unknown variable '" + variable + "'."});
                    }
                }, this);
                // Expression now is written in terms of student IDs, when possible.
                // Save with explicit parentheses for all binary operations.
                var parsedEquation = parse.toString(true);

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

                // Send to PM if all variables are known.
                return toPM ? parse : null;
            }
            return null;
        },
        // Stub to connect logging to record bad parse.
        badParse: function(inputEquation){
        },
        // Stub to set connections in the graph
        setConnections: function(from, to){
            // console.log("======== setConnections fired for node" + to);
        },
        //show node editor
        showNodeEditor: function(/*string*/ id){
            console.log("showNodeEditor called for node ", id);
            this.currentID = id; //moved using inside populateNodeEditorFields
            this.disableHandlers = true;
            this.initialControlSettings(id);
            this.populateNodeEditorFields(id);
            this._nodeEditor.show().then(lang.hitch(this, function(){
                this.disableHandlers = false;
            }));
        },
        // Stub to be overwritten by student or author mode-specific method.
        initialControlSettings: function(id){
            console.error("initialControlSettings should be overwritten.");
            //log message added through aspect.
        },
        populateNodeEditorFields: function(nodeid){
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
            console.log('initial value is', initial || "not set");
            this.lastInitialValue = initial;
            registry.byId(this.controlMap.initial).attr('value', initial || '');

            var unit = model.getUnits(nodeid);
            console.log('unit is', unit || "not set");
            registry.byId(this.controlMap.units).set('value', unit || 'defaultSelect');

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
	/* 
         Take a list of directives and apply them to the Node Editor,
         updating the model and updating the graph.
	 
         The format for directives is defined in documentation/javascript.md
	 */
        applyDirectives: function(directives, noModelUpdate){
            // Apply directives, either from PM or the controller itself.
            array.forEach(directives, function(directive) {
                if(!noModelUpdate)
                    this.updateModelStatus(directive);
                if (this.widgetMap[directive.id]) {
                    var w = registry.byId(this.widgetMap[directive.id]);
                    if (directive.attribute == 'value') {
                        w.set("value", directive.value, false);
                        // Each control has its own function to update the
                        // the model and the graph.
                        this[directive.id+'Set'].call(this, directive.value);
                    } else
                        w.set(directive.attribute, directive.value);
                } else {
                    this.logging.clientLog("warning", {
                        message: "Directive with unknown id, id :"+directive.id,
                        functionTag: 'applyDirectives'
                    });
                }

            }, this);
        },

        // Stub to be overwritten by student or author mode-specific method.
	colorNodeBorder: function(nodeId){
	    console.log("colorNodeBorder stub called");
	                                  //get model type
        var type = this._model.active.getType(nodeId);
        if(type){
            console.log('model type is '+type);

            var colorMap = {
                correct: "green",
                incorrect: "#FF8080",
                demo: "yellow",
                neutral: "gray"
            };
            console.log('nodeId is '+nodeId);
            var isComplete   = this._model.active.isComplete(nodeId)?'solid':'dashed';
            var color = this._model.active.getCorrectness? this._model.active.getCorrectness(nodeId):'neutral';
            console.log('color is '+color);
            domStyle.set(this.currentID,'border','2px '+isComplete+' '+colorMap[color]);
            domStyle.set(this.currentID,'box-shadow','inset 0px 0px 5px #000 , 0px 0px 10px #000');
        }
    }

    });
});
