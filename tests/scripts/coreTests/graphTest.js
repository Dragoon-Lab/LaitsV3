
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

    describe("checking table values:", function(){
        it("Should have correct table values", async(function(){
            dtest.menuOpenTable(client);
            //Time (years) column
            var years = true;
            var current = 1859;
            for(var i = 0; i < 61; i++)
            {
                if(!(dtest.tableGetValue(client, i, 0) == current))
                {
                    years = false;
                }
                current++;
            }

            //Population (rabbits) coumn
            var population = true;
            var populationValues = [24,31.2,40.6,52.7,68.5,89.1,116,151,196,255,331,430,559,727,945];
            for(var i = 0; i < populationValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 0) == populationValues[i]))
                {
                    population = false;
                }
            }

            //Net growth (rabbits/year)
            var netGrowth = true;
            var netGrowthValues = [7.20,9.36,12.2,15.8,20.6,26.7,34.8,45.2,58.7,76.4,99.3,129,168,218];
            

            assert(years === true,
                "Values in the \"Time (years)\" column were incorrect");
            assert(population === true,
                "Values in the \"population (rabbits)\" column were incorrect");

        }));

    });

    after(function(done) {
        client.end();
        done();
    });
});