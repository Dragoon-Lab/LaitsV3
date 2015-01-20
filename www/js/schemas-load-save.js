define([
	"dojo/_base/declare", "dojo/request/xhr", "dojo/_base/json", "dojo/_base/lang"
], function(declare, xhr, json, lang){
	return declare(null, {
		_session_id: null,
		this._path: "",
		this._schemas: "",

		constructor: function (/* string */ session){
			this._session_id = session;	
		},

		getFile: function(/* string */ fileName, /* path */ path){
			path = path || this._path;
			return xhr.get(path + fileName, function(){
				handleAs: text,
				sync: true
			}).then(function(results){
				console.log(fileName + "found, data : " + results);
				return results;
			}, function(err){
				console.error(fileName + " not found, error message :  " + err);
				throw err;
			});
		},

		setSchema: function(/* object */ schema){
			
		},

		getAllSchemas: function(){
			this.getFile("schema.json").then(function(schemas){
				this._schemas = schemas;
			});
		},
	});	
});
