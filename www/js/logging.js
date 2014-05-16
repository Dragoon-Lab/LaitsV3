/* global define */
/*
 *                               Logging facility
 */
define([
    'dojo/aspect', 'dojo/on',
    "./pedagogical_module",
    "./model",
    './controller'
], function(aspect, on, PM, model, controller){

    /*
     In this case, we have a single global logger that we attach
     to various functions in other modules.
     */

    /* 
     The big design question is whether we isolate logging to this module,
     emphasizing aspect-oriented programming or we disperse the logging
     commands through the code.  Maybe some of each and see which looks best?
     */

    var logging = {
	session: null,
	verbose: false,
	setSession: function(session){
	    this.session = session;
	},
	// Send log messages to the console.
	setVerbose: function(verbose){
	    this.verbose = verbose;
	}

	// This works, but it is ugly, since it has to be called manually for
	// each class instantiation.
	/*
	setupController: function(controller){
	    aspect.after(controller, "closeEditor", function(){
		console.log("---------- closeEditor logging 2: ", arguments, this);
	    }, true);
	}
	 */
    };

    /* 
     Some examples where we attach logging to a function in the prototype of a class.
     Then, when the class is instantiated, the associated function has the logging attached.
     */

    aspect.after(controller.prototype, "showNodeEditor", function(id){
	logging.session.log('ui-action', {type: 'open-dialog-box', name: 'node-editor', node: id});
    }, true);


    aspect.after(controller.prototype, "closeEditor", function(){
	logging.session.log('ui-action', {type: 'close-dialog-box', name: 'node-editor', node: this.currentID});
    }, true);


    // This does not work for some reason.  It should call the existing
    // closeEditor function.  Instead, it over-writes closeEditor.
    /*
    controller.extend({
	closeEditor:  function(){
	    var z = this.inherited(arguments);
	    console.log(">>>>>>>>> in closeEditor logging 1: ", arguments, this, z);
	    return z;
	    }
    });
     */
    window.onerror = function(msg, filename, url, lineNumber){
        logging.session.log('client-message', {message: msg, file:filename, line : lineNumber});
    }

    return logging;
});