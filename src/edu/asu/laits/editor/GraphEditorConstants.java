package edu.asu.laits.editor;

import java.awt.Color;
import java.util.Map;

import edu.asu.laits.model.Vertex.VertexType;
import org.apache.log4j.Logger;
import org.jgraph.graph.GraphConstants;

/**
 * This class overrides GraphConstants to add methods for some additional
 * constants.
 */
public class GraphEditorConstants extends GraphConstants {

    public static final String SHAPE = "shape";
    public static final String USE_GRAPH_BACKGROUND = "use_graph_background";
    
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger(GraphEditorConstants.class);

    /**
     * Sets the shape attribute in the specified map to the specified value.
     */
    public static final void setShape(Map map, VertexType shape) {
        map.put(SHAPE, shape);
    }

    /**
     * Returns the shape attribute in the specified map if it exists.
     */
    public static final VertexType getShape(Map map) {
        Object shape = map.get(SHAPE);
        if (null == shape) {
            return null;
        }

        if (shape instanceof VertexType) {
            return (VertexType) shape;

        }
        return null;
    }

    /**
     * Sets the use backround attribute in the specified map to the specified
     * value. This is used to set if a custom backround is going to be used or
     * just the backround of the graph for the vertex that has the attribute.
     */
    public static final void setUseGraphBackground(Map map,
            boolean useGraphBackround) {
        map.put(USE_GRAPH_BACKGROUND, useGraphBackround);
    }

    /**
     * Returns the use graph backroun attribute in the specified map if it
     * exists. If it doesn't exist true is returned.
     */
    public static final boolean getUseGraphBackground(Map map) {
        Object useGraphBackround = map.get(USE_GRAPH_BACKGROUND);
        if (null == useGraphBackround) {
            return true;
        }

        if (useGraphBackround instanceof Boolean) {
            return (Boolean) useGraphBackround;

        }
        return true;
    }
}
