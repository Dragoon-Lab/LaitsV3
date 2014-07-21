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
define([
	"dojo/_base/array", "dojo/_base/lang", "dojo/dom",
	"dijit/popup", "dijit/TooltipDialog",
	"./typechecker"
], function(array, lang, dom, popup, TooltipDialog, typechecker){

	var obj = lang.mixin(typechecker, {

		// Tool Tip for indicating wrong time interval values
		myTooltipDialog3: new TooltipDialog({
			style: "width: 150px;",
			content: "End Time should always be greater than Start Time"
		}),
		// Tool Tip for indicating wrong time step value
		myTooltipDialog4: new TooltipDialog({
			style: "width: 150px;",
			content: "Time Step should always be greater than zero"
		}),

		validateTimeInterval: function(nodeID, timeObj){
			//Description: performs time interval check
			// precisely checks start time > end time and returns error if any
			var errorType;
			console.log('validate timeInterval called',timeObj);
			this.closePops();
			var domNode = dom.byId(nodeID);
			console.log("dom Node is",domNode);
			if(timeObj.start >= timeObj.end) {
				console.log("Error in time intervals");
				popup.open({
					popup: this.myTooltipDialog3,
					around: domNode
				});
				errorType = "time-interval-invalid";
			}
			return {errorType: errorType};
		},

		validateTimeStep: function(nodeID, timeObj){
			//Description: performs time step check
			// precisely checks time step >0 and returns error if any
			var errorType;
			console.log('validate timeStep called',timeObj);
			this.closePops();
			var domNode = dom.byId(nodeID);
			if(timeObj.step<=0){
				console.log("Error in Time Step");
				popup.open({
					popup: this.myTooltipDialog4,
					around: domNode
				});
				errorType = "timestep-value-invalid";
			}
			return {errorType: errorType};
		}

	});

	obj.dialogs.push(obj.myTooltipDialog3);
	obj.dialogs.push(obj.myTooltipDialog4);

	return obj;

});
