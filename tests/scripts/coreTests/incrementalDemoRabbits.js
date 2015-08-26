
// Set up initial variables

 // Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote({
    //logLevel: "verbose",
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
// import dragoon assertion library
var atest = require('../assertTestLib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Incremental Demo Rabbits (student mode)", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"],["activity","incrementalDemo"]]);
    }));

    it("Should click the first node", async(function(){
        dtest.openEditorForNode(client, "net growth");
        atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
    }));

    it("Should click the second node", async(function(){
        dtest.openEditorForNode(client, "population");
        atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
    }));

    it("Should display and close the done message", async(function(){
        assert(dtest.isDonePopupVisible(client),"The Done hint popup is not visible, but it should be!");
        dtest.closeMenuDonePopup(client);
    }));
    
    it("Should show an equation and not show done hint again", async(function(){
        dtest.openEditorForNode(client, "net growth");
        dtest.clickIncrementalEquation(client);
        dtest.waitTime(1000);
        // atest.popupContainsText("net growth = population*growth rate",dtest,client) //TODO: doesn't work for this popup
        assert(!dtest.isDonePopupVisible(client),"The Done hint popup is visible, but it should not be!");
    }));
    
    after(async(function(done){
        dtest.endTest(client);
    }));
});