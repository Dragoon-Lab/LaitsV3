
define(["dojo/_base/declare", "dojo/_base/json"]
        , function(declare, dojo) {

    return declare(null, {       
        constructor: function(id, order, xPos, yPos) {
            this.id = id;
            this.name = "";
            this.type = "";
            this.initialNode = false;
            this.extra = "";
            this.order = order;
            this.units = "";
            this.inputs = new Array();
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
            this.initial = "";
            this.equation = "";
            this.correctDesc = "";
            this.attemptCount = JSON.parse('{"desc" : ' + 0 + ',\n"plan" : ' + 0 + ',\n"calc" : ' + 0 + '}');
            this.solution = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null + '",\n"calc" : "' + null + '"}');
        },
        modifyNode: function(name, type, extra, order, units, initial, equation, correctDesc) {
            if (name !== null)
                this.name = name;
            if (type !== null)
                this.type = type;
            if (extra !== null)
                this.extra = extra;
            if (order !== null)
                this.order = order;
            if (units !== null)
                this.units = units;
            if (initial !== null)
                this.initial = initial;
            if (equation !== null)
                this.equation = equation;
            if (correctDesc !== null)
                this.correctDesc = correctDesc;
        },
        modifyPosition: function(x, y) {
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
        },
        modifyAttemptCount: function(desc, plan, calc) {
            this.attemptCount = JSON.parse('{"desc" : ' + desc + ',\n"plan" : ' + plan + ',\n"calc" : ' + calc + '}');
        },
        modifySolution: function(desc, plan, calc) {
            this.solution = JSON.parse('{"desc" : "' + desc + '",\n"plan" : "' + plan + '",\n"calc" : "' + calc + '"}');
        },
        addInput: function(id) {
            var input = JSON.parse('{"id" : "' + id + '"}');
            this.inputs.push(input);
        },
        deleteInput: function(id) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        },
        printInputs: function() {
            return this.inputs;
            for (var i = 0; i < this.inputs.length; i++) {
                alert(JSON.stringify(this.inputs[i]));
            }
        }
    });
});
