


define(["dojo/_base/declare", "/laits/js/json/node", "/laits/js/json/student_node"]
        , function(declare, Node, StudentNode) {

    return declare(null, {
        constructor: function(name, url, start, end, timeStep, units) { //(string, string, int, int, float, string)
            //beginX and beginY specify coordinates where nodes can begin appearing
            //when the student adds them
            this.beginX = 100;
            this.beginY = 100;
            this.nodeWidth = 200;
            this.nodeHeigth = 200;
            this.x = 100;
            this.y = 100;
            this.ID = 1;
            this.phase = "";
            this.type = "";
            this.properties = JSON.parse('{"taskName" : "' + name + '",\n"URL" : "' + url +
                    '",\n"startTime" : ' + start + ',\n"endTime" : ' + end +
                    ',\n"timeStep" : ' + timeStep + ',\n"units" : "' + units + '"}');
            this.model = JSON.parse('{}');
            this.buildModel();
        },
        /**
         * 
         * Functions to load, build, retrieve, and position a model
         *  
         */

        //loads a string of JSON formatted text into a JSON object
        //allows Dragoon to load a pre-defined program or to load a users saved work
        loadModel: function(jsonString) { //(string)
            this.model = JSON.parse(jsonString);
            var largest = "id1";
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (this.model.task.studentModelNodes[i].ID > largest)
                    largest = this.model.task.studentModelNodes[i].ID;
            }
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (this.model.task.givenModelNodes[i].ID > largest)
                    largest = this.model.task.givenModelNodes[i].ID;
            }
            this.ID = parseInt(largest.replace("id", "")) + 1;
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //returns a JSON object in string format
        getModelAsString: function() {
            return JSON.stringify(this.model);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        //builds a JSON formatted object after defining its attributes
        buildModel: function() {
            var newModel = "{\"task\" : {\n";
            newModel += "\t\"phase\" : \"" + this.phase + "\",\n";
            newModel += "\t\"type\" : \"" + this.type + "\",\n";
            newModel += "\t\"properties\" : " + JSON.stringify(this.properties, null, "\t\t") + ",\n";
            newModel += "\t\"taskDescription\" : \"" + this.taskDescription + "\",\n";
            newModel += "\t\"givenModelNodes\" : [\n],\n";
            newModel += "\t\"studentModelNodes\" : [\n]\n";
            newModel += "}\n}";
            this.model = JSON.parse(newModel);
        },
        //keeps track of where to place a node; function detects collisions with other nodes;
        //is called in addStudentModelNode() before creating the node
        updateNodeXYPosition: function() {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                var x = this.model.task.studentModelNodes[i].position.x;
                var y = this.model.task.studentModelNodes[i].position.y;
                while (this.x > x - this.nodeWidth && this.x < x + this.nodeWidth && this.y > y - this.nodeHeigth && this.y < y + this.nodeHeigth) {
                    if (this.x + this.nodeWidth < document.documentElement.clientWidth + 100)
                        this.x += this.nodeWidth;
                    else {
                        this.x = this.beginX;
                        this.y += this.nodeHeigth;
                    }
                }
            }
        },
        /**
         * 
         * Functions to add nodes to the given model and the student model
         * 
         */

        //builds a new node and returns the node's unique id
        addNode: function() {
            var id = "id" + this.ID;
            var order = this.model.task.givenModelNodes.length + 1;
            this.ID++;
            var newNode = new Node(id, order);
            this.model.task.givenModelNodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        //set the node's attributes
        setNodeAttributes: function(id, name, parent, type, extra, units, initial, equation, correctDesc) {
            //(string, string, bool, string, bool, string, float, string, string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    if (name !== null)
                        this.model.task.givenModelNodes[i].name = name;
                    if (parent !== null)
                        this.model.task.givenModelNodes[i].parentNode = parent;
                    if (type !== null)
                        this.model.task.givenModelNodes[i].type = type;
                    if (extra !== null)
                        this.model.task.givenModelNodes[i].extra = extra;
                    if (units !== null)
                        this.model.task.givenModelNodes[i].units = units;
                    if (initial !== null)
                        this.model.task.givenModelNodes[i].initial = initial;
                    if (equation !== null)
                        this.model.task.givenModelNodes[i].equation = equation;
                    if (correctDesc !== null)
                        this.model.task.givenModelNodes[i].correctDesc = correctDesc;
                }
            }
        },
        //create a new node and set its attributes in one step
        addNodeWithAttributes: function(name, parent, type, extra, units, initial, equation, correctDesc) {
            //(string, bool, string, bool, string, float, string, string)
            var id = this.addNode();
            this.setNodeAttributes(id, name, parent, type, extra, units, initial, equation, correctDesc);
            return id;
        },
        //adds a node (input) as an input into the given node (inputInto); both params are node ID strings
        addNodeInput: function(input, inputInto) { //(string, string)
            var inputID = "";
            if (inputInto === input)//node can't be input into itself
                return false;
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (input === this.model.task.givenModelNodes[i].ID) {
                    inputID = this.model.task.givenModelNodes[i].ID;
                    i = this.model.task.givenModelNodes.length;
                } else {
                    if (i === this.model.task.givenModelNodes.length - 1)
                        return false;
                }
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (inputInto === this.model.task.givenModelNodes[i].ID) {

                    for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++) {
                        if (input === this.model.task.givenModelNodes[i].inputs[ii].ID)
                            return false;
                    }


                    this.model.task.givenModelNodes[i].addInput(inputID);
                    return true;
                }
            }
            return false;
        },
        //deletes a node with a given id
        deleteNode: function(id) { //(string)
            var deleted = false;
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    this.model.task.givenModelNodes.splice(this.model.task.givenModelNodes.indexOf(this.model.task.givenModelNodes[i]), 1);
                    deleted = true;
                    if (this.model.task.givenModelNodes.length > 0)
                        this.model.task.givenModelNodes[i].order = this.model.task.givenModelNodes[i].order - 1;
                }
                else if (deleted === true)//maintains order of nodes during deletion                    
                    this.model.task.givenModelNodes[i].order = this.model.task.givenModelNodes[i].order - 1;
            }
            this.deleteStudentModelNode(id);
            return deleted;
        },
        //builds a new node in the student model and returns the node's unique id       
        addStudentModelNode: function() {
            var id = "id" + this.ID;
            this.updateNodeXYPosition();
            var xPos = this.x;
            var yPos = this.y;
            this.ID++;
            var newNode = new StudentNode(id, xPos, yPos);
            this.model.task.studentModelNodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        // sets a name for the student model node and attempts to match it against
        // the given model; returns the nodes ID, which updates to match the given 
        // model node, if it exists
        setStudentModelNodeName: function(id, newName) { //(string, string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID) {
                    for (var ii = 0; ii < this.model.task.givenModelNodes.length; ii++) {
                        if (newName === this.model.task.givenModelNodes[ii].name) {
                            this.model.task.studentModelNodes[i].name = newName;
                            this.model.task.studentModelNodes[i].ID = this.model.task.givenModelNodes[ii].ID;
                            this.model.task.studentModelNodes[i].inGivenModel = true;
                            return this.model.task.studentModelNodes[i].ID;
                        }
                    }
                }
            }
            return id;
        },
        //create a new node in the StudentModel and set its attributes in one step
        //returns the nodes ID, which updates to match the given model node, if it exists
        addStudentNodeWithName: function(name) { //(string)
            var id = this.addStudentModelNode();
            return this.setStudentModelNodeName(id, name);
        },
        //adds a node (input) as an input into the given node in the StudentModel (inputInto)
        //both parameters are node ID's
        addStudentNodeInput: function(input, inputInto) { //(string, string)
            var inputID = "";
            if (inputInto === input)//node can't be input into itself
                return false;
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (input === this.model.task.studentModelNodes[i].ID) {
                    inputID = this.model.task.studentModelNodes[i].ID;
                    i = this.model.task.studentModelNodes.length;
                } else {
                    if (i === this.model.task.studentModelNodes.length - 1)
                        return false;
                }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (inputInto === this.model.task.studentModelNodes[i].ID) {

                    for (var ii = 0; ii < this.model.task.studentModelNodes[i].inputs.length; ii++) {
                        if (input === this.model.task.studentModelNodes[i].inputs[ii].ID)
                            return false;
                    }


                    this.model.task.studentModelNodes[i].addInput(inputID);
                    return true;
                }
            }
            return false;
        },
        //deletes a node with a given id from the student model
        deleteStudentModelNode: function(id) { //(string)
            var deleted = false;
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID) {
                    this.model.task.studentModelNodes.splice(this.model.task.studentModelNodes.indexOf(this.model.task.studentModelNodes[i]), 1);
                    deleted = true;
                    if (this.model.task.studentModelNodes.length > 0)
                        this.model.task.studentModelNodes[i].order = this.model.task.studentModelNodes[i].order - 1;
                }
                else if (deleted === true)//maintains order of nodes during deletion                    
                    this.model.task.studentModelNodes[i].order = this.model.task.studentModelNodes[i].order - 1;
            }
            return deleted;
        },
        /**
         * 
         * Getters; retrieves specific attributes from a model; node attributes
         * are usually by accessed by ID--if ID is not known use getNodeIDByName("name");
         * 
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
        getNodeNameByID: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].name;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].name;
            }
            return null;
        },
        //returns the id of a node matching the given name;
        //the given model nodes are searched first, followed by the student model nodes
        getNodeIDByName: function(name) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (name === this.model.task.givenModelNodes[i].name)
                    return this.model.task.givenModelNodes[i].ID;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (name === this.model.task.studentModelNodes[i].name)
                    return this.model.task.studentModelNodes[i].ID;
            }
            return null;
        },
        getNodeType: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].type;
            }
            return null;
        },
        getNodeOrder: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].order;
            }
            return null;
        },
        getNodeUnits: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].units;
            }
            return null;
        },
        //returns an array with the inputs that the node uses
        getNodeInputs: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID && this.model.task.givenModelNodes[i].inputs.length !== 0) {
                    var inputs = new Array();
                    for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++)
                        inputs.push(this.model.task.givenModelNodes[i].inputs[ii].ID);
                    return inputs;
                }
            }
            return null;
        },
        getNodeInitial: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].initial;
            }
            return null;
        },
        getNodeEquation: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].equation;
            }
            return null;
        },
        getNodeCorrectDescription: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].correctDesc;
            }
            return null;
        },
        //returns an array with the attempt count of each tab (description, plan, and calculation)
        getNodeAttempts: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    var attempts = new Array();
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.desc);
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.plan);
                    attempts.push(this.model.task.givenModelNodes[i].attemptCount.calc);
                    return attempts;
                }
            }
            return null;
        },
        //returns an array with the solution (correct, incorrect, or demo) of each tab (description, plan, and calculation)
        getNodeSolutions: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID) {
                    var solutions = new Array();
                    solutions.push(this.model.task.givenModelNodes[i].solution.desc);
                    solutions.push(this.model.task.givenModelNodes[i].solution.plan);
                    solutions.push(this.model.task.givenModelNodes[i].solution.calc);
                    return solutions;
                }
            }
            return null;
        },
        //returns an array with the nodes that the student has selected as inputs
        getStudentModelNodeInputs: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID && this.model.task.studentModelNodes[i].inputs.length !== 0) {
                    var inputs = new Array();
                    for (var ii = 0; ii < this.model.task.studentModelNodes[i].inputs.length; ii++)
                        inputs.push(this.model.task.studentModelNodes[i].inputs[ii].ID);
                    return inputs;
                }
            }
            return null;
        },
        getStudentNodeX: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.x;
            }
            return null;
        },
        getStudentNodeY: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.y;
            }
            return null;
        },
        getStudentModelNodeDesc: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.desc;
            }
            return null;
        },
        getStudentModelNodePlan: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.plan;
            }
            return null;
        },
        getStudentModelNodeUnits: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.units;
            }
            return null;
        },
        getStudentModelNodeInitial: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.initial;
            }
            return null;
        },
        getStudentModelNodeEquation: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.equation;
            }
            return null;
        },
        //returns a JSON object of the nodes in a model
        getNodes: function() {// in JSON model
            return this.model.task.givenModelNodes;
        },
        //returns a JSON object of the nodes in the student model
        getStudentModelNodes: function() {// in JSON model
            return this.model.task.studentModelNodes;
        },
        //returns true if a node is the parent node in a tree structure;
        //parent nodes will be displayed first when the student demos a node name/description
        isParentNode: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].parentNode;
            }
            return null;
        },
        //returns true if the node is not required in the final model
        isExtraNode: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].extra;
            }
            return null;
        },
        //returns true if a node in the student model is also found in the given model
        isInGivenModel: function(id) { //(string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].inGivenModel;
            }
            return null;
        },
        /**
         * 
         * Setters
         * 
         */
        //change the properties set by the constructor
        setProperties: function(name, url, start, end, timeStep, units) { //(string, string, int, int, float, string)
            if (name !== null)
                this.model.task.properties.taskName = name;
            if (url !== null)
                this.model.task.properties.URL = url;
            if (start !== null)
                this.model.task.properties.startTime = start;
            if (end !== null)
                this.model.task.properties.endTime = end;
            if (timeStep !== null)
                this.model.task.properties.timeStep = timeStep;
            if (units !== null)
                this.model.task.properties.units = units;
        },
        //set the model phase
        setPhase: function(phase) { //(string)
            this.model.task.phase = phase;
        },
        //set the model type
        setType: function(type) { //(string)
            this.model.task.type = type;
        },
        //set the task description
        setTaskDescription: function(description) { //(string)
            this.model.task.taskDescription = description;
        },
        /**
         * Next 3 functions keep track of correct, incorrect, or demo'd solutions
         */
        setSolutionDesc: function(id, solution) { //(string, string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(solution, null, null);
        },
        setSolutionPlan: function(id, solution) { //(string, string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(null, solution, null);
        },
        setSolutionCalc: function(id, solution) { //(string, string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(null, null, solution);
        },
        //sets the "X" and "Y" values of a node's position
        setStudentNodeXY: function(id, xPos, yPos) { //(string, int, int)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID) {
                    this.model.task.studentModelNodes[i].position.x = xPos;
                    this.model.task.studentModelNodes[i].position.y = yPos;
                }
        },
        /**
         * Next 5 functions set student selection attributes in the Student Model
         */
        setStudentSeletionsDesc: function(id, selection) { //(string, string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(selection, null, null, null, null);
        },
        setStudentSeletionsPlan: function(id, selection) { //(string, string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, selection, null, null, null);
        },
        setStudentSeletionsUnits: function(id, selection) { //(string, string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, selection, null, null);
        },
        setStudentSeletionsInitial: function(id, selection) { //(string, float)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, null, selection, null);
        },
        setStudentSeletionsEquation: function(id, selection) { //(string, string)
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, null, null, selection);
        },
        /**
         * Next 3 functions keep track of student attempts
         */
        addAttemptDesc: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(true, false, false);
        },
        addAttemptPlan: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(false, true, false);
        },
        addAttemptCalc: function(id) { //(string)
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(false, false, true);
        }
    });
});
