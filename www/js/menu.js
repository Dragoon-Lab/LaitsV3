/*global define*/
define([
    "dojo/dom",
    "dojo/ready",
    "dijit/registry",
    "dojo/on"
],function(dom, ready, registry, on){

    // List of handlers
    var buttons = {
	"createNodeButton":function(){
	    console.log("Create node button pressed.");
	}
    };

    // Connect buttons to handlers
    // Logging could be put in here or above.
    // This runs after widgets have been set up.
    ready(function(){
	var i=0;
	  for(var button in buttons){
              // If I use registry.byId(), then the function is called twice.
	      var o = dom.byId(button);
	      if(o){
                  console.log("wiring up ",button,", widget=",o);
		  // This is a work-around for getting a button to work inside a MenuBar
		  // Otherwise, there is an error message.
		  registry.byId(button)._setSelected = function(arg){
		      console.log("_setSelected called with ",arg);
		  };
		  on(o,"click",buttons[button]);
	      } else {
		  console.warn("Can't find menu item ",o);
	      }
	  }
	});
});
