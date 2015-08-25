
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
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

describe("Test graph/table window:", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","True"]]);
    }));

    describe("Creating nodes:", function(){
        it("Should create Accumulator node - population", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The number of rabbits in the population");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client, "Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client, 24);
            dtest.setNodeUnits(client, "rabbits");     
            dtest.setNodeExpression(client, "net growth");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

        it("Should fill in function node - net growth", async(function(){
            dtest.openEditorForNode(client, "net growth");
            dtest.setNodeType(client, "Function");
            dtest.setNodeUnits(client, "rabbits/year");
            dtest.setNodeExpression(client, "growth rate*population");
            dtest.checkExpression(client);
            dtest.nodeEditorDone(client);

        }));

        it("Should fill in parameter node - growth rate", async(function(){
            dtest.openEditorForNode(client, "growth rate");
            dtest.setNodeType(client, "Parameter");
            dtest.setNodeInitialValue(client, 0.3);
            dtest.setNodeUnits(client, "1/year");
            dtest.nodeEditorDone(client);
            dtest.popupWindowPressOk(client);
        }));
    });

    describe("checking table values:", function(){
        var lessonsLearnedClosed = false;  // only shows up once
        
        afterEach(async(function(){
            dtest.closeGraphAndTableWindow(client);
            if (!lessonsLearnedClosed){ 
                dtest.lessonsLearnedClose(client);
                lessonsLearnedClosed = true;
            }
            dtest.waitTime(300);            
        }))

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
                if(!(dtest.tableGetValue(client, i, 1) == populationValues[i]))
                {
                    population = false;
                }
            }

            //Net growth (rabbits/year)
            var netGrowth = true;
            var netGrowthValues = [7.20,9.36,12.2,15.8,20.6,26.7,34.8,45.2,58.7,76.4,99.3,129,168,218];
            for(var i = 0; i < netGrowthValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 2) == netGrowthValues[i]))
                {
                    population = false;
                }
            }

            assert(years === true,
                "Values in the \"Time (years)\" column were incorrect");
            assert(population === true,
                "Values in the \"population (rabbits)\" column were incorrect");
            assert(netGrowth === true,
                "Values in the \"net growth (rabbits/year)\" column were incorrect");

        }));

        it("Should have updated numbers after changing growth rate initial value", async(function(){
            dtest.menuOpenTable(client);
            dtest.setQuantityValue(client, "growth rate", "0.5");

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

            var population = true;
            var populationValues = [24.0,36.0,54.0,81.0,122,182,273,410,615,923,1380,2080,3110,4670,7010];
            for(var i = 0; i < populationValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 1) == populationValues[i]))
                {
                    population = false;
                }
            }

            var netGrowth = true;
            var netGrowthValues = [12.0,18.0,27.0,40.5,60.8,91.1,137,205,308,461,692,"1.04e+3","1.56e+3","2.34e+3"];
            for(var i = 0; i < netGrowthValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 2) == netGrowthValues[i]))
                {
                    population = false;
                }
            }

            assert(years === true,
                "Values in the \"Time (years)\" column were incorrect");
            assert(population === true,
                "Values in the \"population (rabbits)\" column were incorrect");
            assert(netGrowth === true,
                "Values in the \"net growth (rabbits/year)\" column were incorrect");
        }));

        //This test currently does not work
        /*it("Should have updated numbers after changing population initial value", async(function(){
            dtest.menuOpenTable(client);
            dtest.setQuantityValue(client, "population", "30");

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

            var population = true;
            var populationValues = [30.0,39.0,50.7,65.9,85.7,111,145,188,245,318,414,538,699,909,"1.18e+3"];
            for(var i = 0; i < populationValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 1) == populationValues[i]))
                {
                    population = false;
                }
            }

            var netGrowth = true;
            var netGrowthValues = [9.00,11.7,15.2,19.8,25.7,33.4,43.4,56.5,73.4,95.4,124,161,210,273];
            for(var i = 0; i < netGrowthValues.length; i++)
            {
                if(!(dtest.tableGetValue(client, i, 2) == netGrowthValues[i]))
                {
                    population = false;
                }
            }

            assert(years === true,
                "Values in the \"Time (years)\" column were incorrect");
            assert(population === true,
                "Values in the \"population (rabbits)\" column were incorrect");
            assert(netGrowth === true,
                "Values in the \"net growth (rabbits/year)\" column were incorrect");

        }));*/

        
       

    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});