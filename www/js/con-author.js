/* global define */
/*
 * AUTHOR mode-specific handlers
 */
define([
    "dojo/_base/array", 'dojo/_base/declare', "dojo/_base/lang",
    'dojo/dom-style', 'dojo/ready',
    'dijit/registry',
    './controller',
    "./equation",
    "dojo/store/Memory",
    "dojo/domReady!"

], function(array, declare, lang, style, ready, registry, controller, equation, memory){

    return declare(controller, {
        //pedagogical module class for author
        authorPM:{
            process: function(nodeID, nodeType, value){
                var returnObj=[];
                switch(nodeType){
                    case "type":
                        if(value == "parameter"){
                            //disable inputs and expression
                            returnObj.push({attribute:"disabled", id:"initial", value:false});

                            returnObj.push({attribute:"disabled", id:"inputs", value:true});

                            returnObj.push({attribute:"disabled", id:"equation", value:true});
                        }
                        else if(value == "function"){
                            returnObj.push({attribute:"disabled", id:"initial", value:true});

                            returnObj.push({attribute:"disabled", id:"inputs", value:false});

                            returnObj.push({attribute:"disabled", id:"equation", value:false});
                        }
                        else if(value == "accumulator"){
                            returnObj.push({attribute:"disabled", id:"initial", value:false});

                            returnObj.push({attribute:"disabled", id:"inputs", value:false});

                            returnObj.push({attribute:"disabled", id:"equation", value:false});
                        }
                        else{
                            console.error("wrong choice");
                        }
                        break;

                    default:
                        console.log("");
                }
                return returnObj;
            }
        },
        constructor: function(){
            console.log("++++++++ In author constructor");
            lang.mixin(this.widgetMap, this.controlMap);
            this.authorControls();
            ready(this, "initAuthorHandles");
        },
        controlMap: {
            inputs:"setInput",
            name:"setName",
            description:"setDescription",
            kind:"selectKind",
            units:"setUnits"
        },
        authorControls: function(){
            console.log("++++++++ Setting AUTHOR format in Node Editor.");
            style.set('nameControl', 'display', 'block');
            style.set('descriptionControlStudent', 'display', 'none');
            style.set('descriptionControlAuthor', 'display', 'block');
            style.set('selectUnitsControl', 'display', 'none');
            style.set('setUnitsControl', 'display', 'inline');
            style.set('inputControlAuthor', 'display', 'block');
            style.set('inputControlStudent', 'display', 'none');
        },
        initAuthorHandles: function(){
            var name = registry.byId(this.controlMap.name);
            name.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleName.apply(this, arguments);
            }));
            var kind = registry.byId(this.controlMap.kind);
            kind.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleKind.apply(this, arguments);
            }));
        },
        /*
         Handler for type selector
         */
        handleName: function(name){
            console.log("**************** in handleName ", name);

            /* check if node with name already exists and
               if name is parsed as valid variable
            */
            if(!this._model.given.getNodeIDByName(name) && equation.isVariable(name)){
                // check all nodes in the model for equations containing name of this node
                // replace name of this node in equation with its ID
                this._model.active.setName(this.currentID, name);
                this.updateNodes();
                this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);

        	this.updateEquationLabels();
            }else {

                console.error("Node name already exists OR node name is not valid variable.  Need message for student!");
            }
        },

        handleKind: function(kind){
            console.log("**************** in handleKind ", kind);
            if(kind == "given"){
                this._model.given.setGenus(this.currentID,"");
            }
            else{
                this._model.given.setGenus(this.currentID, kind);
            }
        },

        handleDescription: function(description){
            // Summary: Checks to see if the given description exists; if the
            //      description doesn't exist, it sets the description of the current node.
            if(!this._model.active.getNodeIDByDescription(description)){
                this._model.active.setDescription(this.currentID, description);
                console.log("In AUTHOR mode. Description value is: " + description);
            }else {
                console.warn("In AUTHOR mode. Attempted to use description that already exists: " + description);
            }
        },

        handleType: function(type){
            // Summary: Sets the type of the current node.
            console.log("****** AUTHOR has chosen type ", type, this);
            if(type == 'defaultSelect')
                return; // don't do anything if they choose default
            this.updateType(type);
            this.applyDirectives(this.authorPM.process(this.currentID,'type', type));
        },
        handleUnits: function(units){
            console.log("**************** in handleUnits ", units);
            // Summary: Sets the units of the current node.
            this._model.active.setUnits(this.currentID, units);
        },
        /*
         Handler for initial value input
         */
        handleInitial: function(initial){
            // Summary: Sets the initial value of the current node.
            this._model.active.setInitial(this.currentID, initial);
            console.log("In AUTHOR mode. Initial value is: " + initial);
        },
        handleInputs: function(name){
            console.log("In AUTHOR mode. Input selected is: " + name);
            this.equationInsert(name);
        },
        equationDoneHandler: function(){
            console.log("Inside equationDone handler");
            var widget = registry.byId(this.controlMap.equation);
            var expression = widget.get("value");
            var parse = equation.parse(expression);
            if(parse){
                this._model.given.setEquation(this.currentID, expression);
                // for every variable in the equation, check if variable matches with
                // node name. If yes, replace node name with its ID
                array.forEach(parse.variables(), lang.hitch(this, function(variable){
                    if(this._model.given.getNodeIDByName(variable)){
                        var nodeId = this._model.given.getNodeIDByName(variable);
                        equation.addQuantity(nodeId, this._model.given);
                        this.setConnections(this._model.given.getInputs(this.currentID), this.currentID);
                    }
                }));
            }
            else{
                console.error("bad parsing");
            }
        },
        initialControlSettings: function(nodeid){
	    var name = this._model.given.getName(nodeid);
            registry.byId(this.controlMap.name).set('value', name || '', false);

            var desc = this._model.given.getDescription(nodeid);
            console.log('description is', desc || "not set");
            registry.byId(this.controlMap.description).set('value', desc || '', false);

            // populate inputs
            var inputsWidget = registry.byId(this.controlMap.inputs);
	    var nameWidget = registry.byId(this.controlMap.name);
	    var descriptionWidget = registry.byId(this.controlMap.description);
	    var unitsWidget = registry.byId(this.controlMap.units);

            /*
            *   populate the nodes in the Name, Description, Units, and Inputs tab
            *   For combo-box we need to setup a data-store which is collection of {name:'', id:''} object
            *
            */
            var dummyArray =[];
	    var descriptions = [];
	    var units = [];
            array.forEach(this._model.given.getDescriptions(), function(desc){
                if(desc.label){
                    var name = this._model.given.getName(desc.value);
                    var obj = {name:name, id:desc.id};
                    dummyArray.push(obj);
		    descriptions.push({name: this._model.given.getDescription(desc.value), id: desc.id});
		    units.push({name: this._model.given.getUnits(desc.value), id: desc.id});
                }
            }, this);
            var m = new memory({data:dummyArray});
            inputsWidget.set("store", m);
            nameWidget.set("store", m);
	    m = new memory({data: descriptions});
	    descriptionWidget.set("store", m);
	    m = new memory({data: units});
	    units.push("store", m);
        },
        updateModelStatus: function(desc){
            //stub for updateModelStatus
        }
    });
});
