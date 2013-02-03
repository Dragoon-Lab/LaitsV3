
package edu.asu.laits.model;

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
        
        public Task getCurrentTask(){
            return currentTask;
        }
        
        public void setCurrentTask(Task task){
            logs.debug("Setting new Task in the Graph with Start = "+
                    task.getStartTime()+" End = "+task.getEndTime());
            
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
}
