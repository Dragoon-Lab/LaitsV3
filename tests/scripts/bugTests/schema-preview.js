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

// Replace this example test with your own:

describe("Regression test for schema preview bug", function() {

    before(async(function (done) {
            dtest.openProblem(client,[["problem","rabbits"],["mode","AUTHOR"],
                                      ["section","regression-testing"]]);
    }));

    describe("Test for broken preview in problem with schemas", function(){                
        it("Should close the save as dialog", async(function(){            
            dtest.closeSaveAsWindow(client);
        }));

        it("Should open the preview", async(function(){
            dtest.menuOpenPreview(client);
        }));

        it("Should close the preview on hitting the done button", async(function(){
            dtest.menuDone(client);
        }));

        it("Should return to author tab", async(function(){
            dtest.menuOpenAuthorOptions(client);
            dtest.pressCheckProblemButton(client);
        })); 
    });

    after(function(done) {
        client.end();
        done();
    });
});