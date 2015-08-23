// Requires Util\Zet, SKO_Architecture\Messaging
if (typeof window === "undefined") {
    var window = this;
}

(function(namespace, undefined) {

var CATCH_BAD_MESSAGES = false,
    SESSION_ID_KEY = 'sessionId';

Zet.declare('BaseMessagingNode', {
    // Base class for messaging gateways
    superclass : Serialization.Serializable,
    defineBody : function(self){
        // Public Properties

        self.construct = function construct(id, gateway){
            self.inherited(construct, [id]);
            if (gateway == null) {gateway = null;}
            self._gateway = null;
            if (gateway != null){
                self.bindToGateway(gateway);
            }
            self._requests = {};
		};
        
        self.sendMessage = function sendMessage(msg){
			//console.log(self._id + " sent MSG: "+ self.messageToString(msg));
            if (self._gateway != null){
                //console.log("SEND MSG (" + self.getId() + "):" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
                self._gateway.dispatchMessage(msg, self.getId());
            }
        };
        
        self.receiveMessage = function receiveMessage(msg){
            // Processing to handle a received message
			//console.log(self._id + " received MSG: "+ self.messageToString(msg));
            self._triggerRequests(msg);
        };
        
        self.bindToGateway = function bindToGateway(gateway){
            self.unbindToGateway();
            self._gateway = gateway;
            self._gateway.register(self);
        };
        
        self.unbindToGateway = function unbindToGateway(){
            if (self._gateway != null){
                self._gateway.unregister(self);
            }
        };
        
        self.getMessageConditions = function getMessageConditions(){
            /** Function to check if this node is interested in this message type */
            return function(){return true;};
        };
        
        // Request Management 
        self._getRequests = function _getRequests(){
            var key, reqs;
            reqs = [];
            for (key in self._requests){
                reqs.push(self._requests[key][0]);
            }
        };
        
        // @TODO: Add a timeout for requests, with a timeout callback (maxWait, timeoutCallback)
        self._addRequest = function _addRequest(msg, callback){
            if (callback != null){
                self._requests[msg.getId()] = [msg.clone(), callback];
            }
        };
        
        self._makeRequest = function _makeRequest(msg, callback){
            self._addRequest(msg, callback);
            self.sendMessage(msg);
            //console.log("SENT REQUEST:" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
        };
        
        self._triggerRequests = function _triggerRequests(msg){
            var key, convoId, oldMsg, callback;
            //console.log("Heard REPLY:" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
            convoId = msg.getContextValue(Messaging.CONTEXT_CONVERSATION_ID_KEY, null);
            //console.log("CONVO ID: " + convoId);
            //console.log(self._requests);
            if (convoId != null){
                // @TODO: This is a dict, so can check directly?
                for (key in self._requests){
                    if (key === convoId){
                        oldMsg = self._requests[key][0];
                        callback = self._requests[key][1];
                        callback(msg, oldMsg);
                        // Remove from the requests, unless asked for a permanent feed
                        if (oldMsg.getSpeechAct() !== Messaging.REQUEST_WHENEVER_ACT){
                            delete self._requests[key];
                        }
                    }
                }
            }
        };
		
		// Pack/Unpack Messages
        self.messageToString = function messageToString(msg){
            return Serialization.makeSerialized(Serialization.tokenizeObject(msg));
        };
        
        self.stringToMessage = function stringToMessage(msg){
            if (CATCH_BAD_MESSAGES){
                try {
                    msg = Serialization.untokenizeObject(Serialization.makeNative(msg));
                } catch (err) {
                    console.log("ERROR: Could not process message data received.  Received:");
                    console.log(msg);
                    msg = undefined;
                }
            } else {
                msg = Serialization.untokenizeObject(Serialization.makeNative(msg));
            }
            return msg;
        };
    }
});
 
        
Zet.declare('MessagingGateway', {
    // Base class for messaging gateways
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Public Properties
        
        self.construct = function construct(id, nodes, gateway, scope){
            // Should check to make sure parent gateway is not a child node also
            if (scope == null){ scope = {}; }
            self.inherited(construct, [id, gateway]);
            self._nodes = {};
            self._scope = scope;
            self.addNodes(nodes);
		};
           
        // Receive Messages
        self.receiveMessage = function receiveMessage(msg){
            /** When gateway receives a message, it distributes it to child nodes **/
            //console.log(" RECIEVE MSG (" + self.getId() + "):" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
			self.inherited(receiveMessage, [msg]);
            self.distributeMessage(msg, null);
        };
        
        // Relay Messages
        self.dispatchMessage = function dispatchMessage(msg, senderId){
            /** Send a message from a child node to parent and sibling nodes **/
            //console.log(" DISPATCH MSG (" + self.getId() + "):" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
            self.addContextDataToMsg(msg);
            self.sendMessage(msg);
            self._distributeMessage(self._nodes, msg, senderId);
        };
        
        self.distributeMessage = function distributeMessage(msg, senderId){
            /** Pass a message down all interested children (except sender) **/
            self._distributeMessage(self._nodes, msg, senderId);
        };
        
        self._distributeMessage = function _distributeMessage(nodes, msg, senderId){
            var nodeId, node, condition;
            for(nodeId in nodes){
                condition = nodes[nodeId][0];
                node = nodes[nodeId][1];
                if (nodeId !== senderId && (condition == null || condition(msg))){
                    node.receiveMessage(msg);
                }
            }
        };

        // Manage Child Nodes
        self.addNodes = function addNodes(nodes){
            var i;
            if (nodes == null) {nodes = [];}
            for (i=0; i<nodes.length; i++){
                //debugger;
                nodes[i].bindToGateway(self);
            }
        };
        
        self.getNodes = function getNodes(){
            return Object.keys(self._nodes).map(function(key){
                return obj[key][1];
            });
        };
        
        self.register = function register(node){
            /** Register the signatures of messages self the node is interested in **/
            self._nodes[node.getId()] = [node.getMessageConditions(), node];
        };
        
        self.unregister = function unregister(node){
            /** Take actions to remove the node from the list **/
            if (node.getId() in self._nodes){
                delete self._nodes[node.getId()];
            }
        };
        
        self.addContextDataToMsg = function addContextDataToMsg(msg){
            var key;
            for (key in Object.keys(self._scope)){
                if (!(msg.hasContextValue(key))){
                    msg.setContextValue(key, self._scope[key]);
                }
            }
        };
    }
});


Zet.declare('PostMessageGatewayStub', {
    // Messaging Gateway Node Stub for Cross-Domain Page Communication
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Private Properties
        var ANY_ORIGIN = '*';
        
        // Public Properties
        
        self.construct = function construct(id, gateway, origin, element){
            self.inherited(construct, [id, gateway]);
            if (origin == null) {origin = ANY_ORIGIN;}
            if (element == null) {element = parent;}
            if (element === window){
                element = null;
            }
            self._origin = origin;
            self._element = element;
		};
        
        self.getOrigin = function getOrigin(){
            return self._origin;
        };
        
        self.getElement = function getElement(){
            return self._element;
        };
		
		self.register = function register(node){
            /** Register the signatures of messages that the node is interested in **/
        };
        
        self.unregister = function unregister(node){
            /** Take actions to remove the node from the list **/
        };
    }
});
        
        
Zet.declare('PostMessageGateway', {
    /** Messaging Gateway for Cross-Domain Page Communication 
        Note: This should not directly take other PostMessageGateways as nodes.
        PostMessageGatewayStub objects must be used instead.
    **/
    superclass : MessagingGateway,
    defineBody : function(self){
        // Private Properties
        var ANY_ORIGIN = '*';
        
        // Public Properties
        
        self.construct = function construct(id, nodes, gateway, origin, scope){
			/**
			@param origin: The origin for this PostMessage window. 
			**/
            if (origin == null) {origin = ANY_ORIGIN;}
            self._origin = origin;
            // Get these ready before adding nodes in base constructor
            self._postNodes = {};
            self._validOrigins = {};
            self._anyOriginValid = true;
            // Construct
            self.inherited(construct, [id, nodes, gateway, scope]);
            self.validatePostingHierarchy();
			if (window){
				self.bindToWindow(window);
			}
		};

        self.getOrigin = function getOrigin(){
            return self._origin;
        };
        
        self.getStub = function getStub(){
            return PostMessageGatewayStub(self._id, self._gateway, self._origin);
        };
        
        self.validatePostingHierarchy = function validatePostingHierarchy(){
            /** Check that the posting hierarchy is valid.
                Valid neighbors can have no PostMessageGateway nodes,
                and only the parent OR the children can be of the
                PostMessageGatewayStub class
            **/
            var isGatewayPost, key; 
            if (PostMessageGateway.isInstance(self._gateway)){
                throw TypeError("Error: Cannot directly connect PostMessageGateways");
            }
            isGatewayPost = PostMessageGatewayStub.isInstance(self._gateway);
            for (key in self._nodes){
                if (PostMessageGateway.isInstance(self._nodes[key])){
                    throw TypeError("Error: Cannot directly connect PostMessageGateways");
                }
                if (isGatewayPost && PostMessageGatewayStub.isInstance(self._nodes[key])){
                    throw TypeError("Error: Both gateway and child nodes for PostMessageGateway were PostMessageGatewayStubs.");
                }
            }
        };
        
        self.bindToGateway = function bindToGateway(gateway){
            self.inherited(bindToGateway, [gateway]);
            self._onAttachNode(gateway);
        };
        
        self.unbindToGateway = function unbindToGateway(){
            self._onDetachNode(self._gateway);
            self.inherited(unbindToGateway);
        };
        
        self._onAttachNode = function _onAttachNode(node){
            // Should check if already attached and raise error
            if (PostMessageGatewayStub.isInstance(node)){
                if (self._validOrigins[node.getOrigin()] != null){
                    self._validOrigins[node.getOrigin()] = 1;
                } else {
                    self._validOrigins[node.getOrigin()] += 1;
                }
                if (node.getOrigin() === ANY_ORIGIN){
                    self._anyOriginValid = true;
                }
                self._postNodes[node.getId()] = node;
            }
        };
        
        self._onDetachNode = function _onDetachNode(node){
            if (PostMessageGatewayStub.isInstance(node)){
                self._validOrigins[node.getOrigin()] += -1;

                if (self._validOrigins[node.getOrigin()] === 0){
                    delete self._validOrigins[node.getOrigin()];
                    if (node.getOrigin() === ANY_ORIGIN){
                        self._anyOriginValid = false;
                    }
                }
                delete self._postNodes[node.getId()];
            }
        };
        
        self.register = function register(node){
            /** Register the signatures of messages self the node is interested in **/
            self.inherited(register, [node]);
            self._onAttachNode(node);
            self.validatePostingHierarchy();
        };
        
        self.unregister = function unregister(node){
            /** Take actions to remove the node from the list **/
            if ((node.getId()) in self._nodes){
                delete self._nodes[node.getId()];
                self._onDetachNode(node);
            }
        };
        
        self.bindToWindow = function bindToWindow(aWindow){
            var eventMethod, eventer, messageEvent;
            eventMethod = aWindow.addEventListener ? "addEventListener" : "attachEvent";
            eventer = aWindow[eventMethod];
            messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
            eventer(messageEvent, function(event) {self.receivePostMessage(event);});
        };
        
        // Messaging
        self.sendMessage = function sendMessage(msg){
            if (self._gateway != null){
                if (PostMessageGatewayStub.isInstance(self._gateway)){
                    self.sendPostMessage(msg);
                } else {
                    self._gateway.dispatchMessage(msg, self.getId());
                }
            }
        };
        
        self._distributeMessage = function _distributeMessage(nodes, msg, senderId){
            /** Pass a message to all interested children (except sender) **/
            var nodeId, node, condition;
            for(nodeId in nodes){
                condition = nodes[nodeId][0];
                node = nodes[nodeId][1];
                if (nodeId !== senderId && (condition == null || condition(msg))){
                     if (PostMessageGatewayStub.isInstance(node)){
                        self.distributePostMessage(msg, node);
                     } else {
                        node.receiveMessage(msg);
                    }
                }
            }
        };
        
        // HTML5 PostMessage Commands
        self.sendPostMessage = function sendPostMessage(msg){
            var postMsg, element;
            postMsg = JSON.stringify({'senderId' : self.getId(), 'msg' : self.messageToString(msg)});
			//console.log(self._id + " POSTED UP " + self.messageToString(msg));
            element = self._gateway.getElement();
            if (element != null){
                element.postMessage(postMsg, self._gateway.getOrigin());
            }
        };
        
        self.distributePostMessage = function distributePostMessage(msg, node){
			//console.log(self._id + " DISTRIBUTED POST " + self.messageToString(msg));
            var element = node.getElement();
            if (element != null){
                element.postMessage(JSON.stringify({'msg' : self.messageToString(msg)}), node.getOrigin());
            }
        };
        
        self.receivePostMessage = function receivePostMessage(event){
            var senderId, message;
			//console.log(self._id + " RECEIVED POST " + JSON.parse(event.data));
            if (self.isValidOrigin(event.origin)){
                try{
                    message = JSON.parse(event.data);
                } catch (err){
                    console.log("Post Message Gateway did not understand: " + event.data);
                    return;
                }
                if (typeof message.senderId === "undefined"){
                    // Handle as a message from a parent gateway
                    message = self.stringToMessage(message.msg);
                    if (Messaging.Message.isInstance(message)){
                        self.distributeMessage(message, null);
                    }
                } else {
                    // Handle as a message from a child node
                    senderId = message.senderId;
                    message = self.stringToMessage(message.msg);
                    if (Messaging.Message.isInstance(message)){
                        self.dispatchMessage(message, senderId);
                    }
                }
            }
        };
        
        self.isValidOrigin = function isValidOrigin(url){
            if (self._anyOriginValid){
                return true;
            } else {
                return url in self._validOrigins;
            }
        };
    }
});
      
      
Zet.declare('HTTPMessagingGateway', {
    // Base class for messaging gateways
	// This uses socket.io.js and uuid.js
    superclass : MessagingGateway,
    defineBody : function(self){
        // Public Properties
        // Events: connecting, connect, disconnect, connect_failed, error, 
        //         message, anything, reconnecting, reconnect, reconnect_failed
        // Listed At: github.com/LearnBoost/socket.io/wiki/Exposed-events
		var MESSAGING_NAMESPACE = '/messaging',
            TRANSPORT_SET = ['websocket',
                             'flashsocket',
                             'htmlfile',
                             'xhr-polling',
                             'jsonp-polling'];
        // Set Socket.IO Allowed Transports
       
        
        self.construct = function construct(id, nodes, url, sessionId, scope){
            self.inherited(construct, [id, nodes, null, scope]);      // Classifier not used here, as messages are exact responses.
            if (url == null) {url = null;}
			if (sessionId == null) {sessionId = UUID.genV4().toString();}
            self._url = url;
			self._socket = io.connect(self._url + MESSAGING_NAMESPACE);
			self._isConnected = false;
			self._sessionId = sessionId;
			self._socket.on('message', self.receiveWebsocketMessage);
		};
        
        self.bindToGateway = function bindToGateway(gateway){
            throw new Error("Cannot bind a HTTPMessagingGateway to a parent gateway.  It is a stub for the server gateway.");
        };
        
        self.bindToConnectEvent = function bindToConnectEvent(funct){
            self._socket.on('connect', funct);
        };
        
        self.bindToCloseEvent = function bindToCloseEvent(funct){
            self._socket.on('disconnect', funct);
        };
        
        self.addSessionData = function addSessionData(msg){
            msg.setContextValue(SESSION_ID_KEY, self._sessionId);
            return msg;
        };
        
        self.sendMessage = function sendMessage(msg){
            if (self._url != null){
                msg = self.addSessionData(msg);
                self.sendWebsocketMessage(msg);
            }
        };
        
        self.sendWebsocketMessage = function sendWebsocketMessage(msg){
            msg = self.messageToString(msg);
            self._socket.emit('message', {data: msg, sessionId : self._sessionId});
        };
        
		self.receiveWebsocketMessage = function receiveWebsocketMessage(msg){
			var sessionId;
			sessionId = msg.sessionId;
			msg = msg.data;
            msg = self.stringToMessage(msg);
            // console.log("GOT THIS:" + sessionId);
            // console.log("Real Sess: " + self._sessionId);
			if (Messaging.Message.isInstance(msg) && (sessionId == null || sessionId == self._sessionId)){
				self.distributeMessage(msg);
            }
        };
    }
});      
    

