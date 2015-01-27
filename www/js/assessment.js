define([
	"dojo/define", 
	"dojo/_base/array",
	"dojo/json"
], function(define, array, json){
	return define(null, {
	
	constructor: function(/* object */ model, /* object */ schema_session){
		this._model = model;
		this._session = schema_session;
		this.initSchema();
	},

	initSchema: function(){
		this._schemas = this._model.student.getSchemas();
		array.forEach(this._schemas, function(schema){
			this._session.getSchemaApplication(schema.ID).then(function(result){
				var resultJSON = json.parse(result);
				schema.competence = resultJSON.competence; 
			});
		}, this);
	},

	updateSchema: function(/* object */ time, /* object */ errors){
		array.forEach(this._schemas, function(schema){
			if(schema.nodes.indexOf(error.node) >= 0){
				schema.competence.errors += error.errors;
				schema.competence.total += error.total;
				//schema.competence.timeSpent += error.time
			}
		}, this);

		array.forEach(this._schemas, function(schema){
			if(schema.nodes.indexOf(time.node) >= 0){
				schema.competence.timeSpent += time.difference;
			}
		}, this);
	},
	
	saveSchema: function(){
		this._model.student.setSchemas(this._schemas);
		array.forEach(this._schemas, function(schema){
			this._session.updateSchemaApplication(schema.ID, schema.competence);
		}, this);
	},
	
	dummy: function(){
		array.forEach(this._schemas, function(schema){
			var competence = 1 - (schema.competence.errors/schema.competence.total);
			schema.competence.values.push({dummy: competence});
		}, this);
	},
		
	});	
});
