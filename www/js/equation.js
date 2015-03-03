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
	"dojo/_base/array", "dojo/_base/lang", "parser/parser", 	"dijit/registry"
], function(array, lang, Parser, registry){
	// Summary: 
	//			Acts as interface to the parser
	// Description:
	//			Contains code for parsing and routines for evaluating equations;		  
	//			Routines associated with the Parser:
	//			 * Equation checking to compare an equation given by the student with a given equation
	//			 * Convert equation between format stored in model and format shown on node editor.
	// Tags:
	//			equation, parser

	return {
		parse: function(equation){
			//Check for pulse or pulsetrain function
			return Parser.parse(equation);
		},
		isVariable: Parser.isVariable,
		logging : null,
		
		/**
		 * Evaluates two expressions for equivalence by comparing the given variables, and then
		 *		testing the expressions with values assigned to the variables
		 **/
		
		areEquivalent: function(/*string*/ id, /*object*/ model, /*string*/ studentEquation){
			//Summary: For a given model node id, checks the correctness of the student equation.
			//
			var d = new Date();
			var seed = d.getTime();
			if(typeof(studentEquation) == 'string')
			{
				console.log("hello");
				var student = Parser.parse(studentEquation, seed);
			}
			else
				student = studentEquation;

			// Choose values so that the given model node can be evaluated.
			var givenEqn = model.given.getEquation(id);
			if(!givenEqn){
				this.logging.clientLog("assert", {
					message:'Given node '+id+' does not have an equation', 
					functionTag : 'areEquivalent'
			});
			}
			
			var givenParse = Parser.parse(givenEqn, seed);
			var givenVals = {};
			array.forEach(model.given.getNodes(), function(node){
				/* Parameter and accumulator nodes are treated as independent. */
				if((!node.genus || node.genus === "required")/* && (node.type == 'parameter' || node.type == 'accumulator')*/){
					givenVals[node.ID] = Math.random();
				}
			});
			var valsCopy = dojo.clone(givenVals);

			var givenResult = this.getEquationValue(givenParse, model, givenVals, "given", seed, 0);
			var studentResult = this.getEquationValue(student, model, givenVals, "solution", seed, 0);

			console.log("results:" + givenResult + ":" + studentResult);

			var flag = Math.abs(studentResult - givenResult) <= 10e-10 * Math.abs(studentResult + givenResult);

			if(givenEqn.indexOf("max") >= 0 || givenEqn.indexOf("min") >= 0){
				var index = 0;
				var nodes = Object.keys(valsCopy);
				var givenVals1 = {};
				for(var i = 0; i<nodes.length; i++){
					givenVals1[nodes[i]] = -1*valsCopy[nodes[i]];
				}

				console.log(givenVals1);
			console.log("results:" + givenResult1 + ":" + studentResult1);

				var givenResult1 = this.getEquationValue(givenParse, model, givenVals1, "given", seed, 0);
				var studentResult1 = this.getEquationValue(student, model, givenVals1, "solution", seed, 0);


				flag = flag && (Math.abs(studentResult1 - givenResult1) <= 10e-10 * Math.abs(studentResult1 + givenResult1));
			}

			if(givenEqn.indexOf("sinewave") >= 0)
			{
				var givenResult2 = this.getEquationValue(givenParse, model, givenVals, "given", seed, 1);
				var studentResult2 = this.getEquationValue(student, model, givenVals, "solution", seed, 1);

				flag = flag && (Math.abs(studentResult2 - givenResult2) <= 10e-10 * Math.abs(studentResult2 + givenResult2));
			}
			if(isNaN(givenResult) && isNaN(studentResult))
			{
				flag = true;
			}
			return flag; 
		},

		getEquationValue: function(/* math parser object */ parse, /*model object*/ model, values, /* string */ active, /* float */ seed, /* float */ time){
			var id;
			var solutionVals = {};
			array.forEach(parse.variables(), function(variable){
				// console.log("	==== evaluating given variable ", variable);
				// given model variables should all be given node IDs
				if(active == "solution"){
					/*
					 Go through student variables.	Each variable can be either
					 a given/extra model node name or a student modelnode id.
					 A variable may, or may not, have a value assigned when 
					 the given model was evaluated above.
					 */
					console.log("	 ==== evaluating student variable ", variable);
					if(model.student.isNode(variable)){
						id = model.student.getDescriptionID(variable);
					}else {
						id = model.given.getNodeIDByName(variable);
					}
					/* This should never happen:  there is a check for unknown variables
					 at a higher level. */
					if(!id){
						this.logging.clientLog("assert", {
							message:'Student variable has no match, variable name : '+variable, 
							functionTag: 'areEquivalent'
						});
					}
					this.evalVar(id, model.solution, values);
					solutionVals[variable] = values[id];
				} else {
					console.log("	==== evaluating given variable ", variable);
					id = variable;
					this.evalVar(id, model.given, values);
				}	

			}, this);
			if(active == "solution")
				values = solutionVals;
			var result = parse.evaluate(values, time, seed);
			return result;
		},
		/*
		 Recursively evaluate functions in the model.
		 If the function nodes have circular dependencies, then an error will be produced.
		 This is the same algorithm used in the function topologicalSort.
		 */
		evalVar: function(id, subModel, vals, parents){
			parents = parents || {};
			if(!subModel.isNode(id)){
				this.logging.clientLog("assert", {
					message:'unknown variable used in the equation : '+id, 
					functionTag:'evalVar'
				});
				return; //this helps to alert an error incase variable is unknown
			}
			
			var node = subModel.getNode(id);
			if(!(id in vals)){
				if(parents[id]){
					// Should send a message to the user.
					throw new Error("Function node '" + node.id + "' has circular dependency.");
				}
				parents[id] = true;
				// Evaluate function node
				console.log("=========== about to parse ", node.equation);
				console.warn("========	  It is important to log failures of this parse");
				var parse = Parser.parse(node.equation);
				array.forEach(parse.variables(), function(x){
					this.evalVar(x, subModel, vals, parents);
				}, this);
				vals[id] = parse.evaluate(vals);
				parents[id] = false;
			}
		},
		
		convert: function(subModel, equation){
			try{
				var expr = Parser.parse(equation);
			}catch(e){
				this.logging.clientLog("error", {
					message:'error in parser, error message : ' + e, 
					functionTag:'convert'
				});
				return equation;
			}
			this.mapVariableNodeNames = {};
			// console.log("			parse: ", expr);
			array.forEach(expr.variables(), function(variable){
				/* A student equation variable can be a student node id
				 or given (or extra) model node name (if the node has not been
				 defined by the student). */
				if(subModel.isNode(variable)){
					var nodeName = subModel.getName(variable);
					// console.log("=========== substituting ", variable, " -> ", nodeName);
					expr.substitute(variable, nodeName);
					// console.log("			result: ", expr);
				}
			}, this);
			return expr.toString();
		},
		/*
		 Adding quantity to student model:	Update 
		 equations and inputs of existing nodes.
		 */
		addQuantity: function(id, subModel){

			var name = subModel.getName(id);
			array.forEach(subModel.getNodes(), function(node){
				if(node.equation){
					try {
						var expr = Parser.parse(node.equation);
					}catch(e){
						/* If an equation fails to parse, then the input
						 string is stored as the equation for that node.
						 Thus, if the parse fails, just move on to the 
						 next node. */
						return;
					}
					var changed = false;
					array.forEach(expr.variables(), function(variable){
						if(name == variable){
							changed = true;
							expr.substitute(name, id);
						}
					});
					if(changed){
						node.equation = expr.toString(true);
						node.inputs = [];
						var inputs = this.createInputs(expr);
						array.forEach(inputs, function(input){
							if(subModel.isNode(input.ID))
								node.inputs.push(input);
						});
					}
				}
			},this);
		},
		isSum: function(parse){
			// Return true if expression is a sum of variables, allowing for minus signs.
			// Note that a bare variable will also return true.
			var ops = parse.operators();
			var allowed = {"+": true, "-": true, "variable": true};
			for(var op in ops){
				if(ops[op] > 0 && !allowed[op])
					return false;
			}
			return true;
		},
		isProduct: function(parse){
			// Return true if the expression is a product of variables, allowing for division
			// Note that explicit powers (a^2) are not allowed, which is mathematically incorrect
			// but we have no mechanism for adding powers on our user interface.  For problems
			// that are that complicated, the student should be using the full text entry anyway.
			// Note that a bare variable will also return true.
			var ops = parse.operators();
			var allowed = {"*": true, "/": true, "variable": true};
			for(var op in ops){
				if(ops[op] > 0 && !allowed[op])
					return false;
			}
			return true;
		},
        isDivide: function(parse){
            //Return true if the expression contains division but not multiplication.
            //Intended to be used in conjunction with isProduct
            var ops = parse.operators();
            var allowed = {"/": true, "variable": true};
            for(var op in ops){
                if(ops[op] > 0 && !allowed[op])
                    return false;
            }
            return true;
        },
		gradient: function(parse, /*boolean*/ monomial, point){
			// Find the numerical partial derivatives of the expression at
			// the given point or at a random point, if the point is not supplied.
			// Both the given point and the return vector are expressed as objects.
			// If monomial is true, take the gradient of the logarithm and multiply by the variable.
			// That is, find	 x d/dx log(f)
			// For a monomial, this will give the degree of each factor 
			/*
			 In principle, one could calculate the gradient algebraically and 
			 use that to determine coefficients.  However, the current parser library
			 is not really set up to do algebraic manipulations.
			 */
			if(!point){
				point = {};
				array.forEach(parse.variables(), function(x){
					// For products, we want to stay away from zero.
					point[x]= Math.random()+0.5;
				});
			}
			var partial = {};
			var y = parse.evaluate(point);
			array.forEach(parse.variables(), function(x){
				var z = lang.clone(point);
				var dx = 1.0e-6*Math.abs(point[x]==0?1:point[x]);
				z[x] -= 0.5*dx;
				var y1 = parse.evaluate(z);
				z[x] += dx;
				var y2 = parse.evaluate(z);
				partial[x] = (y2-y1)/dx;
				if(monomial){
					partial[x] *= point[x]/y;
				}
			});
			return partial;
		},
		
		// Test if this is a pure sum or product
		// If so, determine connection labels
		createInputs: function(parse){
			var grad;
			var chooseSign = function(x, a, b, c){
				return x>0.5?a:(x<-0.5?b:c);
			};
			if(this.isSum(parse)){
				grad = this.gradient(parse, false);
				return array.map(parse.variables(), function(x){
					return {ID: x, label: chooseSign(grad[x],"","-","0")};
				});
			}else if(this.isProduct(parse)){
				grad = this.gradient(parse, true);
				return array.map(parse.variables(), function(x){
					return {ID: x, label: chooseSign(grad[x],"","/","none")};
				});
			}else{
				// General expression
				return array.map(parse.variables(), function(x){
					return {ID: x};
				});
			}
		},
		
		convertUsingDescriptionIDs:function(subModel, equation){
			try{
				var expr = Parser.parse(equation);
			}catch(e){
				this.logging.clientLog("error", {
					message:'error in parser, error message : '+e, 
					functionTag : 'convertUsingDescriptionIDs'
				});
				return equation;
			}
			array.forEach(expr.variables(), function(variable){
				
				var givenNodeId = subModel.getNodeIDFor(variable);
				expr.substitute(variable, givenNodeId);
			}, this);
			return expr.toString();
		},
		
		initializeTimeStep: function(model){
			// Summarize:  set up env for the function evaluateTimeStep
			var env = {parse: {}, xvars: [], parameters: {}};
			var fv = {};
			array.forEach(model.getNodes(), function(node){
				// Include all nodes that belong in the solution.
				// Additionally we only include nodes that are complete,
				// except for units.
				if((!node.genus || node.genus === "required") && model.isComplete(node.ID, true)){ 
					switch(node.type){
					case "parameter":
						// No equation to parse
						env.parameters[node.ID] = node.initial;
						break;
					case "function":
						var fparse = Parser.parse(node.equation);
						env.parse[node.ID] = fparse;
						// We can only calculate the order for functions
						// after all the variables are given.
						fv[node.ID] = fparse.variables();
						break;
					case "accumulator":
						env.parse[node.ID] = Parser.parse(node.equation);
						// This sets the order of the xvars.
						env.xvars.push(node.ID);
						break;
					default:
						new Error("Invalid type ", node.type);
					}
				}
			});
			// Find correct evaluation order for function nodes.
			// This is a partially ordered set, so we need 
			// a topological sort.
			env.functions = this.topologicalSort(fv);
			return env;
		},
		
		// This is the same algorithm that is used in the function evalVar()
		topologicalSort: function(directedGraph){
			// Summary: returns the topological sort of a directed acyclic graph.
			//			If a cycle is detected, then an error condition is given.
			//			Children that are not themselves a vertex are ignored.
			// directedGraph:  An object of the form {vertex: [array of children], ...}
			//
			var sorted = [], evaluated = {};
			// list of parents is used to detect any cycles in the graph.
			var parents = {};
			var followEdge = function(vertex){
				if(!(vertex in evaluated)){
					parents[vertex] = true;
					array.forEach(directedGraph[vertex], function(child){
						if(parents[child]){
							// Ideally, this would be a custom Error object.
							throw {
								name: "graph-cycle",
								message: "Found cycle in graph."
							};
						}
						if(child in directedGraph){
							followEdge(child);
						}
					});
					parents[vertex] = false;
					sorted.push(vertex);
					evaluated[vertex] = true;
				}
			};
			for(var v in directedGraph){
				followEdge(v);
			}
			return sorted;
		},
		
		evaluateTimeStep:  function(x, time){
			// Summary:	 evaluate model at some time step.
			// Description:	 The rationale behind this notation is that the 
			//	  numerical integration routine should know nothing about 
			//	  variable names or the model.
			// x: array containing current value for dynamic variables (accumulators)
			// The scope should contain the following objects: 
			//	   parse: Object containing parses labled by node ID
			//	   xvars:  Array giving the node ID for each x
			//	   parameters:	Object containing values for parameter nodes, labeled by nodeID
			//	   functions:  Array containing node ID for each function.	The order is such
			//				   that the later functions in the array depend on earlier functions
			// Returns:	 array containing the gradient of the dynamic variables, in the order
			//	   specified by xvars.
			var variables = {};
			for(var i=0; i<x.length; i++){
                variables[this.xvars[i]] = x[i];
			}
            lang.mixin(variables, this.parameters);
			array.forEach(this.functions, function(id){
                variables[id] = this.parse[id].evaluate(variables);
				variables[id] = this.parse[id].evaluate(variables , time);
			}, this);
			return array.map(this.xvars, function(id){
				return this.parse[id].evaluate(variables , time);
			}, this);		
		},

		
		setLogging: function(/*string*/ logging){
			this.logging = logging;
		}


		
	};
});
