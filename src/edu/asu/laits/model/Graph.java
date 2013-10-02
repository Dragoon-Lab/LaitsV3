package edu.asu.laits.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import org.apache.log4j.Logger;
import org.jgrapht.DirectedGraph;
import org.jgrapht.graph.DirectedMultigraph;
import org.jgrapht.graph.ListenableDirectedGraph;
import java.util.Set;

/**
 * This class is used as the data structure for graphs in the GraphEditorPane.
 *
 */
public class Graph<V, E> extends ListenableDirectedGraph<V, E> implements
        DirectedGraph<V, E> {

    private static final long serialVersionUID = 1L;
    private static Logger logs = Logger.getLogger("DevLogs");

    public Graph(Class<E> edgeClass) {
        super(new DirectedMultigraph<V, E>(edgeClass));        
    }

    public Vertex getVertexByName(String name) {
        Iterator it = this.vertexSet().iterator();
        Vertex v;
        while (it.hasNext()) {
            v = (Vertex) it.next();
            if (v.getName().equals(name)) {
                return v;
            }
        }
        return null;
    }

    public Vertex getVertexById(int id) {
        Iterator it = this.vertexSet().iterator();
        Vertex v;
        while (it.hasNext()) {
            v = (Vertex) it.next();
            if (v.getVertexIndex() == id) {
                return v;
            }
        }
        return null;
    }

    public synchronized void removeAll() {
        Set<V> allV = vertexSet();
        for (V vertex : allV) {
            this.removeVertex(vertex);
        }
    }

    public int getNextAvailableIndex() {
        Set<Integer> usedSlots = new HashSet<Integer>();

        for (V v : vertexSet()) {
            Vertex vertex = (Vertex) v;
            usedSlots.add(vertex.getVertexIndex());
        }

        int max = vertexSet().size();
        for (int i = 0; i < max; ++i) {
            if (!usedSlots.contains(i)) {
                return i;
            }
        }

        return max;
    }

    public boolean isEmpty() {
        if (this.vertexSet().isEmpty()) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public Object clone() {
        Graph currentGraph = this;
        Graph<Vertex, Edge> graph = new Graph(Edge.class);
        Iterator<Vertex> itVertex = (Iterator<Vertex>) this.vertexSet().iterator();
        while (itVertex.hasNext()) {
            Vertex vertex = itVertex.next();
            graph.addVertex((Vertex) vertex.clone());
        }

        Iterator<Edge> itEdge = (Iterator<Edge>) this.edgeSet().iterator();
        while (itEdge.hasNext()) {
            Edge edge = itEdge.next();
            Vertex sourceVertex = (Vertex) currentGraph.getEdgeSource(edge);
            Vertex targetVertex = (Vertex) currentGraph.getEdgeTarget(edge);
            graph.addEdge(graph.getVertexById(sourceVertex.getVertexIndex()), graph.getVertexById(targetVertex.getVertexIndex()));
        }
        
        return graph; //To change body of generated methods, choose Tools | Templates.
    }

    public List<String> getVerticesByName() {
        List<String> vertices = new ArrayList<String>();
        Set<V> allV = vertexSet();
        for (V v : allV) {
            Vertex vertex = (Vertex) v;
            vertices.add(vertex.getName());
        }
        return vertices;
    }
    
    /**
     * Removes all the incoming edges of this vertex
     * @param vertex 
     */
    public void removeIncomingEdgesOf(V vertex){
        Set<E> edgeSet = incomingEdgesOf(vertex);
        ArrayList<E> ee = new ArrayList<>(edgeSet);
        for(E e : ee){
            removeEdge(e);
        }
    }
}
