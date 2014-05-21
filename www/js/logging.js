/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
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

    aspect.after(controller.prototype, "initialControlSettings", function(){
        logging.session.log('client-message', {file: 'controller.js', functionName : 'initialControlSettings', message:"initialControlSettings should be overwritten."});
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
        var tempFile = filename.split('/');
        filename = tempFile[tempFile.length-1];
        logging.session.log('client-message', {message: msg, file:filename, line : lineNumber});
    }

    return logging;
});
