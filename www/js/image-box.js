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

/*global define*/

define([
	"dojo/dom",
	"dojo/ready",
	"dojo/mouse",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/registry",
	"dojo/on"
], function(dom, ready, mouse, domConstruct, domClass, domStyle, registry, on){
	
	var ImageControl = function(url, Model){		
		
		
		this.model =  Model;
		this.mainImage = "myCanvas";
		this.imageNode = null;
		this.imageId = "markImageCanvas";
		this.url = null;
		this.scalingFactor = 1;
		if(url) {
			this.url = url;			
			var img = new Image();
			var context = this;
			img.onload = function(){
				context.scalingFactor = img.width > 300 ? 300 / img.width : 1.0;
				img.height = img.height * context.scalingFactor;
				img.width = img.width * context.scalingFactor;	
				context.imageNode = img;			
			}
			img.src = this.url;
						
				
		}
	
		// declare state variables
		this._mainImageTainted = false;
		this.canvasTopOffset = 0;
		this.canvasLeftOffset = 0;
		
	};  /* end of constructor */
	ImageControl.prototype.highlightArea = function(mappings){
		var context = this;
		/** need canvas context and imageNode to draw image over the canvas */
		
		setTimeout(function(){
			context.ctx.fillStyle = "rgba(0, 0, 0, 0.50)";
			context.ctx.beginPath();
			context.ctx.fillRect(context.canvasLeftOffset,context.canvasTopOffset, context.imageNode.width, context.imageNode.height);
			context.ctx.fill();
			mappings.every(function(ele, index, array){
				var cords = ele.split(',');				
				var reverseScaling = 1 / context.scalingFactor;
				context.ctx.drawImage(context.imageNode, parseInt(cords[0]) * reverseScaling, parseInt(cords[1]) * reverseScaling, parseInt(cords[2]) * reverseScaling, parseInt(cords[3]) * reverseScaling, parseInt(cords[0]) + context.canvasLeftOffset, parseInt(cords[1]) + context.canvasTopOffset, parseInt(cords[2]), parseInt(cords[3]));	
				return true;
			})	
		}, 0);		
	}
	// for the nodes from the last session
	ImageControl.prototype.initNodeMouseEvents = function(){
		var context = this;
		var givenNodes = this.model.active.getNodes();
		
		if(!givenNodes.length) return;
		givenNodes.every(function(ele, idx, array){
			console.log("adding mouse event for ", ele.ID);
			var target = document.getElementById(ele.ID);
			if(!target) return true;
 			target.addEventListener('mouseenter', function(event){
					
					if(context.imageMarked) return;
					var nodeId = event.srcElement["id"];					
					if(nodeId) context.markImage(nodeId);
					context.imageMarked = true;
			});
			target.addEventListener('mouseleave', function(event){
				if(!context.imageMarked) return;	
				context.clear();
				context.imageMarked = false;
			});
			return true;
		})
	}
	ImageControl.prototype.newNodeMouseEvents = function(vertex){
		var context = this;
		console.log("AddNode Called", vertex);
		var target = document.getElementById(vertex.ID);
		if(!target) return;
		target.addEventListener('mouseenter', function(event){

			if(context.imageMarked) return;
			var nodeId = event.srcElement["id"];
			if(nodeId) this.markImage(nodeId);
			context.imageMarked = true;
		});
		target.addEventListener('mouseleave', function(event){
			if(!context.imageMarked) return;
			this.clear();
			context.imageMarked = false;
		});
	}
	ImageControl.prototype.initMarkImageDialog = function(controllerObj){
		// this function is called every time author click on Image Highlighting
		
		
		var c = this; 
		var canvasEle = document.getElementById(c.imageId);
		
		c.controller = controllerObj;
		//updating the size of the canvas with respect to dimensions of image		
		canvasEle.width = c.imageNode.width;
		canvasEle.height = c.imageNode.height;
		c.ctx = canvasEle.getContext("2d");
		
		//adding image to the canvas
		registry.byId('markImageClear').set('disabled', true);
		setTimeout(function(){		
			c.ctx.drawImage(c.imageNode, 0,0, c.imageNode.width, c.imageNode.height);	
		}, 0)

		
		// adding hover mouse coordinates
		var tooltip = null;
		var context = this;
		//console.log(registry.byId(this.imageId), document.getElementById(this.imageId), dom.byId(this.imageId));
		on(dom.byId(this.imageId), mouse.enter, function(event){
			event.preventDefault();
			domConstruct.empty(this);
			tooltip = domConstruct.create("p", null, dom.byId(this));
			domClass.add(tooltip, "tooltip");			
		});
		on(dom.byId(this.imageId) , mouse.leave, function(event){
			event.preventDefault();
			//domConstruct.destroy(tooltip);
		});
		on(dom.byId(this.imageId), "mousemove" , function(event){
			event.preventDefault();
			
			var mousex = event.clientX;
			var mousey = event.clientY;
			
			tooltip.innerHTML = event.offsetX + ", " + event.offsetY;
			domStyle.set( tooltip, { top : mousey + 10 , left : mousex + 10, display: "inline" });
		});
		on(dom.byId(this.imageId), "mousedown", function(event){
			event.preventDefault();
			if(context.selected) return;
			context.mouseDown = true;
			context.startX = event.offsetX; context.startY = event.offsetY; 
			
		});
		on(dom.byId(this.imageId), "mouseup", function(event){
			event.preventDefault();
			if(context.selected) return;
			context.mouseUp = true;
			if(context.mouseDown && context.mouseUp) {
				context.selected = true;
				context.selectedWidth = event.offsetX - context.startX;
				context.selectedHeight = event.offsetY - context.startY;
				console.log("selected",context.startX, context.startY, context.selectedWidth, context.selectedHeight);
			
				var mapping = [context.startX.toString() + "," + context.startY + "," + context.selectedWidth + "," + context.selectedHeight]
				context.highlightArea(mapping);
				var offFocusHandler = function(event){
					event.preventDefault();
					var node = document.getElementById(context.imageId);
				
					if( !(event.clientX > node.offsetLeft && event.clientY > node.offsetTop  &&  event.clientX < ( node.offsetLeft + context.width) && event.clientY < ( node.offsetTop + context.height))) {
						
						setTimeout(function(){
								
						}, 0);
							
					}
					document.removeEventListener('click', offFocusHandler);
				}
				// we can use aspect oriented programming code to remove the click handler
				document.addEventListener('click',offFocusHandler);
			}
			registry.byId('newMark').set('value', context.startX + " , " +context.startY + " , " + context.selectedWidth + " , " + context.selectedHeight);
			registry.byId('markImageClear').set('disabled', false);
			this.mouseUp = false;
			this.mouseDown = false;
		});
	},
	ImageControl.prototype.markImage = function(/**string */ nodeId){
		
		// check if there is no image in the model
		if(!this.model.getImageURL()) return;
		// if there is a image in the model and yet not initialized in the Image Box
		if(!this.url) {
			this.url = this.model.getImageURL();			
			var img = new Image();
			img.src = this.url;
			this.scalingFactor = img.width > 300 ? 300 / img.width : 1.0;
			img.height = img.height * this.scalingFactor;
			img.width = img.width * this.scalingFactor;
			this.imageNode = img;	
		}
		// set main image tainted with marks
		var context = this;
		this.canvasTopOffset = 20;
		this.canvasLeftOffset = 30;
		this.ctx = document.getElementById(this.mainImage).getContext("2d");
	
		// if the mode is not author mode, fetch corrosponding DescriptionId to get the markings
		if(context.model.active.getDescriptionID) nodeId = context.model.active.getDescriptionID(nodeId);
		
		if(!nodeId) return;
		var mappings = this.model.active.getImageMarks(nodeId);
		//console.log("Mappings loaded for the node:", nodeId, mappings);
		if(!mappings || mappings.length < 1) return;
		this.highlightArea(mappings);
		context._mainImageTainted = true;
		
	},
	ImageControl.prototype.addMark = function(){
		//add the map to the db
		//add the click control
		var markVal = registry.byId('newMark').get("value");
		// validate the val of mark
		if(markVal == "") return;
		var mark = {}
		mark.value = markVal;
		mark.label = markVal;
		mark.selected = false;
		console.log(mark);
		registry.byId('savedMark').addOption(mark);
		this.clear();
		registry.byId('markImageClear').set('disabled', true);
		
	} 
	ImageControl.prototype.clear = function(){
		if(!this.model.getImageURL()) return; 
		
		var context = this;
		if(!context.ctx) context.ctx = document.getElementById(this.imageId).getContext("2d");
		if(context._mainImageTainted) {
			// code to clear the main image
			
			setTimeout(function(){
				context.ctx.fillStyle = 'rgba(255, 0, 0, 0.0)';
				context.ctx.fillRect(context.canvasLeftOffset,context.canvasTopOffset, context.imageNode.width, context.imageNode.height);
				context.ctx.drawImage(context.imageNode,context.canvasLeftOffset,context.canvasTopOffset, context.imageNode.width, context.imageNode.height);
				//context.showGrid(context.allowGrid);
			});
			context._mainImageTainted = false;
		}
		else {
			context.mouseDown = false;
			context.mouseUp = false;
			context.selected = false;
			
			setTimeout(function(){
				context.ctx.fillStyle = 'rgba(255, 0, 0, 0.0)';
				context.ctx.fillRect(context.canvasLeftOffset,context.canvasTopOffset, context.imageNode.width, context.imageNode.height);
				context.ctx.drawImage(context.imageNode,context.canvasLeftOffset,context.canvasTopOffset, context.imageNode.width, context.imageNode.height);
				//context.showGrid(context.allowGrid);
			});
			registry.byId('newMark').set('value', '');	
		}
	
	}
	ImageControl.prototype.showGrid = function(val){
		this.allowGrid = val;
		if(val ==  true) {
			// adding gridlines to the control:
		
			for (var x = 0.5; x < this.imageNode.width; x += 10) {
			  this.ctx.moveTo(x, 0);
			  this.ctx.lineTo(x, this.imageNode.height);
			}
			for (var y = 0.5; y < this.imageNode.height; y += 10) {
			  this.ctx.moveTo(0, y);
			  this.ctx.lineTo(this.imageNode.width, y);
			}
			this.ctx.strokeStyle = "#eee";
			this.ctx.stroke();	
		}
		else {
			this.ctx.clearRect(0, 0, this.imageNode.width, this.imageNode.height);
			this.ctx.drawImage(this.imageNode, 0,0);
		}
		
	}
	ImageControl.prototype.saveMarks = function(){
		var marks = [];
		for(var m = 0; m < registry.byId('savedMark').options.length ; m++)
			marks.push(registry.byId('savedMark').options[m].label)
		//save the marks to model	
		console.log(marks);
		this.model.active.setImageMarks(this.controller.currentID, marks);	
	}
	ImageControl.prototype.removeMap = function(){
		var selected = registry.byId('savedMark').get('value');
		if(!selected) return;
		console.log(selected, "removed");
		registry.byId('savedMark').removeOption(selected);
		
	}
	ImageControl.prototype.updateImage = function(url){
		
		var context = this;
		context.url = null;
		context.imageNode = null;
				
		var img = new Image();
		img.onload = function(){
		
			context.scalingFactor = img.width > 300 ? 300 / img.width : 1.0;
			img.height = img.height * context.scalingFactor;
			img.width = img.width * context.scalingFactor;			
			context.imageNode = img;	
			context.url = url;
		}
		img.src = url;
		
		
	}

	return ImageControl;
});
