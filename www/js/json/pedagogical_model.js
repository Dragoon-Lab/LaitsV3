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
            this.descCounterJ = 0;
            this.descCounterB = 0;
            this.descCounterC = 0;
            this.descCounterD = 0;
            this.descCounterG = 0;
            this.descCounterH = 0;
            this.descCounterJ = 0;
            this.descCounterL = 0;
            this.typeCounter = 0;
            this.initialCounter = 0;
            this.unitsCounter = 0;
            this.equationCounter = 0;
        },
        descriptionAction: function(/*string*/ answer) {
            alert(this.descCounterJ);
            var optimal = {coached: this.ijno, feedback: this.ijno, test: this.ino, power: this.ino};
            var notTopLevel = {coached: this.fhm, feedback: this.ijno, test: this.ino, power: this.ino};
            var premature = {coached: this.fgm, feedback: this.ijno, test: this.ino, power: this.ino};
            var initialValue = {coached: this.acm, feedback: this.acm, test: this.am, power: this.am};
            var extraValue = {coached: this.adm, feedback: this.abm, test: this.am, power: this.am};
            var irrelevant = {coached: this.abm, feedback: this.abm, test: this.am, power: this.am};
            var redundant = {coached: this.aem, feedback: this.aem, test: this.aem, power: this.aem};
            var lastFailure = {coached: this.klno, feedback: this.klno, test: this.kno, power: this.kno};

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
                this.model.addStudentNodeWithName(this.model.getNodeName);
                sequence = pedagogicalTable["optimal"][this.userType];
            } else if (this.model.isStudentModelEmpty()) {
                sequence = pedagogicalTable["notTopLevel"][this.userType];
            } else
                sequence = pedagogicalTable["premature"][this.userType];
            if (sequence !== "optimal" && this.descCounter === 3)
                sequence = pedagogicalTable["lastFailure"][this.userType];
            sequence(this.model, this.id, this.anwer, this.descCounterJ);
            //this.descCounterJ++;
            alert("yo " + this.descCounterJ);
        },
        ijno: function(model, id, answer, counter) {
            alert(counter);
            model.setStudentNodeSelection(id, "description", answer);
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