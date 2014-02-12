/*
*  Dojo Controller 0.1 
*        -  Delegate Event Call Backs 
* 	     -  Loading AMD UI 
*/
define(['dojo/_base/declare','dojo/dom','dojo/on','dijit/registry'], function(declare,dom,on,registry) {

	return declare(null, {

	//Loading UI, Should be 
	loadUI  : function() {
		//will be done by main.js  
		//or
		//put UI AMD Module  
	},

	//set up event handling with UI components
	initHandles:function(){
	
			//fetch Node Editor Element Ids
			var nodeIds = ["population","growth","grate"]; 
	
			/*
			*	Node Editor Handles
			*/
			var done = dom.byId("doneNodeEditor");
			var plus = dom.byId("plus");
			
			//other Clickable Elements from Node Editor 
			
			//attach callbacks
			on(done, 'click', null);
			on(plus, 'click', null);
			
			for(id in nodeIds){
				var element = dom.byId(nodeIds[id]);
				on(element,'click',this.showNodeEditor);
			}
	},
	
	//show node editor
	showNodeEditor : function(){
		var nodeeditor = registry.byId('nodeeditor');
		nodeeditor.show();
	}
	
});	
});
