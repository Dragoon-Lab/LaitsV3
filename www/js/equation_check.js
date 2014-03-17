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

    function equivalentError(message){
	
    };
    
    return {
        areEquivalent: function(/*string*/ id, /*object*/ model, /*string*/ studentEquation) {
            //Summary: For a given model node id, checks the correctness of the student equation.
            //
            if (typeof studentEquation == 'string')
                var student = Parser.parse(studentEquation);
            else
                student = studentEquation;
	    
	    // Choose values so that the given model node can be evaluated.
	    var givenEqn = model.given.getEquation(id);
	    console.assert(givenEqn,"Given node '" + id + "' does not have an equation.");
	    var givenParse = Parser.parse(model.given.getEquation(id));		
	    var givenVals = {};
	    array.forEach(givenParse.variables(), function(variable){
		// console.log("    ==== evaluating given variable ", variable);
		// given model variables should all be given node IDs
		this.evalVar(variable, model.given, givenVals);
	    }, this);
	    var givenResult = givenParse.evaluate(givenVals);

	    /*
	     Go through student variables.  Each variable can be either
	     a given/extra model node name or a student modelnode id.
	     A variable may, or may not, have a value assigned when 
	     the given model was evaluated above.
	     */
	    var studentVals = {};
	    array.forEach(student.variables(), function(variable){
		console.log("    ==== evaluating student variable ", variable);
		var givenID;
		if(model.student.isNode(variable)){
		    givenID = model.student.getDescriptionID(variable);
		} else {
		    givenID = model.getNodeIDByName(variable);
		}
		/* This should never happen:  there is a check for unknown variables
		 at a higher level. */
		console.assert(givenID, "Student variable '" + variable + "' has no match.");
		// At this point, givenID can also be from the extra nodes.
		this.evalVar(givenID, model.given, givenVals);
		studentVals[variable] = givenVals[givenID];
	    }, this);
	    var studentResult = student.evaluate(studentVals);
	    return Math.abs(studentResult - givenResult) <= 10e-10*Math.abs(studentResult+givenResult);
	},
	
	/*
	 Recursively evaluate functions in the model,
	 choosing random values for any parameters or accumulators.
	 
	 If the function nodes have circular dependencies, then an error will be produced.
	 */
	evalVar: function(id, model, vals, parents){
	    console.assert(model.isNode(id), "evalVar: unknown variable '" + id + "'.");
	    var node = model.getNode(id);
	    if(vals[id]){
		// if already assigned a value, do nothing.
	    } else if(node.type == 'parameter' || node.type == 'accumulator'){
		vals[id] = Math.random();
	    } else {
		if(!parents) parents = new Object();
		if(parents[id]){
		    // Should throw an error, so that message can be sent to user.
		    throw new Error("Function node '" + node.id + "' has circular dependency.");
		}
		parents[id] = true;
		// Evaluate function node
		var parse = Parser.parse(node.equation);
		array.forEach(parse.variables(), function(x){
		    this.evalVar(x, model, vals, parents);
		}, this);
		vals[id] = parse.evaluate(vals);
		parents[id] = false;
	    }
	}
    };
});

