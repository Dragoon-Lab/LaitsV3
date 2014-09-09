/* global define */
define([
	"dojo/io-query",
	"dojo/dom",
	"dojo/ready",
	"dojo/fx/Toggler", 
	"dojo/request/xhr", 
	"dojo/_base/lang",
	"./dashboard"
], function(
	ioQuery, dom, ready, Toggler, xhr, lang, dashboard
){
	var query = ioQuery.queryToObject(window.location.search.slice(1));

	var db = new dashboard(query);

	ready(function(){
		var tableType = query['type']?query['type']:"empty";
		dashboard.renderTable(tableType);

		if(dashboard.runtime){
			//add event catchers for each radio change.

		}else{
			var tableDiv = new Toggler({
				nodeID:"tableTypes"
			});
			tableDiv.hide();

			//add action for each time node to show detailed analysis
		}
	});
});
