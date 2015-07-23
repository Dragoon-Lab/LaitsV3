define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"./RenderGraph"
], function(declare, array, Graph){
	return declare(null, {
		//going forward we can use this file to handle model changes for all the activities.
		//call the functions from main as needed after checking the parameters for activity configuration.
		//constuctor sets the variables we might need to change model values.
		constructor: function(model, mode, session){
			this._model = model;
			this._mode = mode;
			this._session = session;
			//this._activityConfig = activity_parameters;
		},
		
		//this sets the tweak direction for all the nodes in the model.
		//Didnt put this in model.js as it would cause double sided dependency in model on rest of the dragoon code.
		//Model is data object and this needs rendergraph to calculate the values for all the nodes.
		calculateTweakDirections: function(){
			if(this._model.given.validateTweakDirections()){
				return null;
			}

			var factor = 0.1;
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
				var flag = (s1Values[0] <= s2Values[0]) ? "check" : "Decrease";
				flag = (flag == "check" && s1Values[0] < s2Values[0])? "Increase" : "Stays-Same";
				
				array.forEach(s1Values, function(value, j){
					if(flag != "Unknown" && ((flag == "Increase" && value >= s2Values[j]) || 
					(flag == "Decrease" && value <= s2Values[j]) || 
					(flag == "Stays-Same" && value != s2Values[j]))){
						flag = "Unknown";
					}
				}, this);

				this._model.given.setTweakDirection(id, flag);
			}, this);

			this._model.given.setInitial(tweakedNode, value);
		},
		//this function copies the nodes from given Model and copies them to student node.
		initializeStudentModel: function(/* boolean */ setTweakDirection){
			var nodeStore = [];

			array.forEach(this._model.given.getNodes(), function (givenNode) {
				if(this._model.given.checkNodeMandatory(givenNode.ID)){
					var newNode = this._model.student.addNode();
					nodeStore[givenNode.ID] = newNode;
				}
			}, this);
			array.forEach(this._model.given.getNodes(), function (givenNode) {
				var newNodeID = nodeStore[givenNode.ID];
				if(newNodeID){
					this._model.student.setDescriptionID(newNodeID, givenNode.ID);
					this._model.student.setInitial(newNodeID, givenNode.initial);
					this._model.student.setUnits(newNodeID, givenNode.units);
					this._model.student.setType(newNodeID, givenNode.type);
					if(setTweakDirection){
						this.setStudentTweakDirection(givenNode.ID, newNodeID);
					}
					if (givenNode.equation) {
						var inputs = [];
						var isExpressionValid = true;
						var equation = givenNode.equation;
						array.forEach(givenNode.inputs, function (input) {
							var studentNodeID = nodeStore[input.ID];
							if (studentNodeID) {
								inputs.push({"ID": studentNodeID});
								var regexp = "(" + input.ID + ")([^0-9]?)";
								var re = new RegExp(regexp);
								equation = equation.replace(re, studentNodeID + "$2");
							} else {
								isExpressionValid = false;
							}
						}, this);
						if (isExpressionValid) {
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

					//Set default status to correct for all the fields
					this._model.student.setStatus(newNodeID, "description", {"disabled": true, "status": "correct"});
					this._model.student.setStatus(newNodeID, "type", {"disabled": true, "status": "correct"});
					if (typeof givenNode.units !== "undefined") {
						this._model.student.setStatus(newNodeID, "units", {"disabled": true, "status": "correct"});
					}
					if (givenNode.type === "parameter" || givenNode.type === "accumulator") {
						this._model.student.setStatus(newNodeID, "initial", {"disabled": true, "status": "correct"});
					}
				}
			}, this);
			console.log("final Model is", this._model);
		},

		setStudentTweakDirection: function(givenID, studentID){
			if(givenID == this._model.getInitialTweakedNode()) {
				this._model.student.setTweakDirection(studentID, this._model.getInitialTweakDirection());
			} else if(this._model.given.getType(givenID) == "parameter"){
				this._model.student.setTweakDirection(studentID, "Stays-Same");
			} else {
				this._model.student.setTweakDirection(studentID, "");
			}
		}
	});	
});
