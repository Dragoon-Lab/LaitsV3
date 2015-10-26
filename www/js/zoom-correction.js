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
define([
	"dojo/dom",
	"dojo/ready",
	"dijit/registry",
	"dojo/on",
	"dojo/dom-style",
	"dijit/ConfirmDialog",
	'dojo/aspect'
], function(dom, ready, registry, on, style, ConfirmDialog, aspect){
	var zoomCorrection = function(){}
	zoomCorrection.prototype.getPPI = function(){
		var div = document.createElement("div");
		div.style.width="1in";
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(div);
		var ppi = document.defaultView.getComputedStyle(div, null).getPropertyValue('width');
		body.removeChild(div);
		
		return parseFloat(ppi);
	}
	zoomCorrection.prototype.zoom = function(scale) {
		document.body.style.zoom = scale + "%";
	}
	zoomCorrection.prototype.validate = function(){
		// normalized pixel/inch on device require for dragoon
		
		var ppi_score = this.getPPI();
		var ppi_ratio = ppi_score / window.devicePixelRatio; 
		var scale = 100;
		var context = this;
		if(ppi_ratio > 64) scale += 100 * ((ppi_score / 64) - window.devicePixelRatio) / window.devicePixelRatio 
		scale = Math.floor(scale);
		//show message asking to zoom.
		var InformZoom = new ConfirmDialog({
			content : "To view the dragoon properly on this device we suggest you to zoom " + scale + "%."
			+ "To zoom the window now click on OK button."
			+ "You can zoom the window later from browser settings",
			title : "Warning: Display resolution",
			style : "width : 300px",
			onShow : function() {
				
			}
		});
		on(InformZoom.okButton, "click", function(e){
			context.zoom(scale);
		});
		if(scale > 110 || scale < 90)
			InformZoom.show();
	}
	return  new zoomCorrection();	
});