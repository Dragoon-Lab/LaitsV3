/* global define */
/*
 *                          Author mode specific stuff
 */
define([
    "dojo/dom",
    "dojo/on"
], function(dom, on) {

    // This is mainly to keep from cluttering up main.js too much
    // There is no reason to bother with instantiation...
    
    return {
	setup: function(/*object*/ menu, /*object*/ model){
	    
	    /* add "Extra Node" button */
	    on(dom.byId("authorExtraNode"), "click", function(){
		console.warn("Author mode:  open extra quantity dialog box");
		// var id = model.addExtraDescription() should have name, text, and type defined
		// Extra quantities should be shown on canvas, so they can be 
		// modified/deleted.
	    });

	    /* add "Description" button */
	    on(dom.byId("authorDescription"), "click", function(){
		console.warn("Author mode:  open description dialog box");
		// model.setTaskDescription( ...);
		// In author mode, description should be clickable on canvas
	    });

	    /* add "Time" button */
	    on(dom.byId("authorTimes"), "click", function(){
		console.warn("Author mode:  open times dialog box");
		// model.setStartTime( );
		// model.setEndTime( );
		// model.setTimeStep( );
	    });

	    /*
	     Connect handlers for each of the dialog boxes here
	     */

	}

	/*
	 Add handlers for each of the dialog boxes here
	 */

	
    };	
});
