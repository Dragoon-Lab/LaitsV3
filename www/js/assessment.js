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
	"./schemas-load-save",
	"./equation",
	"./bayesParameters"
], function(declare, array, json, schemaSession, expression, pt){
	return declare(null, {
		currentScore: {},
		countCache: {},
		constructor: function(/* object */ model, /* object */ session, /* object */ activityConfig){
			this._model = model;
			this._activityConfig = activityConfig;
			this._session = new schemaSession(session);
			this.paramTable = new pt();
			this.initSchema();
			this.initSchemaSession();
			this.units = this._model.getAllUnits().length;
			this.nodeCount = this._model.solution.getNodes().length;
			this.correctCount = {};
			this.accParCount = this.getAccParCount();
		},

		getAccParCount: function(){
			var nodes = this._model.solution.getNodes();
			var count = 0;
			array.forEach(nodes, function(node){
				if(node.type != "function")
					count++;
			});
			return count;
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
				//to make bayes param backward compatible,
				//which holds knowledge value for each node property in parameter, accumulator and function
				if(!schema.competence.hasOwnProperty("bayesParams")){
					this.initBayesParams(schema);
				}
				this.schemaCache = {};
				this.schemaCache[schema.schemaClass] = schema.competence.bayesParams;

				if(!this._model.getProblemReopened())
					schema.competence.attempts += this.getSchemaAttemptCounts(schema.ID);
			}, this);
		},

		initBayesParams: function(schema){
			schema.competence.bayesParams = {};
			var nodes = schema.nodes.split(", ");
			array.forEach(nodes, function(nodeID){
				var type = this._model.given.getType(nodeID);
				if(!schema.competence.bayesParams.hasOwnProperty(type)){
					schema.competence.bayesParams[type] = {};
					schema.competence.bayesParams[type]["description"] = this.getParameter(schema.schemaClass, "init", type, nodeID, "descrption");
					schema.competence.bayesParams[type]["type"] = this.getParameter(schema.schemaClass, "init", type, nodeID, "type");
					schema.competence.bayesParams[type]["units"] = this.getParameter(schema.schemaClass, "init", type, nodeID, "units");
					if(type != "parameter")
						schema.competence.bayesParams[type]["equation"] = this.getParameter(schema.schemaClass, "init", type, nodeID, "equation");

					if(type != "function")
						schema.competence.bayesParams[type]["initial"] = this.getParameter(schema.schemaClass, "init", type, nodeID, "initial");
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
						schema.competence.correctScore += this.currentScore.hasOwnProperty(errors.given) ? 
															this.currentScore[errors.given] : 0;
						//schema.competence.timeSpent += error.time
						schema.competence.bayesParams = this.schemaCache[schema.schemaClass];
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

		bayes: function(){
			var propertyWeights = {
				description: 0,
				type: 3,
				units: 2,
				equation: 4,
				initial: 1
			};
			var nodeWeights = {
				para: 1,
				accu: 2.5,
				func: 2
			};

			array.forEach(this._schemas, function(schema){
				var nodes = schema.nodes.split(", ");
				var count = {
					para: 0,
					accu: 0,
					func: 0
				};

				var nodeTypes = [];
				array.forEach(nodes, function(nodeID, index){
					nodeTypes.push(this._model.given.getType(nodeID));
					count[nodeTypes[index].substring(0, 4)]++;
				}, this);

				var totalNodeWeight = count["para"]*nodeWeights["para"] + count["func"]*nodeWeights["func"]+ count["accu"]*nodeWeights["accu"];

				var finalValue = 0;
				array.forEach(nodes, function(nodeID, index){
					var totalPropertyWeight = propertyWeights["description"] + propertyWeights["type"];
					if(nodeTypes[index] != "parameter"){
						totalPropertyWeight += propertyWeights["equation"];
					}
					if(nodeTypes[index] != "function"){
						totalPropertyWeight += propertyWeights["initial"];
					}
					if(this._model.given.getUnits(nodeID)){
						totalPropertyWeight += propertyWeights["units"];
					}

					var values = schema.competence.bayesParams[nodeTypes[index]];
					var nodeEffect = 0;
					for(var key in propertyWeights){
						if(values.hasOwnProperty(key))
							nodeEffect += values[key]*propertyWeights[key]/totalPropertyWeight;
					}

					finalValue += nodeWeights[nodeTypes[index].substring(0, 4)]*nodeEffect/totalNodeWeight;
				}, this);

				schema.competence.values.bayes = finalValue;
			}, this);
		},

		bayesParamUpdate: function(id, nodePart, isCorrect){
			var givenID = this._model.active.getGivenID(id);
			if(givenID){
				var nodeStatus = this._model.given.getStatus(givenID, nodePart);
				var type = this._model.given.getType(givenID);
				if(this._model.given.getAttemptCount(givenID, nodePart) == 1){
					var schemaIDs = this._model.given.getSchemasForNode(givenID);
					var nodeSchemas = [];
					array.forEach(schemaIDs, function(ID){
						nodeSchemas.push(this._model.given.getSchema(ID).schemaClass);
					}, this);

					var ckParams = this.getCurrentKnowledge(nodeSchemas, givenID, nodePart);
					var guessParams = this.getParameters(nodeSchemas,"guess", givenID, nodePart);
					var slipParams = this.getParameters(nodeSchemas, "slip", givenID, nodePart, isCorrect);
					var learnParams = this.getParameters(nodeSchemas, "learn", givenID, nodePart);
					var knowledge = 1;
					array.forEach(nodeSchemas, function(ID, counter){
						knowledge = knowledge*ckParams[counter];
					});

					var updateValue = [];
					array.forEach(nodeSchemas, function(ID, counter){
						if(nodeStatus == "correct"){
							updateValue[counter] = (knowledge*(1 - slipParams[counter]) + ckParams[counter]*(1 - (knowledge/ckParams[counter])*guessParams[counter])) / (knowledge*(1-slipParams[counter]) + (1 - knowledge)*guessParams[counter]);
						} else {
							updateValue[counter] = (knowledge*slipParams[counter] + ckParams[counter]*(1 - (knowledge/ckParams[counter])*(1 - guessParams[counter]))) / (knowledge*slipParams[counter] + (1 - knowledge)*(1 - guessParams[counter]));
						}

						updateValue[counter] = learnParams[counter] * (1 - updateValue[counter]) + updateValue[counter];
					});

					array.forEach(nodeSchemas, function(ID, counter){
						this.schemaCache[ID][type][nodePart] = updateValue[counter];
					}, this);
				}
			}
		},

		getCurrentKnowledge: function(schemaIDs, givenID, nodePart){
			//make a cache here with all the schema values and pick from there
			var type = this._model.given.getType(givenID);
			var ck = [];
			array.forEach(schemaIDs, function(ID){
				ck.push(this.schemaCache[ID][type][nodePart]);
			}, this);

			return ck;
		},

		getParameters: function(schemaIDs, paramType, givenID, nodePart, isCorrect){
			var values = [];

			array.forEach(schemaIDs, function(ID){
				//var type = this._model.given.getType(id);
				values.push(this.getParameter(ID, paramType, givenID, nodePart, isCorrect));
			}, this);

			return values;
		},

		getParameter: function(schemaID, paramType, givenID, nodePart, isCorrect){
			var value = this.paramTable.get(schemaID, paramType, type, nodePart);
			var type = this._model.given.getType(givenID);
			if(typeof value != "object" && value < 0){
				switch(paramType){
					case "slip":
						value = this.calculateSlip(givenID, isCorrect);
						break;
					case "guess":
						value = this.calculateGuess(givenID, nodePart);
						break;
					case "init":
						value = this.calculateInit();
						break;
					case "learn":
						value = this.calculateLearn();
						break;
					default:
						value = 0.1;
				}
			} else if(typeof value == "object") {
				value = this.calculateLogistic(value, this.getIndicatorVariables(nodePart));
			}

			return value;
		},

		calculateLogistic: function(/* array */ value, /* array */ indicatorVariables){
			var sum = 0;
			array.forEach(value, function(val, counter){
				sum += (val*indicatorVariables[counter]);
			});

			return Math.log(1/1+Math.E^(-sum));
		},

		getIndicatorVariables: function(value, nodePart){
			var propertyIndex = ["description", "type", "initial", "units", "equation"];

			var iv = new Array(value.length).fill(0);
			iv[propertyIndex.indexOf(nodePart)] = 1;

			return iv;
		},

		calculateGuess: function(givenID, nodePart){
			var value;
			switch(nodePart){
				case "type":
					value = 1/3;
					break;
				case "initial":
					value = 1/(this.accParCount);
					break;
				case "units":
					value = 1/this.units;
					break;
				case "equation":
					var equation = this._model.given.getEquation(givenID);
					var parse;
					try {
						parse = expression.parse(equation);
					} catch(e) {
						console.log("error in given equation for id " + givenID);
						break;
					}
					value = 1;
					var basicOperators = ["+", "-", "*", "/"];
					if(parse){
						var n = parse.variables().length;
						value *= (n/this.nodeCount);
						var operators = parse.operators();
						if(operators){
							var flag = false;
							var count = 0
							for(var key in operators){
								if(basicOperators.indexOf(key) >= 0)
									count++;
								else if(key == -1)
									flag = true;
							}

							if(flag){
								value *= 1/29;
							} else if (count > 0){
								value *= (1/4)^count;
							}
						}
					}
					break;
				default:
					return 0.2;
			}
			
			return value;
		},

		calculateSlip: function(schema, isCorrect){
			var base = 0.05;
			var increment = 0.002;
			if(!this.correctCount.hasOwnProperty(schema)){
				this.correctCount[schema] = 0;
			}
			if(isCorrect){
				this.correctCount[schema]++;
			}

			var value = this.correctCount[schema]*increment + base;

			return (value > 0.1) ? 0.1 : value;
		},

		calculateLearn: function(){
			return 0.1;
		},

		calculateInit: function(){
			return 0.1;
		},

		updateCorrectCount: function(schema, isCorrect){
			if(!this.correctCount.hasOwnProperty(schema)){
				this.correctCount[schema] = 0;
			}

			if(isCorrect == "correct"){
				this.correctCount[schema]++;
			} else {
				this.correctCount[schema]--;
			}
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
