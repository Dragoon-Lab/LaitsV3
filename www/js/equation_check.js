/* global define */
/**
 *
 * Equation checking to compare an equation given by the student with a given equation
 * 
 **/

/**
 * Evaluates two expressions for equivalence by comparing the given variables, and then
 *      testing the expressions with values assigned to the variables
 **/

define([
    "dojo/_base/array", "dojo/_base/lang", "parser/parser"
], function(array, lang, Parser) {
    
    return {
        areEquivalent: function(/*string*/ id, /*object*/ model, /*string*/ studentEquation) {
            //Summary: For a given model node id, checks the correctness of the student equation.
            //
            if (typeof this.studentEquation == 'string')
                var student = Parser.parse(this.studentEquation);
            else
                student = studentEquation;
	    
	    var vals = {};
	    var givenResult = this.evalVar(model.given.getNode(id), model.given, vals, {});
	    var studentVals = {};
	    for(var givenID in vals){
		var studentID = model.student.getNodeIDFor(givenID);
		if(studentID){
		    studentVals[studentID] = vals[givenID];
		} else {
		    console.log("^^^^^^ areEquivalent id='" + givenID + "' not defined in student model".);
		}
	    }
	    console.warn("Does not correctly handle case where node is not yet evaluated.");
	    var studentResult = studentEquation.evaluate(studentVals);
	    return Math.abs(studentResult - givenResult) <= 10e-10*Math.abs(studentResult+givenResult);
	},
	
	/*
	 Recursively evaluate functions in the given model,
	 choosing random values for any parameters or accumulators.

	 If the function nodes have circular dependencies, then an error will be produced.
	 */
	evalVar: function(node, model, vals, parents){
	    if(node.type == 'parameter' || node.type == 'accumulator'){
		vals[node.id] = Math.random();
	    } else {
		if(parents[node.id]){
		    // Should throw an error, so that message can be sent to user.
		    console.error("Function node '" + node.id + "' has circular dependency.");
		    return;
		}
		var z = lang.clone(parents);
		z[node.id] = true;
		// Evaluate function node
		var parse = Parser.parse(node.equation);
		array.forEach(parse.variables(), function(x){
		    if(! vals[x]){
			this.evalVar(model.getNode(x), model, vals, z);
		    }
		}, this);
		vals[node.id] = parse.evaluate(vals);
	    }
	}
    };
});

