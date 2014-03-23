/* global define */
/*
 *                          AUTHOR mode-specific handlers
 */
define([
    'dojo/_base/declare',"dojo/_base/lang",
    'dojo/dom-style', "dojo/ready",
    'dijit/registry',
    './controller'
], function(declare, lang, style, ready, registry, controller) {

    /*
     Methods in controller specific to the student modes
     */
    
    return declare(controller, {

	constructor: function(){
	    console.log("++++++++ In student constructor");
	    ready(this, "initStudentHandles");
	},

	initStudentHandles: function(){

	}

    });
});
