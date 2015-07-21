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
	"dojo/_base/json"
], function(declare, xhr, json){
	return declare(null, {
		_session: null,
		_path: null,
		count: 1,

		constructor: function (/* object */ session, /* string */ path){
			this._session = session;
			this._path = path || "";
		},

		getFileData: function(/* string */ fileName, /* path */ path){
			path = path || this._path;
			return xhr.get(path + fileName, {
				handleAs: "text",
				sync: true
			}).then(function(results){
				console.log(fileName + " found, data : ");
				return results;
			}, function(err){
				console.error(fileName + " not found, error message :  " + err);
				throw err;
			});
		},
		
		sendData: function(/* object */ obj, /* object */ params, /* string */ fileName, /* string */ path){
			path = path || this._path;
			return xhr.post(path + fileName, {
				data:{
					params: params,
					object: obj
				}
			}).then(function(reply){
				console.log("data sent successfully");
			}, function(err){
				console.error("data not sent to file : "+fileName+" error message : "+err);
				throw err;
			});	
		},

		/*setSchema: function(/* object *//* schema){
			//author sets schema for a problem - gets a schema detail and sends it to php file to add to database.
			//need php file for this
			this.sendData(schema, {}, "save_schema.php", "").then(function(reply){
				console.log("schema was added to the logs);
			});
		},*/

		/*getAllSchemas: function(){
			//this gets all the schemas from a file. This object will be used for two things - 
			//to show schemas to the author window and when a new schema is added (this is will be added later)
			this.getFile("schema.json").then(function(schemas){
				this._schemas = schemas;
			});
		},*/

		addSchema: function(){
			//adds a new schema to the local schema object this will be implemented later
		},

		saveSchemas: function(){
			//saves _schemas object file to schemas.json sends the file value
			//needs php file for this
		},

		updateSchemaApplication: function(/* string */ schema, /* object */ competence){
			//sets the schema application score for a student
			//need PHP file for this to add to the database.
			if(this._session.doLogging){
				var obj = {
					schema_id: schema,
					x: this._session.sessionId,
					competence: json.toJson(competence),
					count: this.count++
				};
			
				xhr.post(this._path + "save_schema_application.php", {
					data: obj
				}).then(function(reply){
					console.log("schema values were updated successfully");
				}, function(err){
					console.error("schema value were not saved", err);
				});
			}
		},

		getSchemaApplication: function(/* string */ schemaID){
			//gets the schema application score of a student based on user name and schema ID that he is applying.
			//interacts with get_schema_application.php
			var obj = { 
				u: this._session.params.u,
				x: this._session.sessionId,
				s: schemaID,
				sec: this._session.params.s
			};

			return xhr.post(this._path + "get_schema_application.php", {
				data: obj,
				sync: true
			}).then(function(reply){
				console.log("schema value retrieved "+reply);
				return reply;
			}, function(err){
				console.error("schema value not received ", err);
				throw err;
			});
		},

		logSchema: function(/* string */ schemaID, /* object */ diff){
			if(this._session.doLogging){
				var obj = {
					x: this._session.sessionId,
					schema_id: schemaID,
					difficulty: json.toJson(diff)
				};

				return xhr.post(this._path + "save_schema_session.php", {
					data: obj
				}).then(function(reply){
					console.log("schema session saved");
					return reply
				}, function(err){
					console.error("schema session initiation failed : "+err);
					throw err;
				});
			}
		}
	});
});
