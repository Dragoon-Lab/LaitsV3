/* global define */
define([ 
	'dojo/_base/declare',
	"dojo/request/xhr", 
	"dojo/_base/json",
	"dojo/_base/lang",
	"dojo/_bas/array"
], function(declare, xhr, json, lang, array){
	return declare(null,{
		problems: null,
		users: null,
		objects: null,
		timeSpent: [[]],
		errorRatio: [[]],
		problemComplete: [[]],
		detailedNodeAnalysis: [[]],
		emptyArray: [[]],
		runtime: true,

		constructor: function(/* json */ params){
			this.getResults(params).then(function(results){
				this.objects = results;
				this.users = this.getAllUsers();
				this.problems = this.getAllProblems();
			});
			this.runtime = params['runtime'];

			//initializing the arrays to be exact size as this will lead exact size of the table while rendering.
			var totalUsers = array.length(this.users);
			var totalProblems = array.length(this.problems);
			for(var i = 0; i<totalUsers; i++){
				for(var j = 0; j<totalProblems; j++){
					this.timeSpent[i][j] = "-";
					this.errorRatio[i][j] = "-";
					this.problemComplete[i][j] = "-";
					this.detailedNodeAnalysis[i][j] = "-";
					this.emptyArray = " ";
				}
			}
			this.getRenderingData();
		},

		getResults: function(/*json*/ params){
			return xhr.get(this.path + "dashboard_js.php", {
				query: params,
				handleAs: "json"
			}).then(function(results){	 // this makes loadProblem blocking?
				console.log("task objects found in the logs : ", results);
				return results;
			}, function(err){
				console.error("error in dashboard_js, error message : " + err);
			});
		},

		getAllUsers: function(){
			var index = 0;
			array.forEach(this.objects, function(upObject){
				var user = upObject.user;
				/*
				 BvdS:  users is undefined!
				 */
				if(index>0 && users[index-1] != user){
					this.users.push(user);
					index++;
				}
			});
			return users;
		},

		getAllProblems: function(){
			this.getFile("problem.txt").then(function(problemOrder){
				if(problemOrder){
					array.forEach(problemOrder, function(problem){
						this.problems.push(problem);
					});
				} else {
					array.forEach(this.objects, function(object){
						if(this.problems){
							array.forEach(this.problems, function(problem){
								if(problem != object['problem'])
									this.problem.push(object['problem']);
							});
						} else {
							this.problems.push(object['problem']);
						}
					});
				}
			});
		},

		getFile: function(fileName){
			return xhr.get(this.path + fileName, {
				handleAs : "json",
				load: function(object){
					return object;
				},
				error: function(err){
					console.log("problemOrder txt returned with error, message : "+err);
				}
			});
		},

		getRenderingData: function(){
			var i = 0, j = 0;
			array.forEach(this.objects, function(upObject){
				var userIndex = array.indexOf(this.user, upObject['user']);
				var problemIndex = array.indexOf(this.problems, upObject['problem']);
				if(userIndex >= 0 && problemIndex >= 0){
					this.timeSpent[userIndex][problemIndex] = upObject['totalTime']+ "/" + upObject['outOfFocusTime'];
					this.errorRatio[userIndex][problemIndex] = upObject['errorRatio'];
					this.problemComplete[userIndex][problemIndex] = upObject['problemComplete'];
					var detailedString = '';
					var nodes = object['nodes'];  // BvdS: object is undefined
					if(nodes){
						array.forEach(nodes, function(node){
							detailedString += "<p>"+node['name'];
							var properties = nodes['properties'];
							if(properties){
								array.forEach(properties, function(property){
									var status = property['status'];
									if(status){
										if(status == "CORRECT"){
											detailedString += "<span style='color:green'>C ("+property['correctValue']+") </span>";
										} else if(status == "DEMO"){
											detailedString += "<span style='color:blue'>D </span>";
										} else {
											var answer = property['answers'];
											// BvdS:  index is undefined
											detailedString += "<span style='color:red'>I ("+answer[index]+") </span>";
										}
									}
								});
							}
							detailedString += "</p>";
						});
						this.detailedNodeAnalysis[userIndex][problemIndex] = detailedString;
					}
				}
			});
		},

		initTable: function(){
			var tableString = "<table border='1'>";
			var problems = this.getAllProblems();
			tableString += "<th>Users\\Problems</th>";
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
				var problemDetails = printArray[row];
				var col = 0;
				array.forEach(problemDetails, function(detail){
					var complete = this.problemComplete[row][col];
					if(!this.runtime){
						if(complete){
							tableString += "<td bgColor='green'><span class='detail'>"+detail+"</span>";
						} else {
							tableString += "<td><span class='detail'>"+detail+"</span>";
						}
						tableString += "<div class='nodeDetails' style='display:none;'>"+this.detailedNodeAnalysis[row][col]+"</div></td>";
					} else {
						if(complete){
							tableString += "<td bgColor='green'>"+detail+"</td>";
						} else{ 
							tableString += "<td>"+detail+"</td>";
						}
					}
					col++;
				});
				tableString += "</tr>";
				row++;
			});
			return tableString;

		},

		renderTable: function(/* String */ toShow){
			// BvdS:  initTable and makeTable are undefined
			var table = initTable();
			switch(toShow){
				case "time":
					table += makeTable(this.timeSpent);
					break;
				case "errorRatio":
					table += makeTable(this.errorRatio);
					break;
				case "empty":
					table += makeTable(this.emptyArray);
			}
		}

	});
});
