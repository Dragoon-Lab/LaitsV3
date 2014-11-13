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

function findIdbyName(nodeName){
    return null;
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
    var urlRoot = 'http://localhost/Dragoon/www/index.html';
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
    client.click('#createNodeButton',done);
}

exports.menuOpenGraph = function(client,done){
    client.click('#graphButton');
}

exports.menuOpenTable = function(client,done){
    client.click('#tableButton');
}

exports.menuOpenForum = function(client,done){
    client.click('#forumButton');
}

exports.menuOpenAuthorOptions = function(client,done){
    client.click('#descButton');
}

exports.menuOpenSaveAs = function(client,done){
    client.click('#saveButton');
}

exports.menuOpenPreview = function(client,done){
    client.click('#previewButton');
}

exports.menuOpenHints = function(client,done){
    client.click('#descButton');
}

exports.menuOpenHelpIntroduction = function(client,done){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuIntroText');
}

exports.menuOpenHelpIntroVideo = function(client,done){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuIntroVideo');
}

exports.menuOpenHelpMathFunctions = function(client,done){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuMathFunctions');
}

exports.menuOpenLessonsLearned = function(client,done){
    client.click('#lessonsLearnedButton');
}

exports.menuDone = function(client,done){
    client.click('#doneButton');
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. Canvas functions

// Node manipulation
// This currently is by nodeId and not node name
// If by node name is needed then an additional "findIdByNodeName" will be needed
exports.openEditorForNode = function(client,nodeId,done){
    client.click('#' + nodeId);
}

exports.openEditorForNodeByName = function(client, nodeName, done){
    client.selectByVisibleText('#myCanvas', nodeName);
}

exports.moveNode = function(client,nodeName,xDest,yDest,done){
    client.moveToObject('#' + nodeName, 50, 50);
    client.buttonDown();
    client.moveToObject('#myCanvas', xDest, yDest);
    client.buttonUp();
}

exports.deleteNode = function(client,nodeName,done){
    client.rightClick('#' + nodeName, 50, 50);
    client.click('#dijit_Menu_0');
    console.warn("Not yet implemented.");
}

// Reading nodes
exports.getNodeBorderColor = function(client,nodeName,done){
    console.warn("Not yet implemented.");
    return "";
}

exports.getNodeBorderStyle = function(client,nodeName,done){
    console.warn("Not yet implemented.");
    return "";
}

exports.getNodeFillColor = function(client,nodeName,done){
    console.warn("Not yet implemented.");
    return "";
}

exports.getNodeExteriorText = function(client,nodeName,done){
    console.warn("Not yet implemented.");
    return "";
}

exports.getNodeInteriorText = function(client,nodeName,done){
    console.warn("Not yet implemented.");
    return "";
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
// 4. Node editor window functions -- these require an open node!!

exports.getNodeEditorTitle = function(client,callback){
    
    console.warn("Not working yet!!");  
    
    // I don't think I have the right selector here:
    client.getText("#nodeeditor_title.dijitDialogTitle",callback);
}

exports.setNodeDescription = function(client,done){
    console.warn("Not yet implemented.");
}

exports.getNodeDescription = function(client){
    console.warn("Not yet implemented.");
    return "";
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

//
// Author mode only:
//


////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. Graph and table editor window functions
// These functions require an open Graph & Table window

// Switching tabs

exports.selectGraphTab = function(client,done){
    // Summary: Selects (clicks) the graph tab, making the graphs visible
    console.warn("Not yet implemented.");
}

exports.selectTableTab = function(client,done){
    // Summary: Selects (clicks) the table tab, making the table visible
    console.warn("Not yet implemented.");
}

// Read text in graph window
exports.getGraphMessageText = function(client,done){
    // Summary: returns the text in the graph window, if no graph is displayed (or null otherwise)
    console.warn("Not yet implemented.");
    return null;
}

exports.getGraphResultText = function(client,done){
    // Summary: returns the text used to display if the student matched the author's result or not
    //          (i.e. the red or green text) or null if neither message is not present
    console.warn("Not yet implemented.");
    return null;
}

// Slider and value manipulation

exports.setQuantityValue = function(client,quantityName,newValue,done){
    // Summary: Changes the value in the box marked with quantityName to newValue
    console.warn("Not yet implemented.");
}

exports.moveSliderRight = function(client,quantityName,distance,done){
    // Summary: Moves the slider marked with quantityName to the right distance pixels.
    console.warn("Not yet implemented.");
}

exports.moveSliderLeft = function(client,quantityName,distance,done){
    // Summary: Moves the slider marked with quantityName to the left distance pixels.
    console.warn("Not yet implemented.");
}


// Table

exports.tableGetValue = function(client,column,row,done){
    // Summary: returns the value of the cell in the column/row of table, or null if the cell can't
    //          be found.
    var value;
    client.getText('#row' + row + 'col' + column, value);
    console.log(value);
    return value;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.  Description & Times window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.  "Save as..." window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 8.  Hint slides window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 9.  Lessons Learned window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 10.  Forum functions
