/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global define */
define([
	"dojo/_base/array","dijit/registry","dojo/on"
], function(array,registry,on){
	// Summary: 
	//			Handling the Node Editor Forum Click Button Event
	// Description:
	//			Make sures all the parameters necessary for redirecting to
	//			respective forum/thread are passed successfully
    return {
        handleForumInEditor: function (model, currentID, query) {
            console.log(model);
            var givenModel=model;
            var nodeForumBut=registry.byId("nodeForumButton");
            nodeForumBut.on("click", function () {
                console.log("clicked on nodeEditor forum button");
                var current_id = currentID;
                console.log("current id is", current_id);
                var nid = givenModel.active.getDescriptionID(current_id);
                var ndesc = givenModel.given.getDescription(nid);
                console.log("nid and desc are", nid, ndesc);
                var prob_name = givenModel.getTaskName(query.p);
                console.log("problem name is ", prob_name);
                // "newwindow": the pop-out window name, not required, could be empty
                // "height" and "width": pop-out window size
                // Other properties could be changed as the value of yes or no
                window.open(query.f + "?&n=" + prob_name + "&s=" + query.s + "&fid=" + query.fid + "&sid=" + query.sid + "&nid=" + nid + "&ndesc=" + ndesc, "newwindow",
                    "height=400, width=600, toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
                );
            });
        }
    }
});
