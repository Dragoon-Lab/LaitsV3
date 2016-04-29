/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global define */

define([
"dojo/_base/declare",
"dojo/_base/lang",
"dojo/dom",
"dojo/dom-style",
"dojo/dom-construct",
"dojo/on",
"dojo/query"
], function(declare, lang, dom, style, domConstruct, on, query){
	// Summary: 
	//			Common message box widget
	// Description:
	//			Displays messages in a messagbox at the top of page
	//			on dragoon problems.
	// Tags:
	//			Messagebox, Error, Info, Warn, Success

	return declare(null, {
		_container: "errorMessageBox",
		_messageBox: null,
		_type: "error",
		_message: null,
		_callback: null,
		_close : true,
		
		constructor: function(/* String */ container, /* String */ type, /* String */ message, /*Boolean*/ closable){
		//	container: Id of the container 
		//	type can have following values : error, success, info, warn
			_container = container;
			_type = type;
			_message = message;
			if(closable !== undefined){
				this._close = closable;
			}
			this._initMessageBox();
		},

		_initMessageBox: function(){
			//Initialize Message Box HTML
			var nl = query(".error-message");
			var idCount = nl.length;
			//Create Outer Div
			messageOuterDiv = domConstruct.create("div", {
				"id": _container+ "message-outer-"+ idCount,
				"class":"messageBox messageBox-"+_type });
			_messageBox = messageOuterDiv;

			//Create Message Text Div
			var messageTextDiv  = domConstruct.create("div", {
				"id": _container + "-message-text-"+ idCount,
				"class":"error-message", innerHTML: _message });
			domConstruct.place(messageTextDiv, messageOuterDiv , "first");

			if(this._close) {
				//Create Error Message Div
				var errorMessageCloseDiv = domConstruct.create("div", {
					"id": _container + "-message-close-" + idCount,
					"class": "error-message-close",
					"innerHTML": "<img src='images/close.png' width='12px' height='12px'>"
				});
				domConstruct.place(errorMessageCloseDiv, messageOuterDiv);
			}

			var handler = on(messageOuterDiv, "click", function(){
			    		//Fade Out
					    dojo.style(messageOuterDiv, "opacity", "1");
					    var fadeArgs = {
					        node: messageOuterDiv,
					        onEnd: function(){
					        	style.set(_messageBox, "display", "none");
              				}
					    };
					    dojo.fadeOut(fadeArgs).play();
						if(_callback && typeof _callback == "function") _callback();
					    handler.remove();
			    	});

			//add message box to container.
			domConstruct.place(messageOuterDiv, _container, "last");
			style.set(_messageBox, "display", "none");
		},

		show: function(){
			//Show MessageBox
			style.set(_messageBox, "display", "block");
		},

		hide: function(){
			//Hide MessageBox
			style.set(_messageBox, "display", "none");
		},
		addCallback : function(fn){
			_callback = fn;	
		}
	});
});