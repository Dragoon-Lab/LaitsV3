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
var dtest = require('../../dtestlib.js');
// import dragoon assertion library
var atest = require('../../assertTestLib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Student mode with correct resistor Inductor 1", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","resistor-inductor-1"],["mode","COACHED"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Accumulator node - Current", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "Current thru inductor and resistor from left to right");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 0);
            dtest.setNodeUnits(client, "amps");     
            dtest.setNodeExpression(client, "Change in current");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - Change in current", async(function(){
            dtest.openEditorForNode(client, "Change in current");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "V across inductor/L of inductor");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

         it("Should fill in Function node - V across inductor", async(function(){
            dtest.openEditorForNode(client, "V across inductor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Source voltage-V across resistor");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - L of inductor", async(function(){
            dtest.openEditorForNode(client, "L of inductor");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 4);
            dtest.setNodeUnits(client, "henries");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - V across resistor", async(function(){
            dtest.openEditorForNode(client, "V across resistor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Current*R of resistor");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - R of resistor", async(function(){
            dtest.openEditorForNode(client, "R of resistor");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 5);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
             dtest.popupWindowPressOk(client);
        }));

    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["Current", "Change in current", "V across inductor",
            "L of inductor", "V across resistor", "R of resistor"];
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
            var nodeName = "Current"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current"],
                                    ["expectedDescription", "Current thru inductor and resistor from left to right"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "0"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "Change in current"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Change in current"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Change in current"],
                                    ["expectedDescription", "change in inductor-resistor current"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "V across inductor/L of inductor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across inductor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across inductor"],
                                    ["expectedDescription", "Voltage across inductor from left to right"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Source voltage-V across resistor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "L of inductor";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "L of inductor"],
                                    ["expectedDescription", "Inductance of inductor"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "4"],
                                    ["expectedNodeUnits", "henries"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "R of resistor";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of resistor"],
                                    ["expectedDescription", "Resistance of resistor"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "5"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across resistor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across resistor"],
                                    ["expectedDescription", "Voltage across resistor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Current*R of resistor"],
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
            var currentVal = true;
            var time = 0;
            var message = "";
            if(!(dtest.tableGetValue(client, 0, 1) == "0.00")){
                message += "\n First - required: 0.00, found: "+dtest.tableGetValue(client, 0, 1);
                currentVal = false;
            }
            if(!(dtest.tableGetValue(client, 9 , 1) == "-0.000973")){
                message += "\n Last - required: -0.000973, found: "+dtest.tableGetValue(client, 9, 1);
                currentVal = false;
            }

            assert(currentVal === true,
                "Values in the \"Current (amps)\" column were incorrect. " + message);
        }));
    });
    after(function(done) {
            client.end();
            done();
    });
});