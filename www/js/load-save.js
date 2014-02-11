/* global define */
/**
 * 
 * Test file to load and save Dragoon problems
 * @author: Brandon Strong
 * 
 **/

define([
    "dojo/_base/declare", "dojo/request/xhr", "dojo/_base/json"
],function(declare, xhr, json) {

        // FNV-1a for string, 32 bit version, returning hex.
	var FNV1aHash = function(x){
	    var hash = 0x811c9dc5; // 2166136261
	    for (var i = 0; i < x.length; i++) {
		hash ^= x.charCodeAt(i);
		hash *= 0x01000193; // 16777619
	    }
	    hash &= hash; // restrict to lower 32 bits.
	    // javascript doesn't handle negatives correctly
	    // when converting to hex.
	    if(hash<0){
		hash = 0xffffffff + hash + 1;
	    }
	    return Number(hash).toString(16);
	};

    return declare(null, {

	// The constructor creates a session and sets the sessionId
        // It also sets the path.
        constructor: function(/*object*/ params, /*string*/ path) {
            this.sessionId = FNV1aHash(params.user+"_"+params.section) +
		'_' + new Date().getTime();
	    console.log("New sessionId = ", this.sessionId);
	    console.warn("Need to set up session timing here.");
	    this.path = path || "";
	    // Create a session
	    this.log("start-session", params);
        },

        loadFromFile: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            return xhr(this.path + file, {
                handleAs: "json"
            }).then(function(model_object) {
		console.log("loadFromFile worked");
                return model_object;
            }, function(err){
	        console.error("loadFromFile error ", err);
	    });;
        },

        loadProblem: function(/*object*/ params) {
            //Summary: calls task_fetcher.php to retrieve a problem object
            //      and returns it as a Dojo promise
            console.log("loadProblem called with ", params);
            return xhr.get(this.path + "task_fetcher.php", {
                query: params,
                handleAs: "json"
            }).then(function(model_object) {  // this makes loadProblem blocking?
		console.log("loadFromDB worked");
                return model_object;
            }, function(err){
	        console.error("loadFromDB error ", err);
	    });
        },

        saveProblem: function(model) {
            // Summary: saves the string held in this.saveData in the database.
            xhr.post(this.path + "save_solution.php", {
		data: {
		    sg: json.toJson(model),
                    // see documentation/sessions.md for notation
                    x: this.sessionId
                }
            }).then(function(reply){  // this makes saveProblem blocking?
		console.log("saveProblem worked: ", reply);
	    }, function(err){
		console.error("saveProblem error ",err);
	    });
        },

	log: function(method, params){
	    console.warn("should add session time to params");
            xhr.post(this.path + "logger.php", {
		data: {
		    method: method,
		    message: json.toJson(params),
                    x: this.sessionId
                }
            }).then(function(reply){
		console.log("logging " + method + " worked: ", reply);
	    }, function(err){
		console.error("logging " + method + " error ",err);
	    });
	}
    });
});
