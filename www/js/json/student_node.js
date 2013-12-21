define(["dojo/_base/declare", "dojo/_base/json"]
        , function(declare, dojo) {

    return declare(null, {
        constructor: function(id, xPos, yPos) {
            this.id = id;
            this.name = "";
            this.inGivenModel = false;
            this.inputs = new Array();
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
            this.studentSelections = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null
                    + '",\n"initial" : ' + null + ',\n"equation" : "' + null + '"}');
        },
        addInput: function(id) {
            var input = JSON.parse('{"id" : ' + id + '}');
            this.inputs.push(input);
        },
        deleteInput: function(id) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        }
    });
});
