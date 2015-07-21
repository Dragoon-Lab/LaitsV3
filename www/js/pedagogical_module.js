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
	"dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "./equation", "dojo/dom"
], function(array, declare, lang, check, dom){
	// Summary: 
	//			Processes student selections and returns instructions to the 
	//			program
	// Description:
	//			A pedagogical module that accepts student entries, and returns 
	//			an object with the ID of the node, a message with encouragement 
	//			or a hint, and the status of the attempt (correct, incorrect, 
	//			demo, or premature).
	// Tags:
	//			pedagogical module (PM), student mode, coached mode

	var hints = {
		// Summary: Messages that are given to the user based on the type of user, 
		//		his or her answers, and the number of hints of that type.
		//      2014.9.24: Since the LAITS model allows for students to author, 
		//                 we've changed the hints to refer to the 'author's
		//                 answer' rather than using 'correct'/'incorrect'
		irrelevant: [
			"The quantity is irrelevant to this problem.  Choose a different one.",
			"This quantity is irrelevant for modeling the system.  Try again.",
			"Irrelevant.  Try again."
		],
		initialValue: [
			"You tried to define a parameter for the initial value of an accumulator.  This is unnecessary, because you can put the initial value for the accumulator right into the definition of the accumulator itself.",
			"That should be the initial value of an accumulator, not a parameter node.",
			"That should be the initial value of an accumulator."
		],
		extra: [
			"You tried to define a parameter for a number you read in the problem.	Not all numbers in the problem statement are necessary for the model.  You will save effort if you follow the Target Node Strategy, which says you should start by defining a node for a quantity that the problem asks you to graph, then define nodes for its inputs, and then define nodes for their inputs, etc.  That way, every node you create is an input to some node.",
			"Not every number in the problem statement is necessary for the model.	You should define a node for a quantity only when either (1) it is required as input to a previously defined node, or (2) the problem statement asks you to graph it or to model how it changes.",
			"Please be sure you need a node before defining it.	 Even if a number appears in the problem statement, it may not be needed in the model."
		],
		redundant: [
			"A node already exists for that quantity.  If you want to edit it, click on it."
		],
		premature: [
			"Although the quantity you've picked is in the author's model, you should follow the Target Node Strategy, which says you should start by defining a node for a quantity that the problem asks you to graph or focus on, then define nodes for its inputs, and then define nodes for their inputs, etc.  That way, every node you create is an input to some node.",
			"Please follow the Target Node Strategy.  That is, finish any incomplete node (triangle or dashed border) or, if there are no incomplete nodes, select a quantity the problem asks you to graph or focus on.",
			"It is too soon to work on this node.  Please follow the Target Node Strategy."
		],
		notTopLevel: [
			"Blue means that quantity isn’t one that the problem statement asks you to graph.  Although this quantity will eventually be in your model, you should follow the Target Node Strategy, which says you should first define a node for a top level goal quantity.",
			"Please start with a quantity mentioned in the problem statement as the one that needs to be graphed."
		],
		correct: [
			"Green means you chose the author's answer.  Good job!",
			"Green means you chose the author's answer."
		],
		incorrect: [
			"Your answer does not match the author's answer. Please try again.",
			"Your answer does not match the author's answer."
		],
		lastFailure: [
			"Sorry, but that quantity isn’t relevant to the model.	Moreover, this is the third failure, so the author's answer is being chosen for you.	Please study it and figure out why it is correct.  Your goal should be to match the author's model on the first attempt.",
			"Here’s the author's answer.  Please figure out why it is correct so that next time, your first selection will match the author's model.",
			"Please study the author's answer."
		],
		lastFailure2: [
			"Yellow means that you failed to match the author's answer too many times, so it is being shown to you.	You should figure out why it is correct so that next time your first choice will match the author's model.",
			"Can you figure out why is this the correct value for the node?"
		],
		erasedCorrect: [
			"Your choice did not match the author's answer so it is being given to you. However, your previous work matched the author's answer. It will continue to be marked this way."
		],
		erasedDemo: [
			"Your choice matched the author's answer, however this part was previously completed by the model. It will continue to be marked this way."
		]
	};

	var descriptionTable = {
		// Summary: This table is used for determining the proper response to a student's 'description' answer (see 
		//		'Pedagogical_Module.docx' in the documentation)
		optimal: {
			COACHED: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			feedback: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			power: function(obj, part){
				state(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			TEST: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			}
		},
		notTopLevel: {
			COACHED: function(obj, part){
				state(obj, part, "notTopLevel");
				message(obj, part, "premature");
			},
			feedback: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			power: function(obj, part){
				state(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			TEST: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			}
		},
		premature: {
			COACHED: function(obj, part){
				state(obj, part, "premature");
				message(obj, part, "premature");
			},
			feedback: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			power: function(obj, part){
				state(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			TEST: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "type", false);
			}
		},
		initialValue: {
			COACHED: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "initialValue");
			},
			feedback: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "initialValue");
			},
			power: function(obj, part){
				state(obj, part, "incorrect");
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			}
		},
		extra: {
			COACHED: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "extra");
			},
			feedback: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "extra");
			},
			power: function(obj, part){
				state(obj, part, "incorrect");
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			}
		},
		irrelevant: {
			COACHED: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "irrelevant");
			},
			feedback: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "irrelevant");
			},
			power: function(obj, part){
				state(obj, part, "incorrect");
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			}
		},
		redundant: {
			COACHED: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "redundant");
			},
			feedback: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "redundant");
			},
			power: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "redundant");
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			}
		},
		lastFailure: {
			COACHED: function(obj, part){
				state(obj, part, "demo");
				message(obj, part, "lastFailure2");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			feedback: function(obj, part){
				state(obj, part, "demo");
				message(obj, part, "lastFailure2");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			power: function(obj, part){
				state(obj, part, "demo");
				disable(obj, part, true);
				disable(obj, "type", false);
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "type", false);
			}
		}
	};

	var nodeEditorActionTable = {
		// Summary: This table is used for determining the proper response to a student's answers in the 
		//		remaining sections (see 'Pedagogical_Module.docx' in the documentation)

		//		Node Editor action table will be used for any activity that uses existing node editor.
		//		All the actions remain same, only add additional field(s) in _getInterpretation and _enableNext
		correct: {
			COACHED: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "enableNext", false);
			},
			feedback: function(obj, part){
				state(obj, part, "correct");
				message(obj, part, "correct");
				disable(obj, part, true);
				disable(obj, "enableRemaining", false);
			},
			power: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			TEST: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "correct");
				disable(obj, "enableRemaining", false);
			}
		},
		firstFailure: {
			COACHED: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "incorrect");
			},
			feedback: function(obj, part){
				state(obj, part, "incorrect");
				message(obj, part, "incorrect");
			},
			power: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			}
		},
		secondFailure: {
			COACHED: function(obj, part){
				state(obj, part, "demo");
				message(obj, part, "lastFailure2");
				disable(obj, part, true);
				disable(obj, "enableNext", false);
			},
			feedback: function(obj, part){
				state(obj, part, "demo");
				message(obj, part, "lastFailure2");
				disable(obj, part, true);
				disable(obj, "enableRemaining", false);
			},
			power: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			}
		},
		anotherFailure: {
			COACHED: function(){
				console.error("Attempting to access actionTable after demo has been sent.");
			},
			feedback: function(){
				console.error("Attempting to access actionTable after demo has been sent.");
			},
			power: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			TEST: function(obj, part){
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){
				disable(obj, "enableRemaining", false);
			}
		},
		incorrect: {
			TEST: function(obj, part){
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			},
			EDITOR: function(obj, part){	
				state(obj, part, "incorrect");
				disable(obj, "enableRemaining", false);
			}
		}
	};

	/*
	 * Add additional tables for activities that does not use node editor.
	 */
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
	return declare(null, {
		constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model, /* Activity Config*/ activityConfig){
			this.model = model;
			this.mode = mode;
			this.activityConfig = activityConfig;
			this.setUserType(subMode);
		},
		matchingID: null,
		logging: null,
		descriptionCounter: 0,
		_assessment: null,
	
		/*****
		 * Private Functions
		 *****/
		_enableNext: function(/*object*/ obj, /*string*/ givenNodeID, /*string*/ currentPart, /*string*/ job){
			// Summary: adds messages to return object to enable specified parts of 
			//		the node
			//
			// Tags: Private
			var nodeType = "";
			if(this.showCorrectAnswer){ //For Other modes get node type from given model
			  	nodeType = this.model.given.getType(givenNodeID); 
			}else{  //For EDITOR and TEST get node type from user selected answer
				nodeType = this.model.student.getType(this.model.student.getNodeIDFor(givenNodeID));
			}
			var newPart = "equation";

			switch(currentPart){
			case "type":
				if(nodeType === "parameter" || nodeType === "accumulator"){
					disable(obj, "initial", false);
					newPart = "initial";
				}else if(nodeType === "function"){
					disable(obj, "initial", true);
						
					if(this.model.given.getUnits(givenNodeID)){
						disable(obj, "units", false);
						newPart = "units";
					}else{
						disable(obj, "equation", false);
						newPart = "equation";
					}
				}
				break;
			case "initial":
				if(this.model.given.getUnits(givenNodeID) && this.model.student.getUnits(this.model.student.getNodeIDFor(givenNodeID)) != this.model.given.getUnits(givenNodeID)){
                    disable(obj, "units", false);
					newPart = "units";
				}else if(nodeType === "function" || nodeType === "accumulator"){
                    var dat = dom.byId("equationBox").value;
                    if(dat=="") {
                    	disable(obj, "equation", false);
                    }
                    newPart = "equation";
				}else if(nodeType === "parameter"){
					disable(obj, "equation", true);
					newPart = "equation";
				}
				break;
			case "units":
				if(nodeType === "parameter"){
					disable(obj, "equation", true);
				}else if(nodeType === "function" || nodeType === "accumulator"){
	                var dat = dom.byId("equationBox").value;
                    if(dat==""){
                    	disable(obj, "equation", false);
                    }
			    }
				newPart = "equation";
				break;
			}
			if(job === "enableRemaining" && newPart !== "equation"){
				this._enableNext(obj, givenNodeID, newPart, job);
			}else{
				return;
			}
		},
		_getInterpretation: function(/*string*/ studentID, /*string*/ nodePart, /*string | object*/ answer){
			// Summary: Returns the interpretation of a given answer (correct, incorrect, etc.)
			//
			// Tags: Private
			var interpretation = null;
			var model = this.model; //needed for anonymous function in the interpret variable.
			var showCorrectAnswer = this.activityConfig.get("showCorrectAnswer");
			// Retrieves the givenID for the matching given model node
			var givenID = this.model.student.getDescriptionID(studentID);

			// Anonymous function assigned to interpret--used by most parts of the switch below
			var interpret = function(correctAnswer){
				if(answer === correctAnswer || correctAnswer === true){
					interpretation = "correct";
				}else{
					if(showCorrectAnswer === true){
						if(model.given.getAttemptCount(givenID, nodePart) > 0)
							interpretation = "secondFailure";
						else
							interpretation = "firstFailure";
					}
					else{
							interpretation = "firstFailure";
					}
				}
			};

			// Take action based on the part of the node being evaluated
			switch(nodePart){
				case "description":
					this.descriptionCounter++;

					if(this.model.given.getGenus(answer) && this.model.given.getGenus(answer) != "required"){
						array.forEach(this.model.given.getNodes(), function(extra){
							if(answer === extra.ID && extra.genus && extra.genus != "allowed"){
								interpretation = extra.genus;
							}
						});
					}else if(this.model.isNodeVisible(studentID, answer)){
							interpretation = "redundant";
					}else if(this.model.isParentNode(answer) || (this.model.isNodesParentVisible(studentID, answer) && !this.checkPremature(studentID))){
						interpretation = "optimal";
					}else if(this.model.student.getNodes().length === 0){
						interpretation = "notTopLevel";
					}else{
						interpretation = "premature";
					}
					if(interpretation !== "optimal" && interpretation !== "premature" && this.descriptionCounter > 2){
						interpretation = "lastFailure";
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
	
		setState: function(/*state.js object*/ State){
			record = State;
			for(var hint in hints){
			record.init(hint, 0);
			};
			record.init("problemCompleted", 0);
		},

		setAssessment: function(/* object */ assess){
			this._assessment = assess;
		},
		
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
			// Send correct answer to controller if status will be set to 'demo'
			if(interpretation === "lastFailure" || interpretation === "secondFailure"){
				answer = this.model.student.getCorrectAnswer(id, nodePart);
				// In case of an equation, we need to substitute variablenames in for the IDs.
				if(nodePart == "equation"){
					answer = check.convert(this.model.given, answer);
				}
				if(answer == null){
					if(nodePart === "description"){
						returnObj.push({id: "message", attribute: "append", value: "You have already created all the necessary nodes."});
					}else
						console.error("Unexpected null from model.getCorrectAnswer().");
				}else{
					returnObj.push({id: nodePart, attribute: "value", value: answer});
					solutionGiven = true;
				}
			}


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
					for(var i = 0; i < returnObj.length; i++){
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
						if(returnObj[i].attribute=="disabled" && returnObj[i].id=="type" && returnObj[i].value==false){
							var content=this.model.given.getExplanation(givenID);
							if(typeof content !== "undefined" && content!=="" && this.mode !== "AUTHOR")
								returnObj.push({id: "explanation", attribute: "disabled", value: false});
						}
				
					}	

				}
				// Process answers for all other node types
			}else{
				givenID = this.model.student.getDescriptionID(id);

				console.assert(nodeEditorActionTable[interpretation], "processAnswer() interpretation '" + interpretation + "' not in table ", nodeEditorActionTable);
				nodeEditorActionTable[interpretation][this.userType](returnObj, nodePart);
				//add help message for unary minus
				var nodeType= this.model.given.getType(givenID);
				if (interpretation==='secondFailure' && nodeType=="accumulator" && nodePart=="equation"){
					if(answer[0]=="-" && answer.slice(1,answer.length).search(/-|\+|\*|\//)<0){
						returnObj.pop();
						returnObj.push({id: "message", attribute: "append", value: "Note that "+answer.slice(1,answer.length)+" is decreasing. If a quantity decreases with time, then its change is negative."});
						disable(returnObj, "enableRemaining", false)
			        }	
			    }
				currentStatus = this.model.given.getStatus(givenID, nodePart); //get current status set in given model
				if(currentStatus !== "correct" && currentStatus !== "demo"){
					this.model.given.setAttemptCount(givenID, nodePart, this.model.given.getAttemptCount(givenID, nodePart) + 1);
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
			
			if(this._assessment){
				this._assessment.updateError(nodePart, checkStatus);
			}

			console.log("**** PM returning:\n", returnObj);
			return returnObj;
		},
		/*****
		 * Additional Public Functions
		 *****/
		setUserType: function(/*string*/ subMode){
			// Summary: Sets the user mode; used by the constructor, but also
			//		allows the mode to be updated dynamically.
			if(this.mode === "STUDENT"){
				this.userType = subMode;
			}else{
				this.userType = this.mode;
			}
		},
		setLogging: function(/*string*/ logging){
			this.logging = logging;
		},
		newAction: function(){
			// Summary:	 Settings for the node editor for a new node
			//			It assumes everything has been enabled and has no colors
			// Policy: disable all but the description on new node
			// BvdS: might want to also activate type in TEST mode
			/*
			 For now, do not enable/disable inputs.	 
			 See Trello card https://trello.com/c/mpd2Ivjd
			 */
			var controls = ["type", "initial", "units", "equation","explanation"];
			var directives = array.map(controls, function(control){
				return {id: control, attribute: "disabled", value: true};
			});
			// Only allow nodes of type 'function' for power users and tests.
			//if(this.userType !== 'power' || this.mode == 'TEST')
			//		directives.push({id: 'type', attribute: 'disableOption', value: 'function'});
			// disable sum and product, after handling change we will disable function
			// directives.push({id: 'type', attribute: 'disableOption', value: 'sum'});
			// directives.push({id: 'type', attribute: 'disableOption', value: 'product'});
			return directives;
		},

		checkDoneness: function(model){
			if(this.mode == "COACHED" && model.areRequiredNodesVisible()){
			return [{
				id: "crisisAlert",
				attribute: "open",
				value: "You have already created all the necessary nodes. You might want to click on \"Graph\" or \"Table\""
			}];
			} 
			return false;
		},

		notifyCompleteness : function (model){
			if(!model.isCompleteFlag && model.matchesGivenSolution()){
				model.isCompleteFlag = true;

				var logObj = lang.mixin({
					type : "completeness-check",
					problemComplete: model.isCompleteFlag
				}, logObj);
				this.logging.log('solution-step', logObj);

				record.increment("problemCompleted", 1);
				if(this.activityConfig.get("showFeedback")){
					// Number of problems to show the hint upon completion
					if(record.getLocal("problemCompleted") < 3 ){
						return	[{
						id: "crisisAlert",
						attribute: "open",
						value: 'You have completed your model. Click on "Graph" or "Table" to see what the solution looks like'
						}];
					}
				}
			}
			return [];
		},

		checkPremature: function(nodeID){
			//return false for other modes
			if(!this.activityConfig.get("targetNodeStrategy")){
				return false;
			}
			//Check premature for COACHED mode
			if(!this.model.active.getDescriptionID(nodeID)){
				return false;
			}
			else if (this.model.isParentNode(this.model.active.getDescriptionID(nodeID))){
				return false;
			}
			var isPremature = true;
			array.some(this.model.active.getNodes(), lang.hitch(this, function(node){
				if(node.inputs.length > 0){
					var isInputNode = array.some(node.inputs, lang.hitch(this, function(input){
						if(input.ID == nodeID && this.model.student.getCorrectness(node.ID) !== "incorrect") return true;
					}));
				}
				if(isInputNode){
					isPremature = false;
					return true;
				}
			}));
			return isPremature;
		}
	});
});
