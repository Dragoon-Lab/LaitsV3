/*
     Dragoon Project
     Arizona State University
     (c) 2014, Arizona Board of Regents for and on behalf of Arizona State University
     
     This file is a part of Dragoon
     Dragoon is free software: you can redistribute it and/or modify
     it under the terms of the GNU Lesser General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     (at your option) any later version.
     
     Dragoon is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU Lesser General Public License for more details.
     
     You should have received a copy of the GNU Lesser General Public License
     along with Dragoon.  If not, see <http://www.gnu.org/licenses/>.
*/
/* global define */
define([
	"dojo/io-query",
	"dojo/dom",
	"dojo/ready",
	"dojo/fx/Toggler", 
	"dojo/request/xhr", 
	"dojo/_base/lang",
	"dojo/json",
	"dojo/on",
	"dojo/_base/array",
	"dojo/dom-class",
	"dojo/query",
	"dojo/NodeList-dom",
	"dojo/html",
	"./dashboard"
	/* ../dashboard didn't work, and I want to include it in the new main, so I've just copied it verbatim for now :( */
], function(
	ioQuery, dom, ready, Toggler, xhr, lang, json, on, array, domClass, domQuery, nodeList, html, dashboard
){
    function makeTable(problem,mode,tableID) {
        try {
            var user = window.location.search.slice(1);
            var args = user+"&m="+mode+"&p=" + problem + "&s=tutor_cpi360&t=leader";

            /*var args = ;*/
            var query = query = ioQuery.queryToObject(args);
            var db = new dashboard(query);

            db.getResults(query).then(function (results) {
                db.objects = json.parse(results);

                ready(function () {
                    db.init();

                    var content = db.renderTable();

                    // show each modules as per the db.modules
                    // hide the waiting info
                    var waitDOM = dom.byId("wait");
                    domClass.add(waitDOM, "hidden");

                    //showing the heading
                    var headingDOM = dom.byId("heading");
                    html.set(headingDOM, db.modules['heading']);

                    //showing the subheading
                    var subHeadingDOM = dom.byId("sub-heading");
                    html.set(subHeadingDOM, db.modules['subHeading']);

                    // showing the color key based on the modules value
                    if (db.modules['colors']) {
                        var colorKeyDOM = dom.byId("key");
                        domClass.remove(colorKeyDOM, "hidden");
                        domClass.add(colorKeyDOM, "visible");
                    }

                    //add table structure string to the table div
                    var tableDOM = dom.byId(tableID);
                    html.set(tableDOM, content);

                    //showing or hinding the class type based on the db.modules.display
                    var allNodes = domQuery(".all");
                    allNodes.forEach(function (node) {
                        domClass.add(node, 'hidden');
                    });
                    var classString = "." + db.modules['display'];
                    var showNodes = domQuery(classString);
                    showNodes.forEach(function (node) {
                        domClass.toggle(node, "hidden");
                        domClass.add(node, "visible");
                    });

                    if (db.modules['options']) {
                        //add event catchers for each radio change.
                        var radioWidget = dom.byId("tableType");
                        domClass.remove(radioWidget, "hidden");
                        domClass.add(radioWidget, "visible");
                        on(radioWidget, "change", function () {
                            var tableType = '';
                            array.forEach(radioWidget.elements, function (element) {
                                if (element.checked) {
                                    tableType = element.value;
                                }
                            }, this);

                            allNodes.forEach(function (node) {
                                domClass.remove(node, 'visible');
                                domClass.add(node, 'hidden');
                            });

                            var classString = "." + tableType;
                            var showNodes = domQuery(classString);
                            showNodes.forEach(function (node) {
                                domClass.remove(node, 'hidden');
                                domClass.add(node, 'visible');
                            });
                        });
                    }
                });
            });
        }
        catch(err) {
            return;
        }
    };

    makeTable("CPI-2014-ps1-01","STUDENT","1-1");
    makeTable("CPI-2014-ps1-02","STUDENT","1-2");
    makeTable("CPI-2014-ps1-03","STUDENT","1-3");
    makeTable("CPI-2014-ps1-04","STUDENT","1-4");
    makeTable("CPI-2014-ps1-05","TEST","1-5");
    makeTable("CPI-2014-ps1-06","STUDENT","1-6");
    makeTable("CPI-2014-ps1-07","TEST","1-7");
    makeTable("CPI-2014-ps1-08","STUDENT","1-8");
    makeTable("CPI-2014-ps1-09","TEST","1-9");
    makeTable("CPI-2014-ps1-10","STUDENT","1-10");
    makeTable("CPI-2014-ps1-11","TEST","1-11");
    makeTable("CPI-2014-ps1-12","STUDENT","1-12");

    makeTable("CPI-2014-ps2-01","STUDENT","2-1");
    makeTable("CPI-2014-ps2-02","STUDENT","2-2");
    makeTable("CPI-2014-ps2-03","TEST","2-3");
    makeTable("CPI-2014-ps2-04","TEST","2-4");
    makeTable("CPI-2014-ps2-05","STUDENT","2-5");
    makeTable("CPI-2014-ps2-06","STUDENT","2-6");
    makeTable("CPI-2014-ps2-07","TEST","2-7");
    makeTable("CPI-2014-ps2-08","TEST","2-8");
    makeTable("CPI-2014-ps2-09","STUDENT","2-9");

    makeTable("CPI-2014-ps3-01","COACHED","3-1");
    makeTable("CPI-2014-ps3-02","COACHED","3-2");
    makeTable("CPI-2014-ps3-03","COACHED","3-3");
    makeTable("CPI-2014-ps3-04","COACHED","3-4");
    makeTable("CPI-2014-ps3-05","COACHED","3-5");
    makeTable("CPI-2014-ps3-06","COACHED","3-6");
    makeTable("CPI-2014-ps3-07","COACHED","3-7");
    makeTable("CPI-2014-ps3-08","COACHED","3-8");

    makeTable("CPI-2014-ps4-01","TEST","4-1");
    makeTable("CPI-2014-ps4-02","COACHED","4-2");
    makeTable("CPI-2014-ps4-03","STUDENT","4-3");
    makeTable("CPI-2014-ps4-04","STUDENT","4-4");
    makeTable("CPI-2014-ps4-05","STUDENT","4-5");
    makeTable("CPI-2014-ps4-06","COACHED","4-6");

    makeTable("CPI-2014-ps5-01","TEST","5-1");
    makeTable("CPI-2014-ps5-02","TEST","5-2");
    makeTable("CPI-2014-ps5-03","TEST","5-3");
    makeTable("CPI-2014-ps5-04","STUDENT","5-4");
    makeTable("CPI-2014-ps5-05","STUDENT","5-5");
    makeTable("CPI-2014-ps5-06","TEST","5-6");

});
