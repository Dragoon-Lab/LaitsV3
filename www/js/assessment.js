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
		currentScore: {},
		constructor: function(/* object */ model, /* object */ session){
			this._model = model;
			this._session = new schemaSession(session);
			this.initSchema();
			this.initSchemaSession();
		},

		initSchemaSession: function(){
			array.forEach(this._schemas, function(schema){
				this._session.logSchema(schema.schemaClass, schema.difficulty);
				
			}, this);
		},

		//score schema gives 1 if the student gets it correct in the first attempt, 0.5 after first wrong and if demo then gives 0
		updateScore: function(/* string */ nodeID, /* string */ nodePart){
			var descriptionID = this._model.student.getDescriptionID(nodeID);
			var attempt = this._model.given.getAttemptCount(descriptionID, nodePart);

			switch(attempt){
				case 0:
				case 1:
					this.incrementCorrectnessScore(descriptionID, 1);
					break;
				case 2:
					this.incrementCorrectnessScore(descriptionID, 0.5);
					break;
				default:
					break;
			}
		},

		incrementCorrectnessScore: function(ID, /* number */ val){
			if(this.currentScore.hasOwnProperty(ID))
				this.currentScore[ID] += val;
			else
				this.currentScore[ID] = val;
		},

		setCorrectnessScore: function(/* string */ ID, /* number */ val){
			var descriptionID = this._model.student.getDescriptionID(ID);
			ID = descriptionID ? descriptionID : ID;

			this.currentScore[ID] = val;
		},

		getSchemaAttemptCounts: function(){
			//this._schemas = this._model.student.getSchemas();
			array.forEach(this._schemas, function(schema){
				var nodes = schema.nodes.split(", ");
				array.forEach(nodes, function(ID){
					var type = this._model.given.getType(ID);
					var unit = this._model.given.getUnits(ID);

					schema.competence.attempts += this.getCount(type, unit);
				}, this);
			}, this);
		},

		getCount: function(type, unit){
			var count =  {
				"parameter": 4,
				"function": 4,
				"accumulator": 5
			};

			return unit ? count[type] : count[type] - 1;
		},

		initSchema: function(){
			this._schemas = this._model.student.getSchemas();
			array.forEach(this._schemas, function(schema){
				var resultJSON;
				this._session.getSchemaApplication(schema.schemaClass).then(function(result){
					resultJSON = result;
				});
				
				resultJSON = json.parse(resultJSON);
				if(resultJSON.competence){
					schema.competence = resultJSON.competence;
				}
				//to make the jsons backward compatible
				if(!schema.competence.hasOwnProperty("correctScore")){
					schema.competence.correctScore = 0;
					schema.competence.attempts = 0;
				}
			}, this);

			if(!this._model.given.getProblemReopened)
				this.getSchemaAttemptCounts();
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
						schema.competence.correctScore += this.currentScore[errors.given];
						this.currentScore[errors.given] = 0;
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

		//score 2 calculates the score for the schema. new way of calculating rather than just from errors.
		accuracy: function(){
			array.forEach(this._schemas, function(schema){
				schema.competence.values.accuracy = schema.competence.correctScore/schema.competence.attempts;
			});
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
			var total = 0; //this.totalAttempts;
			array.forEach(nodes, function(node){
				if(!node.genus || node.genus == "required" ||
					(node.genus == "allowed" && this._model.student.getNodeIDByDescriptionID(node.ID))){
					var attempts = node.attemptCount;
					total += this.getCount(node.type, node.units);
					for(var key in attempts){
						if(node.status.hasOwnProperty(key) &&  node.status[key] == "correct"){
							switch (attempts[key]){
								case 0:
								case 1:
									success++;
									break;
								case 2:
									success += 0.5;
									break;
								default:
									break;
							}
						}
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
