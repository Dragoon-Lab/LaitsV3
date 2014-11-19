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

//import dragoon test library module
var dtest = require('./dtestlib.js');


// This block should test each function in the API

describe('Test dragoon testing framework', function() {

    // API Tests:

    describe("menuCreateNode()",function () {
        var windowTitle = "";
        before(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","student"]],done);
        });

        // before statements execute in order :D
        before(function (done) {
            dtest.menuCreateNode(client,done);
        });

        before(function (done) { 
            dtest.getNodeEditorTitle(client,function(err,result){
                windowTitle = result;
                console.log(windowTitle);
                done();
            });
        });

        it("should have \"New quantity\" for the title",function () {
            assert(windowTitle==="New quantity",
                    "The title was "+windowTitle+" instead of \"New quantity\"");
        });

        after(function (done) {
            client.end();
            done();
        });
    });

    describe("node editor getter functions",function () {
        before(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","student"],
                                      ["user","dtest"],["section","regression-testing"],
                                      ["logging","false"]],done);
        });

        var nextNodeToCheck="population";
        var nodeTitle,nodeDescription,nodeType,nodeInitialValue,nodeUnits,nodeExpression = "";
        
        beforeEach(function (done) {
            dtest.openEditorForNodeByName(client,nextNodeToCheck,done);
        });

        beforeEach(function (done) {
            dtest.getNodeEditorTitle(client,function(err,result){ nodeTitle = result;});
            dtest.getNodeDescription(client,function(err,result){ nodeDescription = result;});
            dtest.getNodeType(client,function(err,result){ nodeType = result;});
            dtest.getNodeInitialValue(client,function(err,result){ nodeInitialValue = result;});
            dtest.getNodeUnits(client,function(err,result){ nodeUnits = result;});
            dtest.getNodeExpression(client,function(err,result){ nodeExpression = result;});
            done();
        });

        it("population should have the expected values",function () {
            assert(nodeTitle==="population",
                    "The title was "+nodeTitle+" instead of \"population\"");
            // TODO Add other values
            nextNodeToCheck ="net growth";
        });

        it("net growth should have the expected values",function () {
            assert(nodeTitle==="net growth",
                    "The title was "+nodeTitle+" instead of \"net growth\"");
            // TODO
            nextNodeToCheck ="growth rate";
        });

        it("growth rate should have the expected values",function () {
            assert(nodeTitle==="growth rate",
                    "The title was "+nodeTitle+" instead of \"growth rate\"");
            // TODO
        });                

        afterEach(function (done) {
            dtest.closeNodeEditor(client,done);
        });

        after(function (done) {
            client.end();
            done();
        });
    });
});