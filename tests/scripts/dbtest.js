
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
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;



//start client and redirect to dragoon page for a new problem
//dtestlib.openProblem(client,[["problem","rabbits"]]);


describe('Test dragoon website', function() {
    before(async(function (done) {
        dtest.openProblem(client,[["problem","TestTestTest"],["mode","AUTHOR"], ["user","tester"], ["section","login.html"], ["group","autotest"]] ,done);

    }));

    it('should have the correct accumulator', async(function (done) {
        //open node editor and check contents inside the node editor    
        dtest.menuCreateNode(client);
        dtest.setNodeName(client, "population");

      }));
    after(function(done) {
        //dtest.openProblem(client,[["problem","isle1"],["mode","student"]],done);
        //dtest.menuCreateNode(client,done);
        client.end();
        done();
    });
});


