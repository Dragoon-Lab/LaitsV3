/* global define, Image */
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
    "dojo/_base/array", "dojo/_base/declare",
    "dijit/registry", "dojo/dom",
    "./model", "./wraptext","dojo/on","dojo/ready","dojo/_base/lang","./typechecker",'dojo/aspect'
], function(array, declare, registry, dom, model, wrapText, on, ready, lang, typechecker, aspect) {

    return declare(null, {

        givenModel: null,
        constructor: function(/*model*/ givenModel){
            console.log("registry",registry);
            this.givenModel = givenModel;
            var timeObj = givenModel.getTime();
            dom.byId("authorSetTimeStart").value = timeObj.start;
            dom.byId("authorSetTimeEnd").value = timeObj.end;
            dom.byId("authorSetTimeStep").value = timeObj.step;
            dom.byId("authorSetTimeStepUnits").value = timeObj.units || "seconds";

            dom.byId("authorSetImage").value = givenModel.getImageURL() || "";
            dom.byId("authorSetDescription").value = this.serialize(
		    givenModel.getTaskDescription() ? givenModel.getTaskDescription() : ""

	     );
            ready(this, this._initHandles);
        },
     descControlMap : {
         setTimeStart: "authorSetTimeStart",
         setTimeStep: "authorSetTimeStep",
         setTimeStop: "authorSetTimeEnd"
     },

      widgetMap: {
            crisisAlert: 'crisisAlertMessage'
      },
        //set up event handling with UI components
        _initHandles: function() {
            //Define all the variables necessary to fire onchange events and to pop up tooltips
           //for authorSetTimeStart
            var descWidgetStart = registry.byId(this.descControlMap.setTimeStart);
            var descWidgetStart1 = dom.byId(this.descControlMap.setTimeStart);
            //for authorSetTimeStop
            var descWidgetStop = registry.byId(this.descControlMap.setTimeStop);
            var descWidgetStop1 = dom.byId(this.descControlMap.setTimeStop);
            //for authorSetTimeStep
            var descWidgetStep = registry.byId(this.descControlMap.setTimeStep);
            var descWidgetStep1 = dom.byId(this.descControlMap.setTimeStep);

            // This event gets fired if student hits TAB or input box
            // goes out of focus.
            //for Start Time Field
            var ret_start_time={ 'status': true};
            var ret_stop_time={ 'status': true};
            var ret_step_time={ 'status': true};
            console.log(ret_start_time);
            descWidgetStart.on('change', lang.hitch(this, function(){
                var initial_start_time=dom.byId(this.descControlMap.setTimeStart).value;
              ret_start_time=typechecker.checkInitialValue(initial_start_time,100,descWidgetStart1,"Description Time Start");
              console.log("returned",ret_start_time);
            }));

            //for End Time Field

            descWidgetStop.on('change', lang.hitch(this, function(){

                var initial_stop_time=dom.byId(this.descControlMap.setTimeStop).value;
                console.log(ret_start_time);
                 ret_stop_time=typechecker.checkInitialValue(initial_stop_time,100,descWidgetStop1, "Description Time End");
            }));
            //for Time Step Field
            descWidgetStep.on('change', lang.hitch(this, function(){
                var initial_step_time=dom.byId(this.descControlMap.setTimeStep).value;
                ret_step_time=typechecker.checkInitialValue(initial_step_time,100,descWidgetStep1, "Description Time Step");
            }));
            this._descEditor = registry.byId('authorDescDialog');

            aspect.around(this._descEditor, "hide", lang.hitch(this, function(doHide){
                var myThis = this;
                console.log("this",this);
                return function(){
                    var equation = registry.byId("equationBox");
                    console.log(ret_start_time);
                    var crisis = registry.byId("crisisAlertMessage");
                    var crisisMessage = dom.byId('crisisMessage');
                    var initial_start_time=dom.byId(myThis.descControlMap.setTimeStart).value;
                    var initial_stop_time=dom.byId(myThis.descControlMap.setTimeStop).value;
                    var initial_step_time=dom.byId(myThis.descControlMap.setTimeStep).value;
                    if(isNaN(+initial_start_time) || isNaN(+initial_stop_time) || isNaN(+initial_step_time) ){
                            console.log("crisis alert message ", "Check For Non-Numeric Times");
                            crisisMessage.innerHTML = "Check For Non-Numeric Times";
                            crisis.show();
                    }
                    else{
                        // Else, do normal closeEditor routine and hide
                        ret_start_time=typechecker.checkInitialValue(initial_start_time,100,descWidgetStart1,"Description Time Start");
                        ret_stop_time=typechecker.checkInitialValue(initial_stop_time,100,descWidgetStop1, "Description Time End");
                        ret_step_time=typechecker.checkInitialValue(initial_step_time,100,descWidgetStep1, "Description Time Step");
                        doHide.apply(myThis._descEditor);
                        console.log("close description editor is being called");
                        typechecker.closePops();
                        var tin = dom.byId("authorSetDescription").value;
                        myThis.givenModel.setTaskDescription(tin.split("\n"));
                        var timeObj = {
                            start: ret_start_time.value,
                            end: ret_stop_time.value,
                            step: ret_step_time.value,
                            units: dom.byId("authorSetTimeStepUnits").value
                        };
                        myThis.givenModel.setTime(timeObj);
                        var url = dom.byId("authorSetImage").value;
                        myThis.givenModel.setImage(url?{URL: url} : {});
                        myThis.showDescription();
                    }
                };
            }));


        },



	// add line breaks
	// use string split method to unserialize
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
	  serialize: function(d){
	    if(typeof d === "string"){
		return d;
	    } else {
		var result="";
		array.forEach(d, function(x){
		    result += x + "\n";
		});
		return result;
	    }
	},

    showDescription: function(){

        var canvas = dom.byId('myCanvas');
        var context = canvas.getContext('2d');
        context.clearRect(0,0,canvas.width, canvas.height);
        var desc_text = this.givenModel.getTaskDescription();

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
        if (url) {
			imageObj.onerror = function() {
				context.font = "normal 20px 'Lucida Grande, sans-serif'";
				context.fillStyle= "#1f96db";
				context.fillText("Image not found", imageLeft, imageTop);
				showText();
	    		  };

            imageObj.src = url;
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
				showText();
			};
	    }else{
			showText();
	    }
	}
    });
});
