/**
 *
 * Pedagogical Model class used to solve Dragoon problems
 * @author: Brandon Strong
 *
 * ********* IN PROGRESS--NOT COMPLETE *********
 *
 **/

/**
 *
 */

define(["dojo/_base/declare", "/laits/js/parserWS"]
        , function(declare, parser) {

    return declare(null, {
        desdescription_cCounterJ: 0,
        constructor: function(/*string*/ user, /*model.js object*/model) {

            this.userType = user;
            this.model = model;
            this.infoObject = JSON.parse('{"ID" : ' + null + ',\n"message" : ' + null + ',\n"status" : ' + null + '}');
            this.message = "";
            this.descriptionOn = true;
            this.typeOn = false;
            this.initialOn = false;
            this.unitsOn = false;
            this.inputOn = false;
            this.descriptionCounter = 0;
            this.description_jCounter = 0;
            this.description_hCounter = 0;
            this.description_gCounter = 0;
            this.description_cCounter = 0;
            this.description_dCounter = 0;
            this.description_bCounter = 0;
            this.description_lCounter = 0;
            this.type_iCounter = 0;
            this.initialCounter = 0;
            this.unitsCounter = 0;
            this.equationCounter = 0;
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
            if (this.infoObject.ID === null) {
                for (var i = 0; i < this.model.getExtraDescriptions.length; i++) {
                    if (answer === this.model.getExtraDescriptions("initial")[i])
                        sequence = pedagogicalTable["initialValue"][this.userType];
                    else if (answer === this.model.getExtraDescriptions("extra")[i])
                        sequence = pedagogicalTable["extraValue"][this.userType];
                    else
                        sequence = pedagogicalTable["irrelevant"][this.userType];
                }
            } else if (this.model.isNodeVisible(this.infoObject.ID)) {
                sequence = pedagogicalTable["redundant"][this.userType];
            } else if (this.model.isParentNode(this.infoObject.ID) || this.model.isNodesParentVisible(this.infoObject.ID)) {
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
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.infoObject.ID));
                    this.model.setStudentNodeSelection(this.infoObject.ID, "description", answer);
                    this.model.setDescriptionAttemptCount(this.infoObject.ID, this.descriptionCounter + 1);
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
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.infoObject.ID));
                    this.model.setStudentNodeSelection(this.infoObject.ID, "description", answer);
                    this.model.setDescriptionAttemptCount(this.infoObject.ID, this.descriptionCounter + 1);
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
                    this.model.setStudentNodeSelection(this.infoObject.ID, "description", answer);
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
                    this.infoObject.ID = this.model.getOptimalNode();
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.infoObject.ID));
                    this.model.setStudentNodeSelection(this.infoObject.ID, "description", answer);
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
                    this.model.setDescriptionAttemptCount(this.infoObject.ID, this.descriptionCounter + 1);
                    this.descriptionCounter = 0;
                    break;
                case "kno":  //k: color yellow and give optimal solution; n: disable description menu; o: activate "Type"
                    this.infoObject.status = "demo";
                    this.infoObject.ID = this.model.getOptimalNode();
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.infoObject.ID));
                    this.model.setStudentNodeSelection(this.infoObject.ID, "description", answer);
                    this.model.setDescriptionAttemptCount(this.infoObject.ID, this.descriptionCounter + 1);
                    descriptionCounter = 0;
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

            //allowed anwers include parameter, accumulator, sum, product, and power user
            //      but the model only accepts parameter, accumulator, and function; these
            //      7 lines convert the type allow comparisons and to write to the model
            if (answer === "sum" || answer === "product" || answer === "hidden function")
                this.model.setStudentNodeSelection(this.infoObject.ID, "type", "function");
            else
                this.model.setStudentNodeSelection(this.infoObject.ID, "type", answer);
            var modelType = this.model.getNodeType(this.infoObject.ID);
            if (modelType === "function")
                modelType = this._getType(this.model.getNodeEquation(this.infoObject.ID));

            //assign the action based on the answer
            if (answer === modelType) {
                sequence = pedagogicalTable["correct"][this.userType];
            } else if (this.model.getNodeAttemptCount(this.infoObject.ID, "type") < 2) {
                sequence = pedagogicalTable["firstFailure"][this.userType];
            } else if (this.model.getNodeAttemptCount(this.infoObject.ID, "type") < 3) {
                sequence = pedagogicalTable["secondFailure"][this.userType];
            } else
                sequence = pedagogicalTable["additionalFailure"][this.userType];

            //take the appropriate action
            switch (sequence) {
                case "bfgk": // b: color green; f: freeze type widget; g: enable next widget based on selection; k: message
                    this.infoObject.status = "correct";
                    this.typeOn = false;
                    if (modelType === "accumulator" || modelType === "parameter")
                        this.initialOn = true;
                    else
                        this.unitsOn = true;
                    this.infoObject.message = "Green means correct. Well Done!";
                    break;
                case "behk": // b: color green; e: leave type widget open; g: enable next widget based on selection; k: message
                    this.infoObject.status = "correct";
                    if (modelType === "accumulator" || modelType === "parameter") {
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
                    if (modelType === "accumulator" || modelType === "parameter") {
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
                    if (this.model.getNodeType(this.infoObject.ID) === "function")
                        //currently the only action that will be taken within this "if" statement is the final "else" clause
                        if (answer === "sum")
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(this.infoObject.ID) + "\" you will need " +
                                    "to multiply other nodes to determine its solution.";
                        else if (answer === "product")
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(this.infoObject.ID) + "\" you will need " +
                                    "to add other nodes to determine its solution.";
                        else
                            this.infoObject.message = "That is incorrect. Remember, with \"" +
                                    this.model.getNodeNameByID(this.infoObject.ID) + "\" you will need " +
                                    "use other nodes to determine its solution.";
                    else if (modelType === "parameter")
                        this.infoObject.message = "That is incorrect. Remember, \"" +
                                this.model.getNodeNameByID(this.infoObject.ID) + "\" has a fixed value.";
                    else
                        this.infoObject.message = "That is incorrect. Remember, \"" +
                                this.model.getNodeNameByID(this.infoObject.ID) + "\" starts with one " +
                                "value, which then changes over time based on its other inputs.";
                    break;
                case "difg": // d: color yellow; i: message; f: freeze type widget; g: enable next widget based on selection
                    this.model.setToDemo(this.infoObject.ID, "type");
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
                    if (modelType === "accumulator" || modelType === "parameter")
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

            this.model.setStudentNodeSelection(this.infoObject.ID, "initial", answer);

            //allowed anwers include parameter, accumulator, sum, product, and power user
            //      but the model only accepts parameter, accumulator, and function; these
            //      5 lines convert the answer to an acceptable format

            //assign the action based on the answer
            if (answer === this.model.getNodeInitial(this.infoObject.ID)) {
                sequence = pedagogicalTable["correct"][this.userType];
            } else if (this.model.getNodeAttemptCount(this.infoObject.ID, "initial") < 1) {
                sequence = pedagogicalTable["firstFailure"][this.userType];
            } else if (this.model.getNodeAttemptCount(this.infoObject.ID, "initial") < 2) {
                sequence = pedagogicalTable["secondFailure"][this.userType];
            } else
                sequence = pedagogicalTable["additionalFailure"][this.userType];

            //take the appropriate action
            switch (sequence) {
                case "beg": // b: color green; f: freeze widget; g: enable next widget
                    this.infoObject.status = "correct";
                    this.initialOn = false;
                    if (this.model.getNodeUnits(this.infoObject.ID) !== null)
                        this.unitsOn = true;
                    else
                        this.inputsOn = true;
                    break;
                case "bfh": // b: color green; f: leave widget active; g: enable next widget
                    this.infoObject.status = "correct";
                    if (this.model.getNodeUnits(this.infoObject.ID) !== null)
                        this.unitsOn = true;
                    else
                        this.inputsOn = true;
                    break;
                case "aif": // a: color red; i: hint; g: leave widget active
                    this.infoObject.status = "incorrect";
                    //hint
                    break;
            }
            return this.infoObject;
        }
    });
});
