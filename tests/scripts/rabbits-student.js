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
 * rabbits-student.js
 * Test for: Rabbits in student mode
 */

////////////////////////////////////////////////////////////////////////////////////////////////////
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


// TODO: generalize and move these to the test library.
var _modelCorrectMessage =
    "Congratulations, your model's behavior matches the author\'s";
var _completeModelMessage = 
"You have completed your model. Click on \"Graph\" or \"Table\" to see what the solution looks like";

function setAndCheckColor(client,setter,getter,value,color){
    setter(client,value);
    assert(color===getter(client),value+" was colored "+getter(client)+
                                  " instead of "+color);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Begin test:

describe('Solving rabbits in student mode',function() {
    before(async(function () {
        dtest.openProblem(client,[["problem","rabbits"],["mode","STUDENT"],
                                ,["section","regression-testing"]]);
    }));

    describe('create the population node',function() {
        it("should open a new quantity window",async(function () {
            dtest.menuCreateNode(client);
            var windowTitle = dtest.getNodeEditorTitle(client);
            assert(windowTitle==="New quantity",
                    "The title was "+windowTitle+" instead of \"New quantity\"");
        }));

        it("should set the population node parameters correctly",async(function () {
            setAndCheckColor(client,dtest.setNodeDescription,dtest.getNodeDescriptionColor,
                "The number of rabbits in the population","green");
            closeAlertMessage(client);
            setAndCheckColor(client,dtest.setNodeType,dtest.getNodeTypeColor,
                "Accumulator","green");
            closeAlertMessage(client);
            setAndCheckColor(client,dtest.setNodeInitialValue,dtest.getNodeInitialValueColor,
                "24","green");
            setAndCheckColor(client,dtest.setNodeUnits,dtest.getNodeUnitsColor,
                "rabbits","green");
            dtest.setNodeExpression(client,"net growth");
            dtest.checkExpression(client);
            assert("green"===dtest.getNodeExpressionColor(client),
                   "expression was colored "+getter(client)+" instead of green");
        }));

        after(async(function (){
            dtest.nodeEditorDone(client);
        }));
    });
    
    describe('finish the net growth node',function() {
        it("should open the net groth node editor",async(function () {
            dtest.openEditorForNode(client,"net growth");
        }));

        it("should set the net growth node parameters correctly",async(function () {
            setAndCheckColor(client,dtest.setNodeType,dtest.getNodeTypeColor,
                "Function","green");
            setAndCheckColor(client,dtest.setNodeUnits,dtest.getNodeUnitsColor,
                "rabbits/year","green");
            dtest.setNodeExpression(client,"population*growth rate");
            dtest.checkExpression(client);
            assert("green"===dtest.getNodeExpressionColor(client),
                   "expression was colored "+getter(client)+" instead of green");
        }));

        after(async(function (){
            dtest.nodeEditorDone(client);
        }));
    });
    
    describe('create the growth rate node',function() {
        it("should open the net groth node editor",async(function () {
            dtest.openEditorForNode(client,"growth rate");
        }));

        it("should set the growth rate node parameters correctly",async(function () {
            setAndCheckColor(client,dtest.setNodeType,dtest.getNodeTypeColor,
                "Parameter","green");
            setAndCheckColor(client,dtest.setNodeInitialValue,dtest.getNodeInitialValueColor,
                "0.3","green");
            setAndCheckColor(client,dtest.setNodeUnits,dtest.getNodeUnitsColor,
                "1/year","green");
        }));

        after(async(function (){
            dtest.nodeEditorDone(client);
        }));
    });

    describe('check and close finished message',function() {
        it("should display the complete model message",async(function (){
            var text = dtest.getAlertMessageText(client);
            assert(text===_completeModelMessage,"Expected:"+_completeModelMessage+"\nActual:"+text);
            dtest.closeAlertMessage(client);
        }));
    });

    describe('check graph and table',function() {
        before(async(function () {
            dtest.menuOpenGraph(client);
        }));

        it("should say the model is correct",async(function () {
            var message = dtest.getGraphResultText(client);
            assert(message===_modelCorrectMessage,
                "Unexpected graph window message:" + message);
        }));

        it("should show expected incorrect values",async(function () {
            assert("24.0"===dtest.tableGetValue(client,"population (rabbits)",1),
                "Incorrect table value for population, row 1!");
            assert("255"===dtest.tableGetValue(client,"population (rabbits)",10),
                "Incorrect table value for population, row 10!");
            assert("76.4"===dtest.tableGetValue(client,"net growth (rabbits/year)",10),
                "Incorrect table value for net growth, row 10!");
        }));
    });


    after(function (done) {
        client.end();
        done();
    });
});
