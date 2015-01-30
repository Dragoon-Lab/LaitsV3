
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
// import dragoon test library module
var dtest = require('../dtestlib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Test author mode", function() {

    before(async(function (done) {
            dtest.openProblem(client,[
                ["mode","AUTHOR"], 
                ["section","login.html"], 
                ["group","autotest"]]);
    }));

    describe("Creating nodes", function(){
        afterEach(async(function(){
            dtest.nodeEditorDone(client);
        }));

        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeName(client, "population");
            dtest.setKindOfQuantity(client, "in model & required");
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.setNodeType(client, "Accumulator");
            dtest.setNodeInitialValue(client, 24);
            //Doubled because of bug, remove in future
            dtest.setNodeUnits(client, "rabbits");
            dtest.setNodeExpression(client, "net growth");
            dtest.checkExpression(client);
        }));

        it("Should fill in function node - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");          
            dtest.setNodeDescription(client, "The number of additional rabbits each year");
            dtest.setKindOfQuantity(client, "in model & required");
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeType(client, "Function");
            dtest.setNodeExpression(client, "growth rate*population");
            dtest.checkExpression(client);
        }));

        it("Should fill in parameter node - growth rate", async(function(){
            dtest.openEditorForNode(client, "growth rate");         
            dtest.setNodeDescription(client, "The number of additional rabbits per year per rabbit");
            dtest.setNodeInitialValue(client, 0.3);
            dtest.setKindOfQuantity(client, "in model & required");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeUnits(client, "1/year");
        }));
    });

    describe("Checking Nodes:", function(){
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
    });

    describe("Checking graph/table window", function(){
        it("Should open the table window and switch to graph tab", async(function(){
            dtest.menuOpenGraph(client);
            dtest.selectTableTab(client);
        }));

        it("Should have correct table values", async(function(){
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
    });

    /*after(function(done) {
        client.end();
        done();
    });*/
});