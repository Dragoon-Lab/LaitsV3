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
var testPath = require('./test-paths.js');
var MAX_NODE_IDS = 100; // The maximum number of node IDs we'll support

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
    while(notFound && counter < MAX_NODE_IDS)
    {
        try{
            text = await(client.getText('#id' + counter, defer()));
            var lines = text.split('\n');
            var newText = lines.splice(-1,1)[0]; // take the last line
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
function findDropDownByName(client, name){
    var notFound = true;
    var counter = 0;
    var result = null;
    var text = "";
    while(notFound && counter < MAX_NODE_IDS)
    {
        try{
            text = await(client.getText('#dijit_MenuItem_' + counter, defer()));
        }catch(err){}
        if(text == name)
        {
            notFound = false;
            result = counter;
        }
        counter++;
    }
    return result;
}

function wait(milliseconds)
{
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getUrlRoot()
{
    var testTarget = testPath.getTestTarget();
    if(testTarget === "devel")
    {
        return 'http://dragoon.asu.edu/devel/index.html'
    }
    else if(testTarget === "demo")
    {
        return 'http://dragoon.asu.edu/demo/index.html'
    }
    else if(testTarget === "pal3")
    {
        return 'http://dragoon.asu.edu/PAL3/index.html'
    }
    else if(testTarget === "local")
    {
        return testPath.getLocalPath();
    }
    else
    {
        throw "Test target is not valid please check test-paths.js";
    }
}

function rgbToColor(toConvert)
{
    toConvert = toConvert.trim();
    if(toConvert === "rgb(0,128,0)" || toConvert === "rgba(148,255,148,1)" || 
       toConvert === "rgba(144,238,144,1)" || toConvert === "green" || toConvert === "rgb(144,238,144)")
    {
        return "green";
    }
    else if(toConvert === "rgb(255,213,0)" || toConvert === "yellow" || toConvert === "rgba(255,255,0,1)")
    {
        return "yellow";
    }
    else if(toConvert === "rgb(255,128,128)" || toConvert === "rgba(255,128,128,1)" || toConvert === "red")
    {
        return "red";
    }
    else if(toConvert === "rgba(255,255,255,1)" || toConvert === "white")
    {
        return "white";
    }
    else if(toConvert === "rgba(0,0,0,0)" || toConvert === "gray" || toConvert === "rgb(230,230,230)" ||
            toConvert == "rgb(230,230,230)" || toConvert == "rgba(230,230,230,1)")
    {
        return "gray";
    }
    else if(toConvert === "rgb(46,254,247" || toConvert === "blue" || toConvert === "rgb(173,216,230)" ||
        toConvert === "rgba(173,216,230,1)")
    {
        return "blue";
    }
    else
        return toConvert;
}

//dijit_MenuItem_#

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

    // required params
    //var urlRoot = 'http://dragoon.asu.edu/devel/index.html';
    var urlRoot = getUrlRoot();
    var user = "u="+(paramMap["user"] || getDate()); // defaults to the current date
    var problem = "&p=" + (paramMap["problem"] || getDate());
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

    await(client.init().url(url,defer()));
}

//Test Functions
exports.getHtmlOfNode = function(client, nodeName){
    var html = await(client.getHTML('#id' + findIdbyName(client, nodeName),defer()));
    //console.log(html);
    var style = await(client.getCssProperty('#selectDescription',"background-color" ,defer()));
    console.log(style.value);
}

exports.waitTime = function(client, timeToWait)
{
    wait(timeToWait);
}

exports.waitForEditor = function(client)
{
    await(client.waitForVisible('#nodeeditor',1000, false, defer()));
}

exports.refresh = function(client)
{
    var url = await(client.url(defer()));
    //await(client.window());
    await(client.newWindow(url.value, "Color test", 'width=1000,height=1000,resizable,scrollbars=yes,status=1', defer()));
}

exports.changeClient = function (client, newClient)
{
    var url = await(client.url(defer()));
    console.log(url.value);
    client.end();
    await(newClient.init().url(url.value, defer()));
}
////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. Menu bar functions

exports.menuCreateNode = function(client){  
    await(client.click('span[id="createNodeButton_label"]',defer()));
    wait(200);
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
    wait(100);
}

exports.moveNode = function(client,nodeName,xDest,yDest){
    await(client.moveToObject('#' + nodeName, 50, 50,defer()));
    await(client.buttonDown(defer()));
    await(client.moveToObject('#myCanvas', xDest, yDest,defer()));
    await(client.buttonUp(defer()));
}

exports.deleteNode = function(client,nodeName){
    await(client.rightClick('#id' + findIdbyName(client, nodeName), 50, 50, defer()));
    console.log("##################################TEXT:");
    console.log(await(client.getAttribute('#id12','_dijitmenudijit_menu_2',defer())));
    console.log(await(client.getText('#dijit_Menu_2',defer())));
    await(client.click('#dijit_Menu_2',defer())); //' + ((findIdbyName(client, nodeName) - 1), defer()))); 
}

// Reading nodes
exports.getNodeType = function(client,nodeName){
    // Summary: Returns a string describing the type of the node, e.g. "accumulator", "parameter",
    //          "function", or "none" if the node has no type yet.
    console.warn("Not yet implemented.");
    return null;
}

exports.getNodeBorderColor = function(client,nodeName){
    // Summary: Returns a string describing the color of the node's border
    //          returns in the format "rgb(#,#,#)"

    return rgbToColor(await(client.getCssProperty('#id' + findIdbyName(client, nodeName),"border-color" ,defer())).value);
}

exports.getNodeBorderStyle = function(client,nodeName){
    return await(client.getCssProperty('#id' + findIdbyName(client, nodeName),"border-style" ,defer())).value;
}

exports.getNodeFillColor = function(client,nodeName){
    // Summary: returns a string describing the fill color of the node
    //          returns in the format "rgba(#,#,#,#)"
    return rgbToColor(await(client.getCssProperty('#id' + findIdbyName(client, nodeName),"background-color" ,defer())).value);
}

exports.getNodeExteriorText = function(client,nodeName){
    console.warn("Not yet implemented.");
    return null;
}

exports.getNodeInteriorText = function(client,nodeName){
    console.warn("Not yet implemented.");
    return null;
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. Node editor window functions -- these require an open node!!

// TODO: add getters for disabled state and color for all applicable boxes

//////////////////////////////////////////////////
//Show in student model

exports.getShownInStudentModel = function(client){
    console.warn("Not yet implemented.");
}

exports.setShownInStudentModel = function(client, shown){
    console.warn("Not yet implemented.");
}

//Select model
exports.getSelectModel = function(client){
    console.warn("Not yet implemented.");
}

exports.setSelectModel = function(client){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Title (can be used to see if the correct node was opened)

exports.getNodeEditorTitle = function(client){
    return await(client.getText("#nodeeditor_title.dijitDialogTitle",defer()));
}

exports.getNodeName = function(client){
    await(client.getText('#widget_setName', defer()));
}

exports.setNodeName = function(client, nodeName){
    await(client.setValue('#setName', nodeName, defer()));
}

//////////////////////////////////////////////////
// Popup window funcitons

exports.popupWindowPressOk = function(client){
    await(client.click('#OkButton',defer()));
    wait(200);
}

exports.popupWindowGetText = function(client){
    console.warn("Not yet implemented!");
}

//////////////////////////////////////////////////
//Kind of quantity

exports.getKindOfQuantity = function(client){
    console.warn("Not yet implemented.");
}

exports.setKindOfQuantity = function(client, type){
    await(client.click('#selectKind', defer()));
    wait(100);
    await(client.waitForVisible('#selectKind_menu', defer()));
    var number = findDropDownByName(client, type);
    if(number != null)
    {
        await(client.click('#dijit_MenuItem_' + number, defer()));
    }
    else
    {
        await(client.click('#selectKind', defer()));
    }
}

//////////////////////////////////////////////////
// Node description

exports.getNodeDescription = function(client){
    if(await(client.isVisible('#selectDescription',defer())))
    {
        return await(client.getText('#selectDescription',defer()));
    }
    else
    {
        return await(client.getValue('#setDescription', defer()));
    }
}

exports.getNodeDescriptionColor = function(client){
    // Summary: Returns a string representing the color of the field: "red","yellow","green","blue"
    //          or "none" if the field has no color.
    var test = await(client.getCssProperty('#selectDescription',"background-color" ,defer())).value;
    wait(5000);
    return rgbToColor(test);
}

exports.isNodeDescriptionDisabled = function(client){
    // Summary: Returns a boolean; true if the field is disabled, false if it is enabled.
    console.warn("Not yet implemented.");
    return null;
}

exports.setNodeDescription = function(client, description){
    if(await(client.isVisible('#selectDescription',defer())))
    {
        await(client.click('#selectDescription', defer()));
        //await(client.click('#selectDescription', defer()));
        await(client.waitForVisible('#selectDescription_menu', defer()));
        var number = findDropDownByName(client, description);
        if(number != null)
        {
            await(client.click('#dijit_MenuItem_' + number, defer()));
        }
        else
        {
            await(client.click('#selectDescription', defer()));
        }
    }
    else
    {
        await(client.setValue('#setDescription', description, defer()));
    }
}


//////////////////////////////////////////////////
// Node type

exports.getNodeType = function(client){
    // Summary: Returns a string of the node type: "Parameter","Accumulator", "Function" or "--Select--"
    //          if a type has not been selected
    return await(client.getText('table[id="typeId"]',defer()));
}

exports.getNodeTypeColor = function(client){
    // Summary: Returns a string representing the color of the field: "red","yellow","green","blue"
    //          or "none" if the field has no color.
    return rgbToColor(await(client.getCssProperty('table[id="typeId"]',"background-color" ,defer())).value);
}

exports.isNodeTypeDisabled = function(client){
    // Summary: Returns a boolean; true if the field is disabled, false if it is enabled.
    console.warn("Not yet implemented.");
    return null;
}

exports.setNodeType = function(client,type){
    await(client.click('#typeId', defer()));
    await(client.waitForVisible('#typeId_menu', defer()));
    var number = findDropDownByName(client, type);
    if(number != null)
    {
        await(client.click('#dijit_MenuItem_' + number, defer()));
    }
    else
    {
        await(client.click('#selectKind', defer()));
    }
}

//////////////////////////////////////////////////
// Initial Value

exports.getNodeInitialValue = function(client){
    return await(client.getValue('#initialValue',defer()));
}

exports.getNodeInitialValueColor = function(client){
    // Summary: Returns a string representing the color of the field: "red","yellow","green","blue"
    //          or "none" if the field has no color.
    return rgbToColor(await(client.getCssProperty('#widget_initialValue',"background-color" ,defer())).value);
}

exports.isNodeInitialValueDisabled = function(client){
    // Summary: Returns a boolean; true if the field is disabled, false if it is enabled.
    console.warn("Not yet implemented.");
    return null;
}

exports.setNodeInitialValue = function(client,initialValue){
    await(client.setValue('#initialValue',initialValue.toString(), defer()));
    await(client.click("#algebraic",defer()));
}

//////////////////////////////////////////////////
// Units

exports.getNodeUnits = function(client){
    if(await(client.isVisible('#selectUnits',defer())))
    {
        return await(client.getText('table[id="selectUnits"]',defer()));
    }
    else
    {
        return await(client.getValue('#setUnits',defer()));
    }
}

exports.getNodeUnitsColor = function(client){
    // Summary: Returns a string representing the color of the field: "red","yellow","green","blue"
    //          or "none" if the field has no color.
    return rgbToColor(await(client.getCssProperty('#selectUnits',"background-color" ,defer())).value);
}

exports.isNodeUnitsDisabled = function(client){
    // Summary: Returns a boolean; true if the field is disabled, false if it is enabled.
    console.warn("Not yet implemented.");
    return null;
}


exports.setNodeUnits = function(client,units){
    try{
        if(await(client.isVisible('#selectUnits',defer())))
        {
            await(client.click('#selectUnits', defer()));
            await(client.waitForVisible('#selectUnits_menu', defer()));
            var number = findDropDownByName(client, units);
            if(number != null)
            {
                await(client.click('#dijit_MenuItem_' + number, defer()));
            }
            else
            {
                await(client.click('#selectUnits', defer()));
            }
        }
        else
        {
            await(client.setValue('#setUnits', units, defer()));
        }
    }
    catch(err){
        console.warn("Error setting node units: " + err);
    }

}

//////////////////////////////////////////////////
// Expression controls

exports.getNodeExpression = function(client){
    //Summary gets the text in the expression box
    return await(client.getValue('#equationBox',defer()));
}

exports.getNodeExpressionColor = function(client){
    // Summary: Returns a string representing the color of the field: "red","yellow","green","blue"
    //          or "none" if the field has no color.
    //console.log("test");
    return rgbToColor(await(client.getCssProperty('#equationBox',"background-color" ,defer())).value);
}

exports.isNodeExpressionDisabled = function(client){
    // Summary: Returns a boolean; true if the field is disabled, false if it is enabled.
    console.warn("Not yet implemented.");
    return null;
}

exports.setNodeExpression = function(client,expression){
    await(client.setValue('#equationBox', expression, defer()));
}

exports.expressionInsertInput = function(client){
    //Summary: use the insert control to add something to the expression
    console.warn("Not yet implemented.");
}

// TODO: Add +,-,*,and / insert functions

exports.pressPlusButton = function(client){    
    await(client.click('span[id="plusButton_label"]',defer()));
}

exports.pressMinusButton = function(client){    
    await(client.click('span[id="minusButton_label"]',defer()));
}

exports.pressMultiplyButton = function(client){    
    await(client.click('span[id="timesButton_label"]',defer()));
}

exports.pressDivideButton = function(client){    
    await(client.click('span[id="divideButton_label"]',defer()));
}

exports.clearExpression = function(client){
    await(client.click('span[id="undoButton"]',defer()));
}

exports.checkExpression = function(client){
    await(client.click('span[id="equationDoneButton_label"]',defer()));
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
    wait(200);
}

exports.closeNodeEditor = function(client){
    // Summary: Closes node editor using the "x"
    await(client.click('span[class="dijitDialogCloseIcon"]',defer()));
}

exports.nodeEditorDelete = function(client){
    await(client.click('#deleteButton', defer()));
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
        client.click('#dijit_layout_TabContainer_' + count + '_tablist_dijit_layout_ContentPane_' + (1 + count*4) , callback);
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
        client.click('#dijit_layout_TabContainer_' + count + '_tablist_dijit_layout_ContentPane_' + (2 + count*4) , callback);
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
    await(client.setValue('#textGraph_id' + findIdbyName(client,quantityName), newValue , defer()));
    await(client.addValue('#textGraph_id' + findIdbyName(client,quantityName), "\r" , defer()));
    //wait(100);
    await(client.click('#row0col0', defer())); 
}

exports.moveSliderRight = function(client,quantityName,distance){
    // Summary: Moves the slider marked with quantityName to the right distance pixels.
    console.warn("Not yet implemented.");
}

exports.moveSliderLeft = function(client,quantityName,distance){
    // Summary: Moves the slider marked with quantityName to the left distance pixels.
    console.warn("Not yet implemented.");
}


// Table

exports.tableGetValue = function(client,row,column){
    // Summary: returns the value of the cell in the column/row of table, or null if the cell can't
    //          be found.
    return await(client.getText('#row' + row + 'col' + column,defer()));
}

exports.closeGraphAndTableWindow = function(client){
    // Summary: closes the graph/table window
    await(client.click('span[class="dijitDialogCloseIcon"]',defer()));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.  Description & Times window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.  "Save as..." window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 8.  Hint slides window functions

////////////////////////////////////////////////////////////////////////////////////////////////////
// 9.  Lessons Learned window functions

exports.lessonsLearnedClose = function(client){
    await(client.click('span[class="dijitDialogCloseIcon"]',defer()));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// 10.  Forum functions

