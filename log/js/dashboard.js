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
	"dojo/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/number"
], function(declare, xhr, json, lang, array, number){
	return declare(null,{
		problems: null,
		//path:'',
		users: null,
		objects: null,
		totalTimeSpent: [],
		totalProblemsCompleted: [],
		totalProblemsStarted: [],
		problemRevisits:[],
		nodesAttempted: [],
		timeSpent: [],
		errorRatio: [],
		problemComplete: [],
		sessionRunning: [],
		detailedNodeAnalysis: [],
		emptyArray: [],
		mode: [],
		modules:{},
		query:{}, // added if we want to send multiple queries. moving the query from main function to the global init. this init can be called again for each new function and then new table can be created. 
		problemNames: [],
		//sessionDetails:[],
		decideModules: function(/* string */ type){
			var returnModule;
			this.getModules().then(function(results){
				var obj = json.parse(results);
				array.forEach(obj.modules, function(module){
					if(module.tName == type)
						returnModule = lang.clone(module);
				}, this);
			});
			return returnModule;
		},

		getModules: function(){
			return xhr.get(this.path +"js/modules.json", {
				handleAs: "text",
				sync: true
			}).then(function(results){
				console.log("modules loaded ");
				return results;
			}, function(err){
				console.error("modules could not be loaded");
			});
		},

		constructor: function(/*json*/ params, /*string*/ path){
			//this.runtime = params['runtime']||true;
			this.path = path||"";
			var t = params['t']||"default";
			this.modules = this.decideModules(t);
			this.section = params['s']||this.modules.qObject.s;
			this.currentUser = params['us'];
			//this.mode = params['m'];
			if(this.modules.query == 'custom')
				this.query = this.modules.qObject;
			else 
				this.query = params;
			this.separatingSymbol = " - ";
		},

		init: function(){
			this.setObjects();
			this.users = this.getAllUsers();
			this.problems = this.getAllProblems();
			this.problemNames = this.getProblemNames();
			
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
				this.problemRevisits[i] = [];
				this.nodesAttempted[i] = [];
				this.mode[i] = [];
				this.totalProblemsStarted[i] = 0;
				this.totalProblemsCompleted[i] = 0;
				this.totalTimeSpent[i] = 0;
				//this.sessionDetails[i] = [];
				for(var j = 0; j<totalProblems; j++){
					this.timeSpent[i][j] = "-";
					this.errorRatio[i][j] = "-";
					this.problemComplete[i][j] = false;
					this.sessionRunning[i][j] = false;
					this.detailedNodeAnalysis[i][j] = "-";
					this.emptyArray[i][j] = " ";
					this.problemRevisits[i][j] = "-";
					this.mode[i][j] = "-"; //added because for the cases when the mode might not be same
					this.nodesAttempted[i][j] = 0;
					//this.sessionDetails[i][j] = " ";
				}
			}
			this.getRenderingData();
		},

		getResults: function(/*json*/ params){
			return xhr.get(this.path + "dashboard_js.php", {
				query: params,
				sync: true
			}).then(function(results){	 // this makes loadProblem blocking?
				console.log("task objects found in the logs");
				return results;
			}, function(err){
				console.error("error in dashboard_js, error message : " + err);
				throw err;
			});
		},

		setObjects: function(){
			var obj;
			this.getResults(this.query).then(function(results){
				obj = json.parse(results);
			});
			this.objects = obj;
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
					var pa = this.getProblemActivityName(object['problem'], object['activity']);
					if(problems.length > 0){
						var problemExist = array.some(problems, function(problem){
							return pa == problem;
						});
						if(!problemExist){
							problems.push(pa);
						}
					} else {
						problems.push(pa);
					}
				}, this);
			//});
			return problems;
		},
		
		getProblemNames: function(){
			var allProblems;
			var names = [];
			this.getFile("../problems/problem-index.json").then(function(result){
				allProblems = result;
			});
			allProblems = json.parse(allProblems);

			var index = 0;
			array.forEach(this.problems, function(problem){
				var temp;
				var activity = "";
				if(problem.indexOf(this.separatingSymbol) >= 0){
					temp = problem.split(this.separatingSymbol);
					activity = temp[1];
					problem = temp[0];
				}

				var breakOut = false;
				for(var p in allProblems){
					var obj = allProblems[p];
					if(obj[problem]){
						names[index] = this.getProblemActivityName(obj[problem], this.getActivityName(activity));
						breakOut = true;
						break;
					}
				}

				if(!breakOut){
					names[index] = this.getProblemActivityName(problem, this.getActivityName(activity));
				}
				index++;
			}, this);

			return names;
		},

		getProblemActivityName: function(problem, activity){
			return activity != "" ? (problem + this.separatingSymbol + activity) : problem;
		},

		getActivityName: function(activity){
			var activityNames = {
				"incremental": "Tweak Exercise",
				"incrementalDemo": "Tweak Demo",
				"execution": "Execution Exercise",
				"executionDemo": "Execution Demo"
			};

			return (activityNames.hasOwnProperty(activity)?activityNames[activity]:"");
		},

		getFile: function(fileName){
			return xhr.post(this.path + fileName, {
				handleAs : "text",
				sync: true
			}).then(function(results){
				console.log("data received from file : ", fileName);
				return results;
			}, function(err){
				console.log("data not received from file: ", fileName);
				throw err;
			});
		},

		//convert json to rendering format and show it as meaningful data
		getRenderingData: function(){
			array.forEach(this.objects, function(upObject){
				var userIndex = array.indexOf(this.users, upObject['user']);
				var pa = this.getProblemActivityName(upObject['problem'], upObject['activity']);
				var problemIndex = array.indexOf(this.problems, pa);
				if(userIndex >= 0 && problemIndex >= 0){
					this.mode[userIndex][problemIndex] = upObject['mode'];
					//this.timeSpent[userIndex][problemIndex] = (number.round(upObject['totalTime']*10))/10+ " - " + (number.round(upObject['outOfFocusTime']*10))/10;
					this.timeSpent[userIndex][problemIndex] = (number.round((upObject['focusTime'] - upObject['wastedTime'])*10))/10;
					this.totalTimeSpent[userIndex] += this.timeSpent[userIndex][problemIndex];
					this.totalTimeSpent[userIndex] = (number.round(this.totalTimeSpent[userIndex]*100))/100; // just making sure no extra long decimals show up.

					var errorRatioText = "Blank";
                    var errorRatioNumber = (100-((parseFloat(upObject['incorrectChecks'])/parseFloat(upObject['totalSolutionChecks']))*100));
                    if (!isNaN(errorRatioNumber)){ 
                        errorRatioText = errorRatioNumber.toFixed(1)+"%"; 
                    } 
 					this.errorRatio[userIndex][problemIndex] = errorRatioText;
					
					this.problemComplete[userIndex][problemIndex] = upObject['problemComplete'];
					if(this.problemComplete[userIndex][problemIndex] == true){
						this.totalProblemsCompleted[userIndex]++;
						this.totalProblemsStarted[userIndex]++;
					} else {
						this.totalProblemsStarted[userIndex]++;
					}

					this.problemRevisits[userIndex][problemIndex] = upObject['openTimes'];
					//this.nodesAttempted[userIndex][problemIndex] = upObject['nodes'].length;
					this.sessionRunning[userIndex][problemIndex] = upObject['sessionRunning'];
					
					if(upObject['nodes']){
							//console.log("session ", upObject);
						array.forEach(upObject['nodes'], function(node){
							//console.log("sachin ", node.nodeExist, " length ", upObject['nodes'].length, " user ", userIndex, " problemIndex ", problemIndex);
							if(node.nodeExist){
								this.nodesAttempted[userIndex][problemIndex]++;
							}
						}, this);
					}


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
			var tableString = "<table border='1'><tr>";
			var problems = this.getAllProblems();
			if(this.modules['userData']){
				tableString += "<th>Problems Started</th>";
				tableString += "<th>Problems Completed</th>";
				tableString += "<th>Total time spent</th>";
			}
			if(this.modules['names']){
				tableString += "<th class='grey'>Users \/ Problems -></th>";
			}
			array.forEach(this.problemNames, function(problem){
				tableString += "<th>" + problem + "</th>";
			});
			tableString += "</tr>";
			return tableString;
		},

		makeTable: function(/* two dimensional array of Strings */ printArray){
			var tableString = '';
			var row = 0;
			array.forEach(this.users, function(user){
				var userRow = false;
				if(!this.modules['names'] && this.currentUser == user){
					userRow = true;
					tableString += "<tr class = 'light-blue'>";
				} else {
					tableString += "<tr>";
				}
				
				if(this.modules['userData']){
					tableString += "<td>"+ this.totalProblemsStarted[row] + "</td>"; 
					tableString += "<td>"+ this.totalProblemsCompleted[row] + "</td>"; 
					tableString += "<td>"+ this.totalTimeSpent[row] + "</td>"; 
				}

				if(this.modules['names'])
					tableString += "<td class='grey'>"+user+"</td>";
				//var problemDetails = printArray[row];
				var col = 0;
				array.forEach(this.problems, function(problem){
					var urlString = '';
					if(this.modules['sessionLink']){
						//for devel server
						urlString = "<a href='../index.html?u=" + user + "&m=" + this.mode[row][col] + "&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&l=false' target='_blank' title='Click to check session'>";
					}
					var complete = this.problemComplete[row][col];
					var runningStatus = this.sessionRunning[row][col];
					tableString += "<td";
					if(this.modules['colors'] && !userRow){
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
					
					tableString += "<span class='revisits all'>";
					if(this.modules['sessionLink'] && this.problemRevisits[row][col] != "-"){
						tableString += urlString;
					}
					tableString += this.problemRevisits[row][col];
					if(this.modules['sessionLink'] && this.problemRevisits[row][col] != "-"){
						tableString += "</a>";
					}
					tableString += "</span>";

					tableString += "<span class='nodes all'>";
					if(this.modules['sessionLink'] && this.nodesAttempted[row][col] != ""){
						tableString += urlString;
					}
					tableString += this.nodesAttempted[row][col];
					if(this.modules['sessionLink'] && this.nodesAttempted[row][col] != ""){
						tableString += "</a>";
					}
					tableString += "</span>";
						
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

		defaultInit: function(){
			this.init();
			var table = this.initTable();
			table += this.makeTable();
			table += this.closeTable();

			return table;
		},

		renderTable: function(){
			//table related init function can be used to make different html structures if we want. 
			//for sending multiple queries you would need to make an array of queries in modules and send them using the table init function. 
			//Call the init again and again. I have moved the init from main to table init function. 
			var fName = this.modules['tName'] + 'Init';
			var table = "";
			if(this[fName]){
				table = this[fName]();
			} else {
				table = this.defaultInit();
			}

			return table;
		}
	});
});
