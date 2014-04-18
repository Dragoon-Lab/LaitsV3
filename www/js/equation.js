/* global define */
/*
 *  Routines associated with the Parser:
 *  * Equation checking to compare an equation given by the student with a given equation
 *  * Convert equation between format stored in model and format shown on node editor.
 */

define([
    "dojo/_base/array", "dojo/_base/lang", "parser/parser"
], function(array, lang, Parser) {

    return {
        parse: function(equation) {
            return Parser.parse(equation);
        },
        isVariable: Parser.isVariable,

        /**
         * Evaluates two expressions for equivalence by comparing the given variables, and then
         *      testing the expressions with values assigned to the variables
         **/

        areEquivalent: function(/*string*/ id, /*object*/ model, /*string*/ studentEquation) {
            //Summary: For a given model node id, checks the correctness of the student equation.
            //
            if (typeof studentEquation == 'string')
                var student = Parser.parse(studentEquation);
            else
                student = studentEquation;

            // Choose values so that the given model node can be evaluated.
            var givenEqn = model.given.getEquation(id);
            console.assert(givenEqn, "Given node '" + id + "' does not have an equation.");
            var givenParse = Parser.parse(model.given.getEquation(id));
            var givenVals = {};
            array.forEach(givenParse.variables(), function(variable) {
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
            array.forEach(student.variables(), function(variable) {
                console.log("    ==== evaluating student variable ", variable);
                var givenID;
                if (model.student.isNode(variable)) {
                    givenID = model.student.getDescriptionID(variable);
                } else {
                    givenID = model.given.getNodeIDByName(variable);
                }
                /* This should never happen:  there is a check for unknown variables
                 at a higher level. */
                console.assert(givenID, "Student variable '" + variable + "' has no match.");
                // At this point, givenID can also be from the extra nodes.
                this.evalVar(givenID, model.given, givenVals);
                studentVals[variable] = givenVals[givenID];
            }, this);
            var studentResult = student.evaluate(studentVals);
            return Math.abs(studentResult - givenResult) <= 10e-10 * Math.abs(studentResult + givenResult);
        },
        /*
         Recursively evaluate functions in the model,
         choosing random values for any parameters or accumulators.
         
         If the function nodes have circular dependencies, then an error will be produced.
         */
        evalVar: function(id, subModel, vals, parents) {
            console.assert(subModel.isNode(id), "evalVar: unknown variable '" + id + "'.");
            var node = subModel.getNode(id);
            if (vals[id]) {
                // if already assigned a value, do nothing.
            } else if (node.type == 'parameter' || node.type == 'accumulator') {
                vals[id] = Math.random();
            } else {
                if (!parents)
                    parents = new Object();
                if (parents[id]) {
                    // Should throw an error, so that message can be sent to user.
                    throw new Error("Function node '" + node.id + "' has circular dependency.");
                }
                parents[id] = true;
                // Evaluate function node
                var parse = Parser.parse(node.equation);
                array.forEach(parse.variables(), function(x) {
                    this.evalVar(x, subModel, vals, parents);
                }, this);
                vals[id] = parse.evaluate(vals);
                parents[id] = false;
            }
        },
        convert: function(subModel, equation) {
            try {
                var expr = Parser.parse(equation);
            } catch (e) {
                console.warn("Should log this as a JavaScript error.");
                return equation;
            }
            this.mapVariableNodeNames = {};
            // console.log("            parse: ", expr);
            array.forEach(expr.variables(), function(variable) {
                /* A student equation variable can be a student node id
                 or given (or extra) model node name (if the node has not been
                 defined by the student). */
                if (subModel.isNode(variable)) {
                    var nodeName = subModel.getName(variable);
                    // console.log("=========== substituting ", variable, " -> ", nodeName);
                    expr.substitute(variable, nodeName);
                    // console.log("            result: ", expr);
                }
            }, this);
            return expr.toString();
        },
        /*
         Adding quantity to student model:  Update 
         equations and inputs of existing nodes.
         */
        addQuantity: function(id, subModel) {

            var name = subModel.getName(id);
            array.forEach(subModel.getNodes(), function(node) {
                if (node.equation) {
                    try {
                        var expr = Parser.parse(node.equation);
                    } catch (e) {
                        /* If an equation fails to parse, then the input
                         string is stored as the equation for that node.
                         Thus, if the parse fails, just move on to the 
                         next node. */
                        return;
                    }
                    var changed = false;
                    array.forEach(expr.variables(), function(variable) {
                        if (name == variable) {
                            changed = true;
                            expr.substitute(name, id);
                        }
                    });
                    if (changed) {
                        node.equation = expr.toString(true);
                        node.inputs = [];
                        array.forEach(expr.variables(), function(id) {
                            if (subModel.isNode(id))
                                node.inputs.push({ID: id});
                        });
                    }
                }
            });
        },
        isSum: function(parse) {
            // Return true if expression is a sum of variables, allowing for minus signs.
            // Note that a bare variable will also return true.
            var ops = parse.operators();
            var allowed = {"+": true, "-": true, "variable": true};
            for (var op in ops) {
                if (ops[op] > 0 && !allowed[op])
                    return false;
            }
            return true;
        },
        isProduct: function(parse) {
            // Return true if the expression is a product of variables, allowing for division
            // Note that explicit powers (a^2) are not allowed, which is mathematically incorrect
            // but we have no mechanism for adding powers on our user interface.  For problems
            // that are that complicated, the student should be using the full text entry anyway.
            // Note that a bare variable will also return true.
            var ops = parse.operators();
            var allowed = {"*": true, "/": true, "variable": true};
            for (var op in ops) {
                if (ops[op] > 0 && !allowed[op])
                    return false;
            }
            return true;
        },
        convertUsingDescriptionIDs:function(subModel,equation){
            try {
                var expr = Parser.parse(equation);
            } catch (e) {
                console.warn("Should log this as a JavaScript error.");
                return equation;
            }
            array.forEach(expr.variables(), function(variable) {

                var givenNodeId = subModel.getNodeIDFor(variable);
                expr.substitute(variable, givenNodeId);
            }, this);
            return expr.toString();
        }

    };
});

