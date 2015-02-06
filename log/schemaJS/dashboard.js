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
	"dojo/_base/declare",
	"dojo/request/xhr",
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/number"
], function(declare, xhr, json, lang, array, number){
	var allModules = [
		{
			"names": false,
			"display": "competence",
			"options": true,
			"heading": "Open learner model (Generic models)",
			"subHeading": "",
			"sessionLink": false,
			"userData": false,
			"tName": "olm"
		},
		{
			"names": true,
			"display": "competence",
			"options": true,
			"heading": "Dashboard (Generic models)",
			"subHeading": "",
			"sessionLink": false,
			"userData": true,
			"tName": "default"
		}
	];
	return declare(null, {
		objects: null,
		schemas: [],
		schemaNames: [],
		users: [],
		timeSpent: [],
		path: "",
		allSchemas: null,
		errors: [],
		errorRate: [],
		totalChecks: [],
		competence: [],
		modules: null,

		getResults: function(/*json*/ params, /* string */ path){
			path = path || this.path;

			return xhr.get(path + "schema_dashboard.php", {
				query: params,
				sync: true
			}).then(function(results){	 // this makes loadProblem blocking?
				console.log("task objects found in the logs");
				return results;
			}, function(err){
				console.error("error in dashboard_js, error message : " + err);
				throw err;
			});
		},

		getSchemas: function(path){
			path = path || this.path;
			
			return xhr.post(path + "schemas.json", {
				handleAs: "text",
				sync: true
			}).then(function(results){
				console.log("json objects for schemas found");
				return results;
			}, function(err){
				console.error("schemas json not found : ", err);
				throw err;
			});
		},

		decideModules: function(moduleName){
			for(var i in allModules){
				if(allModules[i].tName == moduleName){
					return allModules[i];
				}
			}

			return allModules[allModules.length - 1];
		},

		constructor: function(/* object */ params, /* string */ path){
			this.path = path||"";
			this.query = params;
			this.currentUser = this.query["us"];
			//this.query["u"] = "";
			this.modules = this.decideModules(this.query["t"]||"default");

			this.init();
		},

		init: function(){
			var userObjects;
			this.getResults(this.query).then(function(results){
				userObjects = results;
			});
			this.objects = json.parse(userObjects);

			this.getAllSchemas();
			this.getAllUsers();

			this.getGlobalSchemas();
			this.getSchemaNames();

			var totalUsers = this.users.length;
			var totalSchemas = this.schemas.length;
			for(var i = 0; i < totalUsers; i++){
				this.schemaName = "-";
				this.errors[i] = [];
				this.competence[i] = [];
				this.timeSpent[i] = [];
				this.errorRate[i] = [];
				this.totalChecks[i] = [];
				for(var j = 0; j < totalSchemas; j++){
					this.errors[i][j] = "-";
					this.competence[i][j] = "-";
					this.timeSpent[i][j] = "-";
					this.errorRate[i][j] = "-";
					this.totalChecks[i][j] = "-";
				}
			}

			this.getRenderingData();
		},

		getAllSchemas: function(){
			array.forEach(this.objects, function(object){
				array.forEach(object.schemas, function(schema){
					if(this.schemas.indexOf(schema.ID) < 0){
						this.schemas.push(schema.ID)
					}
				}, this);
			}, this);
		},

		getSchemaNames: function(){
			var l = this.gSchemas.length;
			var index = 0;
			array.forEach(this.schemas, function(schemaName){
				var breakOut = false;
				for(var i = 0; i < l; i++){
					for(var j in this.gSchemas[i].subClasses){
						var schema = this.gSchemas[i].subClasses[j];
						if(schema.id == schemaName){
							this.schemaNames.push(schema.name);
							var breakOut = true;
							break;
						}
					}

					if(breakOut){
						break;
					}
				}
				if(!breakOut){
					this.schemaNames.push(schemaName);
				}
			}, this);
		},

		getAllUsers: function(){
			array.forEach(this.objects, function(object){
				if(this.users.indexOf(object.user) < 0){
					this.users.push(object.user);
				}
			}, this);
		},

		getGlobalSchemas: function(){
			var gSchemas;
			this.getSchemas("../").then(function(result){
				gSchemas = result;
			});

			this.gSchemas = json.parse(gSchemas);
		},

		getRenderingData: function(){
			array.forEach(this.objects, function(userObject){
				var userIndex = this.users.indexOf(userObject.user);
				array.forEach(userObject.schemas, function(schema){
					var schemaIndex = this.schemas.indexOf(schema.ID);
					var totalError = 0;
					var userChecks = 0;
					var competence = 0;
					var totalTime = 0;
					array.forEach(schema.difficulties, function(difficulty){
						totalError += difficulty.userData.errors;
						userChecks += difficulty.userData.total;
						totalTime += difficulty.userData.timeSpent;
						competence += difficulty.competence.dummy;
					}, this);
					competence /= schema.difficulties.length;
					
					this.competence[userIndex][schemaIndex] = (number.round(competence*100))/100;
					this.errors[userIndex][schemaIndex] = totalError;
					this.totalChecks[userIndex][schemaIndex] = userChecks;
					this.errorRate[userIndex][schemaIndex] = (number.round((this.errors[userIndex][schemaIndex]/this.totalChecks[userIndex][schemaIndex])*10))/10;
					this.timeSpent[userIndex][schemaIndex] = (number.round(totalTime*10))/10;
				}, this);
			}, this);
		},

		initTable: function(){
			var table = "<table border = '1'><tr>";
			if(this.modules.names){
				table += "<th>Users \/ Schemas</th>";
			}
			array.forEach(this.schemaNames, function(name){
				table += "<th>" + name + "</th>";
			}, this);
			table += "</tr>";

			return table;
		},

		makeTable: function(){
			var table = "";
			var userIndex = 0;
			array.forEach(this.users, function(user){
				if(!this.modules.names && this.currentUser == user){
					table += "<tr class = 'light-blue'>"
				} else {
					table += "<tr>";
				}
				if(this.modules.names){
					table += "<td>"+ user + "</td>";
				}
				var schemaIndex = 0;
				array.forEach(this.schemas, function(schema){
					table += "<td>";
					table += "<span class = 'errorRate all'>"+this.errorRate[userIndex][schemaIndex]+"</span>";
					table += "<span class = 'competence all'>"+this.competence[userIndex][schemaIndex]+"</span>";
					table += "<span class = 'totalTime all'>"+this.timeSpent[userIndex][schemaIndex]+"</span>";
					table += "</td>";
					schemaIndex++;
				}, this);
				table += "</tr>";
				userIndex++;
			}, this);

			return table;
		},

		closeTable: function(){
			var table = "</table>";
			return table;
		},

		renderTable: function(){
			var table = this.initTable();
			table += this.makeTable();
			table += this.closeTable();

			return table;
		}
	});	
})
