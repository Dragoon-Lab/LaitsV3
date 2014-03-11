/**
 *
 * Pedagogical Module class used to solve Dragoon problems
 * @author: Brandon Strong
 *
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
        //Summary: Messages that are given to the user based on the type of user, 
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
        incorrect:[
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
        
    var typeTable = {
            correct: {
                COACHED: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
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
                COACHED: function(obj,part){state(obj, part, "demo"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
                feedback: function(obj,part){state(obj, part, "correct"); message(obj,part, "correct"); disable(obj, part, true); disable(obj, "enableNext", false);}, 
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            },
            anotherFailure: {
                COACHED: function(){console.error("Attempting to access typeTable after demo has been sent.");}, 
                feedback: function(){console.error("Attempting to access typeTable after demo has been sent.");}, 
                TEST: function(obj,part){disable(obj, "enableRemaining", false);}, 
                power: function(obj,part){disable(obj, "enableRemaining", false);}
            }};
    
    var counter = {correct: 0, notTopLevel: 0, premature: 0, initial: 0, extra: 0, irrelevant: 0, redundant: 0, lastFailure: 0, lastFailure2: 0};
    
    function state(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
        obj.push({id: nodePart, attribute: "status", value: status});
    }
    
    function message(/*object*/ obj, /*string*/ nodePart, /*string*/ status){
        obj.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, status)});
    }
    
    function disable(/*object*/ obj, /*string*/ nodePart, /*boolean*/ disable){
            obj.push({id: nodePart, attribute: "disabled", value: disable});
    }
    
    
    function _getMessage(/*string*/ nodePart, /*string*/ status) {
        // Summary: Returns the appropriate message from the hints object (above).
        //
        // Tags: Private
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
    

    /**
     * 
     * Class construction
     * 
     **/


    return declare(null, {
        constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model) {
            this.model = model;
            this.mode = mode;
            this._setUserType(subMode);
            this.matchingID = null;
        },
                _setUserType: function(/*string*/ subMode) {
            // Summary: Sets the user mode; used by the constructor, but also
            //      allows the mode to be updated dynamically.
            if (this.mode === "STUDENT") {
                this.userType = subMode;
            } else {
                this.userType = this.mode;
            }
         },
        _getNextPart: function(/*string*/ givenNodeID, /*string*/ currentPart) {
            // Summary: Determines the next portion of the node to be completed 
            //      when the user gets a correct answer.
            //
            // Tags: Private
            var nextPart = null;
            switch (currentPart) {
                case "description":
                    nextPart = "type";
                    break;
                case "type":
                    if (this.model.given.getInitial(givenNodeID) !== null)
                        nextPart = "initial";
                    else if (this.model.given.getUnits(givenNodeID) !== null)
                        nextPart = "units";
                    else if (this.model.given.getinputs(givenNodeID) !== null)
                        nextPart = "inputs";
                    else
                        nextPart = "equation";
                    break;
                case "initial":
                    if (this.model.given.getUnits(givenNodeID) !== null)
                        nextPart = "units";
                    else if (this.model.given.getinputs(givenNodeID) !== null)
                        nextPart = "inputs";
                    else if (this.model.given.getEquation(givenNodeID) !== null)
                        nextPart = "equation";
                    else
                        nextPart = null;
                    break;
                case "units":
                    if (this.model.given.getInputs(givenNodeID) !== null)
                        nextPart = "inputs";
                    else if (this.model.given.getEquation(givenNodeID) !== null)
                        nextPart = "equation";
                    else
                        nextPart = null;
                    break;
                case "inputs":
                    if (this.model.given.getEquation(givenNodeID) !== null)
                        nextPart = "equation";
                    break;
                case "equation":
                    nextPart = null;
                    break;
                    //The default was running every time--look into if a default is needed,
                    //      otherwise remove.
//                default:
//                    console.error("Unexpected value assigned to currentPart in _getNextPart().");
//                    break;
            }
            return nextPart;
        },
        _getInterpretation: function(/*string*/ id, /*string*/ nodePart, /*string | object*/ answer) {
            // Summary: Returns the interpretation of a given answer (correct, 
            //      incorrect, etc. and sets the status in the return object
            //
            // Tags: Private
            var interpretation = null;
            var newID = id;
            // The next 'if' statement sets retrieves the id for the matching node
            //      when the student is in the 'description' section of the node

            switch (nodePart) {
                case "description":
                    newID = this.model.getNodeIDByDescription(answer);
                    this.matchingID = newID;

                    if (this.model.student.isInExtras(newID)) {
                        array.forEach(this.model.getExtraDescriptions(), function(extra) {
                            if (answer === extra.text && extra.type === "initial") {
                                interpretation = "initialValue";
                            } else if (answer === extra.text && extra.type === "extra") {
                                interpretation = "extraValue";
                            } else if (answer === extra.text && extra.type === "model") {
                                interpretation = "irrelevant";
                            }
                        });
                    } else if (this.model.isNodeVisible(newID)) {
                        interpretation = "redundant";
                    } else if (this.model.isParentNode(newID) || this.model.isNodesParentVisible(newID)) {
                        interpretation = "optimal";
                    } else if (this.model.student.getNodes().length === 0) {
                        interpretation = "notTopLevel";
                    } else {
                        interpretation = "premature";
                    }
                    if (interpretation !== "optimal" && this.model.getNodeAttemptCount(newID, "description") === 2) {
                        interpretation = "lastFailure";
                    }
                    break;
                case "type":
                    if (answer === this.model.given.getType(id)) {
                        interpretation = "correct";
                    } else {
                        if (this.model.getNodeAttemptCount(newID, "type") === 1)
                            interpretation = "lastFailure2";
                        else
                            interpretation = "incorrect";
                    }
                    break;
                case "initial":
                    if (answer === this.model.given.getInitial(id)) {
                        interpretation = "correct";
                    } else if(this.model.given.getInitial(id) === ""){
                        interpretation = "correct";
                    } else {
                        if (this.model.getNodeAttemptCount(newID, "initial") === 2)
                            interpretation = "lastFailure2";
                        else if (this.model.getNodeAttemptCount(newID, "initial") === 1)
                            interpretation = "secondFailure";
                        else
                            interpretation = "firstFailure";
                    }
                    break;
                case "units":
                    if (answer === this.model.given.getUnits(id)) {
                        interpretation = "correct";
                    } else {
                        if (this.model.getNodeAttemptCount(newID, "units") === 2)
                            interpretation = "lastFailure2";
                        else if (this.model.getNodeAttemptCount(newID, "units") === 1)
                            interpretation = "secondFailure";
                        else
                            interpretation = "firstFailure";
                    }
                    break;
                case "equation":
                    var equivCheck = new check(this.model.given.getEquation(id), answer);

                    if (equivCheck.areEquivalent()){
                        interpretation = "correct";
                    } else {
                        if (this.model.getNodeAttemptCount(newID, "equation") === 2)
                            interpretation = "lastFailure2";
                        else if (this.model.getNodeAttemptCount(newID, "equation") === 1)
                            interpretation = "secondFailure";
                        else
                            interpretation = "firstFailure";
                    }
                    break;
            }
            return interpretation;
        },
        
        /**
         * 
         * Currently all of the nodes are essentially copies of descriptionAction()
         *      but with a supplied answer so that it can return something; they 
         *      will be updated soon.
         * 
         **/
        descriptionAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation(id, "description", answer);           
            var returnObj = [];
            descriptionTable[interpretation][this.userType](returnObj, "description");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(null,"description");
            }
            returnObj.push({id: "description", attribute: "descriptionID", value: this.matchingID});
            return returnObj;
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "type", answer);
            var returnObj = [];
            typeTable[interpretation][this.userType](returnObj, "type");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(newID,"type");
            }
            return returnObj;
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "initial", answer);
            var returnObj = [];
            typeTable[interpretation][this.userType](returnObj, "initial");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(newID,"initial");
            }
            return returnObj;
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "units", answer);
            var returnObj = [];
            typeTable[interpretation][this.userType](returnObj, "units");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(newID,"units");
            }
            return returnObj;
        },
        inputsAction: function(/*string*/ id, /*string*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "inputs", answer);
            var returnObj = [];
            typeTable[interpretation][this.userType](returnObj, "inputs");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(newID,"inputs");
            }
            return returnObj;
        },
        equationAction: function(/*string*/ id, /*object*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "equation", answer);
            var returnObj = [];
            typeTable[interpretation][this.userType](returnObj, "equation");
            for(var i = 0; i<returnObj.length; i++){
                if(returnObj[i].id === "enableNext")
                    returnObj[i].id = this._getNextPart(newID,"equation");
            }
            return returnObj;
        }
    });
});
