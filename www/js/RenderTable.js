/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: Table rendering and related functions
 * 
 */

define([
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "./calculations",
    "dojo/domReady!" 
], function(declare, contentPane, calculations){
    return declare(calculations, {

    type: "Table",                      //Rendering type
    textBoxID:"textTable",              //ID for text-box DOM
    sliderID: "sliderTable",            //ID for slider DOM
	contentPane : null,             	//contentPane for table

    /*
    *  @brief:constructor for Table
    */
	constructor: function(){
        console.log("***** In RenderTable constructor");
        this.timeSteps = this.student.timeSteps;
     	this.initialize();
	},

    /*
    * @brief: initialize Dialog/charts and sliders
    */
    initialize: function(){
        //initialize dom for plotting table
        this.dialogContent += "<div id='table'></div>";
        //plot sliders and dialog for table
        this.createSliderAndDialogObject();
        //handle dialog close event
        this.closeDialogHandler();
        /*check if array of node values is empty
        plot table if these values are not empty*/
        var paneText="";
        if(!this.isNodeValueEmpty()){
            paneText += this.initTable();
            paneText += this.setTableHeader();
            paneText += this.setTableContent();
            paneText += this.closeTable();
        }
        else
        {
            paneText = "Student did not plot any node as yet!!";
        }
        this.contentPane = new contentPane({
            content:paneText
        }, "table");
    },

    /*
    * @brief: initialize table contents
    */
	initTable: function(){
           return "<div align='center'>" + "<table class='solution'>";
    },

    /*
    * @brief: function to close table dom
    * */
	closeTable: function(){
            return "</table>"+"</div>";
	},

    /*
    * @brief: function to set headers of table
    * */
	setTableHeader: function(){
	    var i, tableString = "";
	    tableString += "<tr>";
	    //setup xunit (unit of timesteps)
	    tableString += "<th>" + this.labelString() + "</th>";
	    for(i in this.student.arrayOfNodeValues){
		tableString += "<th>" + this.labelString(i) + "</th>";
	    }
	    tableString += "</tr>";
	    return tableString;
	},

    /*
    * @brief: function to set contents of table according to node values
    *
    * */
    setTableContent: function(){
        var tableString="";
        for(var i=0;i<this.timeSteps.length;i++){
            tableString += "<tr>";
            tableString += "<td align='center'>" + this.timeSteps[i] + "</td>";
            //set values in table according to their table-headers
            for(var j in this.student.arrayOfNodeValues){
                var tempArray = this.student.arrayOfNodeValues[j];
                tableString += "<td align='center'>" + tempArray[i].toFixed(2) + "</td>";
            }
            tableString += "</tr>";
        }
        return tableString;
    },

    /*
    * @brief: this function renders dialog again when slider event is fired and
    * new values for student nodes are calculated
    */
    renderDialog: function(calculationObj){
        this.student.arrayOfNodeValues = calculationObj.arrayOfNodeValues;
        var paneText = "";
        paneText += this.initTable();
        paneText += this.setTableHeader();
        paneText += this.setTableContent();
        paneText += this.closeTable();

        this.contentPane.setContent(paneText);
    }
	});
});
