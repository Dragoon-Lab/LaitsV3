/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/*
 * shakedown.js - Dragoon test system shakedown
 * This file will run a series of checks to ensure the test library is working properly.
 */

// Set up initial variables

 // Creating a selenium client utilizing webdriverjs
var client = require('webdriverio').remote({
    desiredCapabilities: {
        // See other browers at:
        // http://code.google.com/p/selenium/wiki/DesiredCapabilities
        browserName: 'chrome'
    }
});

var assert = require('chai').assert;

// import dragoon test library module
var dtest = require('./dtestlib-sync.js');

// import sync library
var sync = require('synchronize');

var async = sync.asyncIt;

// This block should test each function in the API

describe('Test dragoon testing framework',function() {

    // API Tests:
    describe("menuCreateNode()",function () {        
        
        it("should have \"New quantity\" for the title",async(function () {
            var windowTitle = "";
            dtest.openProblem(client,[["problem","rabbits"],["mode","student"]]);
            dtest.menuCreateNode(client);
            windowTitle = dtest.getNodeEditorTitle(client);
            assert(windowTitle==="New quantity",
                    "The title was "+windowTitle+" instead of \"New quantity\"");
        }));

        after(function (done) {
            client.end();
            done();
        });
    });

    describe("node editor getter functions",function () {
        before(async(function () {
            dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["user","dtest"],["section","regression-testing"],
                                      ["logging","false"]]);
        }));

        var nextNodeToCheck="population";
        //nextNodeToCheck="id10"; // temporary hack until using real names works
        var nodeTitle,nodeDescription,nodeType,nodeInitialValue,nodeUnits,nodeExpression = "";
        
        beforeEach(async(function () {
            dtest.openEditorForNodeByName(client,nextNodeToCheck);
        }));

        beforeEach(async(function (done) {
            nodeTitle = dtest.getNodeEditorTitle(client);
            //nodeDescription = dtest.getNodeDescription(client);
            //nodeType = dtest.getNodeType(client);
            //nodeInitialValue = dtest.getNodeInitialValue(client);
            //nodeUnits = dtest.getNodeUnits(client);
            //nodeExpression = dtest.getNodeExpression(client);
            done();
        }));

        it("population should have the expected values",function () {
            assert(nodeTitle==="population",
                    "The title was "+nodeTitle+" instead of \"population\"");
            // TODO Add other values
            nextNodeToCheck ="net growth";
            //nextNodeToCheck = "id11" // temporary hack until using real names works
        });

        it("net growth should have the expected values",function () {
            assert(nodeTitle==="net growth",
                    "The title was "+nodeTitle+" instead of \"net growth\"");
            // TODO
            nextNodeToCheck ="growth rate";
            //nextNodeToCheck = "id13" // temporary hack until using real names works
        });

        it("growth rate should have the expected values",function () {
            assert(nodeTitle==="growth rate",
                    "The title was "+nodeTitle+" instead of \"growth rate\"");
            // TODO
        });

        afterEach(async(function () {
            dtest.closeNodeEditor(client);
        }));

        after(function (done) {
            client.end();
            done();
        });
    });
});