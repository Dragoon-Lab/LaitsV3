/**
 * 
 * Model controller to build, load, save and modify Dragoon problems
 * @author: Brandon Strong
 * 
 **/

define(["dojo/_base/declare", "/laits/js/json/node", "/laits/js/json/student_node"]
        , function(declare, Node, StudentNode) {

    return declare(null, {
        constructor: function(/*string*/ name, /*string*/ url, /*int*/ start, /*int*/ end, /*float*/ timeStep, /*string*/ units) {
            // Summary: Initializes the object (the Dragoon problem)
            // Note: beginX and beginY specify coordinates where nodes can begin appearing
            //      when the student adds them; nodeWidth and nodeHeighth can be manually
            //      adjusted to allow enough room in between the nodes; _updateNextXYPosition()
            //      uses nodeWidth and nodeHeighth to know where to place new student nodes
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
            this._buildModel();
        },
        /**
         * 
         * Private methods
         *  
         */
        _buildModel: function() {
            // Summary: builds a JSON formatted object after defining its attributes;
            //      not used when loading a model; only used by the constructor
            // Tags: private
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
        _updateNextXYPosition: function() {
            // Summary: keeps track of where to place the next node; function detects collisions
            //      with other nodes; is called in addStudentModelNode() before creating the node
            // Tags: private
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
         * Public methods
         *  
         */

        /**
         * Functions to load or retrieve a model in string format
         */
        loadModel: function(/*string*/ jsonString) {
            // Summary: loads a string of JSON formatted text into a JSON object;
            //      allows Dragoon to load a pre-defined program or to load a users saved work
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
        getModelAsString: function() {
            // Summary: Returns a JSON object in string format
            return JSON.stringify(this.model);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
        },
        /**
         * Getters; retrieves specific attributes from a model; node attributes are usually
         * by accessed by the node's ID--if ID is not known use getNodeIDByName("name");
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
        getNodeNameByID: function(/*string*/ id) {
            // Summary: returns the name of a node matching the given id; the given 
            //      model nodes are searched first, followed by the student model nodes
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].name;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].name;
            }
            return null; // returns null if the node cannot be found
        },
        getNodeIDByName: function(/*string*/ name) {
            // Summary: returns the id of a node matching the given name; the given 
            //      model nodes are searched first, followed by the student model nodes
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (name === this.model.task.givenModelNodes[i].name)
                    return this.model.task.givenModelNodes[i].ID;
            }
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (name === this.model.task.studentModelNodes[i].name)
                    return this.model.task.studentModelNodes[i].ID;
            }
            return null; // returns null if the node cannot be found
        },
        getNodeType: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].type;
            }
            return null;
        },
        getNodeOrder: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].order;
            }
            return null;
        },
        getNodeUnits: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].units;
            }
            return null;
        },
        getNodeInputs: function(/*string*/ id) {
            // Summary: returns an array with the inputs that the node uses
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
        getNodeInitial: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].initial;
            }
            return null;
        },
        getNodeEquation: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].equation;
            }
            return null;
        },
        getNodeCorrectDescription: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].correctDesc;
            }
            return null;
        },
        getNodeAttempts: function(/*string*/ id) {
            // Summary: returns an array with the attempt count of each tab (description, plan, and calculation)
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
        getNodeSolutions: function(/*string*/ id) {
            // Summary: returns an array with the solution (correct, incorrect, 
            //      or demo) of each tab (description, plan, and calculation)
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
        getStudentModelNodeInputs: function(/*string*/ id) {
            // Summary: returns an array with the nodes that the student has selected as inputs
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
        getStudentNodeX: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.x;
            }
            return null;
        },
        getStudentNodeY: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].position.y;
            }
            return null;
        },
        getStudentModelNodeDesc: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.desc;
            }
            return null;
        },
        getStudentModelNodePlan: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.plan;
            }
            return null;
        },
        getStudentModelNodeUnits: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.units;
            }
            return null;
        },
        getStudentModelNodeInitial: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.initial;
            }
            return null;
        },
        getStudentModelNodeEquation: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].studentSelections.equation;
            }
            return null;
        },
        getNodes: function() {
            // Summary: returns a JSON object of the nodes in the given model 
            return this.model.task.givenModelNodes;
        },
        getStudentModelNodes: function() {
            // Summary: returns a JSON object of the nodes in the student model
            return this.model.task.studentModelNodes;
        },
        isParentNode: function(/*string*/ id) {
            // Summary: returns true if a node is the parent node in a tree structure; parent 
            //      nodes will be displayed first when the student demos a node name/description
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].parentNode;
            }
            return null;
        },
        isExtraNode: function(/*string*/ id) {
            // Summary: returns true if the node is not required in the final model
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                if (id === this.model.task.givenModelNodes[i].ID)
                    return this.model.task.givenModelNodes[i].extra;
            }
            return null;
        },
        isInGivenModel: function(/*string*/ id) {
            // Summary: returns true if a node in the student model is also found in the given model
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID)
                    return this.model.task.studentModelNodes[i].inGivenModel;
            }
            return null;
        },
        /**
         * Setters
         */
        setProperties: function(/*string*/ name, /*string*/ url, /*int*/ start, /*int*/ end, /*float*/ timeStep, /*string*/ units) {
            // Summary: change the properties set by the constructor
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
        setPhase: function(/*string*/ phase) {
            // Summary: set the model's phase
            this.model.task.phase = phase;
        },
        setType: function(/*string*/ type) {
            // Summary: set the model's type
            this.model.task.type = type;
        },
        setTaskDescription: function(/*string*/ description) {
            // Summary: set the task description
            this.model.task.taskDescription = description;
        },
        /**
         * Functions to add nodes to the given model and the student model
         * *****In process; need to add getters and break up functions in the student model
         */
        addNode: function() {
            // Summary: builds a new node and returns the node's unique id
            var id = "id" + this.ID;
            var order = this.model.task.givenModelNodes.length + 1;
            this.ID++;
            var newNode = new Node(id, order);
            this.model.task.givenModelNodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        deleteNode: function(/*string*/ id) {
            // Summary: deletes a node with a given id
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
        addNodeWithAttributes: function(/*string*/ name, /*bool*/ parent, /*string*/ type, /*bool*/ extra, /*string*/ units, /*float*/ initial, /*string*/ equation, /*string*/ correctDesc) {
            // Summary: create a new node and set its attributes in one step
            // Note: this function is useful for testing; if it is not needed it may be deleted when the MVC is complete
            var id = this.addNode();
            this.setNodeName(id, name);
            this.setNodeParent(id, parent);
            this.setNodeType(id, type);
            this.setNodeExtra(id, extra);
            this.setNodeUnits(id, units);
            this.setNodeInitial(id, initial);
            this.setNodeEquation(id, equation);
            this.setNodeCorrectDesc(id, correctDesc);
            return id;
        },
        setNodeName: function(/*string*/ id, /*string*/ name) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].name = name;
        },
        setNodeParent: function(/*string*/ id, /*bool*/ parent) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].parentNode = parent;
        },
        setNodeType: function(/*string*/ id, /*string*/ type) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].type = type;
        },
        setNodeExtra: function(/*string*/ id, /*bool*/ extra) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].extra = extra;
        },
        setNodeUnits: function(/*string*/ id, /*string*/ units) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].units = units;
        },
        setNodeInitial: function(/*string*/ id, /*float*/ initial) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].initial = initial;
        },
        setNodeEquation: function(/*string*/ id, /*string*/ equation) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].equation = equation;
        },
        setNodeCorrectDesc: function(/*string*/ id, /*string*/ correctDesc) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].correctDesc = correctDesc;
        },
        addNodeInput: function(/*string*/ input, /*string*/ inputInto) {
            // Summary: adds a node (input) as an input into the given node (inputInto); both params are node ID strings
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
        addStudentModelNode: function() {
            // Summary: builds a new node in the student model and returns the node's unique ID
            var id = "id" + this.ID;
            this._updateNextXYPosition();
            var xPos = this.x;
            var yPos = this.y;
            this.ID++;
            var newNode = new StudentNode(id, xPos, yPos);
            this.model.task.studentModelNodes.push(newNode);
            console.log(" :-)  :-)  :-)  :-)  :-) ");
            return id;
        },
        setStudentModelNodeName: function(/*string*/ id, /*string*/ newName) {
            // Summary: sets a name for the student model node and attempts to match it against
            //      the given model; returns the nodes ID, which updates to match the given 
            //      model node, if it exists
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
        addStudentNodeWithName: function(/*string*/ name) {
            // Summary: create a new node in the StudentModel and set its attributes in one step
            //      returns the nodes ID, which updates to match the given model node, if it exists
            var id = this.addStudentModelNode();
            return this.setStudentModelNodeName(id, name);
        },
        addStudentNodeInput: function(/*string*/ input, /*string*/ inputInto) {
            // Summary: adds a node (input) as an input into the given node in 
            //      the StudentModel (inputInto) both parameters are node ID's
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
        deleteStudentModelNode: function(/*string*/ id) {
            // Summary: deletes a node with a given id from the student model
            var deleted = false;
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                if (id === this.model.task.studentModelNodes[i].ID) {
                    this.model.task.studentModelNodes.splice(this.model.task.studentModelNodes.indexOf(this.model.task.studentModelNodes[i]), 1);
                    deleted = true;
                }
            }
            return deleted;
        },
        /**
         * Next 3 functions keep track of correct, incorrect, or demo'd solutions
         */
        setSolutionDesc: function(/*string*/ id, /*string*/ solution) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(solution, null, null);
        },
        setSolutionPlan: function(/*string*/ id, /*string*/ solution) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(null, solution, null);
        },
        setSolutionCalc: function(/*string*/ id, /*string*/ solution) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addSolution(null, null, solution);
        },
        setStudentNodeXY: function(/*string*/ id, /*int*/ xPos, /*int*/ yPos) {
            // Summary: sets the "X" and "Y" values of a node's position
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID) {
                    this.model.task.studentModelNodes[i].position.x = xPos;
                    this.model.task.studentModelNodes[i].position.y = yPos;
                }
        },
        /**
         * Next 5 functions save student choices in the Student Model
         */
        setStudentSelectionsDesc: function(/*string*/ id, /*string*/ selection) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(selection, null, null, null, null);
        },
        setStudentSelectionsPlan: function(/*string*/ id, /*string*/ selection) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, selection, null, null, null);
        },
        setStudentSelectionsUnits: function(/*string*/ id, /*string*/ selection) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, selection, null, null);
        },
        setStudentSelectionsInitial: function(/*string*/ id, /*float*/ selection) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, null, selection, null);
        },
        setStudentSelectionsEquation: function(/*string*/ id, /*string*/ selection) {
            for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                if (id === this.model.task.studentModelNodes[i].ID)
                    this.model.task.studentModelNodes[i].setStudentSeletions(null, null, null, null, selection);
        },
        /**
         * Next 3 functions keep track of student attempts
         */
        addAttemptDesc: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(true, false, false);
        },
        addAttemptPlan: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(false, true, false);
        },
        addAttemptCalc: function(/*string*/ id) {
            for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                if (id === this.model.task.givenModelNodes[i].ID)
                    this.model.task.givenModelNodes[i].addAttempt(false, false, true);
        }
    });
});
