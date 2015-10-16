
define([
	"dojo/_base/declare", "dojo/parser",
    "dijit/_WidgetBase",
	"dojo/dom",
	"dojo/ready",
	"dijit/registry",
	"dojo/on",
	"dojo/dom-style",
	"dijit/Dialog",
	"dojox/dtl",
	"dojox/dtl/Context",
	"dojo/text!dijit/templates/history-template.html"
], function(declare, parser, _WidgetBase, dom, ready, registry, on, style, Dialog, DTL, DTL_Context, template){
		debugger;
	var widget = function(){
		var dynamic_template = new DTL.Template(template);
		var c = new DTL_Context({
			name : "world",
			data : ['Tushar', 'tushar-jain@live.com']
		});
		debugger;
		var page_content = dynamic_template.render(c); 
		this.dialog = new Dialog({
			title : "History",
			content : page_content,
			style : "width: 300px"
		});
		
	}
	widget.prototype.show = function(){
		//every time user clicks on History button it should get the refreshed results.
		this.dialog.show();
		debugger;
	}
	return widget;
} );