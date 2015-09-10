define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"./RenderGraph"
], function(declare, array, lang, Graph){
	return declare(null, {
		//going forward we can use this file to handle model changes for all the activities.
		//call the functions from main as needed after checking the parameters for activity configuration.
		//constuctor sets the variables we might need to change model values.
		constructor: function(model, mode, session, activity_parameters){
			this._model = model;
			this._mode = mode;
			this._session = session;
			this._activityConfig = activity_parameters;
		},

		//this sets the tweak direction for all the nodes in the model.
		//Didnt put this in model.js as it would cause double sided dependency in model on rest of the dragoon code.
		//Model is data object and this needs rendergraph to calculate the values for all the nodes.
		calculateTweakDirections: function(){
			var factor = 0.4;
			var pv = this._model.given.getPlotVariables();
			var g = new Graph(this._model, this._mode, this._session, "table");
			var s1 = g.findSolution(false, pv);

			var tweakedNode = this._model.getInitialTweakedNode();
			var tweakDirection = this._model.getInitialTweakDirection();

			var node = this._model.given.getNode(tweakedNode);
			var value = this._model.given.getInitial(tweakedNode);
			var changedValue;
			switch(tweakDirection){
				case "Increase":
					changedValue = node.initial*(1 + factor);
					break;
				case "Decrease":
					changedValue = node.initial*(1 - factor);
					break;
				default:
					break;
			}

			this._model.given.setInitial(tweakedNode, changedValue);

			g = new Graph(this._model, this._mode, this._session, "table");
			var s2 = g.findSolution(false, pv);
			console.log("original model", s1.plotValues);
			console.log("new model ", s2.plotValues)

			array.forEach(pv, function(id, index){
				var s1Values = s1.plotValues[index];
				var s2Values = s2.plotValues[index];

				//removing first index value for accumulators as that is the initial value for them which will stay same
				var type = this._model.given.getType(id);
				if(type == "accumulator"){
					s1Values.splice(0, 1);
					s2Values.splice(0, 1);
				}

				//setting initial value for flag
			//	var flag = (s1Values[0] <= s2Values[0]) ? "check" : "Decrease";
			//	flag = (flag == "check" && s1Values[0] < s2Values[0])? "Increase" : "Stays-Same";
				if (s1Values[0] < s2Values[0]) {
					flag = "Increase";
				} else if (s1Values[0] > s2Values[0]) {
					flag = "Decrease";
				} else if (s1Values[0] == s2Values[0]) {
					flag = "Stays-Same";
				}

				array.forEach(s1Values, function(value, j){
					if(flag != "Unknown" && ((flag == "Increase" && value > s2Values[j]) ||
					(flag == "Decrease" && value < s2Values[j]) ||
					(flag == "Stays-Same" && value != s2Values[j]))){
						flag = "Unknown";
					}
				}, this);

				this._model.given.setTweakDirection(id, flag);
			}, this);

			this._model.given.setInitial(tweakedNode, value);
			//setting direction for rest of the parameters as stays same
			var givenNodes = this._model.given.getNodes();
			array.forEach(givenNodes, function(givenNode){
				if (givenNode.ID == node.ID) {
					this._model.given.setTweakDirection(givenNode.ID, tweakDirection);
				} else if(givenNode.type == "parameter"){
					this._model.given.setTweakDirection(givenNode.ID, "Stays-Same");
				}
			}, this);
		},
		//this function copies the nodes from given Model and copies them to student node.
		initializeStudentModel: function(/* array */ fields){
			//re initialize the nodes in case there are some nodes from the start of the problem
			if(this._model.student.getNodes().length != 0){
				this._model.student.deleteStudentNodes();
			}

			array.forEach(this._model.given.getNodes(), function (givenNode) {
				if(this._model.given.isNodeRequired(givenNode.ID)){
					var newNode = this.addStudentNode(givenNode.ID);
				}
			}, this);

			array.forEach(this._model.student.getNodes(), function(studentNode){
				if(studentNode.descriptionID){
					this.copyGivenNode(studentNode.descriptionID, fields);
				}
			}, this);
			console.log("final Model is", this._model);
		},

		copyGivenNode: function(/* string */ givenID, /* array */ fields){
			var givenNode = this._model.given.getNode(givenID);
			var newNodeID = this._model.student.getNodeIDFor(givenID) || this.addStudentNode(givenID);

			var nodeStore = [];
			if(givenNode && givenNode.equation){
				var studentNode = this._model.student.getNodes();
				array.forEach(studentNode, function(n){
					nodeStore[n.descriptionID] = n.ID;
				}, this);
			}
			if(this._activityConfig.get("resetAssistanceScore")){
				var type = this._model.given.getType(givenID);
				if(type != "parameter") {
					this._model.student.setAssistanceScore(newNodeID , 0);
				}
			}
			if(givenNode && newNodeID){
				//set default values and their status.
				if(fields && fields.indexOf("initial") >= 0){
					this._model.student.setInitial(newNodeID, givenNode.initial);
					if (givenNode.type === "parameter" || givenNode.type === "accumulator") {
						this._model.student.setStatus(newNodeID, "initial", {"disabled": true, "status": "correct"});
					}
				}

				if(fields && fields.indexOf("units") >= 0){
					this._model.student.setUnits(newNodeID, givenNode.units);
					if (typeof givenNode.units !== "undefined") {
						this._model.student.setStatus(newNodeID, "units", {"disabled": true, "status": "correct"});
					}
				}

				if(fields && fields.indexOf("type") >= 0){
					this._model.student.setType(newNodeID, givenNode.type);
					this._model.student.setStatus(newNodeID, "type", {"disabled": true, "status": "correct"});
				}

				if(fields && fields.indexOf("tweak") >= 0){
					//this.setStudentTweakDirection(givenNode.ID, newNodeID);
					this._model.student.setTweakDirection(newNodeID, givenNode.tweakDirection);
				}

				if(fields && fields.indexOf("execution") >= 0){
					this._model.student.setExecutionValues(newNodeID, givenNode.executionValue);
				}

				if (fields && fields.indexOf("equation") && nodeStore && givenNode.equation) {
					var inputs = [];
					var isExpressionValid = true;
					var equation = givenNode.equation;
					var midStore = [];
					var i=1;
					array.forEach(givenNode.inputs, function (input) {
						var studentNodeID = nodeStore[input.ID];
						if (studentNodeID) {
							inputs.push({"ID": studentNodeID});
							var regexp = "(" + input.ID + ")([^0-9]?)";
							var re = new RegExp(regexp);
							midStore[i] = studentNodeID;
							equation = equation.replace(re, "ms"+i+ "$2");
						} else {
							isExpressionValid = false;
						}
						i++;
					}, this);

					if (isExpressionValid) {
						for(var j=1;j<=midStore.length;j++){
							equation = equation.replace("ms"+j,midStore[j]);
						}
						this._model.student.setInputs(inputs, newNodeID);
						this._model.student.setEquation(newNodeID, equation);
						this._model.student.setStatus(newNodeID, "equation", {
							"disabled": true,
							"status": "correct"
						});
					} else {
						this._model.student.setInputs([], newNodeID);
						this._model.student.setEquation(newNodeID, "");
						this._model.student.setStatus(newNodeID, "equation", {
							"disabled": false,
							"status": "incorrect"
						});
					}
				}
				this._model.student.setPosition(newNodeID, givenNode.position);
			}

			return newNodeID;
		},

		addStudentNode: function(givenID){
			var newNodeID = this._model.student.addNode();

			if(newNodeID){
				this._model.student.setDescriptionID(newNodeID, givenID);
				this._model.student.setStatus(newNodeID, "description", {"disabled": true, "status": "correct"});
			}

			return newNodeID;
		},
		/*
		This function first set the iteration number and then calculate the
		execution values for each node for each iteration.
		*/
		calculateExecutionValues: function(){
			// Setting the iteration number
			var iterations = this._model.getExecutionIterations() || this.calculateExecutionIterations(); 

			// Calculating the he execution values for each node
			var pv = this._model.given.getPlotVariables();
			var g = new Graph(this._model, this._mode, this._session, "table");
			var s1 = g.findSolution(false, pv);
			var nodes = this._model.given.getNodes();

			if(nodes){
				array.forEach(nodes, function(node){
					if(this._model.given.isNodeRequired(node.ID)){
						var index = pv.indexOf(node.ID);
						if(node.type != "parameter"){
							var arr = []
							for(var i = 0; i < iterations; i++){
								var j = i;
								if(node.type == "accumulator"){
									j = i+1;
								}
								arr.push(s1.plotValues[index][j].toPrecision(3));
							}
							this._model.given.setExecutionValues(node.ID, arr);
							console.log("execution values for node "+node.ID+" are:",arr);
						} else 
							this._model.given.setExecutionValues(node.ID, [node.initial]);
					}
				}, this);

			}
		},
		/*
		This function calculates the maximum iteration number in respect to the number of nodes
		*/
		calculateExecutionIterations: function(){
			var nodeTypeCounts = this._model.given.getNodeTypeCount();

			var iterations = ((nodeTypeCounts["accumulator"]+nodeTypeCounts["function"]) < 4) ? 3:2;
			this._model.setExecutionIterations(iterations);
			return iterations;
		},

		initializeStudentExecutionValue: function(){
			var nodes = this._model.student.getNodes();

			if(nodes){
				array.forEach(nodes, function(node){
					if(node.type == "parameter"){
						this._model.student.setExecutionValues(node.ID, this._model.given.getExecutionValues(node.descriptionID));
						//this._model.student.setStatus(node.ID, {});
						this._model.student.setAssistanceScore(node.ID, 1);
					} else {
						this._model.student.setExecutionValues(node.ID, []);
					}
				}, this);
			}
		},

		initializeStudentTweakDirection: function(){
			var nodes = this._model.student.getNodes();

			array.forEach(nodes, function(node){
				this.setStudentTweakDirection(node.descriptionID, node.ID);
			}, this);
		},

		setExecutionIteration: function(){
			var nodes = this._model.student.getNodes();
			var itr = 100; // arbitrary high number of iterations.
			var flag = false;

			if(nodes){
				array.forEach(nodes, function(node){
					if(nodes.executionValue && nodes.executionValue.length < itr){
						itr = nodes.executionValue.length;
						flag = true;
					}
				});
			}

			if(flag){
				this._model.student.setIteration(itr);
			}
		},

		setStudentTweakDirection: function(givenID, studentID){
			if(givenID == this._model.getInitialTweakedNode()) {
				this._model.student.setTweakDirection(studentID, this._model.getInitialTweakDirection());
				this._model.student.setAssistanceScore(studentID, 1);
			} else if(this._model.given.getType(givenID) == "parameter"){
				this._model.student.setTweakDirection(studentID, "Stays-Same");
				this._model.student.setAssistanceScore(studentID, 1);
			} else {
				this._model.student.setTweakDirection(studentID, "");
			}
		}
	});
});

