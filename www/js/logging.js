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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global define */

define([
	'dojo/aspect', 'dojo/on', 'dojo/_base/unload',
	"./pedagogical_module",
	"./model",
	'./controller'
], function(aspect, on, PM, model, controller){
	// Summary: 
	//			Used for logging
	// Description:
	//			In this case, we have a single global logger that we attach 
	//			to various functions in other modules.
	// Tags:
	//			logging
	// Note:	The big design question is whether we isolate logging to this 
	//			module, emphasizing aspect-oriented programming or we disperse 
	//			the logging commands through the code.	Maybe some of each and 
	//			see which looks best?

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
	logging.session.log('ui-action', {type: 'open-dialog-box', name: 'node-editor', nodeID: id, node: this._model.active.getName(id)});
	}, true);


	aspect.after(controller.prototype, "closeEditor", function(){
	logging.session.log('ui-action', {type: 'close-dialog-box', name: 'node-editor', nodeID: this.currentID, node: this._model.active.getName(this.currentID)});
	}, true);

	aspect.after(controller.prototype, "initialControlSettings", function(){
		logging.session.clientLog("error", {
			message:'initialControlSettings should be overwritten.', 
			functionTag:'initialControlSettings'
		});
	}, true);



	// This does not work for some reason.	It should call the existing
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

	window.onerror = function(msg, url, lineNumber){
		var tempFile = url.split('/');
		var filename = tempFile[tempFile.length-1];
		logging.session.clientLog("runtime-error", {
			message: msg,
			file: filename, 
			line: lineNumber
		});
	return false;
	};

	window.onfocus = function(){
		logging.session.log('window-focus', {
			type:"in-focus"
		});
	};

	window.onblur = function(){
		logging.session.log('window-focus', {
			type:"out-of-focus"
		});
	};

	var unLoad = function(){
		logging.session.log('ui-action', {
			type: "window",
			name: "close-button"
		});
	}
	dojo.addOnUnload(unLoad);
	
	return logging;
});
