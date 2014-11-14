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
    console.warn("Not yet implemented!");
    return null;
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
exports.openProblem = function(client,parameters,done){
    // parameters should be an associative array of arguments corresponding to the values needed to
    // build the URL
    var paramMap = convertArrayToMap(parameters);
    console.log(paramMap);
    // required params
    var urlRoot = 'http://localhost/Laitsv3/www/index.html';
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

exports.menuCreateNode = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
    client.click('span[id="createNodeButton_label"]');
    });
}

exports.menuOpenGraph = function(client,callback){
    client.click('#graphButton');
}

exports.menuOpenTable = function(client,callback){
    client.click('#tableButton');
}

exports.menuOpenForum = function(client,callback){
    client.click('#forumButton');
}

exports.menuOpenAuthorOptions = function(client,callback){
    client.click('#descButton');
}

exports.menuOpenSaveAs = function(client,callback){
    client.click('#saveButton');
}

exports.menuOpenPreview = function(client,callback){
    client.click('#previewButton');
}

exports.menuOpenHints = function(client,callback){
    client.click('#descButton');
}

exports.menuOpenHelpIntroduction = function(client,callback){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuIntroText');
}

exports.menuOpenHelpIntroVideo = function(client,callback){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuIntroVideo');
}

exports.menuOpenHelpMathFunctions = function(client,callback){
    client.click('#dijit_PopupMenuBarItem_0_text');
    client.click('#menuMathFunctions');
}

exports.menuOpenLessonsLearned = function(client,callback){
    client.click('#lessonsLearnedButton');
}

exports.menuDone = function(client,callback){
    client.click('#doneButton');
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. Canvas functions

// Node manipulation
// This currently is by nodeId and not node name
// If by node name is needed then an additional "findIdByNodeName" will be needed
exports.openEditorForNode = function(client,nodeId,callback){
    client.click('#' + nodeId);
}

exports.openEditorForNodeByName = function(client, nodeName, callback){
    client.selectByVisibleText('#myCanvas', nodeName);
}

exports.moveNode = function(client,nodeName,xDest,yDest,callback){
    client.moveToObject('#' + nodeName, 50, 50);
    client.buttonDown();
    client.moveToObject('#myCanvas', xDest, yDest);
    client.buttonUp();
}

exports.deleteNode = function(client,nodeName,callback){
    client.rightClick('#' + nodeName, 50, 50);
    client.click('#dijit_Menu_0');
    console.warn("Not yet implemented.");
}

// Reading nodes
exports.getNodeBorderColor = function(client,nodeName,callback){
    console.warn("Not yet implemented.");
}

exports.getNodeBorderStyle = function(client,nodeName,callback){
    console.warn("Not yet implemented.");
}

exports.getNodeFillColor = function(client,nodeName,callback){
    console.warn("Not yet implemented.");
}

exports.getNodeExteriorText = function(client,nodeName,callback){
    console.warn("Not yet implemented.");
}

exports.getNodeInteriorText = function(client,nodeName,callback){
    console.warn("Not yet implemented.");
}
// Alert messages

exports.getAlertMessageText = function(client,callback){
    // Summary: Returns the string that is
    console.warn("Not yet implemented.");
}

exports.closeAlertMessage = function(client,callback){
    console.warn("Not yet implemented.");
}



////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. Node editor window functions -- these require an open node!!

// TODO: add getters for disabled state and color for all applicable boxes

//////////////////////////////////////////////////
// Title (can be used to see if the correct node was opened)

exports.getNodeEditorTitle = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[id="nodeeditor_title"]', 1000, function (err) {
                client.getText('span[id="nodeeditor_title"]', function(err, text){
                console.log(text);
                });
            });
        });
    });
}

//////////////////////////////////////////////////
// Node description

exports.getNodeDescription = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('div[id="descriptionControlStudent"]', 1000, function (err) {
                client.getText('span[id="descriptionControlStudent"]', function(err, text){
                    console.log(text);
                });
            });
        });
    });
}

exports.setNodeDescription = function(client,callback){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Node type

exports.getNodeType = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('table[id="typeId"]', 1000, function (err) {
                client.getText('table[id="typeId"]', function(err, text){
                    console.log(text);
                });
            });
        });
    });
}

