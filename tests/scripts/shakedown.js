/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/*
 * shakedown.js - Dragoon test system shakedown
 * This file will run a series of checks to ensure the test library is working properly.
 */

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
var dtest = require('./dtestlib.js');
// import sync library
// import wrapper for asynchronous functions
var async = sync.asyncIt;

function openPartiallyCompleteRabbits() {
    dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["user","dtest"],["section","regression-testing"],
                                      ["logging","false"]]);
}

function openCompleteIncorrectRabbits() {
    dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["user","dtest2"],["section","regression-testing"],
                                      ["logging","false"]]);
}

// TODO: move these to the test library.
var nodesIncompleteMessage = 
    "Not all nodes have been completed. For example, \"growth rate\" is not yet fully defined.";
var modelIncorrectMessage =
    "Unfortunately, your model's behavior does not match the author's";

// This block should test each function in the API

describe('Test dragoon testing framework',function() {

    // API Tests:
    describe("menu & canvas functions",function () {

        before(async(function () {
            openPartiallyCompleteRabbits();
        }));
        
        it("should open a new quantity when create node is clicked",async(function () {
            dtest.menuCreateNode(client);
            var windowTitle = dtest.getNodeEditorTitle(client);
            assert(windowTitle==="New quantity",
                    "The title was "+windowTitle+" instead of \"New quantity\"");
            dtest.nodeEditorDone(client);
        }));

        it("should be able to delete a node",async(function () {
            dtest.deleteNode(client,"birth rate");
            var errored = false;
            try{
                dtest.openEditorForNode(client,"birth rate");
            }catch(err){
                errored = true;
            }
            assert(errored===true,"The deleted node could still be opened!");
        }));

        it("should be able to read the node border colors",async(function () {
            var populationColor = dtest.getNodeBorderColor(client,"population");
            var netGrowthColor = dtest.getNodeBorderColor(client,"net growth");
            var growthRateColor = dtest.getNodeBorderColor(client,"growth rate");
            var birthRateColor = dtest.getNodeBorderColor(client,"birth rate");
            assert(populationColor === "green","The population node should have a green border.");
            assert(netGrowthColor === "yellow","The net growth node should have a yellow border.");
            assert(growthRateColor === "red","The growth rate node should have a red border.");
            assert(birthRateColor === "none","The birth rate node should have no border.");
        }));

        after(async(function(done){
            dtest.endTest(client);
        }));
    });


    describe("node editor getter functions",function () {
        before(async(function () {
            openPartiallyCompleteRabbits();
        }));

        var nextNodeToCheck="population";
        //nextNodeToCheck="id10"; // temporary hack until using real names works
        var nodeTitle,nodeDescription,nodeType,nodeInitialValue,nodeUnits,nodeExpression = "";
        
        beforeEach(async(function () {
            dtest.openEditorForNode(client,nextNodeToCheck);
        }));

        beforeEach(async(function () {
            nodeTitle = dtest.getNodeEditorTitle(client);
            nodeDescription = dtest.getNodeDescription(client);
            nodeType = dtest.getNodeType(client);
            nodeInitialValue = dtest.getNodeInitialValue(client);
            nodeUnits = dtest.getNodeUnits(client);
            nodeExpression = dtest.getNodeExpression(client);

            //colors
            nodeDescriptionColor = dtest.getNodeDescriptionColor(client);
            nodeTypeColor = dtest.getNodeTypeColor(client);
            nodeInitialValueColor = dtest.getNodeInitialValueColor(client);
            nodeUnitsColor = dtest.getNodeUnitsColor(client);
            nodeExpressionColor = dtest.getNodeExpressionColor(client);
        }));

        it("population node should have the expected values",function () {
            assert(nodeTitle==="population",
                    "The title was "+nodeTitle+" instead of \"population\"");
            assert(nodeDescription==="The number of rabbits in the population");
            assert(nodeType==="Accumulator");
            assert(nodeInitialValue==="24");
            assert(nodeUnits==="rabbits");
            assert(nodeExpression==="net growth");

            assert(nodeDescriptionColor==="green");
            assert(nodeTypeColor==="green");
            assert(nodeInitialValueColor==="green");
            assert(nodeUnitsColor==="green");
            assert(nodeExpressionColor==="green");

            nextNodeToCheck ="net growth";
        });

        it("net growth node should have the expected values",function () {
            assert(nodeTitle==="net growth",
                    "The title was "+nodeTitle+" instead of \"net growth\"");
            assert(nodeDescription==="The number of additional rabbits each year");
            assert(nodeType==="Function");
            assert(nodeUnits==="rabbits/year");
            assert(nodeExpression==="population*growth rate");

            assert(nodeDescriptionColor==="green");
            assert(nodeTypeColor==="green");
            assert(nodeUnitsColor==="green");
            assert(nodeExpressionColor==="yellow");

            nextNodeToCheck ="growth rate";
        });

        it("growth rate node should have the expected values",function () {
            assert(nodeTitle==="growth rate",
                    "The title was "+nodeTitle+" instead of \"growth rate\"");
            assert(nodeDescription==="The number of rabbits in the population");
            assert(nodeType==="Parameter");
            assert(nodeInitialValue==="33");
            assert(nodeUnits==="--Select--");

            assert(nodeDescriptionColor==="green");
            assert(nodeTypeColor==="green");
            assert(nodeInitialValueColor==="red");
            assert(nodeUnitsColor==="white");
        });

        afterEach(async(function () {
            dtest.nodeEditorDone(client);
        }));

        after(async(function(done){
            dtest.endTest(client);
        }));
    });
    
    describe("graph & table functions",function () {
        describe("for an incomplete model",function(){
            it("should show an error message in graph window when incomplete",async(function () {
                openPartiallyCompleteRabbits();
                dtest.menuOpenGraph(client);
                var message = dtest.getGraphMessageText(client);
                assert(message===nodesIncompleteMessage,"The graph window message was different:\n"+
                    "expected: "+nodesIncompleteMessage+"\n"+
                    "received: "+message);
            }));

            after(async(function(done){
                dtest.endTest(client);
            }));
        });

        describe("for a complete incorrect model",function(){
            before(async(function () {
                openCompleteIncorrectRabbits();
                dtest.menuOpenGraph(client);
            }));

            it("should not show an error message when complete",async(function () {
                var message = dtest.getGraphMessageText(client);
                assert(message===null,"Unexpected graph window message:" + message);
            }));

            it("should say the model is incorrect",async(function () {
                var message = dtest.getGraphResultText(client);
                assert(message===modelIncorrectMessage,
                    "Unexpected graph window message:" + message);
            }));

            it("should show expected incorrect values",async(function () {
                assert("24.0"===dtest.tableGetValue(client,"population (rabbits)",1),
                    "Incorrect table value!");
                assert("923"===dtest.tableGetValue(client,"population (rabbits)",10),
                    "Incorrect table value!");
                assert("461"===dtest.tableGetValue(client,"net growth (rabbits/year)",10),
                    "Incorrect table value!");
            }));

            after(async(function(done){
                dtest.endTest(client);
            }));
        });
    });
});