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
  Regression test for ONR Demo for Feb 2015
  https://docs.google.com/a/asu.edu/file/d/0B5wRDUNnwf2XSTNLdDR0Q3hjajNOYU41R201NDB2d3IzcEpv/edit
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
varnn sync = require('synchronize');
// import wrapper for asynchronous functions
var async = sync.asyncIt;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Replace the following with your test

describe("Running through ONR Feb 2015 demo", function() {

    describe("Demo slide 23 (editor and authoring mode)", function(){
        before(async(function (done) {
            dtest.openProblem(client,[["problem","realgiardia"],["mode","AUTHOR"],
                                      ["section","testing"],
                                      ["group","jwauthor"],
                                      ["logging","false"]]);
        }));

        it("The graph and table should show the correct values", async(function(){
            dtest.menuOpenTable(client);
            // TODO: check values here

        }));

        it("should open the accumulator node", async(function(){
            dtest.openEditorForNode(client, "Giardia per liter of tank water");
            atest.checkNodeValues([["expectedDescription", "Number of Giardia per liter of water"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "1.5"],
                                    ["expectedExpression", "Giardia births"]],
                                    dtest, client);
            dtest.nodeEditorDone(client);
        }));

        it("should open the function node", async(function(){
            dtest.openEditorForNode(client, "Giardia per liter of tank water");
            atest.checkNodeValues([["expectedDescription", "Number of Giardia per liter of water"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "1.5"],
                                    ["expectedExpression", "Giardia births"]],
                                    dtest, client);
            dtest.nodeEditorDone(client);
        }));

        it("should open a parameter node not in the model", async(function(){
            dtest.openEditorForNode(client, "Giardia per liter of tank water");
            atest.checkNodeValues([["expectedDescription", "Number of Giardia per liter of water"],
                                    ["expectedNodeType", "Accumulator"],
                                    ["expectedInitialValue", "1.5"],
                                    ["expectedExpression", "Giardia births"]],
                                    dtest, client);
            dtest.nodeEditorDone(client);
        }));

        it("should save as simplified giardia", async(function(){
            
        }));

        it("modify the description text", async(function(){
            
        }));

        it("should delete all the nodes with no links", async(function(){
            
        }));

        it("should move the nodes around", async(function(){
            
        }));

        it("should change the name of the accumulator to population", async(function(){
            
        }));

        it("should open in student mode and create a node", async(function(){
            
        }));
        after(function(done) {
            client.end();
            done();
        }));

    });

    describe("Demo slide 25 (student mode)", function(){
        before(async(function (done) {
            dtest.openProblem(client,[["problem","realgiardia"],["mode","COACHED"],
                                      ["section","testing"],
                                      ["group","jwauthor"],
                                      ["logging","true"]]);
        }));

        it("Should create a node for the liters of water in tank and get TNS popup and red", async(function(){
            // TODO: check values here
        }));

        it("Should select number of giardia per liter and turn green", async(function(){
            // TODO: check values here
        }));

        it("Should select parameter, turn red", async(function(){
            // TODO: check values here
        }));

        it("Should select function, turn yellow", async(function(){
            // TODO: check values here
        }));

        it("Should enter initial value of 1.5 -> green", async(function(){
            // TODO: check values here
        }));

        it("Should enter giardia births and check expression -> green", async(function(){
            // TODO: check values here
        }));

        it("Should close node, create node for birth rate and get blue", async(function(){
            // TODO: check values here
        }));

        it("Should click on births fill out type as function -> green ", async(function(){
            // TODO: check values here
        }));

        after(function(done) {
            client.end();
            done();
        }));
    });

 describe("Demo slide 29 (schem lib and reflective debriefing)", function(){
        before(async(function (done) {
            dtest.openProblem(client,[["problem","Proportional to destination"],["mode","COACHED"],
                                      ["section","testing"],
                                      ["group","jwauthor"],
                                      ["logging","true"]]);
        }));

        it("Should create a node for the liters of water in tank and get TNS popup and red", async(function(){
            // TODO: check values here
        }));

        after(function(done) {
            client.end();
            done();
        }));
    });

});
