
package edu.asu.laits.model;

import java.util.HashSet;
import java.util.Iterator;
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
        private Task currentTask;

        private static Logger logs = Logger.getLogger("DevLogs");
        
        
	public Graph(Class<E> edgeClass) {
		super(new DirectedMultigraph<V, E>(edgeClass));
                currentTask = new Task();
	}
        
        public Vertex getVertexByName(String name){
            Iterator it=this.vertexSet().iterator();
            Vertex v;
            while(it.hasNext())
            {
                v=(Vertex)it.next();
                if(v.getName().equals(name))
                    return v;
            }
            return null;
        }
        
        public Vertex getVertexById(int id){
            Iterator it = this.vertexSet().iterator();
            Vertex v;
            while(it.hasNext())
            {
                v=(Vertex)it.next();
                if(v.getVertexIndex() == id)
                    return v;
            }
            return null;
        }
        
        public Task getCurrentTask(){
            return currentTask;
        }
        
        public void setCurrentTask(Task task){
            logs.debug("Setting new Task in the Graph with Start = "+
                    task.getTimes().getStartTime()+" End = "+task.getTimes().getEndTime()+
                    "  dt="+task.getTimes().getTimeStep());
            
            if(task == null){
                currentTask = new Task();
            }else
                currentTask = task;
        }
        
        public synchronized void removeAll(){
            Set<V> allV = vertexSet();
            for(V vertex : allV){
                this.removeVertex(vertex);
            }
        }
        
        public int getNextAvailableIndex(){
            Set<Integer> usedSlots = new HashSet<Integer> ();
            
            for(V v : vertexSet()){
                Vertex vertex = (Vertex)v;
                usedSlots.add(vertex.getVertexIndex());
            }
            
            int max = vertexSet().size();
            for(int i=0; i<max ;++i){
                if(!usedSlots.contains(i))
                    return i;
            }
            
            return max;
        }
        
        public boolean isEmpty(){
             if(this.vertexSet().isEmpty()){
                 return true;
             } else{
                 return false;
             }
        }

    @Override
    public Object clone() {
        
        Graph<Vertex,Edge> graph = new Graph(Edge.class);
        Iterator<Vertex> itVertex = (Iterator<Vertex>) this.vertexSet().iterator();
        while (itVertex.hasNext()) {
            Vertex vertex = itVertex.next();
            graph.addVertex((Vertex)vertex.clone());
        }
        Iterator<Edge> itEdge = (Iterator<Edge>) this.edgeSet().iterator();
        while (itEdge.hasNext()) {
            Edge edge = itEdge.next();
            Edge clonedEdge = (Edge) edge.clone();
            graph.addEdge(graph.getVertexById(clonedEdge.getSourceVertexId()), graph.getVertexById(clonedEdge.getTargetVertexId()),clonedEdge);
        }
        graph.setCurrentTask(currentTask);
        
        return graph; //To change body of generated methods, choose Tools | Templates.
    }
        
        
}
