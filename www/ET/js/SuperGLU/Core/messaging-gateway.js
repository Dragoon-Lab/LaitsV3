/** Messaging gateways and service base classes, which form
    a network of gateways for messages to propogate across.
    This module has two main types of classes:
    A. Gateways: These relay messages to their connected services (children)
                 and also to other gateways that will also relay the message.
                 Gateways exist to abstract away the network and iframe topology.
                 Gateways send messages to their parent gateway and can also distribute 
                 messages downstream to child gateways and services.
    B. Services: Services that receive messages and may (or may not) respond.
                 Services exist to process and transmit messages, while doing
                 meaningful things to parts of systems that they control. 
                 Services only send and receive message with their parent gateway.
    
    As a general rule, every service should be able to act reasonably and 
    sensibly, regardless of what messages it receives. In short, no service
    should hard fail. There may be conditions there the system as a whole may
    not be able to function, but all attempts should be made to soft-fail.
    
    Likewise, all services should be prepared to ignore any messages that it
    does not want to respond to, without any ill effects on the service (e.g.,
    silently ignore) or, alternatively, to send back a message indicating that
    the message was not understood. Typically, silently ignoring is usually best.
    
    Package: SuperGLU (Generalized Learning Utilities)
    Author: Benjamin Nye
    License: APL 2.0
    
    Requires:
        - Zet.js 
        - Serializable.js
        - Messaging.js
**/

if (typeof SuperGLU === "undefined"){
    var SuperGLU = {};
    if (typeof window === "undefined") {
        var window = this;
    }
    window.SuperGLU = SuperGLU;
}

