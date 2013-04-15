/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

import net.sourceforge.jeval.EvaluationException;
import net.sourceforge.jeval.Evaluator;

/**
 *
 * @author ramayantiwari
 */
public class Equation {
    private String equation;
    
    public String getEquation(){
        return equation;
    }
    
    public void setEquation(String input) throws InvalidEquationException{
        Evaluator eval = new Evaluator();
        try{
            eval.parse(input);
        }catch(EvaluationException ex){
            throw new InvalidEquationException();
        }    
        
        equation = input;
    }
    
    // TODO
    public boolean compareEquation(String sourceEq, String targetEq){
        return false;
    }
}
