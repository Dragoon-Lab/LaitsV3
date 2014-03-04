/* global define */
/**
 *
 * Pedagogical Module class used to solve Dragoon problems
 * @author: Brandon Strong
 *
 **/

/**
 * Pedagogical module that accepts student entries, updates the model, and returns an object
 * with the id of the node, a message with encouragement or a hint, and the status of the 
 * attempt (correct, incorrect, demo, or premature).
 **/

define([
    "dojo/_base/array", "dojo/_base/declare", "./equation_check", "parser/parser"
], function(array, declare, check, Parser) {

    return declare(null, {
        constructor: function(/*string*/ mode, /*model.js object*/ model) {

            /*
             Redesign of pedagogical model in process; functions that are called by 
             other files should stay the same 
             */

            /*
             Need further clarification on the feedback and user; also need to implement 
             switching between the two
             */

            this.setMode(mode);
            this.returnObject = new Object;
            this.mode = null;
            this.model = model;
            this.message = "";
            this.descriptionOn = true;
            this.typeOn = false;
            this.initialOn = false;
            this.unitsOn = false;
            this.inputsOn = false;
            this.addAsPlusButton = false;
            this.addAsMinusButton = false;
            this.descriptionCounter = 0;
            this.description_jCounter = 0;
            this.description_hCounter = 0;
            this.description_gCounter = 0;
            this.description_cCounter = 0;
            this.description_dCounter = 0;
            this.description_bCounter = 0;
            this.description_lCounter = 0;
            this.type_iCounter = 0;
            this.initial_jCounter = 0;
            this.units_jCounter = 0;
            this.inputsCounter = 0;
            this.inputs_jCounter = 0;
            this.inputs_hCounter = 0;
            this.inputs_gCounter = 0;
            this.inputs_cCounter = 0;
            this.inputs_dCounter = 0;
            this.inputs_bCounter = 0;
            this.inputs_lCounter = 0;
            this.lastNodeOpened = null; //used to track inputs attempts in inputsAction();
        },
        mode: null,
	hints: {
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
		notInModel: [
                    "You tried to define a parameter for a number you read in the problem.  Not all numbers in the problem statement are necessary for the model.  You will save effort if you follow the Target Node Strategy, which says you should start by defining a node for a quantity that the problem asks you to graph, then define nodes for its inputs, and then define nodes for their inputs, etc.  That way, every node you create is an input to some node.",
                    "Not every number in the problem statement is necessary for the model.  You should define a node for a quantity only when either (1) it is required as input to a previously defined node, or (2) the problem statement asks you to graph it.",
                    "Please be sure you need a node before defining it.  Even if a number appears in the problem statement, it may not be needed in the model."
		],
		exists: [
                    "A node already exists for that quantity.  If you want to edit it, click on it."
		]
	    },
	    premature: [
                    "Blue means that the quantity is relevant for modeling the system, but it is not yet time to define it.  You should follow the Target Node Strategy, which says you should edit an existing node that is not yet defined.  Such nodes have dotted outlines.  Click on one to edit it.",
                    "Blue means that according to the Target Node Strategy, it is too early to define a node for this quantity.  Edit a node that has a dotted outline.",
                    "Blue means premature.  Edit a node with a dotted outline instead."
	    ],
	    blue: [
                "Blue means that quantity isn’t one that the problem statement asks you to graph.  Although this quantity will eventually be in your model, you should follow the Target Node Strategy, which says you should first define a node for a top level goal quantity.",
                "Please start with a quantity mentioned in the problem statement as one that needs to be graphed."
	    ],
	    correct: [
                "Green means correct.  Good job!",
                "Green means correct."
	    ],
	    demo: {
		irrelevant: [
                    "Sorry, but that quantity isn’t relevant to the model.  Moreover, this is the third failure, so a correct selection is being done for you.  Please study it and figure out why it is correct.  Your goal should be to make a correct selection on the first attempt.",
                    "Here’s a correct solution.  Please figure out why it is correct so that next time, your first selection will be correct.",
                    "Please study this correct selection."
		],
		many: [
                    "Yellow means that you made an incorrect choice too many times, so you are being shown the correct choice.  You should figure out why it is correct so that next time your first choice will be correct.",
                    "Can you figure out why this is the right type for the node?"
		]
	    }
	},
        _getType: function(/*string*/ expression) {
            //Summary: determines the sub type of a node with type "function"
            //
            //Tags: private
            var expr = Parser.parse(expression);
            var variables = expr.variables();
            var sum = 0, product = 0;
            for (var i = 0; i < expr.tokens.length; i++)
                if (!this._contains(expr.tokens[i], variables))
                    if (expr.tokens[i] == '+' || expr.tokens[i] == '-')
                        sum++;
                    else if (expr.tokens[i] == '*')
                        product++;
                    else
                        return "hidden function";
            if (sum > 0 && product === 0)
                return "sum";
            if (sum === 0 && product > 0)
                return "product";
            return "hidden function";
        },
        _contains: function(/*variable | object*/ theVariable, /*variable | object*/ theArray) {
            //Summary: returns true if the supplied array contains the supplied variable or object
            //
            //Tags: private
            for (var i = 0; i < theArray.length; i++)
                if (theVariable == theArray[i])
                    return true;
            return false;
        },
        _getReturnObject: function(/*string*/ id, /*string*/ infoObject, /*string*/ control) {
            //Summary: activates/deactives the parts of the node based on what 
            //      part the user is at and the type (mode) of user (i.e. coached, feedback, etc.)
            //
            //Tags: private

            var nodeParts = new Array("description", "type", "initial", "units", "inputs", "equation");
            var neededControls = new Array("description", "type");

            // Only enable/disable parts needed in the model (present in the given model)
            // Parts not needed should be disabled when the window is opened.
            // Pehaps this list should be populated when the node editor is opened.
	    var givenID = this.model.student.getDescriptionID(id);
            if (this.model.given.getInitial(givenID))
                neededControls.push("initial");
            if (this.model.given.getUnits(givenID))
                neededControls.push("units");
            if (this.model.given.getInputs(givenID))
                neededControls.push("inputs");
            if (this.model.given.getEquation(givenID))
                neededControls.push("equation");

            //If student should move on to the next part (i.e. status = correct or demo)
            //      activate next part(s), otherwise mark current part as still active
            //See documentation/major-modes.md for details.
            var activateRemaining = false;
            array.forEach(neededControls, function(neededControl) {
                if (control === neededControl) {
                    if (infoObject.status === "correct" || infoObject.status === "demo") {
                        if (control !== nodeParts[nodeParts.length - 1]) {
                            infoObject[nodeParts[i + 1] + "On"] = true;
                            if (control !== "description" && (this.userType === "feedback" || this.userType === "test" || this.userType === "power"))
                                /*
                                 According to the pedagogical model document, if certain users 
                                 get an answer correct, we should activate the remaining parts 
                                 of the node after "type".
                                 */
                                activateRemaining = true;
                        }
                    } else {
                        infoObject.push({id: neededControl, attribute: "disabled", value: false});
                    }
                } else if (activateRemaining) {
                    infoObject.push({id: neededControl, attribute: "disabled", value: false});
                }
            });

            return infoObject;
        },
        setMode: function(/*string*/ userMode) {
            // Summary: Sets the user mode; used by the constructor, but also
            //      allows the mode to be updated dynamically by the pedagogical module.
            if (userMode === "student" || userMode === "power") {
                console.log("User type was input as " + userMode + ". Currently this is being set to feedback.");
                this.mode = "feedback";
            } else {
                this.mode = userMode;
            }
        },
        openAction: function(/*string*/ id) {
            //Summary: Call this when opening the node editor to set controls.
	    //         id is the student node ID.
            //Note: The controller has already created the model node.
            var infoObject = Array();
            return this._getReturnObject(id, infoObject);
        },
        newDescriptionAction: function(/*string*/ id, /*string*/ choice) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //         and returns a list of directives; id is the student node id.
            //Note: Each choice is labeled by either a node ID (for choices that
            //      correspond to nodes in the given model) or other label (for disctractors).

            //The array that that will be returned
            var infoObject = Array();
            var control = "description";  

            //pedagogicalTable assigns the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var pedagogicalTable = {
                optimal: {coached: "ijno", feedback: "ijno", test: "ino", power: "ino"},
                notTopLevel: {coached: "fhm", feedback: "ijno", test: "ino", power: "ino"},
                premature: {coached: "fgm", feedback: "ijno", test: "ino", power: "ino"},
                initialValue: {coached: "acm", feedback: "acm", test: "am", power: "am"},
                extraValue: {coached: "adm", feedback: "abm", test: "am", power: "am"},
                irrelevant: {coached: "abm", feedback: "abm", test: "am", power: "am"},
                redundant: {coached: "aem", feedback: "aem", test: "aem", power: "aem"},
                lastFailure: {coached: "klno", feedback: "klno", test: "kno", power: "kno"}
            };

            var sequence;
        },
        descriptionAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //         and returns a list of directives; id is the student node id.
            //Note: Each choice is labeled by either a node ID (for choices that
            //      correspond to nodes in the given model) or other label (for disctractors).

            //The array that that will be returned
            var infoObject = Array();
            var control = "description";  

            //pedagogicalTable assigns the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var pedagogicalTable = {
                optimal: {coached: "ijno", feedback: "ijno", test: "ino", power: "ino"},
                notTopLevel: {coached: "fhm", feedback: "ijno", test: "ino", power: "ino"},
                premature: {coached: "fgm", feedback: "ijno", test: "ino", power: "ino"},
                initialValue: {coached: "acm", feedback: "acm", test: "am", power: "am"},
                extraValue: {coached: "adm", feedback: "abm", test: "am", power: "am"},
                irrelevant: {coached: "abm", feedback: "abm", test: "am", power: "am"},
                redundant: {coached: "aem", feedback: "aem", test: "aem", power: "aem"},
                lastFailure: {coached: "klno", feedback: "klno", test: "kno", power: "kno"}
            };

            var sequence;

            //assign the action based on the answer
            if (!this.model.given.isNode(id)) {
                for (var i = 0; i < this.model.getExtraDescriptions.length; i++) {
                    if (id === this.model.getExtraDescriptions("initial")[i].ID)
                        sequence = pedagogicalTable["initialValue"][this.userType];
                    else if (id === this.model.getExtraDescriptions("extra")[i].ID)
                        sequence = pedagogicalTable["extraValue"][this.userType];
                    else
                        sequence = pedagogicalTable["irrelevant"][this.userType];
                }
            } else if (this.model.isNodeVisible(id)) {
                sequence = pedagogicalTable["redundant"][this.userType];
            } else if (this.model.isParentNode(id) || this.model.isNodesParentVisible(id)) {
                sequence = pedagogicalTable["optimal"][this.userType];
            } else if (this.model.student.getNodes().length == 0) {
                sequence = pedagogicalTable["notTopLevel"][this.userType];
            } else
                sequence = pedagogicalTable["premature"][this.userType];
            if (sequence !== pedagogicalTable["optimal"][this.userType] && this.descriptionCounter === 2) {
                sequence = pedagogicalTable["lastFailure"][this.userType];
            }

            //take the appropriate action
            switch (sequence) {
                case "ijno": // i: color green; j: message; n: disable description menu; o: enable type menu
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    // BvdS:  These are done by controller
                    // this.model.addStudentNodeWithName(this.model.getName(id));
                    // this.model.setStudentNodeSelection(id, "description", answer);
                    this.model.incrementDescriptionAttemptCount(id, this.descriptionCounter);
                    if (this.description_jCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Green means correct. Good job!"});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Green means correct."});
                    this.description_jCounter++;
                    this.descriptionOn = false;
                    this.typeOn = true;
                    this.descriptionCounter = 0;
                    break;
                case "ino": // i: color green; n: disable description menu; o: enable type menu
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    this.model.addStudentNodeWithName(this.model.getName(id));
                    this.model.setStudentNodeSelection(id, "description", answer);
                    this.model.incrementDescriptionAttemptCount(id);
                    this.description_jCounter++;
                    this.descriptionOn = false;
                    this.typeOn = true;
                    this.descriptionCounter = 0;
                    break;
                case "fhm": // f: color blue; h message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "premature"});
                    if (this.description_hCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that quantity isn’t one that the problem statement " +
                                    "asks you to graph. Although this quantity will eventually be in " +
                                    "your model, you should follow the Target Node Strategy, which says " +
                                    "you should first define a node for a top level goal quantity."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please start with a quantity mentioned in the problem statement as one that needs to be graphed."});
                    this.description_hCounter++;
                    this.descriptionCounter++;
                    break;
                case "fgm": // f: color blue; g: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "premature"});
                    if (this.description_gCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that the quantity is relevant for modeling the system, " +
                                    "but it is not yet time to define it. You should follow the Target " +
                                    "Node Strategy, which says you should edit an existing node that is " +
                                    "not yet defined. Such nodes have dotted outlines. Click on one to edit it."});
                    else if (this.description_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that according to the Target Node Strategy, it is too early to" +
                                    "define a node for this quantity. Edit a node that has a dotted outline."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Blue means premature. Edit a node with a dotted outline instead."});
                    this.description_gCounter++;
                    this.descriptionCounter++;
                    break;
                case "acm": // a: color red; d: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.description_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "You tried to define a parameter for the initial value of an accumulator" +
                                    "This is unnecessary, because you can put the initial value for the " +
                                    "accumulator right into the definition of the accumulator itself."});
                    else if (this.description_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "That should be the initial value of an accumulator, not a parameter node."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "That should be the initial value of an accumulator."});
                    this.description_cCounter++;
                    this.descriptionCounter++;
                    break;
                case "am": // a: color red; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    this.model.setStudentNodeSelection(id, "description", answer);
                    this.descriptionCounter++;
                    break;
                case "adm": // a: color red; d: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.description_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "You tried to define a parameter for a number you read in the problem. " +
                                    "Not all numbers in the problem statement are necessary for the model. " +
                                    "You will save effort if you follow the Target Node Strategy, which " +
                                    "says you should start by defining a node for a quantity that the " +
                                    "problem asks you to graph, then define nodes for its inputs, and then " +
                                    "define nodes for their inputs, etc. That way, every node you create is " +
                                    "an input to some node."});
                    else if (this.description_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Not every number in the problem statement is necessary for the model. " +
                                    "You should define a node for a quantity only when either (1) it is " +
                                    "required as input to a previously defined node, or (2) the problem " +
                                    "statement asks you to graph it."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please be sure you need a node before defining it. Even if a number " +
                                    "appears in the problem statement, it may not be needed in the model."});
                    this.description_dCounter++;
                    this.descriptionCounter++;
                    break;
                case "abm": //a: color red; b: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.description_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "The quantity is irrelevant to this problem. Choose a different one."});
                    else if (this.description_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "This quantity is irrelevant for modeling the system. Try again."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Irrelevant. Try again."});
                    this.description_bCounter++;
                    this.descriptionCounter++;
                    break;
                case "aem": //a: color red; e: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    infoObject.push({id: control, attribute: "message", value: "A node already exists for that quantity. If you want to edit it, click on it."});
                    this.descriptionCounter++;
                    break;
                case "klno": //k: color yellow and give optimal solution; l: message; n: disable description menu; o: activate "Type"
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    id = this.model.getOptimalNode();
                    infoObject.ID = id;
                    this.model.addStudentNodeWithName(this.model.getName(id));
                    this.model.setToDemo(id, "description");
                    if (this.description_lCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Sorry, but that quantity isn’t relevant to the model. Moreover, " +
                                    "this is the third failure, so a correct selection is being made for " +
                                    "you. Please study it and figure out why it is correct. Your goal " +
                                    "should be to make a correct selection on the first attempt."});
                    else if (this.description_lCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Here’s a correct solution. Please figure out why it is correct " +
                                    "so that next time, your first selection will be correct."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please study this correct selection."});
                    this.description_lCounter++;
                    this.model.incrementDescriptionAttemptCount(id);
                    this.descriptionCounter = 0;
                    break;
                case "kno":  //k: color yellow and give optimal solution; n: disable description menu; o: activate "Type"
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    id = this.model.getOptimalNode();
                    infoObject.ID = id;
                    this.model.addStudentNodeWithName(this.model.getName(id));
                    this.model.setToDemo(id, "description");
                    this.model.incrementDescriptionAttemptCount(id);
                    this.descriptionCounter = 0;
                    break;
            }
            return this._getReturnObject(id, infoObject, control);
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //         and returns a list of directives; id is the student node ID.

            //The array that that will be returned
            var infoObject = Array();
            var control = "type"; 

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var correct = {coached: "bfgk", feedback: "behk", test: "ceh", power: "ceh"};
            var firstFailure = {coached: "aje", feedback: "aje", test: "ceh", power: "ceh"};
            var secondFailure = {coached: "difg", feedback: "difg", test: "ceh", power: "ceh"};
            var additionalFailure = {coached: null, feedback: null, test: "ceh", power: "ceh"};

            var pedagogicalTable = {correct: correct, firstFailure: firstFailure, secondFailure: secondFailure,
                additionalFailure: additionalFailure};

            var sequence;
            var correctType = this.model.getType(id);

            if (correctType === "function")
                correctType = this._getType(this.model.given.getEquation(id));

            //allowed anwers include parameter, accumulator, sum, product, and power user
            //      but the model only accepts parameter, accumulator, and function; these
            //      7 lines convert the type allow comparisons and to write to the model
            if (answer === "sum" || answer === "product" || answer === "hidden function") {
                if (answer === correctType)
                    this.model.setStudentNodeSelection(id, "type", "function");
                else
                    this.model.setStudentNodeSelection(id, "type", "null");
            }
            else
                this.model.setStudentNodeSelection(id, "type", answer);

            //assign the action based on the answer
            if (answer === correctType) {
                sequence = pedagogicalTable["correct"][this.userType];
            } else if (this.model.getNodeAttemptCount(id, "type") < 2) {
                sequence = pedagogicalTable["firstFailure"][this.userType];
            } else if (this.model.getNodeAttemptCount(id, "type") < 3) {
                sequence = pedagogicalTable["secondFailure"][this.userType];
            } else
                sequence = pedagogicalTable["additionalFailure"][this.userType];

            //take the appropriate action
            switch (sequence) {
                case "bfgk": // b: color green; f: freeze type widget; g: enable next widget based on selection; k: message
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    this.typeOn = false;
                    if (correctType === "accumulator" || correctType === "parameter")
                        this.initialOn = true;
                    else
                        this.unitsOn = true;
                    infoObject.push({id: control, attribute: "message", value: "Green means correct. Well Done!"});
                    break;
                case "behk": // b: color green; e: leave type widget open; g: enable next widget based on selection; k: message
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    if (correctType === "accumulator" || correctType === "parameter") {
                        this.initialOn = true;
                        this.unitsOn = false;
                    } else {
                        this.initialOn = false;
                        this.unitsOn = true;
                    }
                    infoObject.push({id: control, attribute: "message", value: "Green means correct. Well Done!"});
                    break;
                case "ceh": // c: leave selection white; e: leave type widge open; h: enable next widget based on selection
                    infoObject.status = null;
                    if (correctType === "accumulator" || correctType === "parameter") {
                        this.initialOn = true;
                        this.unitsOn = false;
                    } else {
                        this.initialOn = false;
                        this.unitsOn = true;
                    }
                    break;
                case "aje": // a: color red; j: hint; e: leave type widget open
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    //the following hints may be changed if the author is allowed to set his/her own hints
                    if (this.model.getType(id) === "function")
                        //currently the only action that will be taken within this "if" statement is the final "else" clause
                        if (answer === "sum")
                            infoObject.push({id: control, attribute: "message", value: "That is incorrect. Remember, with \"" +
                                        this.model.getName(id) + "\" you will need " +
                                        "to multiply other nodes to determine its solution."});
                        else if (answer === "product")
                            infoObject.push({id: control, attribute: "message", value: "That is incorrect. Remember, with \"" +
                                        this.model.getName(id) + "\" you will need " +
                                        "to add other nodes to determine its solution."});
                        else
                            infoObject.push({id: control, attribute: "message", value: "That is incorrect. Remember, with \"" +
                                        this.model.getName(id) + "\" you will need " +
                                        "use other nodes to determine its solution."});
                    else if (correctType === "parameter")
                        infoObject.push({id: control, attribute: "message", value: "That is incorrect. Remember, \"" +
                                    this.model.getName(id) + "\" has a fixed value."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "That is incorrect. Remember, \"" +
                                    this.model.getName(id) + "\" starts with one " +
                                    "value, which then changes over time based on its other inputs."});
                    break;
                case "difg": // d: color yellow; i: message; f: freeze type widget; g: enable next widget based on selection
                    this.model.setToDemo(id, "type");
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    if (this.type_iCounter < 1) {
                        infoObject.push({id: control, attribute: "message", value: "Yellow means that you made an incorrect " +
                                    "choice too many times, so you are being shown the correct " +
                                    "choice. You should figure out why it is correct so that " +
                                    "next time your first choice will be correct."});
                        this.type_iCounter++;
                    } else
                        infoObject.push({id: control, attribute: "message", value: "Can you figure out why this is the right type for the node?"});
                    this.typeOn = false;
                    if (correctType === "accumulator")
                        this.initialOn = true;
                    else
                        this.unitsOn = true;
                    break;
            }
            return this._getReturnObject(id, infoObject, control);
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //         and returns a list of directives; id is the student node ID.

            //The array that that will be returned
            var infoObject = Array();
            var control = "initial";  // Should match control id in index.html

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var correct = {coached: "beg", feedback: "bfh", test: "bfh", power: "bfh"};
            var firstFailure = {coached: "aif", feedback: "aif", test: "c", power: "c"};
            var secondFailure = {coached: "degj", feedback: "djeh", test: "c", power: "c"};
            var additionalFailure = {coached: null, feedback: null, test: "c", power: "c"};

            var pedagogicalTable = {correct: correct, firstFailure: firstFailure, secondFailure: secondFailure,
                additionalFailure: additionalFailure};

            var sequence;
            var correctInitial = this.model.given.getInitial(id);

            this.model.setStudentNodeSelection(id, "initial", answer);

            //if the initial entry is blank, the user may put anything in it and continue, if it
            //      is not blank then the user must enter the correct initial value; this is for
            //      a possible future feature; if an initial entry is not needed (i.e. the type
            //      is a parameter or a function) then initial is skipped altogether
            if (correctInitial === null) {
                infoObject.push({id: control, attrubute: "status", value: "correct"});
                if (this.model.getNodeUnits !== null)
                    this.unitsOn = true;
                else
                    this.inputsOn = true;
            } else {
                //assign the action based on the answer
                if (answer === correctInitial) {
                    sequence = pedagogicalTable["correct"][this.userType];
                } else if (this.model.getNodeAttemptCount(id, "initial") < 2) {
                    sequence = pedagogicalTable["firstFailure"][this.userType];
                } else if (this.model.getNodeAttemptCount(id, "initial") < 3) {
                    sequence = pedagogicalTable["secondFailure"][this.userType];
                } else
                    sequence = pedagogicalTable["additionalFailure"][this.userType];

                //take the appropriate action
                switch (sequence) {
                    case "beg": // b: color green; f: freeze widget; g: enable next widget
                        infoObject.push({id: control, attrubute: "status", value: "correct"});
                        this.initialOn = false;
                        if (this.model.getNodeUnits(id) !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "bfh": // b: color green; f: leave widget active; g: enable next widget
                        infoObject.push({id: control, attrubute: "status", value: "correct"});
                        if (this.model.getNodeUnits(id) !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "aif": // a: color red; i: hint; g: leave widget active
                        infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                        //hint
                        break;
                    case "c": // c: leave the widget white
                        break;
                    case "degj": // d: mark yellow and give answer; e: freeze widget; enable next widget; j: message
                        infoObject.push({id: control, attrubute: "status", value: "demo"});
                        this.model.setToDemo(id, "initial");
                        if (this.initial_jCounter < 1)
                            infoObject.push({id: control, attribute: "message", value: "Yellow means that you made an incorrect " +
                                        "choice too many times, so you are being shown the correct " +
                                        "choice.  You should figure out why it is correct so that " +
                                        "next time your first choice will be correct."});
                        else
                            infoObject.push({id: control, attribute: "message", value: "Can you figure out why this is the right initial value for the quantity?"});
                        this.initial_jCounter++;
                        this.initialOn = false;
                        if (this.model.getNodeUnits !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "djeh": // d: mark yellow and give answer; j: message; e: freeze widget; h: enable all widgets for the nodes type;
                        infoObject.push({id: control, attrubute: "status", value: "demo"});
                        this.model.setToDemo(id, "initial");
                        if (this.initial_jCounter < 1)
                            infoObject.push({id: control, attribute: "message", value: "Yellow means that you made an incorrect " +
                                        "choice too many times, so you are being shown the correct " +
                                        "choice.  You should figure out why it is correct so that " +
                                        "next time your first choice will be correct."});
                        else
                            infoObject.push({id: control, attribute: "message", value: "Can you figure out why this is the right initial value for the quantity?"});
                        this.initial_jCounter++;
                        this.initialOn = false;
                        if (this.model.getNodeUnits !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                }
            }
            return this._getReturnObject(id, infoObject, control);
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //         and returns a list of directives; 
	    //         unitsAction() is similar to initialAction();
	    //         id is the student node ID.

            //The array that that will be returned
            var infoObject = Array();
            var control = "units";  // Should match control id in index.html

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var correct = {coached: "beg", feedback: "bfh", test: "bfh", power: "bfh"};
            var firstFailure = {coached: "aif", feedback: "aif", test: "c", power: "c"};
            var secondFailure = {coached: "degj", feedback: "djeh", test: "c", power: "c"};
            var additionalFailure = {coached: null, feedback: null, test: "c", power: "c"};

            var pedagogicalTable = {correct: correct, firstFailure: firstFailure, secondFailure: secondFailure,
                additionalFailure: additionalFailure};

            var sequence;
            var correctUnits = this.model.getNodeUnits(id);

            this.model.setStudentNodeSelection(id, "units", answer);

            //assign the action based on the answer
            if (answer === correctUnits) {
                sequence = pedagogicalTable["correct"][this.userType];
            } else if (this.model.getNodeAttemptCount(id, "units") < 2) {
                sequence = pedagogicalTable["firstFailure"][this.userType];
            } else if (this.model.getNodeAttemptCount(id, "units") < 3) {
                sequence = pedagogicalTable["secondFailure"][this.userType];
            } else
                sequence = pedagogicalTable["additionalFailure"][this.userType];

            //take the appropriate action
            switch (sequence) {
                case "beg": // b: color green; f: freeze widget; g: enable next widget
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
                case "bfh": // b: color green; f: leave widget active; g: enable next widget
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    if (correctUnits !== null)
                        this.unitsOn = true;
                    else
                        this.inputsOn = true;
                    break;
                case "aif": // a: color red; i: hint; g: leave widget active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    infoObject.push({id: control, attribute: "message", value: "The units variable should relate to the quantity being measured. Think about the node \"" +
                                this.model.getName(id) + "\". What unit would pertain to this node?"});
                    break;
                case "c": // c: leave the widget white
                    break;
                case "degj": // d: mark yellow and give answer; e: freeze widget; enable next widget; j: message
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    this.model.setToDemo(id, "units");
                    if (this.units_jCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Yellow means that you made an incorrect " +
                                    "choice too many times, so you are being shown the correct " +
                                    "choice.  You should figure out why it is correct so that " +
                                    "next time your first choice will be correct."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Can you figure out why this is the right units value for the quantity?"});
                    this.units_jCounter++;
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
                case "djeh": // d: mark yellow and give answer; j: message; e: freeze widget; h: enable all widgets for the nodes type;
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    this.model.setToDemo(id, "units");
                    if (this.units_jCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Yellow means that you made an incorrect " +
                                    "choice too many times, so you are being shown the correct " +
                                    "choice.  You should figure out why it is correct so that " +
                                    "next time your first choice will be correct."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Can you figure out why this is the right units value for the quantity?"});
                    this.units_jCounter++;
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
            }
            return this._getReturnObject(id, infoObject, control);
        },
        inputsAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts a description that the student provides, checks its 
	    //         validity and returns a list of directives; id is the
	    //         student node ID.

            //The array that that will be returned
            var infoObject = Array();
            var control = "inputs";  // Should match control id in index.html

            if (this.lastNodeOpened !== id) {
                this.lastNodeOpened = id;
                this.inputsCounter = 0;
            }

            var inputID = this.model.getNodeIDByDescription(answer);

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var optimal = {coached: "ijno", feedback: "ijno", test: "qo", power: "qo"};
            var premature = {coached: "fgm", feedback: "io", test: "qo", power: "qo"};
            var initialValue = {coached: "acm", feedback: "acm", test: "qo", power: "qo"};
            var extraValue = {coached: "adm", feedback: "abm", test: "qo", power: "qo"};
            var irrelevant = {coached: "ahm", feedback: "ahm", test: "qo", power: "qo"};
            var redundant = {coached: "aem", feedback: "aem", test: "am", power: "am"};
            var lastFailure = {coached: "klno", feedback: "klno", test: "qo", power: "qo"};

            var pedagogicalTable = {optimal: optimal, premature: premature,
                initialValue: initialValue, extraValue: extraValue, irrelevant: irrelevant,
                redundant: redundant, lastFailure: lastFailure};

            var sequence;

            //assign the action based on the answer
            if (inputID === null) {
                for (var i = 0; i < this.model.getExtraDescriptions.length; i++) {
                    if (answer === this.model.getExtraDescriptions("initial")[i])
                        sequence = pedagogicalTable["initialValue"][this.userType];
                    else if (answer === this.model.getExtraDescriptions("extra")[i])
                        sequence = pedagogicalTable["extraValue"][this.userType];
                    else
                        sequence = pedagogicalTable["irrelevant"][this.userType];
                }
            } else if (this.model.isNodeInput(id, inputID)) {
                sequence = pedagogicalTable["redundant"][this.userType];
            } else if (this.model.isNodeInput(id, inputID)) {
                sequence = pedagogicalTable["optimal"][this.userType];
            } else
                sequence = pedagogicalTable["premature"][this.userType];
            if (sequence !== pedagogicalTable["optimal"][this.userType] && this.inputsCounter === 2) {
                sequence = pedagogicalTable["lastFailure"][this.userType];
            }

            //take the appropriate action
            switch (sequence) {
                case "ijno": // i: color green; j: message; n: freeze inputs (implemented after all 
                    // inputs are visible--needs discussion due to extra inputs); o: enable "+ input" and "- input" buttons
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    this.model.addStudentNodeWithName(this.model.getName(inputID));
                    this.model.setStudentNodeSelection(inputID, "description", answer);
                    this.model.incrementescriptionAttemptCount(inputID);
                    if (this.inputs_jCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Green means correct. Good job!"});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Green means correct."});
                    this.inputs_jCounter++;
                    if (this.model.areNodeInputsVisible(id))
                        this.inputsOn = false;
                    this.addAsPlusButton = true;
                    this.addAsMinusButton = true;
                    this.inputsCounter = 0;
                    break;
                case "qo": // q: leave input menu white; o: enable "+ input" and "- input" buttons
                    this.addAsPlusButton = true;
                    this.addAsMinusButton = true;
                    break;
                case "io": // i: color green; n: disable input menu; o: enable "+ input" and "- input" buttons
                    infoObject.push({id: control, attrubute: "status", value: "correct"});
                    this.model.addStudentNodeWithName(this.model.getName(inputID));
                    this.model.setStudentNodeSelection(inputID, "description", answer);
                    this.model.incrementescriptionAttemptCount(inputID);
                    this.inputs_jCounter++;
                    if (this.model.areNodeInputsVisible(id))
                        this.inputsOn = false;
                    this.addAsPlusButton = true;
                    this.addAsMinusButton = true;
                    this.inputsCounter = 0;
                    break;
                case "fgm": // f: color blue; g: message; m: leave input menu active
                    infoObject.push({id: control, attrubute: "status", value: "premature"});
                    if (this.inputs_gCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that the quantity is relevant for modeling the system, " +
                                    "but it is not yet time to define it. You should follow the Target " +
                                    "Node Strategy, which says you should edit an existing node that is " +
                                    "not yet defined. Such nodes have dotted outlines. Click on one to edit it."});
                    else if (this.inputs_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that according to the Target Node Strategy, it is too early to" +
                                    "define a node for this quantity. Edit a node that has a dotted outline."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Blue means premature. Edit a node with a dotted outline instead."});
                    this.inputs_gCounter++;
                    this.inputsCounter++;
                    break;
                case "acm": // a: color red; d: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.inputs_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "You tried to define a parameter for the initial value of an accumulator" +
                                    "This is unnecessary, because you can put the initial value for the " +
                                    "accumulator right into the definition of the accumulator itself."});
                    else if (this.inputs_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "That should be the initial value of an accumulator, not a parameter node."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "That should be the initial value of an accumulator."});
                    this.inputs_cCounter++;
                    this.inputsCounter++;
                    break;
                case "adm": // a: color red; d: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.inputs_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "You tried to define a parameter for a number you read in the problem. " +
                                    "Not all numbers in the problem statement are necessary for the model. " +
                                    "You will save effort if you follow the Target Node Strategy, which " +
                                    "says you should start by defining a node for a quantity that the " +
                                    "problem asks you to graph, then define nodes for its inputs, and then " +
                                    "define nodes for their inputs, etc. That way, every node you create is " +
                                    "an input to some node."});
                    else if (this.inputs_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Not every number in the problem statement is necessary for the model. " +
                                    "You should define a node for a quantity only when either (1) it is " +
                                    "required as input to a previously defined node, or (2) the problem " +
                                    "statement asks you to graph it."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please be sure you need a node before defining it. Even if a number " +
                                    "appears in the problem statement, it may not be needed in the model."});
                    this.inputs_dCounter++;
                    this.inputsCounter++;
                    break;
                case "abm": //a: color red; b: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.inputs_cCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "The quantity is irrelevant to this problem. Choose a different one."});
                    else if (this.inputs_hCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "This quantity is irrelevant for modeling the system. Try again."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Irrelevant. Try again."});
                    this.inputs_bCounter++;
                    this.inputsCounter++;
                    break;


                    // ************ ahm's message is not correct--need to fix; otherwise implementation appears to be working ************


                case "ahm": // f: color blue; h message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    if (this.inputs_hCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Blue means that quantity isn’t one that the problem statement " +
                                    "asks you to graph. Although this quantity will eventually be in " +
                                    "your model, you should follow the Target Node Strategy, which says " +
                                    "you should first define a node for a top level goal quantity."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please start with a quantity mentioned in the problem statement as one that needs to be graphed."});
                    this.inputs_hCounter++;
                    this.inputsCounter++;
                    break;
                case "aem": //a: color red; e: message; m: leave description menu active
                    infoObject.push({id: control, attrubute: "status", value: "incorrect"});
                    infoObject.push({id: control, attribute: "message", value: "A node already exists for that quantity. If you want to edit it, click on it."});
                    this.inputsCounter++;
                    break;
                case "klno": //k: color yellow and give optimal solution; l: message; n: disable description menu; o: activate "Type"
                    infoObject.push({id: control, attrubute: "status", value: "demo"});
                    inputID = this.model.getNextOptimalInput(id);
                    this.model.addStudentNodeWithName(this.model.getName(inputID));
                    this.model.setToDemo(inputID, "description");
                    if (this.inputs_lCounter < 1)
                        infoObject.push({id: control, attribute: "message", value: "Sorry, but that quantity isn’t relevant to the model. Moreover, " +
                                    "this is the third failure, so a correct selection is being made for " +
                                    "you. Please study it and figure out why it is correct. Your goal " +
                                    "should be to make a correct selection on the first attempt."});
                    else if (this.inputs_lCounter < 2)
                        infoObject.push({id: control, attribute: "message", value: "Here’s a correct solution. Please figure out why it is correct " +
                                    "so that next time, your first selection will be correct."});
                    else
                        infoObject.push({id: control, attribute: "message", value: "Please study this correct selection."});
                    this.inputs_lCounter++;
                    this.model.incrementDescriptionAttemptCount(inputID);
                    this.inputsCounter = 0;
                    if (this.model.areNodeInputsVisible(id))
                        this.inputsOn = false;
                    break;
            }
            return this._getReturnObject(id, infoObject, control);
        },
        /*
	 equationCheck() is a basic implementation; it needs additional code to 
         display different messages based on the type of user
	 */
        equationAction: function(/*string*/ id, /*string*/ equation) {
            //Summary: accepts an equation that the student provides, checks its validity,
            //         and returns a list of directives; id is the student node ID.
	    //         The equation is in the form of the string seen in the
	    //         equation box.

            //The array that that will be returned
            var infoObject = Array();
            var control = "equation";  // Should match control id in index.html

            this.model.setStudentNodeSelection(id, "equation", equation);
            var equivCheck = new check(this.model.given.getEquation(id), equation);

            if (equivCheck.areEquivalent()) {
                infoObject.push({id: control, attribute: "message", value: "Green means correct."});
                infoObject.push({id: control, attrubute: "status", value: "correct"});
            } else if (this.model.getNodeAttemptCount(id, "equation") == 3) {
                infoObject.push({id: control, attribute: "message", value: "That is not correct. Because this is the third time you have " +
                            "attempted the problem, the correct description is being provided for you."});
                infoObject.push({id: control, attrubute: "status", value: "demo"});
                this.model.setToDemo(id, "equation");
            } else {
                infoObject.push({id: control, attribute: "message", value: "That is not correct."});
                infoObject.push({id: control, attrubute: "status", value: "incorrect"});
            }
            return this._getReturnObject(id, infoObject, control);
        }
    });
});
