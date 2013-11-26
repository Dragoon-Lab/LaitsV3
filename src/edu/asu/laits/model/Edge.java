package edu.asu.laits.model;

import java.awt.Color;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Map.Entry;

import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgrapht.Graph;
import org.jgrapht.ListenableGraph;

/**
 * This class represents information about an edge. The object can fetch
 * information about itself from a JGraphT graph with the method
 * fetchInformationFromJGraphT. It has a source and target vertex id. Object of
 * this class is used to save the edge information to an xml representation
 * directly using XStream
 */
public class Edge {

    transient private DefaultEdge jGraphEdge;
    private static final long serialVersionUID = -4081969696113643101L;
    private int sourceVertexId;
    private int targetVertexId;

    public Edge() {
        super();
    }

    public DefaultEdge getJGraphEdge() {
        return jGraphEdge;
    }

    public void setJGraphEdge(DefaultEdge graphEdge) {
        jGraphEdge = graphEdge;
    }

    public int getSourceVertexId() {
        return sourceVertexId;
    }

    public void setSourceVertexId(int sourceVertexId) {
        this.sourceVertexId = sourceVertexId;
    }

    public int getTargetVertexId() {
        return targetVertexId;
    }

    public void setTargetVertexId(int targetVertexId) {
        this.targetVertexId = targetVertexId;
    }

    public void fetchInformationFromJGraphT(
            ListenableGraph<Vertex, Edge> g)
            throws ErrorReaderException {
        // Fetch the id of the source and target vertex
        try {
            sourceVertexId = g.getEdgeSource(this).getVertexIndex();
            targetVertexId = g.getEdgeTarget(this).getVertexIndex();
        } catch (Exception e) {
            e.printStackTrace();
            // throw new ErrorWhenFetchingEdgeInformation();
        }

    }

    public String toString() {
        return "";

    }

    public Object clone() {
        Edge cloneEdge = new Edge();
        cloneEdge.setSourceVertexId(sourceVertexId);
        cloneEdge.setTargetVertexId(targetVertexId);
        return cloneEdge;
    }

    public class ErrorReaderException extends Exception {
    }
}
