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
], function(array, registry, on){
	// Summary: 
	//			Handling the Node Editor Forum Click Button Event
	// Description:
	//			Make sures all the parameters necessary for redirecting to
	//			respective forum/thread are passed successfully
	return {
		activateForum: function (model, currentID, forumparam) {
			var givenModel=model;
			var nodeForumBut=registry.byId("nodeForumButton");
			nodeForumBut.on("click", function () {
				console.log("clicked on nodeEditor forum button");
				var current_id = currentID;
				console.log("current id is", current_id);
				var nid = givenModel.active.getDescriptionID(current_id);
				var ndesc = givenModel.given.getDescription(nid);
				console.log("nid and desc are", nid, ndesc);
				var prob_name = givenModel.getTaskName(forumparam.p);
				console.log("problem name is ", prob_name);
				// "newwindow": the pop-out window name, not required, could be empty
				// "height" and "width": pop-out window size
				// Other properties could be changed as the value of yes or no
                var redirectTo=forumparam.f + "?&n=" + prob_name + "&s=" + forumparam.s + "&fid=" + forumparam.fid + "&sid=" + forumparam.sid + "&nid=" + nid + "&ndesc=" + ndesc;
                var request = new XMLHttpRequest();
                request.open('GET', redirectTo, true);
                request.onreadystatechange = function(){
                    if (request.readyState === 4){
                        if (request.status === 404) {
                            console.error("page dosen't exist");
                        }
                        else{
                            console.log(request.status);
                        }
                    }
                };
                request.send();
                var open=window.open(redirectTo,"newwindow","height=400, width=600, toolbar =no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
			});
		}
	};
});
