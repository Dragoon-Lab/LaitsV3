/**
 * 
 * Given Model node creation class used by model.js for Dragoon problems
 * @author: Brandon Strong
 * 
 **/

/**
 * This class is used by model.js and should not be accessed directly by
 * another part of Dragoon
 */

define(["dojo/_base/declare"]
        , function(declare) {

    return declare(null, {
        constructor: function(/*string*/ id, /*int*/ order) {
            this.ID = id;
            this.name = "";
            this.type = "";
            this.parentNode = false;
            this.extra = false;
            this.order = order;
            this.units = "";
            this.inputs = new Array();
            this.initial = "";
            this.equation = "";
            this.correctDesc = "";
            this.attemptCount = JSON.parse('{"description" : ' + 0 + ',\n"type" : ' + 0 + ',\n"initial" : ' + 0 + ',\n"units" : ' + 0 + ',\n"equation" : ' + 0 + '}');
            this.status = JSON.parse('{"description" : "' + null + '",\n"type" : "' + null + '",\n"initial" : "' + null + '",\n"units" : "' + null + '",\n"equation" : "' + null + '"}');
        },
        addInput: function(/*string*/ id) {
            var input = JSON.parse('{"ID" : "' + id + '"}');
            this.inputs.push(input);
        },
        deleteInput: function(/*string*/ id) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        },
        // **** Need to add counter to check number of times part of equation entered comparied to the 
        //          number of times it was correct, compared to the inputs (as discussed with Brett)
        addAttempt: function(/*bool*/ desc, /*bool*/ typ, /*bool*/ init, /*bool*/ unit, /*bool*/ equat) {
            if (desc === true)
                this.attemptCount.description += 1;
            if (typ === true)
                this.attemptCount.type += 1;
            if (init === true)
                this.attemptCount.initial += 1;
            if (unit === true)
                this.attemptCount.units += 1;
            if (equat === true)
                this.attemptCount.equation += 1;
        },
        addStatus: function(/*string*/ desc, /*string*/ typ, /*string*/ init, /*string*/ unit, /*string*/ equat) {
            if (desc !== null && this.status.description !== "demo")
                this.status.description = desc;
            if (typ !== null && this.status.type !== "demo")
                this.status.type = typ;
            if (init !== null && this.status.initial !== "demo")
                this.status.initial = init;
            if (unit !== null && this.status.units !== "demo")
                this.status.units = unit;
            if (equat !== null && this.status.equation !== "demo")
                this.status.equation = equat;
        },
        resetStatus: function() {
            if (this.status.description !== "demo")
                this.status.description = null;
            if (this.status.type !== "demo")
                this.status.type = null;
            if (this.status.initial !== "demo")
                this.status.initial = null;
            if (this.status.units !== "demo")
                this.status.units = null;
            if (this.status.equation !== "demo")
                this.status.equation = null;
        },
        printInputs: function() {
            return this.inputs;
            for (var i = 0; i < this.inputs.length; i++) {
                alert(JSON.stringify(this.inputs[i]));
            }
        }
    });
});
