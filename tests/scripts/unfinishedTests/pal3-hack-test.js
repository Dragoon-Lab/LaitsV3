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

describe("Testing hack fix for PAL3 activities", function() {

    describe("Opening legit construction URL", function(){
        it("Should open the problem", async(function(){
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor"],["mode","STUDENT"],
                                      ["section","PAL3-dragoon-lab-testing"],
                                      ["activity","construction"],["logging","true"]]);
        }));
    });
    
    describe("Opening legit incremental URL", function(){
        it("Should open the problem", async(function(){
            dtest.newWindow(client);
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor"],["mode","STUDENT"],
                                      ["section","PAL3-dragoon-lab-testing"],
                                      ["activity","incremental"],["logging","true"]]);
        }));
    });

    describe("Opening problem-name-appended construction URL", function(){
        it("Should open the problem", async(function(){
            dtest.newWindow(client);
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor-construction"],["mode","STUDENT"],
                                      ["section","PAL3-dragoon-lab-testing"],
                                      ["activity",""],["logging","true"]]);
        }));
    });
    
    describe("Opening problem-name-appended incremental URL", function(){
        it("Should open the problem", async(function(){
            dtest.newWindow(client);
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor-incremental"],["mode","STUDENT"],
                                      ["section","PAL3-dragoon-lab-testing"],
                                      ["activity",""],["logging","true"]]);
        }));
    });

    describe("Opening URL with no activity info", function(){
        it("Should open the problem", async(function(){
            dtest.newWindow(client);
            dtest.openProblem(client,[["problem","bridge-rectifier-capacitor"],["mode","STUDENT"],
                                      ["section","PAL3-dragoon-lab-testing"],
                                      ["activity",""],["logging","true"]]);
        }));
    });

    after(function(done) {
        client.end();
        done();
    });
});