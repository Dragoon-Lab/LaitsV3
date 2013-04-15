package edu.asu.laits.editor;

import org.jgraph.graph.DefaultCellViewFactory;
import org.jgraph.graph.VertexView;

/**
 * This class extends DefaultCellViewFactory in JGraph and overrides the method
 * createVertexView to return a custom vertex view.
 */
public class GraphEditorCellViewFactory extends DefaultCellViewFactory {

    @Override
    protected VertexView createVertexView(Object cell) {
        return new GraphEditorVertexView(cell);
    }
}
