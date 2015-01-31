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
  Regression test for bug 2456
  http://www.andestutor.org/bugzilla/show_bug.cgi?id=<2456>
*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// Set up initial variables *you should not need to change this part*

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
// Replace the following with your test

describe("Regression test for bug 2456", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","79"],["mode","STUDENT"],
                                      ["section","regression-testing"],
                                      ["logging","true"]]);
    }));

    describe("Test for yellow description with incorrect choice", function(){
        it("The value of hardwood choice should turn red", async(function(){
            dtest.menuCreateNode(client);
            dtest.setNodeDescription(client, "The value of hardwood in the market each year");
            dtest.popupWindowPressOk(client);
            atest.checkNodeValues([["expectedDescriptionColor", "red"]],dtest,client);
        }));

        it("The value of softwood choice should turn red", async(function(){
            dtest.setNodeDescription(client, "The value of softwood in the market each year");
            dtest.popupWindowPressOk(client);
            atest.checkNodeValues([["expectedDescriptionColor", "red"]],dtest,client);
        }));

        it("The value of hardwood choice should turn yellow and correct itself", async(function(){
            dtest.setNodeDescription(client, "The value of hardwood in the market each year");
            dtest.popupWindowPressOk(client);
            atest.checkNodeValues([["expectedDescriptionColor", "yellow"],
                                   ["expectedDescription", "The number of trees in the forest each year"]]
                                   ,dtest,client);
        }));
    });

    after(function(done) {
        client.end();
        done();
    });
});