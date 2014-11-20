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
// Globalize these so we don't have to type "sync." everywhere.
var await = sync.await;  // Wrap this around asynchronous functions. Returns 2nd arg to callback
var defer = sync.defer;  // Pass this as the callback function to asynchronous functions

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

function findIdbyName(client, nodeName){
    var notFound = true;
    var counter = 1;
    var result = null;
    var text = "";
    while(notFound && counter < 100)
    {
        try{
            text = await(client.getText('#id' + counter, defer()));
            var lines = text.split('\n');
            lines.splice(0,1);
            var newText = lines.join('\n');
        }catch(err){}
        if(newText === nodeName)
        {
            notFound = false;
            result = counter;
        }
        counter++;
    }
    return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Exported functions - The dtest API
////////////////////////////////////////////////////////////////////////////////////////////////////

// All of these functions are asynchronous. The callback function can be passed to the final call of
// the webdriverio client stack, e.g. client.init().url(url, callback);  This will pass the callback
// function two arguments: the error and the return value of the call.  See the webdriverio API
// for more information: http://webdriver.io/api/

// For getter functions you MUST pass the callback so it gets the desired result.  Returning will
// do nothing.

// For setter or other functions, you should pass the callback to the last command so it is called
// when the function ends.

////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. Problem functions

// Open a problem
exports.openProblem = function(client,parameters){
    // parameters should be an associative array of arguments corresponding to the values needed to
    // build the URL
    var paramMap = convertArrayToMap(parameters);
    console.log(paramMap);
    // required params
    var urlRoot = 'http://dragoon.asu.edu/devel/index.html';
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

    var logging = paramMap["logging"];
    if (logging == null){
        logging = "";
    } else {
        logging = "&l=" + logging;
    }
    // possible TODO: allow power user mode.

    var url = urlRoot + '?' + user + section + problem + mode + nodeEditorMode + group + logging +
              "&c=Continue";
    console.log(url);
    await(client.init().url(url,defer()));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. Menu bar functions

exports.menuCreateNode = function(client){    
    console.log("in menu create node");
    await(client.click('span[id="createNodeButton_label"]',defer()));
}

exports.menuOpenGraph = function(client){
    await(client.click('#graphButton',defer()));
}

exports.menuOpenTable = function(client){
    await(client.click('#tableButton',defer()));
}

exports.menuOpenForum = function(client){
    await(client.click('#forumButton',defer()));
}

exports.menuOpenAuthorOptions = function(client){
    await(client.click('#descButton',defer()));
}

exports.menuOpenSaveAs = function(client){
    await(client.click('#saveButton',defer()));
}

exports.menuOpenPreview = function(client){
    await(client.click('#previewButton',defer()));
}

exports.menuOpenHints = function(client){
    await(client.click('#descButton',defer()));
}

exports.menuOpenHelpIntroduction = function(client){
    await(client.click('#dijit_PopupMenuBarItem_0_text',defer()));
    await(client.click('#menuIntroText',defer()));
}

exports.menuOpenHelpIntroVideo = function(client){
    await(client.click('#dijit_PopupMenuBarItem_0_text',defer()));
    await(client.click('#menuIntroVideo',defer()));
}

exports.menuOpenHelpMathFunctions = function(client){
    await(client.click('#dijit_PopupMenuBarItem_0_text',defer()));
    await(client.click('#menuMathFunctions',defer()));
}

exports.menuOpenLessonsLearned = function(client){
    await(client.click('#lessonsLearnedButton',defer()));
}

exports.menuDone = function(client){
    await(client.click('#doneButton',defer()));
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. Canvas functions

// Node manipulation
// This currently is by nodeId and not node name
// If by node name is needed then an additional "findIdByNodeName" will be needed
exports.openEditorForNode = function(client,nodeName){
    await(client.click('#id' + findIdbyName(client, nodeName),defer()));
}

exports.moveNode = function(client,nodeName,xDest,yDest){
    await(client.moveToObject('#' + nodeName, 50, 50,defer()));
    await(client.buttonDown(defer()));
    await(client.moveToObject('#myCanvas', xDest, yDest,defer()));
    await(client.buttonUp(defer()));
}

exports.deleteNode = function(client,nodeName){
    await(client.rightClick('#' + nodeName, 50, 50,defer()));
    await(client.click('#dijit_Menu_0',defer()));
    console.warn("Not yet implemented.");
}

// Reading nodes
exports.getNodeBorderColor = function(client,nodeName){
    console.warn("Not yet implemented.");
}

exports.getNodeBorderStyle = function(client,nodeName){
    console.warn("Not yet implemented.");
}

exports.getNodeFillColor = function(client,nodeName){
    console.warn("Not yet implemented.");
}

exports.getNodeExteriorText = function(client,nodeName){
    console.warn("Not yet implemented.");
}

exports.getNodeInteriorText = function(client,nodeName){
    console.warn("Not yet implemented.");
}
// Alert messages

exports.getAlertMessageText = function(client){
    // Summary: Returns the string that is 
    console.warn("Not yet implemented.");
}

exports.closeAlertMessage = function(client){
    console.warn("Not yet implemented.");
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. Node editor window functions -- these require an open node!!

// TODO: add getters for disabled state and color for all applicable boxes

//////////////////////////////////////////////////
// Title (can be used to see if the correct node was opened)

exports.getNodeEditorTitle = function(client){
    return await(client.getText("#nodeeditor_title.dijitDialogTitle",defer()));
}

//////////////////////////////////////////////////
// Node description

exports.getNodeDescription = function(client){
    return await(client.getText('span[id="descriptionControlStudent"]',defer()));
}

exports.setNodeDescription = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Node type

exports.getNodeType = function(client){
    return await(client.getText('table[id="typeId"]',defer()));
}

exports.setNodeType = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Initial Value

exports.getNodeInitialValue = function(client){
    return await(client.getText('input[id="initialValue"]',defer()));
}

exports.setNodeInitialValue = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Units

exports.getNodeUnits = function(client){
    return await(client.getText('table[id="selectUnits"]',defer()));
}

exports.setNodeUnits = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Expression controls

exports.getNodeExpression = function(client){
    //Summary gets the text in the expression box
    console.warn("Not yet implemented.");
}

exports.setNodeExpression = function(client){
    console.warn("Not yet implemented.");
}

exports.expressionInsertInput = function(client){
    //Summary: use the insert control to add something to the expression
    console.warn("Not yet implemented.");
}

// TODO: Add +,-,*,and / insert functions

exports.clearExpression = function(client){
    //Summary: presses the clear expression button
    console.warn("Not yet implemented.");
}

exports.checkExpression = function(client){
    //Summary: presses the check expression button
    console.warn("Not yet implemented.");
}


//////////////////////////////////////////////////
// Forum button

exports.openNodeForum = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Exiting the node editor

exports.nodeEditorDone = function(client){
    // Summary: Hits the "Done" button in the node editor
    await(client.click('span[id="closeButton_label"]',defer()));
}

exports.closeNodeEditor = function(client){
    // Summary: Closes node editor using the "x"
    await(client.click('span[class="dijitDialogCloseIcon"]',defer()));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. Graph and table editor window functions
// These functions require an open Graph & Table window

// Switching tabs

exports.selectGraphTab = function(client){
    // Summary: Selects (clicks) the graph tab, making the graphs visible
        var found = false;
    var count = -1;
    while(!found && count < 10)
    {
        count++;
        try{
        await(client.click('#dijit_layout_TabContainer_' + count + '_tablist_dijit_layout_ContentPane_' + (1 + count*4) , defer()));
        found = true;
        }
        catch(err){}
    }
}

exports.selectTableTab = function(client){
    // Summary: Selects (clicks) the table tab, making the table visible
            var found = false;
    var count = -1;
    while(!found && count < 10)
    {
        count++;
        try{
        await(client.click('#dijit_layout_TabContainer_' + count + '_tablist_dijit_layout_ContentPane_' + (2 + count*4) , defer()));
        found = true;
        }
        catch(err){}
    }
}

// Read text in graph window
exports.getGraphMessageText = function(client){
    // Summary: returns the text in the graph window, if no graph is displayed (or null otherwise)
    return await(client.getText('#solution', defer()))
}

exports.getGraphResultText = function(client){
    // Summary: returns the text used to display if the student matched the author's result or not
    //          (i.e. the red or green text) or null if neither message is not present
    return await(client.getText('#graphResultText', defer()));
}

// Slider and value manipulation

exports.setQuantityValue = function(client,quantityName,newValue){
    // Summary: Changes the value in the box marked with quantityName to newValue
    await(client.setValue('#textGraph_id' + quantityName, newValue, defer()));
}

exports.moveSliderRight = function(client,quantityName,distance){
    // Summary: Moves the slider marked with quantityName to the right distance pixels.
    console.warn("Not yet implemented.");
}

exports.moveSliderLeft = function(client,quantityName,distance){
    // Summary: Moves the slider marked with quantityName to the left distance pixels.
    console.warn("Not yet implemented.");
}

exports.clickSliderRight = function(client,quantityName,clicks,callback)
{
    // Summary: Clicks the button to move the slider right 'clicks' number of times
    console.warn("Not yet implemented");
}

exports.clickSliderLeft = function(client,quantityName,clicks,callback)
{
    // Summary: Clicks the button to move the slider left 'clicks' number of times
    console.warn("Not yet implemented");
}

// Table

exports.tableGetValue = function(client,column,row){
    // Summary: returns the value of the cell in the column/row of table, or null if the cell can't
    //          be found.
    return await(client.getText('#row' + row + 'col' + column,defer()));
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

