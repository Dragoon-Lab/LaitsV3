package edu.asu.laits.editor.vertexrenders;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.util.Map;

import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphEditorVertexView;
import edu.asu.laits.model.Vertex.Shape;
import org.apache.log4j.Logger;
import org.jgraph.JGraph;
import org.jgraph.graph.CellView;
import org.jgraph.graph.CellViewRenderer;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.VertexRenderer; 

/**
 * This class extends the class VertexRender in the JGraph components to be a
 * vertex render for default vertex type. Depending on the settings of the
 * default vertex render different render components are returned.
 *
 */
public class VertexRenderComponent extends VertexRenderer implements
        DrawableVertex {

    Shape shape;
    private boolean selectable;
    private boolean selected;
    private boolean focus;
    private boolean preview;
    private Color background;
    
    static VertexRenderComponent defaultRender = new VertexRenderComponent();
    
    private static FlowVertexRenderComponent flowVertexRenderComponent =
            new FlowVertexRenderComponent(defaultRender);
    private static StockVertexRenderComponent stockVertexRenderComponent =
            new StockVertexRenderComponent(defaultRender);
    private static ConstantVertexRenderComponent constantVertexComponent =
            new ConstantVertexRenderComponent(defaultRender);
    private static DefaultVertexRenderComponent defaultVertexComponent =
            new DefaultVertexRenderComponent(defaultRender);
    
    /** Logger */
    private static Logger logs = Logger.getLogger(VertexRenderComponent.class);

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {

        Map<Object, Object> attributes = ((DefaultGraphCell) view.getCell())
                .getAttributes();

        Shape shape = GraphEditorConstants.getShape(attributes);

        if (shape == Shape.DEFAULT) {
            return defaultVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        }
        else if (shape == null || shape == Shape.FLOW) {
            return flowVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else if (shape == Shape.STOCK) {
            return stockVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else if (shape == Shape.CONSTANT) {
            return constantVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else {
            return super.getRendererComponent(graph, view, sel, focus, preview);
        }
    }

    public CellViewRenderer getRenderer(GraphEditorVertexView view, JGraph graph) {
       
        Map<Object, Object> atributes = view.getAllAttributes();

        Shape shape = GraphEditorConstants.getShape(atributes);

        if (shape == Shape.DEFAULT) {
            return defaultVertexComponent;
        }else if (shape == null || shape == Shape.FLOW) {
            return flowVertexRenderComponent;
        } else if (shape == Shape.STOCK) {
            return stockVertexRenderComponent;
        } else {
            return this;
        }
    }

    protected void fetchSelectable(Map attrs) {
        selectable = GraphEditorConstants.isSelectable(attrs);
    }

    /**
     * @return the selectable
     */
    public boolean isSelectable() {
        return selectable;
    }

    protected void paintSelectable(Graphics g) {
        if (!isSelectable()) {
            Graphics2D g2 = (Graphics2D) g;

            int width = (int) getBounds().getWidth();
            int height = (int) getBounds().getHeight();
            g2.setColor(Color.RED);

            g2.drawLine(0, 0, width, height);

            g2.drawLine(width, 0, 0, height);
        }

    }

    public void drawVertex(Graphics g) {
        paintComponent(g);

    }
}
