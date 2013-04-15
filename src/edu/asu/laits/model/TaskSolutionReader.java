/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

import java.util.List;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.io.Reader;
import java.util.ArrayList;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;


/**
 *
 * @author ramayantiwari
 */
public class TaskSolutionReader {
    private static Logger logs = Logger.getLogger("DevLogs");
    
    public TaskSolution loadSolution(String taskId) {
        // Create TaskSolution Object to hold all the information
        TaskSolution solution = new TaskSolution();
        
        try {
            Document parsedSolution = loadRootDocument(taskId);
            Element taskNode = parsedSolution.getRootElement();
            solution.setTaskType(taskNode.attributeValue("type"));
            solution.setPhase(taskNode.attributeValue("phase"));
            
            
            // Read Task Params
            fillTaskParams(solution, taskNode);
            
            //Read all the Correct Solution Nodes
            Element allNodes = taskNode.element("Nodes");
            fillAllCorrectNodes(solution, allNodes);
            
            //Read Given Nodes for Debug problem
            if(solution.getTaskType().equalsIgnoreCase("debug")){
                Element givenNodes = taskNode.element("GivenModel");
                fillGivenNodes(solution, givenNodes);
            }
            //Fill Description Tree in the Solution Structure
            Element descriptionTree = taskNode.element("DescriptionTree");
            fillDescriptionTree(solution, descriptionTree);
                
        } catch (Exception e) {
            // Could not read the XML file
            e.printStackTrace();
        }
        
        return solution;
    }
    
    private Document loadRootDocument(String taskId) throws Exception{
        String solutionFilePath = "Task/Task"+taskId+".xml";
        Document document = null;
        SAXReader reader = new SAXReader();
        InputStream in = getClass().getResourceAsStream(solutionFilePath);
        //File file = new File(getClass().getResource(solutionFilePath).toURI());
        //File file = new File(solutionFilePath);
        document = reader.read(in);
        
        return document;
    }
    
    private void fillTaskParams(TaskSolution solution, Element rootNode){
        solution.setTaskDescription(rootNode.elementTextTrim("TaskDescription"));
        solution.setImageURL(rootNode.elementText("URL"));
        solution.setStartTime(Integer.parseInt(rootNode.elementTextTrim("StartTime")));
        solution.setEndTime(Integer.parseInt(rootNode.elementTextTrim("EndTime")));
        solution.setGraphUnits(rootNode.elementTextTrim("Units"));
        solution.setNodeCount(Integer.parseInt(rootNode.elementTextTrim("NodeCount")));
    }
    
    private void fillAllCorrectNodes(TaskSolution solution, Element nodes){
        fillNodes(solution.getSolutionNodes(), nodes);
        List<SolutionNode> allNodes = solution.getSolutionNodes();
        for(SolutionNode node : allNodes){
            if(!node.isExtra()){
                solution.getCorrectNodeNames().add(node.getNodeName());
            }
        }
    }
    
    private void fillDescriptionTree(TaskSolution solution, Element dTree){
        List<Element> allNodes = dTree.elements("Node");
        
        // Create the root dTree object
        SolutionDTreeNode rootNode = new SolutionDTreeNode("Nodes","root",false);
        
        for(Element node : allNodes){
            fillDTreeNodeRecursively(node, rootNode);            
        }
        
        solution.setdTreeNode(rootNode);
    }
    
    private void fillDTreeNodeRecursively(Element xmlNode, SolutionDTreeNode node){
        String desc = xmlNode.elementTextTrim("Description");
        String name = xmlNode.elementTextTrim("NodeName");
        boolean isLeaf = (name == null) ? false : true;
        
        SolutionDTreeNode nextNode = null;
        if(desc != null && !desc.equalsIgnoreCase("")){
            nextNode = new SolutionDTreeNode(desc, name, isLeaf);
            node.add(nextNode);
        }
        
        List<Element> allNodes = xmlNode.elements("Node");
        
        if(allNodes.size() != 0 ){
            for(Element innerNode : allNodes){
                fillDTreeNodeRecursively(innerNode, (nextNode == null) ? node : nextNode);
            }
        }
    }
    
    private void fillGivenNodes(TaskSolution solution, Element nodes){        
        fillNodes(solution.getGivenNodes(), nodes);
    }
    
    private void fillNodes(List<SolutionNode> list, Element nodes){
        //Extract all the XML nodes in a list
        List<Element> allNodes = nodes.elements("Node");
        
        for(Element node : allNodes){
            SolutionNode newNode = new SolutionNode();
            
            newNode.setNodeName(node.attributeValue("name"));
            newNode.setNodeType(node.attributeValue("type"));
            newNode.setIsExtra(node.attributeValue("extra"));
            
            // Read all the Input Nodes of this node
            Element nodeInput = node.element("Inputs");
            List<Element> allInputNodes = nodeInput.elements("Name");
            List<String> inputNodes = new ArrayList<String> ();
            
            for(Element inputNode : allInputNodes){
                inputNodes.add(inputNode.getTextTrim());                
            }
            
            newNode.setInputNodes(inputNodes);
            
            // Read remaining info of the node
            newNode.setNodeEquation(node.elementTextTrim("Equation"));
            newNode.setInitialValue(node.elementTextTrim("InitialValue"));
            newNode.setCorrectDescription(node.elementTextTrim("CorrectDescription"));
            newNode.setNodePlan(node.elementTextTrim("Plan"));
            
            list.add(newNode);
        }
    }
}
