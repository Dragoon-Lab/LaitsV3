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
define("shapes/_CircleMixin", [
	"dojo/_base/declare",
	"dojo/dom-style"
], function(declare, domStyle){
	
	return declare("shapes._CircleMixin", [], {
		
		postCreate: function(){
			this._updateBorderRadius();
		},
		
		resize: function(){
			this._updateBorderRadius();
		},
		
		_updateBorderRadius: function(){
			var domNode = this.domNode;
			var bw, rx, ry;
			var bwString = domStyle.get(domNode, 'borderWidth');
			if(bwString){
				bw = parseFloat(bwString);
			}
			var w = domNode.offsetWidth;
			var h = domNode.offsetHeight;
			if(isNaN(bw) || bw < 0 || w <= 0 || h <= 0){
				domNode.style.borderTopLeftRadius = '';
				domNode.style.borderTopRightRadius = '';
				domNode.style.borderBottomLeftRadius = '';
				domNode.style.borderBottomRightRadius = '';
			}else{
				var rx = (w/2 + bw) + 'px';
				var ry = (h/2 + bw) + 'px';
				var val = rx + ' ' + ry;
				domNode.style.borderTopLeftRadius = val;
				domNode.style.borderTopRightRadius = val;
				domNode.style.borderBottomLeftRadius = val;
				domNode.style.borderBottomRightRadius = val;
			}
		}
		
	});
});
