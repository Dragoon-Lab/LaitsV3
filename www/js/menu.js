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

/*global define*/

define([
	"dojo/dom",
	"dojo/ready",
	"dijit/registry",
	"dojo/on"
], function(dom, ready, registry, on){
	// Summary/Description: 
	//			Connects the menu buttons to the program
	// Tags:
	//			menu, buttons
	
	return {
	add: function(button, handler){
			// If I use registry.byId(), then the function is called twice.
		var o = dom.byId(button);
		if(o){
		console.log("wiring up ", button, ", widget=", o);
		/*
		 This is a work-around for getting a button to work 
		 inside a MenuBar.
		 Otherwise, there is a superfluous error message.
		 */
		registry.byId(button)._setSelected = function(arg){
			console.log("_setSelected called with ", arg);
		};
		on(o, 'click', handler);
		}else {
		console.warn("Can't find menu item ", o);
		}
	}
	};
});
