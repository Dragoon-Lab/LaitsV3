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
	"dijit/registry"
	], function(registry)
	{
		//Summary: Contains display and logic for lessons learned functionality
		return{


			displayLessonsLearned: function(contentMessage)
			{
				var lessonLearnedDialog = registry.byId("lesson");
					var titleMsg  = "<font size='3'>Lessons Learned</font>";
					var contentHTML = "<font size='2'>" + contentMessage[0];
					for(var i=1;i<contentMessage.length;i++) {
						contentHTML = contentHTML +"<br>"+contentMessage[i];
					}
					contentHTML = contentHTML + "</font>";
					lessonLearnedDialog.set("content", contentHTML);
					lessonLearnedDialog.set("title", titleMsg);
					lessonLearnedDialog.set("style", "width:300px");
					lessonLearnedDialog.show();
			}
		};
	});