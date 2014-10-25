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
	'dojo/_base/declare',
	"dojo/request/xhr", 
	"dojo/_base/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/number",
], function(declare, xhr, json, lang, array, number){
	return declare(null,{
		problems: null,
		//path:'',
		users: null,
		objects: null,
		timeSpent: [],
		errorRatio: [],
		problemComplete: [],
		sessionRunning: [],
		detailedNodeAnalysis: [],
		emptyArray: [],
		modules:{},
		//sessionDetails:[],
		decideModules: function(/* string */ type){
			switch(type){
				case "leader":
					this.modules = {
						names : false, // show user name with each row
						display : "errors", // what values to show in the table, all will show empty boxes by default the all the options at the bottom of the page and will 
						options : false, //allowed to change the values from the bottom of the page
						heading : "Leader Board", // heading at the top of the page
						subHeading : "Each cell shows your proportion of correct selections in the node editor. Each time you get a red or yellow box, it goes down. (Remember, however, that homework does not affect your grade--only the in-class quizzes.)  Your cells have red borders and bold numbers. Refresh page to update.", // sub heading, van be used for instructions on the page. can be an HTML string as well.
						colors : true, // shows the key at the right of the page and the session running value under the td of the 
						sessionLink : false, // to add the user session opening link to each td or not.
						completeAnalysis : false // to add the detail node analysis to the tableString 
	 				};
	 				break;
	 			case "complete":
	 				this.modules = {
	 					names: true,
	 					display: "empty",
	 					options: true,
	 					heading: "Dashboard",
	 					subHeading: "Click on the box to show the complete session details of the user.",
	 					colors: true,
	 					sessionLink: false,
	 					completeAnalysis : true,
	 				};
	 				break;
	 			case "dash":
	 			default:
	 				this.modules = {
	 					names: true,
	 					display: "empty",
	 					options: true,
	 					heading: "Dashboard",
	 					subHeading: "Click on the box to check the complete session of the student.",
	 					colors: true,
	 					sessionLink: true,
	 					completeAnalysis : false,
	 				};
	 				break;
			}
		},

		constructor: function(/*json*/ params, /*string*/ path){
			//this.runtime = params['runtime']||true;
			this.path = path||"";
			this.section = params['s'];
			this.decideModules(params['t']);
			this.currentUser = params['us'];
			this.mode = params['m'];
		},

		init: function(){
			this.users = this.getAllUsers();
			this.problems = this.getAllProblems();
			
			//initializing the arrays to be exact size as this will lead exact size of the table while rendering.
			var totalUsers = this.users.length;
			var totalProblems = this.problems.length;
			for(var i = 0; i<totalUsers; i++){
				this.timeSpent[i] = [];
				this.errorRatio[i] = [];
				this.problemComplete[i] = [];
				this.sessionRunning[i] = [];
				this.detailedNodeAnalysis[i] = [];
				this.emptyArray[i] = [];
				//this.sessionDetails[i] = [];
				for(var j = 0; j<totalProblems; j++){
					this.timeSpent[i][j] = "-";
					this.errorRatio[i][j] = "-";
					this.problemComplete[i][j] = false;
					this.sessionRunning[i][j] = false;
					this.detailedNodeAnalysis[i][j] = "-";
					this.emptyArray[i][j] = " ";
					//this.sessionDetails[i][j] = " ";
				}
			}
			this.getRenderingData();
		},

		getResults: function(/*json*/ params){
			return xhr.get(this.path + "dashboard_js.php", {
				query: params
			}).then(function(results){	 // this makes loadProblem blocking?
				console.log("task objects found in the logs : ", results);
				return results;
			}, function(err){
				console.error("error in dashboard_js, error message : " + err);
				throw err;
			});
		},

		getAllUsers: function(){
			var index = 0;
			var users = [];
			array.forEach(this.objects, function(upObject){
				var user = upObject.user;
				if(index>0 && users[index-1] != user){
					users.push(user);
					index++;
				} else if(index == 0){
					users.push(user);
					index++;
				}
			});
			return users;
		},

		getAllProblems: function(){
			var problems = [];
			/*var promise = this.getFile("problem.txt");
			promise.then(function(){
				//this is for progress

			}, function(problemOrder){
				array.forEach(problemOrder, function(problem){
					problems.push(problem);
				});
			}, function(){*/
				array.forEach(this.objects, function(object){
					if(problems.length > 0){
						var problemExist = array.some(problems, function(problem){
							return object['problem'] == problem;
						});
						if(!problemExist){
							problems.push(object['problem']);
						}
					} else {
						problems.push(object['problem']);
					}
				}, this);
			//});
			return problems;
		},

		getFile: function(fileName){
			xhr.get(this.path + fileName, {
				handleAs : "json",
				load: function(object){
					return object;
				},
				error: function(err){
					console.log("problemOrder txt returned with error, message : "+err);
					throw err;
				}
			});
		},

		//convert json to rendering format and show it as meaningful data
		getRenderingData: function(){
			array.forEach(this.objects, function(upObject){
				var userIndex = array.indexOf(this.users, upObject['user']);
				var problemIndex = array.indexOf(this.problems, upObject['problem']);
				if(userIndex >= 0 && problemIndex >= 0){
					this.timeSpent[userIndex][problemIndex] = (number.round(upObject['totalTime']*10))/10+ " - " + (number.round(upObject['outOfFocusTime']*10))/10;
                    var errorRatioText = "Blank";
                    var errorRatioNumber = (100-((parseFloat(upObject['incorrectChecks'])/parseFloat(upObject['totalSolutionChecks']))*100));
                    if (!isNaN(errorRatioNumber)){
                        errorRatioText = errorRatioNumber.toFixed(1)+"%";
                    }
					this.errorRatio[userIndex][problemIndex] = errorRatioText;
					this.problemComplete[userIndex][problemIndex] = upObject['problemComplete'];
					this.sessionRunning[userIndex][problemIndex] = upObject['sessionRunning'];
					//this.sessionDetails[userIndex][problemIndex] = {user : upObject['user'], problem: upObject['problem'], section: this.section};
					if(this.modules['completeAnalysis']){
						var detailedString = '';
						var nodes = upObject['nodes']; 
						if(nodes){
							array.forEach(nodes, function(node){
								detailedString += "<p>"+node['name'];
								var properties = node['properties'];
								if(properties){
									array.forEach(properties, function(property){
										if(property){
											var status = property['status'];
											if(status){
												var index = 0;
												array.forEach(status, function(propStatus){
													if(propStatus == "CORRECT"){
													detailedString += "<span style='color:green'>C ("+property['correctValue']+") </span>";
													} else if(propStatus == "DEMO"){
														detailedString += "<span style='color:blue'>D </span>";
													} else {
														var answers = property['answers'];
														var length = answers.length;
														detailedString += "<span style='color:red'>I" ;
														if(index < length){
															detailedString += "( "+answers[index]+ " )";
														}
														detailedString += " </span>";
														index++;
													}	
												});
											}
										}
									}, this);
								}
								detailedString += "</p>";
							}, this);
							this.detailedNodeAnalysis[userIndex][problemIndex] = detailedString;
						}
					}
				}
			}, this);
		},

		initTable: function(){
			var tableString = "<table border='1'>";
			var problems = this.getAllProblems();
			if(this.modules['names'])
				tableString += "<th>Users \/ Problems -></th>";
			array.forEach(problems, function(problem){
				tableString += "<th>" + problem + "</th>";
			});
			return tableString;
		},

		makeTable: function(/* two dimensional array of Strings */ printArray){
			var tableString = '';
			var row = 0;
			array.forEach(this.users, function(user){

				if(this.modules['names']){ 
						tableString += "<tr><td>"+user+"</td>";
				}else{
					if(this.currentUser == user)
						tableString += "<tr class = 'light-blue'>";
					else
						tableString += "<tr>";
				}

					
				//var problemDetails = printArray[row];
				var col = 0;
				array.forEach(this.problems, function(problem){
					//var urlString = "<a href='/devel/index.html?u=" + user + "&m=" + this.mode + "&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&l=false' target='_blank' title='Click to check session' style='width:90px'>";
					//for demo server
					var urlString = '';
					if(this.modules['sessionLink'])
						urlString = "<a href='/demo/index.html?u=" + user + "&m=" + this.mode + "&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&l=false' target='_blank' title='Click to check session'>";
					//for local server
					//var urlString = "<a href='/code/index.html?u=" + user + "&m=" + this.mode + "&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&l=false' target='_blank' title='Click to check session'>";
					var complete = this.problemComplete[row][col];
					var runningStatus = this.sessionRunning[row][col];
					tableString += "<td";
					if(this.modules['colors']){
						if(complete){
							tableString += " class='green'";
						} else if(!complete && runningStatus){
							tableString += " class='yellow'";
						}
					}
					tableString += ">";
					tableString += "<span class='empty all'>" + this.emptyArray[row][col] + "</span>";
					tableString += "<span class='time all'>";
					if(this.modules['sessionLink'] && this.timeSpent[row][col] != '-'){
						tableString += urlString;
					}
					tableString += this.timeSpent[row][col]; 
					if(this.modules['sessionLink'] && this.timeSpent[row][col] != '-'){
						tableString += "</a>";
					}
					tableString += "</span>";
					

					tableString += "<span class='errors all'>"; 
					if(this.modules['sessionLink'] && this.errorRatio[row][col] != "-"){
						tableString += urlString;
					}
					tableString += this.errorRatio[row][col];
					if(this.modules['sessionLink'] && this.errorRatio[row][col] != "-"){
						tableString += "</a>";
					}
					tableString +=  "</span>";
					if(this.modules['completeAnalysis']){
						tableString += "<div class='nodeDetails' style='display:none;'>"+this.detailedNodeAnalysis[row][col]+"</div>";
					}
					tableString += "</td>";
					col++;
				}, this);
				tableString += "</tr>";
				row++;
			}, this);
			return tableString;

		},

		closeTable: function(){
			var tableString = "</table>";
			return tableString;
		},

		renderTable: function(){
			var table = this.initTable();
			table += this.makeTable();
			table += this.closeTable();

			return table;
		}
	});
});
