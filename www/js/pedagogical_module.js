/* global define */

define([
    "dojo/_base/array", "dojo/_base/declare", "./equation_check", "parser/parser"
], function(array, declare, check, Parser) {

    return declare(null, {
        constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model) {
            this.model = model;
            this.mode = mode;
            //this.subMode = subMode;
            this.setUserType(subMode);
            this.correctCounter = 0;
            this.notTopLevelCounter = 0;
            this.prematureCounter = 0;
            this.initialCounter = 0;
            this.extraCounter = 0;
            this.irrelevantCounter = 0;
            this.redundantCounter = 0;
            this.lastFailureCounter = 0;
            this.oneAttemptFailureCounter = 0;
        },
        hints: {
            //Summary: Messages that are given to the user based on the type of user, 
            //      his or her answers, and the number of hints of that type.
            incorrect: {
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
                ]
            },
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
            demo: {
                lastFailure: [
                    "Sorry, but that quantity isn’t relevant to the model.  Moreover, this is the third failure, so a correct selection is being done for you.  Please study it and figure out why it is correct.  Your goal should be to make a correct selection on the first attempt.",
                    "Here’s a correct solution.  Please figure out why it is correct so that next time, your first selection will be correct.",
                    "Please study this correct selection."
                ],
                oneAttemptFailure: [
                    "Yellow means that you made an incorrect choice too many times, so you are being shown the correct choice.  You should figure out why it is correct so that next time your first choice will be correct.",
                    "Can you figure out why this is the right type for the node?"
		]
	    }
	},
        _getMessage: function(/*string*/ nodePart, /*string*/ status) {
            // Summary: Returns the appropriate message from the hints object (above).
            //
            // Tags: Private
            var messages = new Array();
            var theCounter = 0;

            switch (status) {
                case "correct":
                    messages = this.hints.correct;
                    theCounter = this.correctCounter;
                    break;
                case "notTopLevel":
                    messages = this.hints.notTopLevel;
                    theCounter = this.notTopLevelCounter;
                    break;
                case "premature":
                    messages = this.hints.premature;
                    theCounter = this.prematureCounter;
                    break;
                case "initial":
                    messages = this.hints.incorrect.initial;
                    theCounter = this.initialCounter;
                    break;
                case "extra":
                    messages = this.hints.incorrect.extra;
                    theCounter = this.extraCounter;
                    break;
                case "irrelevant":
                    messages = this.hints.incorrect.irrelevant;
                    theCounter = this.irrelevantCounter;
                    break;
                case "redundant":
                    messages = this.hints.incorrect.redundant;
                    theCounter = this.redundantCounter;
                    break;
                case "lastFailure":
                    messages = this.hints.demo.lastFailure;
                    theCounter = this.lastFailureCounter;
                    break;
                case "oneAttemptFailure":
                    messages = this.hints.demo.lastFailure;
                    theCounter = this.lastFailureCounter;
                    break;
                    //default is always running even if another case is being used--look into bug if it is needed
//                default:
//                    console.error("Unexpected value assigned to status in _getMessage().");
//                    break;
            }
            if (theCounter > messages.length - 1) {
                return messages[messages.length - 1];
            } else {
                return messages[theCounter - 1];
            }
        },
        _getNextPart: function(/*string*/ id, /*string*/ currentPart) {
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
                    if (this.model.given.getInitial(id) !== null)
                        nextPart = "initial";
                    else if (this.model.given.getUnits(id) !== null)
                        nextPart = "units";
                    else if (this.model.given.getinputs(id) !== null)
                        nextPart = "inputs";
                    else
                        nextPart = "equation";
                    break;
                case "initial":
                    if (this.model.given.getUnits(id) !== null)
                        nextPart = "units";
                    else if (this.model.given.getinputs(id) !== null)
                        nextPart = "inputs";
                    else
                        nextPart = "equation";
                    break;
                case "units":
                    if (this.model.given.getinputs(id) !== null)
                        nextPart = "inputs";
                    else
                        nextPart = "equation";
                    break;
                case "inputs":
                    if (this.model.given.getEquation(id) !== null)
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
        _getPedagogicalTable: function(/*string*/ id, /*string*/ nodePart, /*string*/ interpretation) {
            // Summary: Builds and returns the pedagogical table
            // 
            // Tags: Private
            //
            // Note: This function is under construction--it will likely be arranged differently
            var nextPart = this._getNextPart(id, nodePart);
            
            // Builds part of table that addresses correct responses.
            var correctSequence = [
                {id: nodePart, attribute: "status", value: "correct"},
                {id: nodePart, attribute: "disabled", value: true},
                {id: nextPart, attribute: "disabled", value: false}
            ];
            if (this.userType === "COACHED" || this.userType === "feedback")
                correctSequence.push({id: nodePart, attribute: "message", value: this._getMessage(nodePart, "correct")});
            
            // Builds part of table that addresses correct responses that are given early.
            var notTopLevelSequence = [
                {id: nodePart, attribute: "status", value: "premature"},
                {id: nodePart, attribute: "disabled", value: false}
            ];
            if (this.userType === "COACHED" || this.userType === "feedback")
                notTopLevelSequence.push({id: nodePart, attribute: "message", value: this._getMessage(nodePart, "notTopLevel")});
            
            // Builds part of table that addresses other premature responses.
            var prematureSequence = [
                {id: nodePart, attribute: "status", value: "premature"},
                {id: nodePart, attribute: "disabled", value: false}
            ];
            if (this.userType === "COACHED" || this.userType === "feedback")
                prematureSequence.push({id: nodePart, attribute: "message", value: this._getMessage(nodePart, "premature")});
            
            // Builds part of table that addresses incorrect responses.
            var incorrectSequence = [
                {id: nodePart, attribute: "status", value: "incorrect"},
                {id: nodePart, attribute: "disabled", value: false}
            ];
            if (this.userType === "COACHED" || this.userType === "feedback") {
                var status;
                if (interpretation === "initial")
                    status = "initial";
                else if (interpretation === "extra" && this.userType === "COACHED")
                    status = "extra";
                else if (interpretation === "redundant")
                    status = "redundant";
                else
                    status = "irrelevant";
                incorrectSequence.push({id: nodePart, attribute: "message", value: this._getMessage(nodePart, status)});
            }
            
            // Builds part of table that addresses demo responses.
            var lastFailureSequence = [
                {id: nodePart, attribute: "status", value: "demo"},
                {id: nodePart, attribute: "disabled", value: true},
                {id: nextPart, attribute: "disabled", value: false}
            ];
            if (this.userType === "COACHED" || this.userType === "feedback") {
                lastFailureSequence.push({id: nodePart, attribute: "message", value: this._getMessage(nodePart, "lastFailure")});
            }
            
            // Put table together.
            var table = {
                optimal: {COACHED: correctSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
                notTopLevel: {COACHED: notTopLevelSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
                premature: {COACHED: prematureSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
                initialValue: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
                extraValue: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
                irrelevant: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
                redundant: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
                lastFailure: {COACHED: lastFailureSequence, feedback: lastFailureSequence, TEST: lastFailureSequence, power: lastFailureSequence}
            };

            return table;
        },
        getInterpretation: function(/*string*/ id, /*string*/ nodePart, /*string*/ answer) {
            // Summary: Returns the interpretation of a given answer (correct, 
            //      incorrect, etc. and sets the status in the return object
            //
            // Tags: Private
            var interpretation = null;
            if (nodePart === "description") {
                id = this.model.getNodeIDByDescription(answer);
            }
            if (this.model.student.isInExtras(id)) {
                array.forEach(this.model.getExtraDescriptions(), function(extra) {
                    if (answer === extra.ID && extra.type === "initial") {
                        interpretation = "initialValue";
                        this.initialCounter++;
                    } else if (answer === extra.ID && extra.type === "extra") {
                        interpretation = "extraValue";
                        this.extraCounter++;
                    } else if (answer === extra.ID && extra.type === "model") {
                        interpretation = "irrelevant";
                        this.irrelevantCounter++;
                    }
                });
            } else if (this.model.isNodeVisible(id)) {
                interpretation = "redundant";
                this.redundantCounter++;
            } else if (this.model.isParentNode(id) || this.model.isNodesParentVisible(id)) {
                interpretation = "optimal";
                this.correctCounter++;
            } else if (this.model.student.getNodes().length === 0) {
                interpretation = "notTopLevel";
                this.notTopLevelCounter++;
            } else {
                interpretation = "premature";
                this.prematureCounter++;
            }
            if (interpretation !== "optimal" && this.descriptionCounter === 2) {
                interpretation = "lastFailure";
                this.lastFailureCounter++;
            }
            return interpretation;
        },
        setUserType: function(/*string*/ subMode) {
            // Summary: Sets the user mode; used by the constructor, but also
            //      allows the mode to be updated dynamically.
            if (this.mode === "STUDENT") {
                this.userType = subMode;
            } else {
                this.userType = this.mode;
            }
        },

	newAction: function() {
            //Summary:  Settings for the node editor for a new node
            //          It assumes everything has been enabled and has no colors
            // Policy: disable all but the description on new node
            // BvdS: might want to also activate type in TEST mode
            var controls = ["type", "initial", "units", "inputs", "equation"];
            return array.map(controls, function(control){
		return {id: control, attribute: "disabled", value: true};
            });
	},

        /**
         * 
         * Currently all of the nodes are essentially copies of descriptionAction()
         *      but with a supplied answer so that it can return something; they 
         *      will be updated soon.
         * 
         **/
        descriptionAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation(id, "description", answer);
            var table = this._getPedagogicalTable(id, "description", interpretation);
            console.log("in description:", interpretation, this.userType, table);
            return table[interpretation][this.userType];
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.userType];
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.userType];
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.userType];
        },
        inputsAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.userType];
        },
        equationAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this.getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.userType];
        }
    });
});
