/** Message format for recording events and for real-time service communication
    This message format primarily follows the xAPI format (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md)
    but is much more relaxed in the requirements for parameters. It also includes elements
    of the FIPA messaging standard, most notably the Speech Act field (performative, http://www.fipa.org/specs/fipa00061/SC00061G.html)
    
    Package: SuperGLU (Generalized Learning Utilities)
    Author: Benjamin Nye
    License: APL 2.0
    Version: 1.0.0
    
    Requires:
        - zet.js 
        - serialization.js
**/
if (typeof SuperGLU === "undefined"){
    var SuperGLU = {};
    if (typeof window === "undefined") {
        var window = this;
    }
    window.SuperGLU = SuperGLU;
}

(function(namespace, undefined) {
var VERSION = "1.0.0",
    SUPERGLU_VERSION = SuperGLU.version,
    Zet = SuperGLU.Zet,
    Serialization = SuperGLU.Serialization;

var ACCEPT_PROPOSAL_ACT, AGREE_ACT, CANCEL_ACT, CALL_FOR_PROPOSAL_ACT,
    CONFIRM_ACT, DISCONFIRM_ACT, FAILURE_ACT, INFORM_ACT, INFORM_IF_ACT,
    INFORM_REF_ACT,  NOT_UNDERSTOOD_ACT, PROPAGATE_ACT, PROPOSE_ACT,
    PROXY_ACT, QUERY_IF_ACT, QUERY_REF_ACT, REFUSE_ACT, REJECT_PROPOSAL_ACT,
    REQUEST_ACT, REQUEST_WHEN_ACT, REQUEST_WHENEVER_ACT, SUBSCRIBE_ACT,
    
    ACTOR_KEY, VERB_KEY, OBJECT_KEY, RESULT_KEY, 
    SPEECH_ACT_KEY, TIMESTAMP_KEY, CONTEXT_KEY,
    CONTEXT_CONVERSATION_ID_KEY, CONTEXT_REPLY_WITH_KEY,
    CONTEXT_IN_REPLY_TO_KEY, CONTEXT_REPLY_BY_KEY,
    AUTHORIZATION_KEY, SESSION_ID_KEY, 
    CONTEXT_LANGUAGE_KEY, CONTEXT_ONTOLOGY_KEY,
    SUPERGLU_VERSION_KEY, MESSAGE_VERSION_KEY,
    SPEECH_ACT_SET, tokenizeObject, untokenizeObject;
    
// Core Speech Acts
INFORM_ACT = "Inform";                       // Asserting something
INFORM_REF_ACT = "Inform Ref";               // Assert the name of something
NOT_UNDERSTOOD_ACT = "Not Understood";       // Informing that you didn't understand an act
QUERY_REF_ACT = "Query Ref";                 // Asking the id of an object
REQUEST_ACT = "Request";                     // Requesting action (now)
REQUEST_WHEN_ACT = "Request When";           // Requesting action, conditional on X
REQUEST_WHENEVER_ACT = "Request Whenever";   // Requesting action, whenever X

// Information Speech Acts
CONFIRM_ACT = "Confirm";
DISCONFIRM_ACT = "Disconfirm";
INFORM_IF_ACT = "Inform If";
QUERY_IF_ACT = "Query If";

// Proposal Speech Acts
ACCEPT_PROPOSAL_ACT = "Accept Proposal";
CALL_FOR_PROPOSAL_ACT = "Call for Proposal";
PROPOSE_ACT = "Propose";
REJECT_PROPOSAL_ACT = "Reject Proposal";

// Action Negotiation Status
AGREE_ACT = "Agree";
CANCEL_ACT = "Cancel";
REFUSE_ACT = "Refuse";
FAILURE_ACT = "Failure";

// Relay Actions
PROPAGATE_ACT = "Propagate";
PROXY_ACT = "Proxy";
SUBSCRIBE_ACT = "Subscribe";

SPEECH_ACT_SET = {ACCEPT_PROPOSAL_ACT : true, AGREE_ACT : true, CANCEL_ACT : true, 
                  CALL_FOR_PROPOSAL_ACT : true, CONFIRM_ACT : true, DISCONFIRM_ACT : true,
                  FAILURE_ACT : true, INFORM_ACT : true, INFORM_IF_ACT : true,
                  INFORM_REF_ACT : true,  NOT_UNDERSTOOD_ACT : true, PROPAGATE_ACT : true, 
                  PROPOSE_ACT : true, PROXY_ACT : true, QUERY_IF_ACT : true, 
                  QUERY_REF_ACT : true, REFUSE_ACT : true, REJECT_PROPOSAL_ACT : true,
                  REQUEST_ACT : true, REQUEST_WHEN_ACT : true, REQUEST_WHENEVER_ACT : true, 
                  SUBSCRIBE_ACT : true};

ACTOR_KEY = "actor";
VERB_KEY = "verb";
OBJECT_KEY = "object";
RESULT_KEY = "result";
SPEECH_ACT_KEY = "speechAct";
TIMESTAMP_KEY = "timestamp";
CONTEXT_KEY = "context";

CONTEXT_CONVERSATION_ID_KEY = "conversation-id";
CONTEXT_IN_REPLY_TO_KEY = "in-reply-to";
CONTEXT_REPLY_WITH_KEY = "reply-with";
CONTEXT_REPLY_BY_KEY = "reply-by";

AUTHORIZATION_KEY = "authorization";
SESSION_ID_KEY = "session-id";
CONTEXT_LANGUAGE_KEY = 'language';
CONTEXT_ONTOLOGY_KEY = 'ontology';

SUPERGLU_VERSION_KEY = 'SuperGLU-version';
MESSAGE_VERSION_KEY = 'message-version';

tokenizeObject = Serialization.tokenizeObject;
untokenizeObject = Serialization.untokenizeObject;

/** Message format, for passing information between services
    This is serializable, and can be cast into JSON, along with
    any contained objects (including Messages) that are also serializable.
**/
Zet.declare('Message', {
    superclass : Serialization.Serializable,
    defineBody : function(self){
        // Private Properties

        // Public Properties
        
        /** Create a Message
            @param actor: The actor who did or would do the given action
            @param verb: Some action that was or would be done by the actor
            @param obj: An object or target for the action
            @param result: The outcome of the action 
            @param speechAct: A performative, stating why this message was sent
            @param context: A context object for the message, with additional data
            @param timestamp: A timestamp for when the message was created
            @param anId: A unique Id.  If none given, one will be assigned.
        **/
        self.construct = function construct(actor, verb, obj, result, speechAct, 
                                            context, timestamp, anId){
            self.inherited(construct, [anId]);
            if (typeof actor === "undefined") {actor = null;}
            if (typeof verb === "undefined") {verb = null;}
            if (typeof obj === "undefined") {obj = null;}
            if (typeof result === "undefined") {result = null;}
            if (typeof speechAct === "undefined") {speechAct = INFORM_ACT;}
            if (typeof context === "undefined") {context = {};}
            if (typeof timestamp === "undefined") {timestamp = null;}
            self._actor = actor;
            self._verb = verb;
            self._obj = obj;
            self._result = result;
            self._speechAct = speechAct;
            self._timestamp = timestamp;
            if (self._timestamp == null){
                self.updateTimestamp();
            }
            // Fill in version keys
            if (!(MESSAGE_VERSION_KEY in context)){
                context[MESSAGE_VERSION_KEY] = VERSION;
            }
            if (!(SUPERGLU_VERSION_KEY in context)){
                context[SUPERGLU_VERSION_KEY] = SUPERGLU_VERSION;
            }
            self._context = context;
		};
        
        /** Get the actor for the message **/
        self.getActor = function getActor(){
            return self._actor;
        };
        /** Set the actor for the message **/
        self.setActor = function setActor(value){
            self._actor = value;
        };
        
        /** Get the verb for the message **/
        self.getVerb = function getVerb(){
            return self._verb;
        };
        /** Set the verb for the message **/
        self.setVerb = function setVerb(value){
            self._verb = value;
        };
        
        /** Get the object for the message **/
        self.getObject = function getObject(){
            return self._obj;
        };
        /** Set the object for the message **/
        self.setObject = function setObject(value){
            self._obj = value;
        };
        
        /** Get the result for the message **/
        self.getResult = function getResult(){
            return self._result;
        };
        /** Set the result for the message **/
        self.setResult = function setResult(value){
            self._result = value;
        };
        
        /** Get the speech act for the message **/
        self.getSpeechAct = function getSpeechAct(){
            return self._speechAct;
        };
        /** Set the speech act for the message **/
        self.setSpeechAct = function setSpeechAct(value){
            self._speechAct = value;
        };
        
        /** Get the timestamp for the message (as an ISO-format string)**/
        self.getTimestamp = function getTimestamp(){
            return self._timestamp;
        };
        /** Set the timestamp for the message (as an ISO-format string) **/
        self.setTimestamp = function setTimestamp(value){
            self._timestamp = value;
        };
        /** Update the timestamp to the current time **/
        self.updateTimestamp = function updateTimestamp(){
            self._timestamp = new Date().toISOString();
        };
        
        /** Check if the context field has a given key **/
        self.hasContextValue = function hasContextValue(key){
            return (key in self._context) === true;
        };
        
        /** Get all the keys for the context object **/
        self.getContextKeys = function getContextKeys(){
            var key, keys;
            keys = [];
            for (key in self._context){
                keys.push(key);
            }
            return keys;
        };
        
        /** Get the context value with the given key. If missing, return the default. **/
        self.getContextValue = function getContextValue(key, aDefault){
            if (!(key in self._context)){
                return aDefault;
            }
            return self._context[key];
        };
        
        /** Set a context value with the given key-value pair **/
        self.setContextValue = function setContextValue(key, value){
            self._context[key] = value;
        };
        
        /** Delete the given key from the context **/
        self.delContextValue = function delContextValue(key){
            delete self._context[key];
        };
        
        /** Save the message to a storage token **/
        self.saveToToken = function saveToToken(){
            var key, token, newContext, hadKey;
            token = self.inherited(saveToToken);
            if (self._actor != null){
                token.setitem(ACTOR_KEY, tokenizeObject(self._actor));
            }
            if (self._verb != null){
                token.setitem(VERB_KEY, tokenizeObject(self._verb));
            }
            if (self._obj != null){
                token.setitem(OBJECT_KEY, tokenizeObject(self._obj));
            }
            if (self._result != null){
                token.setitem(RESULT_KEY, tokenizeObject(self._result));
            }
            if (self._speechAct != null){
                token.setitem(SPEECH_ACT_KEY, tokenizeObject(self._speechAct));
            }
            if (self._timestamp != null){
                token.setitem(TIMESTAMP_KEY, tokenizeObject(self._timestamp));
            }
            hadKey = false;
            newContext = {};
            for (key in self._context){
                hadKey = true;
                newContext[tokenizeObject(key)] = tokenizeObject(self._context[key]);
            }
            if (hadKey){
                token.setitem(CONTEXT_KEY, tokenizeObject(newContext));
            }
            return token;
        };

        /** Initialize the message from a storage token and some additional context (e.g., local objects) **/
        self.initializeFromToken = function initializeFromToken(token, context){
            self.inherited(initializeFromToken, [token, context]);
            self._actor = untokenizeObject(token.getitem(ACTOR_KEY, true, null), context);
            self._verb = untokenizeObject(token.getitem(VERB_KEY, true, null), context);
            self._obj = untokenizeObject(token.getitem(OBJECT_KEY, true, null), context);
            self._result = untokenizeObject(token.getitem(RESULT_KEY, true, null), context);
            self._speechAct = untokenizeObject(token.getitem(SPEECH_ACT_KEY, true, null), context);
            self._timestamp = untokenizeObject(token.getitem(TIMESTAMP_KEY, true, null), context);
            self._context = untokenizeObject(token.getitem(CONTEXT_KEY, true, {}), context);
        };
    }
});

namespace.version = VERSION;
namespace.Message = Message;

namespace.SPEECH_ACT_SET = SPEECH_ACT_SET;
namespace.ACCEPT_PROPOSAL_ACT = ACCEPT_PROPOSAL_ACT;
namespace.AGREE_ACT = AGREE_ACT;
namespace.CANCEL_ACT = CANCEL_ACT;
namespace.CALL_FOR_PROPOSAL_ACT = CALL_FOR_PROPOSAL_ACT;
namespace.CONFIRM_ACT = CONFIRM_ACT;
namespace.DISCONFIRM_ACT = DISCONFIRM_ACT;
namespace.FAILURE_ACT = FAILURE_ACT;
namespace.INFORM_ACT = INFORM_ACT;
namespace.INFORM_IF_ACT = INFORM_IF_ACT;
namespace.INFORM_REF_ACT = INFORM_REF_ACT;
namespace.NOT_UNDERSTOOD_ACT = NOT_UNDERSTOOD_ACT;
namespace.PROPAGATE_ACT = PROPAGATE_ACT;
namespace.PROPOSE_ACT = PROPOSE_ACT;
namespace.PROXY_ACT = PROXY_ACT;
namespace.QUERY_IF_ACT = QUERY_IF_ACT;
namespace.QUERY_REF_ACT = QUERY_REF_ACT;
namespace.REFUSE_ACT = REFUSE_ACT;
namespace.REJECT_PROPOSAL_ACT = REJECT_PROPOSAL_ACT;
namespace.REQUEST_ACT = REQUEST_ACT;
namespace.REQUEST_WHEN_ACT = REQUEST_WHEN_ACT;
namespace.REQUEST_WHENEVER_ACT = REQUEST_WHENEVER_ACT;
namespace.SUBSCRIBE_ACT = SUBSCRIBE_ACT;

namespace.ACTOR_KEY = ACTOR_KEY;
namespace.VERB_KEY = VERB_KEY;
namespace.OBJECT_KEY = OBJECT_KEY;
namespace.RESULT_KEY = RESULT_KEY;
namespace.SPEECH_ACT_KEY = SPEECH_ACT_KEY;
namespace.TIMESTAMP_KEY = TIMESTAMP_KEY;
namespace.CONTEXT_KEY = CONTEXT_KEY;

namespace.CONTEXT_CONVERSATION_ID_KEY = CONTEXT_CONVERSATION_ID_KEY;
namespace.CONTEXT_IN_REPLY_TO_KEY = CONTEXT_IN_REPLY_TO_KEY;
namespace.CONTEXT_REPLY_WITH_KEY = CONTEXT_REPLY_WITH_KEY;
namespace.CONTEXT_REPLY_BY_KEY = CONTEXT_REPLY_BY_KEY;

namespace.AUTHORIZATION_KEY = AUTHORIZATION_KEY;
namespace.SESSION_ID_KEY = SESSION_ID_KEY;
namespace.CONTEXT_LANGUAGE_KEY = CONTEXT_LANGUAGE_KEY;
namespace.CONTEXT_ONTOLOGY_KEY = CONTEXT_ONTOLOGY_KEY;

namespace.SUPERGLU_VERSION_KEY = SUPERGLU_VERSION_KEY;
namespace.MESSAGE_VERSION_KEY = MESSAGE_VERSION_KEY;

SuperGLU.Messaging = namespace;
})(window.Messaging = window.Messaging || {});
