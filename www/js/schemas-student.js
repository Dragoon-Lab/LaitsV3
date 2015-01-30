define([
	"dojo/_base/declare", "./schemas-load-save"
], function(declare, schemas){
	return declare(schemas, {
		//time: {},
		//errors: {},
		//_schemas: {},
		//_model: {},
		currentNodeTime: null,
		currentNodeErrors: null,

		constructor: function(/* object */ model){
			//this._model = model;
			//this._schemas = this._model.student.getSchemas();
			this.assess = new assessment(model);
			//this._init();
		},

		/*_init: function(){
			var nodes = this._model.given.getNodes();
			array.forEach(nodes, function(node){
				if(!nodes.genus){
					this.time.push({node.ID: {
						"startTime": "",
						"endTime": "",
						"diff": "",
						}
					});
				}
			}, this);
		},*/

		/* three function below are the major times when user can be called. 
		** At node start, at node close and at every check of pedagogical module.
		** from here assessment functions are called with the schema object sent to them.
		** At node close this schema object is saved in the student session model and
		** also a log update is saved for competence value.
		*/
		// function called on closing of a node
		nodeClose: function(/* string */ nodeID){
			this.endTime();
			this.currentNodeTime = null;
			this.currentNodeErrors = null;

			this.assess.updateSchema(this.currentNodeTime, this.currentNodeErrors);
			this.assess.dummy();
			this.access.saveSchema();
		},

		//function called on starting of a node
		nodeStart: function(/* string */ nodeID){
			this.currentNodeTime = this.getTime(nodeID) || this.addNodeTime(nodeID);
			this.currentNodeErrors = this.getErrors(nodeID) || this.addErrors(nodeID);

			this.startTime();
		},

		//function called at every pedagogical module check
		updateError: function(/* string */ nodePart, /* boolean */ isCorrect){
			if(!isCorrect){
				this.currentNodeError.errors++;
			}
			this.currentNodeError.total++;
		},

		startTime: function(/* string */ nodeID){
			this.currentNodeTime.start = new Date();
			this.currentNodeTime.end = null;
		},

		endTime: function(/* string */ nodeID){
			this.currentTime.end = new Date();
			this.currentTime.difference = this.currentNodeTime.end - this.currentNodeTime.start;
		},

		addNodeTime: function(nodeID){
			var givenID = this._model.student.getDescriptionID(nodeID);
			var newTime = {
				node: givenID,
				start: new Date(),
				end: null,
				difference: 0,
			};
			//this.time.push(newTime);

			return newTime;
		},

		/*getTime: function(nodeID){
			var l = this.time.length;
			for(var i = 0; i < l; i++){
				if(this.time[i].node == nodeID){
					return this.time[i];
				}
			}

			return null;
		},

		getError: function(nodeID){
			var givenID = this._model.student.getDescriptionID(nodeID);
			var l = this.errors.length;
			for(var i = 0; i < l; i++){
				if(this.errors[i].node == givenID){
					return this.errors[i];
				}
			}

			return null;
		},*/

		addNodeErrors: function(nodeID){
			var givenID = this._model.student.getDescriptionID(nodeID);
			var newErrors = {
				node: givenID,
				errors: 0,
				total: 0
			};
			//this.errors.push(newErrors);

			return newErrors;
		}
	});
});
