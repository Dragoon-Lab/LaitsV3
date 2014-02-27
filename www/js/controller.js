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
	
	constructor: function(mode, model){
	    this._model = model;
	    this._PM = new PM(mode, model);
	    
            // Test the PM 
            var r = this._PM.descriptionAction("id1");
            console.log("********** test PM description", r);
	    
	    // The Node Editor widget must be set up before modifications
            // It might be a better idea to only  call the controller
	    // after widgets are set up.
  	    ready(this, this._setUpNodeEditor);
	},
        
	_setUpNodeEditor: function(){
	    
	    // get Node Editor widget from tree
	    this._nodeEditor = registry.byId('nodeeditor');
	    
            // Initialize fields in the node editor that are
            // common to all nodes in a problem.
	    
	    // Add fields to Description box
            // In author mode, the Description input must be a text box
	    var d = registry.byId("selectDescription");
            // populate input feild
            var t = registry.byId("nodeInputs");
       	    // console.log("description widget = ", d);
	    // d.removeOption(d.getOptions()); // Delete all options
	    array.forEach(this._model.getAllDescriptions(), function(desc){
	        d.addOption(desc);
		var name = this._model.getNodeNameByID(desc.value);
		var option = {label: desc.label+' '+ ' | '+' '+ name, value:desc.value};
		t.addOption(option);
	    }, this);
	    
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
	    aspect.after(type, 'onChange', this.handleType, true);	    
	    on(done, 'click',  function(){
		console.log("handler for done");
	    });
            on(plus, 'click', function(){
		console.log("handler for plus");
	    });  
	},
	    
	handleType: function(type){
	    console.log("Student has chosen type ", type, this);
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
		
	populateNodeEditorFields : function(nodeid){
	    //populate description
	    var model = this._model;
	    var editor = this._nodeEditor;
	    //set task name
           var nodeName = model.student.getNodeNameByID(nodeid) || "New quantity";
	    editor.set('title', nodeName);
	    //populate type
	    // populate initial value
	    // populate units
	    /* 
	     Need to set the following:
	     1. selected description
	     2. whether description is enabled
	     3. selected type
	     4. whether type is enabled
             5. value for initial value
	     6. whether whether is enabled
	     7. selected units 
	     8. whether units are enabled
	     9. selected inputs (may have to do custom styling)
	     10. whether input is enabled
	     11. whether + - * / undo and done are enabled
	     12. value for input
	     13. whether input is enabled
	     14. Color for Description, type, initial value, units, and input.

	     Note that if input is disabled, then + - * / undo, and done should also be disabled.

	     This is a pretty big job, so we need to figure out how to do
	     this efficiently.
	     */
	}
	
    });	
});
