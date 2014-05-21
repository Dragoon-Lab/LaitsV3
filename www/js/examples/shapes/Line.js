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
//>>built
define("shapes/Line",["dojo/_base/declare","shapes/_Shape","shapes/_PathMixin"],function(_1,_2,_3){
return _1("shapes.Line",[_2,_3],{points:"0,0,100,0",startarrow:"none",endarrow:"none",buildRendering:function(){
this.inherited(arguments);
var _4=[0,0,100,0];
var _5=this.points.replace(/,/g," ");
var _6=_5.split(" ");
if(_6.length<4){
console.error("invalid points array - at least 4 values required");
_6=_4;
}
this._points=[];
for(var i=0,j=0;i<(_6.length-1);i+=2,j++){
this._points[j]={x:_6[i]-0,y:_6[i+1]-0};
}
}});
});
