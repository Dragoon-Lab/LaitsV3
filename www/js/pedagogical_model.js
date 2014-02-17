/* global define, Parser */
/**
 *
 * Pedagogical Model class used to solve Dragoon problems
 * @author: Brandon Strong
 *
 **/

/**
 * Pedagogical model that accepts student entries, updates the model, and returns an object
 * with the id of the node, a message with encouragement or a hint, and the status of the 
 * attempt (correct, incorrect, demo, or premature).
 **/

define([
    "dojo/_base/declare", "./equation_check", 
    "parser/parser"  // defines global variable Parser
], function(declare, check) {

    return declare(null, {
        constructor: function(/*string*/ user, /*model.js object*/model) {
            //**** Redesign of pedagogical model in process; functions that are called by other files should stay the same ****//
            this.correct = new Array();
            this.correct[0] = "Green means correct.  Good job!";
            this.correct[1] = "Green means correct.";
            this.incorrectIrrelevant = new Array();
            this.incorrectIrrelevant[0] = "The quantity is irrelevant to this problem.  Choose a different one.";
            this.incorrectIrrelevant[1] = "This quantity is irrelevant for modeling the system.  Try again.";
            this.incorrectIrrelevant[2] = "Irrelevant.  Try again.";
            this.incorrectInitial1 = "You tried to define a parameter for the initial value of an accumulator.  This is unnecessary, because you can put the initial value for the accumulator right into the definition of the accumulator itself.";
            this.incorrectInitial2 = "That should be the initial value of an accumulator, not a parameter node.";
            this.incorrectInitial2 = "That should be the initial value of an accumulator";
            this.incorrectNotInModel1 = "You tried to define a parameter for a number you read in the problem.  Not all numbers in the problem statement are necessary for the model.  You will save effort if you follow the Target Node Strategy, which says you should start by defining a node for a quantity that the problem asks you to graph, then define nodes for its inputs, and then define nodes for their inputs, etc.  That way, every node you create is an input to some node.";
            this.incorrectNotInModel2 = "Not every number in the problem statement is necessary for the model.  You should define a node for a quantity only when either (1) it is required as input to a previously defined node, or (2) the problem statement asks you to graph it.";
            this.incorrectNotInModel3 = "Please be sure you need a node before defining it.  Even if a number appears in the problem statement, it may not be needed in the model.";
            this.inccorectExists = "A node already exists for that quantity.  If you want to edit it, click on it.”  Notice that “say” is not the same as SayInSequence.  It means that the phrase is always said to the student";
            this.demo1 = "Sorry, but that quantity isn’t relevant to the model.  Moreover, this is the third failure, so a correct selection is being done for you.  Please study it and figure out why it is correct.  Your goal should be to make a correct selection on the first attempt.";
            this.demo2 = "Here’s a correct solution.  Please figure out why it is correct so that next time, your first selection will be correct.";
            this.demo3 = "Please study this correct selection.";
            this.demoType1 = "Yellow means that you made an incorrect choice too many times, so you are being shown the correct choice.  You should figure out why it is correct so that next time your first choice will be correct.";
            this.demoType2 = "Can you figure out why this is the right type/initial value for the node?";
            this.premature2 = "Blue means that the quantity is relevant for modeling the system, but it is not yet time to define it.  You should follow the Target Node Strategy, which says you should edit an existing node that is not yet defined.  Such nodes have dotted outlines.  Click on one to edit it.";
            this.premature2 = "Blue means that according to the Target Node Strategy, it is too early to define a node for this quantity.  Edit a node that has a dotted outline.";
            this.premature3 = "Blue means premature.  Edit a node with a dotted outline instead.";
            this.otherBlue1 = "Blue means that quantity isn’t one that the problem statement asks you to graph.  Although this quantity will eventually be in your model, you should follow the Target Node Strategy, which says you should first define a node for a top level goal quantity.";
            this.otherBlue2 = "Please start with a quantity mentioned in the problem statement as one that needs to be graphed.";
            this.userType = user;
            this.model = model;
            this.infoObject = {ID: null, message: null, status: null};
            this.message = "";
            this.descriptionOn = true;
            this.typeOn = false;
            this.initialOn = false;
            this.unitsOn = false;
            this.inputOn = false;
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
        descriptionAction: function(/*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //      and returns the current ID, whether the answer is correct, and a 
            //      message
            //Note: the ID of the node may change until the correct answer is reached
            //      or the system provides it; at this point the ID will be set; if
            //      this.infoObject.status = "correct" then this.infoObject.ID is the
            //      correct ID.

            //resets the object that will be returned
            this.infoObject.ID = this.model.getNodeIDByDescription(answer);
            this.infoObject.message = null;
            this.infoObject.status = null;

            var id = this.infoObject.ID;

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var optimal = {coached: "ijno", feedback: "ijno", test: "ino", power: "ino"};
            var notTopLevel = {coached: "fhm", feedback: "ijno", test: "ino", power: "ino"};
            var premature = {coached: "fgm", feedback: "ijno", test: "ino", power: "ino"};
            var initialValue = {coached: "acm", feedback: "acm", test: "am", power: "am"};
            var extraValue = {coached: "adm", feedback: "abm", test: "am", power: "am"};
            var irrelevant = {coached: "abm", feedback: "abm", test: "am", power: "am"};
            var redundant = {coached: "aem", feedback: "aem", test: "aem", power: "aem"};
            var lastFailure = {coached: "klno", feedback: "klno", test: "kno", power: "kno"};

            var pedagogicalTable = {optimal: optimal, notTopLevel: notTopLevel, premature: premature,
                initialValue: initialValue, extraValue: extraValue, irrelevant: irrelevant,
                redundant: redundant, lastFailure: lastFailure};

            var sequence;

            //assign the action based on the answer
            if (id === null) {
                for (var i = 0; i < this.model.getExtraDescriptions.length; i++) {
                    if (answer === this.model.getExtraDescriptions("initial")[i])
                        sequence = pedagogicalTable["initialValue"][this.userType];
                    else if (answer === this.model.getExtraDescriptions("extra")[i])
                        sequence = pedagogicalTable["extraValue"][this.userType];
                    else
                        sequence = pedagogicalTable["irrelevant"][this.userType];
                }
            } else if (this.model.isNodeVisible(id)) {
                sequence = pedagogicalTable["redundant"][this.userType];
            } else if (this.model.isParentNode(id) || this.model.isNodesParentVisible(id)) {
                sequence = pedagogicalTable["optimal"][this.userType];
            } else if (this.model.isStudentModelEmpty()) {
                sequence = pedagogicalTable["notTopLevel"][this.userType];
            } else
                sequence = pedagogicalTable["premature"][this.userType];
            if (sequence !== pedagogicalTable["optimal"][this.userType] && this.descriptionCounter === 2) {
                sequence = pedagogicalTable["lastFailure"][this.userType];
            }

            //take the appropriate action
            switch (sequence) {
                case "ijno": // i: color green; j: message; n: disable description menu; o: enable type menu
                    this.infoObject.status = "correct";
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(id));
                    this.model.setStudentNodeSelection(id, "description", answer);
                    this.model.setDescriptionAttemptCount(id, this.descriptionCounter + 1);
                    if (this.description_jCounter < 1)
                        this.infoObject.message = "Green means correct. Good job!";
                    else
                        this.infoObject.message = "Green means correct.";
                    this.description_jCounter++;
                    this.descriptionOn = false;
                    this.typeOn = true;
                    this.descriptionCounter = 0;
                    break;
                case "ino": // i: color green; n: disable description menu; o: enable type menu
                    this.infoObject.status = "correct";
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(id));
                    this.model.setStudentNodeSelection(id, "description", answer);
                    this.model.setDescriptionAttemptCount(id, this.descriptionCounter + 1);
                    this.description_jCounter++;
                    this.descriptionOn = false;
                    this.typeOn = true;
                    this.descriptionCounter = 0;
                    break;
                case "fhm": // f: color blue; h message; m: leave description menu active
                    this.infoObject.status = "premature";
                    if (this.description_hCounter < 1)
                        this.infoObject.message = "Blue means that quantity isn’t one that the problem statement " +
                                "asks you to graph. Although this quantity will eventually be in " +
                                "your model, you should follow the Target Node Strategy, which says " +
                                "you should first define a node for a top level goal quantity.";
                    else
                        this.infoObject.message = "Please start with a quantity mentioned in the problem statement as one that needs to be graphed.";
                    this.description_hCounter++;
                    this.descriptionCounter++;
                    break;
                case "fgm": // f: color blue; g: message; m: leave description menu active
                    this.infoObject.status = "premature";
                    if (this.description_gCounter < 1)
                        this.infoObject.message = "Blue means that the quantity is relevant for modeling the system, " +
                                "but it is not yet time to define it. You should follow the Target " +
                                "Node Strategy, which says you should edit an existing node that is " +
                                "not yet defined. Such nodes have dotted outlines. Click on one to edit it.";
                    else if (this.description_hCounter < 2)
                        this.infoObject.message = "Blue means that according to the Target Node Strategy, it is too early to" +
                                "define a node for this quantity. Edit a node that has a dotted outline.";
                    else
                        this.infoObject.message = "Blue means premature. Edit a node with a dotted outline instead.";
                    this.description_gCounter++;
                    this.descriptionCounter++;
                    break;
                case "acm": // a: color red; d: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.description_cCounter < 1)
                        this.infoObject.message = "You tried to define a parameter for the initial value of an accumulator" +
                                "This is unnecessary, because you can put the initial value for the " +
                                "accumulator right into the definition of the accumulator itself.";
                    else if (this.description_hCounter < 2)
                        this.infoObject.message = "That should be the initial value of an accumulator, not a parameter node.";
                    else
                        this.infoObject.message = "That should be the initial value of an accumulator.";
                    this.description_cCounter++;
                    this.descriptionCounter++;
                    break;
                case "am": // a: color red; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    this.model.setStudentNodeSelection(id, "description", answer);
                    this.descriptionCounter++;
                    break;
                case "adm": // a: color red; d: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.description_cCounter < 1)
                        this.infoObject.message = "You tried to define a parameter for a number you read in the problem. " +
                                "Not all numbers in the problem statement are necessary for the model. " +
                                "You will save effort if you follow the Target Node Strategy, which " +
                                "says you should start by defining a node for a quantity that the " +
                                "problem asks you to graph, then define nodes for its inputs, and then " +
                                "define nodes for their inputs, etc. That way, every node you create is " +
                                "an input to some node.";
                    else if (this.description_hCounter < 2)
                        this.infoObject.message = "Not every number in the problem statement is necessary for the model. " +
                                "You should define a node for a quantity only when either (1) it is " +
                                "required as input to a previously defined node, or (2) the problem " +
                                "statement asks you to graph it.";
                    else
                        this.infoObject.message = "Please be sure you need a node before defining it. Even if a number " +
                                "appears in the problem statement, it may not be needed in the model.";
                    this.description_dCounter++;
                    this.descriptionCounter++;
                    break;
                case "abm": //a: color red; b: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.description_cCounter < 1)
                        this.infoObject.message = "The quantity is irrelevant to this problem. Choose a different one.";
                    else if (this.description_hCounter < 2)
                        this.infoObject.message = "This quantity is irrelevant for modeling the system. Try again.";
                    else
                        this.infoObject.message = "Irrelevant. Try again.";
                    this.description_bCounter++;
                    this.descriptionCounter++;
                    break;
                case "aem": //a: color red; e: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    this.infoObject.message = "A node already exists for that quantity. If you want to edit it, click on it.";
                    this.descriptionCounter++;
                    break;
                case "klno": //k: color yellow and give optimal solution; l: message; n: disable description menu; o: activate "Type"
                    this.infoObject.status = "demo";
                    id = this.model.getOptimalNode();
                    this.infoObject.ID = id;
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(id));
                    this.model.setToDemo(id, "description");
                    if (this.description_lCounter < 1)
                        this.infoObject.message = "Sorry, but that quantity isn’t relevant to the model. Moreover, " +
                                "this is the third failure, so a correct selection is being made for " +
                                "you. Please study it and figure out why it is correct. Your goal " +
                                "should be to make a correct selection on the first attempt.";
                    else if (this.description_lCounter < 2)
                        this.infoObject.message = "Here’s a correct solution. Please figure out why it is correct " +
                                "so that next time, your first selection will be correct.";
                    else
                        this.infoObject.message = "Please study this correct selection.";
                    this.description_lCounter++;
                    this.model.setDescriptionAttemptCount(id, this.descriptionCounter + 1);
                    this.descriptionCounter = 0;
                    break;
                case "kno":  //k: color yellow and give optimal solution; n: disable description menu; o: activate "Type"
                    this.infoObject.status = "demo";
                    id = this.model.getOptimalNode();
                    this.infoObject.ID = id;
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(id));
                    this.model.setToDemo(id, "description");
                    this.model.setDescriptionAttemptCount(id, this.descriptionCounter + 1);
                    this.descriptionCounter = 0;
                    break;
            }
            return this.infoObject;
        },
        typeAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //      and returns whether the answer is correct, and a message

            //resets the object that will be returned
            this.infoObject.ID = id;
            this.infoObject.message = null;
            this.infoObject.status = null;
            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var correct = {coached: "bfgk", feedback: "behk", test: "ceh", power: "ceh"};
            var firstFailure = {coached: "aje", feedback: "aje", test: "ceh", power: "ceh"};
            var secondFailure = {coached: "difg", feedback: "difg", test: "ceh", power: "ceh"};
            var additionalFailure = {coached: null, feedback: null, test: "ceh", power: "ceh"};

            var pedagogicalTable = {correct: correct, firstFailure: firstFailure, secondFailure: secondFailure,
                additionalFailure: additionalFailure};

            var sequence;
            var correctType = this.model.getNodeType(id);

            if (correctType === "function")
                correctType = this._getType(this.model.getNodeEquation(id));

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
                    this.infoObject.status = "correct";
                    this.typeOn = false;
                    if (correctType === "accumulator" || correctType === "parameter")
                        this.initialOn = true;
                    else
                        this.unitsOn = true;
                    this.infoObject.message = "Green means correct. Well Done!";
                    break;
                case "behk": // b: color green; e: leave type widget open; g: enable next widget based on selection; k: message
                    this.infoObject.status = "correct";
                    if (correctType === "accumulator" || correctType === "parameter") {
                        this.initialOn = true;
                        this.unitsOn = false;
                    } else {
                        this.initialOn = false;
                        this.unitsOn = true;
                    }
                    this.infoObject.message = "Green means correct. Well Done!";
                    break;
                case "ceh": // c: leave selection white; e: leave type widge open; h: enable next widget based on selection
                    this.infoObject.status = null;
                    if (correctType === "accumulator" || correctType === "parameter") {
                        this.initialOn = true;
                        this.unitsOn = false;
                    } else {
                        this.initialOn = false;
                        this.unitsOn = true;
                    }
                    break;
                case "aje": // a: color red; j: hint; e: leave type widget open
                    this.infoObject.status = "incorrect";
                    //the following hints may be changed if the author is allowed to set his/her own hints
                    if (this.model.getNodeType(id) === "function")
                        //currently the only action that will be taken within this "if" statement is the final "else" clause
                        if (answer === "sum")
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(id) + "\" you will need " +
                                    "to multiply other nodes to determine its solution.";
                        else if (answer === "product")
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(id) + "\" you will need " +
                                    "to add other nodes to determine its solution.";
                        else
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(id) + "\" you will need " +
                                    "use other nodes to determine its solution.";
                    else if (correctType === "parameter")
                        this.infoObject.message = "That is incorrect. Remember, \"" +
                                this.model.getNodeNameByID(id) + "\" has a fixed value.";
                    else
                        this.infoObject.message = "That is incorrect. Remember, \"" +
                                this.model.getNodeNameByID(id) + "\" starts with one " +
                                "value, which then changes over time based on its other inputs.";
                    break;
                case "difg": // d: color yellow; i: message; f: freeze type widget; g: enable next widget based on selection
                    this.model.setToDemo(id, "type");
                    this.infoObject.status = "demo";
                    if (this.type_iCounter < 1) {
                        this.infoObject.message = "Yellow means that you made an incorrect " +
                                "choice too many times, so you are being shown the correct " +
                                "choice. You should figure out why it is correct so that " +
                                "next time your first choice will be correct.";
                        this.type_iCounter++;
                    } else
                        this.infoObject.message = "Can you figure out why this is the right type for the node?";
                    this.typeOn = false;
                    if (correctType === "accumulator")
                        this.initialOn = true;
                    else
                        this.unitsOn = true;
                    break;
            }
            return this.infoObject;
        },
        initialAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //      and returns whether the answer is correct, and a message

            //resets the object that will be returned
            this.infoObject.ID = id;
            this.infoObject.message = null;
            this.infoObject.status = null;

            //creates pedagogicalTable, a double array of sorts that helps assign the
            //      appropriate actions to be taken; the actions are assigned to sequence
            var correct = {coached: "beg", feedback: "bfh", test: "bfh", power: "bfh"};
            var firstFailure = {coached: "aif", feedback: "aif", test: "c", power: "c"};
            var secondFailure = {coached: "degj", feedback: "djeh", test: "c", power: "c"};
            var additionalFailure = {coached: null, feedback: null, test: "c", power: "c"};

            var pedagogicalTable = {correct: correct, firstFailure: firstFailure, secondFailure: secondFailure,
                additionalFailure: additionalFailure};

            var sequence;
            var correctInitial = this.model.getNodeInitial(id);

            this.model.setStudentNodeSelection(id, "initial", answer);

            //if the initial entry is blank, the user may put anything in it and continue, if it
            //      is not blank then the user must enter the correct initial value; this is for
            //      a possible future feature; if an initial entry is not needed (i.e. the type
            //      is a parameter or a function) then initial is skipped altogether
            if (correctInitial === null) {
                this.infoObject.status = correct;
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
                        this.infoObject.status = "correct";
                        this.initialOn = false;
                        if (this.model.getNodeUnits(id) !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "bfh": // b: color green; f: leave widget active; g: enable next widget
                        this.infoObject.status = "correct";
                        if (this.model.getNodeUnits(id) !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "aif": // a: color red; i: hint; g: leave widget active
                        this.infoObject.status = "incorrect";
                        //hint
                        break;
                    case "c": // c: leave the widget white
                        break;
                    case "degj": // d: mark yellow and give answer; e: freeze widget; enable next widget; j: message
                        this.infoObject.status = "demo";
                        this.model.setToDemo(id, "initial");
                        if (this.initial_jCounter < 1)
                            this.infoObject.message = "Yellow means that you made an incorrect " +
                                    "choice too many times, so you are being shown the correct " +
                                    "choice.  You should figure out why it is correct so that " +
                                    "next time your first choice will be correct.";
                        else
                            this.infoObject.message = "Can you figure out why this is the right initial value for the quantity?";
                        this.initial_jCounter++;
                        this.initialOn = false;
                        if (this.model.getNodeUnits !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                    case "djeh": // d: mark yellow and give answer; j: message; e: freeze widget; h: enable all widgets for the nodes type;
                        this.infoObject.status = "demo";
                        this.model.setToDemo(id, "initial");
                        if (this.initial_jCounter < 1)
                            this.infoObject.message = "Yellow means that you made an incorrect " +
                                    "choice too many times, so you are being shown the correct " +
                                    "choice.  You should figure out why it is correct so that " +
                                    "next time your first choice will be correct.";
                        else
                            this.infoObject.message = "Can you figure out why this is the right initial value for the quantity?";
                        this.initial_jCounter++;
                        this.initialOn = false;
                        if (this.model.getNodeUnits !== null)
                            this.unitsOn = true;
                        else
                            this.inputsOn = true;
                        break;
                }
                return this.infoObject;
            }
        },
        unitsAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts an answer that the student provides, checks its validity,
            //      and returns whether the answer is correct, and a message; unitsAction()
            //      is similar to initialAction();

            //resets the object that will be returned
            this.infoObject.ID = id;
            this.infoObject.message = null;
            this.infoObject.status = null;

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
                    this.infoObject.status = "correct";
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
                case "bfh": // b: color green; f: leave widget active; g: enable next widget
                    this.infoObject.status = "correct";
                    if (correctUnits !== null)
                        this.unitsOn = true;
                    else
                        this.inputsOn = true;
                    break;
                case "aif": // a: color red; i: hint; g: leave widget active
                    this.infoObject.status = "incorrect";
                    this.infoObject.message = "The units variable should relate to the quantity being measured. Think about the node \"" +
                            this.model.getNodeNameByID(id) + "\". What unit would pertain to this node?";
                    break;
                case "c": // c: leave the widget white
                    break;
                case "degj": // d: mark yellow and give answer; e: freeze widget; enable next widget; j: message
                    this.infoObject.status = "demo";
                    this.model.setToDemo(id, "units");
                    if (this.units_jCounter < 1)
                        this.infoObject.message = "Yellow means that you made an incorrect " +
                                "choice too many times, so you are being shown the correct " +
                                "choice.  You should figure out why it is correct so that " +
                                "next time your first choice will be correct.";
                    else
                        this.infoObject.message = "Can you figure out why this is the right units value for the quantity?";
                    this.units_jCounter++;
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
                case "djeh": // d: mark yellow and give answer; j: message; e: freeze widget; h: enable all widgets for the nodes type;
                    this.infoObject.status = "demo";
                    this.model.setToDemo(id, "units");
                    if (this.units_jCounter < 1)
                        this.infoObject.message = "Yellow means that you made an incorrect " +
                                "choice too many times, so you are being shown the correct " +
                                "choice.  You should figure out why it is correct so that " +
                                "next time your first choice will be correct.";
                    else
                        this.infoObject.message = "Can you figure out why this is the right units value for the quantity?";
                    this.units_jCounter++;
                    this.unitsOn = false;
                    this.inputsOn = true;
                    break;
            }
            return this.infoObject;
        },
        inputsAction: function(/*string*/ id, /*string*/ answer) {
            //Summary: accepts a description that the student provides, checks its validity,
            //      and returns the current ID, whether the answer is correct, and a 
            //      message

            //resets the object that will be returned
            this.infoObject.ID = id;
            this.infoObject.message = null;
            this.infoObject.status = null;

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
            } else if (this.model.isStudentNodeInput(id, inputID)) {
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
                    this.infoObject.status = "correct";
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(inputID));
                    this.model.setStudentNodeSelection(inputID, "description", answer);
                    this.model.setDescriptionAttemptCount(inputID, this.inputsCounter + 1);
                    if (this.inputs_jCounter < 1)
                        this.infoObject.message = "Green means correct. Good job!";
                    else
                        this.infoObject.message = "Green means correct.";
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
                    this.infoObject.status = "correct";
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(inputID));
                    this.model.setStudentNodeSelection(inputID, "description", answer);
                    this.model.setDescriptionAttemptCount(inputID, this.inputsCounter + 1);
                    this.inputs_jCounter++;
                    if (this.model.areNodeInputsVisible(id))
                        this.inputsOn = false;
                    this.addAsPlusButton = true;
                    this.addAsMinusButton = true;
                    this.inputsCounter = 0;
                    break;
                case "fgm": // f: color blue; g: message; m: leave input menu active
                    this.infoObject.status = "premature";
                    if (this.inputs_gCounter < 1)
                        this.infoObject.message = "Blue means that the quantity is relevant for modeling the system, " +
                                "but it is not yet time to define it. You should follow the Target " +
                                "Node Strategy, which says you should edit an existing node that is " +
                                "not yet defined. Such nodes have dotted outlines. Click on one to edit it.";
                    else if (this.inputs_hCounter < 2)
                        this.infoObject.message = "Blue means that according to the Target Node Strategy, it is too early to" +
                                "define a node for this quantity. Edit a node that has a dotted outline.";
                    else
                        this.infoObject.message = "Blue means premature. Edit a node with a dotted outline instead.";
                    this.inputs_gCounter++;
                    this.inputsCounter++;
                    break;
                case "acm": // a: color red; d: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.inputs_cCounter < 1)
                        this.infoObject.message = "You tried to define a parameter for the initial value of an accumulator" +
                                "This is unnecessary, because you can put the initial value for the " +
                                "accumulator right into the definition of the accumulator itself.";
                    else if (this.inputs_hCounter < 2)
                        this.infoObject.message = "That should be the initial value of an accumulator, not a parameter node.";
                    else
                        this.infoObject.message = "That should be the initial value of an accumulator.";
                    this.inputs_cCounter++;
                    this.inputsCounter++;
                    break;
                case "adm": // a: color red; d: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.inputs_cCounter < 1)
                        this.infoObject.message = "You tried to define a parameter for a number you read in the problem. " +
                                "Not all numbers in the problem statement are necessary for the model. " +
                                "You will save effort if you follow the Target Node Strategy, which " +
                                "says you should start by defining a node for a quantity that the " +
                                "problem asks you to graph, then define nodes for its inputs, and then " +
                                "define nodes for their inputs, etc. That way, every node you create is " +
                                "an input to some node.";
                    else if (this.inputs_hCounter < 2)
                        this.infoObject.message = "Not every number in the problem statement is necessary for the model. " +
                                "You should define a node for a quantity only when either (1) it is " +
                                "required as input to a previously defined node, or (2) the problem " +
                                "statement asks you to graph it.";
                    else
                        this.infoObject.message = "Please be sure you need a node before defining it. Even if a number " +
                                "appears in the problem statement, it may not be needed in the model.";
                    this.inputs_dCounter++;
                    this.inputsCounter++;
                    break;
                case "abm": //a: color red; b: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.inputs_cCounter < 1)
                        this.infoObject.message = "The quantity is irrelevant to this problem. Choose a different one.";
                    else if (this.inputs_hCounter < 2)
                        this.infoObject.message = "This quantity is irrelevant for modeling the system. Try again.";
                    else
                        this.infoObject.message = "Irrelevant. Try again.";
                    this.inputs_bCounter++;
                    this.inputsCounter++;
                    break;


                    // ************ ahm's message is not correct--need to fix; otherwise implementation appears to be working ************


                case "ahm": // f: color blue; h message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    if (this.inputs_hCounter < 1)
                        this.infoObject.message = "Blue means that quantity isn’t one that the problem statement " +
                                "asks you to graph. Although this quantity will eventually be in " +
                                "your model, you should follow the Target Node Strategy, which says " +
                                "you should first define a node for a top level goal quantity.";
                    else
                        this.infoObject.message = "Please start with a quantity mentioned in the problem statement as one that needs to be graphed.";
                    this.inputs_hCounter++;
                    this.inputsCounter++;
                    break;
                case "aem": //a: color red; e: message; m: leave description menu active
                    this.infoObject.status = "incorrect";
                    this.infoObject.message = "A node already exists for that quantity. If you want to edit it, click on it.";
                    this.inputsCounter++;
                    break;
                case "klno": //k: color yellow and give optimal solution; l: message; n: disable description menu; o: activate "Type"
                    this.infoObject.status = "demo";
                    inputID = this.model.getNextOptimalInput(id);
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(inputID));
                    this.model.setToDemo(inputID, "description");
                    if (this.inputs_lCounter < 1)
                        this.infoObject.message = "Sorry, but that quantity isn’t relevant to the model. Moreover, " +
                                "this is the third failure, so a correct selection is being made for " +
                                "you. Please study it and figure out why it is correct. Your goal " +
                                "should be to make a correct selection on the first attempt.";
                    else if (this.inputs_lCounter < 2)
                        this.infoObject.message = "Here’s a correct solution. Please figure out why it is correct " +
                                "so that next time, your first selection will be correct.";
                    else
                        this.infoObject.message = "Please study this correct selection.";
                    this.inputs_lCounter++;
                    this.model.setDescriptionAttemptCount(inputID, this.inputsCounter + 1);
                    this.inputsCounter = 0;
                    if (this.model.areNodeInputsVisible(id))
                        this.inputsOn = false;
                    break;
            }
            return this.infoObject;
        },
        //equationCheck() is a basic implementation; it needs additional code to 
        //      display different messages based on the type of user
        equationAction: function(/*string*/ id, /*string*/ equation) {
            this.infoObject.ID = id;
            this.infoObject.message = null;
            this.infoObject.status = null;

            this.model.setStudentNodeSelection(id, "equation", equation);
            var equivCheck = new check(this.model.getNodeEquation(id), equation);

            if (equivCheck.areEquivalent()) {
                this.infoObject.message = "Green means correct.";
                this.infoObject.status = "correct";
            } else if (this.model.getNodeAttemptCount(id, "equation") == 3) {
                this.infoObject.message = "That is not correct. Because this is the third time you have " +
                        "attempted the problem, the correct description is being provided for you.";
                this.infoObject.status = "demo";
                this.model.setToDemo(id, "equation");
            } else {
                this.infoObject.message = "That is not correct.";
                this.infoObject.status = "incorrect";
            }
            return this.infoObject;
        }
    });
});
