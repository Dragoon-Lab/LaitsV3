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
import edu.asu.laits.logger.HttpAppender;
import org.jgrapht.ext.JGraphModelAdapter;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.core.BaseException;
import com.thoughtworks.xstream.io.xml.DomDriver;
import java.util.List;
import java.util.logging.Level;
import org.apache.log4j.Logger;
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
        } catch (BaseException e) {
            // Could not read the XML file
            logs.debug(e.getMessage());
            throw new IncorcectGraphXMLFileException();
        }

        getGraph(graphFile, file);
    }

    public void loadFromServer(String xmlString)
            throws IncorcectGraphXMLFileException {

        // Used to load objects from xml
        XStream xstream = new XStream(new DomDriver());

        xstream.alias("vertex", Vertex.class);
        xstream.alias("edge", Edge.class);
        xstream.alias("graph", GraphFile.class);
        xstream.alias("task", Task.class);

        GraphFile graphFile = null;
        try {
            graphFile = (GraphFile) xstream.fromXML(xmlString);
        } catch (BaseException e) {
            // Could not read the XML file
            logs.debug(e.getMessage());
            logs.debug(xmlString);
            throw new IncorcectGraphXMLFileException();
        }
        getGraph(graphFile, null);
    }

    public void getGraph(GraphFile graphFile, File file)
            throws IncorcectGraphXMLFileException {

        // An hash which makes it fast to find vertices
        HashMap<Integer, Vertex> vertexHash = new HashMap<Integer, Vertex>();

        List<Vertex> vertexList = graphFile.getVertexList();
        for (Vertex vertex : vertexList) {
            try {
                vertex.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
                graphPane.addVertex(vertex);
                System.out.println("Added " + vertex.getName() + "  "+vertex.getVertexIndex());
                vertexHash.put(vertex.getVertexIndex(), vertex);
                logs.debug("removing from next nodes  " + vertex.getName() + "  "+vertex.getVertexIndex());
                if(!ApplicationContext.isAuthorMode())
                ApplicationContext.setNextNodes(vertex.getName());
            }
            catch (Exception e){
                logs.debug("Could not load node:  "+e.getMessage());
                e.printStackTrace();
            }
        }

        /*
         * Load all edges
         */
        List<Edge> edgeList = graphFile.getEdgeList();

        for (Edge edge : edgeList) {
            System.out.println("Edge From: "+edge.getSourceVertexId()+"   To: "+edge.getTargetVertexId());
            Vertex sInfo = vertexHash.get(edge.getSourceVertexId());
            Vertex tInfo = vertexHash.get(edge.getTargetVertexId());

            DefaultPort p1 = graphPane.getJGraphTModelAdapter().getVertexPort(sInfo);
            DefaultPort p2 = graphPane.getJGraphTModelAdapter().getVertexPort(tInfo);

            graphPane.insertEdge(p1, p2);
        }
//        int index = 0;
//        for (Vertex vertex : vertexList) {
//            vertex.setVertexIndex(index);
//            index++;
//        }

        GraphProperties prop = graphFile.getProperties();
        prop.initializeNotSerializeFeelds();

        graphPane.setScale(prop.getZoomLevel());
        graphPane.setBackground(prop.getBackgroundColor());
        graphPane.setGraphProperties(prop);
        
        graphPane.validate();
        graphPane.repaint();
        
        Graph graph = (Graph) graphPane.getModelGraph();
        graph.setCurrentTask(graphFile.getTask());

        prop.setSavedAs(file);
    }
}
