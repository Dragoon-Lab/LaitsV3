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
    before(function (done) {
        dtest.openProblem(client,[["problem","rabbits"],["mode","student"]],done);
    });

    after(function (done) {
        client.end();
        done();
    });

    // API Tests:

    describe("menuCreateNode()",function () {
        var windowTitle = "";

        // before statements execute in order :D
        before(function (done) {
            dtest.menuCreateNode(client,done);
        });

        before(function (done) { 
            dtest.getNodeEditorTitle(client,function(err,result){
                windowTitle = result;
                done();
            });
        });

        it("should have \"New quantity\" for the title",function () {
            assert(windowTitle==="New quantity",
                    "The title was "+windowTitle+" instead of \"New quantity\"");
        });
    });
});


