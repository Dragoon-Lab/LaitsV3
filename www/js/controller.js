/* global define */
/*
*  Dojo Controller 0.1 
*        -  Delegate Event Call Backs 
* 	     -  Loading AMD UI 
*/
define([
	 "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang", 
	 'dojo/aspect', 'dojo/dom', 'dojo/on', "dojo/ready", 'dijit/registry'
], function(array, declare, lang, aspect, dom, on, ready, registry) {

    return declare(null, {
	
	_model: {},
	_nodeEditor : {}, // node-editor object- will be used for populating
	_nodeMap: {},  // create map of Node against ids using model
		     
	constructor: function(model){
	    this._model = model;
	    // The Node Editor widget must be set up before modifications
            // It might be a better idea to only  call the controller
	    // after widgets are set up.
		this._nodeEditor = registry.byId('nodeeditor'); //get Node Editor element from tree
  	    ready(this, this._setUpNodeEditor);
	},
        
	_setUpNodeEditor: function(){

            // Initialize fields in the node editor that are
            // common to all nodes in a problem.
	    
	    // Add fields to Description box
            // In author mode, the Description input must be a text box!
	    var d = registry.byId("selectDescription");
	    // console.log("description widget = ", d);
	    // d.removeOption(d.getOptions()); // Delete all options
	    array.forEach(this._model.getAllDescriptions(), function(desc){
	        d.addOption(desc);
	    });
	  
	    // Add fields to units box, using units in model node
            // In author mode, this needs to be turned into a text box.
	    var u = registry.byId("selectUnits");
            // console.log("units widget ", u);
	    array.forEach(this._model.getAllUnits(), function(unit){
	        u.addOption({label: unit, value: unit});
	    });	    
	},
		     
	//Loading UI, Should be 
	loadUI  : function() {
	    //will be done by main.js  
	    //or
	    //put UI AMD Module  
	},

	//set up event handling with UI components
	initHandles:function(){
	    	    
	    /*
	     *	Node Editor Handles
	     */
	    var done = dom.byId("doneNodeEditor");
	    var plus = dom.byId("plus");
	    
	    //other Clickable Elements from Node Editor 
	    
	    //attach callbacks
	    on(done, 'click', null);
	    on(plus, 'click', null);
	    
	    /* 
	     Attach node editor to each node in model.
	     
	     This assumes the model is already added to the canvas.

	     It would make more sense to do for each node as it is created
             on the canvas.
	     
	     In AUTHOR mode, this will break, since we want the solution
	     graph in that case.  See trello card https://trello.com/c/TDWdq6q6
	     */
	    array.forEach(this._model.getStudentNodes(), function(node){
		var element = dom.byId(node.ID);
		console.log("wiring up node ", node.ID);

		// Need to distinguish between a simple click and 
		// a drag.	    

		// Use hitch to preserve the scope in showNodeEditor
		on(element, 'click', lang.hitch(this, this.showNodeEditor));
	    }, this);
	},

        moved: false,
	    
	//show node editor
	showNodeEditor : function(nodeEvent){
	    console.log("showNodeEditor called for ", nodeEvent.target.id);
	    console.warn("TO DO:  populate fields in node editor.");
		this.populateNodeEditorFields(nodeEvent.target.id);
	    this._nodeEditor.show();
	},
	
	populateNodeEditorFields : function(nodeid){
		//populate description
		var model = this._model;
		var editor = this._nodeEditor;
		var descriptions = model.getAllDescriptions();
		//populate units
		var units = model.getAllUnits();
		var selectUnits = dijit.byId('selectUnits');
		selectUnits.attr('units',units);
		//set task name
		var nodeName = model.getNodeNameByID(nodeid);
		editor.set('title',nodeName);
		//populate type
		//populate initial value
		//populate units
		var inputs=model.getNodeInputs(nodeid);
		var nodeInputs = dijit.byId('nodeInputs');
		nodeInputs.attr('inputs',inputs); //this is not populating combo box, find syntax
		//populate inputs	
		
	},
	createNodeMap : function(){  //node hashmap for fast retrival using id 
		
	}
	
	
    });	
});