(function(namespace, undefined) {
var Zet = SuperGLU.Zet,
    Serialization = SuperGLU.Serialization,
    Messaging = SuperGLU.Messaging;

var CATCH_BAD_MESSAGES = false,
    SESSION_ID_KEY = 'sessionId';

/** The base class for a messaging node (either a Gateway or a Service) **/
Zet.declare('BaseMessagingNode', {
    // Base class for messaging gateways
    superclass : Serialization.Serializable,
    defineBody : function(self){
        // Public Properties

        /** Initialize a messaging node.  Should have a unique ID and (optionally)
            also have one or more gateways connected.
            @param id: A unique ID for the node. If none given, a random UUID will be used.
            @type id: str
            @param gateways: Gateway objects, which this node will register with.
            @type gateways: list of MessagingGateway object
        **/
        self.construct = function construct(id, nodes){
            self.inherited(construct, [id]);
            if (nodes == null) {nodes = [];}
            self._nodes = {};
            self._requests = {};
            self._uuid = UUID.genV4();
            self.addNodes(nodes);
		};
        
        /** Receive a message. When a message is received, two things should occur:
            1. Any service-specific processing
            2. A check for callbacks that should be triggered by receiving this message
            The callback check is done here, and can be used as inherited behavior.
        **/
        self.receiveMessage = function receiveMessage(msg){
            // Processing to handle a received message
			//console.log(self._id + " received MSG: "+ self.messageToString(msg));
            self._triggerRequests(msg);
        };
        
        /** Send a message to connected nodes, which will dispatch it (if any gateways exist). **/
        self.sendMessage = function sendMessage(msg){
			//console.log(self._id + " sent MSG: "+ self.messageToString(msg));
            self._distributeMessage(self._nodes, msg);
        };
        
        /** Handle an arriving message from some source.
            Services other than gateways should generally not need to change this.
            @param msg: The message arriving
            @param senderId: The id string for the sender of this message.
        **/
        self.handleMessage = function handleMessage(msg, senderId){
            self.receiveMessage(msg);
        };
        
        /** Sends a message each of 'nodes', except excluded nodes (e.g., original sender) **/
        self._distributeMessage = function _distributeMessage(nodes, msg, excludeIds){
            var nodeId, node, condition;
            if (excludeIds == null){excludeIds = [];}
            for (nodeId in nodes){
                condition = nodes[nodeId].condition;
                node = nodes[nodeId].node;
                if ((excludeIds.indexOf(nodeId) < 0) && 
                    (condition == null || condition(msg))){
                        self._transmitMessage(node, msg, self.getId());
                }
            }
        };
        
        /** Transmit the message to another node **/
        self._transmitMessage = function _transmitMessage(node, msg, senderId){
            node.handleMessage(msg, senderId);
        };
        
        // Manage Connected Nodes
             
        /** Get all connected nodes for the gateway **/
        self.getNodes = function getNodes(){
            return Object.keys(self._nodes).map(function(key){
                return obj[key].node;
            });
        };
        
        /** Connect nodes to this node **/
        self.addNodes = function addNodes(nodes){
            var i;
            if (nodes == null) {nodes = [];}
            for (i=0; i<nodes.length; i++){
                nodes[i].onBindToNode(self);
                self.onBindToNode(nodes[i]);
            }
        };
        
        /** Remove the given connected nodes. If nodes=null, remove all. **/
        self.removeNodes = function removeNodes(nodes){
            var i;
            if (nodes == null){nodes = self.getNodes();}
            for (i=0; i<nodes.length; i++){
                nodes[i].onUnbindToNode(self);
                self.onUnbindToNode(nodes[i]);
            }
        };
        
        /** Register the node and signatures of messages that the node is interested in **/
        self.onBindToNode = function onBindToNode(node){
            if (!(node.getId() in self._nodes)){
                self._nodes[node.getId()] = {'node' : node, 
                                             'conditions' : node.getMessageConditions()};
            }
        };
        
        /** This removes this node from a connected node (if any) **/
        self.onUnbindToNode = function onUnbindToNode(node){
            if (node.getId() in self._nodes){
                delete self._nodes[node.getId()];
            }
        };
        
        /** Get a list of conditions functions that determine if a gateway should
            relay a message to this node (can be propagated across gateways to filter 
            messages from reaching unnecessary parts of the gateway network).
        **/
        self.getMessageConditions = function getMessageConditions(){
            /** Function to check if this node is interested in this message type */
            return function(){return true;};
        };
        
        /** Get the conditions for sending a message to a node **/
        self.getNodeMessageConditions = function getNodeMessageConditions(nodeId){
            if (nodeId in self._nodes){
                return self._nodes[nodeId].conditions;
            } else {
                return function(){return true;};
            }
        };
        
        /** Update the conditions for sending a message to a node **/
        self.updateNodeMessageConditions = function updateNodeMessageConditions(nodeId, conditions){
            if (nodeId in self._nodes){
                self._nodes[nodeId] = [self._nodes[nodeId].node, conditions];
            }
        };
        
        // Request Management 
        
        /** Internal function to get all pending request messages **/
        self._getRequests = function _getRequests(){
            var key, reqs;
            reqs = [];
            for (key in self._requests){
                reqs.push(self._requests[key][0]);
            }
            return reqs;
        };
        
        /** Add a request to the queue, to respond to at some point
            @param msg: The message that was sent that needs a reply.
            @param callback: A function to call when the message is received, as f(newMsg, requestMsg)
            @TODO: Add a timeout for requests, with a timeout callback (maxWait, timeoutCallback)
        **/
        self._addRequest = function _addRequest(msg, callback){
            if (callback != null){
                self._requests[msg.getId()] = [msg.clone(), callback];
            }
        };
        
        /** Make a request, which is added to the queue and then sent off to connected services
            @param msg: The message that was sent that needs a reply.
            @param callback: A function to call when the message is received, as f(newMsg, requestMsg)
        **/
        self._makeRequest = function _makeRequest(msg, callback){
            self._addRequest(msg, callback);
            self.sendMessage(msg);
            //console.log("SENT REQUEST:" + Serialization.makeSerialized(Serialization.tokenizeObject(msg)));
        };
        
        /** Trigger any requests that are waiting for a given message. A 
            request is filled when the conversation ID on the message matches
            the one for the original request. When a request is filled, it is 
            removed, unless the speech act was request whenever (e.g., always)
            @param msg: Received message to compare against requests.
        **/
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
        
        /** Convenience function to serialize a message **/
        self.messageToString = function messageToString(msg){
            return Serialization.makeSerialized(Serialization.tokenizeObject(msg));
        };
        
        /** Convenience function to turn a serialized JSON message into a message 
            If the message is invalid when unpacked, it is ignored.
        **/
        self.stringToMessage = function stringToMessage(msg){
            if (CATCH_BAD_MESSAGES){
                try {
                    msg = Serialization.untokenizeObject(Serialization.makeNative(msg));
                } catch (err) {
                    // console.log("ERROR: Could not process message data received.  Received:");
                    // console.log(msg);
                    msg = undefined;
                }
            } else {
                msg = Serialization.untokenizeObject(Serialization.makeNative(msg));
            }
            return msg;
        };
    }
});
 
/** A messaging gateway base class, for relaying messages **/     
Zet.declare('MessagingGateway', {
    // Base class for messaging gateways
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Public Properties
        
        /** Initialize a Messaging Gateway. 
            @param id: Unique ID for the gateway
            @param nodes: Connected nodes for this gateway
            @param scope: Extra context data to add to messages sent to this gateway, if those keys missing
        **/
        self.construct = function construct(id, nodes, scope){
            // Should check for cycles at some point
            if (scope == null){ scope = {}; }
            self.inherited(construct, [id, nodes]);
            self._scope = scope;
		};

        // Handle Incoming Messages
        /** Receive a message from a connected node and propogate it. **/
        self.handleMessage = function handleMessage(msg, senderId){
            self.receiveMessage(msg);
            self._distributeMessage(self._nodes, msg, [senderId]);
        };
        
        // Relay Messages
        
        /** Distribute the message, after adding some gateway context data. **/
        self._distributeMessage = function _distributeMessage(nodes, msg, excludeIds){
            msg = self.addContextDataToMsg(msg);
            self.inherited(_distributeMessage, [nodes, msg, excludeIds]);
        };
        
        /** Add the additional context data in the Gateway scope, unless those
            keys already exist in the message's context object.
        **/
        self.addContextDataToMsg = function addContextDataToMsg(msg){
            var key;
            for (key in self._scope){
                if (!(msg.hasContextValue(key))){
                    msg.setContextValue(key, self._scope[key]);
                }
            }
            return msg;
        };
    }
});

/** Messaging Gateway Node Stub for Cross-Domain Page Communication
    A stub gateway that is a placeholder for a PostMessage gateway in another frame.
    This should only be a child or parent of a PostMessageGateway, because other
    nodes will not know to send messages via HTML5 postMessage to the actual frame
    that this stub represents.
**/
Zet.declare('PostMessageGatewayStub', {
    // 
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Private Properties
        var ANY_ORIGIN = '*';
        
        // Public Properties
        
        /** Initialize a PostMessageGatewayStub 
            @param id: Unique id for the gateway
            @param gateway: The parent gateway for this stub 
            @param origin: The base URL expected for messages from this frame.
            @param element: The HTML element (e.g., frame/iframe) that the stub represents. By default parent window.
        **/
        self.construct = function construct(id, gateway, origin, element){
            var nodes = null;
            if (gateway != null){nodes = [gateway];}
            self.inherited(construct, [id, nodes]);
            if (origin == null) {origin = ANY_ORIGIN;}
            if (element == null) {element = parent;}
            if (element === window){
                element = null;
            }
            self._origin = origin;
            self._element = element;
		};
        
        /** Get the origin, which is the frame location that is expected **/
        self.getOrigin = function getOrigin(){
            return self._origin;
        };
        
        /** Get the HTML element where messages would be sent **/
        self.getElement = function getElement(){
            return self._element;
        };
    }
});
        

