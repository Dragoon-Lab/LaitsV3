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

define([
	'dojo/_base/array',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/dom',
	'dojo/dom-class',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/keys', 
	'dojo/on',
	'dojo/io-query',
	'dojo/ready',
	'dijit/popup', 
	'dijit/registry', 
	'dijit/TooltipDialog',
	'./equation', 
	'./graph-objects',
	'./typechecker',
	'./forum',
	'./schemas-student'
], function(array, declare, lang, aspect, dom, domClass, domConstruct, domStyle, keys, on, ioquery, ready, popup, registry, TooltipDialog, expression, graphObjects, typechecker, forum, schemasStudent){
	// Summary: 
	//			Module to connect to LRS and send statement data
	// Description:
	//			Handles all the operations to be performed on the Learning Record Store(LRS)
	//			

	return declare(null, {

		constructor: function(givenModel, assessment, session, topicIndex){
			this._model = givenModel;
			this._assessment = assessment;
			this._session = session;
			this.needsToSendScore = true;
		},

		connect: function() {
			//Connect to the Learning Record Store
			this.tincan = new TinCan ({
			    	recordStores: [
			            {
			                endpoint:"https://pal3.ict.usc.edu/php/SubmitResourceScore.php",
			                username: "0ed3c15d57b33439145ed2684c1ba09b48a33410",
			                password: "feb46eec5cdedce5553550318ff93ea9b48ea69a",
			                allowFail: false
			            }
			        ]
			});
		},


		getStatements : function(){
			//get statements from learning record store
			this.tincan.getStatements({
		        callback: function (err, result) {
		            if (err !== null) {
		                // handle error
		                return;
		            }
		            console.log(result);
		        }
		    });
		},

		sendStatements : function(){
			//send statement to learning record store.
			var baseURL = 'http://pal3.ict.usc.edu/lrs/';
			var api_key = "feb46eec5cdedce5553550318ff93ea9b48ea69a";
			var statement = {};
			var successFactor = this._assessment.getSuccessFactor();
			var schemaSuccessFactor = this._assessment.getSchemaSuccessFactor();
			var username = this._session.params.u;
			var email = username;
			var context = this;
			var topic = this._session.params.topic || "No Topic";

			if (username.indexOf("..") > 0){
				email = username.split("..")[0];
			}

			statement.actor = {
					        "objectType": "Agent",
					        "name": "test user",
					        "mbox": "mailto:" + email
				    	};
			statement.verb = {
					        "id": baseURL + "verbs/" + "Completed.html",
					        "display": {
					            "en-US": "Completed"
					        }
				    	};
			
			statement['object'] = {
							"objectType": "Activity",
							"id" : baseURL+ "activities/"+ this.getResourceName(),
					        "definition": {
					            "name": { "en-US": this.getResourceName() }
					        }
						  };			
			
			//Create a new Statement for every schema associated with the problem 
			var schemas = this._model.active.getSchemas();
			var debugReport = "Overall success factor: "+successFactor+"\n";
			var debugScoreSum = 0;
			array.forEach(schemas, lang.hitch(this, function(schema){ 
				debugReport += "Success factor for "+ schema.schemaClass+": "+schemaSuccessFactor[schema.schemaClass]+"\n";
				debugScoreSum += schemaSuccessFactor[schema.schemaClass];
				statement.context = {
						"contextActivities": {
				           "category": [{
				                "objectType": "Activity",
				                "id": baseURL + "activities/" + schema.name ,
				                "definition": {
				                    "name": {
				                        "en-US": schema.name
				                    }
				                }
				            }],
				            "grouping": [{
				                "objectType": "Activity",
				                "id": baseURL + "activities/" + topic,
				                "definition": {
				                    "name": {
				                        "en-US": topic
				                    }
				                }
				            }]			            	
				        },
				    	"revision" : this._session.params.rid
				    };
				statement.result =  {
			        "completion": this._model.matchesGivenSolution(),
			        "success": this._model.student.matchesGivenSolutionAndCorrect(),
			        "duration": this.isoDuration(this._session.calculateDuration()),
			        "score": {
			            "scaled": schemaSuccessFactor[schema.schemaClass]
			        },
			        "extensions":{
						"http://pal3.ict.usc.edu/lrs/extensions/passive": false,
						"http://pal3.ict.usc.edu/lrs/extensions/exploreLevel": "0.9",
						"http://pal3.ict.usc.edu/lrs/extensions/successFactor": String(successFactor),
						"http://pal3.ict.usc.edu/lrs/extensions/xp": "20"
			        }
		    	};
				var stmt = new TinCan.Statement({
					actor : statement.actor,
					verb : statement.verb,
					object: statement.object,
					result: statement.result,
					context : statement.context
				},false);

				//Add object and remove target from Statement
				stmt.object = stmt.target;
				delete stmt.target;
				console.log("Sending Statement: ", stmt);

				//Send statement to LRS
				dojo.xhrPost({
					url:'https://pal3.ict.usc.edu/php/SubmitResourceScore.php',
					postData:"json="+ JSON.stringify(stmt) + "&api_key="+ api_key,
					handleAs:'text',
					sync:true,
					load: function(response){
						console.log(response);
						context.needsToSendScore = false;
					},
					error: function(err){
						console.log(err);
					}
				});
			}));
			debugReport += "PAL3 score should be: " + (debugScoreSum / ( schemas.length || 1 ));
			console.log(debugReport);
			debugger;
		},

		isoDuration: function(milliseconds) {
   			var d = new Date(milliseconds);
   			return 'P' + 'T' + d.getUTCHours() + 'H' + d.getUTCMinutes() + 'M' + d.getUTCSeconds() +'S';
		},

		getResourceName: function(){
			var problemName = this._session.params.p;
			switch(problemName){
				case "resistor-capacitor-intro":
					if(this._session.params.a == "executionDemo"){
						return "Dragoon Introduction Part 1";
					} else if (this._session.params.a == "execution") {
						return "Dragoon Introduction Part 2";
					} else {
						return "Dragoon Introduction Part 3";
					}
				case "resistor-inductor-intro":
					return "Dragoon Introduction Part 4";
				default:
					if (this._session.params.a == "waveform"){
						return this.replacePrefix(this._model.getTaskName(),"Identify Waveforms of");
					} else if (this._session.params.a == "incremental"){
						return this.replacePrefix(this._model.getTaskName(),"Incremental Analysis of");
					} else {
						return this._model.getTaskName();
					}
			}
		},

		replacePrefix: function(oldTitle,newPrefix){
			//PAL3 problem titles begin with "Model a/an.."" so we replace the first word.
			return oldTitle.replace("Model",newPrefix);
		}

	});
});
