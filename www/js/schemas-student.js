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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
define([
	"dojo/_base/declare",
	"./assessment"
], function(declare, assessment){
	return declare(null, {
		time: [],
		errors: [],
		//_model: {},
		currentNodeTime: null,
		currentNodeErrors: null,

		constructor: function(/* object */ model, /* object */session){
			this.assess = new assessment(model, session);
		},

		/* three function below are the major times when user can be called. 
		** At node start, at node close and at every check of pedagogical module.
		** from here assessment functions are called with the schema object sent to them.
		** At node close this schema object is saved in the student session model and
		** also a log update is saved for competence value.
		*/
		// function called on closing of a node
		nodeClose: function(/* string */ nodeID){
			this.endTime();

			this.assess.updateSchema(this.currentNodeTime, this.currentNodeErrors);
			this.assess.dummy();
			this.assess.accuracy();
			this.assess.saveSchema(nodeID);

			this.resetNodeValues();
		},

		//function called on starting of a node
		nodeStart: function(/* string */ nodeID){
			this.currentNodeTime = this.addNodeTime(nodeID);
			this.currentNodeErrors = this.addNodeErrors(nodeID);

			this.startTime();
			//this.assess.setCorrectnessScore(nodeID, 0);
		},

		//function called at every pedagogical module check
		updateError: function(/* string */ nodeID, /* string */ nodePart, /* boolean */ isCorrect){
			if(isCorrect == "correct"){
				this.assess.updateScore(nodeID, nodePart);
			}

			if(isCorrect == "demo" || isCorrect == "incorrect"){
				this.currentNodeErrors.errors++;
			} 
			this.currentNodeErrors.total++;
		},

		startTime: function(/* string */ nodeID){
			this.currentNodeTime.start = new Date();
			this.currentNodeTime.end = null;
		},

		endTime: function(/* string */ nodeID){
			this.currentNodeTime.end = new Date();
			this.currentNodeTime.difference = this.currentNodeTime.end - this.currentNodeTime.start;
		},

		addNodeTime: function(nodeID){
			var newTime = this.getTime(nodeID);
			if(newTime == null){
				newTime = {
					node: nodeID,
					given: "",
					start: new Date(),
					end: null,
					difference: 0
				};

				this.time.push(newTime);
			}

			return newTime;
		},

		getAssessmentScore: function(type){
			return this.assess.getScore(type);
		},

		getSuccessFactor: function(){
			return this.assess.getSuccessFactor();
		},

		getSchemaSuccessFactor: function(){
			return this.assess.getSchemaSuccessFactor();
		},

		getTime: function(nodeID){
			var l = this.time.length;
			for(var i = 0; i < l; i++){
				if(this.time[i].node == nodeID){
					return this.time[i];
				}
			}

			return null;
		},

		getError: function(nodeID){
			var l = this.errors.length;
			for(var i = 0; i < l; i++){
				if(this.errors[i].node == nodeID){
					return this.errors[i];
				}
			}

			return null;
		},

		getErrorIndex: function(nodeID){
			var l = this.errors.length;
			for(var i = 0; i < l; i++){
				if(this.errors[i].node == nodeID){
					return i;
				}
			}

			return -1;
		},

		getTimeIndex: function(nodeID){
			var l = this.time.length;
			for(var i = 0; i < l; i++){
				if(this.time[i].node == nodeID){
					return i;
				}
			}

			return -1;
		},

		addNodeErrors: function(nodeID){
			var newErrors = this.getError(nodeID);
			if(newErrors == null){
				var newErrors = {
					node: nodeID, 
					given: "",
					errors: 0,
					total: 0
				};
				this.errors.push(newErrors);
			}

			return newErrors;
		},

		resetNodeValues: function(){
			var eIndex = this.getErrorIndex(this.currentNodeErrors.node);
			var tIndex = this.getTimeIndex(this.currentNodeTime.node);

			this.time[tIndex].difference = 0;
			this.time[tIndex].end = 0;
			this.errors[eIndex].errors = 0;
			this.errors[eIndex].total = 0;

			this.currentNodeTime = null;
			this.currentNodeErrors = null;
		}
	});
});
