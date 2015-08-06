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

describe("Coached mode with correct bridge rectifier capacitor", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor"],["mode","COACHED"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Function node - Output voltage", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "Voltage across capacitor and load resistor");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 0);
            dtest.setNodeUnits(client, "volts");     
            dtest.setNodeExpression(client, "charging capacitor-discharging capacitor");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - discharging capacitor", async(function(){
            dtest.openEditorForNode(client, "discharging capacitor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Output current/Capacitance of capacitor");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

         it("Should fill in Parameter node - Capacitance of capacitor", async(function(){
            dtest.openEditorForNode(client, "Capacitance of capacitor");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.1);
            dtest.setNodeUnits(client, "farad");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Output current", async(function(){
            dtest.openEditorForNode(client, "Output current");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "Output voltage/resistance of load");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - resistance of load", async(function(){
            dtest.openEditorForNode(client, "resistance of load");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 5000);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - charging capacitor", async(function(){
            dtest.openEditorForNode(client, "charging capacitor");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "max(0,Lumpy positive voltage-Output voltage)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Lumpy positive voltage", async(function(){
            dtest.openEditorForNode(client, "Lumpy positive voltage");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Positive peaks-Negative peaks");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Positive peaks", async(function(){
            dtest.openEditorForNode(client, "Positive peaks");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "max(0,AC voltage source)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Negative peaks", async(function(){
            dtest.openEditorForNode(client, "Negative peaks");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "min(0,AC voltage source)");
            dtest.nodeEditorDone(client);
            dtest.popupWindowPressOk(client);
        }));
    });

    describe("Checking graph/table window:", function(){
        it("Should open the table window and check the table values", async(function(){
            dtest.menuOpenTable(client);
            var currentVal = true;
            var time = 0;
            var message = "";
            var VacrossRLValues = ["0.00","2.94","4.04","4.75", "4.99", "4.98", "4.97", "4.96" ,"4.95", "4.94"];
            VacrossRLValues.some(function(val, index){
                if((dtest.tableGetValue(client, index, 1) != VacrossRLValues[index])){
                    message += "\n required: "+VacrossRLValues[index]+", found: "+dtest.tableGetValue(client, index, 1);
                    currentVal = false;
                }
            });

            assert(currentVal === true,
                "Values in the \"Output Voltage (volts)\" column were incorrect. " + message);

            dtest.closeGraphAndTableWindow(client);
        }));
    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["Output voltage", "discharging capacitor", "Capacitance of capacitor",
            "Output current", "resistance of load"];
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
        
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["charging capacitor",
            "Lumpy positive voltage","Positive peaks", "Negative peaks", "AC voltage source"];
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
            var nodeName = "Output voltage"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Output voltage"],
                                    ["expectedDescription", "Voltage across capacitor and load resistor"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "0"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "charging capacitor-discharging capacitor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "discharging capacitor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "discharging capacitor"],
                                    ["expectedDescription", "Voltage removed from capacitor by output current"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Output current/Capacitance of capacitor"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Parameter values and colors", async(function(){
            var nodeName = "Capacitance of capacitor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Capacitance of capacitor"],
                                    ["expectedDescription", "Capacitance of capacitor"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.1"],
                                    ["expectedNodeUnits", "farad"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "Output current";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Output current"],
                                    ["expectedDescription", "Current through load"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "Output voltage/resistance of load"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "resistance of load";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "resistance of load"],
                                    ["expectedDescription", "Resistance of the load"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "5000"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "charging capacitor"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "charging capacitor"],
                                    ["expectedDescription", "Voltage added to capacitor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "max(0,Lumpy positive voltage-Output voltage)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Lumpy positive voltage"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Lumpy positive voltage"],
                                    ["expectedDescription", "AC voltage with negative peaks flipped over"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Positive peaks-Negative peaks"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Negative peaks"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Negative peaks"],
                                    ["expectedDescription", "AC voltage with positive peaks removed"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "min(0,AC voltage source)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));
        it("Should have correct function values and colors", async(function(){
            var nodeName = "Positive peaks"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Positive peaks"],
                                    ["expectedDescription", "AC voltage with negative peaks removed"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "max(0,AC voltage source)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));
    });
    after(function(done) {
            client.end();
            done();
    });
});