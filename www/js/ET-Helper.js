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
// running Dragoon inside ET required to communicate with ET service through a heartbeat
define(["dojo/_base/declare"], function(declare){
	return declare(null, {

		constructor: function(/* object */ query, data, mapping){
			this.problem = query.p;
			this.activity = query.a;
			this.problemLSRMap = data;
			this.schemaETKCMap = mapping;
		},

		getLearningResourceName: function(){
			var code = this.problemLSRMap[this.problem];
			if(code !== null){
				code = code.replace("--","-"+this.activity.charAt(0).toUpperCase()+"-");
			}
			return code;
		},

		getKCForSchema: function(schemaClass){
			if(schemaClass != null){
				schemaClass = this.schemaETKCMap[schemaClass];	
			}
			return schemaClass;
		}
	});
	
});
