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
  Regression test for bug:
  https://trello.com/c/fhw9i1Bd/1080-some-problems-with-schemas-error-out-when-previewing
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

function getDate(){
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();
    var seconds = date.getTime()/1000;

    date = mm+'/'+dd+'/'+yyyy+'/'+seconds;
    return date;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

var username = "";
describe("Parse error crash on load bug", function() {

    it("should open rabbits", async(function(){
      dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                ["section","regression-testing"]]);
      username = dtest.getCurrentUsername(client);      
    }));

    it("should create a faulty expression", async(function(){
        dtest.menuCreateNode(client);
        dtest.setNodeDescription(client, "The number of rabbits in the population");
        dtest.popupWindowPressOk(client);
        dtest.setNodeType(client, "Accumulator");
        dtest.popupWindowPressOk(client);
        dtest.setNodeExpression(client, "net growth+");
        dtest.checkExpression(client);
        dtest.nodeEditorDone(client);
        dtest.menuDone(client);
    }));

    it("should re-open the problem successfully", async(function(){
      dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                ["section","regression-testing"],["user",username]]);
      dtest.openEditorForNode(client,"population");
      atest.checkNodeValues([["expectedExpression","net growth+"],
                             ["expectedExpressionColor","red"]],dtest,client);
      dtest.nodeEditorDone(client);
    }));

    after(function(done) {
        client.end();
        done();
    });
});