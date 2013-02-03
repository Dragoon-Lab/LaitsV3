/**
 * LAITS Project
 * Arizona State University
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
    
    
}
