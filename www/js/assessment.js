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
		countCache: {},
		constructor: function(/* object */ model, /* object */ session, /* object */ activityConfig){
			this._model = model;
			this._activityConfig = activityConfig;
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
			this.incrementAccuracyScore(descriptionID, this.calculateScore(descriptionID, nodePart));
		},

		incrementAccuracyScore: function(ID, /* number */ val){
			if(this.currentScore.hasOwnProperty(ID))
				this.currentScore[ID] += val;
			else
				this.currentScore[ID] = val;
		},

		getSchemaAttemptCounts: function(schemaID){
			var schema = this._model.given.getSchema(schemaID);
			var count = 0;
			if(schema){
				var nodes = schema.nodes.split(", ");
				array.forEach(nodes, function(ID){
					count += this.getCount(ID);
				}, this);
			}

			return count;
		},

		getCount: function(givenID){
			if(!this.countCache.hasOwnProperty(givenID)){
				var node = this._model.given.getNode(givenID);
				var properties = this._activityConfig.get("properties");
				var count = 0;
				array.forEach(properties, function(property){
					//checking if given node has a value and status is not entered while copying the node.
					if(node.hasOwnProperty(property) && (node[property] != "" && node[property] != null) &&
						(!node.status.hasOwnProperty(property) || node.status[property] != "entered")){
						if(typeof(node[property]) == "object"){
							count += node[property].length;
						} else {
							count++;
						}
					}
				});

				this.countCache[givenID] = count;
			}
			return this.countCache[givenID];
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
				if(!this._model.getProblemReopened())
					schema.competence.attempts += this.getSchemaAttemptCounts(schema.ID);
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
						schema.competence.correctScore += (this.currentScore.hasOwnProperty(errors.given) ? 
															this.currentScore[errors.given] : 0);
						//schema.competence.timeSpent += error.time
					}
				}, this);
				this.currentScore[errors.given] = 0;
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
				if(schema.competence.total > 0){
					var competence = 1 - (schema.competence.errors/schema.competence.total);
					schema.competence.values.dummy = competence;
				} else {
					schema.competence.values.dummy = 0;
				}
			}, this);
		},

		//score 2 calculates the score for the schema. new way of calculating rather than just from errors.
		accuracy: function(){
			array.forEach(this._schemas, function(schema){
				if(schema.competence.attempts > 0)
					schema.competence.values.accuracy = schema.competence.correctScore/schema.competence.attempts;
				else
					schema.competence.values.accuracy = 0;
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
					//var attempts = node.attemptCount;
					success += this.calculateNodeScore(node.ID, true);
					total += this.getCount(node.ID);
				}
			}, this);

			if(total != 0)
				return success/total;
			else
				return 0;
		},

		getSchemaSuccessFactor: function(){
			var obj = {};
			var cache = {};
			array.forEach(this._schemas, function(schema){
				var score = 0;
				var nodes = schema.nodes.split(", ");
				array.forEach(nodes, function(ID){
					if(!cache.hasOwnProperty(ID))
						cache[ID] = this.calculateNodeScore(ID, true);
					score += cache[ID];
				}, this);
				var schemaClass = schema.schemaClass;
				var total = this.getSchemaAttemptCounts(schema.ID);

				if(total > 0)
					score = score/total;
				else
					score = 0;

				obj[schemaClass] = score;
			}, this);

			return obj;
		},

		getSchemasAverageFactor: function(){
			var schemaSuccessFactor = this.getSchemaSuccessFactor();
			var scoreSum=0;
			array.forEach(this._schemas, function(schema){ 
				scoreSum += schemaSuccessFactor[schema.schemaClass];
			});
			var averageScore=scoreSum / ( this._schemas.length || 1 );
			//consol.log("The average schamas factor returned as success factor is: ", averageScore);
			return averageScore;
		},

		calculateNodeScore: function(/* string */ id, /* boolean */ ignoreExecution){
			var node = this._model.given.getNode(id);
			var attempts = node.attemptCount;
			var score = 0;

			for(var key in attempts){
				score += this.calculateScore(id, key, ignoreExecution);
			}

			return score;
		},

		calculateScore: function(/* string */ id, /* string */ nodePart, /* boolean */ ignoreExecution){
			var attempt = this._model.given.getAttemptCount(id, nodePart, ignoreExecution);
			var status = this._model.given.getStatus(id, nodePart, ignoreExecution);
			var score = 0;

			var updateScore = function(attempt){
				var score = 0;
				switch (attempt){
					case 0:
					case 1:
						score++;
						break;
					case 2:
						score += 0.5;
						break;
					default:
						break;
				}
				return score;
			};

			if(typeof(status) == "object"){
				array.forEach(status, function(s, index){
					if(s == "correct")
						score += updateScore(attempt[index]);
				});
			} else if(status && status == "correct"){
				score += updateScore(attempt);
			}

			return score;
		}
	});
});
