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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

define([
    "dojo/aspect", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang",
    "dijit/registry", "dojo/dom", "dojo/ready", 'dojo/keys',
    "./model", "./wraptext", "./time-checker"
], function (aspect, array, declare, lang, registry, dom, ready, keys, model, wrapText, typechecker) {

    // Summary:
    //			MVC for the description box in author mode
    // Description:
    //			Allows the author to modify the description and the times
    // Tags:
    //			description box, author mode

    return declare(null, {
        givenModel: null,
        constructor: function (/*model*/ givenModel) {
            this.givenModel = givenModel;
            this.timeObj = givenModel.getTime();
            //Read Values from timeObj and place them in description editor
            //We also assign them as previous start, stop times and time step
            dom.byId("authorSetTimeStart").value = this.timeObj.start;
            this.lastStartTime = {value: this.timeObj.start};

            dom.byId("authorSetTimeEnd").value = this.timeObj.end;
            this.lastStopTime = {value: this.timeObj.end};

            dom.byId("authorSetTimeStep").value = this.timeObj.step;
            this.lastStepTime = {value: this.timeObj.step};

            dom.byId("authorSetTimeStepUnits").value = this.timeObj.units || "seconds";
            dom.byId("authorSetImage").value = givenModel.getImageURL() || "";
            dom.byId("authorSetDescription").value = this.serialize(
                givenModel.getTaskDescription() ? givenModel.getTaskDescription() : ""
            );
            ready(this, this._initHandles);
        },

        //set up event handling with UI components
        _initHandles: function () {
            //Define all the variables necessary to fire onchange events and to pop up tooltips
            //for authorSetTimeStart
            var descWidgetStart = registry.byId('authorSetTimeStart');
            //for authorSetTimeStop
            var descWidgetStop = registry.byId('authorSetTimeEnd');
            //for authorSetTimeStep
            var descWidgetStep = registry.byId('authorSetTimeStep');

            // This event gets fired if student hits TAB or input box
            // goes out of focus.
            //for start time field
            descWidgetStart.on("change", lang.hitch(this, function () {
                var ret_start_time = typechecker.checkInitialValue('authorSetTimeStart', this.lastStartTime);
                if (ret_start_time.status) {
                    this.timeObj.start = ret_start_time.value;
                }
            }));
            //for end time field
            descWidgetStop.on("change", lang.hitch(this, function () {
                var ret_stop_time = typechecker.checkInitialValue('authorSetTimeEnd', this.lastStopTime);
                if (ret_stop_time.status) {
                    this.timeObj.end = ret_stop_time.value;
                }
            }));
            //for  time step field
            descWidgetStep.on("change", lang.hitch(this, function () {
                var ret_step_time = typechecker.checkInitialValue('authorSetTimeStep', this.lastStepTime);
                if (ret_step_time.status) {
                    this.timeObj.step = ret_step_time.value;
                }
            }));
            //The following event handles incase enter button is pressed in  time step field
            array.forEach(['authorSetTimeStart', 'authorSetTimeEnd', 'authorSetTimeStep'], function (param) {
                paramid = registry.byId(param);
                paramid.on("keydown", function (evt) {
                    // console.log("----------- input character ", evt.keyCode, this.get('value'));
                    if (evt.keyCode == keys.ENTER)
                        this.emit('Change', {}, [this.get('value')]);
                });
            }, this);

            this._descEditor = registry.byId('authorDescDialog');
            aspect.around(this._descEditor, "hide", lang.hitch(this, function (doHide) {
                var myThis = this;
                return function () {
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

                    var ret_step_time = typechecker.checkInitialValue('authorSetTimeStep', myThis.lastStepTime);
                    if (ret_step_time.errorType) {
                        return;
                    }

                    //after it has passed all those checks we
                    // do normal closeEditor routine and hide
                    console.log("close description editor is being called");
                    typechecker.closePops();
                    var tin = dom.byId("authorSetDescription").value;
                    myThis.givenModel.setTaskDescription(tin.split("\n"));
                    if (ret_start_time.status) {
                        myThis.timeObj.start = ret_start_time.value;
                    }
                    if (ret_stop_time.status) {
                        myThis.timeObj.end = ret_stop_time.value;
                    }
                    console.log("step", ret_step_time);
                    if (ret_step_time.status) {
                        myThis.timeObj.step = ret_step_time.value;
                        //console.log("time step is",myThis.timeObj.step);
                    }
                    // time interval validation
                    var time_interval_validation = typechecker.validateTimeInterval('authorSetTimeEnd', myThis.timeObj);
                    if (time_interval_validation.errorType) {
                        return;
                    }
                    // time step validation
                    var time_step_validation = typechecker.validateTimeStep('authorSetTimeStep', myThis.timeObj);
                    if (time_step_validation.errorType) {
                        return;
                    }

                    doHide.apply(myThis._descEditor);
                    myThis.timeObj.units = dom.byId("authorSetTimeStepUnits").value;
                    myThis.givenModel.setTime(myThis.timeObj);
                    console.log("final object being returned", myThis.timeObj);
                    var url = dom.byId("authorSetImage").value;
                    myThis.givenModel.setImage(url ? {URL: url} : {});
                    myThis.showDescription();
                };
            }));
        },

        // add line breaks
        // use string split method to unserialize
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
        serialize: function (d) {
            if (typeof d === "string") {
                return d;
            } else {
                var result = "";
                array.forEach(d, function (x) {
                    result += x + "\n";
                });
                return result;
            }
        },

        showDescription: function () {

            var canvas = dom.byId('myCanvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
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
            var showText = function () {
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
                imageObj.onerror = function () {
                    context.font = "normal 20px 'Lucida Grande, sans-serif'";
                    context.fillStyle = "#1f96db";
                    context.fillText("Image not found", imageLeft, imageTop);
                    showText();
                };

                imageObj.src = url;
                // Can't compute layout unless image is downloaded
                // The model can also provide dimensions.  If it does, then
                // we can layout the text immediately
                imageObj.onload = function () {
                    console.log("Image width is " + imageObj.width);
                    // Rescale image size, while maintaining aspect ratio,
                    // assuming we want max width 300
                    var scalingFactor = imageObj.width > 300 ? 300 / imageObj.width : 1.0;
                    console.log('Computing scaling factor for image ' + scalingFactor);
                    imageHeight = imageObj.height * scalingFactor;
                    context.drawImage(imageObj, imageLeft, imageTop, imageObj.width * scalingFactor, imageHeight);
                    showText();
                };
            } else {
                showText();
            }
        }

    });
});