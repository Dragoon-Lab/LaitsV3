/**
 * @author: Deepak Bhosale
 * @brief: example for creating table
 * 
 */



define(["../../dojo/on","../../dojo/_base/declare","../../dojox/layout/TableContainer","../../dijit/Dialog","../../dojo/dom","../../dojo/dom-construct","../../dojo/data/ItemFileReadStore","../../dojox/grid/DataGrid","../../dojo/domReady!" ]
, function(on,declare, tableContainer,Dialog,dom,domConstruct,read,grid){
	
	return declare(null, {

		//no of parameters to display in a table
		inputParam:0,
		//This is name of each parameter. Example 'Mass','Velocity' ....
		paramValue: new Array(),
		//tableHeader
		tableHeader: new Array(),
		//Parameter to set DOM in a dialog dynamically
	    dialogContent:"",	
		//Object of a dialog
        dialog:"",
		        
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
        constructor: function(noOfParam,tableHeader,paramValue)
        {
     	   //assign parameters to object properties 
     	   this.inputParam = noOfParam;
     	   this.paramValue = paramValue;
		   this.tableHeader = tableHeader;
     	   this.initialize();
     	   
        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *  
         */
         
        initialize:function()
        {
        	
     	   var i=0,j=0,domId="",rowLength = this.paramValue.length/this.inputParam;
		   
		   this.dialogContent = this.dialogContent+this.initTable();
		   this.dialogContent = this.dialogContent+this.setTableHeader();
     	   
		   for(i=0; i < rowLength; i++)
			{
				this.dialogContent = this.dialogContent+"<tr>";
				for(j=0;j < this.inputParam; j++)
				{
					this.dialogContent = this.dialogContent+"<td align='center'>"+this.paramValue[this.inputParam * i + j] + "</td>";
				}
				this.dialogContent = this.dialogContent+"</tr>";
			}
		   
		   this.dialogContent = this.dialogContent+this.closeTable();
           //this.dialogContent = this.dialogContent+this.createDom("div","table","",""); ;
           
		   
		   
		   
		   
           //create a dialog and give created dom in above loop as input to 'content'
     	   //this will create dom inside a dialog
     	   this.dialog = new Dialog({
     		   title: "Table for Problem",
        		content:this.dialogContent,
        		style:"width:auto;height:auto"
     	   });  
     	   
     	   

        },
        
       
        /*
         * @brief: create a dom based on input parameters
         * @param: domType - type of dom to be created (e.g div, input, label)
         * @param: domId - Id to be assigned
         * @param: domParam - parameters to be passed to a dom. this will be a string describing node properties. e.g style="width:200px" will be passed 
         * to domParam to assign it to the node
         * @param: domText - text to be contained in dom. e.g <label>TEXT</label>. domText = TEXT in this case
         */
       
       initTable:function(){
    	   var tableString = "";
		   tableString = "<div id='table' data-dojo-type='dijit/layout/ContentPane' region='center'>"+"<div align='center'>"+"<table border=1 style='border-spacing:0px'>"		
			return tableString;
       },
	   
	   closeTable:function(){
	   
			var tableString = "";
			tableString = "</table>"+"</div>"+"</div>";
			
			return tableString;
		},
		
		setTableHeader:function(){
		
			var i=0, tableString="";
			
			tableString = tableString + "<tr>";
			for(i=0;i<this.inputParam;i++)
			{
				tableString = tableString + "<th style='padding-right:5px;padding-left:5px;'>"+this.tableHeader[i]+"</th>"
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