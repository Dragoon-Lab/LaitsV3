/**
 * 
 * Student Model node creation class used by model.js for Dragoon problems
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
        constructor: function(/*string*/ id, /*int*/ xPos, /*int*/ yPos) {
            this.ID = id;
            this.name = "";
            this.inGivenModel = false;
            this.inputs = new Array();
            this.position = {x: xPos, y: yPos};
            this.studentSelections = {description: null, type: null, initial: null, units: null, equation: null};
        },
        addInput: function(/*string*/ id) {
            var input = {ID: id};
            this.inputs.push(input);
        },
        deleteInput: function(/*string*/ id) {
            for (var i = 0; i < this.inputs.length; i++) {
                if (id === this.inputs[i]) {
                    this.inputs.splice(this.inputs.indexOf(this.inputs[i]), 1);
                }
            }
        },
        setStudentSeletions: function(/*string*/ desc, /*string*/ type, /*string*/ init, /*float*/ units, /*string*/ equat) {
            if (desc !== null)
                this.studentSelections.description = desc;
            if (type !== null)
                this.studentSelections.type = type;
            if (init !== null)
                this.studentSelections.initial = init;
            if (units !== null)
                this.studentSelections.units = units;
            if (equat !== null)
                this.studentSelections.equation = equat;

        }
    });
});
