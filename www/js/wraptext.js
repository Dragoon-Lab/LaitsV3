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
