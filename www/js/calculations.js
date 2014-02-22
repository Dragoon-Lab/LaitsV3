/* global define, Image */
define([
    "dojo/dom",
    'dojo/dom-geometry',
    "dojo/on",
    'dojo/aspect',
    "dojo/io-query",
    "dojo/ready",
    "./menu",
    "./load-save",
    "./model",
    "./RenderGraph", "./RenderTable", "./wraptext", 
    "./controller",
    "parser/parser",
    "./draw-model" 
],function(dom, geometry, on, aspect, ioQuery, ready, menu, loadSave, model, 
	   Graph, Table, wrapText, controller, Parser, drawmodel
	  ){ 
			//timesteps in graph
			timeSteps:0,
			//start time to plot graph
			startTime:0,
			//end time to plot grpah
			endTime:0,
			//model 
			model:null,
			//model nodes
			modelNodes:null,
			//current node values
			currentNodeValues: {},
			
			
			constructor: function(solutionGraph)
			{
				this.model = new model();
				_setModel(solutionGraph);
				_setStartTime();
				_setEndtime();
				_setTimeStep();
			},
		
			//set model based on given solution graph (private method)
			_setModel:function(solutionGraph)
			{
				this.model.loadModel(solutionGraph);		
				_getModelNodes();
			},
			
			//get model nodes from solution
			_getModelNodes:function()
			{
				this.modelNodes = this.model.getNodes();
			},
			
			//set start-time (private method)
			_setStartTime: function()
			{
				this.startTime = this.model.getStartTime();
			},

			//set end-time (private method)
			_setEndtime: function()
			{
				this.endTime = this.model.getEndTime();
			}

			//set time-step (private method)
			_setTimeStep: function()
			{
				this.timeSteps = this.model.getTimeStep();
			},
			
			//@brief: this function will create an object which will return key/value pair of
			//		  node-id/node-equation
			_getAllNodeEquations:function()
			{
				var i,nodeEquations={};
				
				for(i=0; i<this.modelNodes.length; i++)
				{
					nodeEquations[this.modelNodes[i].ID] = this.model.getNodeEquation(this.modelNodes[i].ID);
				}
				
				return nodeEquations;
			},
			
			//@brief: this function creates an object which stores array of values over timesteps per node
			//e.g object = {id1: array of values over time-steps, id2:array of values over time-steps} etc...
			_createNodeValueArray: function()
			{
				var j, arrayOfNodeValues={};
				for(var j=0; j<this.modelNodes.length; j++)
				{
					if(this.model.getNodeType(this.modelNodes[j].ID) != 'parameter')
					{
						arrayOfNodeValues[givenModelNodes[j].ID] = new Array();
					}
				}
				
				return arrayOfNodeValues;
			},
			
						
			//@brief: this function returns an object containing array of values of nodes over given timesteps
			_getNodeValuesByTimeSteps:function(isInitialValue, arrayOfNodeValues, arrayOfTimeSteps, nodeEquations)
			{
				var j;
				//set initial values of all nodes
				switch(isInitialValue)
				{
					case true:
					
						for(i=0;i<this.modelNodes.length;i++)
						{
							this.currentNodeValues[this.modelNodes[i].ID] = this.model.getNodeInitial(this.modelNodes[i].ID);
						}
						
						arrayOfTimeSteps.push(this.startTime);
						
						for(j=0;j<this.modelNodes.length;j++)
						{
							var _v;
							if(this.model.getNodeInitial(this.modelNodes[j].ID) == null)
							{
								_v = _calcNULLNodeValue(this.modelNodes[j].ID,nodeEquations);
							}
							else
							{
								_v = this.model.getNodeInitial(this.modelNodes[j].ID);;
							}
							if(this.model.getNodeType(this.modelNodes[j].ID) != 'parameter')
							{
								arrayOfNodeValues[this.modelNodes[j].ID].push(_v);
							}			
							
						}
						break;
					
					case false:
						for(i=startTime+timeStep;i<(endTime-startTime)/timeStep;i=i+timeStep)
						{
							arrayOfTimeSteps.push(i);
							for(j=0;j<this.modelNodes.length;j++)
							{
								if(this.model.getNodeType(this.modelNodes[j].ID) != 'parameter')
								{
									arrayOfNodeValues[this.modelNodes[j].ID].push(_calcNULLNodeValue(this.modelNodes[j].ID,nodeEquations));
								}
							}
						}
						break;

					case default:
					console.error("calculations.js - function: _getNodeValuesByTimeSteps: 'isInitialValue' parameter not defined");
				}
			},
			
			//@brief: this function calculates node value based on node equation
			_calcNULLNodeValue: function(nodeID,nodeEquations)
			{
				//object for storing values of variables to be passed to expression
				var _exprValues = {};
				var _expr,_variable,_k,_value;
				_expr = Parser.parse(nodeEquations[nodeID]);
				_variable = _expr.variables();
				for(_k=0;_k<_variable.length;_k++)
				{
					if(currentNodeValues[_variable[_k]] == null)
					{
						_calcNULLNodeValue(_variable[_k],nodeEquations);
					}
					_exprValues[_variable[_k]] = currentNodeValues[_variable[_k]];
				}
				_value = _expr.evaluate(_exprValues);
				currentNodeValues[nodeID] = _value;
		
				return _value;
			},
			
			//@brief: this function stores names/initial values of all nodes of type parameter and 
			//	      returns total number of 'parameter, nodes in given model
			_storeParametersNameValue: function(arrayOfParameterNames, arrayOfParamInitialValues)
			{
				var i,count=0;
				for(i=0;i<this.modelNodes.length;i++)
				{
					if(this.model.getNodeType(this.modelNodes[j].ID) == 'parameter')
					{
						arrayOfParameterNames[this.modelNodes[i].ID] = this.model.getNodeNameByID(this.modelNodes[i].ID);
						arrayOfParamInitialValues[this.modelNodes[i].ID] = this.model.getNodeInitial(this.modelNodes[i].ID);
						count++;
					}
				}
				return count;
			},
			
			//@brief: this function returns an object having all parameters required for rendering graph and table
			gerParametersForRendering: function(solutionGraph)
			{
				//to be completed
			}
});


