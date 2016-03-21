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
	"dojo/request/iframe",
	"dojo/dom-construct",
	"dojo/request/script"
], function(array, declare, lang, iframe, domConstruct, script){
	return declare(null, {

		/*constructor : function(frameTitle){
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
				
		},*/
		constructor: function(/* object */ query){
			//parameters from ParentPage.html
			this.HTTP_MESSAGING_GATEWAY = null;
			this.MAIN_POSTING_GATEWAY = null;
			this.CHILD_WINDOW = null;
			this.TEST_SERVICE = null;
			this.HEART_MONITOR_SERVICE = null;
			this.CHILD_GATEWAY_ID = "ActivityFrame";
			this.IS_CHILD_LOADED = false;
			this.LOADING_WAIT_TIME = 60;
			this.LOADED_VERB = "Loaded";
			this.HEARTBEAT_NAME = "ChildHearbeat";
			this.COMPLETED_VERB = "Completed";
			this.DUMP_LOG_VERB = "Dump Logs";

			//parameters for child window instantiation
			this.p1 = query.p1; //user reference ID, uuid
			this.p2 = query.p2; //class reference, uuid
			this.p3 = query.p3; //assignment reference, uuid
			this.p4 = query.p4; //assistment ID, ID
			this.p5 = query.p5; //problem ID
			this.p6 = query.p6; //user name
			this.p7 = query.p7; // assistments system reference, uuid
		},

		startService : function(){
			/*
			// unknown: if the all the constructor initializations are synchronous
			this.HeartbeatService.start();
			this.TestService.sendTestMessage(this.FRAME_NAME, this.LOADED_VERB, window.location.href, true);
    		console.log("ET loaded message send");
			*/
			console.log("Start ET connect services");
			var sourceURL = "../ET/ChildWindow.html?taskId=" + this.taskID + "&p1=" + this.p1 + "&p2=" + this.p2 + "&p3=" + this.p3 +
				"&p4=" + this.p4 +"&p5=" + this.p5 + "&p6=" + this.p6 + "&p7=" + this.p7;
			registry.byId("ETContainer").set("content", domConstruct.create("iframe", {
				src: sourceURL,
				style: "visibility: none; height:0; width:0"
			}));

			script.get("//cdnjs.cloudflare.com/ajax/libs/socket.io/1.1.0/socket.io.min.js", {}).then(function(data){
				var socketScript = domConstruct.create("script");
				socketScript.src = data;
				socketScript.type = "text/javascript";
				domConstruct.place(socketScript, null, dojo.body, "last");

				this.onStart();
			});
		},

		onStart: function(){
			var gatewayScope = {};
			gatewayScope[ReferenceData.REFERENCE_IMPLEMENTATION_VERSION_KEY] = ReferenceData.version;
			gatewayScope[ReferenceData.USER_AGENT_KEY] = navigator.userAgent;
			this.CHILD_GATEWAY = SuperGLU.Message_Gateway.PostMessageGatewayStub(
				this.CHILD_GATEWAY_ID, null, null, CHILD_WINDOW);
			this.TEST_SERVICE = SuperGLU.Message_Gateway.TestService("ParentTestService");
			this.HEART_MONITOR_SERVICE = SuperGLU.Heartbeat_Service.HeartbeatMonitor(
				null, [this.HEARTBEAT_NAME], 150, this.onSkipHeartbeat);
			this.MAIN_POSTING_GATEWAY = SuperGLU.MessageGateway.PostMessageGateway(
				"MainPostingGateway", [
					this.CHILD_GATEWAY,
					this.HEART_MONITOR_SERVICE,
					this.TEST_SERVICE
				],
				null, gatewayScope);
			this.HEART_MONITOR_SERVICE.start();

			var oldReceiveMsg = this.TEST_SERVICE.receiveMessage;
			this.TEST_SERVICE.receiveMessage = function(msg){
				oldReceiveMsg(msg);
				if((msg.getSpeechAct() == Messaging.INFORM_ACT) && 
					((msg.getVerb() == this.LOADED_VERB) || (msg.getVerb() == this.COMPLETED_VERB))){
					// if we want to show a message which we dont so just not doing anything in case.
					//Keeping it for future
				} else if((msg.getSpeechAct() == Messaging.INFORM_ACT) && 
					((msg.getVerb() == this.LOADED_VERB) || (msg.getVerb() == Heartbeat_Service.HEARTBEAT_VERB))) {
					this.IS_CHILD_LOADED = true;
				} else if(msg.getVerb() == this.DUMP_LOG_VERB) {
					//again keeping it just in case for future
				}
			};
			setTimeout(this.onLoadingTimeout, this.LOADING_WAIT_TIME*1000);
		},

		onSkipHeartbeat: function(name, monitor){
			monitor.stop();
		},

		onLoadingTimeout: function(){
			if(this.IS_CHILD_LOADED !== true)
				HEART_MONITOR_SERVICE.stop();
		},

		stopService : function(){
			this.HeartbeatService.stop();
		},
		sendScore : function(score){
			this.TestService.sendTestMessage(this.Frame_Name, this.COMPLETED_VERB, this.Frame_Name, score, Messaging.INFORM_ACT, {});
			this.needsToSendScore = false;
			console.log("ET service stopped");
		}
		
	});
	
});
