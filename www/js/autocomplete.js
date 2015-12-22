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
	"dijit/Tooltip"
], function(array, declare, lang, on, dom, domConstruct, style, domClass, query, registry, popup, tooltip) {
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

		_textWidget:null,
		_suggestions: null,
		_delimiters: null,
		_extraInfo: null,
		_suggestionDialog: null,
		_stringToMatch: null,
		_isOpen: false,

		constructor: function(/*WidgetID or Widget Object*/ textbox, /*Array of Strings*/ suggestions, /*array of Strings*/ delim, /*Optional array of strings*/ extraInfo){

			//Initialize Text Widget
			if(typeof textbox === 'string'){
				this._textWidget = registry.byId(textbox);
			}else if(typeof textbox === 'object'){
				this._textWidget = textbox;
			}else{
				this._textWidget = null;
			}

			// Initialize other parameters
			this._suggestions = suggestions || [];
			this._delimiters = delim || [' '];
			this._extraInfo = extraInfo || null;


			//Handling empty text widget and suggestions
			if(this._textWidget == null) {
				console.error('Autocomplete', 'Textbox cannot be null or undefined');
				return;
			}
			if(this._suggestions.length == 0){
				console.warn('Autocomplete', 'There are no suggestions to show');
				return;
			}

			//Initialize thw widget
			this.initialize();
		},

		initialize: function(){
			//Escape any special characters from text before using in regular expression
			RegExp.escape = function(text) {
				return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			};

			//Add Handler for Key Up
			on(this._textWidget, 'keyup', lang.hitch(this, function(event){
				this.checkInput(event);
			}));

			//Add Handler for Special Keys - Enter and Arrow Up and Down
			on(this._textWidget, 'keydown', lang.hitch(this, function(event){
				this.handleSpecialKeys(event);
			}));

			//Add handler for click on text widget
			on(this._textWidget, "click", lang.hitch(this, function(){
				this.hideSuggestions();
			}));

			//Add handler for blur on text widget
			on(this._textWidget, "blur", lang.hitch(this, function(event){
				var that = this;
				setTimeout(function(){ that.hideSuggestions(); }, 100);

			}));

			//Add SuggestionsDiv below the textWidget
			var suggestionDiv = "<div id='suggestionsDiv'></div>";
			domConstruct.place(suggestionDiv, this._textWidget.domNode, "after");
			this.hideSuggestions();
		},

		checkInput: function(event){
			//Check for valid input and process it
			if(event.keyCode && !this.isDelimiter(event.keyCode) && !this.isSpecialKey(event.keyCode)){
				var text = this._textWidget.get('value');
				var cursorPos = this.getCursorPosition();
				this.extractAndMatch(text, cursorPos);
			}
		},

		extractAndMatch: function(/*String*/text, /*Integer*/cursorPos){

			//Get Last delimiter index
			var lastDelimIndex = -1;
			for(var i=0; i<this._delimiters.length; i++){
				var newIndex = text.lastIndexOf(this._delimiters[i], cursorPos-1);
				lastDelimIndex = ( newIndex > lastDelimIndex) ? newIndex : lastDelimIndex;
			}
			lastDelimIndex = lastDelimIndex >= 0? lastDelimIndex+1 : 0;

			//Extract string between last delimiter and current cursor position
			this._stringToMatch = text.substring(lastDelimIndex, cursorPos);

			if(this._stringToMatch.length > 0) {

				//Create a regular expression
				this._stringToMatch = RegExp.escape(this._stringToMatch);
				var regEx = new RegExp('^' + this._stringToMatch, 'i');
				var suggestions = this._suggestions.filter(function (item, index) {
					return regEx.test(item);
				});

				//Show or hide suggestions box
				if (suggestions.length > 0) {
					this.showSuggestions(suggestions);
				} else {
					this.hideSuggestions();
				}
			}else{
				this.hideSuggestions();
			}
		},


		/*
		 * Show Suggestions
		 * Create Options , add click handlers, attach tooltips
		 */

		showSuggestions: function(suggestions){
			this._isOpen = true;
			var suggestionsDiv = dom.byId("suggestionsDiv");
			var textBoxStyle = style.getComputedStyle(this._textWidget.domNode);
			style.set(suggestionsDiv, 'width', textBoxStyle.width);

			var options = "";
			array.forEach(suggestions, function(value, index){
				var classes = "suggestionsItem";
				if(index == 0){
					classes += ' selected';
				}
				options += "<div class='"+ classes +"'>"+ value +"</div>"
			});
			suggestionsDiv.innerHTML = options;


			if(this._extraInfo) {
				this.handleExtraInfo();
			}

			var suggestionsItems = query('#suggestionsDiv > .suggestionsItem');
			array.forEach(suggestionsItems, lang.hitch(this, function(item){
				on(item, 'click', lang.hitch(this, function(event){
					this.handleSelect(event);
				}));
			}));
			style.set(suggestionsDiv, "display", "block");

			suggestionsDiv.scrollTop = 0;
		},

		/*
		 * Handler for Showing extra info tooltip
		 */
		handleExtraInfo: function(){
			var infoTooltip = new tooltip({
				getContent: lang.hitch(this, function(matchedNode){
					return this._extraInfo[matchedNode.innerText]
				}),
				selector: ".suggestionsItem",
				connectId: "suggestionsDiv",
				position: ['after'],
				showDelay: 100
			});
		},

		/*
		 * Hide Suggestions Div
		 */
		hideSuggestions: function(){
			this._isOpen = false;
			var suggestionsDiv = dom.byId("suggestionsDiv")
			style.set(suggestionsDiv, "display", "none");
		},

		/*
		 * Handler to select and add the item to textwidget
		 */
		handleSelect: function(event){
			var value = event.target.innerText || event.target.innerHTML; //no innerText in firefox
			if(event.keyCode == 13){
				var currentSelectedItem = query('#suggestionsDiv .selected');
				value = currentSelectedItem[0].innerText || currentSelectedItem[0].innerHTML; //innerText is not a property in firefox and hence the value is undefined.
			}
			var pos = this.getCursorPosition();
			var text = this._textWidget.get('value');

			var front = text.substring(0, (pos - this._stringToMatch.length));
			var back = text.substring(pos, text.length);

			var replaceText = front + ' ' + value + ' ' + back;
			this._textWidget.set('value', replaceText);
			this._textWidget.focus();
			this.hideSuggestions();
		},

		/*
		 * Handler for Enter and Arrow Keys
		 */

		handleSpecialKeys: function(event){
			if(event.keyCode == 13){
				//Enter Pressed
				if(this._isOpen) {
					event.preventDefault();
					this.handleSelect(event);
				}
			}
			else if(event.keyCode == 40){
				//Down Arrow Key
				event.preventDefault();
				this.moveSelectionDown();
			}
			else if(event.keyCode == 38){
				//Up Arrow Key
				event.preventDefault();
				this.moveSelectionUp();
			}
		},

		/*
		 * Handler for Arrow Key Up
		 */
		moveSelectionUp: function(){
			var suggestionsDiv = dom.byId("suggestionsDiv");
			var currentSelectedItem = query('#suggestionsDiv .selected');
			var previousItem = currentSelectedItem[0].previousSibling;
			if(previousItem) {
				domClass.remove(currentSelectedItem[0], 'selected');
				domClass.add(previousItem, 'selected');
				suggestionsDiv.scrollTop =suggestionsDiv.scrollTop - 20;
			}
		},

		/*
		 * Handler for Arrow Key Down
		 */
		moveSelectionDown: function(){
			var suggestionsDiv = dom.byId("suggestionsDiv");
			var currentSelectedItem = query('#suggestionsDiv .selected');
			var nextItem = currentSelectedItem[0].nextSibling;
			if(nextItem) {
				domClass.remove(currentSelectedItem[0], 'selected');
				domClass.add(nextItem, 'selected');
				suggestionsDiv.scrollTop =suggestionsDiv.scrollTop + 20;
			}
		},

		/*
		 * Helper function to check if key is a delimiter
		 */
		isDelimiter: function(value){
			//Check if present in delimiters array
			return value && this._delimiters.indexOf(value) !== -1;
		},

		/*
		 * Helper function to check if key is a special key
		 */
		isSpecialKey: function(value){
			return value && (value == 13 || value == 38 || value == 40);
		},

		/*
		 * Helper function to get current cursor position inside textWidget
		 */
		getCursorPosition: function(){
			var pos = 0;
			var el = this._textWidget.domNode;
			if("selectionStart" in el) {
				pos = el.selectionStart;
			} else if("selection" in document) {
				el.focus();
				var Sel = document.selection.createRange();
				var SelLength = document.selection.createRange().text.length;
				Sel.moveStart("character", -el.value.length);
				pos = Sel.text.length - SelLength;
			}
			return pos;
		}

	});
});
