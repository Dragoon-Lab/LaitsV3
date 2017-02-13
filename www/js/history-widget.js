
define([
	"dojo/_base/declare", "dojo/parser",
    "dijit/_WidgetBase",
	"dojo/dom",
	"dojo/ready",
	"dijit/registry",
	"dojo/on",
	"dojo/dom-style",
	"dijit/Dialog",
	"dojo/request/xhr",
	"dojo/_base/json",
	"dojo/_base/lang",
	'dojo/aspect',
	"form.js"
], function(declare, parser, _WidgetBase, dom, ready, registry, on, style, Dialog, xhr, json, lang, aspect){
	return declare(null, {
		params : null,
		path : null,		
		dialog : null,
		current_id : null,
		sessions : null,
		HTMLBuilder : [],
		constructor : function(params, session_id, path){
			this.params = params;
			this.path = path || "";		
			this.dialog = null;
			this.current_id = session_id;
			this.sessions = null;
			this.HTMLBuilder = [];
			this.HTMLBuilder.push("<tr>");
			this.HTMLBuilder.push("<td style='text-align: left;display: table-cell;padding: .25em .5em;'>");
			this.HTMLBuilder.push("</td>");
			this.HTMLBuilder.push("</tr>");
		},
		
		show : function(){
			//every time user clicks on History button it should get the refreshed results.
		
			var response  = this.getHistory();
			var context  = this;
			response.then(function(data){
				var html =  null;
				if(data == null ){
					html = "<p> There are no saved sessions for this model </p>";
				}
				else {
					context.sessions = data;
					html = "<table style=' margin: 1em 0; min-width: 300px;' id='tbl_history'> <tr> <th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Session ID </th>"
					html += "<th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Time </th>";
					html += "<th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Nodes </th><th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> User </th><th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Action </th></tr>";
					for(var k in Object.keys(data)){
						html += context.createRowHTML(data[k]);
					}
					html += "</table>";
				}
				// creating the dialog object after the history event is triggered. 
				context.dialog = new Dialog({
					title : "History",
					content : html,
					style : "min-width: 450px; font-size:14px;"
				}); 

				context.initHandlers();
				context.dialog.show();
			});
		},
		getHash : function(data){
			var hash_32 = CryptoJS.SHA256(data);
			var hash_int = hash_32.words[7] >>> 16;
			//check for the collisions
			return "S" + hash_int;
			
		},
		getHistory : function(){
			//Summary: calls history_fetcher.php to retrieve the history of a problem object
			//		and returns it as a json object
			console.log("getHistory called with ", this.params);
			return xhr.get(this.path + "history_fetcher.php", {
				query: this.params,
				handleAs: "json"
			}).then(lang.hitch(this, function(history){	 
				console.log("getHistory worked", history);			
				return history;
				
			}), lang.hitch(this, function(err){
				this.clientLog("error", {
					message: "load history from DB error : "+err,
					functionTag: 'getHistory'
				});
			}));
		},
		createRowHTML : function(data){
			var html = this.HTMLBuilder[0];
			html += this.HTMLBuilder[1] + this.getHash(data["session_id"]) + this.HTMLBuilder[2];			
			html += this.HTMLBuilder[1] + data["time"]; + this.HTMLBuilder[2];	
			var solution_json = JSON.parse(data["solution_graph"]);
			var count = (solution_json) ? solution_json['givenModelNodes'].length : 0;
			html += this.HTMLBuilder[1] + count + this.HTMLBuilder[2];	
			html += this.HTMLBuilder[1] + data["user"] + this.HTMLBuilder[2];	
		
			if(this.current_id == data['session_id']){
				html += this.HTMLBuilder[1] + "Current" + this.HTMLBuilder[2] + this.HTMLBuilder[3] ;	
				return html;
			}
			var btn_id = "btn_" + data['session_id'];
			var btn = dom.byId(btn_id);
			if(!btn) {
				btn = document.createElement('button');		
				btn.setAttribute('data-dojo-type',"dijit/form/Button");
				btn.setAttribute('id' ,btn_id);
				btn.innerText = "Load";				
			}
			html += this.HTMLBuilder[1] + btn.outerHTML + this.HTMLBuilder[2];
			return html;
		},
		loadHandler : function(e){
			var label = e.target.id;
			var session_id = label.slice(4,label.indexOf('_label'));
			//before attaching the session id or x parameter
			//verify if it is undefined , then add form property
			//else just modify the value with current session id depending on history item opted
			var form = document.forms[formID];
			if(form.x === undefined){
				addFormProperty("x",session_id);
			}
			else{
				form.x.value = session_id;
			}
			submit();		
		},
		initHandlers : function(){
			var sessions = this.sessions;
			var query_params = this.params;

			//Before attaching click handlers to buttons which open each session
			//create a form which reads parameters from session
			//we already have js file for this purpose : form.js
			//step 1: create a form and add properties from parameters
			console.log("form id is",formID);
			createForm();
			for (var prop in query_params) {
 				addFormProperty(prop,query_params[prop]);
			}
			//step 2 : attach handlers	
			for(var k in Object.keys(sessions)){		
					var btn = dom.byId('btn_' + sessions[k]['session_id']);
					if(!btn) continue;
					on(btn, 'click', this.loadHandler);				
			}

			on(this.dialog, "hide", lang.hitch(this,function(e){
				var ele = document.getElementById('tbl_history');
				if(ele)
					ele.parentNode.removeChild(ele);
				this.dialog.destroyRecursive();
			}));
		}
	})
} );