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
    "./model", "./wraptext"
], function(array, declare, registry, dom, model, wrapText) {

    return declare(null, {

        givenModel: null,
        constructor: function(/*model*/ givenModel){
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
				var errorImage = new Image();
				errorImage.src='images/error.png';
				context.drawImage(errorImage,imageLeft,imageTop,errorImage.width/2,errorImage.height/2);
				context.font = "normal 20px 'Lucida Grande, sans-serif'";
				context.fillStyle= "#1f96db";
				context.fillText("Image not found", errorImage.width/8, imageTop+errorImage.height/1.8);
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
	},

	closeDescriptionEditor: function(){
	    var tin = dom.byId("authorSetDescription").value;
        this.givenModel.setTaskDescription(tin.split("\n"));
	    
        var timeObj = {
		start: dom.byId("authorSetTimeStart").value,
		end: dom.byId("authorSetTimeEnd").value,
		step: dom.byId("authorSetTimeStep").value, 
		units: dom.byId("authorSetTimeStepUnits").value
        };
	    
        this.givenModel.setTime(timeObj);
		var url = dom.byId("authorSetImage").value;
		this.givenModel.setImage(url?{URL: url} : {});
		this.showDescription();
	}

    });
});

