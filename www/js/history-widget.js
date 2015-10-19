
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
	"dojox/dtl",
	"dojox/dtl/Context"
], function(declare, parser, _WidgetBase, dom, ready, registry, on, style, Dialog, xhr, lang, json, DTL, DTL_Context){
	if(!("_getTemplateString" in DTL.text)){
		DTL.text._getTemplateString = DTL.text.getTemplateString;
		DTL.text.getTemplateString = function(file){
			return DTL.text._getTemplateString(file).replace(/(\r?\n)$/, ''); // remove optional trailing newline from template HTML file to make testing consistent
		};
	}

	var widget = function(params, session_id, path){
		this.params = params;
		this.path = path || "";		
		this.dialog = null;
		this.current_id = session_id;
		this.sessions = null;
	}
	widget.prototype.show = function(){
		//every time user clicks on History button it should get the refreshed results.
		
		var response  = this.getHistory();
		var context  = this;
		response.then(function(data){
			if(data == null ){
				
				return; 
			}
			context.sessions = data;
			var html = "<table style=' margin: 1em 0; min-width: 300px;'> <tr> <th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Session ID </th> <th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Time </th><th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> User </th><th style='text-align: left;display: table-cell;padding: .25em .5em; font-weight: bold'> Action </th></tr>";
			for(var k in Object.keys(data)){
				html += context.createRowHTML(data[k]);
			}
			html += "</table>";
			context.dialog = new Dialog({
				title : "History",
				content : html,
				style : "width: 600px; font-size:14px;"
			}); 
			context.initHandlers();
			context.dialog.show();
		});
	},
	widget.prototype.getHistory = function(){
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
	}
	widget.prototype.createRowHTML = function(data){
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		td.innerText = data["session_id"];			
		td.setAttribute("style", "text-align: left;display: table-cell;padding: .25em .5em;");
		tr.appendChild(td);
		td = document.createElement("td");
		td.innerText = data["time"];			
		td.setAttribute("style", "text-align: left;display: table-cell;padding: .25em .5em;");
		tr.appendChild(td);
		td = document.createElement("td");
		td.innerText = data["user"];			
		td.setAttribute("style", "text-align: left;display: table-cell;padding: .25em .5em;");
		tr.appendChild(td);
		
		td = document.createElement("td");
		td.setAttribute("style", "text-align: left;display: table-cell;padding: .25em .5em;");
		tr.appendChild(td);
		tr.setAttribute("style", "border-top: 1px solid #ddd;border-bottom: 1px solid #ddd;");
		if(this.current_id == data['session_id']){
			td.appendChild(document.createTextNode('Current'));
			return tr.outerHTML;
		}
		var btn = document.createElement('button');
		btn.setAttribute('data-dojo-type',"dijit/form/Button");
		btn.setAttribute('id' ,'btn_' + data['session_id']);
		btn.innerText = "Load";
		
		td.appendChild(btn);
		return tr.outerHTML;
	}
	widget.prototype.loadHandler = function(e){
		var label = e.target.id;
		var session_id = label.slice(3,label.indexOf('_label'));
		window.location = window.location.href + "&sid=" + session_id;
	}
	widget.prototype.initHandlers = function(){
		var sessions = this.sessions;		
		for(var k in Object.keys(sessions)){		
				var btn = dom.byId('btn_' + sessions[k]['session_id']);
				if(!btn) continue;
				on(btn, 'click', this.loadHandler);
				
		}
	}
	return widget;
} );