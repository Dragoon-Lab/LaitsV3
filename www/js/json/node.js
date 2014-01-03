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
            this.attemptCount = JSON.parse('{"desc" : ' + 0 + ',\n"plan" : ' + 0 + ',\n"calc" : ' + 0 + '}');
            this.solution = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null + '",\n"calc" : "' + null + '"}');
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
        addAttempt: function(/*bool*/ desc, /*bool*/ plan, /*bool*/ calc) {
            if (desc === true)
                this.attemptCount.desc += 1;
            if (plan === true)
                this.attemptCount.plan += 1;
            if (calc === true)
                this.attemptCount.calc += 1;
        },
        addSolution: function(/*string*/ desc, /*string*/ plan, /*string*/ calc) {
            if (desc !== null)
                this.solution.desc = desc;
            if (plan !== null)
                this.solution.plan = plan;
            if (calc !== null)
                this.solution.calc = calc;
        },
        printInputs: function() {
            return this.inputs;
            for (var i = 0; i < this.inputs.length; i++) {
                alert(JSON.stringify(this.inputs[i]));
            }
        }
    });
});
