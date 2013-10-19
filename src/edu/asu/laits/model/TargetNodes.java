/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.MainWindow;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;

/**
 *
 * @author rjoiner1
 */
public class TargetNodes {
    
    private List<String> nextNodes;
    private List<String> firstNodes;
    private static Logger logs = Logger.getLogger("DevLogs");

    public void initFirstNodes(){
        logs.debug("initializing first nodes");
        List<SolutionNode> solutionNodes = ApplicationContext.getCorrectSolution().getSolutionNodes();
        for(SolutionNode solutionNode : solutionNodes){
            if(solutionNode.getNodeOrder() == 1){
                logs.debug("Adding to First Nodes : " + solutionNode.getNodeName());
                addFirstNode(solutionNode.getNodeName());
            }
        }
        setNextNodes();
    }
    public void setNextNodes() {
        
        nextNodes.clear();
        List<String> parsed = new ArrayList<String>();
        for(String firstNode: firstNodes){
            if(MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(firstNode) == null){
                logs.debug("Addint to Next Nodes : " + firstNode);
                nextNodes.add(firstNode);
            } else {
                parseNextNode(firstNode, parsed);
            }
        }
    }
    
    public void parseNextNode(String node, List<String> parsed){
        parsed.add(node);
        List<String> inputs = ApplicationContext.getCorrectSolution().getNodeByName(node).getInputNodes();
        for(String input : inputs){
            if(!parsed.contains(input)){
                if(MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(input) == null){
                    logs.debug("Addint to Next Nodes : " + input);
                    nextNodes.add(input);
                } else {
                    parseNextNode(input, parsed);
                }
            }
        }
    }
    
    public TargetNodes(){
        nextNodes = new ArrayList<String>();
        firstNodes = new ArrayList<String>();
    }
    
    public void addFirstNode(String node){
        firstNodes.add(node);
    }

    public List<String> getNextNodes() {
        return nextNodes;
    }

    public void addNextNodes(String nextNode) {
        System.out.println("adding " + nextNode);
        nextNodes.add(nextNode);
        for (String nNode : nextNodes) {
            System.out.println("current next nodes include " + nNode + "   ");
        }
    }

    public void removeNextNodes(String nextNode) {
        int index = nextNodes.indexOf(nextNode);
        if (index != -1) {
            nextNodes.remove(index);
        }
    }

    public String getFirstNextNode() {
        if (!nextNodes.isEmpty()) {
            return nextNodes.get(0);
        } else {
            return null;
        }
    }
    
    public String getNameByOrder(int order) {
        if (ApplicationContext.getCorrectSolution().getNodeByOrder(order) != null) {
            System.out.println(ApplicationContext.getCorrectSolution().getNodeByOrder(order).getNodeName());
            return ApplicationContext.getCorrectSolution().getNodeByOrder(order).getNodeName();
        } else {
            return null;
        }
    }
    
}
