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
/*
 *	Simple integration routines.
 */

define([
	"dojo/_base/array", "dojo/_base/lang"
], function(array, lang){
	// Summary: 
	//			Solves a system of differential equations
	// Description:
	//			General routine to solve a system of differential equations 
	//			using Euler's method.
	// Tags:
	//			equation

	return {
		eulersMethod: function(env, f, initial, times){
			// Summary:	 Use Euler's method to find time evolution of a 
			//			 system of first order differential equations.
			// Returns:	 An object containing times and values:
			//	   {times: [t1, t2, ...], values: [[x1, x2, ...], 
			//									   [y1, y2, ....], ...]}
			var i, j, n = initial.length, gradient;
			var t = times.start, values = initial.slice(0);
			var ret = {
				times: [], 
				values: array.map(initial, function(){return [];})
			};
			for(t = times.start, j=0; t<times.end; t += times.step, j++){
				if(j>0){
					gradient = f.call(env, values);;
					for(i=0; i<n; i++){
						values[i] += gradient[i]*times.step;
					}
				}
				ret.times.push(t);
				for(i=0; i<n; i++){
					ret.values[i].push(values[i]);
					// console.log("ret.values", ret.times, ret.values[i]);
				}
			}
			console.log("eulers method called");
			return ret;
		},
		midpointMethod: function(env, f, initial, times){
			//	Summary: 	Use midpoint method to find a more acurate time evolution
			//				of a system of first order differential equations.
			//	Returns: 	An object containing times and values:
			//		{times: [t1, t1,...], values: [[x1, x2, ...]
			//									   [y1, y2, ...], ...]}
			var i, j, n = initial.length, gradient;
			var t = times.start, values = initial.slice(0), eulerValues = initial.slice(0);
			var mk, nk;
			var ret = {
				times: [],
				values: array.map(initial, function(){return [];})
			};
			for(t = times.start, j = 0; t<times.end; t += times.step, j++){
				if(j>0){
					gradient = f.call(env, values);;
					for(i=0; i<n; i++)
					{
						eulerValues[i] += gradient[i]*times.step;
					}
					nk = f.call(env, eulerValues);;
					for(i=0; i<n; i++)
					{
						mk = gradient[i];
						values[i] += ((mk + nk[i])/2)*times.step;
					}
					for(i=0; i<n; i++)
					{
						eulerValues[i] = values[i];
					}
				}
				ret.times.push(t);
				for(i=0; i<n; i++){
					ret.values[i].push(values[i]);
				}
			}
			console.log("midpoint method called");
			return ret; 
		}		
	}
});
