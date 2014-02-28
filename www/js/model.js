/* global define, getNextOptimalNode */
/**
 * 
 * Model controller to build, load, and retrieve Dragoon problems
 * @author: Brandon Strong
 * 
 **/

/**
 * 
 * NOTE: this.beginX, this.beginY, this.nodeWidth, and this.nodeHeight should 
 *      be set to match the requirements of the viewer part of the MVC. These 
 *      variables control where the nodes will begin being placed, and tell the
 *      model the size of the nodes to avoid collisions.
 * 
 */

define([
    "dojo/_base/array", "dojo/_base/lang"
], function(array, lang) {


    return function() {

        var obj = {
            constructor: function(/*string*/ mode, /*string*/ name, /*object*/ properties) {
                // Summary: Initializes the object (the Dragoon problem)
                // Note: beginX and beginY specify coordinates where nodes can begin appearing
                //      when the student adds them; nodeWidth and nodeHeighth can be manually
                //      adjusted to allow enough room in between the nodes; _updateNextXYPosition()
                //      uses nodeWidth and nodeHeighth to know where to place new student nodes

                // Private variables
                this._ID = 1;
                // Public variables
                this.beginX = 100;
                this.beginY = 100;
                this.nodeWidth = 200;
                this.nodeHeight = 200;
                this.x = this.beginX;
                this.y = this.beginY;
                this.lastNodeVisible = null;
                this.taskName = name;
                this.properties = properties;
                this.checkedNodes = new Array();
                this.model = this._buildModel();

                /*
                 Define the "active model" (see doucumentation/javascript.md).
                 */
                obj.active = (mode == "AUTHOR") ? obj.given : obj.student;

            },
            taskDescription: null,
            /**
             * 
             * Private methods; these methods should not be accessed outside of this class
             *  
             */
            _buildModel: function() {
                // Summary: builds a model object after defining its attributes;
                //      not used when loading a model; only used by the constructor
                // Tags: private
                var newModel = {task: {
                        taskName: this.taskName,
                        properties: this.properties,
                        taskDescription: this.taskDescription,
                        givenModelNodes: [],
                        extraDescriptions: [],
                        studentModelNodes: []
                    }};
                return newModel;
            },
            _updateNextXYPosition: function() {
                // Summary: keeps track of where to place the next node; function detects collisions
                //      with other nodes; is called in addStudentNode() before creating the node
                // Tags: private
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    var x = this.model.task.studentModelNodes[i].position.x;
                    var y = this.model.task.studentModelNodes[i].position.y;
                    while (this.x > x - this.nodeWidth && this.x < x + this.nodeWidth &&
                            this.y > y - this.nodeHeight && this.y < y + this.nodeHeight) {
                        if (this.x + this.nodeWidth < document.documentElement.clientWidth + 100)
                            this.x += this.nodeWidth;
                        else {
                            this.x = this.beginX;
                            this.y += this.nodeHeight;
                        }
                    }
                }
            },
            _getLargestID: function() {
                /*
                 We use ids of the form "id"+integer.  This loops through
                 all the nodes in the model and finds the lowest integer such
                 that there is no name conflict.  We simply ignore any ids that
                 are not of the form "id"+integer.
                 */

                /*
                 * Brett: I moved this code into another function because I am 
                 * using it in addNodeObject() (which I use for testing to avoid
                 * writing out excessive code in my testing) and I thought it 
                 * would be more efficient to not copy the same stuff. I'm putting
                 * it in a function again so that my code works, but I will keep 
                 * these changes to a single commit so that it can be undone if
                 * there is something I am not accounting for. Thanks!
                 */
                var largest = 0;
                var intID = function(/*object*/ node) {
                    if (node.ID.length >= 2 && node.ID.slice(0, 2) == "id") {
                        var n = parseInt(node.ID.slice(2));
                        if (n && n > largest)
                            largest = n;
                    }
                };
                array.forEach(this.given.getNodes(), intID);
                array.forEach(this.student.getNodes(), intID);
                array.forEach(this.getExtraDescriptions(), intID);
                return largest;
            },
            _setStatus: function(/*string*/ id, /*string*/ part, /*string*/ status) {
                // Summary: tracks student progress (correct, incorrect) on a given node; 
                //      used in setStudentNodeSelection() and setToDemo()
                // Tags: private
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                    if (id === this.model.task.givenModelNodes[i].ID)
                        switch (part) {
                            case "description":
                                this.model.task.givenModelNodes[i].addStatus(status, null, null, null, null);
                                break;
                            case "type":
                                this.model.task.givenModelNodes[i].addStatus(null, status, null, null, null);
                                break;
                            case "initial":
                                this.model.task.givenModelNodes[i].addStatus(null, null, status, null, null);
                                break;
                            case "units":
                                this.model.task.givenModelNodes[i].addStatus(null, null, null, status, null);
                                break;
                            case "equation":
                                this.model.task.givenModelNodes[i].addStatus(null, null, null, null, status);
                                break;
                        }
            },
            _checkChildren: function(/*string*/ currentNodeID, /*string array*/ checkedNodes) {
                // Summary: searches the depth of a tree below the given node and returns an
                //      optimal child node; if no optimal child node exists it returns null
                // Note: checkedNodes is an array that stores the nodes that have been checked 
                //      to avoid an infinite loop; it is set to empty before _checkChildren() 
                //      is called by getNextOptimalNode()
                // Tags: private
                checkedNodes.push(currentNodeID);
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                    if (currentNodeID === this.model.task.givenModelNodes[i].ID) {
                        for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++)
                            if (checkedNodes.indexOf(this.model.task.givenModelNodes[i].inputs[ii].ID) === -1)
                                if (!this.isNodeVisible(this.model.task.givenModelNodes[i].inputs[ii].ID)) {
                                    return this.model.task.givenModelNodes[i].inputs[ii].ID;
                                } else {
                                    var temp = this._checkChildren(this.model.task.givenModelNodes[i].inputs[ii].ID, checkedNodes);
                                    if (temp !== null)
                                        return temp;
                                }
                        return null;
                    }
                return null;
            },
            /**
             * 
             * Public methods
             *  
             */

            /**
             * Functions to load or retrieve a model in string format
             */
            loadModel: function(/*object*/ model) {
                // Summary: loads a model object;
                //      allows Dragoon to load a pre-defined program or to load a users saved work
                //      Sets id for next node.
                this.model = model;
                // Brett: please see the explanation for the change in _getLargestID()
                this._ID = this._getLargestID + 1;
            },
            getModelAsString: function() {
                // Summary: Returns a JSON object in string format
                //          Should only be used for debugging.
                return JSON.stringify(this.model, null, 4);
            },
            /**
             * GETTERS; retrieves specific attributes from a model; node attributes are usually
             * by accessed by the node's ID--if the ID is not known use getNodeIDByName("name");
             */
            getPhase: function() {
                return this.model.task.properties.phase;
            },
            getType: function() {
                return this.model.task.properties.type;
            },
            getTaskName: function() {
                return this.model.task.taskName;
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
            getEachNodeUnits: function() {
                // Summary:  returns an object containing the units for each node
                return array.forEach(this.given.getNodes(), function(node) {
                    return node.units;
                });
            },
            getEachNodeUnitbyID: function() {
                //summary: returns key/value pair of node-id/unit
                var unitList = {};
                array.forEach(this.given.getNodes(), function(node) {
                    unitList[node.ID] = node.units;
                });
                return unitList;
            },
            getEachStudentNodeUnitbyID: function() {
                //summary: returns key/value pair of node-id/unit
                var unitList = {};
                array.forEach(this.student.getNodes(), function(node) {
                    unitList[node.ID] = node.units;
                });
                return unitList;
            },
            getAllUnits: function() {
                // Summary:  returns a list of all distinct units 
                // (string format) defined in a problem.
                // Need to order list alphabetically.
                var unitList = new Array(this.getUnits());
                array.forEach(this.given.getNodes(), function(node) {
                    if (array.indexOf(unitList, node.units) == -1) {
                        unitList.push(node.units);
                    }
                }, this);
                array.forEach(this.getExtraDescriptions(), function(node) {
                    if (array.indexOf(unitList, node.units) == -1) {
                        unitList.push(node.units);
                    }
                }, this);
                return unitList;
            },
            getTaskDescription: function() {
                return this.model.task.taskDescription;
            },
            getAllDescriptions: function() {
                // Summary: returns an array of all descriptions with
                // name (label) and any associated node id (value).
                // TO DO:  The list should be sorted.
                var d = [];
                array.forEach(this.given.getNodes(), function(node) {
                    d.push({label: node.description, value: node.ID});
                });
                array.forEach(this.getExtraDescriptions(), function(node) {
                    d.push({label: node.description, value: node.ID});
                });
                return d;
            },
            getNodeNameByID: function(/*string*/ id) {
                // Summary: returns the name of a node matching the given model
                //      node or extra node id.  If no match is 
                //      found, then return null.
                var ret = null;
                // Not very efficient, but it works
                array.forEach(this.given.getNodes(), function(node) {
                    if (node.ID == id) {
                        ret = node.name;
                    }
                }, this);
                array.forEach(this.getExtraDescriptions(), function(node) {
                    if (node.ID == id) {
                        ret = node.name;
                    }
                }, this);
                console.assert(ret, "Node '" + id + "' not found.");
                return ret; // returns null if the node cannot be found
            },
            getNodeIDByName: function(/*string*/ name) {
                // Summary: returns the id of a node matching the given name; the given 
                //      model nodes are searched first, followed by the student model nodes
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    if (name === this.model.task.givenModelNodes[i].name)
                        return this.model.task.givenModelNodes[i].ID;
                }
                console.error("Can't find node name in given model: ", name);
                // Need to decide how to handle student model node name
                for (i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (name === this.model.task.studentModelNodes[i].name)
                        return this.model.task.studentModelNodes[i].ID;
                }
                return null; // returns null if the node cannot be found
            },
            getNodeIDByDescription: function(/*string*/ description) {
                // Summary: returns the id of a node matching the given description; the given 
                //      model nodes are searched first, followed by the student model nodes
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    if (description === this.model.task.givenModelNodes[i].description)
                        return this.model.task.givenModelNodes[i].ID;
                }
                return null; // returns null if the node cannot be found
            },
            //function added to get student node type
            getStudentNodeType: function(/*string*/ id) {
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (id === this.model.task.studentModelNodes[i].ID)
                        return this.model.task.studentModelNodes[i].type;
                }
                return null;
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
            isNodeInput: function(/*string*/ mainNodeID, /*string*/ inputID) {
                // Summary: returns true if the node identified by inputID is an 
                //      input into the mainNodeID 
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    if (mainNodeID === this.model.task.givenModelNodes[i].ID && this.model.task.givenModelNodes[i].inputs.length !== 0) {
                        for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++)
                            if (inputID === this.model.task.givenModelNodes[i].inputs[ii].ID)
                                return true;
                        i = this.model.task.givenModelNodes.length;
                    }
                }
                return false;
            },
            isNodeVisible: function(/*string*/ id) {
                // Summary: returns true if the node is in the student model
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (id === this.model.task.studentModelNodes[i].ID)
                        return true;
                }
                return false;
            },
            isNodesParentVisible: function(/*string*/ id) {
                // Summary: returns true if the node's parent is visible (if the 
                //      node is an input into another node that is in the student model
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    var temp = this.model.task.givenModelNodes[i].ID;
                    for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++)
                        if (this.isNodeVisible(temp))
                            return true;
                }
                return false;
            },
            areNodeInputsVisible: function(/*string*/ id) {
                //Summary: returns true if all of the inputs in a given node are visible
                for (var i = 0; i < this.getNodeInputs(id).length; i++)
                    if (!this.isNodeVisible(this.getNodeInputs(id)[i]))
                        return false;
                return true;
            },
            areAllNodesVisible: function(/*string*/ id) {
                //Summary: returns true if all of the inputs in the model are visible
                for (var i = 0; i < this.givenModelNodes(id).length; i++)
                    if (!this.isNodeVisible(this.givenModelNodes(id)[i]))
                        return false;
                return true;
            },
            getOptimalNode: function() {
                // Summary: returns the ID of an optimal node to be used next
                // Note: the function first searches for an optimal child node 
                //      of the last valid node that was made visible, then if none 
                //      are found the function searches for a parent node that is 
                //      visible but still has descendant nodes that are not, and 
                //      then it searches for a parent node that has not been 
                //      defined, and then for any node that has not been defined 
                var id = null;
                if (this.lastNodeVisible !== null) {
                    //searches for an optimal child node of the last valid node that was made visible
                    id = getNextOptimalNode(this.lastNodeVisible);
                    if (id !== null)
                        return id;
                }
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    //searches for a parent node that is visible but still has descendant nodes that are not
                    if (this.model.task.givenModelNodes[i].parentNode) {
                        if (this.isNodeVisible(this.model.task.givenModelNodes[i].ID)) {
                            id = this.getNextOptimalNode(this.model.task.givenModelNodes[i].ID);
                            if (id !== null)
                                return id;
                        } else {
                            id = this.model.task.givenModelNodes[i].ID;
                        }
                    }
                }
                if (id === null)
                    for (i = 0; i < this.model.task.givenModelNodes.length; i++)
                        if (!this.isNodeVisible(this.model.task.givenModelNodes[i].ID))
                            return this.model.task.givenModelNodes[i].ID;
                return id;
            },
            getNextOptimalNode: function(/*string*/ currentNodeID) {
                // Summary: returns the next optimal child node of currentNodeID or 
                //      null if there is not an optimal child node
                var checkedNodes = [];
                return this._checkChildren(currentNodeID, checkedNodes);
            },
            getNextOptimalInput: function(/*string*/ currentNodeID) {
                //Summary: returns the next non-visible input to a node
                for (var i = 0; i < this.getNodeInputs(currentNodeID).length; i++)
                    if (!this.isNodeVisible(this.getNodeInputs(currentNodeID)[i]))
                        return this.getNodeInputs(currentNodeID)[i];
                return null;
            },
            isDescriptionOptimal: function(/*string*/ description) {
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    if (this.model.task.givenModelNodes[i].description === description) {
                        var id = this.model.task.givenModelNodes[i].ID;
                        if (this.isNodeVisible(id))
                            return "alreadyExists";
                        if (this.model.task.givenModelNodes[i].parentNode)
                            return "optimal";
                        if (this.isNodesParentVisible(id))
                            return "optimal";
                        return "notOptimal";
                    }
                }
                return "doesNotExist";
            },
            getNodeAttemptCount: function(/*string*/ id, /*string*/ part) {
                // Summary: returns the number of attempts a student has made on the 
                //      given part of the problem
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                    if (id === this.model.task.givenModelNodes[i].ID)
                        switch (part) {
                            case "description":
                                return this.model.task.givenModelNodes[i].attemptCount.description;
                                break;
                            case "type":
                                return this.model.task.givenModelNodes[i].attemptCount.type;
                                break;
                            case "initial":
                                return this.model.task.givenModelNodes[i].attemptCount.initial;
                                break;
                            case "units":
                                return this.model.task.givenModelNodes[i].attemptCount.units;
                                break;
                            case "equation":
                                return this.model.task.givenModelNodes[i].attemptCount.equation;
                                break;
                            default:
                                console.error("Invalid part ", part);
                        }
                return null;
            },
            incrementDescriptionAttemptCount: function(/*string*/ id) {
                // Summary: returns the number of attempts a student has made on the 
                //      given part of the problem
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                    if (id === this.model.task.givenModelNodes[i].ID)
                        this.model.task.givenModelNodes[i].attemptCount.description++;
            },
            getNodeStatus: function(/*string*/ id, /*string*/ part) {
                // Summary: returns the progress (correct, incorrect, or demo) of 
                //      the given node's description section
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++)
                    if (id === this.model.task.givenModelNodes[i].ID)
                        switch (part) {
                            case "description":
                                return this.model.task.givenModelNodes[i].status.description;
                                break;
                            case "type":
                                return this.model.task.givenModelNodes[i].status.type;
                                break;
                            case "initial":
                                return this.model.task.givenModelNodes[i].status.initial;
                                break;
                            case "units":
                                return this.model.task.givenModelNodes[i].status.units;
                                break;
                            case "equation":
                                return this.model.task.givenModelNodes[i].status.equation;
                                break;
                            default:
                                console.error("Invalid part ", part);
                        }
                return null;
            },
            getExtraDescriptions: function() {
                // Summary: returns an array of the extra descriptions.
                return this.model.task.extraDescriptions;
            },
            isStudentModelEmpty: function() {
                // Summary: returns true if the the student model is empty
                if (this.model.task.studentModelNodes)
                    return true;
                return false;
            },
            isInGivenModel: function(/*string*/ id) {
                // Summary: returns true if a node in the student model is also found in the given model
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (id === this.model.task.studentModelNodes[i].ID)
                        return this.model.task.studentModelNodes[i].givenNodeID;
                }
                return null;
            },
            getStudentNodeInputs: function(/*string*/ id) {
                var node = this.student.getNode(id);
                // Summary: returns an array with the node ids that the student has selected as inputs
                return node && array.map(node.inputs, function(input) {
                    return input.ID;
                });
            },
            isStudentNodeInput: function(/*string*/ mainNodeID, /*string*/ inputID) {
                // Summary: returns true if the node identified by inputID is an 
                //      input into the mainNodeID in the Student Model
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (mainNodeID === this.model.task.studentModelNodes[i].ID && this.model.task.studentModelNodes[i].inputs.length !== 0) {
                        i = this.model.task.studentModelNodes.length;
                        for (var ii = 0; ii < this.model.task.studentModelNodes[i].inputs.length; ii++)
                            if (inputID === this.model.task.studentModelNodes[i].inputs[ii].ID)
                                return true;
                    }
                }
                return false;
            },
            /*
             Brandon:  Here is a clean-up of some of the getters that
             uses a common function to find the node.  Note that it
             has error handling in the event that the id is invalid.
             
             It is not clear if these getters will be needed in this form.
             It might make for cleaner code (outside of model.js) if a node is passed in
             as an argument.
             */

            getStudentNodePosition: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.position;
            },
            getStudentNodeDesc: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.selections.description;
            },
            getStudentNodePlan: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.selections.plan;
            },
            getStudentNodeUnits: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.selections.units;
            },
            getStudentNodeInitial: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.selections.initial;
            },
            getStudentNodeEquation: function(/*string*/ id) {
                var node = this.student.getNode(id);
                return node && node.selections.equation;
            },
            /**
             * SETTERS
             */
            setTaskName: function(/*string*/ name) {
                this.model.task.taskName = name;
            },
            setURL: function(/*string*/ url) {
                this.model.task.properties.URL = url;
            },
            setStartTime: function(/*int*/ start) {
                this.model.task.properties.startTime = start;
            },
            setEndTime: function(/*int*/ end) {
                this.model.task.properties.endTime = end;
            },
            setTimeStep: function(/*float*/ timeStep) {
                this.model.task.properties.timeStep = timeStep;
            },
            setModelUnits: function(/*string*/ units) {
                this.model.task.properties.units = units;
            },
            setPhase: function(/*string*/ phase) {
                // Summary: set the model's phase
                this.model.task.properties.phase = phase;
            },
            setType: function(/*string*/ type) {
                // Summary: set the model's type
                this.model.task.properties.type = type;
            },
            setTaskDescription: function(/*string*/ description) {
                // Summary: set the task description
                this.model.task.taskDescription = description;
            },
            /**
             * Functions to add and delete nodes in the given model and the student model
             */
            addNode: function() {
                // Summary: builds a new node and returns the node's unique id
                var id = "id" + this._ID;
                var order = this.model.task.givenModelNodes.length + 1;
                this._ID++;
                var newNode = new Node(id, order);
                this.model.task.givenModelNodes.push(newNode);
                return id;
            },
            deleteNode: function(/*string*/ id) {
                // Summary: deletes a node with a given id; re-orders the remaining nodes; removes the
                //      given node from other nodes' inputs and erases equations containing the deleted node
                var deleted = false;
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    this.deleteNodeInput(this.model.task.givenModelNodes[i].ID, id);
                    if (this.model.task.givenModelNodes[i].equation.indexOf(id) > -1)
                        this.model.task.givenModelNodes[i].equation = "";
                    if (id === this.model.task.givenModelNodes[i].ID) {
                        this.model.task.givenModelNodes.splice(this.model.task.givenModelNodes.indexOf(this.model.task.givenModelNodes[i]), 1);
                        deleted = true;
                        if (this.model.task.givenModelNodes.length > i)
                            this.model.task.givenModelNodes[i].order = this.model.task.givenModelNodes[i].order - 1;
                    }
                    else if (deleted)//maintains order of nodes during deletion                    
                        this.model.task.givenModelNodes[i].order = this.model.task.givenModelNodes[i].order - 1;
                }
                this.deleteStudentNode(id);
                return deleted;
            },
            deleteNodeInput: function(/*string*/ id, /*string*/ inputIDToRemove) {
                // Summary: remove an input from a node in the given model
                for (var i = 0; i < this.model.task.givenModelNodes.length; i++) {
                    if (id === this.model.task.givenModelNodes[i].ID)
                        for (var ii = 0; ii < this.model.task.givenModelNodes[i].inputs.length; ii++) {
                            if (inputIDToRemove === this.model.task.givenModelNodes[i].inputs[ii].ID) {
                                this.model.task.givenModelNodes[i].inputs.splice(this.model.task.givenModelNodes[i].inputs.indexOf(this.model.task.givenModelNodes[i].inputs[ii]), 1);
                            }
                        }
                }
            },
            addExtraDescription: function(/*string*/ text, /*string*/ type) {
                // Summary: allows author to add extra descriptions that are not
                //      required in the completed model to further challenge the 
                //      the student
                // Note: type should be "model" (meaning the description is 
                //      referred to in the model's task description but is not 
                //      required to complete the model) or "extra" (meaning the 
                //      description is not mentioned in the problem and is not 
                //      needed to solve the problem)
                this.model.task.extraDescriptions.push({text: text, type: type});
            },
            deleteStudentNode: function(/*string*/ id) {
                // Summary: deletes a node with a given id from the student model; removes
                //      the given node from other nodes inputs within the student model and
                //      erases equations containing the deleted node; resets matching given
                //      model nodes to no longer be marked correct
                var deleted = false;
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    this.deleteStudentNodeInput(this.model.task.studentModelNodes[i].ID, id);
                    if (this.model.task.studentModelNodes[i].selections.equation.indexOf(id) > -1)
                        this.model.task.studentModelNodes[i].selections.equation = "";
                    if (id === this.model.task.studentModelNodes[i].ID) {
                        if (this.model.task.studentModelNodes[i].givenNodeID) // checks if node was in given model
                            for (var ii = 0; ii < this.model.task.givenModelNodes.length; ii++)
                                if (this.model.task.givenModelNodes[ii].ID === id)
                                    this.model.task.givenModelNodes[ii].resetStatus();
                        this.model.task.studentModelNodes.splice(this.model.task.studentModelNodes.indexOf(this.model.task.studentModelNodes[i]), 1);
                        deleted = true;
                        break;
                    }
                }
                return deleted;
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
                for (i = 0; i < this.model.task.studentModelNodes.length; i++) {
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
            deleteStudentNodeInput: function(/*string*/ id, /*string*/ inputIDToRemove) {
                // Summary: remove an input from a node in the student model
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++) {
                    if (id === this.model.task.studentModelNodes[i].ID)
                        for (var ii = 0; ii < this.model.task.studentModelNodes[i].inputs.length; ii++) {
                            if (inputIDToRemove === this.model.task.studentModelNodes[i].inputs[ii].ID) {
                                this.model.task.studentModelNodes[i].inputs.splice(this.model.task.studentModelNodes[i].inputs.indexOf(this.model.task.studentModelNodes[i].inputs[ii]), 1);
                            }
                        }
                }
            },
            setStudentNodeXY: function(/*string*/ id, /*int*/ xPos, /*int*/ yPos) {
                // Summary: sets the "X" and "Y" values of a node's position
                for (var i = 0; i < this.model.task.studentModelNodes.length; i++)
                    if (id === this.model.task.studentModelNodes[i].ID) {
                        this.model.task.studentModelNodes[i].position.x = xPos;
                        this.model.task.studentModelNodes[i].position.y = yPos;
                    }
            },
            setToDemo: function(/*string*/ id, /*string*/ part) {
                // Summary: sets the given part of the problem to "demo" in the given node
                //      and puts the correct answer into the studentModelNode; intended to 
                //      be used when the student asks for the answer or attempts the question 
                //      incorrectly too many times
                var node = obj.student.getNode(id);
                if (node) {
                    var givenNodeID = node.givenNodeID;
                    switch (part) {
                        case "description":
                            obj.student.setDescription(id, givenNodeID);
                            break;
                        case "type":
                            obj.student.setType(id, obj.given.getType(givenNodeID));
                            break;
                        case "initial":
                            obj.student.setInitial(id, obj.given.getInitial(givenNodeID));
                            break;
                        case "units":
                            obj.student.setUnits(id, obj.given.getUnits(givenNodeID));
                            break;
                        case "equation":
                            obj.student.setEquation(id, obj.given.getEquation(givenNodeID));
                            break;
                        default:
                            console.error("Invalid part ", part);
                    }
                    this._setStatus(id, part, "demo");
                }
            }
        };

        /* 
         add subclasses with model accessors 
         
         TODO:  Move associated functions themselves to this 
         section.
         */

        // Methods common to both student and given.
        // These will be mixed into both obj.given and obj.student
        var both = {
            isNode: function(/*string*/ id) {
                return array.some(this.getNodes(), function(node) {
                    return node.ID === id;
                });
            },
            getNode: function(/*string*/ id) {
                var ret = null;
                array.some(this.getNodes(), function(node) {
                    if (node.ID == id)
                        ret = node;
                    return node.ID == id;
                });
                console.info("in getNode", this.getNodes());
                console.assert(ret, "No matching node for '" + id + "'");
                return ret;
            },
            addInput: function(/*string*/ input, /*string*/ inputInto) {
                // Summary: adds a node (input) as an input into the given node (inputInto); both params are node ID strings
                if (inputInto === input) { //node can't be input into itself
                    console.error("Can't input node into itself.");
                    return;
                }
                // Check that input and inputInto are valid ID's
                if (!this.getNode(input)) {
                    console.error("Input node is not valid: ", input);
                    return;
                }
                var receivingNode = this.getNode(inputInto);
                if (!receivingNode) {
                    console.error("Receiving node is not valid: ", inputInto);
                    return;
                }
                // Add input into node
                receivingNode.inputs.push(input);
            },
            addNodeObject: function(/*node object*/ nodeObject) {
                // Summary: adds a node object that is passed into it; used for
                //      testing; used to pass in a complete node object 
                //      instead of setting elements one at a time.
                if (!this.getNode(nodeObject.ID)) {
                    console.log("Adding node object. Node ID does not yet exist. Ignore matching error on previous line.");
                    this._addNodeObject(nodeObject);
                    obj._ID = obj._getLargestID() + 1;
                } else {
                    console.error("Node ID is already in use: ", nodeObject.ID);
                }
            }
        };

        obj.given = lang.mixin({
            _addNodeObject: function(/*node object*/ nodeObject) {
                // Summary: adds node object after checking for duplicates; 
                //      used for testing.                
                // Tags: private
                obj.model.task.givenModelNodes.push(nodeObject);
            },
            addNode: function() {
                // Summary: builds a new node and returns the node's unique id
                var newNode = {"ID": "id" + obj._ID++,
                    "inputs": [],
                    "attemptCount": {
                        "description": 0,
                        "type": 0,
                        "initial": 0,
                        "units": 0,
                        "equation": 0
                    },
                    "status": {}
                };
                obj.model.task.givenModelNodes.push(newNode);
                return newNode.ID;
            },
            getNodes: function() {
                return obj.model.task.givenModelNodes;
            },
            getNodeNameByID: function(/*string*/ id) {
                // Summary: returns the name of a node matching the student model.
                //      If no match is found, then return null.
                var node = this.getNode(id);
                return node && node.name;
            },
            getNodeEquation: lang.hitch(obj, obj.getNodeEquation),
            getNodeInitial: lang.hitch(obj, obj.getNodeInitial),
            getNodeType: lang.hitch(obj, obj.getNodeType),
            getEachNodeUnitbyID: lang.hitch(obj, obj.getEachNodeUnitbyID),
            setName: function(/*string*/ id, /*string*/ name) {
                this.getNode(id).name = name;
            },
            setParent: function(/*string*/ id, /*bool*/ parent) {
                this.getNode(id).parent = parent;
            },
            setType: function(/*string*/ id, /*string*/ type) {
                this.getNode(id).type = type;
            },
            setExtra: function(/*string*/ id, /*bool*/ extra) {
                this.getNode(id).extra = extra;
            },
            setUnits: function(/*string*/ id, /*string*/ units) {
                this.getNode(id).units = units;
            },
            setInitial: function(/*string*/ id, /*float*/ initial) {
                this.getNode(id).initial = initial;
            },
            setEquation: function(/*string*/ id, /*string | object*/ equation) {
                this.getNode(id).equation = equation;
            },
            setDescription: function(/*string*/ id, /*float*/ description) {
                this.getNode(id).description = description;
            },
            getType: function(/*string*/ id) {
                return this.getNode(id).type;
            },
            getInitial: function(/*string*/ id) {
                return this.getNode(id).initial;
            },
            getUnits: function(/*string*/ id) {
                return this.getNode(id).units;
            },
            getEquation: function(/*string*/ id) {
                return this.getNode(id).equation;
            },
            getDescription: function(/*string*/ id) {
                return this.getNode(id).description;
            }
        }, both);

        obj.student = lang.mixin({
            _addNodeObject: function(/*node object*/ nodeObject) {
                // Summary: adds node object after checking for duplicates; 
                //      used for testing.
                // Tags: private
                obj.model.task.studentModelNodes.push(nodeObject);
            },
            addNode: function() {
                // Summary: builds a new node in the student model and returns the node's ID
                obj._updateNextXYPosition();
                var newNode = {
                    ID: "id" + obj._ID++,
                    inputs: [],
                    position: {x: obj.x, y: obj.y},
                    selections: {}
                };
                obj.model.task.studentModelNodes.push(newNode);
                return newNode.ID;
            },
            getGivenNodeID: function(id) {
                // Return any matched given model id for student node.
                // node.givenNodeID is largely redundant with node.sections.description.
                var node = this.getNode(id);
                return node && node.givenNodeID;
            },
            getNodeNameByID: function(/*string*/ id) {
                // Summary: returns the name of a node matching the student model.
                //      If no match is found, then return null.
                /*
                 Determine what student has selected for this node 
                 and then look for matching node in given model
                 and extraDescriptions
                 */
                var node = this.getNode(id);
                return node && node.selections.description
                        && obj.getNodeNameByID(node.selections.description);
            },
            getNodes: function() {
                return obj.model.task.studentModelNodes;
            },
            getNodeInputs: lang.hitch(obj, obj.getStudentNodeInputs),
            getNodeEquation: lang.hitch(obj, obj.getStudentNodeEquation),
            getNodeInitial: lang.hitch(obj, obj.getStudentNodeInitial),
            getNodeType: lang.hitch(obj, obj.getStudentNodeType),
            getEachNodeUnitbyID: lang.hitch(obj, obj.getEachStudentNodeUnitbyID),
            setDescription: function(/*string*/ id, /*float*/ description) {
                this.getNode(id).selections.description = description;
            },
            setType: function(/*string*/ id, /*string*/ type) {
                this.getNode(id).selections.type = type;
            },
            setInitial: function(/*string*/ id, /*float*/ initial) {
                this.getNode(id).selections.initial = initial;
            },
            setUnits: function(/*string*/ id, /*string*/ units) {
                this.getNode(id).selections.units = units;
            },
            setEquation: function(/*string*/ id, /*string | object*/ equation) {
                this.getNode(id).selections.equation = equation;
            }
        }, both);

        // Execute the constructor
        obj.constructor.apply(obj, arguments);

        return obj;

    };

});
