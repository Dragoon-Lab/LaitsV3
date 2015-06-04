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

function wait(milliseconds)
{
  var start = new Date().getTime();
  for (var i = 0; i < 1e30; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
  throw new Error("wait ended early");
}

////////////////////////////////////////////////////////////////////////////////////////////////////

var originalTab = "";

describe("Author Mode Initial Student Values Test", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","AUTHOR"],
                                      ["section","regression-testing"]]);
    }));

    describe("The 'save as' dialog...", function(){
        it("should set the new name", async(function(){

        }));
        it("should save and switch to the new problem", async(function(){

        }));
    });

    describe("The node editor...", function(){
        it("Should add nodes to initial student model", async(function(){
            // add growth rate            
            // add population
            // add net growth
        }));        
    });

    describe("The first preview...", function(){
        it("should have an incomplete population with red expression", async(function(){
            // 
        }));

        it("should have a green net growth", async(function(){
            // 
        }));

        it("should have a green growth rate", async(function(){
            // 
        }));
    });

    describe("The node editor...", function(){
        it("Should work when author's units change 1/year -> per year"){

        }

        it("Should work when author's initial value changes from 0.3 to 0.25"){

        }

        it("Should work when author's node type changes from function -> accumulator"){
            // also set initial value (e.g. 5)

        }
    });

    describe("The second preview...", function(){
        it("should have an incomplete population with red expression", async(function(){
            // 
        }));

        it("should have an incomplete red net growth", async(function(){
            // 
        }));

        it("should have a complete red growth rate", async(function(){
            // 
        }));
    });

    describe("The node editor...", function(){
        it("should allow clearing the student's units", async(function(){
            // in net growth clear, close and reopen to check
        }));

        it("should allow clearing the student's initial value", async(function(){
            // in parameter, clear, close, and reopen to check
        }));

        it("should allow clearing the expression", async(function(){
            // in net growth, clear the expression
        }));
    });

    describe("The third preview...", function(){
        it("should have an incomplete population with red expression", async(function(){
            // 
        }));

        it("should have an incomplete red net growth", async(function(){
            // 
        }));

        it("should have an incomplete red growth rate", async(function(){
            // 
        }));
    });


/*        it("Should open the preview", async(function(){
            dtest.menuOpenPreview(client);
        }));

        it("Should close the preview on hitting the done button", async(function(){            
            dtest.menuDone(client);
        }));

        it("Should return to author tab", async(function(){
            dtest.switchTab(client,originalTab);
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
        })); */


    after(function(done) {
        client.end();
        done();
    });
});