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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
	// this configuration describe parameters that define UI parameters of dragoon
define(["dojo/_base/lang"], function (lang) {
	return function () {
		// specific parameters that apply for modes and activity grid
		var parameters = {
			construction: [
				{
					"mode": ["AUTHOR", "STUDENT", "COACHED", "TEST"],
					"param": {
						"showColor": true,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"doneButton": "none",
						"prettifyButton": "none",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "green",
						"nodeBorderFeedbackColor": "yellow",
						"nodeBorderFailColor": "red",

					}
				},
				{
					"mode": ["AUTHOR"],
					"param": {
						"createNodeButton": "inline",
						"graphButton": "inline",
						"tableButton": "inline",
						"forumButton": "inline",
						"schemaButton": "inline",
						"descButton": "inline",
						"saveButton": "inline",
						"mergeButton": "inline",
						"previewButton": "inline",
						"slidesButton": "inline",
						"lessonsLearnedButton": "inline",
						"doneButton": "inline",
						"prettifyButton": "inline"

					}
				},
				{
					"mode": ["STUDENT", "COACHED", "TEST"],
					"param": {
						"createNodeButton": "inline",
						"graphButton": "inline",
						"tableButton": "inline",
						"forumButton": "inline",
						"slidesButton": "inline",
						"prettifyButton": "inline",
						"doneButton": "inline",
						"lessonsLearnedButton": "inline"
					}
				},
				{
					"mode": ["TEST", "EDITOR"],
					"param": {
						"showColor": false
					}
				}

			],
			incremental: [
				{
					"mode": ["STUDENT", "COACHED"],
					"param": {
						"showColor": true,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"doneButton": "inline",
						"prettifyButton": "inline",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "green",
						"nodeBorderFeedbackColor": "yellow",
						"nodeBorderFailColor": "red",
						"qualitativeChangeButtons": "block"

					}
				},
				{
					"mode": ["TEST", "EDITOR"],
					"param": {
						"showColor": false,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"doneButton": "inline",
						"prettifyButton": "inline",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "gray",
						"nodeBorderFeedbackColor": "gray",
						"nodeBorderFailColor": "gray",
						"qualitativeChangeButtons": "block"
					}
				}],

			incrementalDemo: [{
				"mode": ["STUDENT", "COACHED"],
				"param": {
					"showColor": true,
					"nodeBorderSize": "3px ",
					"createNodeButton": "none",
					"graphButton": "none",
					"tableButton": "none",
					"forumButton": "none",
					"schemaButton": "none",
					"descButton": "none",
					"saveButton": "none",
					"mergeButton": "none",
					"previewButton": "none",
					"slidesButton": "none",
					"lessonsLearnedButton": "none",
					"resetButton": "inline",
					"doneButton": "inline",
					"prettifyButton": "inline",
					"nodeBorderCompleteColor": "gray",
					"nodeBorderCompleteStyle": "solid ",
					"nodeBorderInCompleteStyle": "dashed ",
					"nodeBorderSuccessColor": "green",
					"nodeBorderFeedbackColor": "yellow",
					"nodeBorderFailColor": "red",
					"qualitativeChangeButtons": "none"

				}
			},
				{
					"mode": ["TEST", "EDITOR"],
					"param": {
						"showColor": false,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"resetButton": "inline",
						"doneButton": "inline",
						"prettifyButton": "inline",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "gray",
						"nodeBorderFeedbackColor": "gray",
						"nodeBorderFailColor": "gray",
						"qualitativeChangeButtons": "none"

					}
				}],
			execution: [{
				"mode": ["STUDENT", "COACHED"],
				"param": {
					"showColor": true,
					"nodeBorderSize": "3px ",
					"createNodeButton": "none",
					"graphButton": "none",
					"tableButton": "none",
					"forumButton": "none",
					"schemaButton": "none",
					"descButton": "none",
					"saveButton": "none",
					"mergeButton": "none",
					"previewButton": "none",
					"slidesButton": "none",
					"lessonsLearnedButton": "none",
					"resetButton": "inline",
					"doneButton": "inline",
					"prettifyButton": "inline",
					"nodeBorderCompleteColor": "gray",
					"nodeBorderCompleteStyle": "solid ",
					"nodeBorderInCompleteStyle": "dashed ",
					"nodeBorderSuccessColor": "green",
					"nodeBorderFeedbackColor": "yellow",
					"nodeBorderFailColor": "red",
					"qualitativeChangeButtons": "none"
				}
			},
				{
					"mode": ["TEST", "EDITOR"],
					"param": {
						"showColor": false,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"resetButton": "inline",
						"doneButton": "inline",
						"prettifyButton": "inline",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "gray",
						"nodeBorderFeedbackColor": "gray",
						"nodeBorderFailColor": "gray",
						"qualitativeChangeButtons": "none"

					}}
			],
			executionDemo: [{
				"mode": ["STUDENT", "COACHED"],
				"param": {
					"showColor": true,
					"nodeBorderSize": "3px ",
					"createNodeButton": "none",
					"graphButton": "none",
					"tableButton": "none",
					"forumButton": "none",
					"schemaButton": "none",
					"descButton": "none",
					"saveButton": "none",
					"mergeButton": "none",
					"previewButton": "none",
					"slidesButton": "none",
					"lessonsLearnedButton": "none",
					"resetButton": "inline",
					"doneButton": "inline",
					"prettifyButton": "inline",
					"nodeBorderCompleteColor": "gray",
					"nodeBorderCompleteStyle": "solid ",
					"nodeBorderInCompleteStyle": "dashed ",
					"nodeBorderSuccessColor": "green",
					"nodeBorderFeedbackColor": "yellow",
					"nodeBorderFailColor": "red",
					"qualitativeChangeButtons": "none"
				}
			},
				{
					"mode": ["TEST", "EDITOR"],
					"param": {
						"showColor": false,
						"nodeBorderSize": "3px ",
						"createNodeButton": "none",
						"graphButton": "none",
						"tableButton": "none",
						"forumButton": "none",
						"schemaButton": "none",
						"descButton": "none",
						"saveButton": "none",
						"mergeButton": "none",
						"previewButton": "none",
						"slidesButton": "none",
						"lessonsLearnedButton": "none",
						"resetButton": "inline",
						"doneButton": "inline",
						"prettifyButton": "inline",
						"nodeBorderCompleteColor": "gray",
						"nodeBorderCompleteStyle": "solid ",
						"nodeBorderInCompleteStyle": "dashed ",
						"nodeBorderSuccessColor": "gray",
						"nodeBorderFeedbackColor": "gray",
						"nodeBorderFailColor": "gray",
						"qualitativeChangeButtons": "none"

					}
				}]
		};

		var config = {
			_mode: null,
			_activity: null,
			_params: {},
			constructor: function (/* string */ mode, /* string */ activity) {
				this._mode = mode;
				this._activity = activity;
				// iterate through all object in the activity and merge all params for given mode:
				//console.log("In constructor", this._mode, this._activity);
				for (var idx in parameters[this._activity]) {
					var obj = parameters[this._activity][idx];
					if (obj.mode.indexOf(this._mode) > -1) this._params = lang.mixin(this._params, obj.param);
				}
			},

			//operations available throught the config api
			get: function (/*string*/ name) {
				var result = null;

				(typeof this._params[name] != "undefined") ? result = this._params[name] : result = undefined;
				return result;
			},
			getMode: function () {
				return this._mode;
			},
			getActivity: function () {
				return this._activity;
			},
			//returns object containing all(general and specific) config parameters for the given mode and activity
			getAllParameters: function () {
				return this._params;
			}
		};

		config.constructor.apply(config, arguments);

		return config;
	}
});
