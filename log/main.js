define([
	"dojo/ioQuery", 
	"dojo/request/xhr", 
	"dojo/_base/json",
	"dojo/_base/lang"
], function(
	ioQuery, xhr, json, lang
){
	var query = ioQuery.queryToObject(window.location.search.slice(1));

	this.getResults(query).then(function(results)){
		this.objects = results;
		this.displayValues();
	}

	getResults: function(/*json*/ params){
		return xhr.get(this.path + "dashboard_js.php", {
			query: params,
			handleAs: "json"
		}).then(function(results){	 // this makes loadProblem blocking?
			console.log("task objects found in the logs : ", results);
			return results;
		}, function(err){
			console.error("error in dashboard_js, error message : "+error);
		});
	},

	displayValues: function(){

	},

	makeUserProblemGroups: function(){
		var users = array();
		array.forEach(this.objects, function(upObject){
			this.users
		});
	},

	getFile: function(){
		return xhr.get(this.path + "problemOrder.txt", {
			handleAs : "json",
			load: function(object){
				return object
			},
			error: function(err){
				console.log("problemOrder txt returned with error, message : "+err);
			}
		});
	}
});