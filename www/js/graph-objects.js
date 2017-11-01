/* global define */
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
define([
	"dojo/dom-construct","./equation"
], function(domConstruct,expression){
	// Summary: 
	//			Creates a node in the DOM (Note to developer: see who calls this and update the Dependency tree)
	// Description:
	//			Assists in creating the model graph
	// Tags:
	//			DOM, model, graph

	return {
		getEndPointConfiguration:function(sign){
			if(sign!=''){
				return [
					["Arrow", { location:1, id:"arrow", length:14, foldback:0.9 } ], 
					["Custom", { create:function(component){ 
						var overlay = domConstruct.create("div", { innerHTML: "<div class='endPoint'>"+sign+"</div>" }); 
						return overlay; 
					}, location:1.0, id:"customOverlay" }]
				];
			}else{
				return [["Arrow", { location:1, id:"arrow", length:14, foldback:0.9 } ]];
			}
		},
		getNodeName:function(model,nodeId,showDetails,type){
			type = type||model.getType(nodeId)||'triangle';
			var nodeName = model.getName(nodeId) || '';
			var htmlContent = null;
			if(showDetails === "DETAILS") {
				var parse = model.getEquation(nodeId);
				var parameter = '';
				if (parse) {
					try {
						parse = expression.parse(parse);
						// May want to change symbols to "sum" and "product"
						if( expression.isOnlySum(parse) ) {
							parameter = '+'
						}else if( expression.isProduct(parse) ){
							parameter = '*'
						}else{
							parameter = ''
						}
						if(parameter)
							parameter = '<strong style="font-size:18px">' + parameter + '</strong><br/>';
					} catch (err) {
						console.log("Parse Error" + err);
					}
				}
				var initialValue = typeof(model.getInitial(nodeId)) === "number" ? model.getInitial(nodeId) : '';				

				var unitsValue = model.getUnits(nodeId);
				if (!unitsValue) {
					unitsValue = '';
				}
				
				if(initialValue !== '') {
					initialValue += "<br/>" + unitsValue;
				}else{
					initialValue = unitsValue;
				}
				if(type === 'triangle') initialValue = 'Click here!';
				htmlContent = '<div id=' + nodeId + 'Label  class="bubble"><div class="' + type + 'Wrapper"><strong class="nodeContent">' + parameter + initialValue + '</strong></div><div class=' + type + 'Div><strong>' + nodeName + '</strong></div></div>';
				console.log(nodeName);
				
			}else if(showDetails === "DIRECTION"){
				var dir = model.getTweakDirection(nodeId) == ""? "Empty": model.getTweakDirection(nodeId);
				var content = "";
				var iconClass = {
					"Empty": "",
					"Increase": "arrow-up",
					"Decrease":"arrow-down",
					"Stays-Same":"",
					"Unknown":"question"
				};

				if(dir == "Stays-Same"){
					content = "&#x003d;"
				}
				htmlContent='<div id=' + nodeId + 'Label  class="bubble"><div class="' + type + 'Wrapper"><strong class="nodeContent fa fa-'+ iconClass[dir] +'">'+ content+ '</strong></div><div class=' + type + 'Div><strong>' + nodeName + '</strong></div></div>';
			}else if(showDetails === "NEWVALUE"){
				var iteration = model.getIteration();
				var oldVal = model.getInitial(nodeId);
				if(iteration > 0) {
					 oldVal = model.getExecutionValue(nodeId, iteration- 1);
				}
				var newVal = model.getExecutionValue(nodeId) == undefined? "_____": model.getExecutionValue(nodeId);

				var unitsValue = model.getUnits(nodeId);
				if (!unitsValue) {
					unitsValue = '';
				}

				var content = "";
				if(type === "accumulator"){
					newVal = oldVal + '<br/><strong class="fa fa-angle-double-down"></strong><br/>' + newVal;
				}
				content += "<span style='font-size:12px;'>"+ newVal + "</span><br/>"+ unitsValue+"";

				htmlContent='<div id=' + nodeId + 'Label  class="bubble bubble-execution"><div class="executionContent ' + type + 'Wrapper"><strong class="nodeContent">'+ content+ '</strong></div><div class=' + type + 'Div><strong>' + nodeName + '</strong></div></div>';

			}
			else if(showDetails === "WAVEFORM"){
				content = "";
				var waveformValue = model.getWaveformValue(nodeId);
				if(waveformValue){
					content = "<img src='images/waveforms/"+waveformValue+".png' width=40 height=40>";
				}else if(waveformValue === null){
					content = "<strong>?</strong>";
				}else{
					if(type === "parameter")
					{
						var initialValue = typeof(model.getInitial(nodeId)) === "number" ? model.getInitial(nodeId) : '';
						var unitsValue = model.getUnits(nodeId);
						if (!unitsValue) {
							unitsValue = '';
						}
						content = '<strong class="nodeContent">'+ initialValue + '<br/>'+ unitsValue +'</strong>';
					}else{
						content = "";
					}
				}
				htmlContent='<div id=' + nodeId + 'Label  class="bubble"><div class="waveformContent ' + type + 'Wrapper"><strong class="nodeContent">'+ content+ '</strong></div><div class=' + type + 'Div><strong>' + nodeName + '</strong></div></div>';
			}
			return htmlContent;
		}
	};
});
