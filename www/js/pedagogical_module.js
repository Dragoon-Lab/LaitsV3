/* global define */
/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * Pedagogical Module class used to solve Dragoon problems
 * @author: Brandon Strong
 **/

/**
 * Pedagogical module that accepts student entries, and returns an object with the  
 * id of the node, a message with encouragement or a hint, and the status of the 
 * attempt (correct, incorrect, demo, or premature).
 **/

define([
    "dojo/_base/array", "dojo/_base/declare", "./equation"
], function(array, declare, check){

    var hints = {
        // Summary: Messages that are given to the user based on the type of user, 
        //      his or her answers, and the number of hints of that type.
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
            "You tried to define a parameter for a number you read in the problem.  Not all numbers in the problem statement are necessary for the model.  You will save effort if you follow the Target Node Strategy, which says you should start by defining a node for a quantity that the problem asks you to graph, then define nodes for its inputs, and then define nodes for their inputs, etc.  That way, every node you create is an input to some node.",
            "Not every number in the problem statement is necessary for the model.  You should define a node for a quantity only when either (1) it is required as input to a previously defined node, or (2) the problem statement asks you to graph it.",
            "Please be sure you need a node before defining it.  Even if a number appears in the problem statement, it may not be needed in the model."
        ],
        redundant: [
            "A node already exists for that quantity.  If you want to edit it, click on it."
        ],
        premature: [
            "Blue means that the quantity is relevant for modeling the system, but it is not yet time to define it.  You should follow the Target Node Strategy, which says you should edit an existing node that is not yet defined.  Such nodes have dotted outlines.  Click on one to edit it.",
            "Blue means that according to the Target Node Strategy, it is too early to define a node for this quantity.  Edit a node that has a dotted outline.",
            "Blue means premature.  Edit a node with a dotted outline instead."
        ],
        notTopLevel: [
            "Blue means that quantity isn’t one that the problem statement asks you to graph.  Although this quantity will eventually be in your model, you should follow the Target Node Strategy, which says you should first define a node for a top level goal quantity.",
            "Please start with a quantity mentioned in the problem statement as one that needs to be graphed."
        ],
        correct: [
            "Green means correct.  Good job!",
            "Green means correct."
        ],
        incorrect: [
            "Your answer is incorrect. Please try again.",
            "Your answer is incorrect."
        ],
        lastFailure: [
            "Sorry, but that quantity isn’t relevant to the model.  Moreover, this is the third failure, so a correct selection is being done for you.  Please study it and figure out why it is correct.  Your goal should be to make a correct selection on the first attempt.",
            "Here’s a correct solution.  Please figure out why it is correct so that next time, your first selection will be correct.",
            "Please study this correct selection."
        ],
        lastFailure2: [
            "Yellow means that you made an incorrect choice too many times, so you are being shown the correct choice.  You should figure out why it is correct so that next time your first choice will be correct.",
            "Can you figure out why this is the right type for the node?"
        ],
        erasedCorrect: [
            "Your choice was not correct and you are being given the correct answer. However, you previously completed this part correctly. It will continue to be marked this way."
        ],
        erasedDemo: [
            "Your choice was correct, however this part was previously completed by the model. It will continue to be marked this way."
        ]
    };

    var descriptionTable = {
        // Summary: This table is used for determining the proper response to a student's 'description' answer (see 
        //      'Pedagogical_Module.docx' in the documentation)
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
            TEST: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
                disable(obj, "type", false);
            },
            power: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
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
            TEST: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
                disable(obj, "type", false);
            },
            power: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
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
            TEST: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
                disable(obj, "type", false);
            },
            power: function(obj, part){
                state(obj, part, "correct");
                disable(obj, part, true);
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
            TEST: function(obj, part){
                state(obj, part, "incorrect");
            },
            power: function(obj, part){
                state(obj, part, "incorrect");
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
            TEST: function(obj, part){
                state(obj, part, "incorrect");
            },
            power: function(obj, part){
                state(obj, part, "incorrect");
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
            TEST: function(obj, part){
                state(obj, part, "incorrect");
            },
            power: function(obj, part){
                state(obj, part, "incorrect");
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
            TEST: function(obj, part){
                state(obj, part, "incorrect");
                message(obj, part, "redundant");
            },
            power: function(obj, part){
                state(obj, part, "incorrect");
                message(obj, part, "redundant");
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
            TEST: function(obj, part){
                state(obj, part, "demo");
                disable(obj, part, true);
                disable(obj, "type", false);
            },
            power: function(obj, part){
                state(obj, part, "demo");
                disable(obj, part, true);
                disable(obj, "type", false);
            }
        }};

    var actionTable = {
        // Summary: This table is used for determining the proper response to a student's answers in the 
        //      remaining sections (see 'Pedagogical_Module.docx' in the documentation)
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
            TEST: function(obj, part){
                disable(obj, "enableRemaining", false);
            },
            power: function(obj, part){
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
            TEST: function(obj, part){
                disable(obj, "enableRemaining", false);
            },
            power: function(obj, part){
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
            TEST: function(obj, part){
                disable(obj, "enableRemaining", false);
            },
            power: function(obj, part){
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
            TEST: function(obj, part){
                disable(obj, "enableRemaining", false);
            },
            power: function(obj, part){
                disable(obj, "enableRemaining", false);
            }
        }};

    //Declare variable for accessing state.js module
    var record = null;
	
    /*****
     * Summary: The following four functions are used by the above tables to push 
     *      statuses and messages to the return object array.
     *****/
    function state(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
        obj.push({id: nodePart, attribute: "status", value: status});
    }
    
    function message(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
	var hintSequence = hints[status];
        if(record.getLocal(status) < hintSequence.length){
	    var counter = record.getLocal(status);
            obj.push({id: "crisisAlert", attribute: "open", value: hintSequence[counter]});
	};
	record.increment(status, 1);
        if(status === "extra" || status === "irrelevant")
            status = "incorrect";
        if(status === "lastFailure" || status === "lastFailure2")
            status = "incorrect. The correct answer has been given";
        obj.push({id: "message", attribute: "append", value: "The value entered for " + nodePart + " is " + status + "."});
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
        constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model){
            this.model = model;
            this.mode = mode;
            this.setUserType(subMode);
        },
        matchingID: null,
        logging: null,
        descriptionCounter: 0,
	/*
	 Counters used to determine which message in an array to display; 
	 they are not dependent on which node is active and differ from 
	 the counters (attemptCount) in the model, which are node-specific.
	 */
	counters: ["correct", "notTopLevel", "premature", "initial", "extra", "irrelevant", "redundant", "incorrect", "lastFailure", "lastFailure2"],
	
        /*****
         * Private Functions
         *****/
        _enableNext: function(/*object*/ obj, /*string*/ givenNodeID, /*string*/ currentPart, /*string*/ job){
            // Summary: adds messages to return object to enable specified parts of 
            //      the node
            //
            // Tags: Private
            var nodeType = this.model.given.getType(givenNodeID);
            var newPart = "equation";

            switch(currentPart){
                case "type":
                    if(nodeType === "parameter" || nodeType === "accumulator"){
                        disable(obj, "initial", false);
                        newPart = "initial";
                    }else if(this.model.given.getUnits(givenNodeID)){
                        disable(obj, "units", false);
                        newPart = "units";
                    }else{
                        disable(obj, "equation", false);
                        newPart = "equation";
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

            // Anonymous function assigned to interpret--used by most parts of the switch below
            var interpret = function(correctAnswer){
                if(answer === correctAnswer || correctAnswer === true){
                    interpretation = "correct";
                }else{
                    if(model.given.getAttemptCount(givenID, nodePart) > 0)
                        interpretation = "secondFailure";
                    else
                        interpretation = "firstFailure";
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
                    if(interpretation !== "optimal" && this.descriptionCounter > 2){
                        interpretation = "lastFailure";
                    }
                    break;
                case "type":
                    interpret(this.model.given.getType(givenID));
                    break;
                case "initial":
                    if(!this.model.given.getInitial(givenID))
                        interpretation = "correct";
                    else
                        interpret(this.model.given.getInitial(givenID));
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
             Note that I haven't set correct-value.  For most controls, it should be set
             */
            if(this.logging){
                this.logging.log('solution-step', {
                    node: studentID,
                    name: this.model.student.getName(givenID),
                    type: nodePart,
                    value: answer,
                    checkResult: (interpretation == 'correct' || interpretation == 'optimal') ? 'CORRECT' : 'INCORRECT',
                    order: interpretation
                });
            }
            return interpretation;
        },
	
        /*****
         * Public Functions
         *****/
	
	setState: function(/*state.js object*/ State){
	    record = State;
	    array.forEach(this.counters, function(counter){
		record.init(counter, 0);
	    });
	},
		
        processAnswer: function(/*string*/ id, /*string*/ nodePart, /*string | object*/ answer){
            // Summary: Pocesses a student's answers and returns if correct, 
            //      incorrect, etc. and alerts the controller about what parts 
            //      of the node editor should be active.
            //
            // Tags: Private
            var interpretation = this._getInterpretation(id, nodePart, answer);
            var returnObj = [], currentStatus;
            var givenID;  // ID of the correct node, if it exists

            // Send correct answer to controller if status will be set to 'demo'
            if(interpretation === "lastFailure" || interpretation === "secondFailure"){
                answer = this.model.student.getCorrectAnswer(id, nodePart);
                // In case of an equation, we need to substitute variablenames in for the IDs.
                if(nodePart == "equation"){
                    answer = check.convert(this.model.given, answer);
                }
                if(!answer){
                    if(nodePart === "description"){
                        returnObj.push({id: "message", attribute: "append", value: "You have already created all the necessary nodes."});
                    }else
                        console.error("Unexpected null from model.getCorrectAnswer().");
                }else
                    returnObj.push({id: nodePart, attribute: "value", value: answer});
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
            console.log("**** PM returning:\n", returnObj);
            return returnObj;
        },
        /*****
         * Additional Public Functions
         *****/
        setUserType: function(/*string*/ subMode){
            // Summary: Sets the user mode; used by the constructor, but also
            //      allows the mode to be updated dynamically.
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
            // Summary:  Settings for the node editor for a new node
            //          It assumes everything has been enabled and has no colors
            // Policy: disable all but the description on new node
            // BvdS: might want to also activate type in TEST mode
            /*
             For now, do not enable/disable inputs.  
             See Trello card https://trello.com/c/mpd2Ivjd
             */
            var controls = ["type", "initial", "units", "equation"];
            var directives = array.map(controls, function(control){
                return {id: control, attribute: "disabled", value: true};
            });
            // Only allow nodes of type 'function' for power users and tests.
            //if(this.userType !== 'power' || this.mode == 'TEST')
            //      directives.push({id: 'type', attribute: 'disableOption', value: 'function'});
            // disable sum and product, after handling change we will disable function
            // directives.push({id: 'type', attribute: 'disableOption', value: 'sum'});
            // directives.push({id: 'type', attribute: 'disableOption', value: 'product'});
            return directives;
        },
        checkDoneness: function(model){
            if(this.mode === "COACHED" ){
                console.log("checkDoneness called for COACHED MODE");
                return  model.areRequiredNodesVisible();
            }
            return false;
        }

    });
});
