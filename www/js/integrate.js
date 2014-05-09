/* global define */
/*
 *  Simple integration routines.
 */

define([
	"dojo/_base/array", "dojo/_base/lang"
], function(array, lang){

	return {
		eulersMethod: function(env, f, initial, times){
			// Summary:  Use Euler's method to find time evolution of a 
			//           system of first order differential equations.
			// Returns:  An object containing times and values:
			//     {times: [t1, t2, ...], values: [[x1, x2, ...], [y1, y2, ....], ...]}
			var i, j, n = initial.length, gradient;
			var t = times.start, values = initial.slice(0);
			var ret = {times: [], values: array.map(initial, function(){return [];})};
			for(t = times.start, j=0; t<times.end; t+= times.step, j++){
				if(j>0){
					gradient = f.call(env, values);;
					for(i=0; i<n; i++){
						values[i] += gradient[i]*times.step;
					}
				}
				for(i=0; i<n; i++){
					console.log("ret.values", ret, i);
					ret.values[i].push(values[i]);
				}
			}
			return ret;
		}
	};
});

