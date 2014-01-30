/**
 * 
 * Test file to load and save Dragoon problems
 * @author: Brandon Strong
 * 
 **/

define(["dojo/_base/declare", "dojo/request/xhr", "dojo/request"]
        , function(declare, xhr, request) {

    return declare(null, {
        constructor: function(/*string*/ id, /*string*/ section, /*string*/ problem, /*string*/ saveData) {
            this.id = id;
            this.section = section;
            this.problem = problem;
            this.saveData = saveData;
        },
        loadFromFile: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            return xhr("/laits/js/json/" + file, {
                handleAs: "text"

            }).then(function(text) {
                return text;
            });
        },
        loadFromDB: function() {
            //Summary: calls author-load-save.php to retrieve a JSON string from the database
            //      and returns it as a Dojo promise
            return request.get("../../author-load-save.php", {
                query: {
                    action: "load",
                    id: this.id,
                    section: this.section,
                    problem: this.problem
                },
            }).then(function(text) {
                return text;
            });
        },
        saveProblem: function() {
            //Summary: saves the string held in this.saveData in the database.
            request.post("../../author-load-save.php", {
                data: {
                    action: "save",
                    id: this.id,
                    section: this.section,
                    problem: this.problem,
                    saveData: this.saveData
                }
            });
        }
    });
});
