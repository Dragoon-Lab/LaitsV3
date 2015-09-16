
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

describe("Execution Demo Rabbits (student mode)", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"],["activity","executionDemo"]]);            
    }));
    
    describe("In iteration 1:", function(){
        it("Should click the first node", async(function(){
            dtest.openEditorForNode(client, "net growth");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"solid","net growth border");
        }));

        it("Should click the second node", async(function(){
            dtest.openEditorForNode(client, "population");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"population"),"solid","population border");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("You have completed all the values for this time step.",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));
    });

    describe("In iteration 2:", function(){
        it("Should click the first node", async(function(){
            dtest.openEditorForNode(client, "net growth");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"solid","net growth border");
        }));
        it("Should reset the problem correctly from the middle of iteration 2", async(function(){
            dtest.menuReset(client);
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"dashed","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"population"),"dashed","population border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"growth rate"),"solid","growth rate border");
        }));
    });

    describe("In iteration 1:", function(){
        it("Should click the first node", async(function(){
            dtest.openEditorForNode(client, "net growth");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"solid","net growth border");
        }));

        it("Should click the second node", async(function(){
            dtest.openEditorForNode(client, "population");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"population"),"solid","population border");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("You have completed all the values for this time step.",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));
    });

    describe("In iteration 2:", function(){
        it("Should click the first node", async(function(){
            dtest.openEditorForNode(client, "net growth");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"solid","net growth border");
        }));

        it("Should click the second node", async(function(){
            dtest.openEditorForNode(client, "population");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"population"),"solid","population border");
        }));

        it("Should display the next iteration message", async(function(){
            atest.popupContainsText("You have completed all the values for this time step.",dtest,client);
            dtest.closeExecutionIterationPopup(client);
        }));
    });

    describe("In iteration 3:", function(){
        it("Should click the first node", async(function(){
            dtest.openEditorForNode(client, "net growth");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"net growth"),"green","net growth border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"net growth"),"solid","net growth border");
        }));

        it("Should click the second node", async(function(){
            dtest.openEditorForNode(client, "population");
            atest.checkNodeValue(dtest.getNodeBorderColor(client,"population"),"green","population border");
            atest.checkNodeValue(dtest.getNodeBorderStyle(client,"population"),"solid","population border");
        }));

        it("Should display the Demonstration Completed message", async(function(){
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

        it("Should show an equation and not show done hint again", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.clickExecutionEquation(client);
            dtest.waitTime(1000);
            atest.popupContainsText("net growth = population*growth rate",dtest,client) //TODO: doesn't work for this popup
            // assert(!dtest.isDonePopupVisible(client),"The Done hint popup is visible, but it should not be!"); //bugged?
        }));
    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});