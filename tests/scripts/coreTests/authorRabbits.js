
// Set up initial variables

 // Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote({
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});
// import chai assertion library
var assert = require('chai').assert;
// import dragoon test library modules
var dtest = require('../dtestlib.js');
var atest = require('../assertTestLib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Test author mode", function() {

    before(async(function (done) {
            dtest.openProblem(client,[
                ["mode","AUTHOR"], 
                ["section","regression-testing"], 
                ["group","autotest"]]);
    }));

    describe("Testing check on empty problem", function(){
        it("Should detect that the problem is empty", async(function(){
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
            atest.popupContainsText("The problem is empty.",dtest,client);
            dtest.popupWindowPressCancel(client);
        }));
    });

    describe("Testing adding an image",function(){
        it("Should add the rabbits image",async(function(){
            dtest.setProblemImageURL(client,"images/rabbit.jpeg");
            dtest.pressProblemAndTimesDone(client);
        }));
    });
    
    describe("Creating nodes", function(){
        afterEach(async(function(){
            dtest.nodeEditorDone(client);
        }));

        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeName(client, "population");
            //dtest.setKindOfQuantity(client, "in model & required"); // buggy, but uneccessary.
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.setNodeType(client, "Accumulator");
            // 8/5/2015: Noticed that when units are set after initial value here, Dragoon
            //           does not process the units even though the text is entered in the field.
            //           However this doesn't happen when done by hand.
            dtest.setNodeUnits(client, "rabbits");
            dtest.setNodeInitialValue(client, 24);            
            dtest.setNodeExpression(client, "net growth");            
            dtest.checkExpression(client);
        }));

        it("Should open and close the explanation window", async(function(){
            dtest.openEditorForNode(client,"population");
            dtest.nodeEditorOpenExplanation(client);
            dtest.closeExplanation(client);
        }));         

        it("Should open and close the image highlight window", async(function(){
            dtest.openEditorForNode(client,"population");
            dtest.nodeEditorOpenImageHighlighting(client);
            dtest.closeImageHighlighting(client);
        }));

        it("Should fill in function node - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.waitTime(100);          
            dtest.setNodeDescription(client, "The number of additional rabbits each year");
            //dtest.setKindOfQuantity(client, "in model & required");
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeType(client, "Function");
            dtest.setNodeExpression(client, "growth rate*population");
            dtest.clickRootNode(client);
            dtest.checkExpression(client);
            dtest.checkExpression(client);
        }));

        it("Should fill in parameter node - growth rate (incomplete)", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.waitTime(100);         
            dtest.setNodeDescription(client, "The number of additional rabbits per year per rabbit");
            //dtest.setKindOfQuantity(client, "in model & required");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeUnits(client, "1/year");
            dtest.checkExpression(client);
        }));
    });

    describe("Checking Nodes:", function(){
        it("Should detect that the nodes are incomplete", async(function(){            
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
            atest.popupContainsText("The problem has one or more incomplete nodes.",dtest,client);
            dtest.popupWindowPressCancel(client);
            dtest.pressProblemAndTimesDone(client);
        }));

        it("Should fill in parameter and uncheck root node", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.waitTime(100);
            dtest.setNodeInitialValue(client, 0.3);
            dtest.nodeEditorDone(client);
            dtest.openEditorForNode(client, "net growth");
            dtest.waitTime(100);
            dtest.clickRootNode(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should detect that the problem has no root node", async(function(){
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
            atest.popupContainsText("Please mark at least one accumulator or function as \'Root\'.",dtest,client);
            dtest.popupWindowPressCancel(client);
            dtest.pressProblemAndTimesDone(client);
        }));

        it("Should turn the root node on again", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.waitTime(100);
            dtest.clickRootNode(client);
            dtest.nodeEditorDone(client);
        }));        

        it("Should have correct Accumulator values", async(function(){
            dtest.openEditorForNode(client, "population");

            var description = dtest.getNodeDescription(client);
            var nodeType = dtest.getNodeType(client);
            var initialValue = dtest.getNodeInitialValue(client);
            var nodeUnits = dtest.getNodeUnits(client);
            var expression = dtest.getNodeExpression(client);

            dtest.nodeEditorDone(client);

            var expectedDescription = "The number of rabbits in the population";
            var expectedNodeType = "Accumulator";
            var expectedInitialValue = "24";
            var expectedNodeUnits = "rabbits";
            var expectedExpression = "net growth";

            assert(description === expectedDescription,
                "Description was " + description + " instead of \"" + expectedDescription + "\"");
            assert(nodeType === expectedNodeType,
                "Node type was " + nodeType + " instead of \"" + expectedNodeType + "\"");
            assert(initialValue === expectedInitialValue,
                "Initial value was " + initialValue + " instead of \"" + expectedInitialValue + "\"");
            assert(nodeUnits === expectedNodeUnits,
                "Units were " + nodeUnits + " instead of \"" + expectedNodeUnits + "\"");
            assert(expression === expectedExpression,
                "Expression was " + expression + "instead of \"" + expectedExpression + "\"");
        }));

        it("Should have correct function values", async(function(){
            dtest.openEditorForNode(client, "net growth");

            var description = dtest.getNodeDescription(client);
            var nodeType = dtest.getNodeType(client);
            var nodeUnits = dtest.getNodeUnits(client);
            var expression = dtest.getNodeExpression(client);

            dtest.nodeEditorDone(client);

            var expectedDescription = "The number of additional rabbits each year";
            var expectedNodeType = "Function";
            var expectedNodeUnits = "rabbits/year";
            var expectedExpression = "growth rate*population";

            assert(description === expectedDescription,
                "Description was " + description + " instead of \"" + expectedDescription + "\"");
            assert(nodeType === expectedNodeType,
                "Node type was " + nodeType + " instead of \"" + expectedNodeType + "\"");
            assert(nodeUnits === expectedNodeUnits,
                "Units were " + nodeUnits + " instead of \"" + expectedNodeUnits + "\"");
            assert(expression === expectedExpression,
                "Expression was " + expression + "instead of \"" + expectedExpression + "\"");
        }));

        it("Should have correct parameter values", async(function(){
            dtest.openEditorForNode(client, "growth rate");

            var description = dtest.getNodeDescription(client);
            var nodeType = dtest.getNodeType(client);
            var initialValue = dtest.getNodeInitialValue(client);
            var nodeUnits = dtest.getNodeUnits(client);

            dtest.nodeEditorDone(client);

            var expectedDescription = "The number of additional rabbits per year per rabbit";
            var expectedNodeType = "Parameter";
            var expectedInitialValue = "0.3";
            var expectedNodeUnits = "1/year";

            assert(description === expectedDescription,
                "Description was " + description + " instead of \"" + expectedDescription + "\"");
            assert(nodeType === expectedNodeType,
                "Node type was " + nodeType + " instead of \"" + expectedNodeType + "\"");
            assert(initialValue === expectedInitialValue,
                "Initial value was " + initialValue + " instead of \"" + expectedInitialValue + "\"");
            assert(nodeUnits === expectedNodeUnits,
                "Units were " + nodeUnits + " instead of \"" + expectedNodeUnits + "\"");
        }));
        
        

        it("Should detect that the problem has no errors", async(function(){
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
            atest.popupContainsText("No errors found.",dtest,client);
            dtest.popupWindowPressCancel(client);
            dtest.pressProblemAndTimesDone(client);
        }));
    });

    describe("Checking graph/table window", function(){
        it("Should open the graph window and switch to table tab", async(function(){
            dtest.menuOpenTable(client);
            //dtest.selectTableTab(client);
        }));

        it("Should have correct table values", async(function(){
            dtest.waitTime(100);
            var years = true;
            var yearsValues = [0.000,1.000,2.000,3.000,4.000,5.000,6.000,7.000,8.000,9.000];
            for(var i = 0; i < yearsValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 0) == yearsValues[i]))
                {
                    years = false;
                }
            }

            //Population (rabbits) coumn
            var population = true;
            var populationValues = [24,31.2,40.6,52.7,68.5,89.1,116,151,196,255];
            for(var i = 0; i < populationValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 1) == populationValues[i]))
                {
                    population = false;
                }
            }

            //Net growth (rabbits/year)
            var netGrowth = true;
            var netGrowthValues = [7.20,9.36,12.2,15.8,20.6,26.7,34.8,45.2,58.7,76.4];
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
    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});
