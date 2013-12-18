
define(["dojo/_base/declare", "dojo/_base/json"]
        , function(declare, dojo) {

    return declare(null, {
        type: "",
        id: "",
        name: "",
        extra: "",
        order: "",
        units: "",
        inputs: "",
        position: "",
        initial: "",
        equation: "",
        correctDesc: "",
        attemptCount: "",
        solution: "",
        constructor: function(name, xPos, yPos) {
            this.type = "";
            this.id = "";
            this.name = name;
            this.extra = "";
            this.order = "";
            this.units = "";
            this.inputs = new Array();
            this.position = JSON.parse('{"x" : ' + xPos + ',\n"y" : ' + yPos + '}');
            this.initial = "";
            this.equation = "";
            this.correctDesc = "";
            this.attemptCount = JSON.parse('{"desc" : ' + null + ',\n"plan" : ' + null + ',\n"calc" : ' + null +'}');
            this.solution = JSON.parse('{"desc" : "' + null + '",\n"plan" : "' + null + '",\n"calc" : "' + null +'"}');

        },
        addInput: function(name) {
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
        },
        printInputs: function() {
            return this.inputs;
            for (var i = 0; i < this.inputs.length; i++) {
                alert(JSON.stringify(this.inputs[i]));
            }
        }

    });

});
