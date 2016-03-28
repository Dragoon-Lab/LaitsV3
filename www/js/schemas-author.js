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
	"dijit/form/TextBox",
	"dijit/layout/AccordionContainer",
	"dijit/layout/ContentPane",
	"dijit/form/RadioButton",
	"./schemas-load-save"
], function(declare, array, on, lang, dom, registry, json, domQuery, domList, html, domConstruct, textBox, accordion, content, radio, schemas){
	return declare(null, {
		nodesCount: 0,
		maxNodes: 0, 
		currentSchema: {},
		_model : {},
		_schemas: {},
		_session:{},
		currentNodes: [],
		showFactors: false,

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
					contentPane += '<input type="radio" name="schema" class="radioSchema" id="'+schema.id+'" value = "'+schema.name+'" data-dojo-type="dijit/form/RadioButton"/><label for = "'+schema.id+'">'+schema.name+'</label><br/>';
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
            if(this.isRO)
                nodesSelect = '<select class="nodesDropdown" id = "nodes'+ this.nodesCount+'" data-dojo-type = "dijit/form/Select" disabled>';
			console.log("nd",this.isRO,nodesSelect);
            nodesSelect += '<option value="">--Select--</option>';
			if(nodes){
				array.forEach(nodes, function(node){
					if(!node.genus || node.genus == "required"){ 
						if(this.currentNodes.indexOf(node.ID) == -1){
							nodesSelect += '<option value = "'+ node.ID +'">'+ node.name +'</option>';
						}
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
			
			var gotoButtonWidget = dom.byId("goToFactors");
			if(this.showFactors){
				on(gotoButtonWidget, "click", lang.hitch(this, function(){
					this.initFactorsWindow.apply(this, arguments);
				}));
				
				var saveButtonWidget = dom.byId("saveSchema");
				on(saveButtonWidget, "click", lang.hitch(this, function(){
					this.saveSchema.apply(this, arguments);
				}));
			} else {
				dom.byId("goToFactors").textContent = "Save";
				on(gotoButtonWidget, "click", lang.hitch(this, function(){
					this.saveSchema.apply(this, arguments);
				}));
			}

			var resetButtonWidget = dom.byId("resetSchema");
			on(resetButtonWidget, "click", lang.hitch(this, function(){
				this.resetSchema.apply(this, arguments);
			}));

			var viewSchemaButton = dom.byId("showAllSchemas");
			on(viewSchemaButton, "click", lang.hitch(this, function(){
				this.initViewSchemasDialog();
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
			this.currentSchema.name = event.target.value;
		},
		
		handleDifficulty: function(event){
			var name = event.target.name;
			var id = event.target.id;

			var widget = dom.byId(id);
			if(widget.checked){
				this.currentSchema.difficulty[name] = 0;
			} else {
				this.currentSchema.difficulty[name] = 1;
			}
		},

		handleNodes: function(event){
			var nodeID = event.target.id;
			var nodesWidget = dom.byId(nodeID);
			
			this.currentNodes[this.nodesCount-1] = nodesWidget.value;
			if(this.currentNodes.length < this.maxNodes){
				var nodeString = this.makeNodeDropdown();
				nodeString = '<br/>'+nodeString;
				
				domConstruct.place(nodeString, nodeID, "after");
				this.initNodesHandler();
			}
		},

		showSchemaWindow: function(/*boolead*/ isROAuth){
			//this.currentSchema = this._model.given.createSchema();
			this.nodesCount = 0;
            this.isRO = isROAuth;
			this.resetSchema();
			this.resetDifficulty();
			this.initNodes();
			
			//show schema window
			registry.byId("schemaAuthorBox").show();
		},

		initFactorsWindow: function(){
			var goToFormats = true;
			//check if schema window is filled
			if(this.currentSchema.name == ""){
				goToFormats = false;
				this.showError("Please select the schema before saving it.");
			} else if(this.currentNodes.length == 0){
				goToFormats = false;
				this.showError("Please select the nodes that are part of the schema.");
			}
			//hide schema window
			if(goToFormats){
				registry.byId("schemaAuthorBox").hide();
			
				this.makeFactorWindow();
				registry.byId("schemaFactorBox").show();
			}
		},

		showError: function(/* string */ message){
			dom.byId("errorBox").innerHTML = message;
		},

		saveSchema: function(){
			if(this.currentSchema.name != "") {
				this._model.given.saveSchema(this.currentSchema);
				if (this.currentNodes) {
					this._model.given.setSchemaNodes(this.currentSchema.ID, this.currentNodes);
				}
			}
			this._session.saveProblem(this._model.model);
			this.nodesCount = 0;
			//close factor window
			if (this.showFactor) {
				registry.byId("schemaFactorBox").hide();
			} else {
				registry.byId("schemaAuthorBox").hide();
			}

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
		},

		initFactorsHandler: function(id){
			var spanWidget = dom.byId(id);

			var children = spanWidget.children;
			array.forEach(children, function(widget){	
				on(widget, "blur", lang.hitch(this, function(){
					return this.handleFactors.apply(this, arguments);
				}));
			}, this);
		},

		makeFactorWindow: function(){
			//var html = "";
			var nodes = this.currentNodes;
			array.forEach(nodes, function(id){
				var node = this._model.given.getNode(id);
				this.createInputDom(node);
			}, this);
		},

		getRate: function(node){
			if(!(node in this.currentSchema.rates))
				this.currentSchema.rates[node] = {};
			
			return this.currentSchema.rates[node];
		},

		handleFactors: function(event){
			var factor = event.target.name;
			var nodePart = event.target.id;
			var tParent = event.target.parent();
			var nodeString = tParent.id;

			var nodeID = nodeString.split("_")[0];
			
			var schemaRate = this.getRate(nodeID);
			if(schemaRate){
				if(!(nodePart in schemaRate)){
					schemaRate[nodePart] = {};
				}
				
				var nodeRate = schemarate[nodePart];
				nodeRate[factor] = event.target.value;
			}					
		},

		createInputDom: function(node){
			var nodeID = node.ID;
			var type = node.type;
			var units = node.units;
			
			var nodeDIV = domConstruct.create("div", {
				id: "factors_" + nodeID,
				innerHTML: "<label>" + node.name + "</label>:&nbsp;<br/>",
				className: "factorNode"
			}, "fValues");

			this.createInputBoxes(nodeID, "description");
			this.createInputBoxes(nodeID, "type", "0.33", "guess");

			if(units != ""){
				this.createInputBoxes(nodeID, "units");
			}
			switch(type){
				case "accumulator":
					this.createInputBoxes(nodeID, "initial");
					this.createInputBoxes(nodeID, "equation");
					break;
				case "parameter":
					this.createInputBoxes(nodeID, "initial");
					break;
				case "function":
					this.createInputBoxes(nodeID, "equation");
					break;
				default:
					break;
			}
		},

		createInputBoxes: function(nodeID, nodePart, value, valueBox){
			var idString = nodeID + "_" + nodePart;
			var nodeDIV = "factors_" + nodeID;
			var inputHolder = domConstruct.create("div", {
				id: idString,
				innerHTML: "<span class = fname_"+nodePart+">"+nodePart + ": </span>",
				className: "factor_"+nodePart 
			}, nodeDIV);
			//span.innerHTML = nodePart+":&nbsp;";
			var slipValue = (valueBox == "slip" || valueBox == "both")? value : "";
			var guessValue = (valueBox == "guess" || valueBox == "both")? value : "";
			var slipIDString = nodeID + "_" + nodePart + "_" + "slip";
			var guessIDString = nodeID + "_" +nodePart + "_" + "guess";
			var slipTextBox = new textBox({
				name: "slip",
				className: "slip",
				id: slipIDString,
				value: slipValue
			});
			
			var guessTextBox = new textBox({
				name: "guess",
				className: "guess",
				id: guessIDString,
				value: guessValue
			});

			//domConstruct.place(inputHolder.domNode, nodeDIV);
			domConstruct.place(slipTextBox.domNode, idString);
			domConstruct.place(guessTextBox.domNode, idString);

			this.initFactorsHandler(idString);
		},

		initViewSchemasDialog: function() {
			var schemaDialog = registry.byId("viewAllSchemaDialog");
			var content = "";
			var model = this._model;
			var schemas = this._model.given.getSchemas().slice(0);
			//Generate Rows for each schema.
			array.forEach(schemas, function (schema) {
				var ids = schema.nodes.split(", ");
				var names = array.map(ids, function(id) { return model.given.getName(id); }).join(", ");

				content += "<div id='row-" + schema.ID + "' class ='schemaItem'> <span class='schemaName'>" + schema.name + "</span> <button id='Delete" + schema.ID + 
				            "Button' data-dojo-type='dijit/form/Button'>Delete</button><br><span class='schemaNodes'>" + names +"</span></div>";
			});

			if (content == "") {
				content += "No schemas added.";
			}
			else{
				content += "<div style='height: 20px; margin:10px;' id='EditSchemaButtons'><div style='float:right;'><button id='deleteAllSchemaButton' data-dojo-type='dijit/form/Button' >Delete All</button><button id='saveEditSchemaButton' data-dojo-type='dijit/form/Button' >Save</button><button id='cancelEditSchemaButton' data-dojo-type='dijit/form/Button' >Cancel</button></div></div>";
			}
			//Add content and show dialog.
			schemaDialog.set("content", content);
			schemaDialog.show();
            if(this.isRO){
                dijit.byId("deleteAllSchemaButton").disabled = true;
                dijit.byId("Deleteschema1Button").disabled = true;
                dijit.byId("saveEditSchemaButton").disabled = true;
            }


			//Add event handlers for delete buttons
			array.forEach(schemas, lang.hitch(this, function(schema){
				var button = dom.byId("Delete"+ schema.ID +"Button");
				on(button, 'click', lang.hitch(this, function(){
					dojo.destroy("row-"+schema.ID);
					array.forEach(schemas, lang.hitch(this, function(s, index){
						if(s && s.ID == schema.ID){
							schemas.splice(index, 1);
						}
					}));
				}));
			}));

			var deleteAllSchemaButton = dom.byId("deleteAllSchemaButton");
			on(deleteAllSchemaButton, 'click', lang.hitch(this, function(){
				this._model.given.setSchemas([]);
				this._session.saveProblem(this._model.model);
				schemaDialog.hide();
			}));

			//Event Handler for Save
			var saveEditSchema = dom.byId("saveEditSchemaButton");
			on(saveEditSchema, 'click', lang.hitch(this, function(){
				this._model.given.setSchemas(schemas);
				this._session.saveProblem(this._model.model);
				schemaDialog.hide();
			}));

			//Event Handler for cancel
			var cancelEditSchemas = dom.byId("cancelEditSchemaButton");
			on(cancelEditSchemas, 'click', function(){
				schemaDialog.hide();
			});
		}
	});
});
