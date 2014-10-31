// Creating a selenium client utilizing webdriverjs
var client = require('webdriverjs').remote({
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});

var expect = require('chai').expect;

//import dragoon test library module
var dtestlib = require('./dtestlib.js');


//start client and redirect to dragoon page for a new problem
//dtestlib.openProblem(client,[["problem","rabbits"]]);
describe('Test dragoon website', function() {
    before(function (done) {
        dtestlib.openProblem(client,[["problem","rabbits"],["mode","student"]],done);
    });
    it("should pass",function() {
        dtestlib.createNode(client);
        expect("foo").to.be.a("string");
    })
});


