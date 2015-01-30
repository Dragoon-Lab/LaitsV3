// Creating a selenium client utilizing webdriverjs
var client = require('webdriverjs').remote({
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});

var assert = require('chai').assert;

//import dragoon test library module
var dtest = require('./riteshTests.js');


//start client and redirect to dragoon page for a new problem
//dtestlib.openProblem(client,[["problem","rabbits"]]);


describe('Test dragoon website', function() {
    before(function (done) {
        dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"]],done);

    });

    it('should have the correct accumulator', function (done) {
        //open node editor and check contents inside the node editor    
       //dtest.openNodeForum(client,done);
       //dtest.checkExpression(client,done);
        dtest.clearExpression(client,done);

      });
    after(function(done) {
        //dtest.openProblem(client,[["problem","isle1"],["mode","student"]],done);
        //dtest.menuCreateNode(client,done);
        client.end();
        done();
    });
});


