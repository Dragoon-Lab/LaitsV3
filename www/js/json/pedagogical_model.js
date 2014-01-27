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

define(["dojo/_base/declare"]
        , function(declare) {

    return declare(null, {
        descCounterJ: 0,
        constructor: function(/*string*/ user, /*model.js object*/model) {

            this.userType = user;
            this.model = model;
            this.id = null;
            this.answer = null;
            this.descriptionOn = true;
            this.typeOn = false;
            this.initialOn = false;
            this.unitsOn = false;
            this.inputOn = false;
            this.descriptionCounter = 0;
            this.jCounter = 0;
            this.hCounter = 0;
            this.gCounter = 0;
            this.cCounter = 0;
            this.dCounter = 0;
            this.bCounter = 0;
            this.descCounterL = 0;
            this.typeCounter = 0;
            this.initialCounter = 0;
            this.unitsCounter = 0;
            this.equationCounter = 0;
        },
        descriptionAction: function(/*string*/ answer) {
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
            this.answer = answer;
            this.id = this.model.getNodeIDByDescription(answer);
            var sequence;
            if (this.id === null) {
                for (var i = 0; i < this.model.getExtraDescriptions.length; i++) {
                    if (answer === this.model.getExtraDescriptions[i]("initial"))
                        sequence = pedagogicalTable["initial value"][this.userType];
                    else if (answer === this.model.getExtraDescriptions[i]("extra"))
                        sequence = pedagogicalTable["extraValue"][this.userType];
                    else
                        sequence = pedagogicalTable["irrelevant"][this.userType];
                }
            } else if (this.model.isNodeVisible(this.id)) {
                sequence = pedagogicalTable["redundant"][this.userType];
            } else if (this.model.isParentNode(this.id) || this.model.isNodesParentVisible(this.id)) {
                sequence = pedagogicalTable["optimal"][this.userType];
            } else if (this.model.isStudentModelEmpty()) {
                sequence = pedagogicalTable["notTopLevel"][this.userType];
            } else
                sequence = pedagogicalTable["premature"][this.userType];
            if (sequence !== "optimal" && this.descCounter === 3)
                sequence = pedagogicalTable["lastFailure"][this.userType];
            switch (sequence) {
                case "ijno":
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.id));
                    this.model.setStudentNodeSelection(this.id, "description", this.answer);
                    if (this.jCounter < 1)
                        alert("Green means correct. Good job!");
                    else
                        alert("Green means correct.");
                    this.jCounter++;
                    this.descriptionCounter++;
                    break;
                case "ino":
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.id));
                    this.model.setStudentNodeSelection(this.id, "description", this.answer);
                    this.descriptionCounter++;
                    break;
                case "fhm":
                    if (this.hCounter < 1)
                        alert("Blue means that quantity isn’t one that the problem statement " +
                                "asks you to graph. Although this quantity will eventually be in " +
                                "your model, you should follow the Target Node Strategy, which says " +
                                "you should first define a node for a top level goal quantity.");
                    else
                        alert("Please start with a quantity mentioned in the problem statement as one that needs to be graphed.");
                    this.hCounter++;
                    this.descriptionCounter++;
                    break;
                case "fgm":
                    if (this.gCounter < 1)
                        alert("Blue means that the quantity is relevant for modeling the system, " +
                                "but it is not yet time to define it. You should follow the Target " +
                                "Node Strategy, which says you should edit an existing node that is " +
                                "not yet defined. Such nodes have dotted outlines. Click on one to edit it.");
                    else if (this.hCounter < 2)
                        alert("Blue means that according to the Target Node Strategy, it is too early to" +
                                "define a node for this quantity. Edit a node that has a dotted outline.");
                    else
                        alert("Blue means premature. Edit a node with a dotted outline instead.");
                    this.gCounter++;
                    this.descriptionCounter++;
                    break;
                case "acm":
                    if (this.cCounter < 1)
                        alert("You tried to define a parameter for the initial value of an accumulator" +
                                "This is unnecessary, because you can put the initial value for the " +
                                "accumulator right into the definition of the accumulator itself.");
                    else if (this.hCounter < 2)
                        alert("That should be the initial value of an accumulator, not a parameter node.");
                    else
                        alert("That should be the initial value of an accumulator.");
                    this.cCounter++;
                    this.descriptionCounter++;
                    break;
                case "am":
                    this.id = this.model.addStudentNode();
                    this.model.setStudentNodeSelection(this.id, "description", this.answer);
                    this.descriptionCounter++;
                    break;
                case "adm": //a: color red; d: message; m: leave description menu active
                    if (this.cCounter < 1)
                        alert("You tried to define a parameter for a number you read in the problem. " +
                                "Not all numbers in the problem statement are necessary for the model. " +
                                "You will save effort if you follow the Target Node Strategy, which " +
                                "says you should start by defining a node for a quantity that the " +
                                "problem asks you to graph, then define nodes for its inputs, and then " +
                                "define nodes for their inputs, etc. That way, every node you create is " +
                                "an input to some node.");
                    else if (this.hCounter < 2)
                        alert("Not every number in the problem statement is necessary for the model. " +
                                "You should define a node for a quantity only when either (1) it is " +
                                "required as input to a previously defined node, or (2) the problem " +
                                "statement asks you to graph it.");
                    else
                        alert("Please be sure you need a node before defining it. Even if a number " +
                                "appears in the problem statement, it may not be needed in the model.");
                    this.dCounter++;
                    this.descriptionCounter++;
                    break;
                case "abm": //a: color red; b: message; m: leave description menu active
                    if (this.cCounter < 1)
                        alert("The quantity is irrelevant to this problem. Choose a different one.");
                    else if (this.hCounter < 2)
                        alert("This quantity is irrelevant for modeling the system. Try again.");
                    else
                        alert("Irrelevant. Try again.");
                    this.bCounter++;
                    this.descriptionCounter++;
                    break;
                case "aem": //a: color red; e: message; m: leave description menu active                    
                    alert("A node already exists for that quantity. If you want to edit it, click on it.");
                    break;
                case "klno": //k: color yellow and give optimal solution; l: message; n: disable description menu; o: activate "Type"
                    this.model.addStudentNodeWithName(this.model.getNodeNameByID(this.id));
                    this.model.setStudentNodeSelection(this.id, "description", this.answer);
                    if (this.jCounter < 1)
                        alert("Green means correct. Good job!");
                    else
                        alert("Green means correct.");
                    this.jCounter++;
                    this.descriptionCounter++;
                    break;
            }
        },
        ijno: function(model, id, answer, counter) {
            alert(counter);
            //model.setStudentNodeSelection(id, "description", answer);
            if (counter < 1)
                alert("Green means correct. Good job!");
            else
                alert("Green means correct.");
            this.counterIncrease(counter);
            alert(counter);
            this.descriptionOn = false;
            this.inputOn = true;
        },
        ino: function() {

        },
        fhm: function() {

        },
        fgm: function() {

        },
        acm: function() {

        },
        am: function() {

        },
        adm: function() {

        },
        abm: function() {
            return "Blue means that quantity isn’t one that the problem statement " +
                    "asks you to graph. Although this quantity will eventually be in your " +
                    "model, you should follow the Target Node Strategy, which says you should " +
                    "first define a node for a top level goal quantity.";
        },
        aem: function() {

        },
        klno: function() {

        },
        kno: function() {

        }
    });
});