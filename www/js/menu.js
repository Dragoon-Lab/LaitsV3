/*global define*/
define([
	 "dojo/dom",
	 "dojo/domReady!"
],function(dom){
  // This runs after widgets have been set up (maybe domReady! is sufficient?)
  ready(function(){
	  var buttons = {
	    "createNodeButton":function(){
	      console.log("Create node button pressed.");
	    }
	  };
	  // Connect buttons to handlers
	  for(var button in buttons){
	    
	  }
	}
});