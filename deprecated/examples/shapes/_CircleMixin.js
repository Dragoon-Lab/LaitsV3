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
/*
	Copyright (c) 2004-2012, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

//>>built
define("shapes/_CircleMixin",["../../../www/dojo/_base/declare","dojo/dom-style"],function(_1,_2){
return _1("shapes._CircleMixin",[],{postCreate:function(){
this._updateBorderRadius();
},resize:function(){
this._updateBorderRadius();
},_updateBorderRadius:function(){
var _3=this.domNode;
var bw,rx,ry;
var _4=_2.get(_3,"borderWidth");
if(_4){
bw=parseFloat(_4);
}
var w=_3.offsetWidth;
var h=_3.offsetHeight;
if(isNaN(bw)||bw<0||w<=0||h<=0){
_3.style.borderTopLeftRadius="";
_3.style.borderTopRightRadius="";
_3.style.borderBottomLeftRadius="";
_3.style.borderBottomRightRadius="";
}else{
var rx=(w/2+bw)+"px";
var ry=(h/2+bw)+"px";
var _5=rx+" "+ry;
_3.style.borderTopLeftRadius=_5;
_3.style.borderTopRightRadius=_5;
_3.style.borderBottomLeftRadius=_5;
_3.style.borderBottomRightRadius=_5;
}
}});
});
