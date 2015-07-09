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
 // this configuration describe parameters that define UI parameters of dragoon
 define(["dojo/_base/lang"], function(lang){
	 return function() {
		 // specific parameters that apply for modes and activity grid  
		 var parameters = {
			 construction : [
				{
					"mode" : ["AUTHOR", "STUDENT", "COACHED" , "TEST"] ,
					"param" : { 
						"showColor" : true,
						"nodeBorderSize" : "3px ",
						"createNodeButton" : "hidden",
						"graphButton" : "hidden",
						"tableButton" : "hidden",
						"forumButton" : "hidden",
						"schemaButton" : "hidden",
						"descButton" : "hidden",
						"saveButton" : "hidden",
						"mergeButton" : "hidden",
						"previewButton" : "hidden",
						"slidesButton" : "hidden",
						"nodeBorderCompleteColor" : "gray",
						"nodeBorderCompleteStyle" : "solid ",
						"nodeBorderInCompleteStyle" : "dashed ",
						"nodeBorderSuccessColor" : "green",
						"nodeBorderFeedbackColor" : "yellow",
						"nodeBorderFailColor" : "red",
						
					}
				},
				{ 	"mode" : ["AUTHOR"] ,
					"param" : {
						"createNodeButton" : "visible",
						"graphButton" : "visible",
						"tableButton" : "visible",
						"forumButton" : "visible",
						"schemaButton" : "visible",
						"descButton" : "visible",
						"saveButton" : "visible",
						"mergeButton" : "visible",
						"previewButton" : "visible",
						"slidesButton" : "visible"
						
					}
				},
				{
					"mode" : ["STUDENT", "COACHED" , "TEST"] ,
					"param" : {
						"createNodeButton" : "visible",
						"graphButton" : "visible",
						"tableButton" : "visible",
						"forumButton" : "visible",
						"slidesButton" : "visible"
				
					}
				},
				{
					"mode" : ["TEST", "EDITOR"] ,
					"param" : {
						"showColor" : false
					}
				}
				
			 ],
			 execution : [],
			 "automated_execution" : [],
			 upanddown : [],
			 "automated_upanddown" : []			 
		 };

		 var config = {
			 _mode : null,
			 _activity : null,
			 _params : {
				 	
			 },
			 constructor : function(/* string */ mode, /* string */ activity){
				this._mode = mode;
				this._activity = activity;
				 // iterate through all object in the activity and merge all params for given mode:
				//console.log("In constructor", this._mode, this._activity);
				for(var idx in parameters[this._activity]){
					var obj = parameters[this._activity][idx];
					if(obj.mode.indexOf(this._mode) > -1) this._params = lang.mixin(this._params , obj.param);	
				}	 
			 },
			 
			 //operations available throught the config api
			 get : function(/*string*/ name){
				var result = null;
				
				(typeof this._params[name] != "undefined") ? result =  this._params[name] : result = undefined;
			 	return result;
			 },
			 getMode : function(/* string*/ mode){
				 return this._mode;
			 },
			 getActivity : function(/* string*/ activity){
				 return this._activity;
			 },
			 //returns object containing all(general and specific) config parameters for the given mode and activity
			 getAllParameters : function(){
				 return this._params;
			 }
		 };
		
		 config.constructor.apply(config, arguments);
		
		 return config;
	 }
 });