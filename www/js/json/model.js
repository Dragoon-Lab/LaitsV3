
define(["dojo/_base/declare", "/laits/js/json/node", "/laits/js/json/student_node"]
        , function(declare, Node, StudentNode) {

    return declare(null, {
        constructor: function(name, url, start, end, timeStep, units) {
            this.ID = 1;
            this.x = 100;
            this.y = 100;
            this.phase = "";
            this.type = "";
            this.properties = JSON.parse('{"taskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"startTime" : ' + start + ',\n"endTime" : ' + end +
                    ',\n"timeStep" : ' + timeStep + ',\n"units" : "' + units + '"}');
            this.nodes = new Array();
            this.studentModel = new Array();
            this.model = JSON.parse('{}');
        },
        modifyProperties: function(name, url, start, end, timeStep, units) {
            this.properties = JSON.parse('{"taskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"startTime" : ' + start + ',\n"endTime" : ' + end +
                    ',\n"timeStep" : ' + timeStep + ',\n"units" : "' + units + '"}');
        },
        /**
         * Getters
         */
        getPhase: function() {
            return this.model.task.phase;
        },
        getType: function() {
            return this.model.task.type;
        },
        getTaskName: function() {
            return this.model.task.properties.taskName;
        },
        getURL: function() {
            return this.model.task.properties.URL;
        },
        getStartTime: function() {
            return this.model.task.properties.startTime;
        },
        getEndTime: function() {
            return this.model.task.properties.endTime;
        },
        getTimeStep: function() {
            return this.model.task.properties.timeStep;
        },
        getUnits: function() {
            return this.model.task.properties.units;
        },
        getTaskDescription: function() {
            return this.model.task.taskDescription;
        },
        //returns the name of a node matching the given id;
        //the given model nodes are searched first, followed by the student model nodes
        getNodeNameByID: function(id) {
            this.buildModel();
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].name;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].name;
            }
            return false;
        },
        //returns the id of a node matching the given name;
        //the given model nodes are searched first, followed by the student model nodes
        getNodeIDByName: function(name) {
            this.buildModel();
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (name === this.model.task.givenModelNodes[i].name)
                    return this.model.task.givenModelNodes[i].ID;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (name === this.model.task.studentModelNodes[i].name)
                    return this.model.task.studentModelNodes[i].ID;
            }
            return false;
        },
        getNodeType: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].type;
            }
            return false;
        },
        isParentNode: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].parentNode;
            }
        },
        isExtraNode: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].extra;
            }
        },
        getNodeOrder: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].order;
            }
            return false;
        },
        getNodeUnits: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].units;
            }
            return false;
        },
        getNodeInputs: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID && this.model.task.givenModelNodes[i].inputs.length !== 0) {
                    var inputs = new Array();
                    for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++)
                        inputs.push(this.model.task.givenModelNodes[i].inputs[ii].ID)
                    return inputs;
                }
            }
            return false;
        },
        getNodeX: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].position.x;
            }
            return false;
        },
        getNodeY: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].position.y;
            }
            return false;
        },
        getNodeInitial: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].initial;
            }
            return false;
        },
        getNodeEquation: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].equation;
            }
            return false;
        },
        getNodeCorrectDescription: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].correctDesc;
            }
            return false;
        },
        //returns an array with the attempt count of each tab (description, plan, and calculation)
        getNodeAttempts: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    var attempts = new Array();
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.desc);
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.plan);
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.calc);
                    return attempts;
                }
            }
            return false;
        },
        //returns an array with the solution (correct, incorrect, or demo) of each tab (description, plan, and calculation)
        getNodeSolutions: function(id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    var solutions = new Array();
                    solutions.push(this.model.task.givenModelNodes[i].solution.desc);
                    solutions.push(this.model.task.givenModelNodes[i].solution.plan);
                    solutions.push(this.model.task.givenModelNodes[i].solution.calc);
                    return solutions;
                }
            }
            return false;
        },
        isInGivenModel: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].inGivenModel;
            }
        },
        getStudentModelNodeInputs: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID && this.model.task.studentModelNodes[i].inputs.length !== 0) {
                    var inputs = new Array();
                    for (var ii = 0; ii < this.model.task.studentModelNodes[i].inputs.length; ii++)
                        inputs.push(this.model.task.studentModelNodes[i].inputs[ii].ID)
                    return inputs;
                }
            }
            return false;
        },
        getStudentModelNodeX: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.x;
            }
            return false;
        },
        getStudentModelNodeY: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.y;
            }
            return false;
        },
        getStudentModelNodeDesc: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.desc;
            }
            return false;
        },
        getStudentModelNodePlan: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.plan;
            }
            return false;
        },
        getStudentModelNodeUnits: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.units;
            }
            return false;
        },
        getStudentModelNodeInitial: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.initial;
            }
            return false;
        },
        getStudentModelNodeEquation: function(id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.equation;
            }
            return false;
        },
        //Plan to update code to have setters use JSON more
        /**
         * Setters
         */
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
        //builds a new node and returns the node's unique id
        addNode: function() {
            var id = "id" + this.ID;
            var order = this.nodes.length + 1;
            var xPos = this.x;
            var yPos = this.y;
            this.updateNodePosition();
            this.ID++;
            var newNode = new Node(id, order, xPos, yPos);
            this.nodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        //set the node's attributes
        setNodeAttributes: function(id, name, parentNode, type, extra, units, initial, equation, correctDesc) {
            for (var i = 0; i < this.nodes.length; i++) {
                if (id === this.nodes[i].ID) {
                    if (name !== null)
                        this.nodes[i].name = name;
                    if (parentNode !== null)
                        this.nodes[i].parentNode = parentNode;
                    if (type !== null)
                        this.nodes[i].type = type;
                    if (extra !== null)
                        this.nodes[i].extra = extra;
                    if (units !== null)
                        this.nodes[i].units = units;
                    if (initial !== null)
                        this.nodes[i].initial = initial;
                    if (equation !== null)
                        this.nodes[i].equation = equation;
                    if (correctDesc !== null)
                        this.nodes[i].correctDesc = correctDesc;
                }
            }
        },
        //create a new node and set its attributes in one step
        addNodeWithAttributes: function(name, parent, type, extra, units, initial, equation, correctDesc) {
            var id = this.addNode();
            this.setNodeAttributes(id, name, parent, type, extra, units, initial, equation, correctDesc);
        },
        //adds a node (input) as an input into the given node (inputInto)
        addNodeInput: function(input, inputInto) {
            var inputID = "";
            if (inputInto === input)//node can't be input into itself
                return false;
            for (var i = 0; i < this.nodes.length; i++)
                if (input === this.nodes[i].ID) {
                    inputID = this.nodes[i].ID;
                    i = this.nodes.length;
                } else {
                    if (i === this.nodes.length - 1)
                        return false;
                }
            for (var i = 0; i < this.nodes.length; i++) {
                if (inputInto === this.nodes[i].ID) {

                    for (var ii = 0; ii < this.nodes[i].inputs.length; ii++) {
                        if (input === this.nodes[i].inputs[ii].ID)
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
                if (id === this.nodes[i].ID) {
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
        /**
         * Next 3 functions keep track of student attempts
         */
        addAttemptDesc: function(id) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addAttempt(true, false, false);
        },
        addAttemptPlan: function(id) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addAttempt(false, true, false);
        },
        addAttemptCalc: function(id) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addAttempt(false, false, true);
        },
        /**
         * Next 3 functions keep track of correct, incorrect, or demo'd solutions
         */
        setSolutionDesc: function(id, solution) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addSolution(solution, null, null);
        },
        setSolutionPlan: function(id, solution) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addSolution(null, solution, null);
        },
        setSolutionCalc: function(id, solution) {
            for (var i = 0; i < this.nodes.length; i++)
                if (id === this.nodes[i].ID)
                    this.nodes[i].addSolution(null, null, solution);
        },
        /**
         * Next 5 functions set student selection attributes in the Student Model
         */
        setStudentSeletionsDesc: function(id, selection) {
            for (var i = 0; i < this.studentModel.length; i++)
                if (id === this.studentModel[i].ID)
                    this.studentModel[i].setStudentSeletions(selection, null, null, null, null);
        },
        setStudentSeletionsPlan: function(id, selection) {
            for (var i = 0; i < this.studentModel.length; i++)
                if (id === this.studentModel[i].ID)
                    this.studentModel[i].setStudentSeletions(null, selection, null, null, null);
        },
        setStudentSeletionsUnits: function(id, selection) {
            for (var i = 0; i < this.studentModel.length; i++)
                if (id === this.studentModel[i].ID)
                    this.studentModel[i].setStudentSeletions(null, null, selection, null, null);
        },
        setStudentSeletionsInitial: function(id, selection) {
            for (var i = 0; i < this.studentModel.length; i++)
                if (id === this.studentModel[i].ID)
                    this.studentModel[i].setStudentSeletions(null, null, null, selection, null);
        },
        setStudentSeletionsEquation: function(id, selection) {
            for (var i = 0; i < this.studentModel.length; i++)
                if (id === this.studentModel[i].ID)
                    this.studentModel[i].setStudentSeletions(null, null, null, null, selection);
        },
        //prints nodes in the model in JSON format; used to build JSON object in buildModel()
        printNodes: function() {
            var theString = "";
            for (var i = 0; i < this.nodes.length; i++) {
                theString += JSON.stringify(this.nodes[i], null, "\t\t\t");
                if (i < this.nodes.length - 1)
                    theString += ",";
            }
            return theString;
        },
        //builds a new node in the student model and returns the node's unique id       
        addStudentModelNode: function() {
            var id = "id" + this.ID;
            var xPos = this.x;
            var yPos = this.y;
            this.updateNodePosition();
            this.ID++;
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
                if (id === this.studentModel[i].ID) {
                    for (var ii = 0; ii < this.nodes.length; ii++) {
                        if (newName === this.nodes[ii].name) {
                            this.studentModel[i].name = newName;
                            this.studentModel[i].ID = this.nodes[ii].ID;
                            this.studentModel[i].inGivenModel = true;
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        //create a new node in the StudentModel and set its attributes in one step
        addStudentNodeWithName: function(name) {
            var id = this.addStudentModelNode();
            this.setStudentModelNodeName(id, name);
        },
        //adds a node (input) as an input into the given node in the StudentModel (inputInto)
        addStudentNodeInput: function(input, inputInto) {
            var inputID = "";
            if (inputInto === input)//node can't be input into itself
                return false;
            for (var i = 0; i < this.studentModel.length; i++)
                if (input === this.studentModel[i].ID) {
                    inputID = this.studentModel[i].ID;
                    i = this.studentModel.length;
                } else {
                    if (i === this.studentModel.length - 1)
                        return false;
                }
            for (var i = 0; i < this.studentModel.length; i++) {
                if (inputInto === this.studentModel[i].ID) {

                    for (var ii = 0; ii < this.studentModel[i].inputs.length; ii++) {
                        if (input === this.studentModel[i].inputs[ii].ID)
                            return false;
                    }


                    this.studentModel[i].addInput(inputID);
                    return true;
                }
            }
            return false;
        },
        printStudentModel: function() {
            var theString = "";
            for (var i = 0; i < this.studentModel.length; i++) {
                //theString += "\n\t\t{ \"Node\" : ";
                theString += JSON.stringify(this.studentModel[i], null, "\t\t\t");
                //theString += "}";
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
                if (this.studentModel[i].ID > largest)
                    largest = this.studentModel[i].ID;
            }
            for (var i = 0; i < this.nodes.length; i++) {
                if (this.nodes[i].ID > largest)
                    largest = this.nodes[i].ID;
            }
            this.ID = this.getIDNumberOnly(largest) + 1;
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //returns a JSON object in string format
        getModel: function() {
            return JSON.stringify(this.model);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //builds a JSON formatted string after defining attributes
        buildModel: function() {
            var newModel = "{\"task\" : {\n";
            newModel += "\t\"phase\" : \"" + this.phase + "\",\n";
            newModel += "\t\"type\" : \"" + this.type + "\",\n";
            newModel += "\t\"properties\" : " + JSON.stringify(this.properties, null, "\t\t") + ",\n";
            newModel += "\t\"taskDescription\" : \"" + this.taskDescription + "\",\n";
            newModel += "\t\"givenModelNodes\" : [" + this.printNodes() + "\n],\n";
            newModel += "\t\"studentModelNodes\" : [" + this.printStudentModel() + "\n]\n";
            newModel += "}\n}";
            this.model = JSON.parse(newModel);
        }
    });
});
