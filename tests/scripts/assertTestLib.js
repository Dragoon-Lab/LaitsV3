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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/*
 * The "dtest" library is a set of functions useful for building tests for Dragoon.
 * See README.md for documentation.
*/

////////////////////////////////////////////////////////////////////////////////////////////////////
// Set up sync library (See: http://alexeypetrushin.github.io/synchronize/docs/index.html for info.)
var sync = require('synchronize');
// import chai assertion library
var assert = require('chai').assert;
// Globalize these so we don't have to type "sync." everywhere.

var await = sync.await;  // Wrap this around asynchronous functions. Returns 2nd arg to callback
var defer = sync.defer;  // Pass this as the callback function to asynchronous functions
var testPath = require('./test-paths.js');
var MAX_NODE_IDS = 200; // The maximum number of node IDs we'll support

function convertArrayToMap(assocArray){
    var newMap = {};
    for (var pair in assocArray) {
        newMap[assocArray[pair][0]] = assocArray[pair][1];
    }
    return newMap;
}
exports.checkTableValues = function(name, col, values,dtest,client){
	var correct = true;
	var incorrectValues = "";
	for(var i  = 0; i < values.length; i++)
	{
		var tableValue = dtest.tableGetValue(client, i, col);
		if(!(tableValue == values[i]))
		{
			incorrectValues += ("Expected " + values[i] + " but got "+tableValue+"\n");
			correct = false;
		}
	}
	assert(correct === true,
		"Value(s) in the \"" + name + "\" column were incorrect:\n" + incorrectValues);
}

exports.checkNodeValue = function(actual,expected,nodeName){
    assert(actual === expected,
           "Value was \"" +  actual + "\" instead of \"" + 
	   expected + "\" for node " + nodeName);
}

exports.checkNodeValues = function(valuesToCheck, dtest, client)
{
	dtest.waitTime(200);
	var values = convertArrayToMap(valuesToCheck);

	var nodeName = values["nodeName"];

	var description = dtest.getNodeDescription(client);
	var nodeType = dtest.getNodeType(client);
    var initialValue = dtest.getNodeInitialValue(client);
    var nodeUnits = dtest.getNodeUnits(client);
    var expression = dtest.getNodeExpression(client);

	var descriptionColor = dtest.getNodeDescriptionColor(client);
    var typeColor = dtest.getNodeTypeColor(client);
    var initialColor = dtest.getNodeInitialValueColor(client);
    var unitsColor = dtest.getNodeUnitsColor(client);
    var expressionColor = dtest.getNodeExpressionColor(client);

	if(values["expectedDescription"])
	{
		assert(description === values["expectedDescription"],
                "Description was " + description + " instead of \"" + values["expectedDescription"] + "\" for node " + nodeName);
	}
	if(values["expectedNodeType"])
	{
		assert(nodeType === values["expectedNodeType"],
                "Node type was " + nodeType + " instead of \"" + values["expectedNodeType"] + "\" for node " + nodeName);
	}
	if(values["expectedInitialValue"])
	{
		assert(initialValue === values["expectedInitialValue"],
                "Initial value was " + initialValue + " instead of \"" + values["expectedInitialValue"] + "\" for node " + nodeName);
	}
	if(values["expectedNodeUnits"])
	{
		assert(nodeUnits === values["expectedNodeUnits"],
                "Units were " + nodeUnits + " instead of \"" + values["expectedNodeUnits"] + "\" for node " + nodeName);
	}
	if(values["expectedExpression"])
	{
		assert(expression === values["expectedExpression"],
                "Expression was " + expression + "instead of \"" + values["expectedExpression"] + "\" for node " + nodeName);
	}

	if(values["expectedDescriptionColor"])
	{
		assert(descriptionColor === values["expectedDescriptionColor"],
                "Description color was " + descriptionColor + " instead of " + values["expectedDescriptionColor"] + " for node " + nodeName);
	}
	if(values["expectedTypeColor"])
	{
		assert(typeColor === values["expectedTypeColor"],
                "Type color was " +  typeColor + " instead of " + values["expectedTypeColor"] + " for node " + nodeName);
	}
	if(values["expectedInitialColor"])
	{
		assert(initialColor === values["expectedInitialColor"],
                "Initial value color was " + initialColor + " intead of " + values["expectedInitialColor"] + " for node " + nodeName);
	}
	if(values["expectedUnitsColor"])
	{
		assert(unitsColor === values["expectedUnitsColor"],
                "Units color was " + unitsColor + " intead of " + values["expectedUnitsColor"] + " for node " + nodeName);
	}
	if(values["expectedExpressionColor"])
	{
		assert(expressionColor === values["expectedExpressionColor"],
                "Expression color was " + expressionColor + " instead of " + values["expectedExpressionColor"] + " for node " + nodeName);
	}
}

exports.popupContainsText = function(expectedText,dtest,client){
	// Summary: checks if the right message text appears on a pop-up message in Dragoon
	
	// Could improve this by checking to see if a popup even exists first.
	var text = dtest.popupWindowGetText(client);
	assert(text.indexOf(expectedText) >= 0,"Message text was \"" + text + "\", could not find \"" + expectedText+"\"");
}
