
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
var atest = require("../assertTestLib.js");

describe("Test math functions:", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","dtest-function-test"],["mode","AUTHOR"],
                                      ["user", "AutoTests"],
                                      ["section","login.html"],
                                      ["logging","True"]]);
    }));

    describe("opening problem", function(){
        it("Should close the save as dialog", async(function(){            
            dtest.closeSaveAsWindow(client);
        }));
    });

    describe("checking table values:", function(){
        afterEach(async(function(){
            dtest.closeGraphAndTableWindow(client);
            dtest.waitTime(300);
        }))

        it("Should have correct table values", async(function(){
            dtest.menuOpenTable(client);
            //Time (years) column
            var absValues = [2.00, 1.50, 1.00, 0.500, 0.00, 0.500, 1.00, 1.50];
            var acosValues = ["NaN", "NaN", 3.14, 2.09, 1.57, 1.05, 0.00, "NaN"];
            var asinValues = ["NaN", "NaN", -1.57, -0.524, 0.00, 0.524, 1.57, "NaN"];
            var atanValues = [-1.11, -0.983, -0.785, -0.464, 0.00, 0.464, 0.785, 0.983];
            var ceilValues = [-2.00, -1.00, -1.00, 0.00, 0.00, 1.00, 1.00, 2.00];
            var cosValues = [-0.416, 0.0707, 0.540, 0.878, 1.00, 0.878, 0.540, 0.0707];
            var sqrtValues = ["NaN", "NaN", "NaN", "NaN", 0.00, 0.707, 1.00, 1.22];
            var expValues = [0.135, 0.223, 0.368, 0.607, 1.00, 1.65, 2.72, 4.48];
            var factValues = [-2.00, -2.00, -1.00, -1.00, 0.00, 0.00, 1.00, 1.00];
            var floorValues = [-2.00, -2.00, -1.00, -1.00, 0.00, 0.00, 1.00, 1.00];
            var logValues = ["NaN", "NaN", "NaN", "NaN", "-Infinity", -0.693, 0.00, 0.405];
            var maxValues = [0.00, 0.00, 0.00, 0.00, 0.00, 0.500, 1.00, 1.50];
            var minValues = [-2.00, -1.50, -1.00, -0.500, 0.00, 0.00, 0.00, 0.00];
            var powValues = [4.00, 2.25, 1.00, 0.250, 0.00, 0.250, 1.00, 2.25];
            var pythValues = [2.24, 1.80, 1.41, 1.12, 1.00, 1.12, 1.41, 1.80];
            var roundValues = [-2.00, -1.00, -1.00, 0.00, 0.00, 1.00, 1.00, 2.00];
            var sinValues = [-0.909, -0.997, -0.841, -0.479, 0.00, 0.479, 0.841, 0.997];
            var tanValues = [2.19, -14.1, -1.56, -0.546, 0.00, 0.546, 1.56, 14.1];
            var pulseValues = [0.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.00, 0.00];
            var pulseTrain = [1.00, 1.00, 0.00, 0.00, 1.00, 1.00, 0.00, 0.00];
            var sineWave = [0.00, "1.22e-16", "-2.45e-16", "3.67e-16", "-4.90e-16", "6.12e-16", "-7.35e-16", "8.57e-16"];

            atest.checkTableValues("absolute value", 2, absValues, dtest, client);
            atest.checkTableValues("arc cosine", 3, acosValues, dtest, client);
            atest.checkTableValues("arc sine", 4, asinValues, dtest, client);
            atest.checkTableValues("arc tangent", 5, atanValues, dtest, client);
            atest.checkTableValues("ceiling", 6, ceilValues, dtest, client);
            atest.checkTableValues("cosine", 7, cosValues, dtest, client);
            atest.checkTableValues("square root", 8, sqrtValues, dtest, client);
            atest.checkTableValues("exponential", 9, expValues, dtest, client);
            atest.checkTableValues("factorial", 10, factValues, dtest, client);
            atest.checkTableValues("floor", 11, floorValues, dtest, client);
            atest.checkTableValues("logarithm", 12, logValues, dtest, client);
            atest.checkTableValues("maximum", 13, maxValues, dtest, client);
            atest.checkTableValues("minimum", 14, minValues, dtest, client);
            atest.checkTableValues("power", 15, powValues, dtest, client);
            atest.checkTableValues("pythogorean", 16, pythValues, dtest, client);
            atest.checkTableValues("roundnum", 17, roundValues, dtest, client);
            atest.checkTableValues("sine", 18, sinValues, dtest, client);
            atest.checkTableValues("tangent", 19, tanValues, dtest, client);
            atest.checkTableValues("pulse", 20, pulseValues, dtest, client); 
            atest.checkTableValues("pulse train", 21, pulseTrain, dtest, client);            
            atest.checkTableValues("sine wave", 22, sineWave, dtest, client);
        }));
    });
    after(function(done) {
        client.end();
        done();
    });
});