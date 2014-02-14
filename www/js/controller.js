/* global define */
/*
*  Dojo Controller 0.1 
*        -  Delegate Event Call Backs 
* 	     -  Loading AMD UI 
*/
define([
   "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang", 'dojo/dom', 'dojo/on', 'dijit/registry'
], function(array, declare, lang, dom, on, registry) {

    return declare(null, {

	_model: {},
	
	constructor: function(model){
	    this._model = model;
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
		// Use hitch to preserve the scope in showNodeEditor
		on(element,'click', lang.hitch(this,this.showNodeEditor));
	    }, this);
	},
	    
	//show node editor
	showNodeEditor : function(nodeEvent){
	    console.log("showNodeEditor called for ", nodeEvent.target.id, this);
	    var nodeeditor = registry.byId('nodeeditor');

	    // Add fields to node editor.
	    var d = registry.byId("selectDescription");
	    console.log("description widget = ", d);
	    d.removeOption(d.getOptions()); // Delete anything already there.
	    array.forEach(this._model.getNodes(),function(node){
		d.addOption({label: node.correctDesc, value: node.ID});
	    });
	    
	    nodeeditor.show();
	}
	
    });	
});
