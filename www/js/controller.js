/* global define */
/*
 *                               Controller for Node Editor
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang", 
    'dojo/aspect', 'dojo/dom', 'dojo/on', "dojo/ready", 'dijit/registry',
    "./pedagogical_module","parser/parser"
], function(array, declare, lang, aspect, dom, on, ready, registry, PM, parser) {
    
    return declare(null, {
	
	_model: {},
        _PM: {},
	_nodeEditor: null, // node-editor object- will be used for populating fields
	
	constructor: function(mode, subMode, model){
	    this._model = model;
	    this._PM = new PM(mode, subMode, model);
	    
	    // The Node Editor widget must be set up before modifications
            // It might be a better idea to only  call the controller
	    // after widgets are set up.
  	    ready(this, this._setUpNodeEditor);
	},

	 controlMap: {
	     description: "selectDescription",
	     type: "typeId",
	     initial: "initialValue",
	     units: "selectUnits",
	     inputs: "nodeInputs",
	     equation: "equationBox"
	 },
        
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
		// BvdS:  I chose bgColor because it was easy to do
		// Might instead/also change text color?  
		this.domNode.bgColor = value?colorMap[value]:'';
	    };
	    for(var control in this.controlMap){
		var w = registry.byId(this.controlMap[control]);
		w._setStatusAttr = setStatus;
	    }	    
	    
	    // Add fields to units box, using units in model node
            // In author mode, this needs to be turned into a text box.
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
	    for(var control in this.controlMap){
		var w = registry.byId(this.controlMap[control]);
		w.set("disabled", false);  // enable everything
		w.set("status", '');  // remove colors
	    }
	},

	//set up event handling with UI components
	initHandles:function(){
	    // Summary: Set up Node Editor Handlers
	  
	    // BvdS:  do we want dom.byId or registry.byId here?
	    // Look for examples in Dojo documentation
	    var done = dom.byId("doneNodeEditor");
	    var plus = dom.byId("plus");
	    var type = registry.byId("typeId");
	    var desc = registry.byId("selectDescription");

	    // attach callbacks to each field in node Editor.

	    // BvdS:  I couldn't get this to work with "on"
	    // may need to use dojo/hitch here?
	    //aspect.after(type, 'onChange', this.handleType, true);
            //OR, following on works
            on(type,'Change',this.handleType);
	    
	    //aspect.after(desc, 'onChange', lang.hitch(this,function(x){
		//console.log("Hi------------", x, this.currentID);
	    //}, true));
	    on(done, 'click',  function(){
		console.log("handler for done");
	    });
        //aspect.after(desc, 'onChange', this.handleDescription, true);
        on(desc, 'Change', lang.hitch(this, this.handleDescription));
        console.log("testing the description widget",desc);
            on(plus, 'click', function(){
		console.log("handler for plus");
	    });  
	},
	    
	handleType: function(type){
	    console.log("Student has chosen type ", type, this);
	    // Need to call PM, and handle reply from PM,
	    // updating node editor and the model.
	},

	handleNodeEditorButtonClicks: function(buttonId){
	    console.log('testing combo box select ', buttonId);
	},

	handleDescription: function(selectDescription){
            console.log("testing ", selectDescription , this.currentID);
            this._model.active.setDescriptionID(this.currentID, selectDescription);
            var directives = this._PM.descriptionAction(this.currentID, selectDescription);
	    array.forEach(directives , function(desc){
		// Some directives require that the model is
		// also updated.
		var w = registry.byId(this.controlMap[desc.id]);
		w.set(desc.attribute, desc.value);
            }, this);
	    
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
	   this.populateNodeEditorFields(id);
	   this._nodeEditor.show();
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
	    registry.byId(this.controlMap.description).set('value', desc || '');

            var type = model.student.getType(nodeid);
            console.log('node type is ', type || "not set");
            registry.byId(this.controlMap.type).set('value', type || '');
	    
            var initial = model.student.getInitial(nodeid);
            console.log('initial value is ', initial || "not set");
            registry.byId(this.controlMap.initial).attr('value', initial || "0.0");
	    
            var unit = model.student.getEachNodeUnitbyID(nodeid);
            console.log('unit is ', unit[nodeid] || "not set");
            registry.byId(this.controlMap.units).set('value', unit[nodeid] || '');
	    
            var equation = model.student.getEquation(nodeid);
            console.log("equation before conversion ", equation);
            var mEquation = equation?this.convertEquation(equation):'';
            console.log("equation after conversion ", mEquation);
            registry.byId(this.controlMap.equation).set('value', mEquation);
	    
        //testing
        if(mEquation || equation){
        //get orignal equation back
        console.log('=============================getting orignal equation back'+this.convertBackEquation(mEquation));
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
