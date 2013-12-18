define(["dojo/_base/declare", "dojo/_base/json"]
        , function(declare, dojo) {

    return declare(null, {
        name: "",
        inputs: "",
        position: "",
        studentSelections: "",
        constructor: function(name, xPos, yPos) {
            this.name = name;
            this.inputs = new Array();
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
            this.studentSelections = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null
                    + '",\n"initial" : ' + null + ',\n"equation" : "' + null + '"}');
        },addInput: function(name) {
            var input = '{"name" : "' + name + '"}';
            var obj = JSON.parse(input);
            this.inputs.push(obj);
        },
        deleteInput: function(name) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (name === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                    i++;
                }
            }
        }
    });
});