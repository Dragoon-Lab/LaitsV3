/* global define, jsPlumb */
/*
            This is just a quick initial attempt to draw a model
*/
define([
    "dojo/_base/array", "dojo/dom-construct", "jsPlumb/jsPlumb"
],function(array, domConstruct){

        return declare(null, {

        constructor: function(givenModel){

            jsPlumb.ready(function() {

                // setup some defaults for jsPlumb.
                var instance = jsPlumb.getInstance({
                    Endpoint : ["Dot", {radius:2}],
                        HoverPaintStyle : {strokeStyle:"#1e8151", lineWidth:2 },
                    ConnectionOverlays : [
                                [ "Arrow", {
                                    location:1,
                                    id:"arrow",
                                    length:14,
                                    foldback:0.8
                                } ],
                        [ "Label", { label:"FOO", id:"label", cssClass:"aLabel" }]
                    ],
                    Container:"statemachine-demo"
                });

                var shapes = {
                    accumulator: "accumulator",
                    function: "function",
                    parameter: "parameter"
                };

                var vertices = array.map(givenModel.getStudentNodes(),function(node){
                    var type = node.studentSelections.type;
/*
                <div class="w" id="population" ></br></br>120</br></br></br></br></br></br>Population</div>
                <div class="circle" id="growth" ></br></br>*</br></br></br></br></br></br>Growth</div>
                <div class="diamond" id="grate" ><div class="diamond-inner"></br></br>0.3</br></br></br></br></br></br>Growth Rate</label><br/></div></div>
*/
                    console.log("Adding element to canvas, id = ", node.ID, ", class = ", type);
                    // Add div to drawing
                    domConstruct.create("div", {id: node.ID, 'class': type}, "statemachine-demo");
                    // jsPlumb.addEndpoint(node.ID);
                    return jsPlumb.getSelector(".statemachine-demo ." + type); // maybe node.ID instead?
                });

                // initialise draggable elements.
                array.forEach(vertices, function(vertex){
                    instance.draggable(vertex);
                });

                console.log("====== instance:  ", instance);


                // bind a click listener to each connection; the connection is deleted. you could of course
                // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
                // happening.
                instance.bind("click", function(c) {
                        //instance.detach(c);
                });

                // bind a connection listener. note that the parameter passed to this function contains more than
                // just the new connection - see the documentation for a full list of what is included in 'info'.
                // this listener sets the connection's internal
                // id as the label overlay's text.
                instance.bind("connection", function(info) {
                    info.connection.getOverlay("label").setLabel(info.connection.id);
                });

                // suspend drawing and initialise.
                instance.doWhileSuspended(function() {

                    // make each ".ep" div a source and give it some parameters to work with.  here we tell it
                    // to use a Continuous anchor and the StateMachine connectors, and also we give it the
                    // connector's paint style.  note that in this demo the strokeStyle is dynamically generated,
                    // which prevents us from just setting a jsPlumb.Defaults.PaintStyle.  but that is what i
                    // would recommend you do. Note also here that we use the 'filter' option to tell jsPlumb
                    // which parts of the element should actually respond to a drag start.
                    array.forEach(vertices,function(vertex){
                        instance.makeSource(vertex, {
                            filter:".ep",                               // only supported by jquery
                            anchor:"Continuous",
                            connector:[ "StateMachine", { curviness:20 } ],
                            connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 },
                            maxConnections:5,
                            onMaxConnections:function(info, e) {
                                alert("Maximum connections (" + info.maxConnections + ") reached");
                            }
                        });
                    });

                    // initialise all '.w' elements as connection targets.
                    array.forEach(vertices,function(vertex){
                        instance.makeTarget(vertex, {
                            dropOptions:{ hoverClass:"dragHover" },
                            anchor:"Continuous"
                        });
                    });

                    var inputs;
                    array.forEach(vertices, function(vertex){
                        inputs=givenModel.getInputNodes(vertex);
                        array.forEach(inputs, function(input){
                            instance.connect({source: input, target: vertex});
                        })

                    })

                    // and finally, make a couple of connections
                   // instance.connect({ source:"population", target:"growth" });
                    //instance.connect({ source:"grate", target:"growth" });
                    //instance.connect({ source:"growth", target:"population" });

                });

            });
        }
});