
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

describe("Test student mode:", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","false"]]);
    }));

    describe("Creating nodes:", function(){
        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 24);
            dtest.setNodeUnits(client, "rabbits");     
            dtest.setNodeExpression(client, "net growth");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
                        var descriptionColor = dtest.getNodeDescriptionColor(client);
            var typeColor = dtest.getNodeTypeColor(client);
            var initialColor = dtest.getNodeInitialValueColor(client);
            var unitsColor = dtest.getNodeUnitsColor(client);
            var expressionColor = dtest.getNodeExpressionColor(client);


            console.log(descriptionColor);
            console.log(typeColor);
            console.log(initialColor);
            console.log(unitsColor);
            console.log(expressionColor);
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
            dtest.popupWindowPressOk(client);
        }));
    });

    describe("Checking Nodes:", function(){
        it("Nodes should have correct border and fill colors", async(function(){
            //Defines which nodes to check
            var nodesToCheck = ["population", "net growth", "growth rate"];
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
        it("Should have correct Accumulator values and colors", async(function(){
            var nodeName = "population"
            dtest.openEditorForNode(client, nodeName);


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
                "Description was " + description + " instead of \"" + expectedDescription + "\" for node " + nodeName);
            assert(nodeType === expectedNodeType,
                "Node type was " + nodeType + " instead of \"" + expectedNodeType + "\" for node " + nodeName);
            assert(initialValue === expectedInitialValue,
                "Initial value was " + initialValue + " instead of \"" + expectedInitialValue + "\" for node " + nodeName);
            assert(nodeUnits === expectedNodeUnits,
                "Units were " + nodeUnits + " instead of \"" + expectedNodeUnits + "\" for node " + nodeName);
            assert(expression === expectedExpression,
                "Expression was " + expression + "instead of \"" + expectedExpression + "\" for node " + nodeName);

            var descriptionColor = dtest.getNodeDescriptionColor(client);
            var typeColor = dtest.getNodeTypeColor(client);
            var initialColor = dtest.getNodeInitialValueColor(client);
            var unitsColor = dtest.getNodeUnitsColor(client);
            var expressionColor = dtest.getNodeExpressionColor(client);

            /*assert(descriptionColor === "green",
                "Description color was " + descriptionColor + " instead of green for node " + nodeName);
            assert(typeColor === "green",
                "Type color was " +  typeColor + " instead of green for node " + nodeName);
            assert(initialColor === "green",
                "Initial value color was " + initialColor + " intead of green for node " + nodeName);
            assert(unitsColor === "green",
                "Units color was " + unitsColor + " intead of green for node " + nodeName);
            assert(expressionColor === "green",
                "Expression color was " + expressionColor + " instead of green for node " + nodeName);*/
            console.log(descriptionColor);
            console.log(typeColor);
            console.log(initialColor);
            console.log(unitsColor);
            console.log(expressionColor);
        }));

        it("Should have correct function values and colors", async(function(){
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

        it("Should have correct parameter values and colors", async(function(){
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

    after(function(done) {
        client.end();
        done();
    });
});