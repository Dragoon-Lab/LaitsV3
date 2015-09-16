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
