
package edu.asu.laits.model;

import java.util.Iterator;
import org.jgrapht.DirectedGraph;
import org.jgrapht.graph.DirectedMultigraph;
import org.jgrapht.graph.ListenableDirectedGraph;

/**
 * This class is used as the data structure for graphs in the GraphEditorPane.
 * 
 */
public class Graph<V, E> extends ListenableDirectedGraph<V, E> implements
		DirectedGraph<V, E> {
	private static final long serialVersionUID = 1L;

	public Graph(Class<E> edgeClass) {
		super(new DirectedMultigraph<V, E>(edgeClass));
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
}
