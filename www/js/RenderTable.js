/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating table
 * 
 */

define([
    "dojo/on", "dojo/_base/declare", "dojox/layout/TableContainer", "dijit/Dialog",
    "dojo/dom", "dojo/dom-construct", "dojo/data/ItemFileReadStore", "dojox/grid/DataGrid","dijit/form/HorizontalSlider",
    "dojo/domReady!" 
], function(on, declare, tableContainer, Dialog, dom, domConstruct, read, grid,HorizontalSlider){
    
    return declare(null, {
	
	//no of parameters to display in a table
	inputParam:0,
	//timesteps unit
	xUnits: null,
	//tableHeaders (units of all nodes)
	units: {},
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
	//Object of a dialog
    dialog:"",
		        
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
        constructor: function(noOfParam,paramNames, paramValue,xUnits,units,timeSteps,nodeValueArray)
        {
     	    //assign parameters to object properties 
     	    this.inputParam = noOfParam;
     	    this.xUnits = xUnits;
			this.units = units;
			this.timeSteps = timeSteps;
			this.nodeValueArray = nodeValueArray;
			this.paramNames = paramNames;
			this.paramValue  = paramValue;
     	    this.initialize();     	    
        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *  
         */
         
        initialize: function()
        {
        	
     	   var i=0,j=0,domId="",tempArray;
		   
		   this.dialogContent = this.dialogContent+this.initTable();
		   this.dialogContent = this.dialogContent+this.setTableHeader();
     	   
	    console.log(" env ", this, this.timeSteps);
			for(i=0;i<this.timeSteps.length;i++)
			{
				this.dialogContent = this.dialogContent+"<tr>";
				this.dialogContent = this.dialogContent+"<td align='center'>"+this.timeSteps[i] + "</td>";
				//set values in table according to their table-headers
				for(j in this.nodeValueArray)
				{
					tempArray = this.nodeValueArray[j];
					this.dialogContent = this.dialogContent+"<td align='center'>"+tempArray[i].toFixed(2) + "</td>";
					
				}
				this.dialogContent = this.dialogContent+"</tr>";
			}
			
			/*
			for(i=0; i < rowLength; i++)
			{
				this.dialogContent = this.dialogContent+"<tr>";
				for(j=0;j < this.inputParam; j++)
				{
					this.dialogContent = this.dialogContent+"<td align='center'>"+this.paramValue[this.inputParam * i + j] + "</td>";
				}
				this.dialogContent = this.dialogContent+"</tr>";
			}*/
		   
		   this.dialogContent = this.dialogContent+this.closeTable();
           //this.dialogContent = this.dialogContent+this.createDom("div","table","","");
		   
		   i=0;
     	   //create sliders based on number of input parameters
     	   for(j in this.paramNames)
     	   {
     		    // create slider and assign to object property
     		    // 
     	        this.sliders[i] = new HorizontalSlider({
     	            name: "sliderTable"+i,
     	            value: this.paramValue[j],
     	            minimum: 0,
     	            maximum: 10,
     	            intermediateChanges: true,
     	            style: "width:300px;"
     	        }, "sliderTable"+i);
     	   
     	        //create label for name of a textbox
     	        //create input for a textbox
     	        //create div for embedding a slider
     	        this.dialogContent= this.dialogContent + this.createDom('label','','',this.paramNames[j]+" = ")+this.createDom('input','textTable'+i,"type='text' data-dojo-type='dijit/form/TextBox'")+"<br>"
     	        +this.createDom('div','sliderTable'+i);
     	        console.debug("dialogContent is "+this.dialogContent);
				
				i++;
     	   }
           
           //create a dialog and give created dom in above loop as input to 'content'
     	   //this will create dom inside a dialog
     	   this.dialog = new Dialog({
     		   title: "Table for Problem",
        		content:this.dialogContent,
        		style:"width:auto;height:auto"
     	   });  
		   
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
    	   
    	 dom = "<"+domType+" "+domParam+" id= "+"'"+domId+"'"+">"+domText+"</"+domType+">";
    	 console.debug("dom is "+dom);
    	 return dom;
       },
       
       initTable: function(){
    	   var tableString = "";
		   tableString = "<div id='table' data-dojo-type='dijit/layout/ContentPane' region='center'>"+"<div align='center'>"+"<table border=1 style='border-spacing:0px'>";		
			return tableString;
       },
	   
	closeTable: function(){
	   
			var tableString = "";
			tableString = "</table>"+"</div>"+"</div>";
			
			return tableString;
		},
		
		setTableHeader: function(){
		
			var i=0, tableString="";
			
			tableString = tableString + "<tr>";
			
			//setup xunit (unit of timesteps)
			//tableString = tableString + "<th align='center' style='padding-right:5px;padding-left:5px;'>"+this.xUnits+"</th>";
			tableString = tableString + "<th style='text-align:center;padding-right:10px;padding-left:10px;'>"+this.xUnits+"</th>";
			for(i in this.nodeValueArray)
			{
				//tableString = tableString + "<th align='center' style='padding-right:5px;padding-left:5px;'>"+this.units[i]+"</th>";
				tableString = tableString + "<th style='text-align:center;padding-right:10px;padding-left:10px;'>"+this.units[i]+"</th>";
			}
			
			tableString = tableString + "</tr>";
			
			return tableString;
		},
       
           /*
        * @brief: display the graph
        */
       show: function(){
    	   
    	  this.dialog.show();
       }
	
		
	});
		
});
