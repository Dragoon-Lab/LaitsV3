/* global define */
/*
 *                               Logging facility
 */
define([
    'dojo/aspect', 'dojo/on',
    "./pedagogical_module",
    "./load-save",
    "./model",
    './controller'
], function(aspect, on, PM, loadSave, model, controller) {

    var log = {
	model: null,
	verbose: false,
	setModel: function(model){
	    this.model = model;
	},
	// Send log messages to the console.
	setVerbose: function(verbose){
	    this.verbose = verbose;
	},

	// This works, but it is ugly, since it has to be called manually for
	// each class instantiation.
	setupController: function(controller){
	    aspect.after(controller, "closeEditor", function(){
		console.log("---------- closeEditor logging 2: ", arguments, this);
	    }, true);
	}
    };

    // Can't use aspect.after now because controller has not been instantiated, yet.
    // Could move away from using 'declare' to more Javascript style classes.

    // This does not work for some reason.  It should call the existing
    // closeEditor function.  Instead, it over-writes closeEditor.
    if(false){
	controller.extend({
	    closeEditor:  function(){
		var z = this.inherited(arguments);
		console.log(">>>>>>>>> in closeEditor logging 1: ", arguments, this, z);
		return z;
	    }
	});
    }

    return log;
});
