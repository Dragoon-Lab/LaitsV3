/* global define */
/*
 *                               Controller for Node Editor
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang", 
    'dojo/aspect', 'dojo/dom', 'dojo/on', "dojo/ready", 'dijit/registry',
    "./pedagogical_module"
], function(array, declare, lang, aspect, dom, on, ready, registry, PM) {
    
    return declare(null, {
	
	_model: {},
        _PM: {},
	_nodeEditor: null, // node-editor object- will be used for populating fields
	
	constructor: function(mode, subMode, model){
	    this._model = model;
	    this._PM = new PM(mode, subMode, model);
	    
            // Test the PM 
            var rr = this._PM.descriptionAction("id4", "id1");
            console.log("********** test PM description", rr);
	    
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
	     equation: "equation"
	 },
        
	_setUpNodeEditor: function(){
	    
	    // get Node Editor widget from tree
	    this._nodeEditor = registry.byId('nodeeditor');
	    
            // Initialize fields in the node editor that are
            // common to all nodes in a problem.
	    
	    // Add fields to Description box
            // In author mode, the Description input must be a text box
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
		console.log("In widget._setStatusAttr for '" + value + 
			    "', scope ", this);
		// Chose bgColor because it was easy to do
		// Might instead change text color?  
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

	//set up event handling with UI components
	initHandles:function(){
	    // Summary: Set up Node Editor Handlers
	  
	    // BvdS:  do we want dom.byId or registry.byId here?
	    // Look for examples in Dojo documentation
	    var done = dom.byId("doneNodeEditor");
	    var plus = dom.byId("plus");
	    var type = registry.byId("typeId");
	    
	    // attach callbacks to each field in node Editor.

	    // BvdS:  I couldn't get this to work with "on"
	    // may need to use dojo/hitch here?
	    //aspect.after(type, 'onChange', this.handleType, true);
            //OR, following on works
            on(type,'Change',this.handleType);
	    on(done, 'click',  function(){
		console.log("handler for done");
	    });
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

	//show node editor
       showNodeEditor: function(/*string*/ id){
           console.log("showNodeEditor called for node ", id);
	   this.populateNodeEditorFields(id);
	   this._nodeEditor.show();
	},

	dispatch: function(/*array*/ directives){
	    array.forEach(directives, function(directive){
		console.log("========= directive ", directive);
		
	    });
	},

		
	populateNodeEditorFields : function(nodeid){
	    //populate description
	    var model = this._model;
	    var editor = this._nodeEditor;
	    //set task name
            var nodeName = model.student.getName(nodeid) || "New quantity";
	    editor.set('title', nodeName);

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

	    console.log("======== units widget ", registry.byId('selectUnits'));
	    

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
		console.log("===== update from model ", directive);
		var w = registry.byId(this.controlMap[directive.id]);
		// I have checked that this works for disable/enable
		// Still need to do other colors
		// Still need to enable/disable equation together
		// with inputs, and associated buttons.
		w.set(directive.attribute, directive.value);
	    }, this);
	    
	}
	
    });	
});
