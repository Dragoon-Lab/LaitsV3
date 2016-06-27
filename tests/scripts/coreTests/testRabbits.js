
// Set up initial variables

 // Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote(
{    //logLevel: "verbose",
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

describe("Test mode with correct rabbits", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","TEST"],
                                      ["section","regression-testing"],
                                      ["logging","true"]]);
    }));

    describe("Creating nodes:", function(){
        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.setNodeType(client, "Accumulator");
            dtest.setNodeInitialValue(client, 24);
            dtest.setNodeUnits(client, "rabbits");     
            dtest.setNodeExpression(client, "net growth");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in function node - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeExpression(client, "growth rate*population");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

        it("Should fill in parameter node - growth rate", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.3);
            dtest.setNodeUnits(client, "1/year");
            dtest.nodeEditorDone(client);
        }));

    });
    describe("Checking node colors", function(){
        it("Nodes should not show any color", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["population", "net growth", "growth rate"];
            //Does test for all nodes
            nodesToCheck.forEach(function(element){
                //Gets values
                var nodeBorderColor = dtest.getNodeBorderColor(client, element);
                var nodeBorderStyle = dtest.getNodeBorderStyle(client, element);
                var nodeFillColor = dtest.getNodeFillColor(client, element);
                //Asserts values
                assert(nodeBorderColor === "gray",
                    "Node border color for " + element + " was " + nodeBorderColor + " instead of gray");
                assert(nodeBorderStyle === "solid",
                    "Node border style for " + element + " was " + nodeBorderStyle + " instead of solid");
                assert(nodeFillColor === "white",
                    "Node fill color for " + element + " was " + nodeFillColor + " instead of white");
            });
        }));
    });
    
    describe("Checking Nodes:", function(){
        
        afterEach(async(function(){
            dtest.nodeEditorDone(client);
        }));

        it("Should have correct Accumulator values and colors", async(function(){
            var nodeName = "population"
            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "population"],
                                    ["expectedDescription", "The number of rabbits in the population"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "24"],
                                    ["expectedNodeUnits", "rabbits"],
                                    ["expectedExpression", "net growth"],
                                    ["expectedDescriptionColor", "white"],
                                    ["expectedTypeColor", "white"],
                                    ["expectedInitialColor", "white"],
                                    ["expectedUnitsColor", "white"],
                                    ["expectedExpressionColor", "white"]], dtest, client);
        }));

        it("Should have correct function values and colors", async(function(){
            var nodeName = "net growth"

            dtest.openEditorForNode(client, nodeName);

            atest.checkNodeValues([["nodeName", "net growth"],
                                    ["expectedDescription", "The number of additional rabbits each year"],
                                    ["expectedNodeType", "Function"],
                                    ["expectedNodeUnits", "rabbits/year"],
                                    ["expectedExpression", "growth rate*population"],
                                    ["expectedDescriptionColor", "white"],
                                    ["expectedTypeColor", "white"],
                                    ["expectedUnitsColor", "white"],
                                    ["expectedExpressionColor", "white"]], dtest, client);
        }));

        it("Should have correct parameter values and colors", async(function(){
            var nodeName = "growth rate";

            dtest.openEditorForNode(client, "growth rate");

            atest.checkNodeValues([["nodeName", "growth rate"],
                                    ["expectedDescription", "The number of additional rabbits per year per rabbit"],
                                    ["expectedNodeType", "Parameter"],
                                    ["expectedInitialValue", "0.3"],
                                    ["expectedNodeUnits", "1/year"],
                                    ["expectedDescriptionColor", "white"],
                                    ["expectedTypeColor", "white"],
                                    ["expectedInitialColor", "white"],
                                    ["expectedUnitsColor", "white"]], dtest, client);
        }));
    });

    describe("Checking graph/table window:", function(){
        it("Should open the table window and check the table values", async(function(){
            dtest.menuOpenTable(client);

            var years = true;
            var current = 1859;
            for(var i = 0; i < 61; i++)
            {
                if(!(dtest.tableGetValue(client, i, 0) == current))
                {
                    years = false;
                }
                current++;
            }

            //Population (rabbits) coumn
            var population = true;
            var populationValues = [24,31.2,40.6,52.7,68.5,89.1,116,151,196,255,331,430,559,727,945];
            for(var i = 0; i < populationValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 1) == populationValues[i]))
                {
                    population = false;
                }
            }

            //Net growth (rabbits/year)
            var netGrowth = true;
            var netGrowthValues = [7.20,9.36,12.2,15.8,20.6,26.7,34.8,45.2,58.7,76.4,99.3,129,168,218];
            for(var i = 0; i < netGrowthValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 2) == netGrowthValues[i]))
                {
                    population = false;
                }
            }

            assert(years === true,
                "Values in the \"Time (years)\" column were incorrect");
            assert(population === true,
                "Values in the \"population (rabbits)\" column were incorrect");
            assert(netGrowth === true,
                "Values in the \"net growth (rabbits/year)\" column were incorrect");
        }));

        it("Should switch to graph tab and check the message", async(function(){
            dtest.selectGraphTab(client);
            var message = dtest.getGraphResultText(client);

            assert(message == "Congratulations, your model's behavior matches the author's!",
                "Message text was " + message + " instead of Congratulations, your model's behavior matches the author's!");
        }));
    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});