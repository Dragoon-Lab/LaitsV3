/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating graph and sliders in a dialog using Dojo
 * 
 */

define([
    "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang",
    "dojo/dom", "dojo/on", "dojo/ready",
    "dijit/Dialog", "dijit/form/HorizontalSlider", "dijit/registry",
    "dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Lines",
    "dojox/charting/plot2d/Grid", "dojox/charting/widget/Legend",
    "./calculations",
    "dojo/domReady!"
], function(array, declare, lang, dom, on, ready,
	    Dialog, HorizontalSlider, registry,
	    // It looks like Default, Lines, Grid are not used.  Can they be removed?
	    Chart, Default, Lines, Grid, Legend, calculations){
    return declare(calculations, {

        //array of timesteps
        timeSteps: new Array(),

        //object containing array of calculated values of 'function' & 'accumulator' nodes
        givenArrayOfNodeValues: {},
        studentArrayOfNodeValues: {},

        //format above array of nodevalues for charting
        givenFormattedArrayOfNodeValues: {},
        studentFormattedArrayOfNodeValues: {},

        //Parameter to set DOM in a dialog dynamically
        dialogContent: "",
        //Parameter to create slider objects
        //sliders: new Array(),
        sliders: {},
        //Object of a dialog
        dialog: "",
        //Object of a chart
        chart: {},
        // Given and student solutions
        given: {},
        student: {},

        //collect IDs of all DOMs created to destroy the same when dialog is closed
        strDomID: new Array(),
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */

	constructor: function(){
            var givenObj = this.gerParametersForRendering(true);
            var studentObj = this.gerParametersForRendering(false);

            this.student.paramNames = studentObj.arrayOfParameterNames;
            this.student.paramValue = studentObj.arrayOfParamInitialValues;

            this.given.arrayOfNodeValues = givenObj.arrayOfNodeValues;
            this.student.arrayOfNodeValues = studentObj.arrayOfNodeValues;

            console.log("***** In RenderGraph constructor");

            this.timeSteps = givenObj.arrayOfTimeSteps;
            this.initialize();
        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *
         */
        initialize: function(){
            var str = "";
            this.formatArrayOfNodeValuesForChart();

            var tempGivenArrayOfNodeValues = lang.clone(this.given.arrayOfNodeValues);

            var i = 0, j;
            for(j in this.student.arrayOfNodeValues){
                //get givenModel/extraModel node ID related to student Node
                var descriptionID = this.model.student.getDescriptionID(j);

                //plot chart of student node only if this node corresponds to extra node


                    str = "chart" + j.toString();
                    this.strDomID.push(str);
                    this.dialogContent = this.dialogContent + this.createDom('div', str);

                    str = "legend" + j.toString();
                    this.strDomID.push(str);
                    this.dialogContent = this.dialogContent + this.createDom('div', str, "class='legend'");
                    i++;

                    if((this.model.given.isNode(descriptionID))){
                        delete tempGivenArrayOfNodeValues[descriptionID];
                    }
            }

            for(j in tempGivenArrayOfNodeValues){
                str = "chart" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str);

                str = "legend" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str, "class='legend'");
            }

	    /*
	     Redundant slider code; see Bug #2339
	     */
            var registerEventOnSlider = lang.hitch(this, function(slider, index, paramID){
                on(slider, "change", lang.hitch(this, function(){

                    dom.byId("text" + index).value = slider.value;
                    this.active.setInitial(paramID, slider.value);
                    var newObj = this.gerParametersForRendering(false);

                    this.student.arrayOfNodeValues = newObj.arrayOfNodeValues;
                    this.formatArrayOfNodeValuesForChart();

                    //update and render the chart
                    var l = 0;
                    for(var k in newObj.arrayOfNodeValues){

                        var descriptionID = this.model.student.getDescriptionID(k);
                        var objStudent = this.getMinMaxFromaArray(newObj.arrayOfNodeValues[k]);
                        var min = objStudent.min;
                        var max = objStudent.max;
                        if(this.model.given.isNode(descriptionID)){
                            var objGiven = this.getMinMaxFromaArray(this.given.arrayOfNodeValues[descriptionID]);
                            min = Math.min(objGiven.min, objStudent.min);
                            max = Math.max(objGiven.max, objStudent.max);
                        }

                        this.chart[k].removeAxis("y");
                        this.chart[k].addAxis("y", {
			    vertical: true, min: min, max: max,
			    title: this.labelString(k)
			});
                        this.chart[k].updateSeries("Variable solution", this.studentFormattedArrayOfNodeValues[k]);
                        this.chart[k].render();
                        l++;
                    }

                }));
            });

            i = 0;
	    var units;
            //create sliders based on number of input parameters
            for(j in this.student.paramNames){
                // create slider and assign to object property
                //
                this.sliders[j] = new HorizontalSlider({
                    name: "slider" + j.toString(),
                    value: this.student.paramValue[j],
                    minimum: this.student.paramValue[j] / 10,
                    maximum: this.student.paramValue[j] * 10,
                    intermediateChanges: true,
                    style: "width:300px;"
                }, "slider" + j.toString());


                var paramID = this.student.paramNames[j];
                var slider = this.sliders[j];

                registerEventOnSlider(slider, i, paramID);

                //create label for name of a textbox
                //create input for a textbox
                //create div for embedding a slider
                this.dialogContent += this.createDom('label', '', '', this.model.active.getName(paramID) + " = ");
                this.dialogContent += this.createDom('input', "text" + i, "type='text' data-dojo-type='dijit/form/TextBox' readOnly=true");
		units = this.model.active.getUnits(paramID);
		if(units){
		    this.dialogContent += " " + units;
		}
		this.dialogContent += "<br>";
                str = 'slider' + j.toString();
                this.strDomID.push(str);
                this.dialogContent += this.createDom('div', str);

                console.debug("dialogContent is " + this.dialogContent);

                i++;
            }


            //create a dialog and give created dom in above loop as input to 'content'
            //this will create dom inside a dialog
            this.dialog = new Dialog({
                title: "Graph for Problem",
                content: this.dialogContent,
                style: "width:auto;height:auto;"
            });

            //destroy the dialog when it is closed
            on(this.dialog, "hide", lang.hitch(this, function(){


                this.dialog.destroyRecursive();

                //set initial values of all parameters back to original values; Bug #2337
                var i;
                for(i in this.student.paramNames){
                    this.model.student.setInitial(this.student.paramNames[i], this.student.paramValue[i]);
                }

            }));


            //insert initial value of slider into a textbox
            //append slider to the div node
            for(i in this.student.paramNames){
                dom.byId("text" + i).value = this.sliders[i].value;
                dom.byId("slider" + i).appendChild(this.sliders[i].domNode);
            }

            var chartArray = {};
            var legendArray = {};
            i = 0;
            var time = this.model.getTime();
            tempGivenArrayOfNodeValues = lang.clone(this.given.arrayOfNodeValues);
           if(!this.isNodeValueEmpty())
           {
                for(j in this.student.arrayOfNodeValues){
                    str = "chart" + j.toString();
                    chartArray[j] = new Chart(str);
                    chartArray[j].addPlot("default", {type: Lines, markers: true});

                    chartArray[j].addAxis("x", {
                        title: this.labelString(),
                        titleOrientation: "away", titleGap: 5
                    });

                    var obj = this.getMinMaxFromaArray(this.student.arrayOfNodeValues[j]);
                    chartArray[j].addAxis("y", {
			vertical: true, min: obj.min, max: obj.max, 
			title: this.labelString(j)
		    });

                    descriptionID = this.model.student.getDescriptionID(j);

                    //plot chart for student node
                    chartArray[j].addSeries("Variable solution", this.studentFormattedArrayOfNodeValues[j], {stroke: "green"});
                    //plot chart from given node if it matches with student node
                    if((this.model.given.isNode(descriptionID)))
                    {
                        chartArray[j].removeAxis("y");
                        var objStudent = this.getMinMaxFromaArray(this.student.arrayOfNodeValues[j]);
                        var objGiven = this.getMinMaxFromaArray(this.given.arrayOfNodeValues[descriptionID]);

                        chartArray[j].addAxis("y", {
			    vertical: true, 
			    min: Math.min(objGiven.min, objStudent.min), 
			    max: Math.max(objGiven.max, objStudent.max),
			    title: this.labelString(j)
			});
                        chartArray[j].addSeries("correct solution", this.givenFormattedArrayOfNodeValues[descriptionID], {stroke: "red"});
                        //remove plotted node from collection
                        delete tempGivenArrayOfNodeValues[descriptionID];
                    }


                    chartArray[j].render();

                    str = "legend" + j.toString();
                    legendArray[j] = new Legend({chart: chartArray[j]}, str);
                    i++;
                }
           }
            else
           {
               this.dialog.setContent("<div>"+ "Student did not plot any node as yet"+ "</div>"+"<div align='center'>"+"OR"+"</div>"
               +"<div align='center'>"+"Nodes are not complete"+"</div>");
           }

            this.chart = chartArray;

        },


        /*
         * @brief: create a dom based on input parameters
         * @param: domType - type of dom to be created (e.g div, input, label)
         * @param: domId - Id to be assigned
         * @param: domParam - parameters to be passed to a dom. this will be a string describing node properties. e.g style="width:200px" will be passed
         * to domParam to assign it to the node
         * @param: domText - text to be contained in dom. e.g <label>TEXT</label>. domText = TEXT in this case
         */

        createDom: function(domType, domId, domParam, domText){

            var style = "", dom = "";
            var str = "";
            if(domType == "div"){
                style = "";
                domText = "";
            }else if(domType == "label"){
                domParam = "";
            }else if(domType == "input"){
                domText = "";
            }

            dom = "<" + domType + " " + domParam + " id= " + "'" + domId + "'" + ">" + domText + "</" + domType + ">";
            console.debug("dom is " + dom);
            return dom;
        },

        formatArrayOfNodeValuesForChart: function()
        {
            var i, j;

            //convert array of node values to object {x:timestep, y:node value for timestep}
            for(i in this.given.arrayOfNodeValues)
            {

                var tempArray1 = this.given.arrayOfNodeValues[i];
                var arrayOfXYpairs1 = new Array();
                for(j=0; j<tempArray1.length;j++)
                {
                    arrayOfXYpairs1.push({
			x: this.timeSteps[j],
			y: tempArray1[j]
		    });
                }

                this.givenFormattedArrayOfNodeValues[i] = arrayOfXYpairs1;
            }

            for(i in this.student.arrayOfNodeValues)
            {

                var tempArray2 = this.student.arrayOfNodeValues[i];
                var arrayOfXYpairs2 = new Array();
                for(j=0; j<tempArray2.length;j++)
                {
                    arrayOfXYpairs2.push({
			x: this.timeSteps[j],
			y: tempArray2[j]
		    });
                }

                this.studentFormattedArrayOfNodeValues[i] = arrayOfXYpairs2;
            }
        },

        isNodeValueEmpty:function()
        {
            var i;
            for(i in this.student.arrayOfNodeValues)
            {
                if(this.student.arrayOfNodeValues.hasOwnProperty(i))
                {
                    return false;
                }
            }
            return true;
        },

        //get minimum and maximum value from an array
        getMinMaxFromaArray:function(array)
        {
            var i;
            var min= array[0];
            var max = array[0];
            for(i=1; i<array.length; i++){
                if(array[i] < min){
                    min = array[i];
                }
                if(array[i] > max){
                    max = array[i];
                }
            }

            return {min:min, max:max};
        },
        /*
         * @brief: display the graph
         */
        show: function(){
            this.dialog.show();

        }



    });

});
