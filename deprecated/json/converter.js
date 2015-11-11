/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/**
 * 
 * Converter for the Dragoon project to change problems from the 
 * Java version from XML to JSON for the JavaScript version.
 * 
 * @author: Brandon Strong
 * 
 **/

define(["../../www/dojo/_base/declare", "dragoon/model", "dojo/request/xhr", "dojox/xml/parser",
    "dojo/_base/array", "dojo/_base/lang"
], function(declare, model, xhr, parser, array, lang) {

    return declare(null, {
        constructor: function() {
            this.model = {};
        },
        convertXMLtoJSON: function(/*string*/ file) {
            //Summary: retrieves the text of a given file and returns it as a Dojo promise
            var localPath = "../../../../problems/";
            console.log("Local path is:", localPath);
            var currentPath = this.path + localPath;
            return xhr(currentPath + file, {
                handleAs: "text"
            }).then(function(model_object) {
                console.log("XML file Loaded.");

                //var theParser = new parser(model_object);
                console.log(model_object);
                var jsdom = dojox.xml.parser.parse(model_object);
                console.log("Object: ", jsdom);

                //Information to create the JSON object
                this.taskName = (jsdom.getElementsByTagName("TaskName")[0].childNodes[0] && jsdom.getElementsByTagName("TaskName")[0].childNodes[0].nodeValue) || null;
                this.phase = jsdom.getElementsByTagName("Task")[0].getAttributeNode("phase").nodeValue;
                this.type = jsdom.getElementsByTagName("Task")[0].getAttributeNode("type").nodeValue;

                //Additional general properties for the problem
                this.start = Number(jsdom.getElementsByTagName("StartTime")[0].childNodes[0].nodeValue);
                this.end = Number(jsdom.getElementsByTagName("EndTime")[0].childNodes[0].nodeValue);
                this.units = jsdom.getElementsByTagName("Units")[0].childNodes[0].nodeValue;
                this.timeStep = (Number(jsdom.getElementsByTagName("TimeStep")[0] && jsdom.getElementsByTagName("TimeStep")[0].childNodes[0].nodeValue)) || 0.5;
                this.timeUnits = jsdom.getElementsByTagName("Units")[0].childNodes[0].nodeValue;
                this.URL = jsdom.getElementsByTagName("URL")[0].childNodes[0].nodeValue;

                //Retrieve the description and remove NEWLINE commands and extra white space.
                this.description = (jsdom.getElementsByTagName("TaskDescription")[0].childNodes[0] && jsdom.getElementsByTagName("TaskDescription")[0].childNodes[0].nodeValue) || "";
                this.description = this.description.replace(/NEWLINE/g, "").replace(/\n/g, "").replace(/ +/g, " ");

                //Creates model and adds properties
                console.log("Creating model...");
                this.model = new model("AUTHOR", this.taskName, {"phase": this.phase, "type": this.type});
                this.model.setTime({start: this.start, end: this.end, step: this.timeStep, units: this.units});
                this.model.setTaskDescription(this.description);
                this.model.setPhase(this.phase);
                this.model.setType(this.type);
                this.model.setImage({URL: this.URL});
                console.log("Model created.");

                //Parse through the nodes and retrieve needed information.
                this.length = jsdom.getElementsByTagName("Node").length;

                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    if (this.nodes.getAttributeNode("level")) { //This causes the description tree to be ignored--not needed in JavaScript version
                        console.log("Node " + i + " is a description tree. Finished parsing nodes for initial attributes.");
                        break;
                    } else {
                        if (this.nodes.hasAttribute("extra")) { //Quick workaround to ensure that the node is a full node, not a reference to a node
                            //Retrieve attributes of the node
                            var name = this.nodes.getAttributeNode("name").nodeValue;
                            var extra = (this.nodes.getAttributeNode("extra") && this.nodes.getAttributeNode("extra").nodeValue) || null;
                            //Convert extra to true or false
                            if (extra === "yes")
                                extra = true;
                            else
                                extra = false;
                            //Assign parent based on <Order> tag being set to 1 is XML
                            var parent = false;
                            if (this.nodes.getElementsByTagName("Order").length > 0) {
                                parent = this.nodes.getElementsByTagName("Order")[0].childNodes[0].nodeValue;
                                if (parent == 1)
                                    parent = true;
                                else
                                    parent = false;
                            }
                            //Retrieve type; update deprecated language for node type
                            var type = this.nodes.getAttributeNode("type").nodeValue;
                            if (type === "constant")
                                type = "parameter";
                            else if (type === "stock")
                                type = "accumulator";
                            else if (type === "flow")
                                type = "function";
                            var description = (this.nodes.getElementsByTagName("CorrectDescription")[0].childNodes[0] && this.nodes.getElementsByTagName("CorrectDescription")[0].childNodes[0].nodeValue) || null;
                            
                            //Add node with attributes
                            var id = this.model.given.addNode({
                                "name": name,
                                "type": type,
                                "parentNode": parent,
                                "extra": extra,
                                "units": "",
                                "description": description
                            });
                            console.log("Added node: " + id + " (" + name + ")");
                        }
                    }
                }
                
                //Parse through the nodes a second time to retrieve additional 
                //      information as inputs and equation cannot be set until 
                //      nodes they refer to are added to the model
                for (var i = 0; i < this.length; i++) {
                    this.nodes = jsdom.getElementsByTagName("Node")[i];
                    if (this.nodes.getAttributeNode("level")) { //This causes the description tree to be ignored--not needed in JavaScript version
                        console.log("Node " + i + " is a description tree. Finished parsing nodes for equations.");
                        break;
                    } else {
                        if (this.nodes.hasAttribute("extra")) { //Quick workaround to ensure that the node is a full node, not a reference to a node
                            //Retrieve needed attributes from the model to process missing attributes
                            var name = this.nodes.getAttributeNode("name").nodeValue;
                            var id = this.model.given.getNodeIDByName(name);
                            var type = this.model.given.getType(id);
                            
                            //Obtain initial and equation attributes
                            var initial = (Number(this.nodes.getElementsByTagName("InitialValue")[0].childNodes[0] && this.nodes.getElementsByTagName("InitialValue")[0].childNodes[0].nodeValue)) || null;
                            var equation = (this.nodes.getElementsByTagName("Equation")[0].childNodes[0] && this.nodes.getElementsByTagName("Equation")[0].childNodes[0].nodeValue) || null;

                            if (type !== "function")
                                this.model.given.setInitial(id, initial);
                            
                            //Change references to node names in the equation to references to the id
                            if (type !== "parameter") {
                                var regex = /([\+\-\*\/])/;
                                var eq = equation.split(regex);
                                var finalEquation = "";
                                for (var k = 0; k < eq.length; k++) {
                                    eq[k] = eq[k].trim();
                                    if (eq[k] !== "+" && eq[k] !== "-" && eq[k] !== "*" && eq[k] !== "/" && eq[k] !== "" && isNaN(eq[k])) {
                                        eq[k] = this.model.given.getNodeIDByName(eq[k]);
                                    }
                                    finalEquation += eq[k];
                                    if (k < eq.length - 1)
                                        finalEquation += " ";
                                }
                                finalEquation = finalEquation.trim();
                                this.model.given.setEquation(id, finalEquation);
                            }
                            
                            //Obtain any inputs and change the input from the name to the id
                            var name = this.nodes.getAttributeNode("name").nodeValue;
                            this.nodes = jsdom.getElementsByTagName("Node")[i];
                            var inputs = new Array();
                            if (!this.nodes.getAttributeNode("level")) {
                                this.inputs = this.nodes.getElementsByTagName("Inputs");
                                for (var j = 0; j < this.inputs[0].getElementsByTagName("Name").length; j++) {
                                    inputs.push(this.model.given.getNodeIDByName(this.inputs[0].getElementsByTagName("Name")[j].childNodes[0].nodeValue));
                                }
                                this.model.given.setInputs(inputs, this.model.given.getNodeIDByName(this.nodes.getAttributeNode("name").nodeValue));
                            }
                            
                            console.log("Added inputs, intial, and equation (if part of problem) to " + id + ".");
                        }
                    }
                }
                
                //Anonymous function to download the new file 
                var download = function(filename, text) {
                    var pom = document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                };
                
                //Remove .xml file extension
                var fileSplit = file.split(".");
                file = fileSplit[0];
                
                //Download the file with the original name and a .json extension
                console.log("Downloading file...");
                download(file + ".json", this.model.getModelAsString() + "\n");
                console.log("File downloaded.");
                
                console.log("Contents of file: \n" + this.model.getModelAsString());


                return this.model.getModelAsString();
            }
            , function(err) {
                console.error("loadFromFile error ", err);
            });
        }
    });
});
