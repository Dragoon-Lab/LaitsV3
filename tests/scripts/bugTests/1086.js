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
  Regression test for bug trello card 1086
  https://trello.com/c/10opKdc7/1086-autocreated-node-is-marked-premature-after-yellow-expression
*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// Setting up initial variables *you should not need to change this part*

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
////////////////////////////////////////////////////////////////////////////////////////////////////

describe("Regression test for trello card #1086", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","CPI-2014-ps2-07"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"]]);
    }));

    describe("Create float heigh node with yellow expression", function(){
        it("The value of hardwood choice should turn red", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The height of the water in the toilet tank");
            dtest.popupWindowPressOk(client);
            dtest.setNodeType(client,"Accumulator");
            dtest.popupWindowPressOk(client);
            dtest.setNodeInitialValue(client,0);
            dtest.setNodeExpression(client,"flow per inch");
            dtest.checkExpression(client);
            dtest.popupWindowPressOk(client);
            dtest.setNodeExpression(client,"flow per inch+full height");
            dtest.checkExpression(client);
            dtest.popupWindowPressOk(client);
            atest.checkNodeValues([["expectedExpressionColor", "yellow"]],dtest,client);
            dtest.nodeEditorDone(client);
        }));
        it("The resultant water flow node should not be premature", async(function(){
            dtest.openEditorForNode(client,"water flow");
            atest.checkNodeValues([["expectedDescriptionColor", "green"]],dtest,client);
            dtest.setNodeType(client,"Function");
            dtest.nodeEditorDone(client);
        }));
    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});