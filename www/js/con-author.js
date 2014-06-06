/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
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
            process: function(nodeID, nodeType, value, validInput){
                var returnObj=[];
                switch(nodeType){
                    case "type":
                        returnObj.push({attribute:"status",id:"type",value:"entered"});
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
                            returnObj[0].value="incorrect";
                            returnObj.push({id:"message",attribute:"append",value:"Please select node type"});
                            this.logging.clientLog("error", {
                                message: "wrong choice for node type",
                                functionTag: "authorPM process"
                            });
                        }
                        break;

                    case "name":
                        if(!nodeID && validInput){
                            returnObj.push({id:"message",attribute:"append",value:"node name is available for use"});
                            returnObj.push({id:"name",attribute:"status",value:"entered"});
                        } else if(!validInput){
                            returnObj.push({id:"message",attribute:"append",value:"Please enter a valid name without using numbers"});
                            returnObj.push({id:"name",attribute:"status",value:"incorrect"});
                        }
                        else{
                            returnObj.push({id:"message",attribute:"append",value:"node name is already in use"});
                            returnObj.push({id:"name",attribute:"status",value:"incorrect"});
                        }
                        break;

                    case "kind":
                        var message="";
                        returnObj.push({id:"kind",attribute:"status",value:"entered"});
                        if(value == "allowed"){
                            message  = "One may include this quantity in a solution, but they can solve the problem without it.";
                        }
                        else if(value == "extra"){
                            message  = "This quantity is mentioned in the problem description, but it not part of a valid model.";
                        }
                        else if(value == "irrelevant"){
                            message  = "This quantity is not part of a valid solution and is not mentioned in the description.";
                        }
                        else{
                            message = "Solution quantity";
                        }
                        returnObj.push({id:"message",attribute:"append",value:message});
                        break;

                    case "description":
                        if(validInput){
                            returnObj.push({id:"message",attribute:"append",value:"Description is available for use"});
                            returnObj.push({id:"description",attribute:"status",value:"entered"});
                        }
                        else
                        {
                            returnObj.push({id:"message",attribute:"append",value:"Description is not available for use"});
                            returnObj.push({id:"description",attribute:"status",value:"incorrect"});
                        }
                        break;

                    case "initial":
                        returnObj.push({id:"initial",attribute:"status",value:"entered"});
                        break;

                    case "inputs":
                        returnObj.push({id:"inputs",attribute:"status",value:"entered"});
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
            this.applyDirectives(this.authorPM.process(this._model.given.getNodeIDByName(name)?!(this._model.given.getNodeIDByName(name)==this.currentID):null,'name',name, equation.isVariable(name)));
            console.log(equation.isVariable(name));
            if(!this._model.given.getNodeIDByName(name) && equation.isVariable(name)){
                // check all nodes in the model for equations containing name of this node
                // replace name of this node in equation with its ID
                this._model.active.setName(this.currentID, name);
                this.updateNodes();
                this.setConnections(this._model.active.getInputs(this.currentID), this.currentID);

                this.updateEquationLabels();
            }
        },

        handleKind: function(kind){
            console.log("**************** in handleKind ", kind);
            this._model.given.setGenus(this.currentID, kind);
            this.applyDirectives(this. authorPM.process(this.currentID, "kind", kind));
        },

        handleDescription: function(description){
            // Summary: Checks to see if the given description exists; if the
            //      description doesn't exist, it sets the description of the current node.
            var valInp;
            if(!this._model.active.getNodeIDByDescription(description) || description === ""){

                this._model.active.setDescription(this.currentID, description);
                console.log("In AUTHOR mode. Description value is: " + description);
                valInp = true;
            }
            else {
                this._model.active.setDescription(this.currentID, description);
                console.warn("In AUTHOR mode. Attempted to use description that already exists: " + description);
                valInp = false;
            }
            this.applyDirectives(this.authorPM.process(this.currentID,"description",description, valInp));
        },

        handleType: function(type){
            // Summary: Sets the type of the current node.
            console.log("****** AUTHOR has chosen type ", type, this);
            this.applyDirectives(this.authorPM.process(this.currentID,'type', type));
            if(type == 'defaultSelect')
                return; // don't do anything if they choose default
            this.updateType(type);
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
            /*
             Evaluate only if the value is changed.

             The controller modifies the initial value widget so that a "Change" event is
             fired if the widget loses focus.  This may happen when the node editor is closed.
             */
            if(!initial || initial == this.lastInitialValue){
                return;
            }
            this.lastInitialValue = initial;

            this._model.active.setInitial(this.currentID, initial);
            this.applyDirectives(this.authorPM.process(this.currentID,"initial",initial));
            console.log("In AUTHOR mode. Initial value is: " + initial);
        },
        handleInputs: function(name){
            console.log("In AUTHOR mode. Input selected is: " + name);
            this.equationInsert(name);
            this.applyDirectives(this.authorPM.process(this.currentID,"inputs",name));
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
                this.logging.clientLog("error", {
                    message: "bad parsing",
                    functionTag: 'equationDoneHandler'
                });
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

            var value;
            //find whether node is created for first time or NOT
            if(!this._model.given.getName(this.currentID)        && !this._model.given.getGenus(this.currentID) &&
                !this._model.given.getDescription(this.currentID) && !this._model.given.getType(this.currentID)  &&
                !this._model.given.getInitial(this.currentID)     && !this._model.given.getUnits(this.currentID) &&
                !this._model.given.getEquation(this.currentID)    && this._model.given.getInputs(this.currentID).length == 0){
                console.log("node created for first time", this.currentID);
            }
            else{
                //node is not created for the first time. apply colors to widgets
                //color name widget
                if(!this._model.given.getName(this.currentID)){
                    value = "incorrect";
                }
                else{
                    value = "entered";
                }
                this.applyDirectives([{id:"name",attribute:"status",value:value}]);

                //color kind widget
                this.applyDirectives([{id:"kind",attribute:"status",value:"entered"}]);

                //color description widget
                if(!this._model.given.getDescription(this.currentID)){
                    value = "incorrect";
                }
                else{
                    value = "entered";
                }
                this.applyDirectives([{id:"description",attribute:"status",value:value}]);

                var type = this._model.given.getType(this.currentID);
                //color type widget
                if(!type){
                    value = "incorrect";
                }
                else{
                    value = "entered";
                    this.applyDirectives(this.authorPM.process(this.currentID, 'type', type));
                }
                this.applyDirectives([{id:"type",attribute:"status",value:value}]);

                if(type && type != 'function'){
                    if(this._model.given.getInitial(this.currentID))
                        this.applyDirectives([{id:"initial",attribute:"status",value:"entered"}]);
                }

                if(type && type != 'parameter'){
                    if(this._model.given.getInputs(this.currentID)!= '')
                        this.applyDirectives([{id:"inputs",attribute:"status",value:"entered"}]);
                }

                if(this._model.given.getUnits(this.currentID))
                    this.applyDirectives([{id:"units",attribute:"status",value:"entered"}]);

            }
        },
        updateModelStatus: function(desc){
            //stub for updateModelStatus
        }
    });
});
