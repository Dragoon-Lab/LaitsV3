
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
    var counter = {correct: 0, notTopLevel: 0, premature: 0, initial: 0, extra: 0, irrelevant: 0, redundant: 0, lastFailure: 0, lastFailure2: 0};

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
    function _getPedagogicalTable(/*string*/ id, /*string*/ nodePart, /*string*/ mode, /*string*/ interpretation) {
        // Summary: Builds and returns the pedagogical table
        // 
        // Tags: Private
        //
        // Note: This function is under construction--it will likely be arranged differently

        //var nextPart = _getNextPart(id, nodePart);

        // Builds part of table that addresses correct responses.
        var correctSequence = [
            {id: nodePart, attribute: "status", value: "correct"},
            {id: nodePart, attribute: "disabled", value: true},
            //{id: nextPart, attribute: "disabled", value: false}
        ];
        if (mode === "COACHED" || mode === "feedback")
            correctSequence.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, "correct")});

        // Builds part of table that addresses correct responses that are given early.
        var notTopLevelSequence = [
            {id: nodePart, attribute: "status", value: "premature"},
            {id: nodePart, attribute: "disabled", value: false}
        ];
        if (mode === "COACHED" || mode === "feedback")
            notTopLevelSequence.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, "notTopLevel")});

        // Builds part of table that addresses other premature responses.
        var prematureSequence = [
            {id: nodePart, attribute: "status", value: "premature"},
            {id: nodePart, attribute: "disabled", value: false}
        ];
        if (mode === "COACHED" || mode === "feedback")
            prematureSequence.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, "premature")});

        // Builds part of table that addresses incorrect responses.
        var incorrectSequence = [
            {id: nodePart, attribute: "status", value: "incorrect"},
            {id: nodePart, attribute: "disabled", value: false}
        ];
        if (mode === "COACHED" || mode === "feedback") {
            var status;
            if (interpretation === "initial")
                status = "initial";
            else if (interpretation === "extra" && mode === "COACHED")
                status = "extra";
            else if (interpretation === "redundant")
                status = "redundant";
            else
                status = "irrelevant";
            incorrectSequence.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, status)});
        }

        // Builds part of table that addresses demo responses.
        var lastFailureSequence = [
            {id: nodePart, attribute: "status", value: "demo"},
            {id: nodePart, attribute: "disabled", value: true},
            //{id: nextPart, attribute: "disabled", value: false}
        ];
        if (mode === "COACHED" || mode === "feedback") {
            lastFailureSequence.push({id: nodePart, attribute: "message", value: _getMessage(nodePart, "lastFailure")});
        }

        // Put table together.
        var table = {
            correct: {COACHED: correctSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
            optimal: {COACHED: correctSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
            notTopLevel: {COACHED: notTopLevelSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
            premature: {COACHED: prematureSequence, feedback: correctSequence, TEST: correctSequence, power: correctSequence},
            incorrect: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
            initialValue: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
            extraValue: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
            irrelevant: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
            redundant: {COACHED: incorrectSequence, feedback: incorrectSequence, TEST: incorrectSequence, power: incorrectSequence},
            lastFailure: {COACHED: lastFailureSequence, feedback: lastFailureSequence, TEST: lastFailureSequence, power: lastFailureSequence}
        };

        return table;

    /**
     * 
     * Class construction
     * 
     **/


    return declare(null, {
        constructor: function(/*string*/ mode, /*string*/ subMode, /*model.js object*/ model) {
            this.model = model;
            this.mode = mode;
            this.subMode = subMode;
            this.matchingID = null;
        },
        _getInterpretation: function(/*string*/ id, /*string*/ nodePart, /*string*/ answer) {
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
            }
            return interpretation;
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
                    alert(nextPart);
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
                    if (this.model.given.getinputs(givenNodeID) !== null)
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
        /**
         * 
         * Currently all of the nodes are essentially copies of descriptionAction()
         *      but with a supplied answer so that it can return something; they 
         *      will be updated soon.
         * 
         **/
        descriptionAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation(id, "description", answer);
            var table = _getPedagogicalTable(id, "description", this.mode, interpretation);
            var returnObj = table[interpretation][this.mode];
            if (interpretation === "optimal") {
                returnObj.push({id: this._getNextPart(null, "description"), attribute: "disabled", value: false});
            }
            returnObj.push({id: "description", attribute: "descriptionID", value: this.matchingID});
            return returnObj;
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            var newID = this.model.student.getDescriptionID(id);
            var interpretation = this._getInterpretation(newID, "type", answer);
            var table = _getPedagogicalTable(newID, "type", this.mode, interpretation);
            var returnObj = table[interpretation][this.mode];
            if (interpretation === "correct") {
                returnObj.push({id: this._getNextPart(newID, "type"), attribute: "disabled", value: false});
            }
            return returnObj;
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.mode];
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.mode];
        },
        inputsAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.mode];
        },
        equationAction: function(/*string*/ id, /*string*/ answer) {
            var interpretation = this._getInterpretation("id2", "description", "The number of rabbits born each month");
            var table = this._getPedagogicalTable(id, "description", interpretation);
            return table[interpretation][this.mode];
        }
    });
});
