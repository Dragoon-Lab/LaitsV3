define([
	"dojo/_base/declare", "./schemas-load-save"
], function(declare, schemas){
	return declare(schemas, {
		
		constructor: function(){
			this.getAllSchemas();

		},

		makeSchemaWindow: function(){
			//creates schema window html
		}


	});
});
