define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/on",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/html",
	"dojo/dom-construct",
	"./schemas-load-save"
], function(declare, array, on, dom-query, dom-list, html, dom-construct, schemas){
	return declare(null, {
		schemaApplication: {},
		nodesCount: 0,
		maxNodes: 0, 
		schema: {},
		currentSchemaID: "",
		_model : {},
		_schemas: {},
		schemaSession: {},
		currentNodes: null,

		constructor: function(/* object */ model, /* object */ session){
			this.schemaSession = new schema(session, "");
			schemaSession.getFileData("schemas.json").then(function(schemas){
				this._schemas = schemas;
			});

			this.initWindow();	
		},

		initWindow: function(){
			var schemaString = this.makeSchemaWindow();
			schemaWidget = dom.byId("accordion");
			html.set(schemaWidget, schemaString);
			
			var nodeString = this.makeNodesDropdown();
			nodesWidget = dom.byId("nodesDropdown");
			html.set(nodesWidget, nodeString);
		},

		makeSchemaWindow: function(){
			//creates schema window html
			contentPane = '<div id="radioSchema">';
			array.forEach(this._schemas, function(schemaType){
				contentPane += '<div data-dojo-type="dijit/layout/ContentPane" title = "'+schemaType.schemaClass+'">';
				array.forEach(schemaType.subClasses, function(schema){
					contentPane += '<input type="radio" name="schema" class="schema" id="'+schema.id+'" value = "'+schema.id+'" data-dojo-type="dijit/form/RadioButton/><label for = "'+schema.id+'">'+schema.name+'</label>';
				}, this);
				contentPane += '</div>';
			}, this);
			contentPane += '</div>';

			return contentPane;
		},

		makeNodeDropdown: function(){
			var nodes = this._model.given.getNodes();
			nodesCount++;

			var nodesSelect += '<select id = "nodes'+nodesCount+'" data-dojo-type = "dijit/form/Select">';
			nodesSelect += '<option value="">--Select--</option>';
			array.forEach(nodes, function(node){
				if(!node.genus){
					nodesSelect += '<option value = "'+ node.ID +'">'+ node.name +'</option>';
					maxNodes ++;
				}
			}, this);
			
			return nodesSelect;
		},

		_initHandles: function(){
			var schemaWidget = dom.byId("radioSchema");
			on(schemaWidget, "change", function(){
				var schemas = dom-query(".schema");
				schemas.forEach(function(schema){
					if(schema.checked){
						this.handleSchema(schema.value);
					}
				}, this);
			});
			
			var isolationWidget = dom.byId("isolationCheckbox");
			on(isolationWidget, "change", function(){
				this.handleDifficulty("isolation", isolationWidget.checked);
			});

			var cuesWidget = dom.byId("cuesCheckbox");
			on(cuesWidget, "change", function(){
				this.handleDifficulty("cues", cuesWidget.checked);
			});

			var phrasesWidget = domy.byId("phrasesCheckbox");
			on(phrasesWidget, "change", function(){
				this.handleDifficulty("phrase", phrasesWidget.checked);
			});

			this.initNodesHandler();

			var saveButtonWidget = dom.byId("saveSchema");
			on(saveButtonWidget, "click", function(){
				this.saveSchema();
			});

			var resetButtonWidget = dom.byId("resetSchema");
			on(resetButtonWidget, "click", function(){
				this.resetSchema();
			});
		},

		initNodesHandler: function(){
			var nodeID = "nodes" + nodesCount;
			nodesWidget = dom.byId(nodeID);
			on(nodesWidget, "change", function(){
				this.handleNodes(nodesWidget.nodeID, nodesWidget.attr('value'));
			});
		},

		handleSchema: function(value){
			this._model.given.setSchemaClass(this.currentSchemaID, value);	
		},
		
		handleDifficulty: function(type, value){
			this._model.given.setSchemaDifficulty(this.currentSchemaID, type, value);
		},

		handleNodes: function(id, nodeID){
			this.currentNodes[id.slice(-1)] = nodeID;
			if(this.nodesCount < this.maxNodes){
				var nodeString = this.makeNodeDropdown();
				var nodesWidget = dom.byId("nodesDropdown");
				
				var nodeDOM = dom-contruct.toDOM(nodeString);
				dom-construct.place(nodesWidget, nodeDOM);
				this.initNodesHandler();
			}
		},

		showSchemaWindow: function(id){
			this.currentSchemaID = id;
			this._initHandles();
			
			//show schema window
		},

		saveSchema: function(){
			if(this.currentNodes){
				this._model.given.setSchemaNodes(this.currentNodes);
			}
			
			session.saveProblem(this._model.model);
			//hide schema window

			//add schema to the list of dropdowns for edit.
		},

		resetSchema: function(){
			var index = this._model.given.getSchemaIndex(this.currentSchemaID);
			var schemas = this._model.given.getSchemas();
			if(index){
				schemas.splice(index, 1);
			}
			this._model.given.addSchema(this.currentSchemaID);
			
			this.initWindow();
		}
	});
});
