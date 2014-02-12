/*
*  Dojo Controller 0.1 
*        -  Delegate Event Call Backs 
* 	     -  Loading AMD UI 
*/
define(['dojo/_base/declare','dojo/dom','dojo/on'], function(declare,dom,on) {

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
			var nodeIds = ["population","",""]; 
	
			/*
			*	Node Editor Handles
			*/
			var done = dom.byId("doneNodeEditor");
			var plus = dom.byId("plus");
			
			//other Clickable Elements from Node Editor 
			
			//attach callbacks
			on(done, 'click', null);
			on(plus, 'click', null);
			
			var element = dom.byId(nodeIds[0]);
			on(element,'click',this.showNodeEditor);
			
	},
	
	//show node editor
	showNodeEditor : function(){
		var nodeeditor = dom.byId('nodeeditor');
		nodeeditor.show();
	}
	
});	
});
