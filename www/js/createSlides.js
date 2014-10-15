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
 *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *GNU Lesser General Public License for more details.
 *
 *You should have received a copy of the GNU Lesser General Public License
 *along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
 *
*/

/* global define */

define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/dom",
	"dojo/dom-style",
	"dijit/registry",
	"dojo/html",
	"./model"
], function(declare, array, dom, style, registry, html, model){
	return declare(null, {
		_slides: null,
		_model: null,
		constructor: function(model){
			this._model = model;
			if(this._model.model.task.slides){
				this._slides = this._model.getSlides();
			}
		},

		makeAllSlides:function(){
			var sString = '';
			var index = 1;
			var size = this._slides.length;
			array.forEach(this._slides, function(slide){
				var slideType = slide['type'];
				if(index == 1){
					sString += "<div id='1'>";
				} else if(index == size){
					sString += "<div id='"+size+"'>";
				} else {
					sString += "<div id='"+index+"'>";
				}

				if(slideType == "text"){
					if(slide.value == "count"){
						sString += this.makeCountNodeSlide(slide.title)
					} else if(slide.value == "lessons"){
						sString += this.makeLessonSlide(slide.title)
					}
				} else if(slideType == "image"){
					sString += this.makeImageSlide(slide.value, slide.title);
				} else if(slide.value == "html"){
					sString += this.makeHTMLSlide(slide.value, slide.title);
				}
				sString += "</div>";
				index++;
			}, this);

			return sString;
		},

		makeCountNodeSlide: function(title){
			var typeCount = this._model.given.getNodeTypeCount();
			slideString = "<h4>"+title+"</h4><br/><ul><span>This model requires: </span><li> "+typeCount.accumulator+" accumulator nodes </li><li>" + typeCount['function'] + " function nodes </li><li>"+ typeCount['parameter'] + " parameter nodes </li></ul>";

			return slideString;
		},
		
		makeLessonSlide: function(title){
			var lessons = this._model.getTaskLessonsLearned();
			var slideString = "<h4>"+title+"</h4>";
			if(lessons){
				slideString += "<ul>";
				array.forEach(lessons, function(lesson){
					slideString += "<li>"+lesson+"</li>";
				}, this);
				slideString+= "</ul>";
			}

			return slideString;
		},

		makeHTMLSlide: function(/* string */ htmlValue, title){
			var htmlString = "<h4>"+title+"</h4><br/><span>"+htmlValue+"</span>";

			return htmlString;
		},

		makeImageSlide: function(/* string */ path, title){
			var imageString = "<h4>"+title+"</h4><img src= '"+path+"' title="+title+"/>";

			return imageString;
		},

		show: function(){
			var slides = this.makeAllSlides();

			var slidesDOM = dom.byId("slideWrapper");	
			html.set(slidesDOM, slides);
			var slidesDOM = registry.byId("slidesBox");
			
			slidesDOM.show();

			var size = this._slides.length;
			for(var i= 2; i <= size; i++){
				var id = i.toString();
				var slideDOM = dom.byId(id);
				style.set(slideDOM, "display", "none");
			}
			var first = dom.byId("1");
			var value = 1;
			
			registry.byId("prevSlide").set("value", value-1);
			registry.byId("nextSlide").set("value", value+1);
			style.set(first, "display", "block");
		}
	});
});
