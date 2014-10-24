/*
     Dragoon Project
     Arizona State University
     (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
     
     This file is a part of Dragoon
     Dragoon is free software: you can redistribute it and/or modify
     it under the terms of the GNU Lesser General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
     
     Dragoon is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU Lesser General Public License for more details.
     
     You should have received a copy of the GNU Lesser General Public License
     along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
*/
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
