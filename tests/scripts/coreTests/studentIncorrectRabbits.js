
// Set up initial variables


 // Creating a selenium client utilizing webdriverjs
var webdriver = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

/*
.remote({
    logLevel: "verbose",
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});
*/

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

//sync(webdriver,remote);

var client = webdriver.remote(options);

describe("Student mode with incorrect rabbits", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"]]);
    }));

    describe("Checking node not in solution:", function(){
        it("Should input description for node not in solution", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The number of rabbits that die per year per rabbit");
            dtest.popupWindowPressOk(client);
        }));

        it("Should have correct description color", async(function(){
            var descColor = dtest.getNodeDescriptionColor(client);
	    atest.checkNodeValue(descColor,"red","The number of rabbits that die per year per rabbit");
        }));

        after(async(function(){
            dtest.nodeEditorDelete(client);     
            dtest.waitTime(client, 300);
        }));
    });
    
    describe("Should incorrectly fill nodes", function(){
        afterEach(async(function(){
            dtest.nodeEditorDone(client);
        }))

        it("Should incorrectly fill accumulator - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Parameter");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Function");
            dtest.popupWindowPressOk(client);
            dtest.setNodeExpression(client, "5");
            dtest.checkExpression(client);    
            dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "1/year");
            dtest.setNodeExpression(client, "growth rate/0");
            dtest.checkExpression(client);
            dtest.popupWindowPressOk(client);            
            //dtest.popupWindowPressOk(client);
            dtest.setNodeUnits(client, "years");
            //dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 1);
            dtest.setNodeInitialValue(client, 0);
        }));

        it ("Should have saved the values correctly", async(function() {
            dtest.openEditorForNode(client, "population");
            var units = dtest.getNodeUnits(client);
            atest.checkNodeValue(units,"rabbits","population");
        }));
    
        it("Should partially incorrectly fill function - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.setNodeType(client, "Function");
            dtest.setNodeExpression(client, "4");
            dtest.checkExpression(client);            
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeExpression(client, "growth rate");
            dtest.checkExpression(client);
        }));

        it("Should incorrectly fill parameter - growth rate", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.setNodeType(client, "Function");
            dtest.setNodeType(client, "Accumulator");
            dtest.setNodeInitialValue(client, 0);
            dtest.setNodeInitialValue(client, 1);
            dtest.setNodeUnits(client, "years");
            dtest.setNodeUnits(client, "rabbits");
        }));

    });

    describe("check lessons learned shown", function(){
        it("Should show lessons learned on graph close", async(function(){
            dtest.popupWindowPressOk(client);
            dtest.menuOpenGraph(client);
            dtest.closeGraphAndTableWindow(client);
            dtest.waitTime(200); 
            var lessonsLearnedText = dtest.lessonsLearnedGetText(client);
            assert(lessonsLearnedText !== "undefined", "Lessons learned text does not match");
            dtest.lessonsLearnedClose(client);
        }));

        it("Should show lessons learned on click of button", async(function(){
            dtest.waitTime(200);
            dtest.menuOpenLessonsLearned(client);
            dtest.waitTime(200);
            dtest.lessonsLearnedClose(client);
        }));
    });

    describe("check lesson learned enable after refresh", function(){
        it("Should show lessons learned on click of menu button", async(function(){
            client.refresh();
            dtest.waitTime(5000);
            dtest.menuOpenLessonsLearned(client);
            dtest.waitTime(200);
            var lessonsLearnedText = dtest.lessonsLearnedGetText(client);
            assert(lessonsLearnedText !== "undefined", "Lessons learned text does not match");            
            dtest.lessonsLearnedClose(client);
            //dtest.waitTime(1000);
        }));

        it("Should not show lessons learned on graph close", async(function(){
            dtest.menuOpenGraph(client);
            dtest.closeGraphAndTableWindow(client);
            //If there is no lessons learned text we have succeeded
            var lessonsLearnedText = dtest.lessonsLearnedGetText(client);
            assert(lessonsLearnedText == "" );
        }));
    });
    
    after(function(done) {
        client.end();
        done();
    });
});
