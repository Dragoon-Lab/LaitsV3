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
	"dijit/registry",
	"dojo/on",
	"dojo/dom-style"
], function(dom, ready, registry, on, style){
	var widget = function(){
		this.tutorialShown = null;
		this.slides = [
			{
				"title" : "Dragoon",
				"url" : "images/ss_tutorial1.png",
				"content" : "Dragoon is a system for creating models of dynamic systems. " +
				" The system being modeled is described on the left side of the screen."
			},
			{
				"title" : "Analysis of the model",
				"url" : "images/ss_tutorial2.gif",
				"content" : "You will use Dragoon to build models that calculate graphs and tables of system quantities. " +
				" Note how the graphs change instantly as you manipulate the sliders."
			},
			{
				"title" : "How it Works",
				"url" : "images/ss_tutorial4.png",
				"content" : "A Dragoon model looks like this. " +
				" The circles, diamonds and squares are called nodes, and represent quantities.  " +
				"  A diamond corresponds to a quantity whose value is constant but you can control" +
				" it with a slider on the graph window.  A circle or square is a quantity whose value is a" +
				" mathematical function of its inputs.  The incoming arrows show you which nodes are its inputs." +
				"  When you click on a node, you can see its details (and in some activities, edit them)."
			},
			{
				"title" : "For more information",
				"url" : "images/ss_tutorial5.png",
				"content" : "You can go to help menu to learn more."
			}];

		this.next = registry.byId("tutorialNext");
		this.prev = registry.byId("tutorialPrev");
		this.show = registry.byId("tutorialShow");
		this.dialog = registry.byId("tutorialBox");
		// intialize all the handlers
		var context  = this;
		on(this.next, "click", function(){
			context.moveNext();
		});
		on(this.prev, "click", function(){
			context.movePrev();
		});
		on(this.show, "click", function(){
			registry.byId("tutorialBox").hide();
			// "newwindow": the pop-out window name, not required, could be empty
			// "height" and "width": pop-out window size
			// Other properties could be changed as the value of yes or no
			window.open("DragoonConcepts.html","newwindow",
				"height=400, width=600, toolbar =no, menubar=no, scrollbars=yes, resizable=no, location=no, status=no"
			);
		});
		//dom.byId("tutorialImage1").src = this.slides[0].url;
		//dom.byId("tutorialImage2").src = this.slides[1].url;
		//dom.byId("tutorialImage3").src = this.slides[2].url;
	}
	widget.prototype.begin = function(c){
		this.callback = c;
		this.currentSlide = 0;
		this.next.set("disabled", false);
		this.prev.set("disabled", true);
		style.set(this.next.domNode, "display", "inline-block");
		style.set(this.show.domNode, "display", "none");
		var s  = this.slides[0];
		var context = this;
		on(dom.byId("tutorialImage"), "load", function(){
			context.dialog.set("title", "Quick Intro to Dragoon (page 1/4)");
			dom.byId("tutorialContent").innerHTML =  s.content;	
		});
		dom.byId("tutorialImage").src = s.url;
		registry.byId("tutorialBox").show();
	}
	widget.prototype.moveNext  = function(){
		var nextIdx = (this.currentSlide + 1) % this.slides.length;
		var s  = this.slides[nextIdx];
		var context = this;
		on(dom.byId("tutorialImage"), "load", function(event){
			context.dialog.set("title", "Quick Intro to Dragoon (page " + (nextIdx + 1) + "/4)");
			dom.byId("tutorialContent").innerHTML = s.content;
		});
		dom.byId("tutorialImage").src = s.url;
		
		this.prev.set("disabled", false);
		if(nextIdx == 3) {
			//this.next.set("disabled", true);
			style.set(this.next.domNode, "display", "none");
			style.set(this.show.domNode, "display", "inline-block");
			if(!this.tutorialShown) 
				this.callback();
		}
		this.currentSlide++;
	}
	widget.prototype.movePrev = function(){
		var prevIdx = (this.currentSlide -1) % this.slides.length;
		var s  = this.slides[prevIdx];
		var context = this;
		on(dom.byId("tutorialImage"), "load", function(event){
			context.dialog.set("title", "Quick Intro to Dragoon (page " + (prevIdx + 1) + "/4)");
			dom.byId("tutorialContent").innerHTML = s.content;
		});
		dom.byId("tutorialImage").src = s.url;
		style.set(this.next.domNode, "display", "inline-block");
		style.set(this.show.domNode, "display", "none");
		if(prevIdx == 0) {
			registry.byId("tutorialPrev").set("disabled", true);
			
		}
		this.currentSlide--;
	}
	widget.prototype.setState = function(){
		this.tutorialShown = false;
	}
	widget.prototype.avoidTutorial = function(query){
		if(window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1" || query.l == "false")
			return true;
		if(query.s && query.s == "regression-testing")
			return true;
		return false;	
	}
	return widget;
});
