/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
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

			var elements = domQuery("input[name=type]");
			on(elements, "change", function(){
				var tableType = '';
				array.forEach(elements, function(element){
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
