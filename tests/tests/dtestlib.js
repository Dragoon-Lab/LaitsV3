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
// Utility functions (used within the API)
////////////////////////////////////////////////////////////////////////////////////////////////////

function convertArrayToMap(assocArray){
    var newMap = {};
    for (var pair in assocArray) {
        newMap[assocArray[pair][0]] = assocArray[pair][1];
    }
    return newMap;
}

function getDate(){
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1;
    var yyyy = date.getFullYear();
    var seconds = date.getTime()/1000;

    date = mm+'/'+dd+'/'+yyyy+'/'+seconds;
    return date;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Exported functions - The dtest API
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. Problem functions

// Open a problem
exports.openProblem = function(client,parameters,done){
    // parameters should be an associative array of arguments corresponding to the values needed to
    // build the URL
    var paramMap = convertArrayToMap(parameters);
    console.log(paramMap);
    // required params
    var urlRoot = 'http://localhost/LaitsV3/www/index.html';
    var user = "u="+(paramMap["user"] || getDate()); // defaults to the current date
    var problem = "&p=" + paramMap["problem"];
    var mode = "&m=" + (paramMap["mode"]);
    var section = "&s=" + (paramMap["section"] || "autotest");
    var nodeEditorMode = "&is=" + (paramMap["submode"] ||  "algebraic");

    // optional parts

    var group = paramMap["group"];
    if( group == null){
        group = "";
    } else {
        group = "&g=" + group;
    }
    // possible TODO: allow power user mode.

    var url = urlRoot + '?' + user + section + problem + mode + nodeEditorMode + "&c=Continue";
    console.log(url);

    client.init().url(url, done);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. Menu bar functions

exports.menuCreateNode = function(client,done){
    client.click('#createNodeButton');
}

exports.menuOpenGraph = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenTable = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenForum = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenAuthorOptions = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenSaveAs = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenPreview = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenHints = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenHelpIntroduction = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenHelpIntroVideo = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenHelpMathFunctions = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuOpenLessonsLearned = function(client,done){
    console.warn("Not yet implemented.");
}

exports.menuDone = function(client,done){
    console.warn("Not yet implemented.");
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. Canvas functions

// Node manipulation

exports.openEditorForNode = function(client,nodeName,done){
    console.warn("Not yet implemented.");
}

exports.moveNode = function(client,nodeName,xDest,yDest,done){
    console.warn("Not yet implemented.");
}

exports.deleteNode = function(client,nodeName,done){
    console.warn("Not yet implemented.");
}

// Alert messages

exports.getAlertMessageText = function(client,done){
    // Summary: Returns the string that is 
    console.warn("Not yet implemented.");
    return "";
}

exports.closeAlertMessage = function(client,done){
    console.warn("Not yet implemented.");
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. Node editor window functions -- these require an open node!!

exports.setNodeDescription = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setNodeType = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setNodeInitialValue = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setNodeUnitsValue = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setNodeExpressions = function(client,done){
    console.warn("Not yet implemented.");
}

exports.checkExpression = function(client,done){
    console.warn("Not yet implemented.");
}

exports.openNodeForum = function(client,done){
    console.warn("Not yet implemented.");
}

exports.nodeEditorDone = function(client,done){
    // Summary: Hits the "Done" button in the node editor
    console.warn("Not yet implemented.");
}

exports.closeNodeEditor = function(client,done){
    // Summary: Closes node editor using the "x"
    console.warn("Not yet implemented.");
}

//
// Structured expression mode:
//
exports.undoExpression = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setExpressionToSum = function(client,done){
    console.warn("Not yet implemented.");
}

exports.setExpressionToProduct = function(client,done){
    console.warn("Not yet implemented.");
}

exports.expressionAddQuantity = function(client,done){
    console.warn("Not yet implemented.");
}

exports.expressionSubtractQuantity = function(client,done){
    console.warn("Not yet implemented.");
}

exports.expressionMultiplyQuantity = function(client,done){
    console.warn("Not yet implemented.");
}

exports.expressionDivideQuantity = function(client,done){
    console.warn("Not yet implemented.");
}

//
// Alebraic expression mode only:
//
exports.expressionInsertInput = function(client,done){
    console.warn("Not yet implemented.");
}

exports.clearExpression = function(client,done){
    console.warn("Not yet implemented.");
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. Graph and table editor window functions


// Node editor commands:

