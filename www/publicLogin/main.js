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
/* global define */
define([
	'dojo/_base/lang',
	"dojo/dom",
	'dojo/dom-geometry',
	"dojo/on",
	'dojo/aspect',
	"dojo/io-query",
	"dojo/ready",
	'dijit/registry',
	"dojo/_base/declare", 
	"dojo/request/xhr", 
	"dojo/_base/json",
], function(
		lang, dom, geometry, on, aspect, ioQuery, ready, registry, declare, xhr, json
){
	// Summary: 
	//			Menu controller
	// Description:
	//			Acts as the controller for the buttons on the menu
	// Tags:
	//			menu, buttons, controller
	
	console.log("public login main.js");
	
	var getPublicLoginDetails =  function(userName, problemName) {		
		return xhr.post("public_login_details_fetcher.php", {
			data: {
				user: userName,
				problem: problemName
			},
			handleAs: "json"
		}).then(function(reply){  // this makes blocking?
			console.log("Reply is ", reply);
			if(problemName == "") {
				//Populate problem drop down
				for(var i=0; i<reply.length; i++){
					  var item = reply[i];
					  var html = dom.byId("problemId").innerHTML;
					  html = html + "<option value='"+item+"'>"+item+"</option>"
					  dom.byId("problemId").innerHTML = html;
				}
				//empty group drop down
				dom.byId("group2").innerHTML = "";
			} else {
				//Populate group drop down
				for(var i=0; i<reply.length; i++){
					  var item = reply[i];
					  var html = dom.byId("group2").innerHTML;
					  html = html + "<option value='"+item+"'>"+item+"</option>"
					  dom.byId("group2").innerHTML = html;
				}
			}
			return reply;			
		}, function(err){
			alert('error');
			console.log(err);
		});
	};

	ready(function(){
		on(dom.byId("un2"), "blur",lang.hitch(this, function() {
			var userName = dom.byId("un2").value;
			//Make problems combo empty
			dom.byId("problemId").innerHTML = "";
			//Make ajax Call
			getPublicLoginDetails(userName,"");			
		}));
		
		on(dom.byId("problemId"), "blur",function() {
			var userName = dom.byId("un2").value;
			var problemId = this.value;
			
			//empty group drop down
			dom.byId("group2").innerHTML = "";
			//Make ajax call
			getPublicLoginDetails(userName,problemId);						
		});
	});
	
});
