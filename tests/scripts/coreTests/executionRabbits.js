
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

describe("Execution Rabbits (student mode)", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"],["activity","execution"]]);
    }));
    
    describe("In iteration 1:", function(){
        // get first node wrong
        it("Should get the first node wrong and turn red", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.selectExecutionValue(client,"0.3");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"red","net growth border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"net growth"),"white","net growth fill");
        }));
        
        it("Should get the first node wrong again and turn yellow", async(function(){        
            dtest.selectExecutionValue(client,"31.2");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"yellow","net growth border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"net growth"),"white","net growth fill");
        }));
        // get second node right
        it("Should get the second node right and turn all green", async(function(){
            dtest.openEditorForNode(client, "population");
            dtest.selectExecutionValue(client,"31.2");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"population"),"green","population fill");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("You have completed all the values for this time step.",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));
    });


    describe("In iteration 2:", function(){
        // get first node wrong
        it("Should get the first node right and turn all green", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.selectExecutionValue(client,"9.36");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"net growth"),"green","net growth fill");
        }));

        it("Should get the second node wrong and turn red", async(function(){
            dtest.openEditorForNode(client, "population");
            dtest.selectExecutionValue(client,"9.36");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"red","population border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"population"),"white","population fill");
        }));
        // get second node right
        it("Should get the second node right and turn green with no fill", async(function(){
            dtest.selectExecutionValue(client,"40.6");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"population"),"white","population fill");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("You have completed all the values for this time step.",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));
    });

    describe("In iteration 3:", function(){
        
        it("Should get the first node right and turn all green", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.selectExecutionValue(client,"12.2");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"net growth"),"green","net growth fill");
        }));

        it("Should get the second node right and turn green", async(function(){
            dtest.openEditorForNode(client, "population");
            dtest.selectExecutionValue(client,"52.7");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeFillColor(client,"population"),"green","population fill");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("Good work,",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));

        it("Should display and close the graph window", async(function(){
            dtest.selectTableTab(client);
            dtest.closeGraphAndTableWindow(client);
        }));

        it("Should display and close the lessons learned window", async(function(){            
            dtest.lessonsLearnedClose(client);
        }));

        it("Should display and close the done message", async(function(){
            assert(dtest.isDonePopupVisible(client),"The Done hint popup is not visible, but it should be!");
            dtest.closeMenuDonePopup(client);
        }));

    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});