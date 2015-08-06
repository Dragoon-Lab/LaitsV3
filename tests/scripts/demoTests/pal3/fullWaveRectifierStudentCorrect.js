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

describe("Coached mode with correct full wave rectifier", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","full-wave-rectifier"],["mode","COACHED"],
                                      ["section","PAL3-test"],
                                      ["logging","true"]]);
    }));

     describe("Creating nodes:", function(){
        it("Should create Function node - V across RL", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "Voltage across load resistance");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Function");
            dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "volts");     
            dtest.setNodeExpression(client, "Current through RL*R of RL");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - Current through RL", async(function(){
            dtest.openEditorForNode(client, "Current through RL");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "Current through CR1+Current through CR2");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

         it("Should fill in Parameter node - R of RL", async(function(){
            dtest.openEditorForNode(client, "R of RL");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 1000);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Current through CR1", async(function(){
            dtest.openEditorForNode(client, "Current through CR1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "V across upper half of secondary winding/R of CR1 and RL");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - Current through CR2", async(function(){
            dtest.openEditorForNode(client, "Current through CR2");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "amps");
            dtest.setNodeExpression(client, "V across lower half of secondary winding/R of CR2 and RL");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

         it("Should fill in Function node - V across upper half of secondary winding", async(function(){
            dtest.openEditorForNode(client, "V across upper half of secondary winding");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "input voltage");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - V across lower half of secondary winding", async(function(){
            dtest.openEditorForNode(client, "V across lower half of secondary winding");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "-input voltage");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - R of CR1 and RL", async(function(){
            dtest.openEditorForNode(client, "R of CR1 and RL");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "ohms");
            dtest.setNodeExpression(client, "R of RL+R of CR1");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - R of CR2 and RL", async(function(){
            dtest.openEditorForNode(client, "R of CR2 and RL");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "ohms");
            dtest.setNodeExpression(client, "R of RL+R of CR2");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - R of CR1", async(function(){
            dtest.openEditorForNode(client, "R of CR1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "ohms");
            dtest.setNodeExpression(client, "if(V across upper half of secondary winding>knee voltage of CR1,10,10^8)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Parameter node - knee voltage of CR1", async(function(){
            dtest.openEditorForNode(client, "knee voltage of CR1");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.7);
            dtest.setNodeUnits(client, "volts");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Function node - R of CR2", async(function(){
            dtest.openEditorForNode(client, "R of CR2");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "ohms");
            dtest.setNodeExpression(client, "if(V across lower half of secondary winding>knee voltage of CR2,10,10^8)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in Parameter node - knee voltage of CR2", async(function(){
            dtest.openEditorForNode(client, "knee voltage of CR2");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.7);
            dtest.setNodeUnits(client, "volts");
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
            var VacrossRLValues = ["0.00","1.55","3.06","4.49", "5.82", "7.00", "8.01", "8.82" ,"9.42", "9.78"];
            VacrossRLValues.some(function(val, index){
                if((dtest.tableGetValue(client, index, 11) != VacrossRLValues[index])){
                    message += "\n required: "+VacrossRLValues[index]+", found: "+dtest.tableGetValue(client, index, 11);
                    currentVal = false;
                }
            });

            assert(currentVal === true,
                "Values in the \"V across RL (volts)\" column were incorrect. " + message);

            dtest.closeGraphAndTableWindow(client);
        }));
    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["V across RL", "Current through RL", "R of RL",
            "Current through CR1", "Current through CR2"];
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
            var nodesToCheck = ["V across upper half of secondary winding",
            "V across lower half of secondary winding","R of CR1 and RL", "R of CR2 and RL"];
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
            var nodesToCheck = ["R of CR1", "knee voltage of CR1", "R of CR2", "knee voltage of CR2"];
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
            var nodeName = "V across RL"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across RL"],
                                    ["expectedDescription", "Voltage across load resistance"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "Current through RL*R of RL"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "Current through RL"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current through RL"],
                                    ["expectedDescription", "Current through load resistance RL"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "Current through CR1+Current through CR2"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Parameter values and colors", async(function(){
            var nodeName = "R of RL"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of RL"],
                                    ["expectedDescription", "Resistance of load resistor RL"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "1000"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "Current through CR1";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current through CR1"],
                                    ["expectedDescription", "Current through diode CR1"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "V across upper half of secondary winding/R of CR1 and RL"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));

        it("Should have correct Function values and colors", async(function(){
            var nodeName = "Current through CR2";

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "Current through CR2"],
                                    ["expectedDescription", "Current through diode CR2"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "amps"],
                                    ["expectedExpression", "V across lower half of secondary winding/R of CR2 and RL"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);            
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across upper half of secondary winding"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across upper half of secondary winding"],
                                    ["expectedDescription", "voltage coupled between the upper end of the secondary transformer and center tap"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "input voltage"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "V across lower half of secondary winding"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "V across lower half of secondary winding"],
                                    ["expectedDescription", "voltage coupled between the center tap and the lower end of the secondary winding of the transformer"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedExpression", "-input voltage"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "R of CR1 and RL"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of CR1 and RL"],
                                    ["expectedDescription", "R of CR1 and RL"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedExpression", "R of RL+R of CR1"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));
        it("Should have correct function values and colors", async(function(){
            var nodeName = "R of CR2 and RL"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of CR2 and RL"],
                                    ["expectedDescription", "R of CR2 and RL"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedExpression", "R of RL+R of CR2"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));
        it("Should have correct function values and colors", async(function(){
            var nodeName = "R of CR1"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of CR1"],
                                    ["expectedDescription", "R of CR1"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedExpression", "if(V across upper half of secondary winding>knee voltage of CR1,10,10^8)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Parameter values and colors", async(function(){
            var nodeName = "knee voltage of CR1"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "knee voltage of CR1"],
                                    ["expectedDescription", "knee voltage of diode CR1"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.7"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "R of CR2"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "R of CR2"],
                                    ["expectedDescription", "Resistance of diode CR2"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "ohms"],
                                    ["expectedExpression", "if(V across lower half of secondary winding>knee voltage of CR2,10,10^8)"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "gray"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "green"]], dtest, client);
        }));

        it("Should have correct Parameter values and colors", async(function(){
            var nodeName = "knee voltage of CR2"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "knee voltage of CR2"],
                                    ["expectedDescription", "knee voltage of CR2"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.7"],
                                    ["expectedNodeUnits", "volts"],
                                    ["expectedDescriptionColor", "green"],
                                    ["expectedTypeColor", "green"],
                                    ["expectedInitialColor", "green"],
                                    ["expectedUnitsColor", "green"],
                                    ["expectedExpressionColor", "gray"]], dtest, client);
        }));
    });
    after(function(done) {
            client.end();
            done();
    });
});