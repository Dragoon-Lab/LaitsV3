
define(["dojo/_base/declare"]
        , function(declare) {

    return declare(null, {
        constructor: function(id, order) { //(string, int)
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
        addInput: function(id) { //(string)
            var input = JSON.parse('{"ID" : "' + id + '"}');
            this.inputs.push(input);
        },
        deleteInput: function(id) { //(string)
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        },
        addAttempt: function(desc, plan, calc) { //(bool, bool, bool)
            if (desc === true)
                this.attemptCount.desc += 1;
            if (plan === true)
                this.attemptCount.plan += 1;
            if (calc === true)
                this.attemptCount.calc += 1;
        },
        addSolution: function(desc, plan, calc) { //(bool, bool, bool)
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
