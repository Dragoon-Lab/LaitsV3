/* global define */
/*
 *                               Controller for Node Editor
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang",
    'dojo/aspect', 'dojo/dom', "dojo/dom-class", "dojo/dom-construct", 'dojo/dom-style',
    'dojo/keys', 'dojo/on', "dojo/ready", 'dijit/registry',
    './equation'
], function(array, declare, lang, aspect, dom, domClass, domConstruct, style, keys, on, ready, registry, expression) {

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
        constructor: function(mode, subMode, model, inputStyle) {

            console.log("+++++++++ In generic controller constructor");
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

            lang.mixin(this.widgetMap, this.controlMap);
        },
        // A list of all form controls
        controlMap: {
            description: "selectDescription",
            type: "typeId",
            initial: "initialValue",
            units: "selectUnits",
            inputs: "nodeInputs",
            equation: "equationBox"
        },
        // A list of all widgets.  (The constructor mixes this with controlMap)
        widgetMap: {
            message: 'messageBox',
            crisisAlert: 'crisisAlertMessage'
        },
        // Controls that are select menus
        selects: ['description', 'type', 'units', 'inputs'],
        _setUpNodeEditor: function() {

            // get Node Editor widget from tree
            this._nodeEditor = registry.byId('nodeeditor');

            // Wire up this.closeEditor
            aspect.after(this._nodeEditor, "hide",
                    lang.hitch(this, this.closeEditor));

            /*
             Hide/show fields based on inputStyle
             If this can change during a session, then we
             should move this to this.showNodeEditor()
             */
            var algebraic = (this._inputStyle == "algebraic" ? "" : "none");
            var structured = (this._inputStyle == "structured" ? "" : "none");
            style.set("algebraic", "display", algebraic);
            style.set("structured", "display", structured);
            style.set("equationBox", "display", algebraic);
            style.set("equationText", "display", structured);

            /*
             Initialize fields in the node editor that are
             common to all nodes in a problem.
             
             In AUTHOR mode, this needs to be done when the
             node editor is opened.
             */
            // Add fields to Description box and inputs box
            // In author mode, the description control must be a text box
            var d = registry.byId(this.controlMap.description);
            // populate input field
            var t = registry.byId(this.controlMap.inputs);
            console.assert(t, "Can't find widget " + this.controlMap.inputs);
            var positiveInputs = registry.byId("positiveInputs");
            var negativeInputs = registry.byId("negativeInputs");
            // console.log("description widget = ", d);
            // d.removeOption(d.getOptions()); // Delete all options
            array.forEach(this._model.given.getDescriptions(), function(desc) {
                d.addOption(desc);
                var name = this._model.given.getName(desc.value);
                var option = {label: desc.label + ' ' + ' | ' + ' ' + name, value: desc.value};
                t.addOption(option);
                positiveInputs.addOption(option);
                negativeInputs.addOption(option);
            }, this);

            /*
             Add attribute handler to all of the controls
             When "status" attribute is changed, then this function
             is called.
             */
            var setStatus = function(value) {
                var colorMap = {
                    correct: "lightGreen",
                    incorrect: "#FF8080",
                    demo: "yellow",
                    premature: "lightBlue"
                };
                if (value)
                    console.assert(colorMap[value], "Invalid color specification " + value);
                /* BvdS:  I chose bgColor because it was easy to do
                 Might instead/also change text color?
                 Previously, just set domNode.bgcolor but this approach didn't work
                 for text boxes.   */
                // console.log(">>>>>>>>>>>>> setting color ", this.domNode.id, " to ", value);
                style.set(this.domNode, 'backgroundColor', value ? colorMap[value] : '');
            };
            for (var control in this.controlMap) {
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

            var setEnableOption = function(value) {
                console.log("++++ in setEnableOption, scope=", this);
                array.forEach(this.options, function(option) {
                    if (!value || option.value == value)
                        option.disabled = false;
                });
                this.startup();
            };
            var setDisableOption = function(value) {
                console.log("++++ in setDisableOption, scope=", this);
                array.forEach(this.options, function(option) {
                    if (!value || option.value == value)
                        option.disabled = true;
                });
                this.startup();
            };
            // All <select> controls
            array.forEach(this.selects, function(select) {
                var w = registry.byId(this.controlMap[select]);
                w._setEnableOptionAttr = setEnableOption;
                w._setDisableOptionAttr = setDisableOption;
            }, this);

            var crisis = registry.byId(this.widgetMap.crisisAlert);
            crisis._setOpenAttr = function(message) {
                console.log("crisis alert message ", message);
                this.set('content', message); //deprecated error
                //this.setContent(message);
                this.show();
            };

            // Add appender to message widget
            var messageWidget = registry.byId(this.widgetMap.message);
            messageWidget._setAppendAttr = function(message) {
                var existing = this.get('content');
                // console.log("+++++++ appending message '" + message + "' to ", this, existing);
                this.set('content', existing + '<p>' + message + '</p>');
                // Scroll to bottom
                this.domNode.scrollTop = this.domNode.scrollHeight;
            };

            /*
             Add fields to units box, using units in model node
             In author mode, this needs to be turned into a text box.
             */
            var u = registry.byId("selectUnits");
            // console.log("units widget ", u);
            array.forEach(this._model.getAllUnits(), function(unit) {
                u.addOption({label: unit, value: unit});
            });
        },
        // Function called when node editor is closed.
        // This can be used as a hook for saving sessions and logging
        closeEditor: function() {
            console.log("++++++++++ entering closeEditor");
            // Erase modifications to the control settingse.
            // Enable all options in select controls.
            array.forEach(this.selects, function(control) {
                var w = registry.byId(this.controlMap[control]);
                w.set("enableOption", null);  // enable all options
            }, this);
            // For all controls:
            for (var control in this.controlMap) {
                var w = registry.byId(this.controlMap[control]);
                w.set("disabled", false);  // enable everything
                w.set("status", '');  // remove colors
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
        },
        //set up event handling with UI components
        _initHandles: function() {
            // Summary: Set up Node Editor Handlers

            /*
             Attach callbacks to each field in node Editor.
             
             The lang.hitch sets the scope to the current scope
             and then the handler is only called when disableHandlers
             is false.
             
             We could write a function to attach the handlers?
             */

            /*
             *   event handler for 'type' field
             *   'handleType' will be called in either Student or Author mode
             * */
            var type = registry.byId(this.controlMap.type);
            type.on('Change', lang.hitch(this, function() {
                return this.disableHandlers || this.handleType.apply(this, arguments);
            }));

            /*
             *   event handler for 'Initial' field
             *   'handleInitial' will be called in either Student or Author mode
             * */
            var initialWidget = registry.byId(this.controlMap.initial);
            // This event gets fired if student hits TAB or input box
            // goes out of focus.
            initialWidget.on('Change', lang.hitch(this, function() {
                return this.disableHandlers || this.handleInitial.apply(this, arguments);
            }));
            // Look for ENTER key event and fire 'Change' event, passing
            // value in box as argument.  This is then intercepted by the
            // regular handler.
            initialWidget.on("keydown", function(evt) {
                // console.log("----------- input character ", evt.keyCode, this.get('value'));
                if (evt.keyCode == keys.ENTER)
                    this.emit('Change', {}, [this.get('value')]);
            });

            //Changed by Deepak
            //this handler should be in student controller
            /*var inputsWidget = registry.byId(this.controlMap.inputs);
             inputsWidget.on('Change',  lang.hitch(this, function(){
             return this.disableHandlers || this.handleInputs.apply(this, arguments);
             }));*/


            var positiveWidget = registry.byId("positiveInputs");
            positiveWidget.on('Change', lang.hitch(this.structured, this.structured.handlePositive));

            var negativeWidget = registry.byId("negativeInputs");
            negativeWidget.on('Change', lang.hitch(this.structured, this.structured.handleNegative));

            //workaround to handleInputs on Same Node Click
            /* inputsWidget.on('Click',lang.hitch(this,function(){
             return this.disableHandlers || this.handleInputs.apply(this,arguments);
             }));*/

            var equationWidget = registry.byId(this.controlMap.equation);
            equationWidget.on('Change', lang.hitch(this, function() {
                return this.disableHandlers || this.handleEquation.apply(this, arguments);
            }));

            // When the equation box is enabled/disabled, do the same for
            // the inputs widgets.
            array.forEach(["nodeInputs", "positiveInputs", "negativeInputs"], function(input) {
                var widget = registry.byId(input);
                equationWidget.watch("disabled", function(attr, oldValue, newValue) {
                    // console.log("************* " + (newValue?"dis":"en") + "able inputs");
                    widget.set("disabled", newValue);
                });
            });

            // For each button 'name', assume there is an associated widget in the HTML
            // with id 'nameButton' and associated handler 'nameHandler' below.
            var buttons = ["plus", "minus", "times", "divide", "undo", "equationDone", "sum", "product"];
            array.forEach(buttons, function(button) {
                var w = registry.byId(button + 'Button');
                console.assert(w, "Button for " + button + " not found");
                var handler = this[button + 'Handler'];
                console.assert(handler, "Button handler '" + handler + "' not found");
                w.on('click', lang.hitch(this, handler));
                /*  When the equation box is enabled/disabled also do the same
                 for this button */
                equationWidget.watch("disabled", function(attr, oldValue, newValue) {
                    // console.log("************* " + (newValue?"dis":"en") + "able " + button);
                    w.set("disabled", newValue);
                });
            }, this);

        },
        // Need to save state of the node editor in the status section
        // of the student model.  See documentation/json-format.md
        updateModelStatus: function(desc) {
            if (this.validStatus[desc.attribute]) {
                var opt = {};
                opt[desc.attribute] = desc.value;
                this._model.student.setStatus(this.currentID, desc.id, opt);
            } else {
                // There are some directives that should update
                // the student model node (but not the status section).
                console.warn("======= not saving in status, node=" + this.currentID + ": ", desc);
            }
        },
        // attributes that should be saved in the status section
        validStatus: {status: true, disabled: true},
        updateNodes: function() {
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
        addQuantity: function(source, destinations) {
        },
        updateType: function(type) {
            //update node type on canvas
            console.log("===========>   changing node class to " + type);
            domClass.replace(this.currentID, type);
            var nodeName = this._model.active.getName(this.currentID);
            if (nodeName)
                nodeName = '<div id=' + this.currentID + 'Label  class="bubble"><strong>' + nodeName + '</strong></div>';
            else
                nodeName = '';
            if (dom.byId(this.currentID + 'Label'))
                domConstruct.place(nodeName, this.currentID + 'Label', "replace");
            else //new node
                domConstruct.place(nodeName, this.currentID);

            // updating the model and the equation labels	    
            this._model.active.setType(this.currentID, type);
            this.updateEquationLabels();
        },
        updateEquationLabels: function(typeIn) {
            var type = typeIn || this._model.active.getType(this.currentID) || "none";
            var name = this._model.active.getName(this.currentID);
            var nodeName = "";
            var tt = "";
            // Only add label when name exists
            if (name) {
                switch (type) {
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
                        console.error("Invalid type ", type);
                }
            }
            // Removing all the text is the same as setting display:none.
            dom.byId('equationLabel').innerHTML = nodeName;
            dom.byId('timeStepLabel').innerHTML = tt;
        },
        equationInsert: function(text) {
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
        //Changed by Deepak
        //This function should be in Author and Student controller
        //Moving it from here to both student/author controller
        /*        handleInputs: function(id){
         if(id.MOUSEDOWN){
         if(this.lastHandleInputId){
         console.log('onclick event found onSelect, use old id '+this.lastHandleInputId);
         id=this.lastHandleInputId; //restore
         }else
         return;  //if last id is not defined return
         }else
         this.lastHandleInputId=id; //copy it for next onClick event
         
         //check if id is  not select else return
         
         console.log("*******Student has chosen input", id, this);
         // Should add name associated with id to equation
         // at position of cursor or at the end.
         var expr = this._model.given.getName(id);
         this.equationInsert(expr);
         //restore to default  - creating select input as stateless
         registry.byId(this.controlMap.inputs).set('value', 'defaultSelect',false);
         },*/

        handleEquation: function(equation) {
            // Generally, we don't need to do anthing for these events
        },
        plusHandler: function() {
            console.log("****** plus button");
            this.equationInsert('+');
        },
        minusHandler: function() {
            console.log("****** minus button");
            this.equationInsert('-');
        },
        timesHandler: function() {
            console.log("****** times button");
            this.equationInsert('*');
        },
        divideHandler: function() {
            console.log("****** divide button");
            this.equationInsert('/');
        },
        sumHandler: function() {
            console.log("****** sum button");
            this.structured.operation = "sum";
            this.structured.update();
        },
        productHandler: function() {
            console.log("****** product button");
            this.structured.operation = "product";
            this.structured.update();
        },
        structured: {
            _model: null, // Needs to be set to to instance of model
            operation: "sum",
            positives: [],
            negatives: [],
            handlePositive: function(id) {
                console.log("****** structured.handlePositives ", id);
                this.positives.push(this._model.given.getName(id));
                this.update();
                registry.byId("positiveInputs").set('value', 'defaultSelect', false);// restore to default
            },
            handleNegative: function(id) {
                console.log("****** structured.handleNegatives ", id);
                this.negatives.push(this._model.given.getName(id));
                this.update();
                registry.byId("negativeInputs").set('value', 'defaultSelect', false);// restore to default
            },
            update: function() {
                // Update expression shown in equation box
                // And structured expression
                var pos = "";
                var op = this.operation == "sum" ? "+" : "*";
                var nop = this.operation == "sum" ? "-" : "/";
                array.forEach(this.positives, function(term, i) {
                    if (i > 0)
                        pos += op;
                    pos += term;
                });
                if (this.negatives.length > 0 && this.positives.length > 1)
                    pos = "(" + pos + ")";
                if (this.positives.length == 0 && this.negatives.length > 0 && this.operation == "product")
                    pos = "1";
                var neg = "";
                array.forEach(this.negatives, function(term, i) {
                    if (i > 0)
                        neg += op;
                    neg += term;
                });
                if (this.negatives.length > 1)
                    neg = "(" + neg + ")";
                if (this.negatives.length > 0)
                    neg = nop + neg;
                pos += neg;
                console.log("********* New equation is ", pos);

                // Print in equation box
                var equationWidget = registry.byId("equationBox");
                equationWidget.set("value", pos);
                dom.byId("equationText").innerHTML = pos;

            },
            reset: function() {
                this.positives.length = 0;
                this.negatives.length = 0;
                this.update();
            }
        },
        undoHandler: function() {
            var widget = registry.byId(this.controlMap.equation);
            // Delete everything in equation box.
            var oldEqn = widget.set("value", "");
            this.structured.reset();
        },
        equationAnalysis: function(directives) {
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
            } catch (err) {
                console.log("Parser error: ", err);
                this._model.active.setEquation(this.currentID, inputEquation);
                directives.push({id: 'message', attribute: 'append', value: 'Incorrect equation syntax.'});
                directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
                // Call hook for bad parse
                this.badParse(inputEquation);
            }

            if (parse) {
                var toPM = true;
                array.forEach(parse.variables(), function(variable) {
                    // Test if variable name can be found in given model
                    var givenID = this._model.given.getNodeIDByName(variable);
                    // Checks for nodes referencing themselves; this causes problems because
                    //      functions will always evaluate to true if they reference themselves
                    if (this._model.student.getType(this.currentID) === "function") {
                        alert(42);
                        if (givenID === this._model.student.getDescriptionID(this.currentID)) {
                            toPM = false;
                            directives.push({id: 'equation', attribute: 'status', value: 'incorrect'});
                            directives.push({id: 'message', attribute: 'append', value: "You cannot use '" + variable + "' in the equation. Function nodes cannot reference themselves."});
                        }
                    }
                    if (givenID) {
                        // Test if variable has been defined already
                        var studentID = this._model.active.getNodeIDFor(givenID);
                        if (studentID) {
                            // console.log("       substituting ", variable, " -> ", studentID);
                            parse.substitute(variable, studentID);
                        } else {
                            directives.push({id: 'message', attribute: 'append', value: "Quantity '" + variable + "' not defined yet."});
                        }
                    } else {
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

                // Update inputs and connections
                this._model.active.setInputs(parse.variables(), this.currentID);
                this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);
                // console.log("************** equationAnalysis directives ", directives);

                // Send to PM if all variables are known.
                return toPM ? parse : null;
            }
            return null;
        },
        // Stub to connect logging to record bad parse.
        badParse: function(inputEquation) {
        },
        // Stub to set connections in the graph
        setConnctions: function(from, to) {
            // console.log("======== setConnections fired for node" + to);
        },
        //show node editor
        showNodeEditor: function(/*string*/ id) {
            console.log("showNodeEditor called for node ", id);
            this.currentID = id; //moved using inside populateNodeEditorFields
            this.disableHandlers = true;
            this.initialControlSettings(id);
            this.populateNodeEditorFields(id);
            this._nodeEditor.show().then(
                    lang.hitch(this, function() {
                this.disableHandlers = false;
            })
                    );
        },
        // Stub to be overwritten by student or author mode-specific method.
        initialControlSettings: function(id) {
            console.error("initialControlSettings should be overwritten.");
        },
        populateNodeEditorFields: function(nodeid) {
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
            registry.byId(this.controlMap.equation).set('value', mEquation);
            dom.byId("equationText").innerHTML = mEquation;

            /*
             The PM sets enabled/disabled and color for the controls
             
             Set enabled/disabled for input, units, initial value, type
             description
             
             Color for Description, type, initial value, units, input,
             and equation.
             
             Note that if equation is disabled then
             input, +, -, *, /, undo, and done should also be disabled.
             */
        }
    });
});
