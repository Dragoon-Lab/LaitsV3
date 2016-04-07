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

		constructor: function(/* object */ query){
			//parameters from ParentPage.html
			this.LOGGING_SERVICE;                    // Test service to send messages to the parent about an activity
			this.GATEWAY_SERVICE;                    // Gateway service for relaying messages in this frame
			this.PARENT_POSTING_STUB;                // Stub that represents the parent frame's messaging gateway
			this.LOGGING_POSTING_STUB;              // Stub for the logging and recommender service
			this.HEARTBEAT_SERVICE;                  // Heartbeat service, to generate a steady heartbeat
			this.FRAME_NAME = "ActivityFrame";       // A name to call this frame, for reporting purposes and postMessage
			this.PARENT_NAME = "MainPostingGateway"; // A name to call the parent frame, for reporting purposes and postMessage
			this.LOGGER_FRAME_NAME = "RecommenderLoggingGateway"; // Logging window name
			this.LOADED_VERB = "Loaded";           // A Message verb for the "Loaded" message, which indicates that the activity loaded right
			this.HEARTBEAT_NAME = "ChildHeartbeat";  // A Message verb for the heartbeat this frame looks for
			this.COMPLETED_VERB = "Completed";

			this.DEFAULT_FRAME_NAME = "ActivityFrame";
			this.DEFAULT_PARENT_NAME = "MainPostingGateway";

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
			var loggerIframe = domConstruct.create("iframe", {
				"id":"RecommenderLoggingGateway",
				name: "RecommenderLoggingGateway",
				src: sourceURL,
				style: "visibility: none; height:0; width:0"
			},"ETContainer");

			this.onStart();
		},

		onStart: function(){
			debugger;
			var gatewayScope = {},
				loggingScope = {},
				taskId = removeURLParams(null, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
			gatewayScope[ReferenceData.REFERENCE_IMPLEMENTATION_VERSION_KEY] = ReferenceData.version;
			gatewayScope[ReferenceData.USER_AGENT_KEY] = navigator.userAgent;
			loggingScope['ASSISTments_p1'] = getParameterByName('p1');
			loggingScope['ASSISTments_p2'] = getParameterByName('p2');
			loggingScope['ASSISTments_p3'] = getParameterByName('p3');
			loggingScope['ASSISTments_p4'] = getParameterByName('p4');
			loggingScope['ASSISTments_p5'] = getParameterByName('p5');
			loggingScope['ASSISTments_p6'] = getParameterByName('p6');
			loggingScope['ASSISTments_p7'] = getParameterByName('p7');
			this.LOGGING_SERVICE = SuperGLU.Standard_ITS_Logging.StandardITSLoggingService(null,
				getParameterByName('p1'), taskId, null, getParameterByName('p7'), loggingScope);
			this.HEARTBEAT_SERVICE = SuperGLU.Heartbeat_Service.HeartbeatService(null, this.HEARTBEAT_NAME, 30);
			this.PARENT_POSTING_STUB = SuperGLU.Messaging_Gateway.PostMessageGatewayStub(this.PARENT_NAME, null, null, parent);

			/** Create a gateway as: GatewayId, Child Nodes (Gateways/Services/Stubs), Parent Gateway, Scope added to each message**/
			this.GATEWAY_SERVICE = SuperGLU.Messaging_Gateway.PostMessageGateway(this.FRAME_NAME,
				[this.LOGGING_SERVICE, this.HEARTBEAT_SERVICE, this.PARENT_POSTING_STUB],
				null, gatewayScope);
			this.HEARTBEAT_SERVICE.start();


			console.log(document.getElementById(this.LOGGER_FRAME_NAME));
			this.LOGGING_POSTING_STUB = SuperGLU.Messaging_Gateway.PostMessageGatewayStub(this.LOGGER_FRAME_NAME,
				this.GATEWAY_SERVICE, null, document.getElementById(this.LOGGER_FRAME_NAME).contentWindow);
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
			this.HEARTBEAT_SERVICE.stop();
		},
		sendScore : function(score){
			this.LOGGING_SERVICE.sendCompletedTask(score);
			this.HEARTBEAT_SERVICE.stop();
			console.log("ET service stopped");
		},

		sendKCScore: function(){
			console.log("Sending KC Score");
			this.LOGGING_SERVICE.sendKCScore(kcName, score, relevenve);
		},

		sendHint: function(){
			console.log("Sending Hint");
			this.LOGGING_SERVICE.sendHint(content, stepId, helpType, contentType);
		},

		sendFeedback: function(){
			console.log("Sending Feedback");
			this.LOGGING_SERVICE.sendFeedback(content, stepId, helpType, contentType);
		},

		sendSubmittedAnswer : function(){
			console.log("Sending submitted answer");
			this.LOGGING_SERVICE.sendSubmittedAnswer(elementId, content, stepId, contentType);
		}
	});
	
});
