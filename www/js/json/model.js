
define(["dojo/_base/declare", "dojo/_base/json", "/laits/js/json/node", "/laits/js/json/student_node"]
        , function(declare, dojo, Node, StudentNode) {

    return declare(null, {
        constructor: function(name, url, start, end, units) {
            this.id = 1;
            this.x = 100;
            this.y = 100;
            this.properties = JSON.parse('{"TaskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"StartTime" : ' + start + ',\n"EndTime" : ' + end +
                    ',\n"Units" : "' + units + '"}');
            this.nodes = new Array();
            this.studentModel = new Array();
            this.model = JSON.parse('{}');
        },
        modifyProperties: function(name, url, start, end, units) {
            this.properties = JSON.parse('{"TaskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"StartTime" : "' + start + '",\n"EndTime" : "' + end +
                    '",\n"Units" : "' + units + '"}');
        },
        updateNodePosition: function() {
            //need to add code to detect collisions
            if (this.x + 300 < document.documentElement.clientWidth)
                this.x += 200;
            else {
                this.x = 100;
                this.y += 200;
            }
        },
        updateOrder: function(name, newOrder) {
            var i = 0;
            while (i < this.nodes.length) {
                if (name !== this.nodes[i].name)
                    i++;
                else {
                    while (newOrder < this.nodes[i].order) {
                        this.nodes[i].order -= 1;
                        this.nodes[i - 1].order += 1;
                        var temp = this.nodes[i];
                        this.nodes[i] = this.nodes[i - 1];
                        this.nodes[i - 1] = temp;
                        i--;
                    }
                    while (newOrder > this.nodes[i].order) {
                        this.nodes[i].order += 1;
                        this.nodes[i + 1].order - 1;
                        var temp = this.nodes[i];
                        this.nodes[i] = this.nodes[i + 1];
                        this.nodes[i + 1] = temp;
                        i++;
                    }
                    i = this.nodes.length;
                }
            }
        },
        addNode2: function(name, xPos, yPos) {
            if (xPos === null)
                xPos = this.x;
            if (yPos === null)
                yPos = this.y;
            this.updateNodePosition();
            var newNode = new Node(name, xPos, yPos);
            newNode.id = "id" + this.id;
            newNode.order = this.nodes.length + 1;
            this.id++;
            this.nodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //builds a new node and returns the node's unique id
        addNode: function() {
            var id = "id" + this.id;
            var order = this.nodes.length + 1;
            var xPos = this.x;
            var yPos = this.y;
            this.updateNodePosition();
            this.id++;
            var newNode = new Node(id, order, xPos, yPos);
            this.nodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        //allows the author to name a node or change a node's name
        setNodeName: function(id, newName) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].id) {
                    this.nodes[i].name = newName;
                    return true;
                }
            return false;
        },
        //allows the author to mark the node an initial node (in the tree structure)
        setInitialNode: function(id, bool) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].id) {
                    this.nodes[i].initialNode = bool;
                    return true;
                }
            return false;
        },
        //adds a node (input) as an input into the given node (inputInto)
        addNodeInput: function(inputInto, input) {
            var inputID = "";
            if (inputInto === input)//node can't be input into itself
                return false;
            for (var i = 0; i < this.nodes.length; i++)
                if (input === this.nodes[i].id) {
                    inputID = this.nodes[i].id;
                    i = this.nodes.length;
                } else {
                    if (i === this.nodes.length - 1)
                        return false;
                }
            for (var i = 0; i < this.nodes.length; i++) {
                if (inputInto === this.nodes[i].id) {

                    for (var ii = 0; ii < this.nodes[i].inputs.length; ii++) {
                        if (input === this.nodes[i].inputs[ii].id)
                            return false;
                    }


                    this.nodes[i].addInput(inputID);
                    return true;
                }
            }
            return false;
        },
        //deletes a node with a given id
        deleteNode: function(id) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (id === this.nodes[i].id) {
                    this.nodes.splice(this.nodes.indexOf(this.nodes[i]), 1);
                }
                //maintains order of nodes during deletion
                this.nodes[i].order = i + 1;
            }
        },
        //returns an array of the node ID's in a model
        getNodesList: function() {
            return this.nodes;
        },
        //returns the name of a node matching the given id
        getNodeNameByID: function(id) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].id)
                    return this.nodes[i].name;
            return false;
        },
        //returns the id of a node matching the given name
        getNodeIDByName: function(name) {
            for (var i = 0; i < this.nodes.length; i++)
                if (name === this.nodes[i].name)
                    return this.nodes[i].id;
            return false;
        },
        printNodes: function() {
            var theString = "";
            for (var i = 0; i < this.nodes.length; i++) {
                theString += "\n\t\t{ \"Node\" : ";
                theString += JSON.stringify(this.nodes[i], null, "\t\t\t");
                theString += "}";
                if (i < this.nodes.length - 1)
                    theString += ",";
            }
            return theString;
        },
        //builds a new node in the student model and returns the node's unique id       
        addStudentModelNode: function() {
            var id = "id" + this.id;
            var xPos = this.x;
            var yPos = this.y;
            this.updateNodePosition();
            this.id++;
            var newNode = new StudentNode(id, xPos, yPos);
            this.studentModel.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        // sets a name for the student model node and attempts to match it against
        // the given model; if a match is found the student model node's id is 
        // updated to match the given model node's id
        setStudentModelNodeName: function(id, newName) {
            for (var i = 0; i < this.studentModel.length; i++) {
                if (id === this.studentModel[i].id) {
                    for (var ii = 0; ii < this.nodes.length; ii++) {
                        if (newName === this.nodes[ii].name) {
                            this.studentModel[i].name = newName;
                            this.studentModel[i].id = this.nodes[ii].id;
                            this.studentModel[i].inGivenModel = true;
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        addStudentModelNode2: function(name) {

            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].name === name)
                    var temp = this.nodes[i];
            }
            var node = new StudentNode(name, temp.position.x, temp.position.y);
            this.studentModel.push(node);
        },
        printStudentModel: function() {
            var theString = "";
            for (var i = 0; i < this.studentModel.length; i++) {
                theString += "\n\t\t{ \"Node\" : ";
                theString += JSON.stringify(this.studentModel[i], null, "\t\t\t");
                theString += "}";
                if (i < this.nodes.length - 1)
                    theString += ",";
            }
            return theString;
        },
        //accepts a nodes id (a string) and returns the number as an int
        getIDNumberOnly: function(id) {
            var num = id.replace("id", "");
            return parseInt(num);
        },
        //loads a string of JSON formatted text into a JSON object
        //allows Dragoon to load a pre-defined program or to load a users saved work
        loadModel: function(jsonString) {
            this.model = JSON.parse(jsonString);
            var largest = "id1";
            for (var i = 0; i < this.studentModel.length; i++) {
                if (this.studentModel[i].id > largest)
                    largest = this.studentModel[i].id;
            }
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].id > largest)
                    largest = this.nodes[i].id;
            }
            this.id = this.getIDNumberOnly(largest) + 1;
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //returns a JSON object in string format
        getModel: function() {
            return JSON.stringify(this.model);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //builds a JSON formatted string after defining attributes
        buildModel: function() {
            var newModel = "{\"Task\" : {\n";
            newModel += "\t\"Phase\" : \"" + this.phase + "\",\n";
            newModel += "\t\"Type\" : \"" + this.type + "\",\n";
            newModel += "\t\"Properties\" : " + JSON.stringify(this.properties, null, "\t\t") + ",\n";
            newModel += "\t\"TaskDescription\" : \"" + this.taskDescription + "\",\n";
            newModel += "\t\"Nodes\" : [" + this.printNodes() + "\n],\n";
            newModel += "\t\"StudentModel\" : [" + this.printStudentModel() + "\n]\n";
            newModel += "}\n}";
            this.model = JSON.parse(newModel);
        }
    });

});
