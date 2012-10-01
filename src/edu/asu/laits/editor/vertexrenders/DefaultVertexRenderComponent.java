package edu.asu.laits.editor.vertexrenders;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.Stroke;
import java.awt.geom.Rectangle2D;
import java.util.Map;


import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphEditorVertexView;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.Shape;
import org.apache.log4j.Logger;
import org.jgraph.JGraph;
import org.jgraph.graph.CellView;
import org.jgraph.graph.DefaultGraphCell;

/**
 * This class extends the class VertexRender in the JGraph components to be a
 * vertex render for circle vertex type.
 */
public class DefaultVertexRenderComponent extends VertexRenderComponent {

    private boolean selected;
    private boolean focus;
    private boolean preview;
    private Color background;
    private Rectangle2D bounds;
    private VertexRenderComponent defaultVertexRenderComponent = null;
    private boolean useGraphBackground;
    private Color foreground;
    private GraphEditorPane graphPane;
    private Vertex currentVertex;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger(DefaultVertexRenderComponent.class);

    /**
     * @param defaultVertexRenderComponent
     */
    public DefaultVertexRenderComponent(
            VertexRenderComponent defaultVertexRenderComponent) {
        super();
        this.defaultVertexRenderComponent = defaultVertexRenderComponent;
    }

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {

        graphPane = (GraphEditorPane)graph;
        
        // CHECK IF WE HAVE TO CHANGE RENDER
        Map<Object, Object> attributes = null;

        if (((DefaultGraphCell) view.getCell()) != null) {
            attributes = ((DefaultGraphCell) view.getCell()).getAttributes();
            DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
            currentVertex = (Vertex)cell.getUserObject();
        } else {
            attributes = view.getAllAttributes();
        }

        fetchSelectable(attributes);

        useGraphBackground = GraphEditorConstants
                .getUseGraphBackground(attributes);

        foreground = GraphEditorConstants.getForeground(attributes);

        if (foreground == null) {
            foreground = Color.BLACK;
        }
        background = GraphEditorConstants.getBackground(attributes);
        if (background == null) {
            background = Color.WHITE;
        }
        
        // CHECK END
        // TODO Auto-generated method stub
        if (view instanceof GraphEditorVertexView) {
            GraphEditorVertexView graphVertexView = (GraphEditorVertexView) view;
            graphVertexView.setLocalRenderer(this);
        }
        this.selected = sel;
        this.focus = focus;
        this.preview = preview;

        bounds = new Rectangle(0, 0, 0, 0);

        this.setBounds(bounds.getBounds());

        background = GraphEditorConstants.getBackground(attributes);
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
        
        if (preview || !selected) {
            if (!useGraphBackground) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillRect(0, 0, getWidth() - 1, getHeight() - 1);
                g2.setColor(prevColor);
            }
            // Draw when the vertex is not selected
            g2.drawRect(5, 5, getWidth() - 10, getHeight() - 25); 
            g2.drawRect(0, 0, getWidth() - 1, getHeight() - 15); 
        } else {
            if (!useGraphBackground) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillRect(0, 0, getWidth() - 1, getHeight() - 1);
                g2.setColor(prevColor);
            }
            Stroke previousStroke = g2.getStroke();
            g2.setStroke(GraphEditorConstants.SELECTION_STROKE);
            g2.drawRect(5, 5, getWidth() - 10, getHeight() - 25);
            g2.drawRect(0, 0, getWidth() -1, getHeight() -15);
            g2.setStroke(previousStroke);
        }
        g2.drawString(currentVertex.getName(), getWidth()/2 - 20, getHeight());
        paintSelectable(g);

    }
}
