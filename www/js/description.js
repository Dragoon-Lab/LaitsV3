/*global define, Image*/
/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

define([
    "dojo/aspect", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", 
    "dijit/registry", "dojo/dom", "dojo/ready","dojo/dom-style",
    "./model", "./wraptext", "./typechecker"
], function(aspect, array, declare, lang, registry, dom, ready, domStyle, model, wrapText, typechecker){

    // Summary: 
    //          MVC for the description box in author mode
    // Description:
    //          Allows the author to modify the description and the times 
    // Tags:
    //          description box, author mode

    return declare(null, {
        givenModel: null,
        constructor: function(/*model*/ givenModel,/*string*/ activity){
            this.givenModel = givenModel;
            this.timeObj = givenModel.getTime();
            this.bufferDescription = null;
            this._activity=activity;
            this._initHandles();
        },

		initializeAuthorWindow: function(){
			//Read Values from timeObj and place them in description editor
            //We also assign them as previous start, stop times and time step
            dom.byId("authorSetTimeStart").value = this.timeObj.start;
            this.lastStartTime = {value: this.timeObj.start};

            dom.byId("authorSetTimeEnd").value = this.timeObj.end;
            this.lastStopTime = {value: this.timeObj.end};

            //dom.byId("authorSetTimeStep").value = this.timeObj.step;
            this.lastStepTime = {value: this.timeObj.step};
            dom.byId("taskName").value = this.givenModel.getTaskName() || "";
            dom.byId("authorSetTimeStepUnits").value = this.timeObj.units || "seconds";
            dom.byId("authorSetIntegrationMethod").value = this.timeObj.integrationMethod || "Eulers Method";
            dom.byId("authorSetImage").value = this.givenModel.getImageURL() || "";
            dom.byId("authorSetLessonsLearned").value = this.serialize(
                this.givenModel.getTaskLessonsLearned() ? this.givenModel.getTaskLessonsLearned() : ""
            );
            this.bufferDescription = {};
            dom.byId("authorSetDescription").value = this.serialize(
                this.givenModel.getTaskDescription(registry.byId("authorSetDescriptionType").get("value")) ? this.givenModel.getTaskDescription(registry.byId("authorSetDescriptionType").get("value")) : ""  
            );
             // Populating parameter field
            var list=[]; //list of all required parameters[{label: "growth rate",value: "id3"},...]
            paramWidget=registry.byId("authorSetParameters");
            paramDirWidget=registry.byId("authorSetParamDir");

            var increments=this.givenModel.getIncrements(); // increment field in the model: array of Object{label: "growth rate",value: "Increase"}
			//  Generating the list of all the required parameters in the model
            var nodes = this.givenModel.given.getNodes();
			list.push({
				value: "defaultSelect",
				label: "--Select--"
			});
            array.forEach(nodes, function(node){
				if (node.type == "parameter" && this.givenModel.given.isNodeRequired(node.ID)){
					list.push({
						value:node.ID, 
						label:node.name
					});
				}
            }, this);
			
			//setting up the list as the param widget
			paramWidget.set("options", list);

			if(increments.length > 0){
				paramWidget.set("value", increments[0].tweakedNode);	
				paramDirWidget.set("value", increments[0].tweakDirection);
			} else {
				paramWidget.set("value", "defaultSelect");
				paramDirWidget.set("value", "defaultSelect");
			}
			//this._initHandles();
		},

        //set up event handling with UI components
        _initHandles: function() {
            //Define all the variables necessary to fire onchange events and to pop up tooltips
            //for authorSetTimeStart
            var descWidgetStart = registry.byId('authorSetTimeStart');
            //for authorSetTimeStop
            var descWidgetStop = registry.byId('authorSetTimeEnd');
            //for authorSetTimeStep
            //var descWidgetStep = registry.byId('authorSetTimeStep');
            //for authorSetTimeStepUnits
            var descWidgetUnit = registry.byId('authorSetTimeStepUnits');
            // Set checkbox for sharing
            registry.byId("authorProblemShare").attr("value", this.givenModel.getShare());
            var setDescription = registry.byId('authorSetDescription');
            var getActivityType = registry.byId('authorSetDescriptionType');
            // This event gets fired if student hits TAB or input box
            // goes out of focus.
            //for start time field
            descWidgetStart.on("change", lang.hitch(this, function () {
                var ret_start_time = typechecker.checkInitialValue('authorSetTimeStart', this.lastStartTime);
               if (typeof ret_start_time !== "undefined" && ret_start_time.status ) {
                    this.timeObj.start = ret_start_time.value;
                }
            }));
            //for end time field
            descWidgetStop.on("change", lang.hitch(this, function () {
                var ret_stop_time = typechecker.checkInitialValue('authorSetTimeEnd', this.lastStopTime);
                 if (typeof ret_stop_time !== "undefined" && ret_stop_time.status ) {
                    this.timeObj.end = ret_stop_time.value;
                }
            }));
            //for  time step field
            /*descWidgetStep.on("change", lang.hitch(this, function () {
                var ret_step_time = typechecker.checkInitialValue('authorSetTimeStep', this.lastStepTime);
                if (ret_step_time.value) {
                    this.timeObj.step = ret_step_time.value;
                }
            }));*/
            descWidgetUnit.on("change", lang.hitch(this, function(){
                console.log(registry.byId('timeStartUnits'));
                dom.byId('timeStartUnits').innerHTML = descWidgetUnit.value;
                dom.byId('timeEndUnits').innerHTML = descWidgetUnit.value;
            }));
            this._descEditor = registry.byId('authorDescDialog');
            aspect.around(this._descEditor, "hide", lang.hitch(this, function (doHide) {
                var myThis = this;
                return function () {
                    myThis.updateModel();
                    myThis.showDescription();
                    
					//after it has passed all those checks we
                    // do normal closeEditor routine and hide
                    doHide.apply(myThis._descEditor);
                    console.log("close description editor is being called");
                    typechecker.closePops();

                };
            }));
             setDescription.on("change", lang.hitch(this, function(data){
                var activityType = registry.byId("authorSetDescriptionType").get("value");
                var tin = dom.byId("authorSetDescription").value;
                var tin_sanitize = tin.split("\n");
            
                var flag = false;
                tin_sanitize = tin_sanitize.reverse().filter(function(ele, idx, array){
                    if(flag || ele.length > 0) return flag = true;
                });
             
                //this.givenModel.setTaskDescription(tin_sanitize.reverse(), activityType);
                this.bufferDescription[activityType] = tin_sanitize.reverse();
                return;
            }));
            
            getActivityType.on("change", lang.hitch(this,function(event){
             
               var activityValue = getActivityType.get("value");
               //check for the value in buffer
               if(this.bufferDescription[activityValue]) 
                    dom.byId("authorSetDescription").value = this.serialize(
                        this.bufferDescription[activityValue]
                    );
               else
                    dom.byId("authorSetDescription").value = this.serialize(
                            this.givenModel.getTaskDescription(activityValue) ? this.givenModel.getTaskDescription(activityValue) : ""  
                        );
               return; 
            }));
            //for share bit checkbox
            var descCheckButton = registry.byId("authorProblemCheck");
            console.log("descCheckButton",descCheckButton);
            descCheckButton.on("Click", lang.hitch(this, function (checked) {
                //when click event is fired, check if there are any issues with till authored problem
                //if yes alert the issue , else alert every thing is fine just for informational purposes
                if(document.getElementById("authorDescDialog").style.display !== "none")
                {
                    errordialogWidget = registry.byId("solution");
                    errordialogWidget.set("title", "<span>'Problem Check Results'</span>");
                    //check if there are any nodes at all
                    var nodes_exist = this.givenModel.active.getNodes().length;
                    if (nodes_exist) {
                        // we define check_for_problem variable to finally alert if problem is fine
                        var check_for_problem = false;
                        console.log("nodes exist");
                        var newModel = this.givenModel;
                        //checking for incomplete nodes
                        array.forEach(this.givenModel.active.getNodes(), function (node) {
                            if (!newModel.active.isComplete(node.ID)) {
                                errordialogWidget.set("content", "<div>The problem has one or more incomplete nodes.</div>");
                                check_for_problem = true;
                                errordialogWidget.show();
                                console.log("problem is incomplete");
                                return;
                                }
                                console.log("next node");
                            });

                        var check_parent=false;
                        array.forEach(newModel.active.getNodes(), function (node) {
                            console.log("new model type is", newModel.active.getType(node.ID));
                            if(newModel.active.getNode(node.ID).parentNode){
                                check_parent=true;
                                console.log("problem has a root node");
                                return;
                                }
                            });

                            if(!check_parent){
                                console.log("No Root");
                                errordialogWidget.set("content", "<div>Please mark at least one accumulator or function as 'Root'.</div>");
                                errordialogWidget.show();
                                check_for_problem = true;
                            }
                        }
                        else{
                            console.log("Empty problem");
                            errordialogWidget.set("content", "<div style='width: 200px;'>The problem is empty.</div>");
                            errordialogWidget.show();
                            check_for_problem = true;
                        }
                    //finally check if check for problems button couldn't find any new problems
                    if(!check_for_problem){
                        console.log("Problem seems fine, no warnings needed");
                        errordialogWidget.set("content", "<div style='width: 200px;'>No errors found.</div>");
                        errordialogWidget.show();
                    }
                }
            }));
        },

        descDoneHandler:function(){
           console.log("++++++in descDoneHandler");
		},

        // add line breaks
        // use string split method to unserialize
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
        serialize: function(d){
            if(typeof d === "string"){
                return d;
            }else{
                var result = "";
                array.forEach(d, function(x){
                    result += x + "\n";
                });
                return result;
            }
        },
        updateModel : function(){
            var myThis = this;
            //We check the return status and error type for Start Time, Stop Time,Time Step
            // and incase there is an error with a defined type
            // we don't close the description editor and further prompt to fix errors in input
            var ret_start_time = typechecker.checkInitialValue('authorSetTimeStart', myThis.lastStartTime);
            if (ret_start_time.errorType) {
                return;
            }

            var ret_stop_time = typechecker.checkInitialValue('authorSetTimeEnd', myThis.lastStopTime);
            if (ret_stop_time.errorType) {
                return;
            }

            var ret_step_time = 1;
            if (ret_step_time.errorType) {
                return;
            }

            if (! (typeof ret_start_time.value === "undefined")) {
                myThis.timeObj.start = ret_start_time.value;
            }
            if (! (typeof ret_stop_time.value === "undefined")) {
                myThis.timeObj.end = ret_stop_time.value;
            }
            if (! (typeof ret_step_time.value === "undefined")) {
                myThis.timeObj.step = ret_step_time.value;
            }
            domStyle.set("start_end_errorbox","display","none");
            //domStyle.set("timestep_errorbox1","display","none");
            //domStyle.set("timestep_errorbox2","display","none");
            var time_step_max = myThis.timeObj.end-myThis.timeObj.start;
            errorDialogSpan = dom.byId("start_end_errorbox");
            if(!( (myThis.timeObj.start < myThis.timeObj.end) )){
                console.log("start time more than end time");
                domStyle.set(errorDialogSpan,"display","");
                return;
            }
            var tname = dom.byId("taskName").value; 
            myThis.givenModel.setTaskName(tname);
            document.title = "Dragoon - " + tname;
            
            domStyle.set(errorDialogSpan,"display","none");
            var tweaked_node = paramWidget.get("value");
            var tweak_dir = paramDirWidget.get("value");
            //var tin = dom.byId("authorSetDescription").value;
            var ll = dom.byId("authorSetLessonsLearned").value;
            
            
            // sanitize by removing trailing null values
            //var tin_sanitize = tin.split("\n");
            var ll_sanitize = ll.split("\n");
            var flag = false;
            /*tin_sanitize = tin_sanitize.reverse().filter(function(ele, idx, array){
                if(flag || ele.length > 0) return flag = true;
            });
            flag = false;*/
            ll_sanitize = ll_sanitize.reverse().filter(function(ele, idx, array){
                if(flag || ele.length > 0) return flag = true;
            });
         
            //myThis.givenModel.setTaskDescription(tin_sanitize.reverse());
            myThis.givenModel.setTaskLessonsLearned(ll_sanitize.reverse());
            for(var activityType in this.bufferDescription){
                myThis.givenModel.setTaskDescription(this.bufferDescription[activityType], activityType);
            }
            myThis.timeObj.units = dom.byId("authorSetTimeStepUnits").value;
            myThis.timeObj.integrationMethod = dom.byId("authorSetIntegrationMethod").value;
            myThis.givenModel.setTime(myThis.timeObj);
            //this function updates the tweaked node and direction inside the increment field of json
            myThis.givenModel.setIncrements(tweaked_node,tweak_dir);
           
            var url = dom.byId("authorSetImage").value;
            myThis.givenModel.setImage(url ? {URL: url} : {});
            console.log("Model is updated");
        },
        showDescription: function(){
           
            var canvas = dom.byId('myCanvas');
            var context = canvas.getContext('2d');
            context.clearRect(0,0,canvas.width, canvas.height);
            var desc_text = (this.givenModel.getTaskDescription(this._activity)) ? this.givenModel.getTaskDescription(this._activity) : [];
            var descs=[];
            console.log("activity for description:" + this._activity);
            switch(this._activity){
                case "incremental":
                    descs[0]="";
                    descs[1]="One of the parameters of this model has been changed (down or up arrow).  Please click on the incomplete nodes and label them as follows:";
                    descs[2]="* up arrow: quantity will monotonically increase.";
                    descs[3]="* down arrow: quantity will monotonically decrease.";
                    descs[4]="* equal sign: quantity will remain unchanged.";
                    descs[5]="* question mark: quantity will change in some other way over time (e.g. sometimes increase, sometimes decrease).";                
                    break;
                case "incrementalDemo":
                    descs[0]="";
                    descs[1] = "Welcome to a demonstration of a Dragoon Incremental Change activity.  In an Incremental Change activity, we use a completed model to determine how changing the value of one parameter will affect the rest of the quantities in the model.  You will see one of four labels on a node:";
                    descs[2]= "* The up arrow means the quantity will monotonically increase (i.e. will generally be greater and never be less than the original value) because of the change.";
                    descs[3]= "* The down arrow means the quantity will monotonically decrease (i.e. will generally be less than and never be greater than the original value) because of the change.";
                    descs[4]= "* The equals sign means the quantity will remain the same despite the change.";
                    descs[5]= "* The question mark means the quantity will sometimes be greater and sometimes be less than its original value.";
                    descs[6]= "In this model the value of the parameter, "+ this.givenModel.given.getName(this.givenModel.getInitialTweakedNode()) + ", has been "+ this.givenModel.getInitialTweakDirection() +"d. You must now choose the correct label for each of the function and accumulator nodes using the symbols listed above.";
                    descs[7]= "For this demonstration, Dragoon highlight the node you should label next.  When you click on that node, Dragoon will label it for you.  You can then click the \"Show Equation\" button to see why the node was given the label.";
                    break;
                case "executionDemo":
                    descs[0]="";
                    descs[1]="Welcome to a demonstration of Dragoon.  In this activity we use a completed model to show you how Dragoon calculates values for the quantities in the model.  Each shape on the screen is a node representing a quantity:";
                    descs[2]="* Diamonds represent parameters, which have constant values.";
                    descs[3]="* Circles represent functions, whose quantity is a function its inputs (indicated by blue arrows going into the node).";
                    descs[4]="* Squares represent accumulators, whose next value is the sum of its current value and a function its inputs.  In this activity, the current value is written at the top of the node.";
                    descs[5]="At each timestep, Dragoon will calculate the value of every function and accumulator, add them to a table and then graph them.  In this activity, we will step through this process one node at a time.   Click on the highlighted node and Dragoon will compute its value.  Click the \"Show Equation\" button to see the formula used to compute that node.  It should make sense to you.";
                    descs[6]="Repeat this process until Dragoon produces the graphs.";
                    break;
                case "execution":
                    descs[0]="";
                    descs[1]="In this activity we will calculate the values for the quantities in the model.  Recall that each shape on the screen is a node representing a quantity:";
                    descs[2]="* Diamonds represent parameters, which have constant values.";
                    descs[3]="* Circles represent functions, whose quantity is a function its inputs (indicated by blue arrows going into the node).";
                    descs[4]="* Squares represent accumulators, whose next value is the sum of its current value and a function its inputs.  In this activity, the current value is written at the top of the node.";
                    descs[5]="At each timestep, Dragoon will calculate the value of every function and accumulator, add them to a table and then graph them.  In this activity, we will step through this process one node at a time and fill in the nodes ourselves.";
                    descs[6]="Click on an incomplete node (one with a dashed border) and choose the correct value.  You may click the \"Show Equation\" button to see the formula used to compute the quantity of the node.  You may find it easier to start with the nodes which have values for all of their inputs.";
                    descs[7]="Tip: When a nodes input is coming from an accumulator, use its current value (the top number) in the calculation, rather than its new value.";
                    descs[8]="Repeat this process until Dragoon produces the graphs.";
                    break;
            }
            if (descs.length != 0){
                array.forEach(descs,function(d){
                    desc_text.push(d);
                });
            }

            var imageLeft = 30;
            var imageTop = 20;
            var imageHeight = 0;  // default in case there is no image
            var gapTextImage = 30;
            var textLeft = 30;
            var textTop = 50;
            var textWidth = 400;
            var textHeight = 20;

            // Layout text
            // This routine should go in wrapText.js
            var showText = function(){
              
                var marginTop = Math.max(gapTextImage + imageHeight + imageTop, textTop);

                // Set font for description text
                context.font = "normal 13px Arial";
                wrapText(context, desc_text, textLeft, marginTop, textWidth, textHeight);
            };

            var url = this.givenModel.getImageURL();
            var imageObj = new Image();
            var height = null;
            var width = null;
            if(url){
               

  
                // Can't compute layout unless image is downloaded
                // The model can also provide dimensions.  If it does, then
                // we can layout the text immediately
                imageObj.onload = function(){
                    console.log("Image width is " + imageObj.width);
                    // Rescale image size, while maintaining aspect ratio,
                    // assuming we want max width 300
                   
                    var scalingFactor = imageObj.width > 300 ? 300 / imageObj.width : 1.0;
                    console.log('Computing scaling factor for image ' + scalingFactor);
                    imageHeight = imageObj.height * scalingFactor;
                    context.drawImage(imageObj, imageLeft, imageTop, imageObj.width * scalingFactor, imageHeight);                   
                    context.fillStyle = "#000";
                    showText();
                };
                imageObj.onerror = function() {
                    context.font = "normal 20px 'Lucida Grande, sans-serif'";
                    context.fillStyle= "#1f96db";
                    context.fillText("Image not found", imageLeft, imageTop);
                    showText();
                };
                imageObj.src = url;
               
            }else{
                context.fillStyle = "#000";
                showText();
            }
        }

    });
});
