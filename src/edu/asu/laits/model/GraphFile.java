package edu.asu.laits.model;

import java.util.LinkedList;

import edu.asu.laits.properties.GraphProperties;

/**
 * This class represents a graph file and is used by GraphSaver and GraphLoader
 * classes.
 */
public class GraphFile {

    private GraphProperties properties;
    private LinkedList<Vertex> vertexList;
    private LinkedList<Edge> edgeList;
    private Task task;

    public LinkedList<Edge> getEdgeList() {
        return edgeList;
    }

    public void setEdgeList(LinkedList<Edge> edgeList) {
        this.edgeList = edgeList;
    }

    public LinkedList<Vertex> getVertexList() {
        return vertexList;
    }

    public void setVertexList(LinkedList<Vertex> vertexList) {
        this.vertexList = vertexList;
    }

    public GraphProperties getProperties() {
        return properties;
    }

    public void setProperties(GraphProperties properties) {
        this.properties = properties;
    }
    
    public Task getTask(){
        return task;
    }
    
    public void setTask(Task task){
        this.task = task;
    }
}
