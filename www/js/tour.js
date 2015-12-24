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
/* global define */

define([
	"dojo/_base/array",
	'dojo/_base/declare',
	"dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/query",
	"dijit/registry",
	"dijit/popup",
	"dijit/TooltipDialog"
], function(array, declare, lang, on, dom, domConstruct, style, domClass, query, registry, popup, tooltipDialog) {
	/* Summary:
	 *			Autocomplete widget for Textbox, displays suggestions based on user input,
	 * Description:
	 *			Shows suggestions in the dropdown below the text widget based on suggestions passed
	 *			and delimiters. Adds selected text to textbox widget.
	 *			Extra info can be passed as object of <suggestion, info> pairs
	 *			that is displayed as tooltip on hover over each item.
	 * Tags:
	 *			autocomplete, textbox, suggestions, delimiters
	 */
	return declare(null, {
		_steps: null,
		_currentStep: null,
		_tooltips: [],

		constructor: function(/*Array of objects*/ steps){
			if(steps.length === 0){
				console.warn("Zero Steps provided for tour");
			}
			this._steps = steps;
			this.init();
		},

		init: function(){
			this._tooltips = [];
			this._currentStep = null;
			array.forEach(this._steps, lang.hitch(this, function(step, index){

				var stepDialog = new tooltipDialog({
					style: "max-width:300px",
					content: '<div>' + step.title + '</div>',
					onShow: function () {

					},
					onBlur: function () {
						//popup.close(stepDialog);
					},
					onCancel: function(){
						return false;
					}
				});

				this._tooltips.push(stepDialog);

			}));
		},

		start: function(){
			this._currentStep = null;
			this.next();
		},

		end: function(){

		},

		next: function(){
			if(this._currentStep === null){
				this._currentStep = 0;
			}else if(this._currentStep < this._steps.length-1){
				this._currentStep += 1;
			}
			popup.open({
				popup: this._tooltips[this._currentStep],
				around: dom.byId(this._steps[this._currentStep].element),
				orient: ["before-centered"]
			});
		},

		prev: function(){

		}

	});
});