
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
        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeName(client, "population");
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.setNodeType(client, "Accumulator");
            dtest.setNodeInitialValue(client, 24);
            //Doubled because of bug, remove in future
            dtest.setNodeUnits(client, "rabbits");
            dtest.setNodeExpression(client, "net growth");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);
        }));

        it("Should fill in function node - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeType(client, "Function");
            dtest.setNodeExpression(client, "growth rate*population");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

        it("Should fill in parameter node - growth rate", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.setNodeInitialValue(client, 0.3);
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeUnits(client, "1/year");
            dtest.setNodeUnits(client, "1/year");
            dtest.nodeEditorDone(client);
        }));
    });

    /*describe("Checking Nodes", function(){
        it("Should have correct Accumulator values", async(function(){
            dtest.openEditorForNode(client, "population");
            
        }));
    });*/
    after(function(done) {
        client.end();
        done();
    });
});