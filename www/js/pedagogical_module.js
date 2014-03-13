/* global define */

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
    "dojo/_base/array", "dojo/_base/declare", "./equation_check", "parser/parser"
], function(array, declare, check, Parser) {

    var hints = {
        // Summary: Messages that are given to the user based on the type of user, 
        //      his or her answers, and the number of hints of that type.
        irrelevant: [
            "The quantity is irrelevant to this problem.  Choose a different one.",
            "This quantity is irrelevant for modeling the system.  Try again.",
            "Irrelevant.  Try again."
        ],
        initial: [
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
        ]
    };

    var descriptionTable = {
        // Summary: This table is used for determining the proper response to a student's 'description' answer (see 
        //      'Pedagogical_Module.docx' in the documentation)
            optimal: {
                COACHED: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "type", false);}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "type", false);},
                TEST: function(obj,part){state(obj, part, "correct"); disable(obj, part, true); disable(obj, "type", false);}, 
                power: function(obj,part){state(obj, part, "correct"); disable(obj, part, true); disable(obj, "type", false);}
            },
            notTopLevel: {
                COACHED: function(obj,part){state(obj, part, "notTopLevel"); message(obj,part, "premature");}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "type", false);},
                TEST: function(obj,part){state(obj, part, "correct"); disable(obj, part, true); disable(obj, "type", false);}, 
                power: function(obj,part){state(obj, part, "correct"); disable(obj, part, true); disable(obj, "type", false);}
            },
            premature: {
                COACHED: function(obj,part){state(obj, part, "premature"); message(obj,part, "premature");}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "type", false);},
                TEST: function(obj,part){state(obj, part, "correct"); disable(obj, part, true);disable(obj, "type", false);}, 
                power: function(obj,part){state(obj, part, "correct"); disable(obj, part, true);disable(obj, "type", false);}
            },
            initialValue: {
                COACHED: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "initial");}, 
                feedback: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "initial");}, 
                TEST: function(obj,part){state(obj, part, "incorrect");}, 
                power: function(obj,part){state(obj, part, "incorrect");}
            },
            extraValue: {
                COACHED: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "extra");}, 
                feedback: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "irrelevant");}, 
                TEST: function(obj,part){state(obj, part, "incorrect");}, 
                power: function(obj,part){state(obj, part, "incorrect");}
            },
            irrelevant: {
                COACHED: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "irrelevant");}, 
                feedback: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "irrelevant");}, 
                TEST: function(obj,part){state(obj, part, "incorrect");}, 
                power: function(obj,part){state(obj, part, "incorrect");}
            },
            redundant: {
                COACHED: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "redundant");}, 
                feedback: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "redundant");}, 
                TEST: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "redundant");}, 
                power: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "redundant");}
            },
            lastFailure: {
                COACHED: function(obj,part){state(obj, part, "demo"); message(obj,part, "lastFailure2");disable(obj, part, true); disable(obj, "type", false);}, 
                feedback: function(obj,part){state(obj, part, "demo"); message(obj,part, "lastFailure2");disable(obj, part, true); disable(obj, "type", false);},
                TEST: function(obj,part){state(obj, part, "demo"); disable(obj, part, true);disable(obj, "type", false);}, 
                power: function(obj,part){state(obj, part, "demo"); disable(obj, part, true);disable(obj, "type", false);}
            }};
        
    var actionTable = {
        // Summary: This table is used for determining the proper response to a student's answers in the 
        //      remaining sections (see 'Pedagogical_Module.docx' in the documentation)
            correct: {
                COACHED: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableRemaining", false);}, 
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            },
            firstFailure: {
                COACHED: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "incorrect");}, 
                feedback: function(obj,part){state(obj, part, "incorrect"); message(obj,part, "incorrect");},
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            },
            secondFailure: {
                COACHED: function(obj,part){state(obj, part, "demo"); message(obj,part, "lastFailure2"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
                feedback: function(obj,part){state(obj, part, "demo"); message(obj,part, "lastFailure2"); disable(obj, part, true); disable(obj, "enableRemaining", false);}, 
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            },
            anotherFailure: {
                COACHED: function(){console.error("Attempting to access actionTable after demo has been sent.");}, 
                feedback: function(){console.error("Attempting to access actionTable after demo has been sent.");}, 
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            }};
        
    // Counters used to determine which message in an array to display; they are not dependent on which node is 
    //      active and differ from the counters (attemptCount) in the model, which are node specific
    var counter = {correct: 0, notTopLevel: 0, premature: 0, initial: 0, extra: 0, irrelevant: 0, redundant: 0, incorrect: 0, lastFailure: 0, lastFailure2: 0};
    
    /*****
     * Summary: The following four functions are used by the above tables to push 
     *      statuses and messages to the return object array.
     *****/
    function state(/*object*/ obj, /*string*/ nodePart, /*string*/ status) {
        obj.push({id: nodePart, attribute: "status", value: status});
    }

    function message(/*object*/ obj, /*string*/ nodePart, /*string*/ status) {
        obj.push({id: 'message', attribute: 'append', value: getMessage(nodePart, status)});
    }

    function disable(/*object*/ obj, /*string*/ nodePart, /*boolean*/ disable) {
        obj.push({id: nodePart, attribute: "disabled", value: disable});
    }
    
    function getMessage(/*string*/ nodePart, /*string*/ status) {
        // Summary: Returns the appropriate message from the hints object (above).
        var messages = new Array();
        var theCounter = 0;
        messages = hints[status];
        theCounter = counter[status];
        counter[status]++;
        if (theCounter > messages.length - 1) {
            return messages[messages.length - 1];
        } else {
            return messages[theCounter];
        }
    }
    
    /*****
     * 
     * Builds class that is used by controller to check student answers
     * 
     *****/
    return declare(null, {
        constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model) {
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
        _enableNext: function(/*object*/ obj, /*string*/ givenNodeID, /*string*/ currentPart, /*string*/ job) {
        // Summary: adds messages to return object to enable specified parts of 
        //      the node
        //
        // Tags: Private
            var nodeType = this.model.given.getType(givenNodeID);
            var newPart = "equation";
            
            switch (currentPart) {
                case "type":                   
                    if(nodeType === "parameter" || nodeType === "accumulator"){
                        disable(obj, "initial", false);
                        newPart = "initial";
                    }else if (this.model.given.getUnits(givenNodeID)){
                        disable(obj, "units", false);
                        newPart = "units";
                    }else{
                        disable(obj, "equation", false);
                        newPart = "equation";
                    }
                    break;
                case "initial":                   
                    if (this.model.given.getUnits(givenNodeID)){
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
        _getInterpretation: function(/*string*/ studentID, /*string*/ nodePart, /*string | object*/ answer) {
            // Summary: Returns the interpretation of a given answer (correct, incorrect, etc.)
            //
            // Tags: Private
            var interpretation = null;
            var model = this.model; //needed for anonymous function in the interpret variable.
            
            // Retrieves the givenID for the matching given model node
            var givenID = this.model.student.getDescriptionID(studentID); 
            
            // Anonymous function assigned to interpret--used by most parts of the switch below
            var interpret = function(correctAnswer){
                if (answer === correctAnswer || correctAnswer === true) {
                    interpretation = "correct";
                } else {
                    if (model.getNodeAttemptCount(givenID, nodePart) > 2)
                        interpretation = "lastFailure2";
                    else if (model.getNodeAttemptCount(givenID, nodePart) > 1)
                        interpretation = "secondFailure";
                    else
                        interpretation = "firstFailure";
                }
            };
                
            // Take action based on the part of the node being evaluated
            switch (nodePart) {
                case "description":
                    this.descriptionCounter++;
                    
                    if (this.model.student.isInExtras(answer)) {
                        array.forEach(this.model.getExtraDescriptions(), function(extra) {
                            if (answer === extra.ID && extra.type === "initial") {
                                interpretation = "initialValue";
                            } else if (answer === extra.ID && extra.type === "extra") {
                                interpretation = "extraValue";
                            } else if (answer === extra.ID && extra.type === "model") {
                                interpretation = "irrelevant";
                            }
                        });
                    } else if (this.model.isNodeVisible(studentID, answer)) {
                        interpretation = "redundant";
                    } else if (this.model.isParentNode(answer) || this.model.isNodesParentVisible(studentID, answer)) {
                        interpretation = "optimal";
                    } else if (this.model.student.getNodes().length === 0) {
                        interpretation = "notTopLevel";
                    } else {
                        interpretation = "premature";
                    }
                    if (interpretation !== "optimal" && this.descriptionCounter > 2) {
                        interpretation = "lastFailure";
                    }
                    break;
                case "type":
                    interpret(this.model.given.getType(givenID));
                    break;
                case "initial":
                    if (!this.model.given.getInitial(givenID))
                        interpretation = "correct";
                    else
                        interpret(this.model.given.getInitial(givenID));                   
                    break;
                case "units":
                    interpret(this.model.given.getUnits(givenID));
                    break;
                case "equation":
                    // The 'equation' case accepts an equation object from the controller
                    //      and checks it against the given equation using equation_check.js
                    var equivCheck = new check(this.model.given.getEquation(givenID), answer);
                    interpret(equivCheck.areEquivalent());
                    break;
            }
            /* 
             This is an example of logging via direct function calls
             Note that I haven't set correct-value.  For most controls, it should be set
             */
            if (this.logging) {
                this.logging.log('solution-step', {node: studentID, type: nodePart, value: answer, checkResult: interpretation});
            }
            return interpretation;
        },
        _processAnswer: function(/*string*/ id, /*string*/ nodePart, /*string*/ answer){
            // Summary: Pocesses a student's answers and returns if correct, 
            //      incorrect, etc. and alerts the controller about what parts 
            //      of the node editor should be active.
            //
            // Tags: Private
            var interpretation = this._getInterpretation(id, nodePart, answer);
            var returnObj = [];
            
            // Process answers for description
            if(nodePart === "description"){
                descriptionTable[interpretation][this.userType](returnObj, nodePart);
                for (var i = 0; i < returnObj.length; i++) 
                    if (returnObj[i].value === "correct" || returnObj[i].value === "demo"){
                        this.model.given.setAttemptCount(answer, nodePart, this.descriptionCounter);
                        this.descriptionCounter = 0;
                    }
            // Process answers for all other node types
            }else{
                var givenID = this.model.student.getDescriptionID(id);
                actionTable[interpretation][this.userType](returnObj, nodePart);
                this.model.given.setAttemptCount(givenID, nodePart, this.model.getNodeAttemptCount(givenID, nodePart) + 1);
                               
                // Activate appropriate parts of the node editor
                var lastElement = returnObj[returnObj.length-1].id;
                if (lastElement === "enableNext" || lastElement === "enableRemaining"){
                    returnObj.pop();
                    this._enableNext(returnObj, givenID, nodePart, lastElement);
                }
            }
            
            return returnObj;
        },
        /*****
         * Public Functions
         *****/
        /*****
         * The following five functions are used by the controller to 
         *      process the student's answers using _processAnswer().
         *****/
        descriptionAction: function(/*string*/ id, /*string*/ answer) {
            return this._processAnswer(id, "description", answer);
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            return this._processAnswer(id, "type", answer);
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            return this._processAnswer(id, "initial", answer);
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            return this._processAnswer(id, "units", answer);
        },
        equationAction: function(/*string*/ id, /*object*/ answer) {
            return this._processAnswer(id, "equation", answer);
        },
        /*****
         * Additional Public Functions
         *****/
        setUserType: function(/*string*/ subMode) {
            // Summary: Sets the user mode; used by the constructor, but also
            //      allows the mode to be updated dynamically.
            if (this.mode === "STUDENT") {
                this.userType = subMode;
            } else {
                this.userType = this.mode;
            }
        },
        setLogging: function(/*string*/ logging) {
            this.logging = logging;
        },
        newAction: function() {
            // Summary:  Settings for the node editor for a new node
            //          It assumes everything has been enabled and has no colors
            // Policy: disable all but the description on new node
            // BvdS: might want to also activate type in TEST mode
	    /*
	     For now, do not enable/disable inputs.  
	     See Trello card https://trello.com/c/mpd2Ivjd
	     */
            var controls = ["type", "initial", "units", "equation"];
            var directives = array.map(controls, function(control) {
                return {id: control, attribute: "disabled", value: true};
            });
	    // Only allow nodes of type 'function' for power users and tests.
	    //if(this.userType !== 'power' || this.mode == 'TEST')
            //      directives.push({id: 'type', attribute: 'disableOption', value: 'function'});
                // Temp disable of sum and product, after handling change we will disable function
            directives.push({id: 'type', attribute: 'disableOption', value: 'sum'});
            directives.push({id: 'type', attribute: 'disableOption', value: 'product'});
	    return directives;
        }
    });
});
