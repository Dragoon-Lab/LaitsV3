/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: Graph rendering and related functions
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojox/charting/Chart",
    "dojox/charting/axis2d/Default",
    "dojox/charting/plot2d/Lines",
    "dojox/charting/plot2d/Grid",
    "dojox/charting/widget/Legend",
    "./calculations",
    "dojo/domReady!"
], function(declare, lang, Chart, Default, Lines, Grid, Legend, calculations){
    return declare(calculations, {

    type: "Graph",                                  //Rendering type
    textBoxID:"textGraph",                          //ID for text-box DOM
    sliderID: "sliderGraph",                        //ID for slider DOM
    givenFormattedArrayOfNodeValues: {},            //format array of node values for charting
    studentFormattedArrayOfNodeValues: {},          //format array of node values for charting
    chart: {},                                      //Object of a chart

    /*
    *  @brief:constructor for a graph object
    *  @param: noOfParam
    */

    constructor: function(){
        console.log("***** In RenderGraph constructor");
        this.timeSteps = this.given.timeSteps;
        this.initialize();
    },

    /*
    * @brief: initialize Dialog/charts and sliders
    *
    */
    initialize: function(){
        var str, j;
        this.formatArrayOfNodeValuesForChart();
        var tempGivenArrayOfNodeValues = lang.clone(this.given.arrayOfNodeValues);
        for(j in this.student.arrayOfNodeValues){
            //get givenModel/extraModel node ID related to student Node
            var descriptionID = this.model.student.getDescriptionID(j);
            //plot chart of student node only if this node corresponds to extra node
            str = "chart" + j.toString();
            this.dialogContent = this.dialogContent + this.createDom('div', str);
            str = "legend" + j.toString();
            this.dialogContent = this.dialogContent + this.createDom('div', str, "class='legend'");
            if((this.model.given.isNode(descriptionID))){
                        delete tempGivenArrayOfNodeValues[descriptionID];
            }
        }

        for(j in tempGivenArrayOfNodeValues){
            str = "chart" + j.toString();
            this.dialogContent = this.dialogContent + this.createDom('div', str);
            str = "legend" + j.toString();
            this.dialogContent = this.dialogContent + this.createDom('div', str, "class='legend'");
        }

        this.createSliderAndDialogObject();
        this.closeDialogHandler();

        var chartArray = {};
        var legendArray = {};
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

                var obj = this.getMinMaxFromArray(this.student.arrayOfNodeValues[j]);
                chartArray[j].addAxis("y", {
                    vertical: true, min: obj.min, max: obj.max,
                    title: this.labelString(j)
                });

                descriptionID = this.model.student.getDescriptionID(j);

                //plot chart for student node
                chartArray[j].addSeries("Variable solution", this.studentFormattedArrayOfNodeValues[j], {stroke: "green"});
                //plot chart from given node if it matches with student node
                if((this.model.given.isNode(descriptionID))){
                    chartArray[j].removeAxis("y");
                    var objStudent = this.getMinMaxFromArray(this.student.arrayOfNodeValues[j]);
                    var objGiven = this.getMinMaxFromArray(this.given.arrayOfNodeValues[descriptionID]);
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
    * @brief: this function formats array of node values into an array which consists of object of type
    * {x: timestep, y: node value from array at timstep x}
    */
    formatArrayOfNodeValuesForChart: function(){
        var i, j;
        //convert array of node values to object {x:timestep, y:node value for timestep}
        for(i in this.given.arrayOfNodeValues)
        {
            var tempArray1 = this.given.arrayOfNodeValues[i];
            var arrayOfXYpairs1 = new Array();
            for(j=0; j<tempArray1.length;j++){
                arrayOfXYpairs1.push({
                    x: this.timeSteps[j],
                    y: tempArray1[j]
                });
            }
            this.givenFormattedArrayOfNodeValues[i] = arrayOfXYpairs1;
        }
        for(i in this.student.arrayOfNodeValues){
            var tempArray2 = this.student.arrayOfNodeValues[i];
            var arrayOfXYpairs2 = new Array();
            for(j=0; j<tempArray2.length;j++){
                arrayOfXYpairs2.push({
                    x: this.timeSteps[j],
                    y: tempArray2[j]
                });
            }
            this.studentFormattedArrayOfNodeValues[i] = arrayOfXYpairs2;
        }
    },

    /*
    * @brief: this function returns object with min and max
    * value from an array
    */
    getMinMaxFromArray:function(array){
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
    * @brief: this function renders dialog again when slider event is fired and
    * new values for student nodes are calculated
    */
    renderDialog: function(calculationObj){
        this.student.arrayOfNodeValues = calculationObj.arrayOfNodeValues;
        this.formatArrayOfNodeValuesForChart();
        //update and render the chart
        var l = 0;
        for(var k in calculationObj.arrayOfNodeValues){
            var descriptionID = this.model.student.getDescriptionID(k);
            var objStudent = this.getMinMaxFromArray(calculationObj.arrayOfNodeValues[k]);
            var min = objStudent.min;
            var max = objStudent.max;
            if(this.model.given.isNode(descriptionID)){
                var objGiven = this.getMinMaxFromArray(this.given.arrayOfNodeValues[descriptionID]);
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
    }
    });
});