/**
 *
 * Equation checking to compare an equation given by the student with a given equation
 * @author: Brandon Strong
 *
 * 
 **/

/**
 *
 */

define(["dojo/_base/declare", "parser/parser"]
        , function(declare, parser) {

    return declare(null, {
        constructor: function(/*string*/ correctEquation, /*string*/givenEquation) {
            this.correctEquation = correctEquation;
            this.givenEquation = givenEquation;
            this.isCorrect();
        },
        _equals: function(/*variable | array*/ array1, /*variable | array*/ array2) {
            //Summary: returns true if the supplied arrays contain the same elements; 
            //      the order does not matter.
            //
            //Tags: private
            if(array1.length !== array2.length)
                return false;
            else if(array1.length===undefined)
                return array1 === array2;
            for (var i = 0; i < array1.length; i++)
                for (var ii = 0; ii < array2.length; ii++) {
                    alert(array1[i] + " " + array2[ii]);
                    if (array1[i] == array2[ii])
                        break;
                    else if (ii + 1 === array2.length)
                        return false;
                }
            return true;
        },
        isCorrect: function() {
            var given = Parser.parse(this.correctEquation);
            var givenVar = given.variables();
            var student = Parser.parse(this.correctEquation);
            var studentVar = student.variables();
            console.log(givenVar);
            console.log(studentVar);
            alert(this._equals(givenVar, studentVar));
        }
    });
});
        