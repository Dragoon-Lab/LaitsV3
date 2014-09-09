/* global define */
define([
	"dojo/io-query",
	"dojo/dom",
	"dojo/ready",
	"dojo/fx/Toggler", 
	"dojo/request/xhr", 
	"dojo/_base/lang",
	"dojo/json",
	"dojo/on",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/query",
	"dojo/NodeList-dom",
	"./dashboard"
], function(
	ioQuery, dom, ready, Toggler, xhr, lang, json, on, array, domClass, domQuery, nodeList, dashboard
){
	var query = ioQuery.queryToObject(window.location.search.slice(1));

	var db = new dashboard(query);

	db.getResults(query).then(function(results){
		db.objects = json.parse(results);


		ready(function(){
			var tableType = query['type']?query['type']:"empty";
			db.init();			
			
			db.renderTable();
			var allNodes = domQuery(".all");
			allNodes.forEach(function(node){
				domClass.add(node, 'hidden');
			});
			var classString = "." + tableType;
			var showNodes = domQuery(classString);
			showNodes.forEach(function(node){
				domClass.toggle(node, "hidden");
				domClass.add(node, "visible");
			});

			if(db.runtime){
				//add event catchers for each radio change.
				var radioWidget = dom.byId("tableType");
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
			}else{
				var tableDiv = new Toggler({
					nodeID:"tableTypes"
				});
				tableDiv.hide();

				//add action for each time node to show detailed analysis
			}
		});
	});
});
