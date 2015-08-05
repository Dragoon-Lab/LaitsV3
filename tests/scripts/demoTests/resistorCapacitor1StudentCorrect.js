// Set up initial variables

 // Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote({
    //logLevel: "verbose",
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'

    }
});

// import chai assertion library
var assert = require('chai').assert;
// import dragoon test library module
var dtest = require('../dtestlib.js');
// import dragoon assertion library
var atest = require('../assertTestLib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Student mode with correct resistor capacitor 1", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","resistor-capacitor-1"],["mode","STUDENT"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Accumulator node - Voltage across capacitor", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "Voltage across capacitor from top to bottom of figure");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 0);
            dtest.setNodeUnits(client, "volts");     
            dtest.setNodeExpression(client, "Change in voltage across capacitor");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - Change in voltage across capacitor", async(function(){
            dtest.openEditorForNode(client, "Change in voltage across capacitor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Current/capacitance of capacitor");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

         it("Should fill in Function node - Current", async(function(){
            dtest.openEditorForNode(client, "Current");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "Voltage across resistor/Resistance of resistor");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - capacitance of capacitor", async(function(){
            dtest.openEditorForNode(client, "capacitance of capacitor");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.003);
            dtest.setNodeUnits(client, "farads");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - Resistance of resistor", async(function(){
            dtest.openEditorForNode(client, "Resistance of resistor");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 500);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - Voltage across resistor", async(function(){
            dtest.openEditorForNode(client, "Voltage across resistor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Source voltage-Voltage across capacitor");
            dtest.nodeEditorDone(client);
             dtest.popupWindowPressOk(client);
        }));
    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["Voltage across capacitor", "Change in voltage across capacitor", "Current",
            "capacitance of capacitor", "Resistance of resistor", "Voltage across resistor"];
            //Does test for all nodes
            nodesToCheck.forEach(function(element){
                //Gets values
                var nodeBorderColor = dtest.getNodeBorderColor(client, element);
                var nodeBorderStyle = dtest.getNodeBorderStyle(client, element);
                var nodeFillColor = dtest.getNodeFillColor(client, element);
                //Asserts values
                assert(nodeBorderColor === "green",
                    "Node border color for " + element + " was " + nodeBorderColor + " instead of green");
                assert(nodeBorderStyle === "solid",
                    "Node border style for " + element + " was " + nodeBorderStyle + " instead of solid");
                assert(nodeFillColor === "green",
                    "Node fill color for " + element + " was " + nodeFillColor + " instead of green");
            });
        }));
    });

    describe("Checking Nodes:", function(){
        
        afterEach(async(function(){
            dtest.nodeEditorDone(client);
        }));

        it("Should have correct Accumulator values and colors", async(function(){
            var nodeName = "Voltage across capacitor"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Voltage across capacitor"],
                                    ["expectedDescription", "Voltage across capacitor from top to bottom of figure"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "0"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Change in voltage across capacitor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Change in voltage across capacitor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Change in voltage across capacitor"],
                                    ["expectedDescription", "how much voltage across capacitor increases"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Current/capacitance of capacitor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Current"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current"],
                                    ["expectedDescription", "current through resistor and capacitor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "Voltage across resistor/Resistance of resistor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "capacitance of capacitor";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "capacitance of capacitor"],
                                    ["expectedDescription", "capacitance of capacitor"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.003"],
                                    ["expectedNodeUnits", "farads"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "Resistance of resistor";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Resistance of resistor"],
                                    ["expectedDescription", "Resistance of resistor"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "500"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Voltage across resistor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Voltage across resistor"],
                                    ["expectedDescription", "Voltage across resistor from left to right"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Source voltage-Voltage across capacitor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

    });

    describe("Checking graph/table window:", function(){
        it("Should open the table window and check the table values", async(function(){
            dtest.menuOpenTable(client);
            var voltageVal = true;
            var time = 0;
            var message = "";
            if(!(dtest.tableGetValue(client, 0, 1) == "0.00")){
                message += "\n First - required: 0.00, found: "+dtest.tableGetValue(client, 0, 1);
                voltageVal = false;
            }
            if(!(dtest.tableGetValue(client, 9 , 1) == "0.0203")){
                message += "\n Last - required: 0.0203, found: "+dtest.tableGetValue(client, 9, 1);
                voltageVal = false;
            }

            assert(voltageVal === true,
                "Values in the \"Voltage across capacitor (volts)\" column were incorrect. " + message);
        }));
    });

});