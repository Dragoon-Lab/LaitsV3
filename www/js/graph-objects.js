/* global define */
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
define([
    "dojo/dom-construct","./equation"
], function(domConstruct,expression){
    return {
       getEndPointConfiguration:function(sign){
            if(sign!='')
             return [["Arrow", { location:1, id:"arrow", length:14, foldback:0.9 } ], ["Custom", { create:function(component){ var overlay = domConstruct.create("div", { innerHTML: "<div class='endPoint'>"+sign+"</div>" }); return overlay; }, location:1.0, id:"customOverlay" }]];
            else
               return [["Arrow", { location:1, id:"arrow", length:14, foldback:0.9 } ]];
        },
 	getNodeName:function(model,nodeId,type){
	      var type = model.getType(nodeId)||type||'triangle';
             var nodeName = model.getName(nodeId);
             var parse = model.getEquation(nodeId);
             var parameter =  '';
            if(parse){
                parse=expression.parse(parse);
                // May want to change symbols to "sum" and "product"
                parameter = expression.isSum(parse)&&expression.isProduct(parse)?'':expression.isSum(parse)?'+':expression.isProduct(parse)?'*':'';
		parameter = '<strong style="font-size:18px">'+parameter+'</strong>';
            }
            var initialValue = model.getInitial(nodeId);
            if(!initialValue)
                 initialValue = '';

             var unitsValue = model.getUnits(nodeId);
             if(!unitsValue)
                     unitsValue = '';

            initialValue += " " + unitsValue;

            if(nodeName&&type!='triangle')
                nodeName='<div id='+nodeId+'Label  class="bubble"><div class="'+type+'Wrapper"><strong>'+parameter+'<br>'+initialValue+'</strong></div><div class='+type+'Div><strong>'+nodeName+'</strong></div></div>';
            else
                nodeName='';
                return nodeName;

	}
    };
});
