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
        
        /*
        * Check for saved state on server. Currently being checked in FileMenu.java before open window is displayed.
        * This code can be removed if we keep the check in FileMenu.java (keep contents of if statement but remove if
        * surrounding code ("if(...){" and "}") and remove else block in this method).
        */
        String user = ApplicationContext.getUserID();
        
        String group = "login.html";//****If group is added or changed this line needs to be updated.****
        
        String probNum = ApplicationContext.getCurrentTaskID();
        String xmlString = "";
        HttpAppender get = new HttpAppender();
        try {
            xmlString = get.sendHttpRequest("http://dragoon.asu.edu/demo/get_session.php?id=" 
                    + user + "&group=" + group + "&problem=" + probNum);
        } catch (Exception ex) {
            java.util.logging.Logger.getLogger(GraphLoader.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        /*
        * If saved state does not exist on server, load from file.
        */
        if(xmlString.trim().isEmpty()){
            // Used to load objects from xml
            XStream xstream = new XStream(new DomDriver());

            xstream.alias("vertex", Vertex.class);
            xstream.alias("edge", Edge.class);
            xstream.alias("graph", GraphFile.class);
            xstream.alias("task",Task.class);

            GraphFile graphFile = null;
            try {
                graphFile = (GraphFile) xstream.fromXML(reader);
            } catch (BaseException e) {
                // Could not read the XML file
                logs.debug(e.getMessage());
                throw new IncorcectGraphXMLFileException();
            }
            // An hash which makes it fast to find vertices
            HashMap<Integer, Vertex> vertexHash = new HashMap<Integer, Vertex>();

            List<Vertex> vertexList = graphFile.getVertexList();
            for (Vertex vertex : vertexList) {
                vertex.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
                graphPane.addVertex(vertex);
                vertexHash.put(vertex.getVertexIndex(), vertex);
            }

            /*
             * Load all edges
             */

            List<Edge> edgeList = graphFile.getEdgeList();

            JGraphModelAdapter<Vertex, Edge> model = graphPane
                    .getJGraphTModelAdapter();
            for (Edge edge : edgeList) {
                Vertex sInfo = vertexHash.get(edge.getSourceVertexId());
                Vertex tInfo = vertexHash.get(edge.getTargetVertexId());

                DefaultPort p1 = graphPane.getJGraphTModelAdapter().getVertexPort(sInfo);
                DefaultPort p2 = graphPane.getJGraphTModelAdapter().getVertexPort(tInfo);

                graphPane.insertEdge(p1, p2);
            }
            int index = 0;
            for (Vertex vertex : vertexList) {
                vertex.setVertexIndex(index);
                index++;
            }

            GraphProperties prop = graphFile.getProperties();
            prop.initializeNotSerializeFeelds();

            graphPane.setScale(prop.getZoomLevel());
            graphPane.setBackground(prop.getBackgroundColor());
            graphPane.setGraphProperties(prop);

            Graph graph = (Graph)graphPane.getModelGraph();
            graph.setCurrentTask(graphFile.getTask());

            prop.setSavedAs(file);
            
        }else{
            /*
            * If saved state exists on server, load from server.
            */
            loadFromServer(xmlString);            
        }                
    }
    
    public void loadFromServer(String xmlString)
            throws IncorcectGraphXMLFileException {
        
        // Used to load objects from xml
        XStream xstream = new XStream(new DomDriver());

        xstream.alias("vertex", Vertex.class);
        xstream.alias("edge", Edge.class);
        xstream.alias("graph", GraphFile.class);
        xstream.alias("task",Task.class);
        
        GraphFile graphFile = null;
        try {
            graphFile = (GraphFile) xstream.fromXML(xmlString);
        } catch (BaseException e) {
            // Could not read the XML file
            logs.debug(e.getMessage());
            throw new IncorcectGraphXMLFileException();
        }
        // An hash wich makes it fast to find vertices
        HashMap<Integer, Vertex> vertexHash = new HashMap<Integer, Vertex>();

        List<Vertex> vertexList = graphFile.getVertexList();
        for (Vertex vertex : vertexList) {
            vertex.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
            graphPane.addVertex(vertex);
            vertexHash.put(vertex.getVertexIndex(), vertex);
        }

        /*
         * Load all edges
         */

        List<Edge> edgeList = graphFile.getEdgeList();
        
        JGraphModelAdapter<Vertex, Edge> model = graphPane
                .getJGraphTModelAdapter();
        for (Edge edge : edgeList) {
            Vertex sInfo = vertexHash.get(edge.getSourceVertexId());
            Vertex tInfo = vertexHash.get(edge.getTargetVertexId());

            DefaultPort p1 = graphPane.getJGraphTModelAdapter().getVertexPort(sInfo);
            DefaultPort p2 = graphPane.getJGraphTModelAdapter().getVertexPort(tInfo);
      
            graphPane.insertEdge(p1, p2);
        }
        int index = 0;
        for (Vertex vertex : vertexList) {
            vertex.setVertexIndex(index);
            index++;
        }

        GraphProperties prop = graphFile.getProperties();
        prop.initializeNotSerializeFeelds();

        graphPane.setScale(prop.getZoomLevel());
        graphPane.setBackground(prop.getBackgroundColor());
        graphPane.setGraphProperties(prop);
        
        Graph graph = (Graph)graphPane.getModelGraph();
        graph.setCurrentTask(graphFile.getTask());
        
        //prop.setSavedAs(file);
    }
}
