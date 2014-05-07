/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating table
 * 
 */

define([
    "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang",
    "dojo/dom", "dojo/dom-construct", "dojo/data/ItemFileReadStore", "dojo/on",
    "dijit/layout/ContentPane", "dijit/Dialog", "dijit/form/HorizontalSlider",
    "dojox/layout/TableContainer", "dojox/grid/DataGrid",
    "./calculations",
    "dojo/domReady!" 
], function(array, declare, lang, dom, domConstruct, read, on,
	    contentPane, Dialog, HorizontalSlider,
	    tableContainer, grid,
	   calculations){
    
    return declare(calculations, {

	//no of parameters to display in a table
	inputParam:0,
	//timestep values
	timeSteps: new Array(),
	//values of all nodes stored in an array
	nodeValueArray: {},
	//Parameter to set DOM in a dialog dynamically
	paramNames: new Array(),
	//this is initial value of each parameter
	paramValue: new Array(),
	//Parameter to create slider objects
	sliders:new Array(),
	dialogContent:"",	
	//contentPane for table
	contentPane : null,

        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
	constructor: function(){
	    var object = this.getParametersForRendering(false);

     	    //assign parameters to object properties 
     	    this.inputParam = object.noOfParam;
			this.timeSteps = object.arrayOfTimeSteps;
			this.nodeValueArray = object.arrayOfNodeValues;
			this.paramNames = object.arrayOfParameterNames;
			this.paramValue  = object.arrayOfParamInitialValues;
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
	    
	    /*
	     Redundant code; see Bug #2339
	     */
            var registerEventOnSlider = lang.hitch(this, function(slider, index, paramID){
                on(slider, "change", lang.hitch(this, function(){
		    
                    dom.byId("textTable"+index).value = slider.value;
                    this.model.student.setInitial(paramID, slider.value);
                    var newObj = this.getParametersForRendering(false);
		    
                    this.nodeValueArray = newObj.arrayOfNodeValues;
                    paneText = "";
                    paneText += this.initTable();
                    paneText += this.setTableHeader();
                    paneText += this.setTableContent();
                    paneText += this.closeTable();

                    this.contentPane.setContent(paneText);
		    
                    }));
            });
	    
            i=0;
	    var units;
            //create sliders based on number of input parameters
            for(j in this.paramNames){
                // create slider and assign to object property
                //
                this.sliders[i] = new HorizontalSlider({
                    name: "sliderTable"+i,
                    value: this.paramValue[j],
                    minimum: this.paramValue[j]/10,
                    maximum: this.paramValue[j]*10,
                    intermediateChanges: true,
                    style: "width:300px;"
                }, "sliderTable"+i);
		
                var paramID = this.paramNames[j];
                var slider = this.sliders[i];

                registerEventOnSlider(slider, i, paramID);
		
                //create label for name of a textbox
                //create input for a textbox
                //create div for embedding a slider
                this.dialogContent += this.createDom('label', '', '', this.model.active.getName(paramID) + " = ");
		this.dialogContent += this.createDom('input', 'textTable'+i, "type='text' data-dojo-type='dijit/form/TextBox' readOnly=true");
		units = this.model.active.getUnits(paramID);
		if(units){
		    this.dialogContent += " " + units;
		}
		this.dialogContent += "<br>";
		this.dialogContent += this.createDom('div','sliderTable' + i);
                console.debug("dialogContent is " + this.dialogContent);
                i++;
            }
	    
            //create a dialog and give created dom in above loop as input to 'content'
            //this will create dom inside a dialog
            this.dialog = new Dialog({
                title: "Table for Problem",
                //content:this.dialogContent,
                style:"width:auto;height:auto"
            });
            this.dialog.setContent(this.dialogContent);
	    
            //destroy the dialog when it is closed
            on(this.dialog, "hide", lang.hitch(this, function(){
                this.dialog.destroyRecursive();

                //set initial values of all parameters back to original values; Bug #2337
                var i;
                for(i in this.paramNames){
                    this.model.student.setInitial(this.paramNames[i], this.paramValue[i]);
                }
		
                }));
	    
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
	    
	    
            //this.contentPane.setContent(paneText);
            //insert initial value of slider into a textbox
            //append slider to the div node
            for(i=0; i<this.inputParam; i++)
            {
                dom.byId("textTable"+i).value = this.sliders[i].value;
                dom.byId("sliderTable"+i).appendChild(this.sliders[i].domNode);
            }
	    
	    
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
    	    
    	    var style="", dom="";
    	    var str="";
    	    if(domType == "div")
    	    {
    		style = "";	 
    		domText="";
    	    }
    	    
    	    if(domType == "label")
    	    {
    		domParam="";
    	    }
    	    
    	    if( domType == "input")
    	    {

    		domText="";
            }
    	   
    	    dom = "<"+domType+" "+domParam+" id='"+domId+"'>"+domText+"</"+domType+">";
    	    console.debug("dom is " + dom);
    	    return dom;
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
	    for(i in this.nodeValueArray){
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
                for(var j in this.nodeValueArray){
                    var tempArray = this.nodeValueArray[j];
                    tableString += "<td align='center'>" + tempArray[i].toFixed(2) + "</td>";
                }
                tableString += "</tr>";
            }
            return tableString;
        },

        isNodeValueEmpty:function()
        {
            var i;
            for(i in this.nodeValueArray)
            {
                if(this.nodeValueArray.hasOwnProperty(i))
                {
                    return false;
                }
            }
            return true;
        }
		
	});
		
});
