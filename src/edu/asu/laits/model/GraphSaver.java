package edu.asu.laits.model;

import java.io.Writer;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.Edge.ErrorReaderException;
import edu.asu.laits.model.Vertex.VertexReaderException;
import org.jgrapht.DirectedGraph;
import org.jgrapht.ListenableGraph;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.DomDriver;
import java.io.IOException;

/**
 * Objects of this class saves a graphs from a GraphEditorPanee to a xml-file
 * representation. The file representation consist of first some information
 * about the graph, a number of items represending vertices and then a list of
 * edges that conects vertices. The information of the grap is represented by
 * GraphProperties, the vertices by VertexInformation and edges by
 * EdgeInformation. The elements represnding the objects EdgeInformation,
 * VertexInformation and GraphProperties in the xml-file is the non transient
 * fields in the classes.
 *
 */
public class GraphSaver {

    /*
     * The graph pane that this saver can save to
     */
    private ListenableGraph<Vertex, Edge> modelGraph;
    private GraphEditorPane paneToSave;

    /**
     * @param paneToSave
     */
    public GraphSaver(GraphEditorPane paneToSave) {
        this.paneToSave = paneToSave;
        modelGraph = paneToSave.getModelGraph();
    }

    /**
     * Write the graph representation with the specified writer
     *
     * @param writer
     */
    public void write(Writer writer) throws IOException{
        String data = getSerializedGraphInXML();
        writer.write(data);
    }
    
    public String getSerializedGraphInXML(){
        XStream xstream = new XStream();

        List<Vertex> vertexList = fetchVertexInformation();
        xstream.alias("vertex", Vertex.class);

        List<Edge> edgeList = fetchEdgeInformation();
        xstream.alias("edge", Edge.class);

        GraphFile file = new GraphFile();
        file.setProperties(paneToSave.getGraphProperties());
        file.setVertexList(vertexList);
        file.setEdgeList(edgeList);
        
        xstream.alias("task", Task.class);
        Graph g = (Graph)modelGraph;
        file.setTask(g.getCurrentTask());

        xstream.alias("graph", GraphFile.class);
        
        return xstream.toXML(file);
    }
    
    private List<Vertex> fetchVertexInformation(){
        Set<Vertex> vertexSet = modelGraph.vertexSet();
        LinkedList<Vertex> vertexList = new LinkedList<Vertex>(
                vertexSet);

        for (Vertex vertex : vertexList) {
            try {
                vertex.fetchInformationFromJGraph();
            } catch (VertexReaderException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        
        return vertexList;
    }
    
    private List<Edge> fetchEdgeInformation(){
        Set<Edge> edgeSet = modelGraph.edgeSet();
        LinkedList<Edge> edgeList = new LinkedList<Edge>(
                edgeSet);

        for (Edge edge : edgeList) {
            try {
                edge.fetchInformationFromJGraphT(modelGraph);
            } catch (ErrorReaderException e) {
                e.printStackTrace();
            }
        }
        return edgeList;
    }
}
