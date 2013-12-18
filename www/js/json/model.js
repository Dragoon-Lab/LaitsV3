
//                        {TaskName: "Rabbits - Intro Problem",
//            URL: "images/rabbit.jpeg",
//            StartTime: 0,
//            EndTime: 10,
//            Units: "Years"},

define(["dojo/_base/declare", "dojo/_base/json", "/laits/js/json/node", "/laits/js/json/student_node"]
        , function(declare, dojo, Node, StudentNode) {

    return declare(null, {
        id: "",
        x: "",
        y: "",
        phase: "",
        type: "",
        properties: "",
        taskDescription: "",
        nodes: "",
        studentModel: "",
        testModel: "",
        constructor: function(name, url, start, end, units) {
            this.id = 1;
            this.x = 100;
            this.y = 100;
            this.properties = JSON.parse('{"TaskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"StartTime" : ' + start + ',\n"EndTime" : ' + end +
                    ',\n"Units" : "' + units + '"}');
            this.nodes = new Array();
            this.studentModel = new Array();
            this.testModel = JSON.parse('{}');
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
        addNode: function(name, xPos, yPos) {
            if (xPos === null)
                xPos = this.x;
            if (yPos === null)
                yPos = this.y;
            this.updateNodePosition();
            var newNode = new Node(name, xPos, yPos);
            newNode.id = this.id;
            newNode.order = this.nodes.length + 1;
            this.id++;
            this.nodes.push(newNode);
        },
        addNodeInput: function(inputInto, input) {
            if (inputInto === input)
                return false;
            for (var i = 0; i < this.nodes.length; i++)
                if (input === this.nodes[i].name)
                    i = this.nodes.length;
                else {
                    if (i === this.nodes.length - 1)
                        return false;
                }
            for (var i = 0; i < this.nodes.length; i++) {
                if (inputInto === this.nodes[i].name) {

                    for (var ii = 0; ii < this.nodes[i].inputs.length; ii++) {
                        if (input === this.nodes[i].inputs[ii].name)
                            return false;
                    }


                    this.nodes[i].addInput(input);
                    return true;
                }
            }
            return false;
        },
        deleteNode: function(name) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (name === this.nodes[i].name) {
                    this.nodes.splice(this.nodes.indexOf(this.nodes[i]), 1);
                }
                //maintains order of nodes during deletion
                this.nodes[i].order = i + 1;
            }
        },
        getNodes: function() {
            return this.nodes;
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
        addStudentModelNode: function(name) {

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
        loadModel: function(json) {
            this.testModel = json;
        },
        getModel: function() {
            var model = "{\"Task\" : {\n";
            model += "\t\"Phase\" : \"" + this.phase + "\",\n";
            model += "\t\"Type\" : \"" + this.type + "\",\n";
            model += "\t\"Properties\" : " + JSON.stringify(this.properties, null, "\t\t") + ",\n";
            model += "\t\"TaskDescription\" : \"" + this.taskDescription + "\",\n";
            model += "\t\"Nodes\" : [" + this.printNodes() + "\n],\n";
            model += "\t\"StudentModel\" : [" + this.printStudentModel() + "\n]\n";
            model += "}\n}";
            return model;
        }
    });

});
