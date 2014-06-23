jsPlumb.ready(function(){			
		
	var instance = jsPlumb.getInstance({
		DragOptions : { cursor: "pointer", zIndex:2000 },
		HoverClass:"connector-hover"
	});

	var connectorStrokeColor = "rgba(50, 50, 200, 1)",
		connectorHighlightStrokeColor = "rgba(180, 180, 200, 1)",
		hoverPaintStyle = { strokeStyle:"#7ec3d9" };			// hover paint style is merged on normal style, so you 
	                                                        // don't necessarily need to specify a lineWidth			

	// 
	// connect window1 to window2 with a 13 px wide olive colored Bezier, from the BottomCenter of 
	// window1 to 3/4 of the way along the top edge of window2.  give the connection a 1px black outline,
	// and allow the endpoint styles to derive their color and outline from the connection.
	// label it "Connection One" with a label at 0.7 of the length of the connection, and put an arrow that has a 50px
	// wide tail at a point 0.2 of the length of the connection.  we use 'cssClass' and 'endpointClass' to assign
	// our own css classes, and the Label overlay has three css classes specified for it too.  we also give this
	// connection a 'hoverPaintStyle', which defines the appearance when the mouse is hovering over it. 
	//
	var connection1 = {
		//source:"maine", 
	   	//target:"menu", 			   	
		connector:["Bezier", { curviness:70 }],
	   	cssClass:"c1",
	   	endpoint:"Blank",
	        endpointClass:"c1Endpoint",

	        anchors:["Left", "Right"],
	   	paintStyle:{ 
			lineWidth:6,
			strokeStyle:"#a7b04b",
			outlineWidth:1,
			outlineColor:"#666"
		},
		endpointStyle:{ fillStyle:"#a7b04b" },
	   	hoverPaintStyle:hoverPaintStyle,			   
	   	overlays : [
			["Label", {													   					
				cssClass:"l1 component label",
				 
				location:0.7,
				id:"label",
				events:{
					"click":function(label, evt) {
						alert("clicked on label for connection " + label.component.id);
					}
				}
			}],
			["Arrow", {
				cssClass:"l1arrow",
				id:"arrow",
				location:0.5, width:10,length:20,
				events:{
					"click":function(arrow, evt) {
						alert("clicked on arrow for connection " + arrow.component.id);
					}
				}
			}]
		]
	};
        //Connections from main.js (the connectsions are reversed in the code for aesthetic purposes)
        instance.connect({
		source:"menu",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"description",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"RenderGraph",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"RenderTable",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"drawmodel",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"state",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"con-author",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"logging",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"con-student",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"load-save",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"model",
		target:"maine"
	}, connection1);
        instance.connect({
		source:"equation",
		target:"maine"
	}, connection1);
            
        //Connections from description.js
        instance.connect({
		source:"wraptext",
		target:"description"
	}, connection1);
    
        //Connections from RenderGraph.js
        instance.connect({
		source:"calculations",
		target:"RenderGraph"
	}, connection1);
        
        //Connections from RenderTable.js
        instance.connect({
		source:"calculations",
		target:"RenderTable"
	}, connection1);
        
        //Connections from draw-model.js
        instance.connect({
		source:"equation",
		target:"drawmodel"
	}, connection1);
        instance.connect({
		source:"graph-objects",
		target:"drawmodel"
	}, connection1);
        
        //Connections from con-author.js
        instance.connect({
		source:"equation",
		target:"con-author"
	}, connection1);
        instance.connect({
		source:"controller",
		target:"con-author"
	}, connection1);
        
        //Connections from logging.js
        instance.connect({
		source:"pedagogical_module",
		target:"logging"
	}, connection1);
        instance.connect({
		source:"controller",
		target:"logging"
	}, connection1);
        instance.connect({
		source:"model",
		target:"logging"
	}, connection1);
    
        //Connections from con-student.js
        instance.connect({
		source:"pedagogical_module",
		target:"con-student"
	}, connection1);
        instance.connect({
		source:"controller",
		target:"con-student"
	}, connection1);
    
        //Connections from controller.js
        instance.connect({
		source:"graph-objects",
		target:"controller"
	}, connection1);
            instance.connect({
		source:"equation",
		target:"controller"
	}, connection1);
    
        //Connections from pedagogical_module.js
        instance.connect({
		source:"equation",
		target:"pedagogical_module"
	}, connection1);
        
        //Connections from calculations.js
        instance.connect({
		source:"integrate",
		target:"calculations"
	}, connection1);
        instance.connect({
		source:"equation",
		target:"calculations"
	}, connection1);
    
        //Connections from graph-objects.js
        instance.connect({
		source:"equation",
		target:"graph-objects"
	}, connection1);
        
        //Connections from equation.js
        instance.connect({
		source:"parser",
		target:"equation"
	}, connection1);


	// jsplumb event handlers

	// double click on any connection 
	instance.bind("dblclick", function(connection, originalEvent) { alert("double click on connection from " + connection.sourceId + " to " + connection.targetId); });
	// single click on any endpoint
	instance.bind("endpointClick", function(endpoint, originalEvent) { alert("click on endpoint on element " + endpoint.elementId); });
	// context menu (right click) on any component.
	instance.bind("contextmenu", function(component, originalEvent) {
        alert("context menu on component " + component.id);
        originalEvent.preventDefault();
        return false;
    });
	
	// make all .window divs draggable. note that here i am just using a convenience method - getSelector -
	// that enables me to reuse this code across all three libraries. In your own usage of jsPlumb you can use
	// your library's selector method - "$" for jQuery, "$$" for MooTools, "Y.all" for YUI3.
	instance.draggable(jsPlumb.getSelector(".window"), { containment:".demo"});    

	jsPlumb.fire("jsPlumbDemoLoaded", instance);
});	


