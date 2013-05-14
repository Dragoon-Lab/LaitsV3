/**
 * LAITS Project
 * Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
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
