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

describe("Coached mode with correct static zener diode regulator", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","static-zener-diode-regulator"],["mode","COACHED"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Accumulator node - R of Zener", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "Resistance of the Zener diode");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Function");
            dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "ohms");     
            dtest.setNodeExpression(client, "V across Zener/Current thru Zener");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Parameter node - V across Zener", async(function(){
            dtest.openEditorForNode(client, "V across Zener");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 13);
            dtest.setNodeUnits(client, "volts");
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - Current thru Zener", async(function(){
            dtest.openEditorForNode(client, "Current thru Zener");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "Current thru R1-Current thru Load R");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Current thru Load R", async(function(){
            dtest.openEditorForNode(client, "Current thru Load R");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "V across Load R/R of Load R");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - R of Load R", async(function(){
            dtest.openEditorForNode(client, "R of Load R");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 1000);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - V across Load R", async(function(){
            dtest.openEditorForNode(client, "V across Load R");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "V across Zener");
            dtest.nodeEditorDone(client);
        }));
        
        it("Should fill in Function node - Current thru R1", async(function(){
            dtest.openEditorForNode(client, "Current thru R1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "V across R1/R of R1");
            dtest.nodeEditorDone(client);
        })); 

         it("Should fill in Function node - V across R1", async(function(){
            dtest.openEditorForNode(client, "V across R1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Supply V-V across Zener");
            dtest.nodeEditorDone(client);
             dtest.popupWindowPressOk(client);
        }));

    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["R of Zener", "V across Zener", "Current thru Zener",
            "Current thru Load R", "R of Load R", "V across Load R", "Current thru R1", "V across R1"];
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
            var nodeName = "R of Zener"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of Zener"],
                                    ["expectedDescription", "Resistance of the Zener diode"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedExpression", "V across Zener/Current thru Zener"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "V across Zener"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across Zener"],
                                    ["expectedDescription", "Voltage drop across the Zener diode"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "13"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Current thru Zener"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current thru Zener"],
                                    ["expectedDescription", "Current through the Zener diode"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "Current thru R1-Current thru Load R"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Current thru Load R";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current thru Load R"],
                                    ["expectedDescription", "Current through the load resistance"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "R of Load R";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of Load R"],
                                    ["expectedDescription", "Resistance of load resistor R"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "1000"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);            
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across Load R"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across Load R"],
                                    ["expectedDescription", "Voltage drop across the load resistor"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "V across Zener"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Current thru R1"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current thru R1"],
                                    ["expectedDescription", "Current thru R1"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "V across R1/R of R1"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across R1"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across R1"],
                                    ["expectedDescription", "Voltage drop across resistor R1"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Supply V-V across Zener"],
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
            var ROfZener = true;
            var time = 0;
            var message = "";
            if(!(dtest.tableGetValue(client, 0, 6) == "502")){
                message += "\n First - required: 502, found: "+dtest.tableGetValue(client, 0, 6);
                ROfZener = false;
            }
            if(!(dtest.tableGetValue(client, 1000 , 6) == "502")){
                message += "\n Last - required: 502, found: "+dtest.tableGetValue(client, 1000, 6);
                ROfZener = false;
            }

            assert(ROfZener === true,
                "Values in the \"Current (amps)\" column were incorrect. " + message);
        }));
    });
    after(function(done) {
            client.end();
            done();
    });
});