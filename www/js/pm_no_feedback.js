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
 * Pedagogical Module class used to solve Dragoon problems
 * @author: Brandon Strong
 **/

/* global define */

define([
	"dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "./equation", "./pedagogical_module"
], function(array, declare, lang, check, pedagogical_module){
	// Summary: 
	//			Subclass of pedagogical module processes student selections and returns instructions to the 
	//			program in TEST and EDITOR mode
	// Description:
	//			A pedagogical module that accepts student entries, and returns 
	//			an object with the ID of the node and the status of the attempt (correct, incorrect).
	//			No feedback or hints are provided for editor mode
	// Tags:
	//			pedagogical module (PM), test mode , editor mode

	

	var descriptionTable = {
		optimal: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				disable(obj, "type", false);
			}
		},
		notTopLevel: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){				
				disable(obj, "type", false);
			}
		},
		premature: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "type", false);
			}
		},
		initialValue: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "type", false);
			}
		},
		extra: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, part, false);
			}
		},
		irrelevant: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "type", false);
			}
		},
		redundant: {
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "type", false);
			}
		},
		lastFailure: {			
			TEST: function(obj, part){
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "type", false);
			}
		}
	};

	var actionTable = {
		correct: {			
			TEST: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "enableRemaining", false);
			}
		},
		incorrect: {
			TEST: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){			
				disable(obj, "enableRemaining", false);
			}
		}
	};

	//Declare variable for accessing state.js module
	var record = null;

	/*****
	 * Summary: The following four functions are used by the above tables to push 
	 *		statuses and messages to the return object array.
	 *****/
	function state(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
		obj.push({id: nodePart, attribute: "status", value: status});
		if(status==="premature"){
			obj.push({id: nodePart, attribute: "value", value: ""});
		}
	}
	
	function message(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
		var hintSequence = hints[status];
		if(record.getLocal(status) < hintSequence.length){
			var counter = record.getLocal(status);
			obj.push({id: "crisisAlert", attribute: "open", value: hintSequence[counter]});
		};
		record.increment(status, 1);
		if(status === "extra" || status === "irrelevant"){
			status = "incorrect";
		}else if(status === "lastFailure" || status === "lastFailure2"){
			status = "incorrect. The correct answer has been given";
		}
		obj.push({id: "message", attribute: "append", value: "The value entered for the " + nodePart + " is " + status + "."});
	}

	function disable(/*object*/ obj, /*string*/ nodePart, /*boolean*/ disable){
		obj.push({id: nodePart, attribute: "disabled", value: disable});
	}

	/*****
	 * 
	 * Builds class that is used by controller to check student answers
	 * 
	 *****/
	return declare(pedagogical_module, {
		constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model){
			this.model = model;
			this.mode = mode;
			this.setUserType(subMode);
		},
		matchingID: null,
		logging: null,
		descriptionCounter: 0,
	
		/*****
		 * Private Functions
		 *****/
		_enableNext: function(/*object*/ obj, /*string*/ givenNodeID, /*string*/ currentPart, /*string*/ job){
			// Summary: adds messages to return object to enable specified parts of 
			//		the node
			//
			// Tags: Private
			var nodeType =  this.model.student.getType(this.model.student.getNodeIDFor(givenNodeID));	//Get node type selected by the user		
			var newPart = "equation";

			switch(currentPart){
			case "type":
				if(nodeType === "parameter"){
					disable(obj, "initial", false);				    
					disable(obj, "equation", true);
					newPart = "initial";
				}else if(nodeType === "accumulator"){
					disable(obj, "initial", false);
					disable(obj, "equation", false);
						newPart = "units";
				}else if(nodeType === "function"){
					disable(obj, "initial", true);
					disable(obj, "equation", false);
						newPart = "units";
				}else if(this.model.given.getUnits(givenNodeID)){
					disable(obj, "units", false);
						newPart = "units";
				}
				break;
			case "initial":
				if(this.model.given.getUnits(givenNodeID)){
					disable(obj, "units", false);
					newPart = "units";
				}else if(nodeType === "function" || nodeType === "accumulator"){
					disable(obj, "equation", false);
					newPart = "equation";
				}
				break;
			case "units":
				if(nodeType === "function" || nodeType === "accumulator")
					disable(obj, "equation", false);
				newPart = "equation";
				break;
			}
			if(job === "enableRemaining" && newPart !== "equation")
				this._enableNext(obj, givenNodeID, newPart, job);
			else
				return;
		},
		
		_getInterpretation: function(/*string*/ studentID, /*string*/ nodePart, /*string | object*/ answer){
			// Summary: Returns the interpretation of a given answer (correct, incorrect, etc.)
			//
			// Tags: Private
			var interpretation = null;
			var model = this.model; //needed for anonymous function in the interpret variable.

			// Retrieves the givenID for the matching given model node
			var givenID = this.model.student.getDescriptionID(studentID);

			// Anonymous function assigned to interpret--used by most parts of the switch below. 
			// Interpretation for TEST and EDITOR mode not based on failure attempts.
			var interpret = function(correctAnswer){
				if(answer === correctAnswer || correctAnswer === true){
					interpretation = "correct";
				}else{
					interpretation = "incorrect";
				}
			};

			// Take action based on the part of the node being evaluated
			switch(nodePart){
			case "description":
				this.descriptionCounter++;

				if(this.model.given.getGenus(answer)){
					array.forEach(this.model.given.getNodes(), function(extra){
						if(answer === extra.ID && extra.genus && extra.genus != "allowed"){
							interpretation = extra.genus;
						}
					});
				}else if(this.model.isNodeVisible(studentID, answer)){
						interpretation = "redundant";
				}else if(this.model.isParentNode(answer) || this.model.isNodesParentVisible(studentID, answer)){
					interpretation = "optimal";
				}else if(this.model.student.getNodes().length === 0){
					interpretation = "notTopLevel";
				}else{
					interpretation = "premature";
				}
				
				break;
			case "type":
				interpret(this.model.given.getType(givenID));
				break;
            case "initial":
                //We check the typeof returning initial value, if it is
                //a number we check with the model else return correct
                //interpretation
				if(typeof this.model.given.getInitial(givenID) === "number"){
                    interpret(this.model.given.getInitial(givenID));
				}else{
                    interpretation = "correct";
				}
				break;
			case "units":
				interpret(this.model.given.getUnits(givenID));
				break;
			case "equation":
				interpret(check.areEquivalent(givenID, this.model, answer));
				break;
			}
			/* 
			 This is an example of logging via direct function calls
			 Note that I haven't set correct-value.	 For most controls, it should be set
			 */
			return interpretation;
		},
		
		/*****
		 * Public Functions
		 *****/
		
		processAnswer: function(/*string*/ id, /*string*/ nodePart, /*string | object*/ answer,/*string*/ answerString){
			// Summary: Pocesses a student's answers and returns if correct, 
			//		incorrect, etc. and alerts the controller about what parts 
			//		of the node editor should be active.
			//
			// Tags: Private
			
			var interpretation = this._getInterpretation(id, nodePart, answer);
			var returnObj = [], currentStatus;
			var givenID;  // ID of the correct node, if it exists
			var solutionGiven = false;

			// add the selected value to the directives
			returnObj.push({id: nodePart, attribute: "value", value: answer});
			

			// Local function that updates the status if it is not already set to "correct" or "demo"
			var updateStatus = function(returnObj, model){
				returnObj.forEach(function(i){
					if(i.attribute === "status"){
						if(i.value === "correct"){
							if(model.given.getStatus(givenID, nodePart) !== "demo")
								model.given.setStatus(givenID, nodePart, "correct");
							else{
								i.value = "demo";
								returnObj.forEach(function(j){
									if(j.id === "message"){
										j.value = hints.erasedDemo;
									}
								});
							}
						}
						else if(i.value === "demo"){
							if(model.given.getStatus(givenID, nodePart) !== "correct")
								model.given.setStatus(givenID, nodePart, "demo");
							else{
								i.value = "correct";
								returnObj.forEach(function(j){
									if(j.id === "message"){
										j.value = hints.erasedCorrect;
									}
								});
							}
						}
						else
							model.given.setStatus(givenID, nodePart, "incorrect");
					}
				});
			};

			// Process answers for description
			if(nodePart === "description"){
				if(answer){
					givenID = answer;
					descriptionTable[interpretation][this.userType](returnObj, nodePart);
					for(var i = 0; i < returnObj.length; i++)
						if(returnObj[i].value === "correct" || returnObj[i].value === "demo"){
							currentStatus = this.model.given.getStatus(givenID, nodePart); //get current status set in given model
							if(currentStatus !== "correct" && currentStatus !== "demo"){
								//
								this.model.given.setAttemptCount(answer, nodePart, this.descriptionCounter + this.model.given.getAttemptCount(answer, "description"));
								//
								if(this.model.student.getAssistanceScore(id))
									this.model.student.setAssistanceScore(id, this.descriptionCounter - 1 + this.model.student.getAssistanceScore(id));
								else
									this.model.student.setAssistanceScore(id, this.descriptionCounter - 1);
							}
							if(currentStatus === "")
								this.model.given.setStatus(givenID, nodePart, returnObj[i].value);
							else
								updateStatus(returnObj, this.model);
							this.descriptionCounter = 0;
						}
				}
				// Process answers for all other node types
			}else{
				givenID = this.model.student.getDescriptionID(id);
				currentStatus = this.model.given.getStatus(givenID, nodePart); //get current status set in given model
				console.assert(actionTable[interpretation], "processAnswer() interpretation '" + interpretation + "' not in table ", actionTable);
				actionTable[interpretation][this.userType](returnObj, nodePart);
				if(currentStatus !== "correct" && currentStatus !== "demo"){
					this.model.given.setAttemptCount(givenID, nodePart, this.model.given.getAttemptCount(givenID, nodePart) + 1);
					//
					for(var i = 0; i < returnObj.length; i++)
						if(returnObj[i].value === "incorrect" || returnObj[i].value === "demo"){
							this.model.student.incrementAssistanceScore(id);
						}
				}
				updateStatus(returnObj, this.model);

				// Activate appropriate parts of the node editor
				var lastElement = returnObj[returnObj.length - 1].id;
				if(lastElement === "enableNext" || lastElement === "enableRemaining"){
					returnObj.pop();
					this._enableNext(returnObj, givenID, nodePart, lastElement);
				}
			}
			//returnObj.push([{id: "crisisAlert", attribute: "open", value: "You should be more careful."}]);

			//logging pm response
			var logObj = null;
			var checkStatus;
			for(var i =0; i<returnObj.length; i++){
				if(returnObj[i].attribute == "status"){
					checkStatus = returnObj[i].value;
					break;
				}
			}
			if(checkStatus == "correct"){
				logObj = {
					checkResult: 'CORRECT',
				};
			}else if(checkStatus == "demo" || checkStatus == "incorrect"){
				logObj = {
					checkResult: 'INCORRECT',
					correctValue: this.model.student.getCorrectAnswer(id, nodePart),
					pmInterpretation: interpretation
				};
			}
			var logAnswer = answerString || answer.toString();
			logObj = lang.mixin({
				type : "solution-check",
				nodeID: id,
				node: this.model.student.getName(id),
				property: nodePart,
				value: logAnswer,
				solutionProvided: solutionGiven
			}, logObj);
			this.logging.log('solution-step', logObj);

			console.log("**** PM returning:\n", returnObj);
			return returnObj;
		},

	notifyCompleteness : function (model){
			if(model.matchesGivenSolution() && !model.isCompleteFlag){
		model.isCompleteFlag = true;
		record.increment("problemCompleted", 1);
		//No message displayed on completion of the model
		}
		return [];
	}
	});
});
