/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
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
import java.io.Reader;
import java.util.HashMap;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.properties.GraphProperties;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.DomDriver;
import java.util.Iterator;
import java.util.List;
import java.util.Scanner;
import net.sourceforge.jeval.EvaluationException;
import net.sourceforge.jeval.Evaluator;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.jgraph.graph.DefaultPort;

/**
 * Object of this class can read graphs into a graph pane from the
 * xml-description of graphs.
 *
 */
public class GraphLoader {

    GraphEditorPane graphPane;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public class IncorcectGraphXMLFileException extends Exception {
    };

    /**
     * @param reader
     */
    public GraphLoader(GraphEditorPane graphPane) {
        super();
        this.graphPane = graphPane;
    }

    public void load(Reader reader, File file)
            throws IncorcectGraphXMLFileException {
        // Used to load objects from xml
        XStream xstream = new XStream(new DomDriver());

        xstream.alias("vertex", Vertex.class);
        xstream.alias("edge", Edge.class);
        xstream.alias("graph", GraphFile.class);
        xstream.alias("task", Task.class);

        GraphFile graphFile = null;
        try {
            graphFile = (GraphFile) xstream.fromXML(reader);
        } catch (Exception ex) {
            // Could not read the XML file
            logs.debug(ex.getMessage());
            throw new IncorcectGraphXMLFileException();
        }

        getGraph(graphFile, file);
    }

    public void loadFromServer(String xmlString)
            throws IncorcectGraphXMLFileException, DocumentException {
        String processedXML = preprocessOldVersionXML(xmlString);
        
        // Used to load objects from xml
        XStream xstream = new XStream(new DomDriver());

        xstream.alias("vertex", Vertex.class);
        xstream.alias("edge", Edge.class);
        xstream.alias("graph", GraphFile.class);
        xstream.alias("task", Task.class);

        GraphFile graphFile = null;
        try {
            graphFile = (GraphFile) xstream.fromXML(processedXML);
        } catch (Exception ex) {
            // Could not read the XML file
            logs.debug(ex.getMessage());
            logs.debug(xmlString);
            ex.printStackTrace();
            throw new IncorcectGraphXMLFileException();
        }
        getGraph(graphFile, null);
    }
    
    private String preprocessOldVersionXML(String xmlString) throws DocumentException {
        logs.info("Processing GraphXML to remove unused elements");
        
        Document document = DocumentHelper.parseText(xmlString);
        Element el = document.getRootElement();
        Element prop = el.element("properties");
        if(prop != null) {
            el.remove(prop);
        }
        
        Element vList = el.element("vertexList");
        if(vList != null) {
            Iterator<Element> it = vList.elementIterator();
            while(it.hasNext()) {
                Element vertex = it.next();
                Element useBack = vertex.element("useGraphBackround");
                if(useBack != null) {
                    vertex.remove(useBack);
                }
                
                Element back = vertex.element("backgroundColor");
                if(back != null) {
                    vertex.remove(back);
                }
                
                Element fore = vertex.element("foregroundColor");
                if(fore != null) {
                    vertex.remove(fore);
                }
            }
        }
        
        return el.asXML();
    }

    public void getGraph(GraphFile graphFile, File file)
            throws IncorcectGraphXMLFileException {
        // A hash which makes it fast to find vertices
        HashMap<Integer, Vertex> vertexHash = new HashMap<Integer, Vertex>();

        List<Vertex> vertexList = graphFile.getVertexList();
        for (Vertex vertex : vertexList) {
            vertex.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
            graphPane.addVertex(vertex);
            vertexHash.put(vertex.getVertexIndex(), vertex);

            logs.debug("Adding Vertex:  " + vertex.getName() + " at Index: " + vertex.getVertexIndex() + " to the GraphPane");

            // Reid changed this to ApplicationContext.isCoachedMode()
            // but he can't remember why
            if (!ApplicationContext.isAuthorMode()) {
                if(vertex.getName() != null && !vertex.getName().isEmpty())
                ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            }
        }

        /*
         * Load all edges
         */
        List<Edge> edgeList = graphFile.getEdgeList();

        for (Edge edge : edgeList) {
            Vertex sInfo = vertexHash.get(edge.getSourceVertexId());
            Vertex tInfo = vertexHash.get(edge.getTargetVertexId());

            DefaultPort p1 = graphPane.getJGraphTModelAdapter().getVertexPort(sInfo);
            DefaultPort p2 = graphPane.getJGraphTModelAdapter().getVertexPort(tInfo);

            graphPane.insertEdge(p1, p2);
        }

        // Validate Calculations
        for (Vertex vertex : vertexList) {
            if (!validateNodeEquation(vertex)) {
                vertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }
        }

        graphPane.validate();
        graphPane.repaint();

        if(ApplicationContext.isAuthorMode())
            ApplicationContext.setCurrentTask(graphFile.getTask());        
    }

    private boolean validateNodeEquation(Vertex currentVertex) {
        logs.debug("Validating Node Equations for Node : " + currentVertex.getName()
                + " Equation: " + currentVertex.getEquation());
        if (currentVertex.getVertexType().equals(Vertex.VertexType.DEFAULT)) {
            return true;
        }

        String equation = currentVertex.getEquation();

        if (!currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            if (equation.isEmpty()) {
                return false;
            }

            // Check Syantax of this equation
            Evaluator eval = new Evaluator();
            try {
                eval.parse(equation);
            } catch (EvaluationException ex) {
                ex.printStackTrace();
                return false;
            }

            List<String> availableVariables = graphPane.getModelGraph().getVerticesByName();
            List<String> usedVariables = eval.getAllVariables();

            // Check if this equation uses all the inputs
            for (String s : usedVariables) {
                if (!availableVariables.contains(s)) {
                    return false;
                }
                eval.putVariable(s, String.valueOf(Math.random()));
            }

            // Check Sematics of the equation
            try {
                eval.evaluate();
            } catch (EvaluationException ex) {
                ex.printStackTrace();
                logs.error("Error in evaluting expression " + ex.getMessage());
                return false;
            }            
        }
        return true;
    }
}
