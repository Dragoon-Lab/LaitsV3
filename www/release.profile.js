var profile = (function(){
	return {
		basePath: "./",
		releaseDir: "../release",
		releaseName: "www",
		action: "release",
		layerOptimize: "closure",
		optimize: "closure",
		cssOptimize: "comments",
		mini: true,
		stripConsole: "warn",
		selectorEngine: "lite",

		packages:[{
			name: "dojo",
			location: "dojo"
		},{
			name: "dijit",
			location: "dijit"
		},{
			name: "dojox",
			location: "dojox"
		},{
			name: "dragoon",
			location: "js"
		},{
			name: "parser",
			location: "math-parser"
		},{
			name: "jsPlumb",
			location: "jsPlumb/src"
		}],

		layers: {
			"dojo/dojo": {
				include: [ "dojo/dojo", "dojo/parser", "dojo/_base/array","dojo/_base/lang",
					"dojo/dom", "dojo/domReady", "dojo/dom-style", "dojo/dom-class", "dojo/on",
					"dojo/aspect", "dojo/io-query", "dojo/ready", "dojo/_base/event", "dojo/dom-geometry",
					"dijit/Dialog",
					"dijit/Editor",
					"dijit/_editor/plugins/LinkDialog",
					"dijit/MenuBar", "dijit/PopupMenuBarItem",
					"dijit/layout/BorderContainer", "dijit/MenuItem",
					"dijit/form/Select", "dijit/form/Textarea",
					"dijit/form/Button", "dijit/form/CheckBox", "dijit/form/TextBox",
					"dijit/form/ComboBox", "dijit/form/Textarea", "dijit/form/RadioButton",
					"dijit/form/SimpleTextarea", "dijit/Menu",
					"dijit/layout/ContentPane", "dijit/registry",
					"dijit/TooltipDialog"
				],
				customBase: true,
				boot: true
			},
			"dragoon/index": {
				include: [ "dragoon/main" ,
					"dragoon/menu",
					"dragoon/controller",
					"dragoon/con-student",
					"dragoon/con-author",
					"dragoon/model",
					"dragoon/RenderGraph",
					"dragoon/pedagogical_module"]
			}
		}
	};
})();