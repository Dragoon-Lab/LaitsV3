/**
 *Dragoon Project
 *Arizona State University
 *(c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
 *
 *This file is a part of Dragoon
 *Dragoon is free software: you can redistribute it and/or modify
 *it under the terms of the GNU General Public License as published by
 *the Free Software Foundation, either version 3 of the License, or
 *(at your option) any later version.
 *
 *Dragoon is distributed in the hope that it will be useful,
 *but WITHOUT ANY WARRANTY; without even the implied warranty of
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global define */

define([
	"dojo/_base/declare",
	"dojo/_base/json",
	"dojo/_base/lang",
	"dojo/promise/Promise",
	"dojo/request/xhr",
	"dojo/when"
], function(declare, json, lang, promise, xhr, when){
	// Summary: 
	//			Routines for saving state.
	// Description:
	//			Get and set state variables for the tutor or the student.

	//			Variables are defined by:
	//				 section (string):
	//				 user (string): If user is omitted, then variable is a section-wide default.
	//				 apopropos (string):  A group of parameters (see below)
	//				 property (string):	 A parameter name  
	//				 value (JavaScript object):	 Stored as JSON in the database
	//
	//			Note that one may choose to store several parameters together as a more
	//			complicated object, if that is more convenient.
	//
	//			Internally, the database table uses tid to label variables so that the 
	//			history of a variable may be tracked.
	//
	//			Choices for apropos include:
	//
	//				policies: settings of the tutor system, such as whether to use
	//					structured or algebraic equation inputs on the node editor
	//					or what level of hints to give.
	//
	//				actions: counters detailing what the student has done
	//					in the past.  For example: how many greeens the student has seen.
	//
	//				skills: variables describing what the student does or does not know
	//
	//				Generally, actions are used to determine skills and skills are used
	//			to determine policies.
	//
	//			The interface sort of follows the Dojo Stores API.
	// Tags:
	//			state, model, load, save

	return declare(null, {

	cache: {},
	
	constructor: function(user, section, apropos, path){
		this.params = {u: user, s: section, aps: apropos};
		// Add a trailing slash to path, if it exists
		if(path && path.substr(-1) != '/') path += '/';
		this.path = (path || "") + "state.php";
	},
	
	/*
	 This is not in dojo store API, no value will be initiated less than 0.
	 */
	init: function (property, defaultValue) {
		// Add default value to cache *then* request
		// value from server, not looking at cache.
		this.cache[property] = defaultValue;
		this.get(property, true);
	},

	/*
	 Get always returns a promise
	 */
	get: function(property, noCache){
		if(!noCache && property in this.cache)
		return when(this.cache[property]);
		else {
		var object = xhr.get(this.path, {
			query: lang.mixin({pry: property}, this.params),
			handleAs: "json"
		});
		object.then(lang.hitch(this, function(x){
			// Don't add to cache if property is also not on the server.
			if(x!=""){
			this.cache[property] = x;
			}
		}));
		return object;
		}
	},

	/*
	 This doesn't quite fit the Dojo Store API.
	*/
	put: function(property, object){
		if(!this.cache){
		console.warn("Invalid scope ", this);
		console.trace();
		}
		this.cache[property] = object;
		xhr.post(this.path, {
			data: lang.mixin({
				pry: property,
				vle: json.toJson(object)
			}, this.params)
		});
	},

	remove: function(property){
		delete this.cache[property]; 
		xhr.post(this.path, {
		data: lang.mixin({
			pry: property, 
			vle: ""
		}, this.params)
		});
	},

	getLocal: function(property){
		// Summary:	 get value from local cache or return an error.
		//			 This is supposed to be used in conjunction with init()
		if (property in this.cache) {
			return this.cache[property];
		}else{
			throw new Error("Property '" + property + "' not in cache");
		}
	},

	/*
	 This is not in Dojo Store API.
	 */
	increment: function (property, step){
		// The unary plus converts a string into a number
		var x = +this.getLocal(property);
		x += step === undefined ? 1 : step;
		this.put(property, x);
		return x;
	}

	});
});
