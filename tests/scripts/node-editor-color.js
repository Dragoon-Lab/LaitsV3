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
// import chai assertion library
var assert = require('chai').assert;
// import dragoon test library module
var dtest = require('./dtestlib.js');
// import sync library
var sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

function openPartiallyCompleteRabbits() {
    dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                      ["user","dtest"],["section","regression-testing"],
                                      ["logging","false"]]);
}

describe("node editor getter functions",function () {
    before(async(function () {
        openPartiallyCompleteRabbits();
        dtest.openEditorForNode(client,"population");        
        nodeDescriptionColor = dtest.getNodeDescriptionColor(client);
        nodeTypeColor = dtest.getNodeTypeColor(client);
        nodeUnitsColor = dtest.getNodeUnitsColor(client);
        nodeExpressionColor = dtest.getNodeExpressionColor(client);
    }));

    it("net growth node should have the expected colors",function () {
        assert(nodeDescriptionColor==="green","expected green but got: "+nodeDescriptionColor);
        assert(nodeTypeColor==="green","expected green but got: "+nodeTypeColor);
        assert(nodeUnitsColor==="green","expected green but got: "+nodeUnitsColor);
        assert(nodeExpressionColor==="yellow","expected yellow but got: "+nodeExpressionColor);

        nextNodeToCheck ="net growth";
    });
});
