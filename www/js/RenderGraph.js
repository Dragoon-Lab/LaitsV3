/* global define */
/**
 * @author: Deepak Bhosale
 * @brief: example for creating graph and sliders in a dialog using Dojo
 * 
 */

define([
    "dojo/on", "dojo/_base/declare", 
    "dijit/Dialog", "dijit/form/HorizontalSlider",
    "dojo/dom", "dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Lines",
    "dojox/charting/plot2d/Grid", "dojox/charting/widget/Legend","dojo/ready", "dojo/_base/lang","dijit/registry","dojo/domReady!"
], function(on, declare, Dialog, HorizontalSlider, dom,
	    // It looks like Default, Lines, Grid are not used.  Can they be removed?
	    Chart, Default, Lines, Grid, Legend,ready,lang,registry){
    return declare(null, {
	
	//no of parameters that can affect graph. This parameter will be used to create sliders
	inputParam:0,
	//This is name of each parameter. Example 'Mass','Velocity' ....
	paramNames: new Array(),
	//this is initial value of each parameter
	paramValue: new Array(),
	//object containing array of calculated values of 'function' & 'accumulator' nodes
	arrayOfNodeValues:{},
	//units of nodes
	units: {},
	xunits: null,
	//Parameter to set DOM in a dialog dynamically
	dialogContent:"",	
	//Parameter to create slider objects
	sliders:new Array(),
	//Object of a dialog
    dialog:"",
    //Object of a chart
    chart:"",
    //object passed to constructor
    object : null,
    //collect IDs of all DOMs created to destroy the same when dialog is closed
    strDomID: new Array(),
        /*
         *  @brief:constructor for a graph object
         *  @param: noOfParam
         */
		constructor: function(object)
        {
           this.object = object;
     	   //assign parameters to object properties 
     	   this.inputParam = object.noOfParam;
		   this.paramNames = object.arrayOfParameterNames;
     	   this.paramValue = object.arrayOfParamInitialValues;
		   this.arrayOfNodeValues = object.arrayOfNodeValues;
			console.log("***** In RenderGraph constructor");
		   this.units = object.units;
		   this.xunits = object.xUnits;
     	   this.initialize();
     	   
        },

        /*
         * @brief: initialize Dialog/charts and sliders
         *  
         */
        initialize: function()
        {
     	   var i, j;

		   i=0;
		   var str="";
		   for(j in this.arrayOfNodeValues)
		   {
				str = "chart"+i.toString();
                this.strDomID.push(str);
				this.dialogContent= this.dialogContent + this.createDom('div',str);

                str = "legend"+ i.toString();
               this.strDomID.push(str);
				this.dialogContent= this.dialogContent + this.createDom('div',str,"style='width:800px; margin:0 auto;'");
				i++;
		   }

            var registerEventOnSlider = lang.hitch(this,function(slider,index,paramID)
            {
                on(slider,"change", lang.hitch(this,function(){

                    dom.byId("text"+index).value = slider.value;
                    this.object.calculationObj.active.setInitial(paramID,slider.value);
                    var newObj = this.object.calculationObj.gerParametersForRendering(this.object.calculationObj.solutionGraph,true);

                    //update and render the chart
                    var l=0;
                    for(var k in newObj.arrayOfNodeValues)
                    {
                        this.chart[l].updateSeries("Variable solution", newObj.arrayOfNodeValues[k]);
                        this.chart[l].render();
                        l++;
                    }

                }));
            })
     	        	   
            i=0;
     	   //create sliders based on number of input parameters
     	   for(j in this.paramNames)
     	   {
     		    // create slider and assign to object property
     		    // 
     	        this.sliders[i] = new HorizontalSlider({
     	            name: "slider"+i,
     	            value: this.paramValue[j],
     	            minimum: this.paramValue[j]/10,
     	            maximum: this.paramValue[j]*10,
     	            intermediateChanges: true,
     	            style: "width:300px;"
     	        }, "slider"+i);


               var paramID = j;
               var index  = i;
               var slider = this.sliders[i];

               registerEventOnSlider(slider,index,paramID);

               /*on(this.sliders[i],"change", lang.hitch(this,function(){

                   dom.byId("text"+index).value = slider.value;
                   this.object.calculationObj.active.setInitial(paramID,slider.value);
                   var newObj = this.object.calculationObj.gerParametersForRendering(this.object.calculationObj.solutionGraph,true);

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
     	        /*this.dialogContent= this.dialogContent + this.createDom('label','','',this.paramNames[j]+" = ")+this.createDom('input','text'+i,"type='text' data-dojo-type='dijit/form/TextBox'")+"<br>"
     	        +this.createDom('div','slider'+i);*/
               this.dialogContent= this.dialogContent + this.createDom('label','','',this.paramNames[j]+" = ");

               str = 'text'+ i.toString();
               this.strDomID.push(str);
               this.dialogContent= this.dialogContent + this.createDom('input',str,"type='text' data-dojo-type='dijit/form/TextBox' readOnly=true")+"<br>";
               str = 'slider'+ i.toString();
               this.strDomID.push(str);
               this.dialogContent= this.dialogContent  +this.createDom('div',str);

               console.debug("dialogContent is "+this.dialogContent);
				
				i++;
     	   }



     	   
     	   //create a dialog and give created dom in above loop as input to 'content'
     	   //this will create dom inside a dialog
     	   this.dialog = new Dialog({
     		   title: "Graph for Problem",
        		content:this.dialogContent,
        		style:"width:auto;height:auto;"
     	   });

           //destroy the dialog when it is closed
            on(this.dialog,"hide",lang.hitch(this,function(){



                this.dialog.destroyRecursive();

                //set initial values of all parameters to original values
                var i;
                 for(i in this.paramNames)
                 {
                 this.object.calculationObj.active.setInitial(i,this.paramValue[i]);
                 }

            }));


     	   //insert initial value of slider into a textbox
     	   //append slider to the div node
     	   for(i=0; i<this.inputParam; i++)
     	   {
     		  dom.byId("text"+i).value = this.sliders[i].value;
     		 dom.byId("slider"+i).appendChild(this.sliders[i].domNode);
     	   }
		   
		   var chartArray = new Array();
		   var legendArray = new Array();
		   i=0;
	           var time = this.object.calculationObj.model.getTime();
		   for(j in this.arrayOfNodeValues)
		   {
			   str = "chart"+i.toString();	
			   chartArray[i] = new Chart(str);
			   chartArray[i].addPlot("default", {type: Lines, markers:true});
			  
			   chartArray[i].addAxis("x", {
			   fixed: true, min: time.start, max: (time.end - time.start)/time.step, title: this.xunits,
			   titleOrientation: "away", titleGap:5
			});
               var array = this.arrayOfNodeValues[j];
               var maxArrayValue = array[array.length-1];
			   //chartArray[i].addAxis("y", {vertical: true, min: 0, title: this.units[j]});
               chartArray[i].addAxis("y", {vertical: true, min: 0, max:maxArrayValue,title: this.units[j]});
			   chartArray[i].addSeries("correct solution", this.arrayOfNodeValues[j], {stroke: "red"});
			   chartArray[i].addSeries("Variable solution", this.arrayOfNodeValues[j], {stroke: "green"});
			   chartArray[i].render();
			   
			   str = "legend"+i.toString();
			   legendArray[i] = new Legend({chart: chartArray[i]}, str);
			   i++;
		   }

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
     		   on(_slider[i],"click",function(){
     	           
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
