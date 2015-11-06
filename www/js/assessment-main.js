define([
	"dojo/ready",
	"dojo/on",
	"dijit/registry",
	"./assessment-test"
], function(ready, on, registry, aTest){
	ready(function(){
		on(registry.byId("submitFormButton"), "click", function(){
			var p = registry.byId("p").value;
			var s = registry.byId("s").value;
			var t = registry.byId("t").value;

			var at = new aTest(p, s, t);
			at.initTesting();

			

		});
		
	});
});
