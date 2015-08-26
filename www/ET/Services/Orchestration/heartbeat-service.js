// Requires Util\Zet, Core\Messaging, jQuery
if (typeof window === "undefined") {
    var window = this;
}

(function(namespace, undefined) {

var HEARTBEAT_VERB = 'Heartbeat',
    ORIGIN_KEY = 'Origin';

Zet.declare('HeartbeatService', {
    // JS client interface for the storage service
    superclass : Messaging_Gateway.BaseService,
    defineBody : function(self){
		// Public Properties
        var DEFAULT_HB = 'DefaultHeartbeat',
            DEFAULT_DELAY = 60;
        
        self.construct = function construct(gateway, heartbeatName, delay, id){
            self.inherited(construct, [id, gateway]);
            if (heartbeatName == null) {heartbeatName = DEFAULT_HB;}
            if (delay == null) {delay = DEFAULT_DELAY;}
            self._heartbeatName = heartbeatName;
            self._delay = delay;
            self._isActive = false;
		};
        
        self.sendHeartbeat = function sendHeartbeat(){
            var msg = Message(self.getId(), HEARTBEAT_VERB, self._heartbeatName, 
                              window.location.href);
            msg.setContextValue(ORIGIN_KEY, window.location.href);
            self.sendMessage(msg);
        };
        
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
        
        self.changeHeartrate = function changeHeartrate(delay){
            if (delay == null){ delay = DEFAULT_DELAY; }
            self._delay = delay;
        };
        
        self.stop = function stop(){
            self._isActive = false;
        };
    }
});

Zet.declare('HeartbeatMonitor', {
    // JS client interface for the storage service
    superclass : Messaging_Gateway.BaseService,
    defineBody : function(self){
        var DEFAULT_DELAY = 150;
        
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
        
        self.receiveMessage = function receiveMessage(msg){
            self.inherited(receiveMessage, [msg]);
            if (msg.getVerb() === HEARTBEAT_VERB){
                if (self._heartbeatNames.indexOf(msg.getObject()) >= 0){
                    self._heartbeatTimes[msg.getObject()] = new Date().getTime();
                }
            }
        };
        
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
        
        self.resetHeartbeatTimes = function resetHeartbeatTimes(){
            var key;
            self._heartbeatTimes = {};
            for (key in self._heartbeatNames){
                key = self._heartbeatNames[key];
                self._heartbeatTimes[key] = new Date().getTime();
            }
        };
        
        self.stop = function stop(){
            self._isActive = false;
        };
    }
});

namespace.HEARTBEAT_VERB = HEARTBEAT_VERB;
namespace.HeartbeatService = HeartbeatService;
namespace.HeartbeatMonitor = HeartbeatMonitor;
})(window.Heartbeat_Service = window.Heartbeat_Service || {});