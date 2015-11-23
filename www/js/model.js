/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU Lesser General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* global define */
/**
 *
 * Model controller to build, load, and retrieve Dragoon problems
 * @author: Brandon Strong, Brett van de Sande
 *
 **/

define([
	"dojo/_base/array", "dojo/_base/lang"
], function(array, lang){
	// Summary:
	//			Manages the model in memory for the MVC (model view controller)
	// Description:
	//			Loads the model when a student starts a problem; accesses and
	//			modifies it when there are changes or requests; builds a model
	//			in author mode;
	// Tags:
	//			MVC, model
	// Note:
	//			this.beginX, this.beginY, this.nodeWidth, and this.nodeHeight
	//			should be set to match the requirements of the viewer part of
	//			the MVC. These variables control where the nodes will begin
	//			being placed, and tell the model the size of the nodes to avoid
	//			collisions.

	return function(){

		var obj = {
			constructor: function(/*string*/ mode, /*string*/ name){
				// Summary: Initializes the object (the Dragoon problem)
				// Note: beginX and beginY specify coordinates where nodes can begin appearing
				//		when the student adds them; nodeWidth and nodeHeighth can be manually
				//		adjusted to allow enough room in between the nodes; _updateNextXYPosition()
				//		uses nodeWidth and nodeHeighth to know where to place new student nodes

				this.x = this.beginX;
				this.y = this.beginY;
				this.checkedNodes = new Array();
				this.model = {task: {
					taskName: name,
					time: {start: 0, end: 10, step: 1.0, integrationMethod: "Eulers Method"},
					properties: {},
					image: {},
					taskDescription: "",
					lessonsLearned: "",
                    increment:[],
					executionIterations: null,
					givenModelNodes: [],
					studentModelNodes: [],
					schemas: []
				}};

				/*
				 Define the "active model" (see doucumentation/node-editor.md).
				 */
				obj.active = (mode == "AUTHOR") ? obj.given : obj.student;

			},
			// Private variables
			_ID: 1,
			_SID: 1,
			// Public variables
			beginX: 400,
			beginY: 100,
			nodeWidth: 100,
			nodeHeight: 100,
			isCompleteFlag: false,
			isLessonLearnedShown: false,
			isDoneMessageShown: false,
            isGraphHelpShown: false,
			iteration: 0,
			problemReopened: false,

			/**
			 *
			 * Private methods; these methods should not be accessed outside of this class
			 *
			 */
			_updateNextXYPosition: function(isMerge){
				// Summary: keeps track of where to place the next node; function detects collisions
				//		with other nodes; is called in addStudentNode() before creating the node
				// Tags: private
				this.x = this.beginX;
				this.y = this.beginY;
				var pos = { x: this.x, y: this.y, nodeWidth: this.nodeWidth, nodeHeight: this.nodeHeight};
				var nodes = isMerge?obj.student.getNodes():obj.active.getNodes();
				while(nodes.some(this.collides, pos))
				{
					this.updatePosition();
					pos = { x: this.x, y: this.y, nodeWidth: this.nodeWidth, nodeHeight: this.nodeHeight};
				}
			},
			setLessonLearnedShown : function(_isLessonLearnedShown) {
				this.model.task.properties.isLessonLearnedShown = _isLessonLearnedShown;
			},
            setDoneMessageShown : function(_isDoneMessageShown) {
                this.isDoneMessageShown = _isDoneMessageShown;
            },
            setGraphHelpShown: function(_isGraphHelpShown){
                this.model.task.properties.isGraphHelpShown = _isGraphHelpShown;
            },
            updatePosition: function()
			{
				if((this.x + this.nodeWidth) < (document.documentElement.clientWidth - this.nodeWidth))
					this.x += this.nodeWidth;
				else
				{
					this.x = this.beginX;
					this.y += this.nodeHeight;
				}
			},

			collides: function(element)
			{
				if(!element.position){
					return false;
				}
				var x = element.position.x;
				var y = element.position.y;
				if(this.x > x - this.nodeWidth && this.x < x + this.nodeWidth &&
					this.y > y - this.nodeHeight && this.y < y + this.nodeHeight)
				{
					return true;
				}
				else
					return false;
			},
			// Adding these as private methods since other modules should not rely on model
			// for manipulating activities.  If others need this, move to a different file.
			_isDemoActivityType: function(activity){
				//console.log("_isDemoActivityType:"+(activity && activity.substring(activity.length-4,activity.length) == "Demo"));
				return (activity && activity.substring(activity.length-4,activity.length) == "Demo");
			},
			_convertDemoToExercise: function(activity){
				if (obj._isDemoActivityType(activity)){
					//console.log("_convertDemoToExercise:"+activity.substring(0,activity.length-4));
					return activity.substring(0,activity.length-4);
				} else {
					throw new Error("Attempted to convert non-demo activity to an exercise.");
				}
			},
			_getNextOptimalNode: function(/*string*/ givenNodeID){
				// Summary: Accepts the id of a parent node and returns the next optimal
				//		child node that is not visible, or null if all descendants are visible;
				//		called by getOptimalNode().
				var optimalNode = null;
				var isInputVisible = function(givenNodeID){
					return array.some(obj.student.getNodes(), function(node){
						return node.descriptionID === givenNodeID;
					}, this);
				};
				array.forEach(this.given.getNode(givenNodeID).inputs, function(node){
					if(!isInputVisible(node.ID) && givenNodeID !== node.ID){
						optimalNode = node.ID;
					}else if(node.inputs){
						optimalNode = this._getNextOptimalNode(node.ID);
					}
				}, obj);
				return optimalNode;
			},

			/**
			 *
			 * Public methods
			 *
			 */
			setShare: function(value){
				// value: Boolean
				this.model.share = value;
			},

			getShare: function(){
				return this.model.share;
			},
			/**
			 * Functions to load or retrieve a model in string format
			 */
			loadModel: function(/*object*/ model){
				// Summary: loads a model object;
				//		allows Dragoon to load a pre-defined program or to load a users saved work
				//		Sets id for next node.
				this.model = model;

				/*
				 We use ids of the form "id"+integer.  This loops through
				 all the nodes in the model and finds the lowest integer such
				 that there is no name conflict.  We simply ignore any ids that
				 are not of the form "id"+integer.
				 */
				var largest = 0;
				var intID = function(/*object*/ node){
					if(node.ID.length >= 2 && node.ID.slice(0, 2) == "id"){
						var n = parseInt(node.ID.slice(2));
						if(n && n > largest)
							largest = n;
					}
				};
				array.forEach(this.given.getNodes(), intID);
				array.forEach(this.student.getNodes(), intID);
				this._ID = largest + 1;

				var schemas = this.active.getSchemas();
				var largestSID = 0;
				if(schemas){
					array.forEach(schemas, function(schema){
						if(schema.ID.length >= 6 && schema.ID.slice(0, 6) == "schema"){
							var n = parseInt(schema.ID.slice(6));
							if(n && n > largestSID)
								largestSID = n;
						}
					});
				}
				this._SID = largestSID + 1;

				/*
				 Sanity test that all given model IDs, node names,
				 and descriptions are distinct, if they are defined.
				 */
				var ids = {}, names = {}, descriptions = {};
				var duplicateDescription = [];
				var duplicateName = [];
				array.forEach(this.given.getNodes(), function(node){
					if(node.ID in ids){
						throw new Error("Duplicate node id " + node.id);
					}
					if(node.name in names){
						duplicateName[node.name] = node.ID;
					}
					if(node.description in descriptions){
						var duplicateNodeId = descriptions[node.description];
						duplicateDescription[node.ID] = node.name;
						duplicateDescription[duplicateNodeId] = this.given.getName(duplicateNodeId);
					}

					ids[node.ID] = true;
					if(node.name){
						names[node.name] = node.ID;
					}
					if(node.description){
						descriptions[node.description] = node.ID;
					}

					if(!node.position){
						obj._updateNextXYPosition();
						node.position = {
							x: obj.x,
							y: obj.y
						};
					}
				}, this);
				/*
				 Set flag showing that student model is complete.

				 Does not corretly handle case where student completes
				 the model, deletes some nodes, and reopens the problem.
				 */
				var errorMessage = "";

				if(Object.keys(duplicateName).length > 0){
					var duplicateStr = "";
					array.forEach(Object.keys(duplicateName), function(duplicate){
						duplicateStr += duplicate + ", ";
					});
					duplicateStr = duplicateStr.substring(0, duplicateStr.length-2);

					//throw error for duplicate names
					errorMessage = "Multiple nodes have same names: <strong>"+ duplicateStr + "</strong>. Please change them to be unique.<br/><br/>";
				}
				if(Object.keys(duplicateDescription).length > 0){
					var duplicateStr = "";
					array.forEach(Object.keys(duplicateDescription), function(duplicate){
						duplicateStr += duplicateDescription[duplicate] + ", ";
					});
					duplicateStr = duplicateStr.substring(0, duplicateStr.length-2);

					//throw error for duplicate descriptions
					errorMessage += "The following nodes have the duplicate descriptions: <strong>"+ duplicateStr + "</strong>. Please change them to be unique.";
				}

				if(errorMessage != ""){
					throw new Error(errorMessage);
				}

				this.isCompleteFlag = this.matchesGivenSolution();
			},
			getInitialTweakedNode: function(){
				return this.model.task.increment && this.model.task.increment[0].tweakedNode;
			},
			getInitialTweakDirection: function(){
				return this.model.task.increment && this.model.task.increment[0].tweakDirection;
			},
			getExecutionIterations: function(){
				return this.model.task.executionIterations;
			},
            getIncrements: function(){
				return (typeof this.model.task.increment!== "undefined") ? this.model.task.increment:[];
			},
            getModelAsString: function(){
				// Summary: Returns a JSON object in string format
				//			Should only be used for debugging.
				return JSON.stringify(this.model, null, 4);
			},
			/**
			 * GETTERS; retrieves specific attributes from a model; node attributes are usually
			 * by accessed by the node's ID--if the ID is not known use getNodeIDByName("name");
			 */
			getTaskName: function(){
				return this.model.task.taskName;
			},
			getType: function(){
				return this.model.task.properties.type;
			},
			getImageURL: function(){
				return this.model.task.image.URL;
			},
			getImageDimensons: function(){
				return {width: this.model.task.image.width, height: this.model.task.image.height};
			},
			getLessonLearnedShown : function() {
				return (this.model.task.properties.isLessonLearnedShown != undefined)?this.model.task.properties.isLessonLearnedShown : false;	
			},
            getGraphHelpShown: function(){
                console.log("model help",this.model.task.properties);
                return (this.model.task.properties.isGraphHelpShown != undefined)?this.model.task.properties.isGraphHelpShown : false;
            },
			getTime: function(){
				// Summary: Returns the time object from the JSON model.
				return this.model.task.time;
			},
			getUnits: function(){
				return this.model.task.time.units;
			},
			getAllUnits: function(){
				// Summary:	 returns a list of all distinct units
				// (string format) defined in a problem.
				// Need to order list alphabetically.
				var unitList = new Array();
				var timeUnits = this.getUnits();
				if(timeUnits){
					unitList.push(timeUnits);
				}
				array.forEach(this.given.getNodes(), function(node){
					if(node.units && array.indexOf(unitList, node.units) == -1){
						unitList.push(node.units);
					}
				}, this);
				return unitList;
			},
			getIntegrationMethod: function(){
				return this.model.task.time.integrationMethod;
			},
			getTaskDescription: function(activityType){
				var desc = this.model.task.taskDescription; 
				if(typeof desc.length != "undefined"){
					this.model.task.taskDescription = {};
					this.model.task.taskDescription["construction"] = desc;
				}
				// Demo versions of activities do not have separate descriptions, so:
				// Convert demo activity to exercise version, if applicable.
				var exercise = (activityType && obj._isDemoActivityType(activityType)) ? obj._convertDemoToExercise(activityType) : activityType;
				// Default to construction if desired acitivty description is not found in model.
				exercise = (exercise && this.model.task.taskDescription[exercise]) ? exercise : "construction";
				return this.model.task.taskDescription[exercise];
			},
			getTaskLessonsLearned : function() {
				return (this.model.task.lessonsLearned) ? this.model.task.lessonsLearned : [];
			},
			getSlides: function(){
				return this.model.task.slides;
			},
			getOptimalNode: function(/*string*/ studentID){
				// Summary: Returns the next optimal node, first checking for children
				//		of visible parent nodes, and then checking for parent nodes that
				//		aren't visible; Returns null if all nodes visible.
				//
				// Note: the student node studentID is assumed incorrect so it is ignored
				var solutionNodes = this.solution.getNodes();
				var nextNode = null;
				for(var i = 0; i < solutionNodes.length; i++){
					if(solutionNodes[i].parentNode){
						if(!this.isNodeVisible(studentID, solutionNodes[i].ID))
						// Use this if no children are found
							nextNode = solutionNodes[i].ID;
						else if(solutionNodes[i].inputs){
							var optimalNode1 = this._getNextOptimalNode(solutionNodes[i].ID);
							if(optimalNode1)
								return optimalNode1;
						}
					}else{
						if(!this.isNodeVisible(studentID, solutionNodes[i].ID) && !nextNode)
							nextNode = solutionNodes[i].ID;
						else if(this.isNodeVisible(studentID, solutionNodes[i].ID) && solutionNodes[i].inputs){
							var optimalNode2 = this._getNextOptimalNode(solutionNodes[i].ID);
							if(optimalNode2)
								return optimalNode2;
						}
					}
				}
				return nextNode;
			},
			areRequiredNodesVisible: function(){
				//Summary: returns true if all of the nodes in the model are visible
				var solutionNodes = this.solution.getNodes();
				var sLength = solutionNodes.length;
				for(var i = 0; i < sLength; i++){
					if(!array.some(this.student.getNodes(), function(studentNode){
							return this.isNodeVisible(studentNode.ID, solutionNodes[i].ID);
						}, this))
						return false;
				}
				return true;
			},
			isParentNode: function(/*string*/ id){
				// Summary: returns true if a node is the parent node in a tree structure;
				return this.given.getNode(id).parentNode;
			},
			isNodeVisible: function(/*string*/ studentID, /*string*/ givenID){
				// Summary: returns true if the node is in the student model,
				//			excluding the current student node.
				return array.some(this.student.getNodes(), function(node){
					return node.ID !== studentID && node.descriptionID === givenID;
				});
			},
			isNodesParentVisible: function(/*string*/ studentID, /*string*/ givenID){
				// Summary: returns true if the given node's parent is visible (if the
				//		node is an input into another node that is in the student model)
				var nodes = this.given.getNodes();

				return array.some(nodes, function(node){
					return array.some(node.inputs, function(input){
						return givenID === input.ID && this.isNodeVisible(studentID, node.ID); // node.ID is the parent of input.ID;
					}, this);
				}, this);
			},
			matchesGivenSolution: function(){
				var flag = this.areRequiredNodesVisible() &&
					array.every(this.student.getNodes(), function(sNode){
						return this.student.isComplete(sNode.ID);
					}, this);
				return flag ? true : false;
			},
			/**
			 * SETTERS
			 */
			setTaskName: function(/*string*/ name){
				if(name) this.model.task.taskName = name;
			},
			setImage: function(/*object*/ options){
				// Summary: JSON object with "URL", "width", and "height" elements; see sample JSON model.
				this.model.task.image = options;
			},
			setTime: function(/*object*/ options){
				// Summary: JSON object with "start", "end", "step", "units", and itegrationMethod elements; see sample JSON model.
				lang.mixin(this.model.task.time, options);
			},
			setPhase: function(/*string*/ phase){
				// Summary: set the model's phase
				this.model.task.properties.phase = phase;
			},
			setType: function(/*string*/ type){
				// Summary: set the model's type
				this.model.task.properties.type = type;
			},
			setTaskDescription: function(/*string*/ description , activityType){
				// Summary: set the task description
				var desc = this.model.task.taskDescription;
				//check if new object is required
				activityType = (activityType) ? activityType : "construction";
				if(typeof desc.length != "undefined"){
					var descObj = {};
					descObj[activityType] = description;
					this.model.task.taskDescription = descObj;
					return;
				}
				this.model.task.taskDescription[activityType] = description;
				return;
			},
			setTaskLessonsLearned: function(/*string*/ lessonsLearned){
				this.model.task.lessonsLearned = lessonsLearned;
			},
            setIncrements: function(/*string*/ node, /*string*/ direction){
            	this.model.task.increment= (node=="defaultSelect" || direction=="defaultSelect")?[]:[{tweakedNode:node, tweakDirection: direction}];
            },
			setExecutionIterations: function(/* number */ itr){
				this.model.task.executionIterations = itr;
			},
			setProblemReopened: function(/* boolean */ flag){
				this.problemReopened = flag;
			},
			getProblemReopened: function(){
				return this.problemReopened;
			}
		};

		/*
		 add subclasses with model accessors

		 TODO:	Move associated functions themselves to this
		 section.
		 */

		// Methods common to both student and given.
		// These will be mixed into both obj.given and obj.student
		var both = {
			isNode: function(/*string*/ id){
				return array.some(this.getNodes(), function(node){
					return node.ID === id;
				});
			},
			isInput: function(/*string*/ mainNodeID, /*string*/ inputID){
				// Summary: returns true if the node identified by inputID is an 
				//		input into the mainNodeID 
				var main = this.getNode(mainNodeID);
				return main && array.some(main.inputs, function(input){
					return array.some(input, function(link){
						return link.ID == inputID;
					});
				});
			},
			getNode: function(/*string*/ id){
				// This is not very efficient:	should probably have separate
				// method for each sub-class and construct a hash table.
				var nodes = this.getNodes();
				var l = nodes.length;
				for(var i = 0; i < l; i++){
					if(nodes[i].ID == id)
						return nodes[i];
				}
				console.warn("No matching node for '" + id + "'");
				// console.trace();
				return null;
			},
			getType: function(/*string*/ id){
				var node = this.getNode(id);
				return node && node.type;
			},
			getInitial: function(/*string*/ id){
				var node = this.getNode(id);
				return node && node.initial;
			},
			getUnits: function(/*string*/ id){
				return this.getNode(id).units;
			},
			getExplanation: function(/*string*/ id){
				var node = this.getNode(id);
				return (typeof node.explanation==="undefined")?"":(node && node.explanation);
			},
			getEachNodeUnitbyID: function(){
				//summary: returns key/value pair of node-id/unit
				var unitList = {};
				array.forEach(this.getNodes(), function(node){
					unitList[node.ID] = node.units;
				});
				return unitList;
			},
			getEquation: function(/*string*/ id){
				var node = this.getNode(id);
				return node && node.equation;
			},
			getInputs: function(/*string*/ id){
				// Summary: return an array containing the input ids for a node.
				var ret = this.getNode(id);
				return ret && ret.inputs;
			},
			getOutputs: function(/*string*/ id){
				// Summary: return an array containing the output ids for a node.
				var outputs = [];
				array.forEach(this.getNodes(), function(node){
					if(array.some(node.inputs, function(input){
						return input.ID == id;
					})){
						outputs.push(node.ID);
					}
				});
				return outputs;
			},
			getPosition: function(/*string*/ id){
				// Summary: return current position of the node.
				return this.getNode(id).position;
			},
			getSchemas: function(){
				return obj.model.task.schemas;
			},
			getImageMarks : function(/**string */ nodeId){
				var node = obj.given.getNode(nodeId);
				
				if(!node) return null;
				if(!node["imageMarks"]) return [];
				else return node["imageMarks"];
			},
           
			getExecutionValue: function(/* string */ id, /* number */ index){
				var currentItr = obj.student.getIteration();
				var maxItr = obj.getExecutionIterations();
				var node = this.getNode(id);
				var val = null;
				if(index != undefined && node.executionValue && node.executionValue.length > index){
					val = node.executionValue[index];
				} else if(node.executionValue && node.executionValue.length <= maxItr){
					val = node.executionValue[(currentItr >= maxItr)? maxItr - 1: currentItr];
				}

				return val;
            },
			getExecutionValues: function(/* string */ id){
				var node = this.getNode(id);

				return node && node.executionValue;
			},

			getWaveformValue: function( /* string */ id){
				/* returns waveform string for given node id*/
				var node = this.getNode(id);
				return node && node.waveformValue;
			},

			setExecutionValues: function(/* string */ id, /* array */ values){
				this.getNode(id).executionValue = values;
			},
            getAllExecutionValues: function(){
                var nodes = obj.given.getNodes();
                var coll = new Array();
                var studentItr=obj.student.getIteration();
                array.forEach(nodes,function(node){
                    if((obj.given.getGenus(node.ID)!== "extra") || (obj.given.getGenus(node.ID)!== "irrelevant") )
                        var insertVal = obj.given.getExecutionValue(node.ID,studentItr);
                    if(insertVal)
                        coll.push(parseFloat(insertVal));
                    if(obj.given.getType(node.ID)=== "parameter" && (obj.given.getGenus(node.ID)!== "extra")&&(obj.given.getGenus(node.ID)!== "irrelevant") )
                        var parVal = obj.given.getInitial(node.ID);
                    if(parVal)
                        coll.push(parseFloat(parVal));
                });
                return coll.sort(function(a,b){
                    return a - b;
                });
            },
			setSchemas: function(/* object */ schemas){
				obj.model.task.schemas = schemas;
			},
			setInputs: function(/*array*/ inputs, /*string*/ inputInto){
				// Silently filter out any inputs that are not defined.
				// inputs is an array of objects.
				var node = this.getNode(inputInto);
				if(node){
					node.inputs = array.filter(inputs, function(input){
						return this.isNode(input.ID);
					}, this);
				}
			},
			setType: function(/*string*/ id, /*string*/ type){
				var ret = this.getNode(id);
				if(ret)
					ret.type = type;
			},
			setPosition: function(/*string*/ id, /*object*/ positionObject){
				// Summary: sets the "X" and "Y" values of a node's position
				this.getNode(id).position = positionObject;
			},

			setWaveformValue: function(/* string */ id , /* string */ value){
				/* sets passed waveform string value for node id*/
				this.getNode(id).waveformValue = value;
			},

			setImageMarks : function(/**string */nodeId, marks){
				var node = obj.given.getNode(nodeId);
				if(!node) return null;
				
				node["imageMarks"] = marks;
				console.log("Marks added to the model", marks);
			},
			addInput: function(/*string*/ input, /*string*/ inputInto){
				console.error("Deprecated.	Use setInputs() instead.");
			},
			deleteNode: function(/*string*/ id){
				// Summary: Removes inputs and equations that refer to a given node
				//		and then deletes the node. When deleting a node it searches 
				//		for other nodes that have the node being deleted as an input
				//		and removes the inputs and re-enables the equation box.
				var index;
				var nodes = this.getNodes();
				for(var i = 0; i < nodes.length; i++){
					var found = false;
					if(nodes[i].ID === id)
						index = i;
					array.forEach(nodes[i].inputs, function(input){
						if(input.ID === id){
							found = true;
							return;
						}
					});
					if(found){
						nodes[i].inputs = [];
						nodes[i].equation = "";
						nodes[i].status.equation = {
							"disabled": false
						};
					}
				}
				nodes.splice(index, 1);
			},
			setTweakDirection : function(/*string*/ id, /* string*/ direction){
				this.getNode(id).tweakDirection = direction;
			},
			getTweakDirection: function(/*string*/ id){
				return (typeof this.getNode(id).tweakDirection!== "undefined") ?  this.getNode(id).tweakDirection:"";
			},
			validateTweakDirections: function(){
				var nodes = this.getNodes();
				var flag = array.every(nodes, function(node){
					return (!this.isNodeRequired(node.ID) || (node.tweakDirection && node.tweakDirection != ""));
				}, this);

				return flag ? true : false;
			},
			validateExecutionValues: function(){
				var nodes = this.getNodes();
				var flag = array.every(nodes, function(node){
					return (!this.isNodeRequired(node.ID) || (node.executionValue && node.executionValue != ""));
				}, this);
			}
		};

		obj.given = lang.mixin({
			addNode: function(options){
				// Summary: builds a new node and returns the node's unique id
				//			Can optionally add initial values to node.
				obj._updateNextXYPosition();
				var newNode = lang.mixin({
					ID: "id" + obj._ID++,
					inputs: [],
					position: {x: obj.x, y: obj.y},
					attemptCount: {
						description: 0,
						type: 0,
						initial: 0,
						units: 0,
						equation: 0,
						tweakedDirection: 0,
						executionValue: 0,
						waveformValue: null,
						assistanceScore: 0
					},
					status: {},
					authorStatus: {},
				}, options || {});
				obj.model.task.givenModelNodes.push(newNode);
				return newNode.ID;
			},
            createSchema: function(/* string */ schemaID){
				var newSchema = {
					ID: schemaID||"schema"+obj._SID++,
					schemaClass: "",
					name: "",
					competence: {
						errors: 0,
						total: 0,
						attempts: 0,
						correctScore: 0,
						timeSpent: 0,
						values:{}
					},
					nodes: "",
					rates: {},
					difficulty: {
						isolation: 1,
						cues: 1,
						phrases: 1
					}
				}

				return newSchema;
			},
			/*merges imported model and returns ids of merged nodes*/
			mergeNodes: function(model){
				var ids = [];  //holds new ids of author nodes
				var sids = []; //holds new ids of student nodes
				var shift = obj._ID-1;
				var idMap = {};

				var nodes = model.task.givenModelNodes;

				var currentGivenNodes = obj.model.task.givenModelNodes;
				var isNewProblem = false;
				if(currentGivenNodes.length == 0){
					obj.model.task.givenModelNodes = nodes;
					obj.model.task.schemas = model.task.schemas;
					isNewProblem = true;
				}

				var currentSNodes = obj.model.task.studentModelNodes;
				if(currentSNodes.length == 0 && isNewProblem){
					obj.model.task.studentModelNodes = model.task.studentModelNodes;
				}

				if(isNewProblem){
					var index = 0;
					array.forEach(nodes, function(node){
						ids[index] = node.ID;
						index++;
					});

					return ids;
				}

				//copy author nodes
				array.forEach(nodes,function(node){
					obj._updateNextXYPosition();
					node.position = {x: obj.x, y: obj.y};
					var newID = parseInt(node.ID.replace("id", "")) + shift;
					var nID = "id" + newID; //replace old id with new ID
					idMap[node.ID]=nID; //store old ID vs new ID
					node.ID =nID;

					//check for duplicates(if node with given name already present):
					//if true, calculate the properIds for the duplicate nodes
					if(obj.active.getNodeIDByName(node.name)){
						var name_duplicate_count = 1;
						//iterate through all the nodes and evalute the duplicate count value
						while(obj.active.getNodeIDByName(node.name + "_duplicate_" + name_duplicate_count)){
							name_duplicate_count++;
						}
						node.name=node.name+"_duplicate_" + name_duplicate_count;
					}
					if(obj.active.getNodeIDByDescription(node.description)){
						var desc_duplicate_count = 1;
						//iterate through all the nodes and evalute the duplicate count value
						while(obj.active.getNodeIDByDescription(node.description + "_duplicate_" + desc_duplicate_count)){
							desc_duplicate_count++;
						}
						node.description=node.description + "_duplicate_" + desc_duplicate_count;
					}
					ids.push(node.ID);

					/*trick to update equations with new ids */
					if(node.equation){
						var equation = node.equation;
						//console.log("sachin shift value "+ shift);
						var nEquation=equation.replace(/(id\d+)+/g, function(match, str) {
							var number = str.replace("id", "");
							return "id"+(parseInt(number)+shift);
						});
						//also update inputs for graph generation
						for(i=0;i<node.inputs.length;i++){
							node.inputs[i].ID=node.inputs[i].ID.replace(/\d+$/, function(n){ return parseInt(n)+shift });//shift = total nodes in old model

						}

						node.equation=nEquation;
					}
					obj._ID=obj._ID+1; //for next coming node
					obj.model.task.givenModelNodes.push(node);
				},this);

				//copy student nodes
				var snodes = model.task.studentModelNodes;
				var sIDMap = {};
				array.forEach(snodes,function(node){
					obj._updateNextXYPosition(true);
					node.position = {x: obj.x, y: obj.y};
					var newID = parseInt(node.ID.replace("id", "")) + shift;
					var nID = "id" + newID; //replace old id with new ID
					sIDMap[node.ID]=nID; //store old vs new StudentIDs
					node.ID =nID;
					//node.name=node.name+obj._ID;
					//node.description=node.description+obj._ID;
					node.descriptionID=idMap[node.descriptionID]; //new DescriptionID of Node
					sids.push(node.ID);
					obj._ID=obj._ID+1; //for next coming node
					obj.model.task.studentModelNodes.push(node);
				},this);

				//iterate over new student IDs to update equations and inputs in terms of new student IDs using sIDMap
				array.forEach(sids,function(id){
					var snode = obj.student.getNode(id);
					if(snode.equation){
						var inputs = [];
						var isExpressionValid = true;
						var equation = snode.equation;
						array.forEach(snode.inputs, lang.hitch(this, function(input){
							var studentNodeID = sIDMap[input.ID];
							if(studentNodeID){
								inputs.push({ "ID": studentNodeID});
								var regexp = "(" +input.ID +")([^0-9]?)";
								var re = new RegExp(regexp);
								equation = equation.replace(re, studentNodeID+"$2");
							}else{
								isExpressionValid = false;
							}
						}));
						if(isExpressionValid){
							snode.inputs=inputs;
							snode.equation=equation;
						}
					}
				},this);

				return ids;
			},
			getGenus: function(/*string*/ id){
				return this.getNode(id).genus;
			},
			getNodes: function(){
				return obj.model.task.givenModelNodes;
			},
			getName: function(/*string*/ id){
				// Summary: returns the name of a node matching the student model.
				//		If no match is found, then return null.
				var node = this.getNode(id);
				return node && node.name;
			},
			getNodeIDByName: function(/*string*/ name){
				// Summary: returns the id of a node matching the given name from the
				//			given or extra nodes.  If none is found, return null.
				var id;
				var gotIt = array.some(this.getNodes(), function(node){
					id = node.ID;
					return node.name === name;
				});
				return gotIt ? id : null;
			},
			getNodeIDByDescription: function(/*string*/ description){
				// Summary: returns the id of a node matching the given description from the
				//			given or extra nodes.  If none is found, return null.
				var id;
				var gotIt = array.some(this.getNodes(), function(node){
					id = node.ID;
					return node.description === description;
				});
				return gotIt ? id : null;
			},
			getDescriptions: function(){
				// Summary: returns an array of all descriptions with
				// name (label) and any associated node id (value).
				// Note that the description may be empty.
				// TO DO:  The list should be sorted.
				return array.map(this.getNodes(), function(node){
					return {label: node.description, value: node.ID};
				});
			},
			getDescription: function(/*string*/ id){
				return this.getNode(id).description;
			},
			getGivenID: function(/*string*/ id){
				return id;
			},
			getAttemptCount: function(/*string*/ id, /*string*/ part, /* boolean */ ignoreExecution){
				/*
				*	changes to handle execution value status and attempt count as an array.
				*	ignoreExecution if set to true will send the complete array as status/attemptCount 
				*	otherwise the status/attemptCount will be as per the current iteration only.
				*/
				if(ignoreExecution || part != "executionValue")
					return this.getNode(id).attemptCount[part];
				else{
					var node = this.getNode(id);
					var itr = obj.student.getIteration();
					return (node.attemptCount[part] && node.attemptCount[part][itr])?
					node.attemptCount[part][itr]:0;
				}
			},
			getStatus: function(/*string*/ id, /*string*/ part, /* boolean */ ignoreExecution){
				if(ignoreExecution || part != "executionValue")
					return this.getNode(id).status[part];
				else{
					return this.getNode(id).status[part]?
					this.getNode(id).status[part][obj.student.getIteration()]:undefined;
				}
			},

			getAuthorStatus: function(/*string*/ id, /*string*/ part){
				return this.getNode(id).authorStatus? this.getNode(id).authorStatus[part] : undefined ;
			},

			getParent: function(/*string*/ id){
				return this.getNode(id).parentNode;
			},
			getNodeTypeCount: function(){
				var nodes = this.getNodes();
				var param = 0, acc = 0, func=0;
				var nodeNumber = {};
				array.forEach(nodes, function(node){
					var id = node.ID;
					//console.log("from count type : "+id + " node "+ node);
					var genus = this.getGenus(id);
					if(!genus|| genus == "required" || genus == "allowed"){
						var type = this.getType(id)||"none";
						switch(type){
							case "accumulator":
								acc++;
								break;
							case "parameter":
								param++;
								break;
							case "function":
								func++;
								break;
							default:
								break;
						}
					}
				}, this);
				nodeNumber = {
					"accumulator": acc,
					"function": func,
					"parameter": param
				};

				return nodeNumber;
			},
			getSchema: function(/* string */ schemaID){
				var schemas = this.getSchemas();
				var l = schemas.length;
				for(var i = 0; i < l; i++){
					if(schemas[i].ID == schemaID){
						return schemas[i];
					}
				}

				return null;
			},
			saveSchema: function(schema){
				obj.model.task.schemas.push(schema);
			},
			setName: function(/*string*/ id, /*string*/ name){
				this.getNode(id).name = name.trim();
			},
			setDescription: function(/*string*/ id, /*string*/ description){
				this.getNode(id).description = description.trim();
			},
			setExplanation: function(/*string*/ id, /*string*/ content){
				this.getNode(id).explanation = content;
			},            
			setParent: function(/*string*/ id, /*bool*/ parent){
				this.getNode(id).parentNode = parent;
			},
			setGenus: function(/*string*/ id, /*string*/ genus){
				this.getNode(id).genus = genus;
			},
			setUnits: function(/*string*/ id, /*string*/ units){
				this.getNode(id).units = units;
			},
			setInitial: function(/*string*/ id, /*float*/ initial){
				this.getNode(id).initial = initial;
			},
			setEquation: function(/*string*/ id, /*string | object*/ equation){
				this.getNode(id).equation = equation;
			},
			setAttemptCount: function(/*string*/ id, /*string*/ part, /*string*/ count){
				if(part != "executionValue")
					this.getNode(id).attemptCount[part] = count;
				else{
					var node = this.getNode(id);
					if(node.attemptCount[part] == undefined){
						node.attemptCount[part] = [];
					}
					node.attemptCount[part][obj.student.getIteration()] = count;
				}
			},
			setSchemaDifficulty: function(/* string */ schemaID, /* string */ diffPart, /* binary */ value){
				var schema = this.getSchema(schemaID);
				var newDifficulty = {diffPart: value};
				this.model.task.schemas.difficulty.push(newDifficulty);
			},
			setSchemaNodes: function(/* string */ schemaID, /* array */ nodesID){
				var l = nodesID.length;
				index = 1;
				var nodeString = "";
				array.forEach(nodesID, function(ID){
					if(index == l){
						nodeString += ID;
					} else {
						nodeString += ID+", ";
					}
					index++;
				}, this);

				var schema = this.getSchema(schemaID);
				schema.nodes = nodeString;
			},
			setStatus: function(/*string*/ id, /*string*/ part, /*string*/ status){
				// Summary: tracks student progress (correct, incorrect) on a given node;
				if(part != "executionValue")
					this.getNode(id).status[part] = status;
				else{
					var node = this.getNode(id);
					if(!node.status.hasOwnProperty(part) || node.status[part] == undefined){
						node.status[part] = [];
					}
					node.status[part][obj.student.getIteration()] = status;
				}
			},

			setAuthorStatus: function(/*string*/ id, /*string*/ part, /*string*/ status){
				// Summary: function to set the status of node editor in author mode.
				if(!this.getNode(id).authorStatus){
					//backward compatibility
					this.getNode(id).authorStatus = {};
				}
				this.getNode(id).authorStatus[part] = status;
			},

            emptyWaveform: function(id){
                obj.model.task.wave = [];
            },
			isComplete: function(/*string*/ id){
				// Summary: Test whether a node is completely filled out, correct or not
				// Returns a boolean
				// id: the node id
				// unitsRequired:  whether units need to be specified.
				//
				// If genus indicates a solution node or an optional node,
				// then all the fields must be filled in.
				// If it is a non-solution node, then only some fields
				// must be included.  Here are the possibilities:
				//	 1.	 Just a description (needs name, too)
				//	 2.	 Just units
				//	 3.	 Optional quantity (needs name and description)
				var node = this.getNode(id);

				var unitsOptional = true;
				var initialEntered = node.type && node.type == "function" || node.initial != null;
				var toReturn = '';
				var equationEntered = node.type && node.type == "parameter" || node.equation;
				console.log("checking the node being studies",node,initialEntered,equationEntered);
				if(!node.genus || node.genus == "required" || node.genus == "allowed" || node.genus == "preferred"){
					toReturn = node.name && node.description &&
					node.type && (initialEntered || typeof initialEntered === "number") &&
					(unitsOptional || node.units) &&
					equationEntered;
				}else if(node.genus == "initialValue"){
					toReturn = node.genus && node.name && node.description;
				}else{
					toReturn = node.genus != "defaultSelect" && ((node.name && node.description) ||
					node.units);
				}
				if(toReturn) {
					return true;
				}
				else{
					return false;
				}
			},
			getPlotVariables: function(){
				var plotVariables = [];
				var nodes = this.getNodes();
				array.forEach(nodes, function(node){
					if((node.type == "accumulator" || node.type == "function") && (this.isNodeRequired(node.ID) || this.isNodeAllowed(node.ID))){
						plotVariables.push(node.ID);
					}
				}, this);

				return plotVariables;
			},
			isNodeRequired: function(id){
				var givenNode = this.getNode(id);
				if(!givenNode.genus || givenNode.genus == "" || givenNode.genus == "required"){
					return true;
				}
				return false;
			},
			isNodeAllowed: function(id){
				var givenNode = this.getNode(id);
				return (givenNode.genus == "allowed");
			},
            getRootNodes: function(){
                var rootNodes = [];
                var givenNodes = this.getNodes();                   
                array.forEach(givenNodes, function(node){
                    if(obj.isParentNode(node.ID) && this.isNodeRequired(node.ID)){
                        rootNodes.push(node);
                    }
                },this);
                return rootNodes;
            }
		}, both);

		obj.solution = lang.mixin({
			getNodes: function(){
				return array.filter(obj.model.task.givenModelNodes, function(node){
					return !node.genus || node.genus == "required";
				});
			},
			// This method is common with given but not student.
			getName: function(/*string*/ id){
				// Summary: returns the name of a node matching the student model.
				//		If no match is found, then return null.
				var node = this.getNode(id);
				return node && node.name;
			}
		}, both);

		obj.student = lang.mixin({
			addNode: function(options){
				// Summary: builds a new node in the student model and
				//			returns the node's ID.	Can optionally set
				//			properties.
				obj._updateNextXYPosition();
				var newNode = lang.mixin({
					ID: "id" + obj._ID++,
					inputs: [],
					position: {x: obj.x, y: obj.y},
					status: {}
				}, options || {});
				obj.model.task.studentModelNodes.push(newNode);
				return newNode.ID;
			},

            addSchemaTime: function(/* string */ id, /* number */ value){
				var givenID = this.getDescriptionID(id);

				if(givenID){
					var schemas = this.getSchemas();
					if(schemas){
						array.forEach(schemas, function(schema){
							if(schema.nodes.indexOf(givenID) >= 0){
								schema.competence.timeSpent += value;
							}
						}, this);
					}
				}

				return givenID;
			},
			addCompetenceValues: function(/* string */ type, /* number */ value){
				var newCompetence = {type: value};
				this.schemas.competence.values.push(newCompetence);

				return newCompetence;
			},
			getCorrectAnswer: function(/*string*/ studentID, /*string*/ nodePart){
				// Summary: returns the correct answer for a given part of a node;
				//		used by the pedagogical model
				if(nodePart === "description"){
					var returnValue = obj.getOptimalNode(studentID);
					console.log("Correct node: ", returnValue);
					return returnValue;
				}else if(nodePart === "executionValue"){
					var id = this.getDescriptionID(studentID);
					return obj.given.getNode(id).executionValue[this.getIteration()];
				}else{
					var id = this.getDescriptionID(studentID);
					var node = obj.given.getNode(id);
					return node[nodePart];
				}
			},
			getDescriptionID: function(id){
				// Summary: Return any matched given model id for student node.
				var node = this.getNode(id);
				return node && node.descriptionID;
			},
			getGivenID: function(id){
				return this.getDescriptionID(id);
			},
			getNodeIDFor: function(givenID){
				// Summary: returns the id of a student node having a matching descriptionID;
				//			return null if no match is found.
				var id;
				var gotIt = array.some(this.getNodes(), function(node){
					id = node.ID;
					return node.descriptionID == givenID;
				});
				return gotIt ? id : null;
			},
			getName: function(/*string*/ id){
				// Summary: returns the name of a node matching the student model.
				//		If no match is found, then return null.
				/*
				 Determine what student has selected for this node
				 and then look for matching node in given model
				 and extraDescriptions
				 */
				var node = this.getNode(id);
				return node && node.descriptionID
					&& obj.given.getName(node.descriptionID);
			},
			getNodes: function(){
				return obj.model.task.studentModelNodes;
			},
			getStudentNodesInSolution: function() {
				// Summary: Returns an array of nodes created by the student which are in the solution model (i.e.
				//          their description ids match the ids of nodes in the solution).
				var solutionNodeIDs = [];
				array.forEach(obj.solution.getNodes(),function(node){
					solutionNodeIDs.push(node.ID);
				});
				var nodesInBoth = [];
				array.forEach(this.getNodes(),function(node){
					if(array.indexOf(solutionNodeIDs,node.descriptionID) != -1){
						nodesInBoth.push(node);
					}
				});
				return nodesInBoth;
			},
			getAssistanceScore: function(/*string*/ id){
				// Summary: Returns a score based on the amount of errors/hints that
				//		a student receives, based on suggestions by Robert Hausmann;
				//		a score of 0 means that a student did not have any errors;
				var givenID = this.getDescriptionID(id);
				return obj.given.getAttemptCount(givenID, "assistanceScore");
			},
			getCorrectness: function(/*string*/ studentID){
				var node = this.getNode(studentID);
				var rank = {
					"incorrect": 3,
					"demo": 2,
					"correct": 1,
					"": 0
				};
				var bestStatus = "";
				var update = function(attr, sattr){
					// node.status always exists
					var nsa = node.status[attr];
					if(node[sattr || attr] !== null && nsa && nsa.status &&
						rank[nsa.status] > rank[bestStatus]){
						bestStatus = nsa.status;
					}
				};
				update("description", "descriptionID");
				update("type");
				update("initial");
				update("units");
				update("equation");
				var descriptionID = this.getDescriptionID(studentID);
				if(descriptionID && obj.given.getTweakDirection(descriptionID)){
					update("tweakDirection");
				}
				if(descriptionID && obj.given.getExecutionValues(descriptionID)){
					update("executionValue");
				}
				if(descriptionID && obj.given.getWaveformValue(descriptionID)){
					update("waveformValue");
				}
				return bestStatus;
			},

			matchesGivenSolutionAndCorrect: function() {
				// Summary: Returns True if (1) matchesGivenSolution is true and (2) if all nodes that are part of the
				// solution have correctness of "demo" or "correct"
				return obj.matchesGivenSolution() &&
					this.checkStudentNodeCorrectness();
			},
			getNodeIDByDescriptionID: function(/* string */ descriptionID){
				var id;
				var gotIt = array.some(this.getNodes(), function(node){
					id = node.ID;
					return node.descriptionID === descriptionID;
				});
				return gotIt ? id : null;
			},
			checkStudentNodeCorrectness: function(){
				return array.every(this.getStudentNodesInSolution(),
					function(studentNode){
						var correctness = this.getCorrectness(studentNode.ID);
						return correctness === "correct" || correctness === "demo";
					}, this);
			},
			checkStudentNodeCount: function(){
				return this.getNodes().length - obj.solution.getNodes().length;
			},
			getStatusDirectives: function(/*string*/ id){
				//Summary:	Return a list of directives (like PM does).
				//			to set up node editor.
				var status = this.getNode(id).status;
				var directives = [];
				for(var control in status){
					for(var attribute in status[control]){
						directives.push({
							id: control,
							attribute: attribute,
							value: status[control][attribute]
						});
					}
				}
				return directives;
			},

			setDescriptionID: function(/*string*/ id, /*string*/ descriptionID){
				this.getNode(id).descriptionID = descriptionID;
			},
			setInitial: function(/*string*/ id, /*float*/ initial){
				this.getNode(id).initial = initial;
			},
			setUnits: function(/*string*/ id, /*string*/ units){
				this.getNode(id).units = units;
			},
			setEquation: function(/*string*/ id, /*string | object*/ equation){
				this.getNode(id).equation = equation;
			},
			setStatus: function(/*string*/ id, /*string*/ control, /*object*/ options){
				//Summary: Update status for a particular control.
				//		   options may have attributes "status" and "disabled".
				var attributes = this.getNode(id).status[control];
				// When undefined, status[control] needs to be set explicitly.
				this.getNode(id).status[control] = lang.mixin(attributes, options);
				return attributes;
			},
			
			setAssistanceScore: function(/*string*/ id, /*string*/ score){
				// Summary: Sets a the amount of errors/hints that a student
				//		receives, based on suggestions by Robert Hausmann;
				//
				// Note: This is used by the PM when the student first gets the description correct
				// and also in con-author when we need to show error values to the students.
				var givenID = this.getDescriptionID(id);
				var node = obj.given.getNode(givenID);
				node.attemptCount.assistanceScore = score;
			},
			setExecutionValue: function(/* string */ id, /* number */ val, /* number */ index){
				var node = this.getNode(id);

				if(index){
					node.executionValue[index] = val;
				} else {
					var iteration = obj.student.getIteration();
					if(iteration < node.executionValue.length){
						node.executionValue[iteration] = val;
					}else {
						node.executionValue.push(val);
					}
				}
			},
			emptyExecutionValues: function(/* string */ id){
				var node = this.getNode(id);
				node.executionValue = [];
			},
			incrementAssistanceScore: function(/*string*/ id){
				// Summary: Incremements a score of the amount of errors/hints that
				//		a student receives, based on suggestions by Robert Hausmann;
				//
				// Note: This is used by the PM for all node parts except the description
				var givenID = this.getDescriptionID(id);
				var node = obj.given.getNode(givenID);
				node.attemptCount.assistanceScore = (node.attemptCount.assistanceScore || 0) + 1;
			},
			incrementSchemaErrors: function(/* string */ id, /* boolean */ isCorrect){
				var givenID = this.getDescriptionID(id);

				if(givenID){
					var schemas = this.getSchemas();
					if(schemas){
						array.forEach(schemas, function(schema){
							if(schema.nodes.indexOf(givenID) >= 0){
								schema.competences.total++;
								if(!isCorrect){
									schema.competences.errors++;
								}
							}
						}, this);
					}
				}

				return givenID;
			},
			isComplete: function(/*string*/ id){
				// Summary: Test whether a node is completely filled out, correct or not
				// Returns a boolean
				// id: the node id
				var maxItr=obj.getExecutionIterations();
				var node = this.getNode(id);
				// Some given models do not include units.
				var hasUnits = node.descriptionID && obj.given.getUnits(node.descriptionID);
				var initialEntered = node.type && node.type == "function" || node.initial != null;
				var hasTweaks = node.descriptionID && obj.given.getTweakDirection(node.descriptionID);
				var hasExecutionValue = node.descriptionID && obj.given.getExecutionValues(node.descriptionID);
				var executionIteration = (hasExecutionValue ? (node.type == "parameter" ? 0 : this.getIteration()) : 0); //execution iteration will always be 0 for parameters.
				var hasWaveformValue = (node && typeof obj.student.getWaveformValue(node.ID) !== "undefined");
				var equationEntered = node.type && node.type == "parameter" || node.equation;
                executionIteration= (executionIteration<maxItr-1)?executionIteration:maxItr-1;

				var toReturn = node.descriptionID && node.type &&
					initialEntered && (!hasUnits || node.units) &&
					equationEntered && (!hasTweaks || node.tweakDirection)
					&&(!hasWaveformValue || node.waveformValue !== null)
					&& (!hasExecutionValue || (node.executionValue && node.executionValue[executionIteration]));
				if(toReturn){
					return true;
				}
				else{
					return false;
				}
			},
			isNodeRequired: function(id){
				var descriptionID = this.getDescriptionID(id);
				return descriptionID || obj.given.isNodeRequired(descriptionID);
			},
			isNodeAllowed: function(id){
				var descriptionId = this.getDescriptionID(id);
				return descriptionID || obj.given.isNodeAllowed(descriptionID);
			},
			deleteStudentNodes: function(){
				obj.model.task.studentModelNodes = [];
			},
			incrementIteration: function(){
				obj.iteration++;
			},
			setIteration: function(/* number */ num){
				obj.iteration = num;
			},
			getIteration: function(){
				return obj.iteration;
			}
		}, both);

		// Execute the constructor
		obj.constructor.apply(obj, arguments);

		return obj;
	};
});
