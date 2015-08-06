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

describe("Coached mode with correct basic capacitor filter", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","basic-capacitor-filter"],["mode","COACHED"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Accumulator node - voltage across RL", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "output voltage across to the resistor RL");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Function");
            dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "volts");     
            dtest.setNodeExpression(client, "voltage across C1");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - voltage across C1", async(function(){
            dtest.openEditorForNode(client, "voltage across C1");
            dtest.setNodeType(client, "Accumulator");
            dtest.setNodeInitialValue(client, 0);
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "C1 charging-C1 discharging");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

         it("Should fill in Function node - C1 charging", async(function(){
            dtest.openEditorForNode(client, "C1 charging");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "max(0,Half wave rectified output-voltage across C1)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - C1 discharging", async(function(){
            dtest.openEditorForNode(client, "C1 discharging");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Current through RL/c of C1");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - Current through RL", async(function(){
            dtest.openEditorForNode(client, "Current through RL");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "voltage across RL/R of RL");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - c of C1", async(function(){
            dtest.openEditorForNode(client, "c of C1");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.25);
            dtest.setNodeUnits(client, "farads");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - R of RL", async(function(){
            dtest.openEditorForNode(client, "R of RL");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 1000);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
            dtest.popupWindowPressOk(client);
        }));
    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["voltage across RL", "voltage across C1", "C1 charging",
            "C1 discharging", "Current through RL", "c of C1", "R of RL"];
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

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "voltage across RL"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "voltage across RL"],
                                    ["expectedDescription", "output voltage across to the resistor RL"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "voltage across C1"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Accumulator values and colors", async(function(){
            var nodeName = "voltage across C1"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "voltage across C1"],
                                    ["expectedDescription", "voltage across the capacitor"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "0"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "C1 charging-C1 discharging"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "C1 charging"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "C1 charging"],
                                    ["expectedDescription", "voltage added to the capacitor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "max(0,Half wave rectified output-voltage across C1)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "C1 discharging";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "C1 discharging"],
                                    ["expectedDescription", "voltage removed from the capacitor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Current through RL/c of C1"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "Current through RL";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current through RL"],
                                    ["expectedDescription", "current through load resistor RL"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "voltage across RL/R of RL"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));
        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "c of C1";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "c of C1"],
                                    ["expectedDescription", "capacitance of capacitor C1"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.25"],
                                    ["expectedNodeUnits", "farads"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));
        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "R of RL";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of RL"],
                                    ["expectedDescription", "Load resistor RL"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "1000"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

    });

    describe("Checking graph/table window:", function(){
        it("Should open the table window and check the table values", async(function(){
            dtest.menuOpenTable(client);
            var voltageVal = true;
            var time = 0;
            var message = "";
            var VacrossC1Values = ["0.00","5.88","9.94","9.47", "9.43", "9.40", "9.36", "9.32" ,"9.28", "9.25"];
            VacrossC1Values.some(function(val, index){
                if((dtest.tableGetValue(client, index, 1) != VacrossC1Values[index])){
                    message += "\n required: "+VacrossC1Values[index]+", found: "+dtest.tableGetValue(client, index, 1);
                    currentVal = false;
                }
            });

            assert(voltageVal === true,
                "Values in the \"Output Voltage (volts)\" column were incorrect. " + message);

            dtest.closeGraphAndTableWindow(client);
            
        }));
    });
    after(function(done) {
            client.end();
            done();
    });
});