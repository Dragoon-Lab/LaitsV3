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
		_model: null, 
		_assessment: null,

		constructor: function(givenModel, assesment){
			_model = givenModel;
			_assessment = assesment;
		},

		connect: function() {
			//Connect to the Learning Record Store
			this.tincan = new TinCan (
				{
			    	recordStores: [
			            {
			                endpoint:"http://ec2-54-68-99-213.us-west-2.compute.amazonaws.com/data/xAPI/", 
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
			var baseURL = 'https://s3-us-west-1.amazonaws.com/ictpal3/'
			var statement = {};
			var assesmentScore = _assessment.getAssessmentScore("dummy");
			var successFactor = _assessment.getSuccessFactor();
			statement.actor = {
					        "objectType": "Agent",
					        "name": "test user",
					        "mbox": "mailto:testuserICT@ict.usc.edu"
				    	};
			statement.verb = {
					        "id": baseURL + "Completed.html",
					        "display": {
					            "en-US": "Completed"
					        }
				    	};

			var taskName =  _model.getTaskName().split(" ");
			var resourceName = taskName.join("%20");
			statement['object'] = {
							"objectType": "Activity",
							"id" : baseURL + resourceName + ".html",
					        "definition": {
					            "name": { "en-us": _model.getTaskName() }
					        }
						  };

			//Create a new Statement for every schema associated with the problem 
			array.forEach(_model.given.getSchemas(), lang.hitch(this, function(schema){ 
				statement.context = {
							"contextActivities": {
				            "parent": [{
				                "objectType": "Activity",
				                "id": baseURL + schema.schemaClass + ".html",
				                "definition": {
				                    "name": {
				                        "en-US": schema.schemaClass
				                    }
				                }
				            }],
				            "grouping": [{
				                "objectType": "Activity",
				                "id": baseURL + schema.schemaClass + ".html",
				                "definition": {
				                    "name": {
				                        "en-US": schema.schemaClass
				                    }
				                }
				            }]
				        }};
				
				statement.result =  {
			        "completion": true,
			        "success": true,
			        "duration": "PT0S",
			        "score": {
			            "scaled": assesmentScore[schema.schemaClass]
			        },
			        "extensions":{
			        	 "successFactor" : successFactor
			        }
		    	};


		    	console.log("Sending Statement: ", statement);
		    	//Send statement to LRS
		    	this.tincan.sendStatement(statement);
			}));
		}
	});
});