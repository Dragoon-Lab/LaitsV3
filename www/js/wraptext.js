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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU General Public License for more details.
 *
 *You should have received a copy of the GNU General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* global define */
define([
    "dojo/_base/array"
], function(array){

    return function(context, textIn, x, y, maxWidth, lineHeight){
	array.forEach(typeof textIn == "string"?[textIn]:textIn, function(text){
            var words = text.split(' ');
            var line = '';
	    
            for(var n = 0; n < words.length; n++){
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if(testWidth > maxWidth && n > 0){
		    context.fillText(line, x, y);
		    line = words[n] + ' ';
		    y += lineHeight;
		}
		else {
		    line = testLine;
		}
            }
            context.fillText(line, x, y);
	    y += lineHeight; // Add blank line between paragraphs
	});
    };

});
