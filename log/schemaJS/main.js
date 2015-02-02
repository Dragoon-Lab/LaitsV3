define([
	"dojo/io-query",
	"dojo/dom",
	"dojo/ready",
	"dojo/on",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/html",
	"dijit/registry",
	"./dashboard"
], function(ioQuery, dom, ready, on, array, domClass, domQuery, nodeList, html, registry, dashboard){
	var query = ioQuery.queryToObject(window.location.search.slice(1));

	var db = new dashboard(query); 

	ready(function(){
		var content = db.renderTable();

		var waitDOM = dom.byId("wait");
		domClass.add(waitDOM, "hidden");

		//showing the heading
		var headingDOM = dom.byId("heading");
		html.set(headingDOM, db.modules['heading']);

		//showing the subheading
		var subHeadingDOM = dom.byId("sub-heading");
		html.set(subHeadingDOM, db.modules['subHeading']);

		var tableDOM = dom.byId("table");
		html.set(tableDOM, content);

		var allNodes = domQuery(".all");
		allNodes.forEach(function(node){
			domClass.add(node, 'hidden');
		});

		var classString = "." + db.modules['display'];
		var showNodes = domQuery(classString);
		showNodes.forEach(function(node){
			domClass.toggle(node, "hidden");
			domClass.add(node, "visible");
		});
		var widget = registry.byId(db.modules.display);
		widget.set("checked", true);

		if(db.modules.options){
			var radioWidget = dom.byId("tableType");
			domClass.remove(radioWidget, "hidden");
			domClass.add(radioWidget, "visible");
			on(radioWidget, "change", function(){
				var tableType = '';
				array.forEach(radioWidget.elements, function(element){
					if(element.checked){
						tableType = element.value;
					}
				}, this);

				allNodes.forEach(function(node){
					domClass.remove(node, 'visible');
					domClass.add(node, 'hidden');
				});
			
				var classString = "."+tableType;
				var showNodes = domQuery(classString);
				showNodes.forEach(function(node){
					domClass.remove(node, 'hidden');
					domClass.add(node, 'visible');
				});
			});
		}
	});
});
