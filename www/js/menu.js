/*global define*/
define([
    "dojo/dom",
    "dojo/ready",
    "dijit/registry",
    "dojo/on"
],function(dom, ready, registry, on){

    return {
	add: function(button, handler){
            // If I use registry.byId(), then the function is called twice.
	    var o = dom.byId(button);
	    if(o){
		console.log("wiring up ", button, ", widget=",o);
		/*
		 This is a work-around for getting a button to work 
		 inside a MenuBar.
		 Otherwise, there is a superfluous error message.
		 */
		registry.byId(button)._setSelected = function(arg){
		    console.log("_setSelected called with ", arg);
		};
		on(o, 'click', handler);
	    } else {
		console.warn("Can't find menu item ", o);
	    }
	}
    };
});
