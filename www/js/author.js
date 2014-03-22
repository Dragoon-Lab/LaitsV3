/* global define */
/*
 *                          AUTHOR mode-specific handlers
 */
define([
    'dojo/_base/declare',"dojo/_base/lang",
    'dojo/dom-style',
    'dijit/registry'
], function(declare, lang, style, registry) {
    
    return declare(null, {

	authorControls: function(){
	    console.log("++++++++ Setting AUTHOR format in Node Editor.");
	    style.set('nameControl', 'display', 'block');
	    style.set('descriptionControlStudent', 'display', 'none');
	    style.set('descriptionControlAuthor', 'display', 'block');
	    style.set('selectUnits', 'display', 'none');
	    style.set('setUnitsControl', 'display', 'inline');
	},

	initAuthorHandles: function(){
	    var name = registry.byId("setName");
	    name.on('Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleName.apply(this, arguments);
	    }));
	    var kind = registry.byId("selectKind");
	    kind.on('Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleKind.apply(this, arguments);
	    }));
	    var description = registry.byId("setDescription");
	    description.on('Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleSetDescription.apply(this, arguments);
	    }));
	    var units = registry.byId("setUnits");
	    units.on('Change',  lang.hitch(this, function(){
		return this.disableHandlers || this.handleSetUnits.apply(this, arguments);
	    }));

	},

	handleName: function(name){
	    console.log("**************** in handleName ", name);
	    this._nodeEditor.set('title', this._model.active.getName(this.currentID));
	    this._model.active.setName(this.currentID, name);
	},

	handleKind: function(kind){
	    console.log("**************** in handleKind ", kind);
	},

	handleSetDescription: function(setDescription){
	    console.log("**************** in handleSetDescription ", setDescription);
	    this.handleDescription(setDescription);
	},

	handleSetUnits: function(units){
	    console.log("**************** in handleSetUnits ", units);
	}

    });
});
