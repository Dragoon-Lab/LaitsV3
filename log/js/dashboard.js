/* global define */
define([ 
	'dojo/_base/declare',
	"dojo/request/xhr", 
	"dojo/_base/json",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/html",
	"dojo/dom",
	"dojo/number"
], function(declare, xhr, json, lang, array, html, dom, number){
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
		//sessionDetails:[],

		constructor: function(/*json*/ params, /*string*/ path){
			this.runtime = params['runtime']||true;
			this.path = path||"";
			this.section = params['section'];
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
				throw new error;
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

		getRenderingData: function(){
			array.forEach(this.objects, function(upObject){
				var userIndex = array.indexOf(this.users, upObject['user']);
				var problemIndex = array.indexOf(this.problems, upObject['problem']);
				if(userIndex >= 0 && problemIndex >= 0){
					this.timeSpent[userIndex][problemIndex] = (number.round(upObject['totalTime']*10))/10+ " - " + (number.round(upObject['outOfFocusTime']*10))/10;
					this.errorRatio[userIndex][problemIndex] = upObject['incorrectChecks'] + " / " + upObject['totalSolutionChecks'];
					this.problemComplete[userIndex][problemIndex] = upObject['problemComplete'];
					this.sessionRunning[userIndex][problemIndex] = upObject['sessionRunning'];
					//this.sessionDetails[userIndex][problemIndex] = {user : upObject['user'], problem: upObject['problem'], section: this.section};
					var detailedString = '';
					var nodes = upObject['nodes']; 
					if(nodes){
						array.forEach(nodes, function(node){
							detailedString += "<p>"+node['name'];
							var properties = node['properties'];
							if(properties){
								array.forEach(properties, function(property){
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
								}, this);
							}
							detailedString += "</p>";
						}, this);
						this.detailedNodeAnalysis[userIndex][problemIndex] = detailedString;
					}
				}
			}, this);
		},

		initTable: function(){
			var tableString = "<table border='1'>";
			var problems = this.getAllProblems();
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
				tableString += "<tr><td>"+user+"</td>";
				//var problemDetails = printArray[row];
				var col = 0;
				array.forEach(this.problems, function(problem){
					//var urlString = "<a href='/devel/index.html?u=" + user + "&m=STUDENT&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&t=true' target='_blank' title='Click to check session' style='width:90px'>";
					//for demo server
					var urlString = "<a href='/demo/index.html?u=" + user + "&m=STUDENT&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&t=true' target='_blank' title='Click to check session'>";
					//for local server
					//var urlString = "<a href='/code/index.html?u=" + user + "&m=STUDENT&sm=feedback&is=algebraic&p=" + problem + "&s=" + this.section + "&c=Continue&t=true' target='_blank' title='Click to check session'>";
					var complete = this.problemComplete[row][col];
					var runningStatus = this.sessionRunning[row][col];

					if(complete){
						tableString += "<td class='green'>";
					} else if(!complete && runningStatus){
						tableString += "<td class='yellow'>";
					} else {
						tableString += "<td>";
					}
					tableString += "<span class='empty all'>" + this.emptyArray[row][col] + "</span>";
					tableString += "<span class='time all'>";
					if(this.timeSpent[row][col] != '-'){
						tableString += urlString;
					}
					tableString += this.timeSpent[row][col] + "</a></span>";
					

					tableString += "<span class='errors all'>"; 
					if(this.errorRatio[row][col] != "-"){
						tableString += urlString;
					}
					tableString += this.errorRatio[row][col] + "</a></span>";
					if(!this.runtime){
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

			this.show(table);
		},

		show: function(/* html string */ content){
			var tableDOM = dom.byId("table");
			html.set(tableDOM, content);

			//tableWidget.show();
		}

	});
});
