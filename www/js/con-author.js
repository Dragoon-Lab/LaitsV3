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
                switch(nodeType.toUpperCase()){
                    case "TYPE":
                        if(value.toUpperCase() == "PARAMETER"){
                            //disable inputs and expression
                            var obj = {attribute:"disabled", id:"equation", value:true};
                            returnObj.push(obj);

                            var obj = {attribute:"disabled", id:"authorInput", value:true};
                            returnObj.push(obj);
                        }
                        else if(value.toUpperCase() == "FUNCTION"){
                            var obj = {attribute:"disabled", id:"initial", value:true};
                            returnObj.push(obj);
                        }
                        else{
                            /*no directives need to be setup for accumulator
                            * add code in case new requirements are defined
                            */
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
            lang.mixin(this.authorControlMap, this.widgetMap);
            this.authorControls();
            ready(this, "initAuthorHandles");
        },
        authorControlMap:{
            authorInput:"setInput",
            authorName:"setName",
            authorDescription:"setDescription",
            authorKind:"selectKind",
            authorUnits:"setUnits"
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
            var name = registry.byId(this.authorControlMap.authorName);
            name.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleName.apply(this, arguments);
            }));
            var kind = registry.byId(this.authorControlMap.authorKind);
            kind.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleKind.apply(this, arguments);
            }));
            var description = registry.byId(this.authorControlMap.authorDescription);
            description.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleSetDescription.apply(this, arguments);
            }));
            var units = registry.byId(this.authorControlMap.authorUnits);
            units.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleSetUnits.apply(this, arguments);
            }));

            var inputsWidget = registry.byId(this.authorControlMap.authorInput);
            inputsWidget.on('Change', lang.hitch(this, function(){
                return this.disableHandlers || this.handleInputs.apply(this, arguments);
            }));

        },
        /*
         Handler for type selector
         */
        handleType: function(type){
            // Summary: Sets the type of the current node.
            console.log("****** AUTHOR has chosen type ", type, this);
            if(type == 'defaultSelect')
                return; // don't do anything if they choose default
            this.updateType(type);
            this.applyDirectives(this.authorPM.process(this.currentID,'type', type));
        },
        handleName: function(name){
            console.log("**************** in handleName ", name);

            /* check if node with name already exists and
               if name is parsed as valid variable
            */
            if(!this._model.given.getNodeIDByName(this.currentID) && equation.isVariable(name)){
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
        handleEquation: function(expression){
            //generally this handler is not needed
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
        handleSetDescription: function(setDescription){
            console.log("**************** in handleSetDescription ", setDescription);
            this.handleDescription(setDescription);
        },
        handleSetUnits: function(units){
            // Summary: Sets the units of the current node.
            this._model.active.setUnits(this.currentID, units);
            console.log("**************** in handleSetUnits ", units);
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
            registry.byId(this.authorControlMap.authorName).set('value', name || '', false);

            var desc = this._model.given.getDescription(nodeid);
            console.log('description is', desc || "not set");
            registry.byId(this.authorControlMap.authorDescription).set('value', desc || '', false);

            // populate inputs
            var t = registry.byId(this.authorControlMap.authorInput);

            /*
            *   populate the nodes in input tab
            *   For combo-box we need to setup a data-store which is collection of {name:'', id:''} object
            *
            */
            var dummyArray =[];
            array.forEach(this._model.given.getDescriptions(), function(desc){
                if(desc.label){
                    var name = this._model.given.getName(desc.value);
                    var obj = {name:name, id:desc.id};
                    dummyArray.push(obj);
                }
            }, this);
            var m = new memory({data:dummyArray});
            t.attr("store", m);
        },
        applyDirectives: function(directives){
            array.forEach(directives, function(directive){
                if(this.authorControlMap[directive.id]){
                    var w = registry.byId(this.authorControlMap[directive.id]);
                    if(directive.attribute == 'value'){
                        //write this part later
                    }
                    else{
                        w.set(directive.attribute, directive.value);
                    }
                }
                else{
                    console.warn("Directive with unknown id: " + directive.id);
                }
            }, this)
        }
    });
});
