/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating graph and sliders in a dialog using Dojo
 * 
 */

define([
    "dojo/on", "dojo/_base/declare", "dojo/_base/lang",
    "dijit/Dialog", "dijit/form/HorizontalSlider",
    "dojo/dom", "dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Lines",
    "dojox/charting/plot2d/Grid", "dojox/charting/widget/Legend","dojo/ready", "dojo/_base/lang","dijit/registry","dojo/domReady!"
], function(on, declare, lang, Dialog, HorizontalSlider, dom,
	    // It looks like Default, Lines, Grid are not used.  Can they be removed?
	    Chart, Default, Lines, Grid, Legend, ready, lang, registry){
    return declare(null, {

        //array of timesteps
        timeSteps: new Array(),

        //no of parameters that can affect graph. This parameter will be used to create sliders
        givenInputParam: 0,
        studentInputParam: 0,

        //This is name of each parameter. Example 'Mass','Velocity' ....
        givenParamNames: new Array(),
        studentParamNames: new Array(),

        //this is initial value of each parameter
        givenParamValue: new Array(),
        studentParamValue: new Array(),

        //object containing array of calculated values of 'function' & 'accumulator' nodes
        givenArrayOfNodeValues: {},
        studentArrayOfNodeValues: {},

        //format above array of nodevalues for charting
        givenFormattedArrayOfNodeValues: {},
        studentFormattedArrayOfNodeValues: {},


        //units of nodes
        givenUnits: {},
        studentUnits: {},
        xunits: null,

        //Parameter to set DOM in a dialog dynamically
        dialogContent: "",
        //Parameter to create slider objects
        //sliders: new Array(),
        sliders: {},
        //Object of a dialog
        dialog: "",
        //Object of a chart
        chart: {},
        //object passed to constructor
        givenObject: null,
        studentObject: null,

        //collect IDs of all DOMs created to destroy the same when dialog is closed
        strDomID: new Array(),
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
        constructor: function(object){
            this.givenObject = object.givenObj;
            this.studentObject = object.studentObj;

            //assign parameters to object properties
            this.givenInputParam = object.givenObj.noOfParam;
            this.studentInputParam = object.studentObj.noOfParam;

            this.givenParamNames = object.givenObj.arrayOfParameterNames;
            this.studentParamNames = object.studentObj.arrayOfParameterNames;

            this.givenParamValue = object.givenObj.arrayOfParamInitialValues;
            this.studentParamValue = object.studentObj.arrayOfParamInitialValues;

            this.givenArrayOfNodeValues = object.givenObj.arrayOfNodeValues;
            this.studentArrayOfNodeValues = object.studentObj.arrayOfNodeValues;

            console.log("***** In RenderGraph constructor");
            this.givenUnits = object.givenObj.units;
            this.studentUnits = object.studentObj.units;

            this.xunits = object.givenObj.xUnits;
            this.timeSteps = object.givenObj.arrayOfTimeSteps;
            this.initialize();

        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *
         */
        initialize: function(){
            var i, j;


            var str = "";

            /*for(j in this.givenArrayOfNodeValues){
                str = "chart" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str);

                str = "legend" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str, "style='width:800px; margin:0 auto;'");
                i++;
            }*/

            this.formatArrayOfNodeValuesForChart();

            var tempGivenArrayOfNodeValues = lang.clone(this.givenArrayOfNodeValues);

            i = 0;
            for(j in this.studentArrayOfNodeValues){
                //get givenModel/extraModel node ID related to student Node
                var descriptionID = this.studentObject.calculationObj.model.student.getDescriptionID(j);

                //plot chart of student node only if this node corresponds to extra node


                    str = "chart" + j.toString();
                    this.strDomID.push(str);
                    this.dialogContent = this.dialogContent + this.createDom('div', str);

                    str = "legend" + j.toString();
                    this.strDomID.push(str);
                    this.dialogContent = this.dialogContent + this.createDom('div', str, "style='width:800px; margin:0 auto;'");
                    i++;

                    if((this.studentObject.calculationObj.model.given.isNode(descriptionID))){
                        delete tempGivenArrayOfNodeValues[descriptionID];
                    }


            }


            for(j in tempGivenArrayOfNodeValues){
                str = "chart" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str);

                str = "legend" + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str, "style='width:800px; margin:0 auto;'");
            }

            var registerEventOnSlider = lang.hitch(this, function(slider, index, paramID){
                on(slider, "change", lang.hitch(this, function(){

                    dom.byId("text" + paramID.toString()).value = slider.value;
                    this.studentObject.calculationObj.active.setInitial(paramID, slider.value);
                    var newObj = this.studentObject.calculationObj.gerParametersForRendering(this.studentObject.calculationObj.solutionGraph, false);

                    this.studentArrayOfNodeValues = newObj.arrayOfNodeValues;
                    this.formatArrayOfNodeValuesForChart();


                    //update and render the chart
                    var l = 0;
                    for(var k in newObj.arrayOfNodeValues){

                        var descriptionID = newObj.calculationObj.model.student.getDescriptionID(k);
                        var objStudent = this.getMinMaxFromaArray(newObj.arrayOfNodeValues[k]);
                        var min = objStudent.min;
                        var max = objStudent.max;
                        if((newObj.calculationObj.model.given.isNode(descriptionID)))
                        {
                            var objGiven = this.getMinMaxFromaArray(this.givenArrayOfNodeValues[descriptionID]);
                            min = objStudent.min > objGiven.min?objGiven.min:objStudent.min;
                            max = objStudent.max > objGiven.max?objStudent.max:objGiven.max;
                        }



                        //var array = newObj.arrayOfNodeValues[k];
                        //var maxArrayValue = array[array.length - 1];

                        this.chart[k].removeAxis("y");
                        this.chart[k].addAxis("y", {vertical: true, min: min, max: max,  title: this.studentUnits[k]});
                        this.chart[k].updateSeries("Variable solution", this.studentFormattedArrayOfNodeValues[k]);
                        this.chart[k].render();
                        l++;
                    }

                }));
            });

            i = 0;
            //create sliders based on number of input parameters
            for(j in this.studentParamNames){
                // create slider and assign to object property
                //
                this.sliders[j] = new HorizontalSlider({
                    name: "slider" + j.toString(),
                    value: this.studentParamValue[j],
                    minimum: this.studentParamValue[j] / 10,
                    maximum: this.studentParamValue[j] * 10,
                    intermediateChanges: true,
                    style: "width:300px;"
                }, "slider" + j.toString());


                var paramID = j;
                var index = i;
                var slider = this.sliders[j];

                registerEventOnSlider(slider, index, paramID);

                /*on(this.sliders[i],"change", lang.hitch(this, function(){

                 dom.byId("text"+index).value = slider.value;
                 this.object.calculationObj.active.setInitial(paramID, slider.value);
                 var newObj = this.object.calculationObj.gerParametersForRendering(this.object.calculationObj.solutionGraph, true);

                 //update and render the chart
                 var l=0;
                 for(var k in newObj.arrayOfNodeValues)
                 {
                 this.chart[l].updateSeries("Variable solution", newObj.arrayOfNodeValues[k]);
                 this.chart[l].render();
                 l++;
                 }

                 }));*/

                //create label for name of a textbox
                //create input for a textbox
                //create div for embedding a slider
                /*this.dialogContent= this.dialogContent + this.createDom('label','','', this.paramNames[j]+" = ")+this.createDom('input','text'+i,"type='text' data-dojo-type='dijit/form/TextBox'")+"<br>"
                 +this.createDom('div','slider'+i);*/
                this.dialogContent = this.dialogContent + this.createDom('label', '', '', this.studentParamNames[j] + " = ");

                str = 'text' + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('input', str, "type='text' data-dojo-type='dijit/form/TextBox' readOnly=true") + "<br>";
                str = 'slider' + j.toString();
                this.strDomID.push(str);
                this.dialogContent = this.dialogContent + this.createDom('div', str);

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

                //set initial values of all parameters to original values
                var i;
                for(i in this.studentParamNames){
                    this.studentObject.calculationObj.model.student.setInitial(i, this.studentParamValue[i]);
                }

            }));


            //insert initial value of slider into a textbox
            //append slider to the div node
            for(i in this.studentParamValue){
                dom.byId("text" + i.toString()).value = this.sliders[i].value;
                dom.byId("slider" + i.toString()).appendChild(this.sliders[i].domNode);
            }

            var chartArray = {};
            var legendArray = {};
            i = 0;
            var time = this.studentObject.calculationObj.model.getTime();
            tempGivenArrayOfNodeValues = lang.clone(this.givenArrayOfNodeValues);
           if(!this.isNodeValueEmpty())
           {
                for(j in this.studentArrayOfNodeValues){
                    str = "chart" + j.toString();
                    chartArray[j] = new Chart(str);
                    chartArray[j].addPlot("default", {type: Lines, markers: true});

                    chartArray[j].addAxis("x", {
                        title: this.xunits,
                        titleOrientation: "away", titleGap: 5
                    });
//                    var array = this.studentArrayOfNodeValues[j];
//                    var maxArrayValue = array[array.length - 1];

                    var obj = this.getMinMaxFromaArray(this.studentArrayOfNodeValues[j]);
                    chartArray[j].addAxis("y", {vertical: true, min: obj.min, max: obj.max, title: this.studentUnits[j]});

                    descriptionID = this.studentObject.calculationObj.model.student.getDescriptionID(j);

                    //plot chart for student node
                    //***chartArray[j].addSeries("Variable solution", this.studentArrayOfNodeValues[j], {stroke: "green"});
                    chartArray[j].addSeries("Variable solution", this.studentFormattedArrayOfNodeValues[j], {stroke: "green"});
                    //plot chart from given node if it matches with student node
                    if((this.studentObject.calculationObj.model.given.isNode(descriptionID)))
                    {
                        chartArray[j].removeAxis("y");
                        var objStudent = this.getMinMaxFromaArray(this.studentArrayOfNodeValues[j]);
                        var objGiven = this.getMinMaxFromaArray(this.givenArrayOfNodeValues[descriptionID]);

                        var min = objStudent.min > objGiven.min?objGiven.min:objStudent.min;
                        var max = objStudent.max > objGiven.max?objStudent.max:objGiven.max;
                        chartArray[j].addAxis("y", {vertical: true, min: min, max: max, title: this.studentUnits[j]});
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
            /*for(j in this.givenArrayOfNodeValues){

                str = "chart" + j.toString();
                chartArray[j] = new Chart(str);
                chartArray[j].addPlot("default", {type: Lines, markers: true});

                chartArray[j].addAxis("x", {
                    fixed: true,  title: this.xunits,
                    titleOrientation: "away", titleGap: 5
                });
                array = this.givenArrayOfNodeValues[j];
                maxArrayValue = array[array.length - 1];
                chartArray[j].addAxis("y", {vertical: true, min: 0, max: maxArrayValue, title: this.givenUnits[j]});

                //plot chart for given node
                chartArray[j].addSeries("correct solution", this.givenFormattedArrayOfNodeValues[j], {stroke: "red"});

                chartArray[j].render();

                str = "legend" + j.toString();
                legendArray[j] = new Legend({chart: chartArray[j]}, str);
                i++;
            }*/

            this.chart = chartArray;

            //create a chart
            /*
             this.chart = new Chart("chart");
             this.chart.addPlot("default", {type: Lines, markers:true});

             this.chart.addAxis("x", {
             fixed: true, min: 0, max: 10, title: "Distance (meters)",
             titleOrientation: "away", titleGap:5
             });
             this.chart.addAxis("y", {vertical: true, min: 0, title: "Velocity (meters/seconds)"});
             this.chart.addSeries("correct solution", arrayCorrect, {stroke: "red"});
             this.chart.addSeries("Variable solution", arrayVariable, {stroke: "green"});
             this.chart.render();

             var legend = new Legend({chart: this.chart}, "legend");


             var ch = new Chart("chart2");
             ch.addPlot("default", {type: Lines, markers:true});

             ch.addAxis("x", {
             fixed: true, min: 0, max: 10, title: "Distance (meters)",
             titleOrientation: "away", titleGap:5
             });
             ch.addAxis("y", {vertical: true, min: 0, title: "Velocity (meters/seconds)"});
             ch.addSeries("correct solution", arrayCorrect, {stroke: "red"});
             ch.addSeries("Variable solution", arrayVariable, {stroke: "green"});
             ch.render();

             var leg = new Legend({chart: ch}, "legend2");
             */
            //Use local variables and assign object properties to local variables
            //local variables are work-around as object properties are not accessed inside a event handler (here inside 'onclick' event)

            /*
             var _slider=new Array();
             var slider=new Array();
             var noOfParam = this.inputParam;
             var chart = this.chart;
             for(i=0;i<this.inputParam;i++)
             {
             _slider[i] = dom.byId("slider"+i);
             slider[i] = this.sliders[i];
             on(_slider[i],"click", function(){

             var j;
             //get current value of a slider inside textbox
             for(j=0; j<noOfParam; j++)
             {

             dom.byId("text"+j).value = slider[j].value;

             }

             //dummy calculation to plot a graph when sliders are moved
             //this should be replaced by actual node editor equation
             for(j=0; j<10; j++)
             {
             arrayVariable[j] = arrayVariable[j]+1;
             }

             //update and render the chart
             chart.updateSeries("Variable solution", arrayVariable);
             chart.render();
             });
             } */

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
            for(i in this.givenArrayOfNodeValues)
            {

                var tempArray = this.givenArrayOfNodeValues[i];
                var arrayOfXYpairs = new Array();
                for(j=0; j<tempArray.length;j++)
                {
                    var obj = new Object();
                    obj["x"] = this.timeSteps[j];
                    obj["y"] = tempArray[j];
                    arrayOfXYpairs.push(obj);
                }

                this.givenFormattedArrayOfNodeValues[i] = arrayOfXYpairs;
            }

            for(i in this.studentArrayOfNodeValues)
            {

                var tempArray = this.studentArrayOfNodeValues[i];
                var arrayOfXYpairs = new Array();
                for(j=0; j<tempArray.length;j++)
                {
                    var obj = new Object();
                    obj["x"] = this.timeSteps[j];
                    obj["y"] = tempArray[j];
                    arrayOfXYpairs.push(obj);
                }

                this.studentFormattedArrayOfNodeValues[i] = arrayOfXYpairs;
            }
        },

        isNodeValueEmpty:function()
        {
            var i;
            for(i in this.studentArrayOfNodeValues)
            {
                if(this.studentArrayOfNodeValues.hasOwnProperty(i))
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
            var obj;
            var min= array[0];
            var max = array[0];
            for(i=1;i<array.length;i++)
            {
                if(array[i] < min)
                {
                    min = array[i];
                }
            }

            for(i=1;i<array.length;i++)
            {
                if(array[i] > max)
                {
                    max = array[i];
                }
            }

            obj={min:min, max:max};
            return obj;
        },
        /*
         * @brief: display the graph
         */
        show: function(){
            this.dialog.show();

        }



    });

});
