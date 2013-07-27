package edu.asu.laits.model;

import java.util.LinkedList;

import edu.asu.laits.properties.GraphProperties;
import java.util.List;

/**
 * This class represents a graph file and is used by GraphSaver and GraphLoader
 * classes.
 */
public class GraphFile {

    private GraphProperties properties;
    private List<Vertex> vertexList;
    private List<Edge> edgeList;
    private Task task;

    public List<Edge> getEdgeList() {
        return edgeList;
    }

    public void setEdgeList(List<Edge> edgeList) {
        this.edgeList = edgeList;
    }

    public List<Vertex> getVertexList() {
        return vertexList;
    }

    public void setVertexList(List<Vertex> vertexList) {
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
