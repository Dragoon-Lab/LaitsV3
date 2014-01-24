/*
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
 * @author: rjoiner1
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
 * 
 * Class that handles Target Node Strategy logic, primarily for COACHED mode
 */
public class TargetNodes {
    
    private List<String> nextNodes;     //nodes that should be next according to TNS
    private List<String> firstNodes;    //<Order>1</Order> in the XML; these are your target nodes
    private static Logger logs = Logger.getLogger("DevLogs");

//  Fills the firstNodes list after the task solution has been read in
    public void initFirstNodes(List<SolutionNode> solutionNodes){
        logs.debug("initializing first nodes");
        for(SolutionNode solutionNode : solutionNodes){
            if(solutionNode.getNodeOrder() == 1){
                logs.debug("Adding to First Nodes : " + solutionNode.getNodeName());
                addFirstNode(solutionNode.getNodeName());
            }
        }
        setNextNodes();
    }
    
//  Fills the nextNodes list by starting with the firstNodes; if a firstNode is absent, adds it to be the next node
//  in the TNS, if the firstNode is present in the graph it parses to see if its inputs are present.
//  nextNodes is cleared at the start so it will be empty if all nodes are present in the graph.
//  "parsed" list is to avoid recursion issues in parsing inputs.
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
    
//  Recursive function to parse through the nodes present in the graph to determine nextNodes in the TNS.
//  Checks the inputs for the node that is passed in; if a input is absent, adds it to be the next node
//  in the TNS, if the input is present in the graph it parses to see if its inputs are present.
//  "parsed" list is to avoid recursion issues in parsing inputs.
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
    
//  Gets the "best" available nextNode for use when Demoing on a Description panel.
//  If you're in an undefined vertex, will first try to make that vertex an element from firstNodes.
//  If all firstNodes are already present in the graph, will return the first element in nextNodes.
//  If you're in a defined vertex, it will return an input of that vertex, or the first
//  element in nextNodes if all inputs are defined.
//  Returns null if nextNodes are empty, indicating all nodes present in graph.

    public String getFirstNextNode(Vertex openVertex) {
        List<String> nodes = MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVerticesByName();
        
        if(!nextNodes.isEmpty()){
            if(openVertex.getName().isEmpty()){
                for(String fNode : firstNodes){
                    if(!nodes.contains(fNode)){
                        return fNode;
                    }
                }
                return nextNodes.get(0);
            } else{
                SolutionNode node = ApplicationContext.getCorrectSolution().getNodeByName(openVertex.getName());
                if(node != null) {
                    List<String> inputs = node.getInputNodes();
                    for(String input : inputs){
                        if(!nodes.contains(input)){
                            return input;
                        }
                    }
                }
               
               return nextNodes.get(0);
            }
        }
        return null;
    }
    
}
