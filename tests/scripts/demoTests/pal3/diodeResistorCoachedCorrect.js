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

describe("Coached mode with correct diode resistor 2", function() {

    before(async(function (done) {
        var date = new Date();
        dtest.openProblem(client,[["problem","diode-resistor"],["mode","COACHED"],
                                  ["section","PAL3-regression-testing"],["revisionID","jon.wetzel@asu.edu"+date.getTime()],
                                  /*["user","jon.wetzel@asu.edu"],*/["restart","on"],
                                  ["logging","true"],["topic","Diode Action"]]);
    }));

    describe("Creating nodes:", function(){
        it("Should create Function node - I around loop", async(function(){
            dtest.openEditorForNode(client, "I around loop");
            dtest.setNodeType(client, "Function");
            dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "amps");
            dtest.popupWindowPressOk(client);
            dtest.setNodeExpression(client, "V across R1/R of R1");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in function node - V across R1", async(function(){
            dtest.openEditorForNode(client, "V across R1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Source V-V across D1");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

        it("Should fill in parameter node - R of R1", async(function(){
            dtest.openEditorForNode(client, "R of R1");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 500);
            dtest.setNodeUnits(client, "ohms");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in function node - V across D1", async(function(){
            dtest.openEditorForNode(client, "V across D1");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "if(V across D1 when open>Knee voltage,Knee voltage,V across D1 when open)");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in function node - V across D1 when open", async(function(){
            dtest.openEditorForNode(client, "V across D1 when open");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "volts");
            dtest.setNodeExpression(client, "Source V");
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in parameter node - Knee voltage", async(function(){
            dtest.openEditorForNode(client, "Knee voltage");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.7);
            dtest.setNodeUnits(client, "volts");
            dtest.nodeEditorDone(client);
        }));
    });
    describe("Check the score",function(){
        it("Should have some score text", async(function(){
            atest.checkSuccessFactor("Overall",1,dtest,client);
            atest.checkSuccessFactor("diode_behavior-forward",1,dtest,client);
            atest.checkSuccessFactor("diode_behavior-reverse",1,dtest,client);
            atest.checkSuccessFactor("resistor_behavior",1,dtest,client);
            atest.checkSuccessFactor("kirchoff_voltage_law",1,dtest,client);
            atest.checkSuccessFactor("ohms_law",1,dtest,client);
            atest.checkSuccessFactor("zener_diode_behavior-reverse",1,dtest,client);
            atest.checkSuccessFactor("PAL3",1,dtest,client);
        }));
        it("Should close the score alert", async(function(){
            dtest.alertAccept(client);
        }));
    });

    describe("Checking node colors", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["I around loop", "V across R1", "R of R1", 
                                "V across D1", "V across D1 when open", "Knee voltage"];
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

    describe("Checking graph/table window:", function(){
        it("Should open the table window and check the table values", async(function(){
            dtest.menuOpenTable(client);
            var currentValue = true;
            var time = 0;
            var message = "";
            if(!(dtest.tableGetValue(client, 0, 3) == "0.00")){
                message += "\n First - required: 0.00, found: "+dtest.tableGetValue(client, 0, 3);
                currentValue = false;
            }
            if(!(dtest.tableGetValue(client, 199 , 3) == "-0.314")){
                message += "\n Last - required: -0.314, found: "+dtest.tableGetValue(client, 199, 3);
                currentValue = false;
            }

            assert(currentValue === true,
                "Values in the \"voltage across D1 (volts)\" column were incorrect. " + message);
        }));
    });
    after(async(function(done){
        dtest.endTest(client);
    }));
});