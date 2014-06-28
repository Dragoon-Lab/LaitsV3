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

/**
 * 
 * Test file to load and save Dragoon problems
 * @author: Brandon Strong
 * 
 **/

define([
	"dojo/_base/declare", "dojo/request/xhr", "dojo/_base/json",
	"dojo/_base/lang"
], function(declare, xhr, json, lang){
	// Summary: 
	//			Loads and saves sessions and sets up logging
	// Description:
	//			Manage sessions and communicate with the server, including 
	//			logging
	// Tags:
	//			save session, logging

		// FNV-1a for string, 32 bit version, returning hex.
	var FNV1aHash = function(x){
		var hash = 0x811c9dc5; // 2166136261
		for(var i = 0; i < x.length; i++){
		hash ^= x.charCodeAt(i);
		hash *= 0x01000193; // 16777619
		}
		hash &= hash; // restrict to lower 32 bits.
		// javascript doesn't handle negatives correctly
		// when converting to hex.
		if(hash<0){
		hash = 0xffffffff + hash + 1;
		}
		return Number(hash).toString(16);
	};

	return declare(null, {

	// The constructor creates a session and sets the sessionId
		// It also sets the path.
		constructor: function(/*object*/ params, /*string*/ path){
		// Dragoon database requires that clientID be 50 characters.
			this.sessionId = FNV1aHash(params.u+"_"+params.s) +
		'_' + new Date().getTime();
		console.log("New sessionId = ", this.sessionId);
		this._startTime = (new Date()).getTime();
		this.path = path || "";
		// Create a session
		this.log("start-session", params);
		},

		loadProblem: function(/*object*/ params){
			//Summary: calls task_fetcher.php to retrieve a problem object
			//		and returns it as a Dojo promise
			console.log("loadProblem called with ", params);
			return xhr.get(this.path + "task_fetcher.php", {
				query: params,
				handleAs: "json"
			}).then(function(model_object){	 // this makes loadProblem blocking?
		console.log("loadFromDB worked", model_object);
				return model_object;
			}, function(err){
				this.clientLog("error", {
					message: "load from DB error : "+err,
					functionTag: 'loadProblem'
				});
			});
		},

		saveProblem: function(model, shareBit){
			// Summary: saves the string held in this.saveData in the database.
            var object = {
                sg: json.toJson(model),
                x: this.sessionId
            }
            console.log("mirror mirror on the wall what is the shareBit that went to all : "+ shareBit);
            if(shareBit) {
                object = lang.mixin(object, {
                    share: shareBit
                });
            }
			xhr.post(this.path + "save_solution.php", {
                data: object
            }).then(function(reply){  // this makes saveProblem blocking?
			console.log("saveProblem worked: ", reply);
			}, function(err){
				this.clientLog("error", {
					message: "save Problem error : "+err,
					functionTag: 'saveProblem'
				});
			});
		},

	getTime: function(){
		// Returns time in seconds since start of session.
		return	((new Date()).getTime() - this._startTime)/1000.0;
	},

	log: function(method, params){
		// Add time to log message (allowing override).
		var p = lang.mixin({time: this.getTime()}, params);
		
		return xhr.post(this.path + "logger.php", {
		data: {
			method: method,
			message: json.toJson(p),
					x: this.sessionId
				}
			}).then(function(reply){
		console.log("---------- logging " + method + ': ', p, " OK, reply: ", reply);
		}, function(err){
		console.error("---------- logging " + method + ': ', p, " error: ", err);
		console.error("This should be sent to apache logs");
		});
	},

	clientLog: function(/* string */ type, /* json */ opts){
		// Summary:	 this handles all client messages and prints to
		//		console for the appropriate types.
		lang.mixin(opts, {"type": type});
		switch(type){
		case 'error':
		case 'assert':
		console.error(opts.message);
		break;
		case "warning":
		console.warn(opts.message);
		break;
		}
		this.log('client-message', opts);
	}
	});
});
