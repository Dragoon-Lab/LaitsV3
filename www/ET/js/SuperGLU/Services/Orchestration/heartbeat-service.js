/** Services for determining if another service or gateway
    is functional (e.g., loaded properly, heartbeat functional)
    
    Package: SuperGLU (Generalized Learning Utilities)
    Author: Benjamin Nye
    License: APL 2.0
    
    Requires:
        - Util\zet.js 
        - Util\serializable.js
        - Core\messaging.js
        - Core\messaging-gateway.js
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
    Messaging = SuperGLU.Messaging,
    Messaging_Gateway = SuperGLU.Messaging_Gateway;

// Verbs and Context Keys
var HEARTBEAT_VERB = 'Heartbeat',
    ORIGIN_KEY = 'Origin';

/** Heartbeat service, which generates a regular message that
    is sent at some interval.
**/
Zet.declare('HeartbeatService', {
    superclass : Messaging_Gateway.BaseService,
    defineBody : function(self){
		// Public Properties
        var DEFAULT_HB = 'DefaultHeartbeat',
            DEFAULT_DELAY = 60;
        
        /** Initialize the heartbeat service 
            @param gateway: The parent gateway for this service
            @param heartbeatName: The name for the heartbeat
            @param delay: The interval for sending the heartbeat, in seconds.
            @param id: The UUID for this service
        **/
        self.construct = function construct(gateway, heartbeatName, delay, id){
            self.inherited(construct, [id, gateway]);
            if (heartbeatName == null) {heartbeatName = DEFAULT_HB;}
            if (delay == null) {delay = DEFAULT_DELAY;}
            self._heartbeatName = heartbeatName;
            self._delay = delay;
            self._isActive = false;
		};
        
        /** Send the heartbeat message **/
        self.sendHeartbeat = function sendHeartbeat(){
            var msg = Message(self.getId(), HEARTBEAT_VERB, self._heartbeatName, 
                              window.location.href);
            msg.setContextValue(ORIGIN_KEY, window.location.href);
            self.sendMessage(msg);
        };
        
        /** Start this service heartbeat, with a given delay.
            If already started, does nothing.
            @param delay: The interval for the heartbeat. If none 
                          given, uses the service default.
        **/
        self.start = function start(delay){
            if (delay != null){
                self._delay = delay;
            }
            var heartbeatFunct = function(){
                if (self._isActive){
                    self.sendHeartbeat();
                    setTimeout(heartbeatFunct, self._delay*1000);
                }
            };
            if (self._isActive !== true){
                self._isActive = true;
                heartbeatFunct();
            }
        };
        
        /** Change the rate of this heartbeat generated.
            @param delay: The interval for the heartbeat, in seconds.
        **/
        self.changeHeartrate = function changeHeartrate(delay){
            if (delay == null){ delay = DEFAULT_DELAY; }
            self._delay = delay;
        };
        
        /** Stop the heartbeat. **/
        self.stop = function stop(){
            self._isActive = false;
        };
    }
});

/** Heartbeat monitor service, which monitors one or more heartbeat messages. 
    This service determines that a beat is skipped if ANY heartbeat is missed.
    Each heartbeat has a value that stores the last time that any message matched
    that monitor. This value is updated every time a message is received, with the 
    time that the message was received.  If the monitor checks any monitor and its
    last message is too old, a function is called.
**/
Zet.declare('HeartbeatMonitor', {
    superclass : Messaging_Gateway.BaseService,
    defineBody : function(self){
        var DEFAULT_DELAY = 150;
        
        /** Initialize the heartbeat monitor service 
            @param gateway: The parent gateway for this service
            @param heartbeatNames: The names of each heartbeat being monitored
            @param delay: The delay allowed for each heartbeat to arrive.
            @param onSkipbeat: Function called if a beat is skipped, in form f(heartbeatName, self)
            @param offOnSkip: If true, turns off if beat skipped. 
                              Else, calls onSkipbeat repeatedly.
            @param id: The uuid for this service.
        **/
		self.construct = function construct(gateway, heartbeatNames, delay, 
                                            onSkipbeat, offOnSkip, id){
            self.inherited(construct, [id, gateway]);
            if (heartbeatNames == null) {heartbeatNames = [];}
            if (delay == null) {delay = DEFAULT_DELAY;}
            if (offOnSkip == null) {offOnSkip = false;}
            self._heartbeatNames = heartbeatNames;
            self._delay = delay;
            self._onSkipbeat = onSkipbeat;
            self._offOnSkip = offOnSkip;
            self._isActive = false;
            self._heartbeatTimes = {};
            self.resetHeartbeatTimes();
		};
        
        /** Receive messages. Only looks for messages with a heartbeat verb. 
            If heartbeat message hits, this updates the time for that heartbeat
            (stated as the 'object' message component).
        **/
        self.receiveMessage = function receiveMessage(msg){
            self.inherited(receiveMessage, [msg]);
            if (msg.getVerb() === HEARTBEAT_VERB){
                if (self._heartbeatNames.indexOf(msg.getObject()) >= 0){
                    self._heartbeatTimes[msg.getObject()] = new Date().getTime();
                }
            }
        };
        
        /** Start the heartbeat monitor, which resets all heartbeat monitors
            and starts the cycle that checks for any expired heartbeats.
            @param delay: The delay between when to check heartbeat monitors, in seconds.
        **/
        self.start = function start(delay){
            if (delay != null){
                self._delay = delay;
            }
            var monitorFunct = function(){
                if (self._isActive){
                    self.checkMonitors();
                    setTimeout(monitorFunct, self._delay*1000);
                }
            };
            self.resetHeartbeatTimes();
            if (self._isActive !== true){
                self._isActive = true;
                monitorFunct();
            }
        };
        
        /** Check all monitors to see if any have expired.
            If any have expired, run the onSkipbeat function.
        **/
        self.checkMonitors = function checkMonitors(){
            var key, time;
            var currentTime = new Date().getTime();
            for (key in self._heartbeatNames){
                key = self._heartbeatNames[key];
                time = self._heartbeatTimes[key];
                if (currentTime - time > self._delay*1000){
                    if (self._onSkipbeat){
                        self._onSkipbeat(key, self);
                        if (self._offOnSkip){
                            self.stop();
                        }
                    }
                }
            }
        };
        
        /** Reset the heartbeat monitor times, by setting them each to
            the current time, and clearing out any values not in the list 
            of monitored heartbeat names.
        **/
        self.resetHeartbeatTimes = function resetHeartbeatTimes(){
            var key;
            self._heartbeatTimes = {};
            for (key in self._heartbeatNames){
                key = self._heartbeatNames[key];
                self._heartbeatTimes[key] = new Date().getTime();
            }
        };
        
        /** Stop monitoring the heartbeats. **/
        self.stop = function stop(){
            self._isActive = false;
        };
    }
});

namespace.HEARTBEAT_VERB = HEARTBEAT_VERB;
namespace.HeartbeatService = HeartbeatService;
namespace.HeartbeatMonitor = HeartbeatMonitor;

SuperGLU.Heartbeat_Service = namespace;
})(window.Heartbeat_Service = window.Heartbeat_Service || {});