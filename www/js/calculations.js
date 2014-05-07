/* global define, Image */
define([
    "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang",
    "parser/parser"
], function(array, declare, lang, Parser){

    return declare(null, {
    // model
    model: null,
    // model nodes
    modelNodes: null,
    // current node values
    currentNodeValues: {},
    // set current mode. TRUE = givenModel / FALSE = StudentModel
    active: null,

    constructor: function(model, mode){
        this.model = model;
        /* In AUTHOR mode, plot solution for all given nodes of genus false
         and type "accumulator" or "function""
         The table contains the same nodes.

         In student modes, plot solution for all student nodes (of type
         "accumulator" or "function") as well
             as any matching given model node of genus false.
         The table contains only the student nodes.
         */
        this._mode = mode;
    },

    //this function sets mode of model to be student or given
    _setMode: function(mode)
    {
        if(mode)
        {
            this.active = this.model.solution;
        }
        else
        {
            this.active = this.model.student;
        }
        this.modelNodes = this.active.getNodes();
    },

    //@brief: this function will create an object which will return key/value pair of
    //		  node-id/node-equation
    _getAllNodeEquations:function()
    {
        var i, nodeEquations={}, tempStr="";

        for(i=0; i<this.modelNodes.length; i++)
        {

            if(this.active.getType(this.modelNodes[i].ID) == 'accumulator')
            {
                tempStr = this.modelNodes[i].ID + "+" + this.active.getEquation(this.modelNodes[i].ID)+"*" + this.model.getTime().step;
            }
            else
            {
                tempStr = this.active.getEquation(this.modelNodes[i].ID);
            }

            nodeEquations[this.modelNodes[i].ID] = tempStr;
        }

        return nodeEquations;
    },

    //@brief: this function creates an object which stores array of values over timesteps per node
    //e.g object = {id1: array of values over time-steps, id2:array of values over time-steps} etc...
    _createNodeValueArray: function()
    {
        var j, arrayOfNodeValues={};
        for(j=0; j<this.modelNodes.length; j++)
        {
        if(this.active.getType(this.modelNodes[j].ID) != 'parameter')
        {
            arrayOfNodeValues[this.modelNodes[j].ID] = new Array();
        }
        }

        return arrayOfNodeValues;
    },


    //@brief: this function returns an object containing array of values of nodes over given timesteps
    _getNodeValuesByTimeSteps:function(isInitialValue, arrayOfNodeValues, arrayOfTimeSteps, nodeEquations)
    {
        var i, j;
        var time = this.model.getTime();
        //set initial values of all nodes
        switch(isInitialValue)
        {
        case true:

        for(i=0;i<this.modelNodes.length;i++)
        {
            this.currentNodeValues[this.modelNodes[i].ID] = this.active.getInitial(this.modelNodes[i].ID);
        }

        arrayOfTimeSteps.push(time.start.toFixed(2));

        for(j=0;j<this.modelNodes.length;j++)
        {
            var _v;
            if(this.active.getInitial(this.modelNodes[j].ID) == null)
            {
            _v = this._calcNULLNodeValue(this.modelNodes[j].ID, nodeEquations);
            }
            else
            {
            _v = this.active.getInitial(this.modelNodes[j].ID);
                            }
            if(this.active.getType(this.modelNodes[j].ID) != 'parameter')
            {
            arrayOfNodeValues[this.modelNodes[j].ID].push(_v);
            }

        }
        break;

        case false:
                for(i=time.start+time.step; i<time.end; i+= time.step)
        {
            arrayOfTimeSteps.push(i.toFixed(2));
            for(j=0;j<this.modelNodes.length;j++)
            {
            if(this.active.getType(this.modelNodes[j].ID) != 'parameter')
            {
                            var val = this._calcNULLNodeValue(this.modelNodes[j].ID, nodeEquations);
                            if(val == null){
                                delete arrayOfNodeValues[this.modelNodes[j].ID];
                                //break;
                            }
                            else{
                                arrayOfNodeValues[this.modelNodes[j].ID].push(val);
                            }

            }
            }
        }
        break;

        default:
        console.error("calculations.js - function: _getNodeValuesByTimeSteps: 'isInitialValue' parameter not defined");
        }
    },

    //@brief: this function calculates node value based on node equation
    _calcNULLNodeValue: function(nodeID, nodeEquations)
    {
        //object for storing values of variables to be passed to expression
        var _exprValues = {};
        var _expr, _variable, _k, _value;
            try{
                _expr = Parser.parse(nodeEquations[nodeID]);
            }
            catch(err){
                this.currentNodeValues[nodeID] = null;
                return null;
            }

        _variable = _expr.variables();
        for(_k=0;_k<_variable.length;_k++)
        {
        if(this.currentNodeValues[_variable[_k]] == null)
        {
            this._calcNULLNodeValue(_variable[_k], nodeEquations);
        }

                if(this.currentNodeValues[_variable[_k]] == null){
                    break;
                }
                else{
                    _exprValues[_variable[_k]] = this.currentNodeValues[_variable[_k]];
                }

        }

            if(_k<_variable.length){
                _value = null;
            }
            else{
                _value = _expr.evaluate(_exprValues);
                this.currentNodeValues[nodeID] = _value;
            }

        return _value;
    },

    //@brief: this function stores names/initial values of all nodes of type parameter and
    //	      returns total number of 'parameter, nodes in given model
    _storeParametersNameValue: function(arrayOfParameterNames, arrayOfParamInitialValues)
    {
        var i, count=0;
        for(i=0; i<this.modelNodes.length; i++)
        {
        if(this.active.getType(this.modelNodes[i].ID) == 'parameter' || this.active.getType(this.modelNodes[i].ID) == 'accumulator')
        {
            arrayOfParameterNames[count] = this.modelNodes[i].ID;
            arrayOfParamInitialValues[count] = this.active.getInitial(this.modelNodes[i].ID);
            count++;
        }
        }
        return count;
    },

    //@brief: this function returns an object having all parameters required for rendering graph and table
    getParametersForRendering: function(mode)
    {
        //variable to tell function if we are calculating starttime value for node or rest other values
        //This is done as initially few node values can be null and these values need to be setup
        var isInitialValue;
        //variable to get number of nodes of type 'parameter' in given graph
        var noOfParam;
        //arrays to get name and initial values of node type 'parameter'
        var arrayOfParameterNames = [], arrayOfParamInitialValues=[];
        //get key/value pair of node-id/equation in object
        var nodeEquations={};
        //get key/value pair of node-id/array of values over timesteps in object
        var arrayOfNodeValues = {};
        //create an array which stores values of timesteps
        var arrayOfTimeSteps = [];

        //set mode to be student or given
        this._setMode(mode);
        //get equations of all nodes
        nodeEquations = this._getAllNodeEquations();
        //create key/value pair of node-id/array of values
        arrayOfNodeValues = this._createNodeValueArray();
        //set 'isInitialValue' flag to true and find initial values of nodes which are null
        isInitialValue = true;
        this._getNodeValuesByTimeSteps(isInitialValue, arrayOfNodeValues, arrayOfTimeSteps, nodeEquations);
        //set 'isInitialValue' flag to false and find values of nodes over timesteps
        isInitialValue = false;
        this._getNodeValuesByTimeSteps(isInitialValue, arrayOfNodeValues, arrayOfTimeSteps, nodeEquations);
        //get no of parameters/parameter names/initial values for nodes of type 'parameter'
        noOfParam = this._storeParametersNameValue(arrayOfParameterNames, arrayOfParamInitialValues);

        //create object comprising all parameters required for rendering chart and table
        return {
        mode: mode,
        noOfParam: noOfParam,
        arrayOfParameterNames: arrayOfParameterNames,
        arrayOfParamInitialValues: arrayOfParamInitialValues,
        arrayOfTimeSteps: arrayOfTimeSteps,
        arrayOfNodeValues: arrayOfNodeValues
        };

    },

    labelString: function(id){
        // Summary:  Return a string containing the quantity name and any units.
        // id:  Node id for active model; null returns time label
        var label = id?this.model.active.getName(id):"time";
        var units = id?this.model.active.getUnits(id):this.model.getUnits();
        if(units){
        label += " (" + units + ")";
        }
        return label;
    }

    });		
});
