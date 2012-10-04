package edu.asu.laits.editor.vertexrenders;

import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.Stroke;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Map;

import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphEditorVertexView;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexType;
import java.awt.BasicStroke;
import org.jgraph.JGraph;
import org.jgraph.graph.CellView;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.VertexRenderer;
import org.jgraph.graph.VertexView;

/**
 * This class extends the class VertexRender in the JGraph components to be a
 * vertex render for square vertex type.
 *
 */
public class StockVertexRenderComponent extends VertexRenderComponent {

    private boolean selected;
    private boolean focus;
    private boolean preview;
    private Color background;
    private Rectangle2D bounds;
    private static FlowVertexRenderComponent circleVertexRenderComponent = new FlowVertexRenderComponent();
    private VertexRenderComponent defaultVertexRenderComponent = null;
    private Color foreground;
    private boolean useGraphBackround;
    private Vertex currentVertex;

    /**
     * @param defaultVertexRenderComponent
     */
    public StockVertexRenderComponent(
            VertexRenderComponent defaultVertexRenderComponent) {
        super();
        this.defaultVertexRenderComponent = defaultVertexRenderComponent;
    }

    public StockVertexRenderComponent() {
        super();
    }

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {
        // CHECK IF WE HAVE TO CHANGE RENDER
        Map<Object, Object> atributes = null;
        if (((DefaultGraphCell) view.getCell()) != null) {
            atributes = ((DefaultGraphCell) view.getCell()).getAttributes();
            DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
            currentVertex = (Vertex)cell.getUserObject();
        } else {
            atributes = view.getAllAttributes();
        }
        fetchSelectable(atributes);
        useGraphBackround = GraphEditorConstants
                .getUseGraphBackground(atributes);
        foreground = GraphEditorConstants.getForeground(atributes);
        if (foreground == null) {
            foreground = Color.BLACK;
        }
        background = GraphEditorConstants.getBackground(atributes);
        if (background == null) {
            background = Color.WHITE;
        }

        if (graph != null) {
            VertexType shape = GraphEditorConstants.getShape(atributes);
            GraphEditorPane graphPane = (GraphEditorPane) graph;

            if (view instanceof GraphEditorVertexView) {
                GraphEditorVertexView graphVertexView = (GraphEditorVertexView) view;
                graphVertexView.setLocalRenderer(this);
            }
        }
        this.selected = sel;
        this.focus = focus;
        this.preview = preview;

        bounds = GraphEditorConstants.getBounds(atributes);

        if (bounds == null) {
            bounds = new Rectangle(20, 20, 20, 20);
        }

        this.setBounds(bounds.getBounds());

        background = GraphEditorConstants.getBackground(atributes);
        if (background == null) {
            background = Color.WHITE;
        }

        return this;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        drawVertex(g);

    }

    public void drawVertex(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setColor(foreground);
        if(selected)
            g2.setStroke(new BasicStroke(2, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, new float[]{9}, 0));
        else
            g2.setStroke(new BasicStroke(3));
        g2.drawRect(60, 0, getWidth() - 62, getHeight() - 18); 
        
        String vertexName = currentVertex.getName();
        double x = (getWidth()+60) - vertexName.length() * 8.18;
        x/=2;
        
        g2.drawString(vertexName, (int)x, getHeight());
        paintVertexStatusIcons(g, currentVertex);
        paintSelectable(g);

    }
}
