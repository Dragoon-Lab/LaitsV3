/** Polyfill patches for non-compliant browsers for EMACS5
    Package: SuperGLU
    Author: Benjamin Nye
    License: APL 2.0
**/

/** Fix for IE8 and under, where arrays have no indexOf... **/
var indexOf = function(needle) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;
            for(i = 0; i < this.length; i++) {
                if(this[i] === needle) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    }
    return indexOf.call(this, needle);
};

/** Fix for IE8 and under, where arrays have no indexOf... **/
Object.values = function(obj){
    return (Object.keys(obj)).map(function(key){return obj[key];});
};

/** Fill in toISOString if not defined (Thanks, IE8) **/
if ( !Date.prototype.toISOString ) {
  ( function() {

    function pad(number) {
      var r = String(number);
      if ( r.length === 1 ) {
        r = '0' + r;
      }
      return r;
    }

    Date.prototype.toISOString = function() {
      return (this.getUTCFullYear() + 
                '-' + pad( this.getUTCMonth() + 1 ) + 
                '-' + pad( this.getUTCDate() ) + 
                'T' + pad( this.getUTCHours() ) + 
                ':' + pad( this.getUTCMinutes() ) + 
                ':' + pad( this.getUTCSeconds() )  + 
                '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 ) + 
                'Z');
    };

  }() );
}

/** Object.create polyfill **/
if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F();
        };
    })();
}

/** Console-polyfill. MIT license.
    Attribution: Paul Miller
    https://github.com/paulmillr/console-polyfill
    Make it safe to do console.log() always.
**/
(function(con) {
  'use strict';
  var prop, method;
  var empty = {};
  var dummy = function() {};
  var properties = 'memory'.split(',');
  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
     'table,time,timeEnd,timeStamp,trace,warn').split(',');
  while (prop = properties.pop()) con[prop] = con[prop] || empty;
  while (method = methods.pop()) con[method] = con[method] || dummy;
})(this.console = this.console || {}); // Using `this` for web workers.
