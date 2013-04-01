package edu.asu.laits.editor.vertexrenders;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.Stroke;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Map;

import javax.swing.JComponent;

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
import org.jgraph.graph.CellViewRenderer;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.VertexRenderer;
import org.jgraph.graph.VertexView;

/**
 * This class extends the class VertexRender in the JGraph components to be a
 * vertex render for circle vertex type.
 */
public class FlowVertexRenderComponent extends VertexRenderComponent {

    private boolean selected;
    private boolean focus;
    private boolean preview;
    private Color background;
    private Rectangle2D bounds;
    private static FlowVertexRenderComponent circleVertexRenderComponent = new FlowVertexRenderComponent();
    private VertexRenderComponent defaultVertexRenderComponent = null;
    private boolean useGraphBackground;
    private Color foreground;
    private Vertex currentVertex;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     * @param defaultVertexRenderComponent
     */
    public FlowVertexRenderComponent(
            VertexRenderComponent defaultVertexRenderComponent) {
        super();
        this.defaultVertexRenderComponent = defaultVertexRenderComponent;
    }

    public FlowVertexRenderComponent() {
        super();
    }

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {

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

        bounds = new Rectangle(20, 20, 20, 20);

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
        if(currentVertex.getInputsStatus().equals(Vertex.InputsStatus.CORRECT) && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)){
            g2.setColor(Color.BLUE);
        }else if(currentVertex.getInputsStatus().equals(Vertex.InputsStatus.GAVEUP) && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)){
            g2.setColor(Color.BLUE);
        }else{
            g2.setColor(foreground);
        }
            
        if(selected){
            g2.setColor(Color.GRAY);
            g2.setStroke(new BasicStroke(2));
        }
        else
            g2.setStroke(new BasicStroke(3));
        
        int a = getWidth() / 2;
        int b = getHeight() / 2;
        int m = Math.min(a, b);
        int r = 4 * m / 5;
        int r2 = Math.abs(m - r) / 2;
        g2.drawOval(a - r, b - r - 7, 2 * r, 2 * r);
        
        String vertexName = currentVertex.getName();
        double x = getWidth()/2 - (vertexName.length() * 3 -1);
       
        g2.setFont(new Font(null, Font.PLAIN, 10));
        
        g2.drawString(vertexName, (int)x-1, getHeight()-2);
        
        paintVertexStatusIcons(g, currentVertex);
        paintSelectable(g);

    }
}
