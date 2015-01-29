define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/on",
	"dojo/_base/lang",
	"dojo/dom",
	"dijit/registry",
	"dojo/json",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/html",
	"dojo/dom-construct",
	"dijit/layout/AccordionContainer",
	"dijit/layout/ContentPane",
	"./schemas-load-save"
], function(declare, array, on, lang, dom, registry, json, domQuery, domList, html, domConstruct, accordion, content, schemas){
	return declare(null, {
		nodesCount: 0,
		maxNodes: 0, 
		currentSchema: {},
		_model : {},
		_schemas: {},
		_session:{},
		currentNodes: [],

		constructor: function(/* object */ model, /* object */ session){
			this._model = model;
			this.schemaSession = new schemas(session, "");
			var schemaObject;
			this.schemaSession.getFileData("schemas.json").then(function(schemas){
				schemaObject = schemas;
			});
			
			this._schemas = json.parse(schemaObject);
			this._session = session;

			this.makeSchemaWindow();
			//this.initNodes();
			this._initHandles();
		},

		initNodes: function(){
			this.curretNodes = [];
			this.nodesCount = 0;
			var nodeString = this.makeNodeDropdown();
			nodesWidget = dom.byId("nodesDropdown");
			html.set(nodesWidget, nodeString);
			this.initNodesHandler();
		},

		makeSchemaWindow: function(){
			//creates schema window html
			contentPane = '';
			var aContainer = new accordion({}, "accordion");
			array.forEach(this._schemas, function(schemaType){
				//contentPane += '<div data-dojo-type="dijit/layout/ContentPane" title = "'+schemaType.schemaClass+'">';
				contentPane = '';
				array.forEach(schemaType.subClasses, function(schema){
					contentPane += '<input type="radio" name="schema" class="radioSchema" id="'+schema.id+'" value = "'+schema.id+'" data-dojo-type="dijit/form/RadioButton"/><label for = "'+schema.id+'">'+schema.name+'</label><br/>';
				}, this);
				//contentPane += '</div>';
				aContainer.addChild(new content({
					title: schemaType.schemaClass,
					content: contentPane
				}));
			}, this);
			//contentPane += '';
			aContainer.startup();
			//return contentPane;
		},

		makeNodeDropdown: function(){
			var nodes = this._model.given.getNodes();
			this.nodesCount++;
			this.maxNodes = 0;

			var nodesSelect = '<select class="nodesDropdown" id = "nodes'+ this.nodesCount+'" data-dojo-type = "dijit/form/Select">';
			nodesSelect += '<option value="">--Select--</option>';
			if(nodes){
				array.forEach(nodes, function(node){
					if(node.genus == "required" && this.currentNodes.indexOf(node.ID) == -1){
						nodesSelect += '<option value = "'+ node.ID +'">'+ node.name +'</option>';
						this.maxNodes++;
					}
				}, this);
			}
			return nodesSelect;
		},

		_initHandles: function(){
			var schemaWidget = dom.byId("accordion");
			on(schemaWidget, "change", lang.hitch(this, function(){
				this.handleSchema.apply(this, arguments);
			}));
			
			var isolationWidget = dom.byId("isolationCheckbox");
			on(isolationWidget, "change", lang.hitch(this, function(){
				this.handleDifficulty.apply(this, arguments);
			}));

			var cuesWidget = dom.byId("cuesCheckbox");
			on(cuesWidget, "change", lang.hitch(this, function(){
				this.handleDifficulty.apply(this, arguments);
			}));

			var phrasesWidget = dom.byId("phrasesCheckbox");
			on(phrasesWidget, "change", lang.hitch(this, function(){
				this.handleDifficulty.apply(this, arguments);
			}));

			var saveButtonWidget = dom.byId("saveSchema");
			on(saveButtonWidget, "click", lang.hitch(this, function(){
				this.saveSchema();
			}));

			var resetButtonWidget = dom.byId("resetSchema");
			on(resetButtonWidget, "click", lang.hitch(this, function(){
				this.resetSchema();
			}));
		},

		initNodesHandler: function(){
			var nodeID = "nodes" + this.nodesCount;
			nodesWidget = dom.byId(nodeID);
			on(nodesWidget, "change", lang.hitch(this, function(){
				return this.handleNodes.apply(this, arguments);
			}));
		},

		handleSchema: function(event){
			this.currentSchema.schemaClass = event.target.id;
		},
		
		handleDifficulty: function(event){
			var name = event.target.name;
			var id = event.target.id;

			var widget = dom.byId(id);
			if(widget.checked)
				this.currentSchema.difficulty[name] = 1;
			else
				this.currentSchema.difficulty[name] = 0;
		},

		handleNodes: function(event){
			var nodeID = event.target.id;
			var nodesWidget = dom.byId(nodeID);
			
			this.currentNodes[this.nodesCount-1] = nodesWidget.value;
			if(this.currentNodes.length <= this.maxNodes){
				var nodeString = this.makeNodeDropdown();
				nodeString = '<br/>'+nodeString;
				
				domConstruct.place(nodeString, nodeID, "after");
				this.initNodesHandler();
			}
		},

		showSchemaWindow: function(){
			this.currentSchema = this._model.given.createSchema();
			this.nodesCount = 0;

			this.resetSchema();
			this.resetDifficulty();
			this.initNodes();
			
			//show schema window
			registry.byId("schemaAuthorBox").show();
		},

		saveSchema: function(){			
			this._model.given.saveSchema(this.currentSchema);
			if(this.currentNodes){
				this._model.given.setSchemaNodes(this.currentSchema.ID, this.currentNodes);
			}
			
			this._session.saveProblem(this._model.model);
			this.nodesCount = 0;
			//hide schema window
			registry.byId("schemaAuthorBox").hide();
			//add schema to the list of dropdowns for edit.
		},

		resetSchema: function(){
			//var index = this._model.given.getSchemaIndex(this.currentSchemaID);
			//var schemas = this._model.given.getSchemas();
			//this.nodesCount = 0;
			/*if(index){
				schemas.splice(index, 1);
			}*/
			this.currentSchema = this._model.given.createSchema();
			this.currentNodes = [];
			this.resetDifficulty();
			this.resetRadioButtons();
			this.initNodes();
		},

		resetDifficulty: function(){
			var widget = registry.byId("isolationCheckbox");
			widget.set("checked", false);

			widget = registry.byId("cuesCheckbox");
			widget.set("checked", false);

			widget = registry.byId("phrasesCheckbox");
			widget.set("checked", false);
		},
		
		resetRadioButtons: function(){
			var widgets = domQuery(".radioSchema");
			widgets.forEach(function(widget){
				var rWidget = registry.byNode(widget);
				rWidget.set("checked", false);
			});
		}
	});
});
