/**
 *
 * Equation checking to compare an equation given by the student with a given equation
 * @author: Brandon Strong
 * 
 **/

/**
 * Evaluates two expressions for equivalence by comparing the given variables, and then
 *      testing the expressions with values assigned to the variables
 **/

define(["dojo/_base/declare", "parser/parser"]
        , function(declare, parser) {

    return declare(null, {
        constructor: function(/*string*/ model, /*string*/student) {
            this.correctEquation = model;
            this.studentEquation = student;
            this.equivalent = null;
            this._areExprEquiv();
        },
        //*********** Private Methods ***********
        _areExprEquiv: function() {
            //Summary: checks equivalence of this.correctEquation and this.studentEquation
            //      and sets this.equivalent to true or false based on equivalence; it includes
            //      a loop to check equivalence multiple times to minimize the risk of a false
            //      positive
            //
            //Tags: private
            var given = Parser.parse(this.correctEquation);
            var givenVar = given.variables();
            var student = Parser.parse(this.studentEquation);
            var studentVar = student.variables();
            if (!this._areArraysEqual(givenVar, studentVar)) {
                this.equivalent = false;
            } else {
                for (var i = 0; i < 2; i++) {
                    var obj = this._buildObject(givenVar);
                    if (Parser.evaluate(this.correctEquation, obj) === Parser.evaluate(this.studentEquation, obj)) {
                        this.equivalent = true;
                    } else {
                        this.equivalent = false;
                        break;
                    }
                }
            }
        },
        _areArraysEqual: function(/*variable | array*/ array1, /*variable | array*/ array2) {
            //Summary: returns true if the supplied arrays contain the same elements; 
            //      the order does not matter.
            //
            //Tags: private
            if (array1.length !== array2.length)
                return false;
            else if (array1.length === undefined)
                return array1 === array2;
            for (var i = 0; i < array1.length; i++)
                for (var ii = 0; ii < array2.length; ii++) {
                    if (array1[i] === array2[ii])
                        break;
                    else if (ii + 1 === array2.length)
                        return false;
                }
            return true;
        },
        _buildObject: function(/*array*/ variables) {
            //Summary: returns an object with random numbers assigned to the 
            //      given variables to test equivalence in _areExprEquiv()
            //
            //Tags: private
            var theObject = {};
            for (var i = 0; i < variables.length; i++)
                theObject[variables[i]] = Math.random();
            return theObject;
        },
        //*********** Public Method ***********
        areEquivalent: function() {
            //Summary: returns if the expressions given to the constructor are equivalent
            //
            //Tags: public
            return this.equivalent;
        }
    });
});
        