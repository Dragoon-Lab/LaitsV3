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
            dom.byId("authorSetTimeStart").value = (timeObj.start) ? timeObj.start : 0;
            dom.byId("authorSetTimeEnd").value = (timeObj.end) ? timeObj.end : 10;
            dom.byId("authorSetTimeStep").value = (timeObj.step) ? timeObj.step : 1;
            dom.byId("authorSetTimeStepUnits").value = (timeObj.units) ? timeObj.units : "years";

            dom.byId("authorSetImage").value = (givenModel.getImageURL()) ? givenModel.getImageURL() : "";
            dom.byId("authorSetDescription").value = (givenModel.getTaskDescription()) ? givenModel.getTaskDescription() : "";
        },

        showDescription: function(){

        var canvas = document.getElementById('myCanvas');
            var context = canvas.getContext('2d');
            context.clearRect(0,0,canvas.width, canvas.height);
            var imageObj = new Image();
            var desc_text = this.givenModel.getTaskDescription();

            var scalingFactor = 1;
            var url = this.givenModel.getImageURL();
            if (url) {
                imageObj.src = url;
            }
            else
                console.warn("No image found.  Put clickable box on canvas in author mode?");

            var imageLeft = 30;
            var imageTop = 20;
            var gapTextImage = 50;
            var textLeft = 30;
            var textTop = 50;
            var textWidth = 400;
            var textHeight = 20;

                console.log("Image width is " + imageObj.width);
                if (imageObj.width > 300 || imageObj.width != 0)
                    scalingFactor = 300 / imageObj.width;  //assuming we want width 300
                console.log('Computing scaling factor for image ' + scalingFactor);
                var imageHeight = imageObj.height * scalingFactor;
                context.drawImage(imageObj, imageLeft, imageTop, imageObj.width * scalingFactor, imageHeight);
                var marginTop = (gapTextImage + imageHeight) - textTop;
                if (marginTop < 0)
                    marginTop = 0;

                console.log('computed top margin for text ' + marginTop);

                console.log(context, desc_text,textLeft, textTop + marginTop, textWidth, textHeight);

                wrapText(context, desc_text, textLeft, textTop + marginTop, textWidth, textHeight);

    },

    closeDescriptionEditor: function(){

        this.givenModel.setTaskDescription(dom.byId("authorSetDescription").value);

        var timeObj = {
            start: dom.byId("authorSetTimeStart").value,
            end: dom.byId("authorSetTimeEnd").value,
            step: dom.byId("authorSetTimeStep").value, 
            units: dom.byId("authorSetTimeStepUnits").value
        };

        this.givenModel.setTime(timeObj);

        var imageObj = new Image();
        var height = null;
        var width = null;
        var url = dom.byId("authorSetImage").value;
            if (url) {
                imageObj.src = url;
                var imageJson = {
                    URL: url,
                    width: imageObj.width,
                    height: imageObj.height
                }
                this.givenModel.setImage(imageJson);

            };


        this.showDescription(this.givenModel);
    }});
});

