/*
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
	"dojo/_base/array",
	"dojo/json",
	"./schemas-load-save"
], function(declare, array, json, schemaSession){
	return declare(null, {
	
		constructor: function(/* object */ model, /* object */ session){
			this._model = model;
			this._session = new schemaSession(session);
			this.initSchema();
			this.initSchemaSession();
		},

		initSchemaSession: function(){
			array.forEach(this._schemas, function(schema){
				var sID = schema.schemaClass || schema.ID;
				this._session.logSchema(sID, schema.difficulty);
			}, this);
		},

		initSchema: function(){
			this._schemas = this._model.student.getSchemas();
			array.forEach(this._schemas, function(schema){
				var resultJSON;
				var sID = schema.schemaClass || schema.ID;
				this._session.getSchemaApplication(sID).then(function(result){
					resultJSON = result;
				});
				
				resultJSON = json.parse(resultJSON);
				if(resultJSON.competence){
					schema.competence = resultJSON.competence;
				}
			}, this);
		},

		updateSchema: function(/* object */ time, /* object */ errors){
			if(time.given == ""){
				time.given = this._model.student.getDescriptionID(time.node);
			}

			if(errors.given == ""){
				errors.given = this._model.student.getDescriptionID(errors.node);
			}
			if(errors.given){
				array.forEach(this._schemas, function(schema){
					if(schema.nodes.indexOf(errors.given) >= 0){
						schema.competence.errors += errors.errors;
						schema.competence.total += errors.total;
						//schema.competence.timeSpent += error.time
					}
				}, this);
			}

			if(time.given){
				array.forEach(this._schemas, function(schema){
					if(schema.nodes.indexOf(time.given) >= 0){
						schema.competence.timeSpent += time.difference;
					}
				}, this);
			}
		},
	
		saveSchema: function(/* string */nodeID){
			var givenID = this._model.student.getDescriptionID(nodeID);

			this._model.student.setSchemas(this._schemas);
			array.forEach(this._schemas, function(schema){
				if(schema.competence.timeSpent > 0 && givenID && schema.nodes.indexOf(givenID) >= 0){
					this._session.updateSchemaApplication(schema.schemaClass, schema.competence);
				}
			}, this);
		},
	
		dummy: function(){
			array.forEach(this._schemas, function(schema){
				var competence = 1 - (schema.competence.errors/schema.competence.total);
				schema.competence.values.dummy = competence;
			}, this);
		},

		getScore: function(type){
			var obj = {};
			array.forEach(this._schemas, function(schema){
				if(schema.competence.values[type]){
					obj[schema.name] = schema.competence.values[type];
				} else {
					obj[schema.name] = 0;
				}
			}, this);

			return obj;
		},

		getSuccessFactor: function(){
			var nodes = this._model.given.getNodes();
			var success = 0;
			var total = 0;
			array.forEach(nodes, function(node){
				var attempts = node.attemptCount;
				for(var key in attempts){
					if(attempts[key] == 1 && node.status.hasOwnProperty(key) && node.status[key] == "correct"){
						success++;
						total++;
					} else if(attempts[key] > 0 && node.status.hasOwnProperty(key)){
						total++;
					}
				}
			}, this);

			if(total != 0)
				return success/total;
			else 
				return 0;
		}
		
	});
});
