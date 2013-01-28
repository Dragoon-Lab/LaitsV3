package edu.asu.laits.editor;

import edu.asu.laits.editor.vertexrenders.VertexRenderComponent;
import org.apache.log4j.Logger;
import org.jgraph.graph.CellViewRenderer;
import org.jgraph.graph.VertexRenderer;
import org.jgraph.graph.VertexView;

/**
 * This class overrides VertexView to customize the view, to show Constant 
 * Vertices in the Model
 *
 */
public class GraphEditorVertexView extends VertexView {

    /**
     * Renderer for the class.
     */
    public static transient VertexRenderComponent renderer;
    private VertexRenderer localRenderer = null;
    
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    // Headless environment does not allow vertex renderer
    static {
        try {
            renderer = new VertexRenderComponent();            
        } catch (Error e) {
            // No vertex renderer
        }
    }

    public GraphEditorVertexView(Object cell) {
        super(cell);
    }

    
    @Override
    public CellViewRenderer getRenderer() {
        if (localRenderer != null) {
            return localRenderer;
        }

        return renderer;
    }

    public void setLocalRenderer(VertexRenderer localRenderer) {
        this.localRenderer = localRenderer;
    }
}
