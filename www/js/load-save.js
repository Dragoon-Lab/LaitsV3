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

    return declare(null, {
        constructor: function(/*string*/ sessionId, /*string*/ path) {
            this.sessionId = sessionId;
            this.path = path || "";
        },

        loadFromFile: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            return xhr(file, {
                handleAs: "json"
            }).then(function(text) {
                return text;
            }, function(err){
	        console.error("loadFromFile failed ", err);
	    });
        },

        loadFromDB: function() {
            //Summary: calls autosave.php to retrieve a JSON string from the database
            //      and returns it as a Dojo promise
            return xhr.get(this.path + "autosave.php", {
                query: {
                    // see documentation/sessions.md for notation
		    x: this.sessionId
                },
                handleAs: "json"
            }).then(function(model_object) {
		console.log("loadFromDB worked");
                return model_object;
            }, function(err){
	        console.error("loadFromDB error ", err);
	    });
        },

        saveProblem: function() {
            //Summary: saves the string held in this.saveData in the database.
            xhr.post(this.path + "autosave.php", {
		data: {
		    model: json.toJson(this.model),
                    // see documentation/sessions.md for notation
                    x: this.sessionId
                }
            }).then(function(reply){
		console.log("saveProblem worked: ", reply);
	    }, function(err){
		console.error("saveProblem error ",err);
	    });
        }
    });
});
