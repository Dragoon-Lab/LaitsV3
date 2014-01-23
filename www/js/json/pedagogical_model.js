/**
 * 
 * Pedagogical Model class used to solve Dragoon problems
 * @author: Brandon Strong
 * 
 *      ********* IN PROGRESS--NOT COMPLETE *********
 * 
 **/

/**
 * 
 */

define(["dojo/_base/declare"]
        , function(declare) {

    return declare(null, {
        constructor: function(/*string*/ user, /*model.js object*/model) {
            this.userType = user;
            this.model = model;
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
            var id = this.model.getNodeIDByDescription(answer);
            var interpretation;
            alert(id);
            if(this.model.isParentNode(id)){
                this.model.addStudentNodeWithName(this.model.getNodeName);
                interpretation = "optimal";
            }else if(this.model.isNodesParentVisible){
                this.model.addStudentNodeWithName(this.model.getNodeName);
                interpretation = "optimal";
            }
            switch (this.userType) {
                case "coached":
                    break;
                case "feedback":
                    break;
                case "test":
                    break;
                case "power":
                    break;
            }
        }
    });
});