/** Messaging Gateway for Cross-Domain Page Communication 
    Note: This should not directly take other PostMessageGateways as nodes.
    PostMessageGatewayStub objects must be used instead. Only use ONE
    PostMessageGateway per frame.
**/
Zet.declare('PostMessageGateway', {
    superclass : MessagingGateway,
    defineBody : function(self){
        // Private Properties
        var ANY_ORIGIN = '*';
        
        // Public Properties
        
        /** Initialize a PostMessageGateway
            @param id: The unique ID for this gateway.
            @param nodes: Child nodes for the gateway
            @param origin: The origin URL for the current window
            @param scope: Additional context parameters to add to messages sent by children.
        **/
        self.construct = function construct(id, nodes, origin, scope){
            if (origin == null) {origin = ANY_ORIGIN;}
            self._origin = origin;
            // Get these ready before adding nodes in base constructor
            self._postNodes = {};
            self._validOrigins = {};
            self._anyOriginValid = true;
            // Construct
            self.inherited(construct, [id, nodes, scope]);
            self.validatePostingHierarchy();
			if (window){
				self.bindToWindow(window);
			}
		};

        /** Get the origin for this window **/
        self.getOrigin = function getOrigin(){
            return self._origin;
        };
        
        /** Get a stub that is the equivalent to this gateway **/
        self.getStub = function getStub(){
            return PostMessageGatewayStub(self._id, self._gateway, self._origin);
        };
        
        /** Validates that no additional PostMessageGateway nodes are connected 
            and in the same frame. Valid neighbors can have no PostMessageGateway nodes,
            and only the parent OR the children can be of the PostMessageGatewayStub class
        **/
        self.validatePostingHierarchy = function validatePostingHierarchy(){
            var key; 
            for (key in self._nodes){
                if (PostMessageGateway.isInstance(self._nodes[key])){
                    throw TypeError("Error: Cannot directly connect PostMessageGateways");
                }
            }
            // @TODO: Check for cycles in the posting hierarchy
        };
        
        /** Register the node and signatures of messages that the node is interested in **/
        self.onBindToNode = function onBindToNode(node){
            self.inherited(onBindToNode, [node]);
            self._onAttachNode(node);
        };
        
        /** This removes this node from a connected node (if any) **/
        self.onUnbindToNode = function onUnbindToNode(node){
            self._onDetachNode(node);
            self.inherited(onUnbindToNode, [node]);
        };
        
        /** When attaching nodes, adds any origins of PostMessageGatewayStubs
            to an allowed list of valid origins for HTML5 postMessages.
            @param node: A child node to attach.
            @type node: BaseMessagingNode
        **/
        self._onAttachNode = function _onAttachNode(node){
            // @TODO: Should check if already attached and raise error
            if (PostMessageGatewayStub.isInstance(node) && 
                (!(node.getId() in self._postNodes))){
                if (self._validOrigins[node.getOrigin()] == null){
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
        
        /** When detaching nodes, clears any origins of PostMessageGatewayStubs
            from an allowed list of valid origins for HTML5 postMessages.
            @param node: A child node to attach.
            @type node: BaseMessagingNode
        **/
        self._onDetachNode = function _onDetachNode(node){
            if (PostMessageGatewayStub.isInstance(node) && 
                (node.getId() in self._postNodes)){
                self._validOrigins[node.getOrigin()] += -1;
                if (self._validOrigins[node.getOrigin()] === 0){
                    delete self._validOrigins[node.getOrigin()];
                    if (!(ANY_ORIGIN in self._validOrigins)){
                        self._anyOriginValid = false;
                    }
                }
                delete self._postNodes[node.getId()];
            }
        };
        
        /** Bind the HTML5 event listener for HTML5 postMessage **/
        self.bindToWindow = function bindToWindow(aWindow){
            var eventMethod, eventer, messageEvent;
            eventMethod = aWindow.addEventListener ? "addEventListener" : "attachEvent";
            eventer = aWindow[eventMethod];
            messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
            eventer(messageEvent, function(event) {self._receivePostMessage(event);});
        };
        
        // Messaging
        
        /** Send a message to parent. Send as normal, but send using sendPostMessage 
            if sending to a PostMessage stub. 
        **/
        /** Transmit the message to another node **/
        self._transmitMessage = function _transmitMessage(node, msg, senderId){
            if (PostMessageGatewayStub.isInstance(node)){
               self._transmitPostMessage(node, msg, senderId);
            } else {
                node.handleMessage(msg, senderId);
            }
        };
        
        // HTML5 PostMessage Commands
        self._transmitPostMessage = function _transmitPostMessage(node, msg, senderId){
            var postMsg, element;
            postMsg = JSON.stringify({'SuperGLU' : true,
                                      'msgType' : 'SuperGLU',
                                      'version' : SuperGLU.version,
                                      'senderId' : senderId,
                                      'targetId' : node.getId(),
                                      'msg' : self.messageToString(msg)});
            element = node.getElement();
            if (element != null){
                // console.log(JSON.parse(postMsg).senderId + " POSTED UP " + self.messageToString(msg));
                element.postMessage(postMsg, node.getOrigin());
            }
        };
        
        self._receivePostMessage = function _receivePostMessage(event){
            var senderId, message, targetId;
			//console.log(self._id + " RECEIVED POST " + JSON.parse(event.data));
            if (self.isValidOrigin(event.origin)){
                try{
                    message = JSON.parse(event.data);
                } catch (err){
                    // console.log("Post Message Gateway did not understand: " + event.data);
                    return;
                }
                senderId = message.senderId;
                targetId = message.targetId;
                message = self.stringToMessage(message.msg);
                console.log(message);
                if (Messaging.Message.isInstance(message) && 
                    (targetId === self.getId()) &&
                    (senderId in self._postNodes)){
                    self.handleMessage(message, senderId);
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
            self.inherited(construct, [id, nodes, scope]);      // Classifier not used here, as messages are exact responses.
            if (url == null) {url = null;}
			if (sessionId == null) {sessionId = UUID.genV4().toString();}
            self._url = url;
			self._socket = io.connect(self._url + MESSAGING_NAMESPACE);
			self._isConnected = false;
			self._sessionId = sessionId;
			self._socket.on('message', self.receiveWebsocketMessage);
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
        
        /** Distribute the message, after adding some gateway context data. **/
        self._distributeMessage = function _distributeMessage(nodes, msg, excludeIds, noSocket){
            msg = self.addContextDataToMsg(msg);
            if (noSocket !== true && self._url != null){
                msg = self.addSessionData(msg);
                self.sendWebsocketMessage(msg);
            }
            self.inherited(_distributeMessage, [nodes, msg, excludeIds]);
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
			if (Messaging.Message.isInstance(msg) && 
                (sessionId == null || sessionId == self._sessionId)){
				self._distributeMessage(self._nodes, msg, [], true);
            }
        };
    }
});      
    

Zet.declare('BaseService', {
    // Base class for messaging gateways
    superclass : BaseMessagingNode,
    defineBody : function(self){
        // Public Properties
        
        self.construct = function construct(id, gateway){
            var nodes = null;
            if (gateway != null){nodes = [gateway];}
            self.inherited(construct, [id, nodes]);
		};
        
        /** Connect nodes to this node. 
            Only one node (a gateway) should be connected to a service.
        **/
        self.addNodes = function addNodes(nodes){
            if (nodes.length + self.getNodes().length <= 1){
                self.inherited(addNodes, [nodes]);
            } else {
                console.log("Error: Attempted to add more than one node to a service. Service must only take a single gateway node. Service was: " + self.getId());
            }
        };
        
        /** Bind nodes to this node. 
            Only one node (a gateway) should be connected to a service.
        **/
        self.onBindToNode = function onBindToNode(node){
            if (self.getNodes().length === 0){
                self.inherited(onBindToNode, [node]);
            } else {
                console.log("Error: Attempted to bind more than one node to a service. Service must only take a single gateway node.");
            }
        };
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
                msg = self._gateway.addContextDataToMsg(msg);
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
                msg = self._gateway.addContextDataToMsg(msg);
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

SuperGLU.Messaging_Gateway = namespace;
})(window.Messaging_Gateway = window.Messaging_Gateway || {});
