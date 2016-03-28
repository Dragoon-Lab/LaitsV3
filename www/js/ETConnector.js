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
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/request/iframe",
	"dojo/dom-construct"
], function(array, declare, lang, iframe, domConstruct){
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
			this.LOGGER_FRAME_NAME = "ETContainer";
			this.LOADED_VERB = "Loaded";
			this.HEARTBEAT_NAME = "ChildHearbeat";
			this.COMPLETED_VERB = "Completed";
			this.DEFAULT_FRAME_NAME = "ActivityFrame";
			this.DEFAULT_PARENT_NAME = "MainPostingGateway";

			//parameters for child window instantiation
			this.p1 = query.p1; //user reference ID, uuid
			this.p2 = query.p2; //class reference, uuid
			this.p3 = query.p3; //assignment reference, uuid
			this.p4 = query.p4; //assistment ID, ID
			this.p5 = query.p5; //problem ID
			this.p6 = query.p6; //user name
			this.p7 = query.p7; // assistments system reference, uuid
			this.taskId = query.taskId;
		},

		startService : function(){
			/*
			// unknown: if the all the constructor initializations are synchronous
			this.HeartbeatService.start();
			this.TestService.sendTestMessage(this.FRAME_NAME, this.LOADED_VERB, window.location.href, true);
    		console.log("ET loaded message send");
			*/
			console.log("Start ET connect services");
			var sourceURL = "https://recommender.x-in-y.com/LoggerWindow.html";
			dojo.byId("ETContainer").innerHTML = domConstruct.create("iframe", {
				src: sourceURL,
				style: "visibility: none; height:0; width:0"
			});

			/*script.get("", {}).then(function(data){
				var socketScript = domConstruct.create("script");
				socketScript.src = data;
				socketScript.type = "text/javascript";
				domConstruct.place(socketScript, null, dojo.body, "last");

			});*/
			this.onStart();
		},

		onStart: function(){
			var gatewayScope = {};
			var loggingScope = {};
			loggingScope['ASSISTments_p1'] = this.p1;
            loggingScope['ASSISTments_p2'] = this.p2;
            loggingScope['ASSISTments_p3'] = this.p3;
            loggingScope['ASSISTments_p4'] = this.p4;
            loggingScope['ASSISTments_p5'] = this.p5;
            loggingScope['ASSISTments_p6'] = this.p6;
            loggingScope['ASSISTments_p7'] = this.p7;
			this.LOGGING_SERVICE = SuperGLU.Standard_ITS_Logging.StandardITSLoggingService(
								null, this.p1, this.taskId, null, this.p7, loggingScope);

			this.HEARTBEAT_SERVICE = SuperGLU.Heartbeat_Service.HeartbeatService(null, this.HEARTBEAT_NAME, 30);
			this.PARENT_POSTING_STUB = SuperGLU.Messaging_Gateway.PostMessageGatewayStub(this.PARENT_NAME, null, null, parent);
			this.GATEWAY_SERVICE = SuperGLU.Messaging_Gateway.PostMessageGateway(this.FRAME_NAME, 
								[this.LOGGING_SERVICE, this.HEARTBEAT_SERVICE, this.PARENT_POSTING_STUB], null, gatewayScope);
			this.HEARTBEAT_SERVICE.start();
			this.LOGGING_POSTING_STUB = SuperGLU.Messaging_Gateway.PostMessageGatewayStub(this.LOGGER_FRAME_NAME, this.GATEWAY_SERVICE, null, document.getElementById(this.LOGGER_FRAME_NAME).contentWindow);
			this.LOGGING_SERVICE.sendLoadedTask(this.FRAME_NAME);
		},

		onSkipHeartbeat: function(name, monitor){
			monitor.stop();
		},

		onLoadingTimeout: function(){
			if(this.IS_CHILD_LOADED !== true)
				this.HEART_MONITOR_SERVICE.stop();
		},

		stopService : function(){
			this.HeartbeatService.stop();
		},
		sendScore : function(score){
			this.LOGGING_SERVICE.serCompletedTask(score);
			HEARTBEAT_SERVICE.stop();
			this.needsToSendScore = false;
			console.log("ET service stopped");
		}
		
	});
	
});
