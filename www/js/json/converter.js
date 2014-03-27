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
        convertXMLtoJSON: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            var currentPath = this.path + "../../../../problems/"
            return xhr(currentPath + file, {
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

                this.start = Number(jsdom.getElementsByTagName("StartTime")[0].childNodes[0].nodeValue);
                this.end = Number(jsdom.getElementsByTagName("EndTime")[0].childNodes[0].nodeValue);
                this.units = jsdom.getElementsByTagName("Units")[0].childNodes[0].nodeValue;
                this.timeStep = (Number(jsdom.getElementsByTagName("TimeStep")[0] && jsdom.getElementsByTagName("TimeStep")[0].childNodes[0].nodeValue)) || 0.5;
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
                    if (this.nodes.getAttributeNode("level")) {
                        console.log("Node " + i + " is a desc tree");
                        break;
                    } else {

                        var name = this.nodes.getAttributeNode("name").nodeValue;
                        var extra = this.nodes.getAttributeNode("extra").nodeValue;
                        if (extra === "yes")
                            extra = true;
                        else
                            extra = false;
                        var parent = false;
                        if (this.nodes.getElementsByTagName("Order").length > 0) {
                            parent = this.nodes.getElementsByTagName("Order")[0].childNodes[0].nodeValue;
                            if (parent == 1)
                                parent = true;
                            else
                                parent = false;
                        }
                        var type = this.nodes.getAttributeNode("type").nodeValue;
                        if (type === "constant")
                            type = "parameter";
                        else if (type === "stock")
                            type = "accumulator";
                        else if (type === "flow")
                            type = "function";
                        var description = (this.nodes.getElementsByTagName("CorrectDescription")[0].childNodes[0] && this.nodes.getElementsByTagName("CorrectDescription")[0].childNodes[0].nodeValue) || null;
                        if (type === "constant")
                            type = "parameter";
                        var id = this.model.given.addNode({
                            "name": name,
                            "type": type,
                            "parentNode": parent,
                            "extra": extra,
                            "units": "",
                            "description": description
                        });
                    }
                }


                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    if (this.nodes.getAttributeNode("level")) {
                        console.log("Node " + i + " is a desc tree");
                        break;
                    } else {
                        var name = this.nodes.getAttributeNode("name").nodeValue;
                        var id = this.model.given.getNodeIDByName(name);
                        var type = this.model.given.getType(id);

                        var initial = (Number(this.nodes.getElementsByTagName("InitialValue")[0].childNodes[0] && this.nodes.getElementsByTagName("InitialValue")[0].childNodes[0].nodeValue)) || null;
                        var equation = (this.nodes.getElementsByTagName("Equation")[0].childNodes[0] && this.nodes.getElementsByTagName("Equation")[0].childNodes[0].nodeValue) || null;

                        if (type !== "function")
                            this.model.given.setInitial(id, initial);

                        if (type !== "parameter") {
                            console.log(this.model.getModelAsString());
                            var regex = /([\+\-\*\/])/;
                            var eq = equation.split(regex);
                            var finalEquation = "";
                            console.log(eq);
                            for (var k = 0; k < eq.length; k++) {
                                if (eq[k] !== "+" && eq[k] !== "-" && eq[k] !== "*" && eq[k] !== "/" && eq[k] !== "") {
                                    eq[k] = eq[k].trim();
                                    eq[k] = this.model.given.getNodeIDByName(eq[k]);
                                }
                                finalEquation += eq[k];
                                if (k < eq.length - 1)
                                    finalEquation += " ";
                            }
                            finalEquation = finalEquation.trim();
                            console.log(eq);
                            this.model.given.setEquation(id, finalEquation);
                        }
                    }
                }



                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    if (this.nodes.getAttributeNode("level")) {
                        console.log("Node " + i + " is a desc tree");
                        break;
                    } else {
                        this.nodes = jsdom.getElementsByTagName("Node")[i];
                        var inputs = new Array();
                        if (!this.nodes.getAttributeNode("level")) {
                            this.inputs = this.nodes.getElementsByTagName("Inputs");
                            for (var j = 0; j < this.inputs[0].getElementsByTagName("Name").length; j++) {
                                inputs.push(this.model.given.getNodeIDByName(this.inputs[0].getElementsByTagName("Name")[j].childNodes[0].nodeValue));
                            }
                            this.model.given.setInputs(inputs, this.model.given.getNodeIDByName(this.nodes.getAttributeNode("name").nodeValue));
                        }
                    }
                }

                //opens a new window and downloads the file
                //window.open('data:text;charset=utf-8,' + escape(this.model.getModelAsString()));

                var download = function(filename, text) {
                    var pom = document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                };
                var fileSplit = file.split(".");
                file = fileSplit[0];
                download(file + ".json", this.model.getModelAsString());
                console.log(this.model.getModelAsString());


                return this.model.getModelAsString();
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