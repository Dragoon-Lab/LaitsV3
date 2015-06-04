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

/* global define, jsPlumb */

define([
	"dojo/_base/array", 
	'dojo/_base/declare', 
	'dojo/_base/lang',
	"dojo/dom-attr", 
	"dojo/dom-construct", 
	"dojo/dom-style",
	"dijit/Menu", 
	"dijit/MenuItem",
	"./equation",
	"./graph-objects", 
	"jsPlumb/jsPlumb"
], function(array, declare, lang, attr, domConstruct, domStyle, Menu, MenuItem, equation, graphObjects){
	// Summary: 
	//			MVC for the canvas
	// Description:
	//			Acts as interface to JS Plumb
	// Tags:
	//			JS Plumb, model

	return declare(null, {

		_instance: null,
		_givenModel: null,
		_logging:null,
		_showColor:false,
		// Hook for updates
		updater: function(nodeID,setOfConnections){
            //time to update borders
            //check needed for student mode ?
            var nodes=this._givenModel.getNodes();
            array.forEach(nodes,function(node){
               this.colorNodeBorder(node.ID,true); 
            },this);
            //time to delete all connectiion having node as source node
            array.forEach(this._instance.getConnections(), function(connection){
                if(setOfConnections[connection.targetId]){
                	this._instance.detach(connection); //remove that connection
            	}
            }, this);

        },
		constructor: function(givenModel, /*boolean*/ showColor){
			this._showColor = showColor;
			// setup some defaults for jsPlumb.
			var instance = jsPlumb.getInstance({
				Endpoint : ["Dot", {radius:0.1}], //hiding it
				HoverPaintStyle : {strokeStyle:"#1e8151", lineWidth:2 },
				ConnectionOverlays : [
					[ "Arrow", {
						location:1,
						id:"arrow",
						length:14,
						foldback:0.9
					} ]
					/*,[ "Label", { label:"+", id:"label", cssClass:"aLabel" }]*/
				],
				Container:"statemachine-demo"
			});

			this._instance = instance;
			this._givenModel = givenModel;
			var shapes = {
				accumulator: "accumulator",
				function: "function",
				parameter: "parameter"
			};

			// initialise draggable elements.
			var vertices = array.map(givenModel.getNodes(), function(node){
				return this.addNode(node);
			}, this);

			console.log("-------- instance:	 ", instance);

			/* bind a click listener to each connection; the connection is deleted. you could of course
			 just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
			 happening. */
			instance.bind("click", function(c){
				//instance.detach(c);
			});

			// suspend drawing and initialise.
			instance.doWhileSuspended(function(){

				/* make each ".ep" div a source and give it some parameters to work with.  here we tell it
				 to use a Continuous anchor and the StateMachine connectors, and also we give it the
				 connector's paint style.  note that in this demo the strokeStyle is dynamically generated,
				 which prevents us from just setting a jsPlumb.Defaults.PaintStyle.	 but that is what i
				 would recommend you do. Note also here that we use the 'filter' option to tell jsPlumb
				 which parts of the element should actually respond to a drag start. */

				array.forEach(vertices, function(vertex){
					instance.makeSource(vertex, {
						filter:".ep",								// only supported by jquery
						anchor:"Continuous",
						connector:[ "StateMachine", { curviness:20 } ],
						connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
						maxConnections:5,
						onMaxConnections:function(info, e){
							alert("Maximum connections (" + info.maxConnections + ") reached");
						}
					});
				});

				// initialise all '.w' elements as connection targets.
				array.forEach(vertices, function(vertex){
					instance.makeTarget(vertex, {
						dropOptions:{ hoverClass:"dragHover" },
						anchor:"Continuous"
					});
				});
			});

			array.forEach(vertices, function(vertex){
				var id = attr.get(vertex, "id");
				var inputs = givenModel.getInputs(id);
				this.setConnections(inputs, vertex);
			}, this);

			return instance;

		},

		colorNodeBorder: function(/*Object*/ nodeID, updateNode){
			var type = this._givenModel.getNode(nodeID).type;

			var isComplete = this._givenModel.isComplete(nodeID)?'solid':'dashed';
			var colorMap = {
				correct: "green",
				incorrect: "#FF8080",
				demo: "#ffd500",
				neutral: "gray",
				perfect: "#94FF94"
			};
			var borderColor = "",
			boxshadow = "";
			var backgroundcolor = "";
			var color = "";
			if(type){
				if(this._showColor){
					color = this._givenModel.getCorrectness?
					this._givenModel.getCorrectness(nodeID):"neutral";
					//check for perfect node
					if (this._givenModel.getAssistanceScore){
						if (this._givenModel.isComplete(nodeID) && this._givenModel.getAssistanceScore(nodeID) === 0 && this._givenModel.getCorrectness(nodeID) === "correct"){
							backgroundcolor = colorMap.perfect;
						}
					}
				}else{
					color = "neutral";
					backgroundcolor = "";
				}
				borderColor += "3px "+isComplete+" " + colorMap[color];
				boxshadow = 'inset 0px 0px 5px #000 , 0px 0px 10px #000';				
			}
			console.log("borderColor: ", borderColor);
			if(updateNode){
				domStyle.set(nodeID, 'border', borderColor);
				domStyle.set(nodeID, 'box-shadow', boxshadow);
				domStyle.set(nodeID, 'backgroundColor', backgroundcolor);
			}
			return {border: borderColor, boxShadow: boxshadow, backgroundColor: backgroundcolor};
		},
        /* Delete Nodes*/
        deleteNode:function(/*node id*/ nodeID){
			domConstruct.destroy(nodeID);
					var setConnections = []; //setOfConnections to delete
 					//remove all connnections including incoming and outgoing and store the targetIDs
					array.forEach(this._instance.getConnections(), function(connection){
						if(connection.targetId == nodeID||connection.sourceId == nodeID){
							if(connection.sourceId == nodeID){
						        	setConnections[connection.targetId]=true;//connections to delete for matching sourceId
							}
							this._instance.detach(connection);
						}
					}, this);

					this._logging.log('ui-action', {
						type: "node-delete",
						node: this._givenModel.getName(nodeID),
						nodeID: nodeID
					});
					//delete from  the model
					this._givenModel.deleteNode(nodeID);
					this.updater(nodeID,setConnections);
        },
		/* addNode: Add a node to the jsPlumb model, returning the DOM element.	 */
		addNode: function(/*object*/ node){

			var type = node.type || "triangle";
			var mx=0, my=0, offsetTop=30.975
			if (type=="parameter") {
			 mx=-13.66903;	 my=-13.64405;
			}
			console.log("------- Adding element to canvas, id = ", node.ID, ", class = ", type);
			// Add div to drawing
			console.log("	   --> setting position for vertex : "+ node.ID +" position: x"+node.position.x+"  y:"+node.position.y);
	
			var nodeName = graphObjects.getNodeName(this._givenModel,node.ID);
			// Don't actually update node, since we will create it below.
			var colorBorder = this.colorNodeBorder(node.ID, false);
			var vertex = domConstruct.create("div", {
				id: node.ID,
				"class": type,
				style: {
					left: node.position.x-mx+'px', 
					top: node.position.y-offsetTop-my+'px',
					border: colorBorder.border,
					'box-shadow': colorBorder.boxShadow,
					backgroundColor: colorBorder.backgroundColor
				},
				innerHTML: nodeName
			},"statemachine-demo");
			console.log("node created",vertex);
			//domConstruct.place(vertex, "statemachine-demo");

			//add menu to delete or we can iterate over all node.IDs and do following
			var pMenu = new Menu({
				targetNodeIds: [node.ID]
			});
            //test
			pMenu.addChild(new MenuItem({
				label: "Delete Node",
				onClick: lang.hitch(this,function(){
                        this.deleteNode(node.ID)
                    })
			}));
			/*
			 Fire off functions associated with draggable events.
			 Note that the names (onMoveStart, onMove, onMoveStop) are from
			 the underlying library dojo/dnd/move, rather than jsPlumb.
			 */		
			this.makeDraggable(vertex);
			
			return vertex;
		},

		makeDraggable:function(/*vertex*/ vertex){
			this._instance.draggable(vertex,{
				onMoveStart: lang.hitch(this, this.onMoveStart),
				onMove: lang.hitch(this, this.onMove),
				onMoveStop: lang.hitch(this, this.onMoveStop)
			});

			this._instance.makeSource(vertex, {
				filter:".ep",								// only supported by jquery
				anchor:"Continuous",
				connector:[ "StateMachine", { curviness:20 } ],
				connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
				maxConnections:5,
				onMaxConnections:function(info, e){
					alert("Maximum connections (" + info.maxConnections + ") reached");
				}
			});
			this._instance.makeTarget(vertex, {
				dropOptions:{ hoverClass:"dragHover" },
				anchor:"Continuous"
			});

		},

		setConnection:function(/*string*/source,/*string*/destination){
			this._instance.connect({source: source, target: destination});
		},

		// Code duplication issue:  https://trello.com/c/6cdUaCPl
		setConnections: function(/*array*/ sources, /*string*/ destination){

			//after determining equation type + or	- , set connection EndPoint by using following method
			//this._instance.Defaults.ConnectionOverlays = this.getEndPointConfiguration('+');
			// For now, we simply remove all existing connections and
			// create all new connections.
			// See http://stackoverflow.com/questions/11488067/how-to-delete-jsplumb-connection
			// console.log("----- setConnections:  Need to delete existing connections going into " + destination, this._instance);
			// Go through existing connections and delete those that
			// have this destination as their target.
		
			var targetId = attr.get(destination, "id");
			var parse = this._givenModel.getEquation(targetId), isSum, isProduct;
			if(parse){
				parse = equation.parse(parse);
				isSum = equation.isSum(parse);
				isProduct = equation.isProduct(parse);
			}

			array.forEach(this._instance.getConnections(), function(connection){
				if(connection.targetId == destination)
					this._instance.detach(connection);
			}, this);
			// Create new connections

			var connectionOverlays = graphObjects.getEndPointConfiguration('');
			array.forEach(sources, function(source){
				// All sources and destinations should exist.
				//				  if(destination.is)
				if(source.label){
					console.log("------- At this point, we should add a '"+source.label+"' label to "+ source.ID);
					//check pure sum  or pure product but not both
					if(!(isSum && isProduct)){
						if(isSum && source.label == '-'){
							connectionOverlays = graphObjects.getEndPointConfiguration(source.label);
						}else if(isProduct && source.label == '/'){
							connectionOverlays = graphObjects.getEndPointConfiguration(source.label);
						}
					}
				}

				this._instance.connect({source: source.ID,
										target: destination,
										overlays:connectionOverlays
				});
				connectionOverlays = graphObjects.getEndPointConfiguration('');
			}, this);
		},

		// Code duplication issue:  https://trello.com/c/6cdUaCPl
		addQuantity: function(/*string*/ source, /*array*/ destinations){
			// Go through existing connections an delete those
			// that have this source.
			array.forEach(this._instance.getConnections(), function(connection){
				if(connection.sourceId == source)
					this._instance.detach(connection);
			}, this);
			// Create new connections
			array.forEach(destinations, function(destination){
				var parse = this._givenModel.getEquation(destination), isSum, isProduct;
				if(parse){
					parse=equation.parse(parse);
					isSum=equation.isSum(parse);
					isProduct=equation.isProduct(parse);
				}

				//check for call from student mode
				if(this._givenModel.getNode(destination)){

					//connectionOverlays code duplicated in setConnections
					var connectionOverlays = graphObjects.getEndPointConfiguration('');
					//if it has multiple inputs  - access input label which matches source
					array.forEach(this._givenModel.getNode(destination).inputs, function(input){
						if(input.ID == source){
							var destinationLabel =input;
							if(destinationLabel.label){
								console.log("------- At this point, we should add a '"+destinationLabel.label+"' label to "+ destinationLabel.ID);
								//check pure sum  or pure product but not both
								if(!(isSum && isProduct)){
									if(isSum && destinationLabel.label=='-'){
										connectionOverlays = graphObjects.getEndPointConfiguration(destinationLabel.label);
									}else if(isProduct && destinationLabel.label=='/'){
										connectionOverlays = graphObjects.getEndPointConfiguration(destinationLabel.label);
									}
								}
							}
							this._instance.connect({source: source, target: destination, overlays:connectionOverlays});
						}

					}, this);
				}else{
					//author mode automatic node connection
					this._instance.connect({source:source, target:destination});
				}
			}, this);
		},

		// Keep track of whether there was a mouseDown and mouseUp
		// with no intervening mouseMove
		_counter: 0,

		onMoveStart: function(){
			this._counter = 0;
		},

		onMove: function(){
			this._counter++;
		},

		onMoveStop: function(){
			//Check to see if the distance the node moved is less than 5 onmousemovement
			if(this._counter <= 5){
				this.onClickNoMove.apply(null, arguments);
			}else {
				this.onClickMoved.apply(null, arguments);
			}
		},

		onClickMoved: function(mover){
			// stub for attaching save new coordinates to model
		},

		onClickNoMove: function(){
			// stub for attaching node editor startup
		},

		setLogging: function(/*string*/ logging){
			this._logging = logging;
		}

	});
});