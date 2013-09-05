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

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Iterator;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;

/**
 *
 * @author ramayantiwari
 */
public class LaitsSolutionExporter {

    Graph<Vertex, Edge> graph = null;
    File solutionFileName = null;

    public LaitsSolutionExporter(Graph<Vertex, Edge> g, File name) {
        this.graph = g;
        this.solutionFileName = name;
    }

    public void export() {
        try {
            Document document = DocumentHelper.createDocument();

            Element task = addRootElement(document);
            addTaskDetails(task);
            addAllNodes(task);
            addDescriptionTree(task);
            save(document);

        } catch (Exception ex) {
            ex.printStackTrace();
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
        Element task = document.addElement("Task");
        task.addAttribute("phase", "");
        task.addAttribute("type", "");

        return task;
    }

    private void addTaskDetails(Element task) {
        Element taskName = task.addElement("TaskName");
        Element taskDescription = task.addElement("TaskDescription");
        Element URL = task.addElement("URL");


        Element startTime = task.addElement("StartTime");
        startTime.setText(String.valueOf(graph.getCurrentTask().getStartTime()));

        Element endTime = task.addElement("EndTime");
        endTime.setText(String.valueOf(graph.getCurrentTask().getEndTime()));

        Element units = task.addElement("Units");
        units.setText(graph.getCurrentTask().getUnits());
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
        if (vertex.getPlan().equals(Vertex.Plan.FIXED)) {
            node.setText("fixed value");
        } else if (vertex.getPlan().equals(Vertex.Plan.INCREASE_AND_DECREASE)) {
            node.setText("said to both increase and decrease");
        } else if (vertex.getPlan().equals(Vertex.Plan.INCREASE)) {
            node.setText("said to increase");
        } else if (vertex.getPlan().equals(Vertex.Plan.DECREASE)) {
            node.setText("said to decrease");
        } else if (vertex.getPlan().equals(Vertex.Plan.PROPORTIONAL)) {
            node.setText("proportional to accumulator and input");
        } else if (vertex.getPlan().equals(Vertex.Plan.RATIO)) {
            node.setText("ratio of two quantities");
        } else if (vertex.getPlan().equals(Vertex.Plan.DIFFERENCE)) {
            node.setText("the difference of two quantities");
        } else {
            node.setText("UNDEFINED");
        }
    }

    private void addInputDetails(Vertex vertex, Element node) {
        // Add Input Nodes
        Iterator<Edge> edges = graph.incomingEdgesOf(vertex).iterator();
        while (edges.hasNext()) {
            Edge e = edges.next();
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
        // Create Description Tree
        Element descriptionTree = task.addElement("DescriptionTree");
        descriptionTree.addText("To Be Filled");
    }

    private void save(Document document) throws IOException {
        OutputFormat format = OutputFormat.createPrettyPrint();
        XMLWriter output = new XMLWriter(new FileWriter(solutionFileName), format);
        output.write(document);
        output.close();
    }
}
