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
import edu.asu.laits.model.Vertex.VertexType;
import java.awt.BasicStroke;
import java.awt.Font;
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
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

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
        
        if (view instanceof GraphEditorVertexView) {
            GraphEditorVertexView graphVertexView = (GraphEditorVertexView) view;
            graphVertexView.setLocalRenderer(this);
        }
        this.selected = sel;
        this.focus = focus;
        this.preview = preview;

        bounds = new Rectangle(0, 0, 0, 0);

        //this.setBounds(bounds.getBounds());

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
        if(selected){
            g2.setColor(Color.GRAY);           
        }
        g2.setStroke(new BasicStroke(3, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, new float[]{9}, 0));
        g2.drawRect(0, 0, getWidth() - 1, getHeight() - 18); 
        
        String vertexName = truncateNodeName(currentVertex.getName());
        double x = getWidth()/2 - (vertexName.length() * 3 -1);
       
        g2.setFont(new Font(null, Font.PLAIN, 10));
        g2.drawString(vertexName, (int)x-1, getHeight()-2);
        paintVertexStatusIcons(g, currentVertex);
        paintSelectable(g);        
    }
}
