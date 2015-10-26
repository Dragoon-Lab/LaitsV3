/* global define */
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


/**
 *
 * Test file to load and save Dragoon problems
 * @author: Brandon Strong
 *
 **/

define([
	"dojo/_base/declare",
	"dojo/request/xhr",
	"dojo/_base/json",
	"dojo/_base/lang",
	"./message-box",
	"dojo/_base/array"
], function(declare, xhr, json, lang, messageBox,array){
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

	var sayswho = (function(){
	    var ua= navigator.userAgent, tem, 
	    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	    if(/trident/i.test(M[1])){
	        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
	        return 'IE '+(tem[1] || '');
	    }
	    if(M[1]=== 'Chrome'){
	        tem= ua.match(/\bOPR\/(\d+)/)
	        if(tem!= null) return 'Opera '+tem[1];
	    }
	    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
	    return {
			name: M[0],
			version: M[1]
		};
	});

	return declare(null, {

		// The constructor creates a session and sets the sessionId
		// It also sets the path.
		params:{},
		counter:null,

		constructor: function(/*object*/ params, /*string*/ path){
			// Dragoon database requires that clientID be 50 characters.
			this.sessionId = FNV1aHash(params.u+"_"+params.s) +
				'_' + new Date().getTime();
			this.params = params;
			this.counter = 0;
			console.log("New sessionId = ", this.sessionId);
			this._startTime = (new Date()).getTime();
			this.path = path || "";
			this.doLogging = params.l=="false" ? false : true;
			this.startTime = new Date();

			// Create a session
			this.log("start-session", params);
			this.browser = sayswho();
			console.log("browser = ", this.browser.name, " version = ", this.browser.version);
		},

		loadProblem: function(/*object*/ params){
			//Summary: calls task_fetcher.php to retrieve a problem object
			//		and returns it as a Dojo promise
			console.log("loadProblem called with ", params);
			return xhr.get(this.path + "task_fetcher.php", {
				query: params,
				handleAs: "json"
			}).then(lang.hitch(this, function(model_object){	 // this makes loadProblem blocking?
				console.log("loadFromDB worked", model_object);

				// Setting the assistant score back to zero when not in construction mode
				if(this.params.a!=="construction"){
					array.forEach(model_object.task.givenModelNodes, function (node) {
						node.attemptCount.assistanceScore=0
					});
				}
				
				return model_object;
			}), lang.hitch(this, function(err){
				this.clientLog("error", {
					message: "load from DB error : "+err,
					functionTag: 'loadProblem'
				});
				var message = "";
				if(params.m == "AUTHOR"){
					if(typeof params.g === "undefined"){
						message = "Missing published JSON.";
					}
				}
				else {
					message = "Problem Not found."
				}
				var errorMessage = new messageBox("errorMessageBox", "error", message);
				errorMessage.show();
			}));
		},


		isProblemNameConflict: function(problemName, groupName) {
			return xhr.post(this.path + "problems_conflict_checker.php", {
				data: {
					group: groupName,
					section: this.params.s,
					problem: problemName
				},
				handleAs: "json"
			}).then(lang.hitch(this, function(reply){  // this makes blocking?
				console.log("Got the conflict status ", reply);
				return reply.isConflict;
			}), lang.hitch(this, function(err){
				this.clientLog("error", {
					message: "get problem conflict status : "+err,
					functionTag: 'problemConflictChecker'
				});
			}));
		},
		saveAsProblem : function(model,problemName,groupName){
			//update params to be passed
			console.log("+++save as problem called+++");
			var newParams = dojo.clone(this.params);  //clone the object			
			newParams.p = problemName;
			newParams.g = groupName;
			//insert new session ID for newly saved as problem
			var sessionId = FNV1aHash(this.params.u+this.params.s)+'_'+new Date().getTime();
			console.log("renaming problem session id :"+sessionId);
			this.log("rename-problem",newParams,sessionId);
			model.task.taskName=newParams.p;//Update the taskName
			this.saveProblem(model,sessionId); //reuse saveProblem with new sessionId of renamed problem
			var url = document.URL.replace("p="+this.params.p.replace(" ","%20"),"p="+newParams.p);
			if (this.params.g === undefined) {
				url = url + "&g=" + newParams.g;
			} else {
				url = url.replace("g="+this.params.g,"g="+newParams.g);
			}
			window.open(url,"_self");
		},
		saveProblem: function(model,newSessionID){
			// Summary: saves the string held in this.saveData in the database.
			if(this.doLogging){
				var object = {
					sg: json.toJson(model.task),
					x: newSessionID?newSessionID:this.sessionId
				};
				if("share" in model){
					// Database Boolean
					object.share = model.share?1:0;
				}
				xhr.post(this.path + "save_solution.php", {
					data: object
				}).then(lang.hitch(this, function(reply){  // this makes saveProblem blocking?
					console.log("saveProblem worked: ", reply);
				}), lang.hitch(this, function(err){
					this.clientLog("error", {
						message: "save Problem error : "+err,
						functionTag: 'saveProblem'
					});
				}));
			}
		},

		publishProblem: function(model){
			var object = {
				sg: json.toJson(model.task),
				p: this.params.p
			};

			return xhr.post(this.path + "publish_solution.php", {
				data: object,
				sync: true
			}).then(lang.hitch(this, function(reply){
				console.log("problem published: ", reply);
				// if success or promise is resolved: return this value to next promise
				// handling server side error propogation
				if(reply === "done") return { status : "done"};
				else if(JSON.parse(reply).error) return { error : JSON.parse(reply).error };
				else return { error : "Something bad has happened! Please try again later."};
			}), lang.hitch(this, function(err){
				// handling connection/ network errors
				this.clientLog("error", {
					message: "problem not published error: "+ err,
					functionTag: "publishProblem"
				});
				// if error occurred or promise is rejected: return this value to next promise
				return { error : "Connection Error: problem could not be published at the moment"}
			}));
		},

		getTime: function(){
			// Returns time in seconds since start of session.
			return	((new Date()).getTime() - this._startTime)/1000.0;
		},
		//used to create session, in case of renaming problem use new session
		log: function(method, params, rsessionId){ //rsessionId for saving new problem
			// Add time to log message (allowing override).
			if(this.doLogging){
				var p = lang.mixin({time: this.getTime()}, params);
				
				return xhr.post(this.path + "logger.php", {
					data: {
						method: method,
						message: json.toJson(p),
						x: rsessionId?rsessionId:this.sessionId,
						id: this.counter++
					}
				}).then(lang.hitch(this, function(reply){
					console.log("---------- logging " + method + ': ', p, " OK, reply: ", reply);
				}), lang.hitch(this, function(err){
					console.error("---------- logging " + method + ': ', p, " error: ", err);
					console.error("This should be sent to apache logs");
				}));
			}
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
		},

		calculateDuration: function(){
			// Summary:	 Returns the session duration in milliseconds
			return new Date() - this.startTime;
		}
	});
});