exports.setNodeType = function(client,callback){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Initial Value

exports.getNodeInitialValue = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('input[id="initialValue"]', 1000, function (err) {
                client.getText('input[id="initialValue"]', function(err, text){
                    console.log(text);
                });
            });
        });
    });
}

exports.setNodeInitialValue = function(client,callback){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Units

exports.getNodeUnitsValue = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('table[id="selectUnits"]', 1000, function (err) {
                client.getText('table[id="selectUnits"]', function(err, text){
                    console.log(text);
                });
            });
        });
    });
}

exports.setNodeUnitsValue = function(client,callback){
    console.warn("Not yet implemented.");
}

//////////////////////////////////////////////////
// Expression controls

exports.getNodeExpression = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('textarea[id="equationBox"]', 1000, function (err) {
                client.getText('textarea[id="equationBox"]', function(err, text){
                    console.log(text);
                });
            });
        });
    });
}

exports.setNodeExpression = function(client,callback){
    console.warn("Not yet implemented.");
}

exports.expressionInsertInput = function(client,callback){
    //Summary: use the insert control to add something to the expression
    console.warn("Not yet implemented.");
}

// TODO: Add +,-,*,and / insert functions

exports.clearExpression = function(client,callback){
    //Summary: presses the clear expression button
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[id="undoButton"]', 1000, function (err) {
                client.click('span[id="undoButton"]');
                console.log("clear button");
            });
        });
    });
}

exports.checkExpression = function(client,callback){
    //Summary: presses the check expression button
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[id="equationDoneButton_label"]', 1000, function (err) {
                client.click('span[id="equationDoneButton_label"]');
                console.log("check expression");
            });
        });
    });
}


//////////////////////////////////////////////////
// Forum button

exports.openNodeForum = function(client,callback){
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[id="nodeForumButton_label"]', 1000, function (err) {
                client.click('span[id="nodeForumButton_label"]');
                console.log("Forum Button ");
            });
        });
    });
}

//////////////////////////////////////////////////
// Exiting the node editor

exports.nodeEditorDone = function(client,callback){
    // Summary: Hits the "Done" button in the node editor
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[id="closeButton_label"]', 1000, function (err) {
                client.click('span[id="closeButton_label"]');
                console.log("node editor closed");
            });
        });
    });
}

exports.closeNodeEditor = function(client,callback){
    // Summary: Closes node editor using the "x"
    client.waitForVisible('span[id="createNodeButton_label"]', 1000, function(err) {
        client.click('span[id="createNodeButton_label"]', function (err) {
            client.waitForVisible('span[class="dijitDialogCloseIcon"]', 1000, function (err) {
                client.click('span[class="dijitDialogCloseIcon"]', function(err){
                console.log("node editor closed");
                });
            });
        });
    });
}




////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. Graph and table editor window functions
// These functions require an open Graph & Table window

// Switching tabs

exports.selectGraphTab = function(client,callback){
    // Summary: Selects (clicks) the graph tab, making the graphs visible
    console.warn("Not yet implemented.");
}

exports.selectTableTab = function(client,callback){
    // Summary: Selects (clicks) the table tab, making the table visible
    console.warn("Not yet implemented.");
}

// Read text in graph window
exports.getGraphMessageText = function(client,callback){
    // Summary: returns the text in the graph window, if no graph is displayed (or null otherwise)
    console.warn("Not yet implemented.");
}

exports.getGraphResultText = function(client,callback){
    // Summary: returns the text used to display if the student matched the author's result or not
    //          (i.e. the red or green text) or null if neither message is not present
    console.warn("Not yet implemented.");
}

// Slider and value manipulation

exports.setQuantityValue = function(client,quantityName,newValue,callback){
    // Summary: Changes the value in the box marked with quantityName to newValue
    console.warn("Not yet implemented.");
}

exports.moveSliderRight = function(client,quantityName,distance,callback){
    // Summary: Moves the slider marked with quantityName to the right distance pixels.
    console.warn("Not yet implemented.");
}

exports.moveSliderLeft = function(client,quantityName,distance,callback){
    // Summary: Moves the slider marked with quantityName to the left distance pixels.
    console.warn("Not yet implemented.");
}


// Table

exports.tableGetValue = function(client,column,row,callback){
    // Summary: returns the value of the cell in the column/row of table, or null if the cell can't
    //          be found.
    client.getText('#row' + row + 'col' + column,callback);
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
