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
  Regression test for bug #bugzilla bug number#  
  http://www.andestutor.org/bugzilla/show_bug.cgi?id=<#bug number#>
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

// Replace this example test with your own:

describe("Regression test for bug 1487 - incremental crash with no error message", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","dtest-function-test"],["mode","STUDENT"],
                                      ["activity","incremental"],
                                      ["section","regression-testing"],
                                      ["logging","true"]]);
    }));

    describe("Test to make sure the incremental error message appears.", function(){
        it("Should display the \"no tweaked nodes\" error message.", async(function(){
            atest.canvasMessageContainsText("has not set up the initial incremental",dtest,client);
        }));
    });

    after(async(function(done){
        dtest.endTest(client);
    }));
});