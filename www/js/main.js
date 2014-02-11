/* global define */
define([
    "dojo/io-query",
    "dragoon/load-save"
       ],function(ioQuery, loadSave, model){ 
    console.log("load main.js");
   
    // Get session parameters
    var query={};
    if(window.location.search){
	query = ioQuery.queryToObject(window.location.search.slice(1));
    } else {
        console.warn("Should have method for logging this to Apache log files.");
        console.warn("Dragoon log files won't work since we can't set up a session.");
	console.error("Function called without arguments");
    }

    // Start up new session and get model object from server
    var session = new loadSave(query);	   
    session.loadProblem(query).then(function(solutionGraph){
	console.info("Have solution: ", solutionGraph);
    });
});
