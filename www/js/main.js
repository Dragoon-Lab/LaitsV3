/* global define, Image */
define([
    'dojo/_base/lang',
    "dojo/dom",
    'dojo/dom-geometry',
    "dojo/on",
    'dojo/aspect',
    "dojo/io-query",
    "dojo/ready",
    'dijit/registry',
    "./menu",
    "./load-save",
    "./model",
    "./RenderGraph", "./RenderTable", "./wraptext",
    "./con-student", './con-author',
    "parser/parser",
    "./draw-model",
    "./calculations",
    "./logging"
], function(
        lang, dom, geometry, on, aspect, ioQuery, ready, registry,
        menu, loadSave, model,
        Graph, Table, wrapText, controlStudent, controlAuthor, Parser, drawmodel, calculations, logging
        ){

    console.log("load main.js");

    // Get session parameters
    var query = {};
    if(window.location.search){
        query = ioQuery.queryToObject(window.location.search.slice(1));
    }else {
        console.warn("Should have method for logging this to Apache log files.");
        console.warn("Dragoon log files won't work since we can't set up a session.");
        console.error("Function called without arguments");
    }

    // Start up new session and get model object from server
    var session = new loadSave(query);
    logging.setSession(session);  // Give logger message destination
    session.loadProblem(query).then(function(solutionGraph){

        var givenModel = new model(query.m, query.p);
        logging.session.log('open-problem',{problem : givenModel.getTaskName()});
        if(solutionGraph){
            givenModel.loadModel(solutionGraph);
        }

        /*
         start up controller
         */

        /* 
         The sub-mode of STUDENT mode can be either "feedback" or "power"
         This is eventually supposed to be supplied by the student model.
         In the mean time, allow it as a GET parameter.
         */
        var subMode = query.sm || "feedback";
        /* In principle, we could load just one controller or the other. */
            var controllerObject = query.m == 'AUTHOR' ? new controlAuthor(query.m, subMode, givenModel, query.is) :
                new controlStudent(query.m, subMode, givenModel, query.is);
        if(controllerObject._PM)
            controllerObject._PM.setLogging(session);  // Set up direct logging in PM

        ready(function(){

            var drawModel = new drawmodel(givenModel.active);

            /* add "Create Node" button to menu */
            menu.add("createNodeButton", function(){
                var id = givenModel.active.addNode();
                drawModel.addNode(givenModel.active.getNode(id));
                controllerObject.showNodeEditor(id);
            });

            /*
             Connect node editor to "click with no move" events.
             */
            aspect.after(drawModel, "onClickNoMove", function(mover){
                if(mover.mouseButton != 2) //check if not right click
                    controllerObject.showNodeEditor(mover.node.id);
            }, true);

            /* 
             After moving node, save coordinates to model, and autosave
             */
            aspect.after(drawModel, "onClickMoved", function(mover){
                var g = geometry.position(mover.node, true);  // take into account scrolling
                console.log("Update model coordinates for ", mover.node.id, g);
                console.warn("This should take into account scrolling, Bug #2300.");
                givenModel.active.setPosition(mover.node.id, {"x": g.x, "y": g.y});
                // It would be more efficient if we only saved the changed node.
                session.saveProblem(givenModel.model);   // Autosave to server
            }, true);

            /*
             Add connection when inputs are updated
             */
            aspect.after(controllerObject, 'addQuantity',
                    lang.hitch(drawModel, drawModel.addQuantity), true);
            aspect.after(controllerObject, 'setConnections',
                    lang.hitch(drawModel, drawModel.setConnections), true);

            /*
             Autosave on close window
             It would be more efficient if we only saved the changed node.
             
             Connecting to controllerObject.closeEditor causes a race condition
             with code in controllerObject._setUpNodeEditor that wires up closeEditor.
             Instead, we connect directly to the widget.
             */
            aspect.after(registry.byId('nodeeditor'), "hide", function(){
                console.log("Calling session.saveProblem");
                session.saveProblem(givenModel.model);
            });

            // Wire up close button...
            // This will trigger the above session.saveProblem()
            on(registry.byId("closeButton"), "click", function(){
                registry.byId("nodeeditor").hide();
            });

            /*
             Make model solution plot using dummy data. 
             This should be put in its own module.
             */


            // show graph when button clicked
             menu.add("graphButton", function(){
                console.debug("button clicked");
                // instantiate graph object
                var graph = new Graph(givenModel, query.m);
                graph.show();
            });


            // show table when button clicked
            menu.add("tableButton", function(){
                console.debug("table button clicked");
                var table = new Table(givenModel, query.m);
                table.show();
            });


           menu.add("doneButton", function(){
               console.debug("done button is clicked");
               window.history.back();


           });


            /*
             BvdS:  this doesn't look quite right.  We want to download
             the image and then get its dimensions.  (This is a property of 
             the image object) and use the dimensions to place the description
             
             In AUTHOR mode, make image clickable or put in "click here" box.
             Also, make description clickable, with default text "click here".
             These will be wired up to dialog boxes to set the image URL and
             the description.
             */
            var canvas = dom.byId('myCanvas');
	    if(canvas.getContext){
		var context = canvas.getContext('2d');
	    }else {
		throw new Error("Canvas not supported on this browser.");
	    }
            var imageObj = new Image();
            var desc_text = givenModel.getTaskDescription();
            var scalingFactor = 1;
            var url = givenModel.getImageURL();
            if(url){
                imageObj.src = url;
            }
            else
                console.warn("No image found.  Put clickable box on canvas in author mode?");

            var imageLeft = 30;
            var imageTop = 20;
            var gapTextImage = 50;
            var textLeft = 30;
            var textTop = 300;
            var textWidth = 400;
            var textHeight = 20;


            imageObj.onload = function(){
                console.log("Image width is " + imageObj.width);
                if(imageObj.width > 300 || imageObj.width != 0)
                    scalingFactor = 300 / imageObj.width;  //assuming we want width 300
                console.log('Computing scaling factor for image ' + scalingFactor);
                var imageHeight = imageObj.height * scalingFactor;
                context.drawImage(imageObj, imageLeft, imageTop, imageObj.width * scalingFactor, imageHeight);
                var marginTop = (gapTextImage + imageHeight) - textTop;
                if(marginTop < 0)
                    marginTop = 0;

                console.log('computed top margin for text ' + marginTop);

                wrapText(context, desc_text, textLeft, textTop + marginTop, textWidth, textHeight);
            };

        });
    });
});


