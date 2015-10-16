
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

	var widget = function(params, path){
		this.params = params;
		this.path = path || "";
		this.template = template;
		
		this.dialog = null;
		
	}
	widget.prototype.show = function(){
		//every time user clicks on History button it should get the refreshed results.
		
		var response  = this.getHistory();
		var context  = this;
		response.then(function(data){
			if(data == null ){
				
				return; 
			}
			var html = "";
			/*for(var k in Object.keys(data)){
				html += context.createRowHTML(data[k]);
			}*/
			debugger;
			
			
			var dd = dojox.dtl;

			var context = new dd.Context({
				items: ["apple", "banana", "lemon"],
				unplugged: "Torrey"
			});
			var template = new dd.Template("{% for item in items %}{% cycle 'Hot' 'Diarrhea' unplugged 'Extra' %} Pocket. {% endfor %}");
			html = template.render(context);
			
			
			var dynamic_template = new DTL.Template(template);
			var c = new DTL_Context({
				name : "world",
				data : ['Tushar', 'tushar-jain@live.com'],
				sessions : html
			});
			context.dialog = new Dialog({
				title : "History",
				content : html,
				style : "width: 600px; font-size:14px; "
			}); 
			debugger;
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
		td.innerText = data["author"];			
		td.setAttribute("style", "text-align: left;display: table-cell;padding: .25em .5em;");
		tr.appendChild(td);
		tr.setAttribute("style", "border-top: 1px solid #ddd;border-bottom: 1px solid #ddd;");
		return tr.outerHTML;
	}
	return widget;
} );