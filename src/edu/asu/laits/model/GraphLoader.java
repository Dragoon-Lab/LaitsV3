package edu.asu.laits.model;

import java.io.File;
import java.io.Reader;
import java.util.HashMap;
import java.util.LinkedList;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.properties.GraphProperties;
import org.jgraph.graph.Port;
import org.jgrapht.ext.JGraphModelAdapter;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.core.BaseException;
import com.thoughtworks.xstream.io.xml.DomDriver;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultPort;

/**
 * Object of this class can read graphs into a graph pane from the
 * xml-description of graphs.
 *
 */
public class GraphLoader {

    GraphEditorPane graphPane;
    private static Logger logs = Logger.getLogger(GraphLoader.class);

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
        xstream.alias("task",Task.class);
        
        GraphFile graphFile = null;
        try {
            graphFile = (GraphFile) xstream.fromXML(reader);
        } catch (BaseException e) {
            // Could not read the XML file
            logs.trace(e.getMessage());
            throw new IncorcectGraphXMLFileException();
        }
        // An hash wich makes it fast to find vertices
        HashMap<Integer, Vertex> vertexHash = new HashMap<Integer, Vertex>();

        LinkedList<Vertex> vertexList = graphFile.getVertexList();
        for (Vertex vertex : vertexList) {
            vertex.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
            graphPane.addVertex(vertex);
            vertexHash.put(vertex.getVertexIndex(), vertex);
        }

        /*
         * Load all edges
         */

        LinkedList<Edge> edgeList = graphFile.getEdgeList();
        
        JGraphModelAdapter<Vertex, Edge> model = graphPane
                .getJGraphTModelAdapter();
        for (Edge edge : edgeList) {
            Vertex sInfo = vertexHash.get(edge.getSourceVertexId());
            Vertex tInfo = vertexHash.get(edge.getTargetVertexId());

            //graphPane.connect((Port) model.getVertexCell(sInfo).getChildAt(0),
            //        (Port) model.getVertexCell(tInfo).getChildAt(0));
            DefaultPort p1 = graphPane.getJGraphTModelAdapter().getVertexPort(sInfo);
            DefaultPort p2 = graphPane.getJGraphTModelAdapter().getVertexPort(tInfo);
      
            graphPane.insertEdge(p1, p2);
        }
        for (Vertex vertex : vertexList) {
            vertex.generateNewVertexIndex();
        }

        GraphProperties prop = graphFile.getProperties();
        prop.initializeNotSerializeFeelds();

        graphPane.setScale(prop.getZoomLevel());
        graphPane.setBackground(prop.getBackgroundColor());
        graphPane.setGraphProperties(prop);
        
        Graph graph = (Graph)graphPane.getModelGraph();
        graph.setCurrentTask(graphFile.getTask());
        
        prop.setSavedAs(file);

    }
}
