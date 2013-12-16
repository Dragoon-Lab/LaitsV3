	jsPlumb.ready(function() {

		var instance = jsPlumb.getInstance({
			// default drag options
			DragOptions : { cursor: 'pointer', zIndex:2000 },
			// the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
			// case it returns the 'labelText' member that we set on each connection in the 'init' method below.
			ConnectionOverlays : [
				[ "Arrow", { location:1 } ],
				[ "Label", { 
					location:0.1,
					id:"label",
					cssClass:"aLabel"
				}],
				["Custom", {
               create:function(component) {
                   var img = document.createElement("img");
                                       img.setAttribute('src','upArrow.png');
                                       img.setAttribute('width','25');
                                       img.setAttribute('height','26');
                                       return img;
               }}]
			],
			Container:"flowchart-demo"
		});

		
		var instance1 = jsPlumb.getInstance({
			// default drag options
			DragOptions : { cursor: 'pointer', zIndex:2000 },
			// the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
			// case it returns the 'labelText' member that we set on each connection in the 'init' method below.
			ConnectionOverlays : [
				[ "Arrow", { location:1 } ],
				["Custom", {
               create:function(component) {
                   var img = document.createElement("img");
                                       img.setAttribute('src','upArrow.png');
                                       img.setAttribute('width','25');
                                       img.setAttribute('height','26');
                                       return img;
               }}]
			],
			Container:"flowchart-demo1"
		});
		

		// this is the paint style for the connecting lines..
		var connectorPaintStyle = {
			lineWidth:4,
			strokeStyle:"#61B7CF",
			joinstyle:"round",
			outlineColor:"white",
			outlineWidth:2
		},
		// .. and this is the hover style. 
		connectorHoverStyle = {
			lineWidth:4,
			strokeStyle:"#216477",
			outlineWidth:2,
			outlineColor:"white"
		},
		endpointHoverStyle = {
			fillStyle:"#216477",
			strokeStyle:"#216477"
		},
		// the definition of source endpoints (the small blue ones)
		sourceEndpoint = {
			endpoint:"Dot",
			paintStyle:{ 
				strokeStyle:"#7AB02C",
				fillStyle:"transparent",
				radius:7,
				lineWidth:3 
			},				
			isSource:true,
			connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],								                
			connectorStyle:connectorPaintStyle,
			hoverPaintStyle:endpointHoverStyle,
			connectorHoverStyle:connectorHoverStyle,
            dragOptions:{},
            
		},		
		// the definition of target endpoints (will appear when the user drags a connection) 
		targetEndpoint = {
			endpoint:"Dot",					
			paintStyle:{ fillStyle:"#7AB02C",radius:11 },
			hoverPaintStyle:endpointHoverStyle,
			maxConnections:-1,
			dropOptions:{ hoverClass:"hover", activeClass:"active" },
			connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],								                
			connectorStyle:connectorPaintStyle,
			isTarget:true,			
            /*overlays:[
            	[ "Label", { location:[0.5, -0.5], label:"Drop", cssClass:"endpointTargetLabel" } ]
            ]*/
		};			

		var _addEndpoints = function(toId, sourceAnchors, targetAnchors,instance) {
				for (var i = 0; i < sourceAnchors.length; i++) {
					var sourceUUID = toId + sourceAnchors[i];
					instance.addEndpoint("flowchart" + toId, sourceEndpoint, { anchor:sourceAnchors[i], uuid:sourceUUID });						
				}
				for (var j = 0; j < targetAnchors.length; j++) {
					var targetUUID = toId + targetAnchors[j];
					instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor:targetAnchors[j], uuid:targetUUID });						
				}
			};
			
			
			// suspend drawing and initialise.
		instance1.doWhileSuspended(function() {
			//Second Example
			
			_addEndpoints("Window4", ["RightMiddle"], ["TopCenter","BottomCenter"],instance1);
			_addEndpoints("Window5", ["LeftMiddle","TopCenter","BottomCenter"], ["LeftMiddle","RightMiddle"],instance1);
			_addEndpoints("Window6", ["LeftMiddle","RightMiddle"],[],instance1);
			_addEndpoints("Window7", ["LeftMiddle"], ["TopCenter","BottomCenter","RightMiddle"],instance1);
			_addEndpoints("Window8", ["LeftMiddle"], ["TopCenter","RightMiddle"],instance1);
			_addEndpoints("Window9", ["LeftMiddle"], [],instance1);
			
			
			// listen for new connections; initialise them the same way we initialise the connections at startup.
			instance1.bind("connection", function(connInfo, originalEvent) { 
				init(connInfo.connection);
			});	
			
			
			
			instance1.connect({uuids:["Window4RightMiddle", "Window5LeftMiddle"], editable:true});
			instance1.connect({uuids:["Window6LeftMiddle", "Window4TopCenter"], editable:true});
			instance1.connect({uuids:["Window5BottomCenter", "Window4BottomCenter"], editable:true});
			instance1.connect({uuids:["Window5BottomCenter", "Window4BottomCenter"], editable:true});
			instance1.connect({uuids:["Window6RightMiddle", "Window7TopCenter"], editable:true});
			instance1.connect({uuids:["Window5BottomCenter", "Window7BottomCenter"], editable:true});
			instance1.connect({uuids:["Window7LeftMiddle", "Window5RightMiddle"], editable:true});
			instance1.connect({uuids:["Window5TopCenter", "Window8TopCenter"], editable:true});
			instance1.connect({uuids:["Window8LeftMiddle", "Window7RightMiddle"], editable:true});
			instance1.connect({uuids:["Window9LeftMiddle", "Window8RightMiddle"], editable:true});
			
			
			// make all the window divs draggable						
			instance1.draggable(jsPlumb.getSelector(".flowchart-demo .window "), { grid: [20, 20] });		
			instance1.draggable(jsPlumb.getSelector(".diamond"), { grid: [20, 20] });
			instance1.draggable(jsPlumb.getSelector(".circle"), { grid: [20, 20] });	
			
		
			});	

		// suspend drawing and initialise.
		instance.doWhileSuspended(function() {

		
			//Exponential Growth and Decay
			
			_addEndpoints("Window1", ["TopCenter","RightMiddle"], ["TopCenter"],instance);			
			_addEndpoints("Window2", ["TopCenter"], ["LeftMiddle","RightMiddle"],instance);
			_addEndpoints("Window3", ["LeftMiddle"], [],instance);
			
					
						
			// make all the window divs draggable						
			instance.draggable(jsPlumb.getSelector(".flowchart-demo .window "), { grid: [20, 20] });		
			instance.draggable(jsPlumb.getSelector(".diamond"), { grid: [20, 20] });
			instance.draggable(jsPlumb.getSelector(".circle"), { grid: [20, 20] });	
			
			// THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector 
			// method, or document.querySelectorAll:
			//jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });
	        
			// connect a few up
			instance.connect({uuids:["Window1RightMiddle", "Window2LeftMiddle"], editable:true});
			instance.connect({uuids:["Window2TopCenter", "Window1TopCenter"], editable:true});
			instance.connect({uuids:["Window3LeftMiddle", "Window2RightMiddle"], editable:true});
			
			instance.bind("click", function(conn, originalEvent) {
				if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
					jsPlumb.detach(conn); 
			});	
			
			instance.bind("connectionDrag", function(connection) {
				console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
			});		
			
			instance.bind("connectionDragStop", function(connection) {
				console.log("connection " + connection.id + " was dragged");
			});

			instance.bind("connectionMoved", function(params) {
				console.log("connection " + params.connection.id + " was moved");
			});
		});
		
	});