Zet.declare('BaseService', {
    // Base class for messaging gateways
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Public Properties
    }
});

Zet.declare('TestService', {
    // Base class for messaging gateways
    superclass : BaseService,
    defineBody : function(self){
        // Public Properties
		self.receiveMessage = function receiveMessage(msg){
			console.log("TEST SERVICE " + self.getId() + " GOT: \n" + self.messageToString(msg));
            self.inherited(receiveMessage, [msg]);
        };
		
		self.sendTestString = function sendTestString(aStr){
			console.log("Test Service is Sending: " + aStr);
            self.sendMessage(Messaging.Message("TestService", "Sent Test", "To Server", aStr));
        };
		
		self.sendTestMessage = function sendTestMessage(actor, verb, object, result, speechAct, context, addGatewayContext){
            var msg;
            if (context == null){context={};}
            if (addGatewayContext == null){ addGatewayContext = true;}
            msg = Messaging.Message(actor, verb, object, result, speechAct, context);
            console.log(msg);
            if ((self._gateway != null) && (addGatewayContext)){
                self._gateway.addContextDataToMsg(msg);
            }
			self.sendMessage(msg);
		};
        
        self.sendTestRequest = function sendTestRequest(callback, actor, verb, object, result, speechAct, context, addGatewayContext){
            var msg;
            if (context == null){context={};}
            if (addGatewayContext == null){ addGatewayContext = true;}
            msg = Messaging.Message(actor, verb, object, result, speechAct, context);
            console.log(msg);
            if ((self._gateway != null) && (addGatewayContext)){
                self._gateway.addContextDataToMsg(msg);
            }
            self._makeRequest(msg, callback);
        };
	}
});

namespace.SESSION_ID_KEY = SESSION_ID_KEY;
namespace.BaseService = BaseService;
namespace.MessagingGateway = MessagingGateway;
namespace.PostMessageGatewayStub = PostMessageGatewayStub;
namespace.PostMessageGateway = PostMessageGateway;
namespace.HTTPMessagingGateway = HTTPMessagingGateway;
namespace.TestService = TestService;

})(window.Messaging_Gateway = window.Messaging_Gateway || {});
