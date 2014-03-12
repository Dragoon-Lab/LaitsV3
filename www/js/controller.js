/* global define */
/*
 *                               Controller for Node Editor
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang", 
    'dojo/aspect', 'dojo/dom', 'dojo/on', "dojo/ready", 'dijit/registry',
    "./pedagogical_module","parser/parser","dojo/dom-class","dojo/dom-construct"
], function(array, declare, lang, aspect, dom, on, ready, registry, PM, parser,domClass,domConstruct) {
    
    return declare(null, {
	
	_model: {},
        _PM: {},
	_nodeEditor: null, // node-editor object- will be used for populating fields
	/*
	 When opening the node editor, we need to populate the controls without
	 evaluating those changes.
	 */
	disableHandlers: false,
	
	constructor: function(mode, subMode, model){
	    this._model = model;
	    this._PM = new PM(mode, subMode, model);
	    
	    // The Node Editor widget must be set up before modifications
            // It might be a better idea to only  call the controller
	    // after widgets are set up.
  	    ready(this, this._setUpNodeEditor);

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
	    message: 'messageBox'
	},

	// Controls that are select menus
	selects: ['description', 'type', 'units', 'inputs'],

        
	_setUpNodeEditor: function(){
	    
	    // get Node Editor widget from tree
	    this._nodeEditor = registry.byId('nodeeditor');

	    // Wire up this.closeEditor
	    aspect.after(this._nodeEditor,"hide", 
			 lang.hitch(this, this.closeEditor), true);

            // Initialize fields in the node editor that are
            // common to all nodes in a problem.
	    
	    // Add fields to Description box and inputs box
            // In author mode, the description control must be a text box
	    var d = registry.byId(this.controlMap.description);
            // populate input field
            var t = registry.byId(this.controlMap.inputs);
       	    // console.log("description widget = ", d);
	    // d.removeOption(d.getOptions()); // Delete all options
	    array.forEach(this._model.getAllDescriptions(), function(desc){
	        d.addOption(desc);
		var name = this._model.getName(desc.value);
		var option = {label: desc.label+' '+ ' | '+' '+ name, value:desc.value};
		t.addOption(option);
	    }, this);

            /*
	     Add attribute handler to all of the controls
	     When "status" attribute is changed, then this function
	     is called.
	     */
	    var setStatus = function(value){
		var colorMap = {
		    correct: "lightGreen",
		    incorrect: "#FF8080",
		    demo: "yellow"
		};
		if(value)
		    console.assert(colorMap[value], "Invalid color specification "+value);
		// BvdS:  I chose bgColor because it was easy to do
		// Might instead/also change text color?  
		this.domNode.bgColor = value?colorMap[value]:'';
	    };
	    for(var control in this.controlMap){
		var w = registry.byId(this.controlMap[control]);
		w._setStatusAttr = setStatus;
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
	    messageWidget._setAppendAttr = function (message){
		var existing = this.get('content');
		// console.log("+++++++ appending message '" + message + "' to ", this, existing);
		this.set('content', existing + '<p>' + message + '</p>');
	    };
	    
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

	    /* Erase messages
	     Eventually, we probably want to save and restore
	     messages for each node. */
            var messageWidget = registry.byId(this.widgetMap.message);
	    messageWidget.set('content', '');
	},

	//set up event handling with UI components
	initHandles:function(){
	    // Summary: Set up Node Editor Handlers
	  
	    /*
	     Attach callbacks to each field in node Editor.

	     The lang.hitch sets the scope to the current scope
	     and then the handler is only called when disableHandlers
	     is false.

	     We could write a function to attach the handlers?
	     */

	    var desc = registry.byId(this.controlMap.description);
            on(desc, 'Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleDescription.apply(this, arguments);
	    }));

	    var type = registry.byId(this.controlMap.type);
            on(type, 'Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleType.apply(this, arguments);
	    }));
	    
	    var done = dom.byId("doneNodeEditor");
	    on(done, 'click',  function(){
		console.log("*********** handler for done");
	    });

	    var plus = dom.byId("plus");
            console.log("testing the plus widget", desc);
            on(plus, 'click', function(){
		console.log("******** handler for plus");
	    });  
	},


	// Need to save state of the node editor in the status section
	// of the student model.  See documentation/json-format.md
	updateModelStatus: function(desc){
	    if(this.validStatus[desc.attribute]){
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
	    
	handleDescription: function(selectDescription){
            console.log("****** in handleDescription ", this.currentID, selectDescription);
	    if(selectDescription == 'defaultSelect')return; // don't do anything if they choose default
            this._model.active.setDescriptionID(this.currentID, selectDescription);
            var directives = this._PM.descriptionAction(this.currentID, selectDescription);
	    array.forEach(directives , function(desc){
		this.updateModelStatus(desc);
		var w = registry.byId(this.widgetMap[desc.id]);
		console.assert(w, "widget not found", this.widgetMap, desc, this.widgetMap[desc.id]);
		// console.log("*********  setting widget ", w, " using ", desc);
		w.set(desc.attribute, desc.value);
            }, this);	    
	},

	handleType: function(type){
	    console.log("****** Student has chosen type ", type, this);
	    if(type == 'defaultSelect')return; // don't do anything if they choose default
	    // Need to call PM, and handle reply from PM,

        //update node type
        console.log("===========>   changing node class to "+type);
        domClass.replace(this.currentID, type);

        var nodeName = this._model.student.getName(this.currentID);
        if(nodeName && type != "triangle")
            nodeName='<div id='+this.currentID+'Label><strong>'+nodeName+'</strong></div>';
        else
            nodeName='';
        if(lang.exists(this.currentID+'Label'))
            domConstruct.place(nodeName,this.currentID+'Label',"replace");
        else //new node
            domConstruct.place(nodeName,this.currentID);

        // updating node editor and the model.

        this._model.active.setType(this.currentID, type);
        var directives = this._PM.typeAction(this.currentID, type);
        array.forEach(directives, function(directive){
	    console.log("*********** update node editor ", directive); 
	    this.updateModelStatus(directive);
	    var w = registry.byId(this.widgetMap[directive.id]);
	    w.set(directive.attribute, directive.value);
        }, this);

	},

    handleUnits: function(unit){
      console.log("*******Student has chosen unit", unit, this);
        this._model.active.setUnits(this.currentID, unit);

        var directives = this._PM.unitsAction(this.currentID, unit);
        array.forEach(directives, function(directive){
            var w = registry.byId(this.controlMap[directive.id]);
            w.set(directive.attribute, directive.value);
        }, this);
    },
	handleNodeEditorButtonClicks: function(buttonId){
	    console.log('****** combo box select ', buttonId);
	},

        convertBackEquation:function(mEquation){
            console.log("Got mEquation   "+mEquation);
            //get variables using map and currentID
            var expr = this.mapVariableNodeNames[this.currentID];
            array.forEach(expr.variables(),function(nodeName){
		var variable = this.mapVariableNodeNames[nodeName];
		expr.substitute(nodeName, variable);
		console.log("            result: ", expr);
            },this);
            return expr.toString();
	},

	convertEquation: function(equation){
            var expr = parser.parse(equation);
            this.mapVariableNodeNames = {};
	    console.log("            parse: ", expr);
            array.forEach(expr.variables(), function(variable){
		var nodeName = this._model.student.getName(variable);
		console.log("=========== substituting ", variable, " -> ", nodeName);
		//for getting original equation back
		this.mapVariableNodeNames[nodeName]=variable;
		expr.substitute(variable, nodeName);
		console.log("            result: ", expr);
            },this);
            //also push new expr to map against currentID
            this.mapVariableNodeNames[this.currentID]=expr;
            return expr.toString();
	},
	
	//show node editor
       showNodeEditor: function(/*string*/ id){
           console.log("showNodeEditor called for node ", id);
	   this.currentID = id; //moved using inside populateNodeEditorFields
	   this.disableHandlers = true; 
	   this.populateNodeEditorFields(id);
	   this._nodeEditor.show().then(
	       lang.hitch(this, function(){
		   this.disableHandlers = false; 
	       })
	   );
       },
		
	populateNodeEditorFields : function(nodeid){
	    //populate description
	    var model = this._model;
	    var editor = this._nodeEditor;
	    //set task name
            var nodeName = model.student.getName(nodeid) || "New quantity";
	    editor.set('title', nodeName);
	    
	    /* 
	     Settings for a new node, as suppied by the PM.
	     These don't need to be recorded in the model, since they
	     are applied each time the node editor is opened.
	     */
	    
	    array.forEach(this._PM.newAction(), function(directive){
		var w = registry.byId(this.controlMap[directive.id]);
		w.set(directive.attribute, directive.value);
	    }, this);
		

	    /* 
	     Set values and choices based on student model
	     
	     Set selection for description, type, units, inputs (multiple selections)
	     
	     Set value for initial value, equation (input), 
	     */

	    // This sets the selected value in the description.
	    var desc =  model.student.getDescriptionID(nodeid);
            console.log('description is', desc || "not set");
	    registry.byId(this.controlMap.description).set('value', desc || 'defaultSelect');

            var type = model.student.getType(nodeid);
            console.log('node type is', type || "not set");
            if(type)registry.byId(this.controlMap.type).set('value', type || 'defaultSelect');
	    
            var initial = model.student.getInitial(nodeid);
            console.log('initial value is', initial || "not set");
            registry.byId(this.controlMap.initial).attr('value', initial || '');
	    
            var unit = model.student.getEachNodeUnitbyID(nodeid);
            console.log('unit is', unit[nodeid] || "not set");
            registry.byId(this.controlMap.units).set('value', unit[nodeid] || 'defaultSelect');
	    
            var equation = model.student.getEquation(nodeid);
            console.log("equation before conversion ", equation);
            var mEquation = equation?this.convertEquation(equation):'';
            console.log("equation after conversion ", mEquation);
            registry.byId(this.controlMap.equation).set('value', mEquation);
	    
        //testing
        if(mEquation || equation){
        //get original equation back
        console.log('=================== getting orignal equation back'+this.convertBackEquation(mEquation));
        }
	    /*
	     The PM sets enabled/disabled and color for the controls
	     
	     Set enabled/disabled for input, units, initial value, type
	     description
	     
	     Color for Description, type, initial value, units, input, 
             and equation.

	     Note that if equation is disabled then 
	     input, +, -, *, /, undo, and done should also be disabled.
	     */
	    console.log("model: ", this._model.model.task);

	    /*
	     We will need a similar handler for each call 
	     to the PM.  However, in that case, the model also
	     needs updating.
	     */
	    array.forEach(model.student.getStatusDirectives(nodeid), function(directive){
		var w = registry.byId(this.controlMap[directive.id]);
		w.set(directive.attribute, directive.value);
	    }, this);
	    
	}
	
    });	
});
