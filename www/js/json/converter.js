define(["dojo/_base/declare", "dragoon/model", "dojo/request/xhr", "dojox/xml/parser",
    "dojo/_base/array", "dojo/_base/lang"
], function(declare, model, xhr, parser, array, lang) {

    return declare(null, {
        constructor: function(a) {
            this.theVar = a;
            this.model = {};
        },
        taskName: null,
        phase: null,
        type: null,
        test: function() {
            console.log(this.theVar);
        },
//        load: function(theString) {
//            var load = new loadSave(ioQuery.queryToObject(window.location.search.slice(1)));
//            load.loadXMLFromFile(theString);
//        }
        loadXMLFromFile: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            return xhr(this.path + file, {
                handleAs: "text"
            }).then(function(model_object) {
                console.log("loadXMLFromFile worked");

                //var theParser = new parser(model_object);
                console.log(model_object);
                var jsdom = dojox.xml.parser.parse(model_object);
                console.log("Object: ", jsdom);

                //Information to create the JSON object
                this.taskName = jsdom.getElementsByTagName("TaskName")[0].childNodes[0].nodeValue;
                this.phase = jsdom.getElementsByTagName("Task")[0].getAttributeNode("phase").nodeValue;
                this.type = jsdom.getElementsByTagName("Task")[0].getAttributeNode("type").nodeValue;

                this.start = jsdom.getElementsByTagName("StartTime")[0].childNodes[0].nodeValue;
                this.end = jsdom.getElementsByTagName("EndTime")[0].childNodes[0].nodeValue;
                this.units = jsdom.getElementsByTagName("Units")[0].childNodes[0].nodeValue;
                this.timeStep = (jsdom.getElementsByTagName("TimeStep")[0] && jsdom.getElementsByTagName("TimeStep")[0].childNodes[0].nodeValue) || .5;
                this.timeUnits = jsdom.getElementsByTagName("Units")[0].childNodes[0].nodeValue;
                this.URL = jsdom.getElementsByTagName("URL")[0].childNodes[0].nodeValue;
                this.description = jsdom.getElementsByTagName("TaskDescription")[0].childNodes[0].nodeValue;

                this.description = this.description.replace(/NEWLINE/g, "").replace(/\n/g, "").replace(/ +/g, " ");

                //Creqtes model and adds properties
                this.model = new model("AUTHOR", this.taskName, {"phase": this.phase, "type": this.type});
                this.model.setTime({start: this.start, end: this.end, step: this.timeStep, units: this.units});
                this.model.setTaskDescription(this.description);
                this.model.setPhase(this.phase);
                this.model.setType(this.type);
                this.model.setImage({URL: this.URL});

                this.length = jsdom.getElementsByTagName("Node")[0].childNodes[0].length;

                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    if (this.nodes.getAttributeNode("level"))
                        console.log("Node " + i + " is a desc tree");
                    else {
                        
                        var name = this.nodes.getAttributeNode("name").nodeValue;
                        console.log(name);
                        var type = this.nodes.getAttributeNode("type").nodeValue;
                        console.log(type);
                        var equation = (this.nodes.getElementsByTagName("Equation")[0] && jsdom.getElementsByTagName("Equation")[0].childNodes[0].nodeValue) || null;
                        console.log(equation);
                        var initial = (this.nodes.getElementsByTagName("InitialValue")[0] && jsdom.getElementsByTagName("InitialValue")[0].childNodes[0].nodeValue) || null;
                        console.log(initial);
                        var description = (this.nodes.getElementsByTagName("CorrectDescription")[0] && jsdom.getElementsByTagName("CorrectDescription")[0].childNodes[0].nodeValue) || null;
                        console.log(description);
                        if (type === "constant")
                            type = "parameter";
                        this.model.given.addNode({
                            "name": name,
                            "type": type,
                            "initial": initial,
                            "equation": equation,
                            "description": description
                        });
                    }
                }
                
                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    var inputs = new Array();
                    if (!this.nodes.getAttributeNode("level")){
                        this.inputs = this.nodes.getElementsByTagName("Inputs");
                        for(var j = 0; j < this.inputs.length; j++){
                            inputs[j] = this.model.getNodeIDByName(this.inputs[0].getElementsByTagName("Name")[1].childNodes[0].nodeValue);
                        }
                        this.model.setInputs(inputs, this.nodes.getAttributeNode("name").nodeValue);
                    }
                }
                
                this.nodes = jsdom.getElementsByTagName("Node")[6];
                this.inputs = this.nodes.getElementsByTagName("Inputs");
                console.log(this.inputs);
                alert(this.inputs[0].getElementsByTagName("Name")[1].childNodes[0].nodeValue);
//                alert(this.nodes.getElementsByTagName("Name")[0].childNodes[0].nodeValue);
                
//                console.log(this.nodes.getElementsByTagName("Equation")[0].childNodes[0].nodeValue);
//                console.log(this.nodes.getAttributeNode("name").nodeValue);






                console.log(this.model.getModelAsString());


                return model_object;
            }, function(err) {
                console.error("loadFromFile error ", err);
            });
        }
    });
});



//define(["dojo/_base/declare"]
//        , function(declare) {
//
//    return declare(null, {
//        constructor: function(/*string*/ user, /*model.js object*/model) {
//            this.userType = user;
//            this.model = model;
//            this.descCounterB = 0;
//            this.descCounterC = 0;
//            this.descCounterD = 0;
//            this.descCounterG = 0;
//            this.descCounterH = 0;
//            this.descCounterJ = 0;
//            this.descCounterL = 0;
//            this.typeCounter = 0;
//            this.initialCounter = 0;
//            this.unitsCounter = 0;
//            this.equationCounter = 0;
//        },
//        descriptionAction: function(/*string*/ answer) {
//            var id = this.model.getNodeIDByDescription(answer);
//            var interpretation;
//            alert(id);
//            if(this.model.isParentNode(id)){
//                this.model.addStudentNodeWithName(this.model.getNodeName);
//                interpretation = "optimal";
//            }else if(this.model.isNodesParentVisible){
//                this.model.addStudentNodeWithName(this.model.getNodeName);
//                interpretation = "optimal";
//            }
//            switch (this.userType) {
//                case "coached":
//                    break;
//                case "feedback":
//                    break;
//                case "test":
//                    break;
//                case "power":
//                    break;
//            }
//        }
//    });
//});