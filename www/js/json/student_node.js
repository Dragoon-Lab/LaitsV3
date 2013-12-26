define(["dojo/_base/declare"]
        , function(declare) {

    return declare(null, {
        constructor: function(id, xPos, yPos) {
            this.ID = id;
            this.name = "";
            this.inGivenModel = false;
            this.inputs = new Array();
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
            this.studentSelections = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null
                    + '",\n"units" : "' + null + '",\n"initial" : ' + null + ',\n"equation" : "' + null + '"}');
        },
        addInput: function(id) {
            var input = JSON.parse('{"ID" : "' + id + '"}');
            this.inputs.push(input);
        },
        deleteInput: function(id) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        },
        setStudentSeletions: function(desc, plan, units, initial, equation) {
            if (desc !== null)
                this.studentSelections.desc = desc;
            if (plan !== null)
                this.studentSelections.plan = plan;
            if (units !== null)
                this.studentSelections.units = units;
            if (initial !== null)
                this.studentSelections.initial = initial;
            if (equation !== null)
                this.studentSelections.equation = equation;

        }
    });
});
