define([
	"dojo/_base/declare", 
	"dojo/_base/array",
	"dojo/json",
	"./schemas-load-save"
], function(declare, array, json, schemaSession){
	return declare(null, {
	
	constructor: function(/* object */ model, /* object */ session){
		this._model = model;
		this._session = new schemaSession(session);
		this.initSchema();
		this.initSchemaSession();
	},

	initSchemaSession: function(){
		array.forEach(this._schemas, function(schema){
			this._session.logSchema(schema.ID, schema.difficulty);
		}, this);
	},

	initSchema: function(){
		this._schemas = this._model.student.getSchemas();
		array.forEach(this._schemas, function(schema){
			var resultJSON;
			this._session.getSchemaApplication(schema.ID).then(function(result){
				resultJSON = result;
			});
			resultJSON = json.parse(resultJSON);
			if(resultJSON.competence){
				schema.competence = resultJSON.competence;
			}
		}, this);
	},

	updateSchema: function(/* object */ time, /* object */ errors){
		if(time.given == ""){
			time.given = this._model.student.getDescriptionID(time.node);
		}

		if(errors.given == ""){
			errors.given = this._model.student.getDescriptionID(errors.node);
		}
		if(errors.given){
			array.forEach(this._schemas, function(schema){
				if(schema.nodes.indexOf(errors.given) >= 0){
					schema.competence.errors += errors.errors;
					schema.competence.total += errors.total;
					//schema.competence.timeSpent += error.time
				}
			}, this);
		}

		if(time.given){
			array.forEach(this._schemas, function(schema){
				if(schema.nodes.indexOf(time.given) >= 0){
					schema.competence.timeSpent += time.difference;
				}
			}, this);
		}
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
			schema.competence.values.dummy = competence;
		}, this);
	}
		
	});	
});
