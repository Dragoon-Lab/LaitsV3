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
	"dijit/Tooltip"
], function(array, declare, lang, on, dom, domConstruct, style, domClass, query, registry, Tooltip) {
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
		_clickHandlers: [],

		constructor: function(/*Array of objects*/ steps){
			if(steps.length === 0){
				console.warn("Zero Steps provided for tour");
			}
			this._steps = steps;
			this.init();
		},

		init: function(){
			//Initialize the tour steps and generate tooltips
			this._tooltips = [];
			this._currentStep = null;
			var makeTooltip = function(s, i){
				this._tooltips[i] = new Tooltip({
					label: s["title"],
					position: ['before-centered']
				});
			};

			array.forEach(this._steps, lang.hitch(this, function(step, index){
				makeTooltip.call(this, step, index);
			}));

			array.forEach(this._steps, lang.hitch(this, function(step){
				if(step["element"]) {
					this._clickHandlers[step["element"]] = on(dom.byId(step["element"]), "click", lang.hitch(this, function (evt) {
						this.toggle(step["element"]);
					}));
				}
			}));

		},
		getStepByElement: function(/*String*/ element){
			var foundStep = null;
			array.some(this._steps, lang.hitch(this, function(step){
				if(step["element"] === element) {
					foundStep = step;
					return true;
				}
			}));
			return foundStep;
		},

		getStepByIndex: function(/*Number*/ index){
			return this._steps[index] || null;
		},

		getCurrentStep: function(){
			return this._steps[this._currentStep] || null;
		},

		start: function(){
			//Summary: Start the tour from first step
			this._currentStep = null;
			this.next();
		},

		end: function(){
			// Summary: end the tour

			array.forEach(this._steps, lang.hitch(this, function(step, index){
				if(step["element"]) {
					this._clickHandlers[step["element"]].remove();
					//hide all tooltips
					var elemNode = dom.byId(this._steps[index].element);
					Tooltip.hide(elemNode);
				}
			}));
			this._clickHandlers = [];
		},

		next: function(){
			//Summary: Go to the next tour step

			if(this._currentStep) {
				var prevNode = dom.byId(this._steps[this._currentStep].element);
				if (prevNode) {
					Tooltip.hide(prevNode);
				}
			}
			if(this._currentStep === null){
				this._currentStep = 0;
			}else if(this._currentStep < this._steps.length-1){
				this._currentStep += 1;
			}

			var node = dom.byId(this._steps[this._currentStep].element);
			if(node && this._steps[this._currentStep].type !== "default") {
				Tooltip.show(this._steps[this._currentStep].title, node, ["before-centered"]);
			}
		},

		prev: function(){
			//TODO: Go to the previous step
		},

		removeStep: function(step){
			//Summary: removes a step and corresponding tooltip from the list based on element id

			var removedStep = null;
			array.some(this._steps, lang.hitch(this, function(st, index){
				if(st && st.element === step){
					removedStep = this._steps[index];
					this._steps.splice(index ,1);
					this._tooltips.splice(index, 1);
					return true;
				}
			}));
			this._steps.push(removedStep);
		},

		toggle : function(id){
			//Hide Tooltip
			if(! domClass.contains(dom.byId(id), "active")) {
				array.forEach(this._steps, function(step){
					if(step["element"] === id){
						debugger;
						Tooltip.show(step["title"], dom.byId(id), ["before-centered"]);
					}
				});
			}else{
				Tooltip.hide(dom.byId(id));
			}
			domClass.toggle(dom.byId(id), "active");

			//Reset Buttons
			array.forEach(this._steps, function(step){
				if(step["element"] && step["element"] !== id) {
					domClass.remove(dom.byId(step["element"]), "active");
				}
			});
		}
	});
});
