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

import java.util.List;
import edu.asu.laits.model.Vertex.Plan;
import edu.asu.laits.model.Vertex.VertexType;
/**
 *
 * @author ramayantiwari
 */
public class SolutionNode {
    private VertexType nodeType;
    private String nodeName;
    private String nodeEquation;
    private String correctDescription;
    private Plan nodePlan;
    private List<String> inputNodes;
    private boolean isExtra;
    private double initialValue;
    private int nodeOrder;
    
    
    public void setNodeName(String name){
        this.nodeName = name;        
    }
    
    public void setNodeEquation(String eq){
        this.nodeEquation = eq;
    }
    
    public String getNodeEquation(){
        return this.nodeEquation;
    }
    
    public void setCorrectDescription(String desc){
        this.correctDescription = desc;
    }
    
    public void setNodeType(String t){
        if(t.equalsIgnoreCase("flow"))
            nodeType = VertexType.FLOW;
        else if(t.equalsIgnoreCase("stock"))
            nodeType = VertexType.STOCK;
        else if(t.equalsIgnoreCase("constant"))
            nodeType = VertexType.CONSTANT;        
    }
    
    public void setNodePlan(String planText){
        if(planText.equalsIgnoreCase("said to both increase and decrease"))
            nodePlan = Plan.INCREASE_AND_DECREASE;
        else if(planText.equalsIgnoreCase("proportional to accumulator and input"))
            nodePlan = Plan.PROPORTIONAL;
        else if(planText.equalsIgnoreCase("fixed value"))
            nodePlan = Plan.FIXED;
        else if(planText.equalsIgnoreCase("ratio of two quantities"))
            nodePlan = Plan.RATIO;
        else if(planText.equalsIgnoreCase("said to increase"))
            nodePlan = Plan.INCREASE;
        else if(planText.equalsIgnoreCase("said to decrease"))
            nodePlan = Plan.DECREASE;
        else if(planText.equalsIgnoreCase("the difference of two quantities"))
            nodePlan = Plan.DIFFERENCE;
    }
    
    public void setInputNodes(List<String> nodeList){
        this.inputNodes = nodeList;
    }
    
    
    public void setIsExtra(String value){
        if(value.equalsIgnoreCase("No"))
            isExtra = false;
        else 
            isExtra = true;
    }
    
    public boolean isExtra(){
        return isExtra;
    }
    
    public void setInitialValue(String value){
        if(value == null || value.equals(""))
            initialValue = 0;
        else            
        initialValue = Double.parseDouble(value);
    }
    
    public double getInitialValue(){
        return initialValue;
    }
    
    public String getNodeName(){
        return nodeName;
    }
    
    public String getCorrectDescription(){
        return correctDescription;
    }
    
    public VertexType getNodeType(){
        return nodeType;
    }
    
    public Plan getNodePlan(){
        return nodePlan;
    }
    
    public List<String> getInputNodes(){
        return inputNodes;
    }
    
    public void setNodeOrder(int order){
        this.nodeOrder = order;
    }
    
    public int getNodeOrder(){
        return nodeOrder;
    }
    
    
}
