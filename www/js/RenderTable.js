/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating table
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
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
	constructor: function(){
            console.log("***** In RenderTable constructor");
            this.timeSteps = this.student.timeSteps;
     	    this.initialize();
	},

        /*
         * @brief: initialize Dialog/charts and sliders
         *  
         */
         
        initialize: function(){
            
     	    var i=0, j=0, domId="", tempArray;
	    
            //check if array of node values is empty
            //plot table if these values are not empty
	    
            this.dialogContent += "<div id='table'></div>";

            this.createSliderDialog();
            this.closeDialogHandler();

            var paneText="";
            if(!this.isNodeValueEmpty())
            {
                paneText += this.initTable();
                paneText += this.setTableHeader();
                paneText += this.setTableContent();
                paneText += this.closeTable();
            }
            else
            {
                paneText = "Student did not plot any node as yet!!";
            }
	    
            this.contentPane = new contentPane(
                {
                    content:paneText
                    }, "table");
        },

	initTable: function(){
           return "<div align='center'>" + "<table class='solution'>";
       },
	   
	closeTable: function(){
            return "</table>"+"</div>";
	},
	
	setTableHeader: function(){
	    var i=0, tableString = "";
	    tableString += "<tr>";
	    //setup xunit (unit of timesteps)
	    tableString += "<th>" + this.labelString() + "</th>";
	    for(i in this.student.arrayOfNodeValues){
		tableString += "<th>" + this.labelString(i) + "</th>";
	    }
	    tableString += "</tr>";
	    return tableString;
	},

        setTableContent: function(){
            // console.log(" env ", this, this.timeSteps);
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

        //Render dialog of table after slider event
        renderDialog: function(calculationObj){
            this.student.arrayOfNodeValues = calculationObj.arrayOfNodeValues;
            paneText = "";
            paneText += this.initTable();
            paneText += this.setTableHeader();
            paneText += this.setTableContent();
            paneText += this.closeTable();

            this.contentPane.setContent(paneText);
        }
		
	});
		
});
