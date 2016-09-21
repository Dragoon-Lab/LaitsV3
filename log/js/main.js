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
	"dojo/html",
	"./dashboard"
], function(
	ioQuery, dom, ready, Toggler, xhr, lang, json, on, array, domClass, domQuery, nodeList, html, dashboard
){
	if(dom.byId("params").value){
		query = ioQuery.queryToObject(dom.byId("params").value);
	} else {
		query = ioQuery.queryToObject(window.location.search.slice(1));
	}

	var db = new dashboard(query);
	
	if((db.modules.query == "custom" || query == "") && db.modules.qObject){
		query = db.modules.query;
	}

	ready(function(){
		var content = db.renderTable();

		// show each modules as per the db.modules
		// hide the waiting info
			var waitDOM = dom.byId("wait");
		domClass.add(waitDOM, "hidden");

		//showing the heading
		var headingDOM = dom.byId("heading");
		html.set(headingDOM, db.modules['heading']);

		//showing the subheading
		var subHeadingDOM = dom.byId("sub-heading");
		html.set(subHeadingDOM, db.modules['subHeading']);

		// showing the color key based on the modules value
		if(db.modules['colors']){
			var colorKeyDOM = dom.byId("key");
			domClass.remove(colorKeyDOM, "hidden");
			domClass.add(colorKeyDOM, "visible");
		}

		//add table structure string to the table div
		var tableDOM = dom.byId("table");
		html.set(tableDOM, content);

		//showing or hinding the class type based on the db.modules.display
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

		if(db.modules['options']){
			//add event catchers for each radio change.
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
