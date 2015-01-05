
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

describe("Test graph/table window:", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["user", "AutoTest"],
                                      ["section","regression-testing"],
                                      ["logging","True"]]);
    }));

    describe("Test", function(){
        it("Test", async(function(){
            var border = dtest.getNodeBorderColor(client, "population");
            var borderStyle = dtest.getNodeBorderStyle(client, "population");
            var nodeFill = dtest.getNodeFillColor(client, "population");
            dtest.openEditorForNode(client, "population");
            var description = dtest.getNodeDescriptionColor(client);
            var type = dtest.getNodeTypeColor(client);
            var initial = dtest.getNodeInitialValueColor(client);
            var units = dtest.getNodeUnitsColor(client);
            var expression = dtest.getNodeExpressionColor(client);
            console.log(border);
            console.log(borderStyle);
            console.log(nodeFill);
            console.log(description);
            console.log(type);
            console.log(initial);
            console.log(units);
            console.log(expression);
            /*dtest.openEditorForNode(client, "population");
            var des = dtest.getNodeExpressionColor(client);
            console.log(des);*/
        }));

    });

    after(function(done) {
        client.end();
        done();
    });
});