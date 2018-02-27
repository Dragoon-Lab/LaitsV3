/* global define */
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
	"dojo/_base/lang"
], function(lang){

	return function() {
		var activity_params = {
			construction: {
				AUTHOR:{
					allowCreateNode:true,
					allowGraph:true,
					allowTable:true,
					allowCreateSchema:true,
					allowProblemTimes:true,
					allowSaveAs:false,
					allowMerge:true,
					allowPreview:true,
					allowPrettify:true,
					allowHelp: true,
					allowHistory : true,
					allowDeleteNode: true,
					allowEditNode: true,

					showHints: true,
					showFeedback: true,
					showEquationAutoComplete: true,

					enable:[
					],

					allowSliders: true,

					promptSaveAs:false,
					allowZoom: true,
					allowAssignWaveFormButton: true,
					showWaveformEditor : true
				},

				STUDENT:{
					allowCreateNode:true,
					allowGraph:true,
					allowTable:true,
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,
					allowDeleteNode: true,
					allowEditNode: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					showEquationAutoComplete: true,
					allowZoom: true,
					enable:[
					],

					allowSliders: true,
					properties: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],
					plotAuthorSolution:true,
					showNodeEditorTour: false,
					showNodeBorderTutorial: true
				},

				COACHED:{
					allowCreateNode:false,
					allowGraph:true,
					allowTable:true,
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,
					allowDeleteNode: false,
					allowEditNode: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					showEquationAutoComplete: true,
					targetNodeStrategy:true,
					allowZoom: true,

					enable:[
					],
					allowSliders: true,
					properties: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],
					plotAuthorSolution:true,
					showNodeEditorTour: true,
					showNodeBorderTutorial: true
				},

				TEST:{
					allowCreateNode:true,
					allowGraph:true,
					allowTable:true,
					allowPrettify:true,
					allowHelp: true,

					allowDeleteNode: true,
					allowEditNode: true,
					showEquationAutoComplete: true,
					showDoneMessage: true,
					allowZoom: true,
					enable:[
					],

					allowSliders: true,
					properties: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],
					plotAuthorSolution:true
				},

				EDITOR:{
					allowCreateNode:true,
					allowGraph:true,
					allowTable:true,
					allowPrettify:true,
					allowHelp: true,
					allowHints:true,
					allowDeleteNode: true,
					allowEditNode: true,
					showEquationAutoComplete: true,
					allowZoom: true,
					enable:[
					],
					properties: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					allowSliders: true
				},
				ROAUTHOR:{
					allowCreateNode:false,
					allowGraph:true,
					allowTable:true,
					allowCreateSchema:true,
					allowProblemTimes:true,
					allowMerge: false,
					allowSaveAs:true,
					allowPreview:true,
					allowPrettify: false,
					allowHelp: true,
					allowHistory : true,
					allowDeleteNode: true,
					allowEditNode: true,

					showHints: true,
					showFeedback: true,
					showEquationAutoComplete: true,

					enable:[
					],

					allowSliders: true,
					allowZoom: true,
					"allowAssignWaveFormButton": "true",
					showWaveformEditor : true,
					"disableTimesUnitsFields" : true,
					"disableSchemaFields": true,
					"disableNodeEditorFields": true,
					"restrictNodeMovement": true
				}
			},

			incremental: {
				STUDENT:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					allowZoom: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					properties: [
						"tweakDirection"
					],
					useTweakStatus: true,
					plotAuthorSolution:true
				},

				COACHED:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					properties: [
						"tweakDirection"
					],
					useTweakStatus: true,
					plotAuthorSolution:true
				},

				TEST:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					properties: [
						"tweakDirection"
					],
					useTweakStatus: true,
					plotAuthorSolution:true
				},

				EDITOR:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					properties: [
						"tweakDirection"
					],
					useTweakStatus: true
				}
			},

			incrementalDemo: {
				STUDENT:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					useTweakStatus: true,
					demoIncrementalFeatures:true,
					showPopupIfComplete: true,
					getNodeOrder: true,
					properties: [
						"tweakDirection"
					],
					useTweakedNodeForOrdering: true,
					plotAuthorSolution:true
				},

				COACHED:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					useTweakStatus: true,
					demoIncrementalFeatures:true,
					useTweakedNodeForOrdering: true,
					getNodeOrder: true,
					properties: [
						"tweakDirection"
					],
					showPopupIfComplete: true,
					plotAuthorSolution:true
				},

				TEST:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					initializeStudentModel : true,
					resetAssistanceScore : true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					useTweakStatus: true,
					demoIncrementalFeatures:true,
					useTweakedNodeForOrdering: true,
					getNodeOrder: true,
					properties: [
						"tweakDirection"
					],
					showPopupIfComplete: true,
					plotAuthorSolution:true
				},

				EDITOR:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,

					initializeStudentModel : true,
					resetAssistanceScore : true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					showNodeEditor:false,
					showIncrementalEditor:true,
					nodeDetails: "DIRECTION",
					copyAuthorNodes: true,
					setTweakDirections: true,
					setStudentTweakDirections: true,
					useTweakStatus: true,
					demoIncrementalFeatures:true,
					useTweakedNodeForOrdering: true,
					getNodeOrder: true,
					properties: [
						"tweakDirection"
					],
					showPopupIfComplete: true
				}
			},
			executionDemo: {
				STUDENT:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,
					resetAssistanceScore : true,

					showNodeEditor:false,
					showPopupIfComplete: true,
					copyAuthorNodes: true,
					showExecutionEditor : true,
					getNodeOrder: true,
					nodeDetails: "NEWVALUE",
					
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					demoExecutionFeatures:true,
					plotAuthorSolution:true
				},

				COACHED:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,
					resetAssistanceScore : true,

					showNodeEditor:false,
					showPopupIfComplete: true,

					showExecutionEditor : true,
					getNodeOrder: true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					demoExecutionFeatures:true,
					plotAuthorSolution:true
				},

				TEST:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,

					showNodeEditor:false,
					showPopupIfComplete: true,
					showDoneMessage: true,

					showExecutionEditor : true,
					getNodeOrder: true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					demoExecutionFeatures:true,
					plotAuthorSolution:true
				},

				EDITOR:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,

					showNodeEditor:false,

					showIncrementalEditor:true,
					
					showPopupIfComplete: true,
					getNodeOrder: true,
					showExecutionEditor : true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					demoExecutionFeatures:true
				}
			},
			execution: {
				STUDENT:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,

					showNodeEditor:false,
					copyAuthorNodes: true,
					showExecutionEditor : true,
					nodeDetails: "NEWVALUE",

					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					executionExercise: true,
					plotAuthorSolution:true
				},

				COACHED:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,

					showNodeEditor:false,

					showExecutionEditor : true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					executionExercise: true,
					plotAuthorSolution:true
				},

				TEST:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,
					showNodeEditor:false,
					showDoneMessage: true,

					showExecutionEditor : true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					executionExercise: true,
					plotAuthorSolution:true
				},

				EDITOR:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation"
					],

					initializeStudentModel : true,

					showNodeEditor:false,

					showIncrementalEditor:true,

					showExecutionEditor : true,
					nodeDetails: "NEWVALUE",
					copyAuthorNodes: true,
					setExecutionValues:true,
					setStudentExecutionValues:true,
					properties: [
						"executionValue"
					],
					executionExercise: true
				}
			},

			waveform: {
				STUDENT:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation",
						"waveform"
					],

					initializeStudentModel : true,

					showNodeEditor:false,
					copyAuthorNodes: true,
					showWaveformEditor : true,
					properties: [
						"waveformValue"
					],
					nodeDetails: "WAVEFORM",
					showNodeBorderTutorial: true,
					plotAuthorSolution:true
				},

				COACHED:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,

					showHints: true,
					showFeedback: true,
					showCorrectAnswer:true,
					showDoneMessage: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation",
						"waveform"
					],

					initializeStudentModel : true,

					showNodeEditor:false,

					showWaveformEditor : true,
					nodeDetails: "WAVEFORM",
					properties: [
						"executionValue"
					],
					copyAuthorNodes: true,
					showNodeBorderTutorial: true,
					plotAuthorSolution:true
				},

				TEST:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation",
						"waveform"
					],

					initializeStudentModel : true,
					showNodeEditor:false,
					showDoneMessage: true,

					showWaveformEditor : true,
					nodeDetails: "WAVEFORM",
					properties: [
						"executionValue"
					],
					copyAuthorNodes: true,
					plotAuthorSolution:true
				},

				EDITOR:{
					allowPrettify:true,
					allowHelp: true,
					allowLessonsLearned:true,

					allowEditNode:true,
					allowZoom: true,
					showFeedback: true,
					copyFields: [
						"description",
						"type",
						"initial",
						"units",
						"equation",
						"waveform"
					],

					initializeStudentModel : true,

					showNodeEditor:false,

					showIncrementalEditor:true,

					showWaveformEditor : true,
					nodeDetails: "WAVEFORM",
					properties: [
						"executionValue"
					],
					copyAuthorNodes: true
				}
			}
		};

		var config = {
			_mode: null,
			_activity: null,
			_params :{
				//Menu Options
				allowCreateNode: false,
				allowGraph: false,
				allowTable: false,
				allowCreateSchema: false,
				allowProblemTimes: false,
				allowSaveAs: false,
				allowMerge: false,
				allowPreview: false,
				allowHints: false,
				allowPrettify: false,
				allowHelp: false,
				allowLessonsLearned: false,
				allowHistory : false,
				allowZoom: false,
				//Node
				allowDeleteNode: false,
				allowEditNode: false,

				//Feedback
				showHints:false,
				showFeedback:false,
				showCorrectAnswer:false,
				targetNodeStrategy:false,
				showDoneMessage: false,

				disableFieldOnCorrectAnswer: false,

				//Node Editor
				enable:[
				],

				autoFill:[
				],

				//Graph
				allowSliders:false,
				plotAuthorSolution:false,
				showEquationAutoComplete: false,

				//Node Click Behavior
				showNodeEditor:true,

				//Problem Open Behavior
				promptSaveAs:false,

				//Model
				initializeStudentModel : false,
				resetAssistanceScore: false,
				copyFields: [],

				//Incremental Behavior
				showIncrementalEditor: false,
				copyAuthorNodes: false,
				nodeDetails: "DETAILS",
				setTweakDirections: false,
				setStudentTweakDirections: false,
				useTweakStatus: false,
				demoIncrementalFeatures:false,
				showPopupIfComplete:false,
				useTweakedNodeForOrdering: false,
				getNodeOrder: false,
				
				//Execution Behavior
				showExecutionEditor: false,
				setExecutionValues:false,
				setStudentExecutionValues:false,
				demoExecutionFeatures:false,
				executionExercise: false,

				//Waveform Behavior
				showWaveformEditor: false,

				//tour
				showNodeEditorTour: false,
				showNodeBorderTutorial: false

			},

			constructor: function(/*string*/ mode, /*string*/ activity){
				this._mode = mode;
				this._activity= activity;
				this._params = lang.mixin(this._params, activity_params[this._activity][this._mode]);
			},

			getAllParameters: function(){
				return this._params;
			},

			get: function(/*string*/ name){
				return typeof this._params[name] !== "undefined" ? this._params[name] : undefined;
			},

			set: function(/*string*/ key, /*value*/ value){
				this._params[key] = value;
			},

			getMode: function(){
				return this._mode;
			},

			getActivity: function(){
				return this._activity;
			},
			getAllActivitesNames: function(){
				return Object.keys(activity_params);
			}

		};

		config.constructor.apply(config, arguments);
		return config;
	};
});
