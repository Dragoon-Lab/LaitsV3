/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */
package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.model.Edge.ErrorReaderException;
import java.io.IOException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 *
 * @author ramayantiwari
 */
public class LaitsSolutionExporter {

    Graph<Vertex, Edge> graph = null;
    private static Logger logs = Logger.getLogger("DevLogs");
    
    public LaitsSolutionExporter() {
        this.graph = MainWindow.getInstance().getGraphEditorPane().getModelGraph();         
    }

    public boolean export() throws ErrorReaderException {
        String httpReponse = "";
        try {
            Document document = DocumentHelper.createDocument();

            Element task = addRootElement(document);
            addTaskDetails(task);
            addAllNodes(task);
            addDescriptionTree(task);
            
            String serviceURL = ApplicationContext.getRootURL().concat("/save_solution.php");
            httpReponse = PersistenceManager.sendHTTPRequest("author_save", serviceURL, document.asXML());
            
            if (Integer.parseInt(httpReponse) == 200) {
                logs.info("Successfully sent exported solution to server.");
                return true;
            } else {
                logs.info("Solution export to server failed: "+httpReponse);
                return false;
            }
        } catch (IOException ex) {
            logs.error("Error in Exporting Solution. Response: " + httpReponse);
            ex.printStackTrace();
            return false;
        }
    }

    public String getXML() throws ErrorReaderException {
        Document document = DocumentHelper.createDocument();

        Element task = addRootElement(document);
        addTaskDetails(task);
        addAllNodes(task);
        addDescriptionTree(task);
        return document.asXML();
    }

    private Element addRootElement(Document document) {
        // Task Root element
        Task taskToExport = ApplicationContext.getCurrentTask();
        Element task = document.addElement("Task");
        task.addAttribute("phase", taskToExport.getPhase());
        task.addAttribute("type", taskToExport.getTaskType());

        return task;
    }

    private void addTaskDetails(Element task) {
        logs.info("Adding Task Details");
        
        Task taskToExport = ApplicationContext.getCurrentTask();
        
        Element taskName = task.addElement("TaskName");
        taskName.setText(taskToExport.getTaskName());
        Element taskDescription = task.addElement("TaskDescription");
        taskDescription.setText(taskToExport.getTaskDescription());
        Element URL = task.addElement("URL");
        URL.setText(taskToExport.getImageURL());


        Element startTime = task.addElement("StartTime");
        startTime.setText(String.valueOf(taskToExport.getTimes().getStartTime()));

        Element endTime = task.addElement("EndTime");
        endTime.setText(String.valueOf(taskToExport.getTimes().getEndTime()));

        Element timeStep = task.addElement("TimeStep");
        timeStep.setText(String.valueOf(taskToExport.getTimes().getTimeStep()));

        Element units = task.addElement("Units");
        units.setText(taskToExport.getChartUnits());
    }

    private void addAllNodes(Element task) throws ErrorReaderException {
        logs.info("Adding info about all the nodes");
        
        Element nodeCount = task.addElement("NodeCount");
        nodeCount.setText(String.valueOf(graph.vertexSet().size()));

        // Fill all the Node Details
        Element nodes = task.addElement("Nodes");
        Iterator<Vertex> vertices = graph.vertexSet().iterator();

        while (vertices.hasNext()) {
            Vertex vertex = vertices.next();
            Element node = nodes.addElement("Node");
            addNodeDetails(vertex, node);
        }

    }

    private void addNodeDetails(Vertex vertex, Element node) throws ErrorReaderException {        
        logs.info("Adding Details for Node: '" + vertex.getName() + "'");
        
        String s = vertex.getVertexType().name();
        node.addAttribute("type", s.toLowerCase());
        node.addAttribute("name", vertex.getName());
        
        // Extra can be determined based on no of inputs and outputs.
        if(graph.incomingEdgesOf(vertex).size() == 0 && graph.outgoingEdgesOf(vertex).size() == 0) {
            node.addAttribute("extra", "yes");
        } else {
            node.addAttribute("extra", "no");
        }
        

        Element correctDesc = node.addElement("CorrectDescription");
        correctDesc.setText(vertex.getCorrectDescription());

        Element plan = node.addElement("Plan");
        addPlanDetails(vertex, plan);

        Element inputs = node.addElement("Inputs");
        addInputDetails(vertex, inputs);

        Element outputs = node.addElement("Outputs");
        addOutputDetails(vertex, outputs);

        Element equation = node.addElement("Equation");

        if (vertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            equation.setText(String.valueOf(vertex.getInitialValue()));
        } else {
            equation.setText(vertex.getEquation());
        }

        Element initialValue = node.addElement("InitialValue");
        initialValue.setText(String.valueOf(vertex.getInitialValue()));
    }

    private void addPlanDetails(Vertex vertex, Element node) {
        if (vertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            node.setText("fixed value");
        } else if (vertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            node.setText("said to both increase and decrease");
        } else if (vertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            node.setText("proportional to accumulator and input");
        } else {
            node.setText("UNDEFINED");
        }
    }

    private void addInputDetails(Vertex vertex, Element node) throws ErrorReaderException {
        logs.info("Adding Input Details for Vertex: '" + vertex.getName() + "'");
        
        // Add Input Nodes       
        Iterator<Edge> edges = graph.incomingEdgesOf(vertex).iterator();
        while (edges.hasNext()) {
            Edge e = edges.next();
            e.fetchInformationFromJGraphT(graph);
            Vertex source = graph.getVertexById(e.getSourceVertexId());
            // Make sure source is not the same Vertex
            if (source != null && !source.getName().equals(vertex.getName())) {
                Element el = node.addElement("Name");
                el.addText(source.getName());
            } 
        }
    }

    private void addOutputDetails(Vertex vertex, Element node) throws ErrorReaderException {
        // Add Ouput Nodes
        Iterator<Edge> edges = graph.outgoingEdgesOf(vertex).iterator();
        while (edges.hasNext()) {
            Edge e = edges.next();
            e.fetchInformationFromJGraphT(graph);
            Vertex source = graph.getVertexById(e.getTargetVertexId());
            // Make sure source is not the same Vertex
            if (source != null && !source.getName().equals(vertex.getName())) {
                Element el = node.addElement("Name");
                el.addText(source.getName());
            } 
        }
    }

    private void addDescriptionTree(Element task) {
        logs.info("Adding Description Tree to Exported Solution");
        
        Element descriptionTree = task.addElement("DescriptionTree");
        
        Set<Vertex> vertexSet = graph.vertexSet();
        Set<String> allDescriptions = new HashSet<String>();
        
        for(Vertex v : vertexSet){
            allDescriptions.add(v.getCorrectDescription() + "#" +v.getName());
            allDescriptions.addAll(v.getFakeDescription());
            
            for(String s : allDescriptions) {
                String[] parts = s.split("#");
                String description = parts[0].trim();
                String name = (parts.length > 1)?parts[1].trim():v.getName();
                
                Element node = descriptionTree.addElement("Node");
                node.addAttribute("level", "leaf");
                
                Element desc = node.addElement("Description");
                desc.setText(description);
                
                Element nodeName = node.addElement("NodeName");
                nodeName.setText(name);
            }
            
            allDescriptions.clear();
        }                        
    }
}