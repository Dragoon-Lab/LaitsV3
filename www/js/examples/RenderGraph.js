/**
 * @author: Deepak Bhosale
 * @brief: example for creating graph and sliders in a dialog using Dojo
 * 
 */



define(["../../dojo/on","../../dojo/_base/declare","../../dijit/layout/Tabcontainer", "../../dijit/layout/ContentPane","../../dijit/Dialog","../../dijit/form/HorizontalSlider","../../dojo/dom","dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Lines","dojox/charting/plot2d/Grid","dojox/charting/widget/Legend","../../dojo/domReady!" ]
, function(on,declare, tabcontainer, contentpane,Dialog,HorizontalSlider,dom,Chart, Default, Lines,Grid,Legend){
	
	return declare(null, {

		//no of parameters that can affect graph. This parameter will be used to create sliders
		inputParam:0,
		//This is name of each parameter. Example 'Mass','Velocity' ....
		paramValue: new Array(),
		//Parameter to set DOM in a dialog dynamically
	    dialogContent:"",	
	    //Parameter to create slider objects
	    sliders:new Array(),
	    //Object of a dialog
        dialog:"",
        //Object of a chart
        chart:"",
        
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
        constructor: function(noOfParam,paramValue)
        {
     	   //assign parameters to object properties 
     	   this.inputParam = noOfParam;
     	   this.paramValue = paramValue;
     	   this.initialize();
     	   
        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *  
         */
        initialize:function()
        {
     	   var i=0;
     	   //fake data for correct graph
           var arrayCorrect = [1, 2, 2, 3, 4, 5, 5, 7,9,6];
           //fake data for graph which changes based on slider values
           var arrayVariable = [1, 2, 2, 3, 4, 5, 5, 7,9,6];
           //create dom for chart and chart legend and embed it in dialog
     	   this.dialogContent= this.dialogContent + this.createDom('div','chart');
     	   this.dialogContent= this.dialogContent + this.createDom('div','legend',"style='width:800px; margin:0 auto;'");
     	   
     	   //create sliders bsed on number of input parameters
     	   for(i=0;i<this.inputParam;i++)
     	   {
     		    // create slider and assign to object property
     		    // 
     	        this.sliders[i] = new HorizontalSlider({
     	            name: "slider"+i,
     	            value: 5,
     	            minimum: 0,
     	            maximum: 10,
     	            intermediateChanges: true,
     	            style: "width:300px;"
     	        }, "slider"+i);
     	   
     	        //create label for name of a textbox
     	        //create input for a textbox
     	        //create div for embedding a slider
     	        this.dialogContent= this.dialogContent + this.createDom('label','','',this.paramValue[i]+" = ")+this.createDom('input','text'+i,"type='text' data-dojo-type='dijit/form/TextBox'")+"<br>"
     	        +this.createDom('div','slider'+i);
     	        console.debug("dialogContent is "+this.dialogContent);
     	   }
     	   
     	   //create a dialog and give created dom in above loop as input to 'content'
     	   //this will create dom inside a dialog
     	   this.dialog = new Dialog({
     		   title: "Graph for Problem",
        		content:this.dialogContent,
        		style:"width:auto;height:auto"
     	   });      	   
     	   
     	   //insert initial value of slider into a textbox
     	   //append slider to the div node
     	   for(i=0;i<this.inputParam;i++)
     	   {
     		  dom.byId("text"+i).value = this.sliders[i].value;
     		 dom.byId("slider"+i).appendChild(this.sliders[i].domNode);
     	   }
     	   
     	   //create a chart
     	   this.chart = new Chart("chart");
     	   this.chart.addPlot("default", {type: Lines,markers:true});
     	  
     	   this.chart.addAxis("x",{fixed:true,min:0,max:10,title:"Distance (meters)", titleOrientation:"away",titleGap:5});
     	   this.chart.addAxis("y", {vertical: true,min:0,title:"Velocity (meters/seconds)"});
     	   this.chart.addSeries("correct solution", arrayCorrect,{stroke:"red"});
     	   this.chart.addSeries("Variable solution",arrayVariable,{stroke:"green"});
     	   this.chart.render();
     	   
     	   var legend = new Legend({chart:this.chart}, "legend");
     	   
     	   //Use local variables and assign object properties to local variables
     	   //local variables are work-around as object properties are not accessed inside a event handler (here inside 'onclick' event)
     	   var _slider=new Array();
     	   var slider=new Array();
     	   var noOfParam = this.inputParam;
     	   var chart = this.chart;
     	   for(i=0;i<this.inputParam;i++)
     	  {
     		   _slider[i] = dom.byId("slider"+i);
     		   slider[i] = this.sliders[i];
     		   on(_slider[i],"click",function(){
     	           
     			   var j;
     			   //get current value of a slider inside textbox
     			   for(j=0;j<noOfParam;j++)
     			   {
     				   
     				   dom.byId("text"+j).value = slider[j].value;
     				      				   	
     			   }
     			   
     			   //dummy calculation to plot a graph when sliders are moved
     			   //this should be replaced by actual node editor equation
     			   for(j=0;j<10;j++)
 				   {
     				   arrayVariable[j] = arrayVariable[j]+1; 
 				   }
     			   
     			   //update and render the chart
     	           	chart.updateSeries("Variable solution",arrayVariable);
     	           	chart.render();
     	           });
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
       
       createDom:function(domType, domId, domParam, domText){
    	   
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
       
       
       
       /*
        * @brief: display the graph
        */
       show: function(){
    	   
    	   this.dialog.show();
       }
	
		
	});
		
});