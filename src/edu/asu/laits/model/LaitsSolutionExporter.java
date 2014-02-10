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
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.gui.MainWindow;
import java.io.File;
import java.io.FileWriter;
import java.io.StringWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URLEncoder;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;
import org.apache.log4j.Logger;

/**
 *
 * @author ramayantiwari
 */
public class LaitsSolutionExporter {

    Graph<Vertex, Edge> graph = null;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Document document = DocumentHelper.createDocument();
    
    public LaitsSolutionExporter() {
        this.graph = MainWindow.getInstance().getGraphEditorPane().getModelGraph();
    }

    public boolean export() {
        String response="";
        try {
            document.clearContent();
            Element task = addRootElement(document);
            addTaskDetails(task);
            addAllNodes(task);
            addDescriptionTree(task);
            String serviceURL = ApplicationContext.getRootURL().concat("/save_solution.php");
            // Turn the document into a string, with pretty printing.
            // Could use document.asXML() but then there is no formatting.
            StringWriter stringWriter = new StringWriter();  
            OutputFormat format = OutputFormat.createPrettyPrint();  
            XMLWriter xmlwriter = new XMLWriter(stringWriter, format);  
            xmlwriter.write(document);  
            String sessionData = URLEncoder.encode(stringWriter.toString(), "UTF-8");
            response = PersistenceManager.sendHTTPRequest("author_save",
                    serviceURL,sessionData);
            if (Integer.parseInt(response) == 200) {
                logs.info("Successfully sent exported solution to server.");
                return true;
            } else {
                logs.info("Solution export to server failed: "+response);
                return false;
            }
        } catch (IOException ex) {
            logs.info("Error exporting solution server: "+response); 
            ex.printStackTrace();
            return false;
        }
    }
    
     public boolean save_file(File solutionFileName) {
        try {
            OutputFormat format = OutputFormat.createPrettyPrint();
            XMLWriter output = new XMLWriter(new FileWriter(solutionFileName), format);
            output.write(document);
            output.close();
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public String getXML(){
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

    private void addAllNodes(Element task) {
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

    // Extra NO is hardcoded
    private void addNodeDetails(Vertex vertex, Element node) {
        String s = vertex.getVertexType().name();
        node.addAttribute("type", s.toLowerCase());
        node.addAttribute("name", vertex.getName());
        node.addAttribute("extra", "no");

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

    private void addInputDetails(Vertex vertex, Element node) {
        logs.info("Adding Input Details for Vertex: '" + vertex.getName() + "'");
        
        // Add Input Nodes
        Iterator<Edge> edges = graph.incomingEdgesOf(vertex).iterator();
        while (edges.hasNext()) {
            Edge e = edges.next();
            
            System.out.println("SourceName: " + e.getSourceVertexId());
            System.out.println("TargetName: " + e.getTargetVertexId());
            Vertex source = graph.getVertexById(e.getSourceVertexId());
            Element el = node.addElement("Name");
            el.addText(source.getName());
        }
    }

    private void addOutputDetails(Vertex vertex, Element node) {
        // Add Input Nodes
        Iterator<Edge> edges = graph.outgoingEdgesOf(vertex).iterator();
        while (edges.hasNext()) {
            Edge e = edges.next();
            Vertex source = graph.getVertexById(e.getTargetVertexId());
            Element el = node.addElement("Node");
            el.addAttribute("name", source.getName());
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
