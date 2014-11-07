// Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote({
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});

var assert = require('chai').assert;

//import dragoon test library module
var dtest = require('./dtestlib.js');


//start client and redirect to dragoon page for a new problem
//dtestlib.openProblem(client,[["problem","rabbits"]]);


describe('Test dragoon website', function() {
    before(function (done) {
        dtest.openProblem(client,[["problem","rabbits"],["mode","student"]],done);
    });

    it("should allow us to create an accumulator",function(done) {
        dtest.createNode(client,done);
    });

    after(function(done) {
        client.end();
        done();
    });
});


