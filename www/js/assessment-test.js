define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"./load-save",
	"./model",
	"./schemas-student"	
], function(lang, array, loadSave, model, schema){
	return declare(null, {
		constructor: function(p, s, t){
			this.problem = p;
			this.students = s;
			this.tag = t || "student";
			this.query = {
				p: this.problem,
				m: "AUTHOR",
				sm: "feedback",
				is: "algebraic",
				s: "assessment-test",
				c: "continue",
				u: this.tag,
				l: false
			}
		},
		
		initTesting: function(){
			this.startSession();
			var i = 1;
			var assessments = [];
			for(i; i <= this.students; i++){
				assessments[i] = [];
				array.forEach(this._nodes, function(node){
					if(("genus" in node) && (node.genus == "required" || node.genus == "")){
						
					}
				});
			}
		},

		startSession: function(){
			var this._session = new loadSave(this.query);
			var this._model = new model(this.query.m, this.query.p);
			var this._nodes = [];
			var this._schemas = [];
			this._session.loadProblem(query).then(function(solutionGraph){
				if(solutionGraph){
					this._model.loadModel(solutionGraph);
					this._nodes = this._model.given.getNodes();
					this._schemas = this._model.getSchemas();
				}
			});
		},

		requiredActions: function(node){
			var type = node.type;
			var actions = ["description", "type"];

			var unitsPresent = false;
			if(node.units != "")
				unitsPresent = true;

			switch(type){
				case "accumulator":
					actions.push("initial");
					unitsPresent ? actions.push("units") : ;
					actions.push("equation");
					break;
				case "parameter":
					actions.push("initial");
					unitsPresent ? actions.push("units") : ;
					break;
				case "function":
					unitsPreset ? actions.push("units") : ;
					actions.push("equation");
					break;
				case "default":
					break;
			}
			
			return actions;
		},
		
		performActions: function(node){
			var actions = this.requiredActions(node);
			var l = actions.length;

			for(var i = 0; i < l; i++){
				if(actions[i] == "description"){
					
				} else {

				}
			}
		},
		
		// this is the function which figures out the actual function behavior in our case.
		isActionCorrect: function(){
			return true;
		}
	});
});
