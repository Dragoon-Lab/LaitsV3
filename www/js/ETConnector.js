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
// running Dragoon inside ET required to communicate with ET service through a heartbeat
define([
	"dojo/_base/array",
	'dojo/_base/declare',
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/ready",
	"dojo/on",	
], function(array, declare, lang, dom, domClass, style, ready,on){
	return declare(null, {
		constructor : function(frameTitle){
			this.TestService = null, 
            this.GatewayService = null, 
			this.ParentPostingService = null,
			this.HeartbeatService = null,
			this.frameName = frameTitle,
			this.heartbeartName = "ChildHeartbeat",
			this.COMPLETED_VERB = "Completed",
			this.LOADED_VERB = "Loaded";
			this.needsToSendScore = true;
			this.TestService = Messaging_Gateway.TestService("DragoonService");
			this.HeartbeatService = Heartbeat_Service.HeartbeatService(null, this.HEARTBEAT_NAME, 5);
			this.ParentPostingService = Messaging_Gateway.PostMessageGatewayStub("MainPostingGateway", null, null, parent);
			this.GatewayService = Messaging_Gateway.PostMessageGateway("Client Gateway (Main)", 
				[this.TestService, this.HeartbeatService ], this.ParentPostingService);
			console.log("Module Intialized");
				
		},
		startService : function(){
			
			// unknown: if the all the constructor initializations are synchronous
			this.HeartbeatService.start();
			this.TestService.sendTestMessage(this.FRAME_NAME, this.LOADED_VERB, window.location.href, true);
    		console.log("ET loaded message send");
		},
		stopService : function(){
			this.HeartbeatService.stop();
		},
		sendScore : function(score){
			this.TestService.sendTestMessage(this.Frame_Name, this.COMPLETED_VERB, this.Frame_Name, score, Messaging.INFORM_ACT, {});
			this.stopService();
			console.log("ET service stopped");
		}
		
	})
	
});
