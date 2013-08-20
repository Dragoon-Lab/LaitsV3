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

import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphEditorVertexView;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexType;
import edu.asu.laits.properties.ImageLoader;
import java.awt.BasicStroke;
import java.awt.Font;
import java.awt.Image;
import java.awt.Toolkit;
import java.net.URL;
import javax.swing.ImageIcon;
import org.apache.log4j.Logger;
import org.jgraph.JGraph;
import org.jgraph.graph.CellView;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.VertexRenderer;
import org.jgraph.graph.VertexView;

/**
 * This class extends the class VertexRender in the JGraph components to be a
 * vertex render for triangle vertex type.
 *
 */
public class ConstantVertexRenderComponent   extends VertexRenderComponent {

    private boolean selected;
    private boolean focus;
    private boolean preview;
    private Color background;
    private Rectangle2D bounds;
    private static FlowVertexRenderComponent circleVertexRenderComponent = new FlowVertexRenderComponent();
    private VertexRenderComponent defaultVertexRenderComponent = null;
    private boolean useGraphBackround;
    private Color foreground;
    private Vertex currentVertex;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     * @param defaultVertexRenderComponent
     */
    public ConstantVertexRenderComponent(
            VertexRenderComponent defaultVertexRenderComponent) {
        super();
        this.defaultVertexRenderComponent = defaultVertexRenderComponent;
    }

    public ConstantVertexRenderComponent() {
        super();
    }

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {

        // CHECK IF WE HAVE TO CHANGE RENDER
        Map<Object, Object> attributes = null;
        if (((DefaultGraphCell) view.getCell()) != null) {
            attributes = ((DefaultGraphCell) view.getCell()).getAttributes();
            DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
            currentVertex = (Vertex) cell.getUserObject();
        } else {
            attributes = view.getAllAttributes();
        }
        fetchSelectable(attributes);
        useGraphBackround = GraphEditorConstants
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

        bounds = GraphEditorConstants.getBounds(attributes);

        if (bounds == null) {
            bounds = new Rectangle(20, 20, 20, 20);
        }

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

    @Override
    public Point2D getPerimeterPoint(VertexView view, Point2D source, Point2D p) {
        Rectangle2D bounds = view.getBounds();
        double x = bounds.getX();
        double y = bounds.getY();
        double width = bounds.getWidth() - 2;
        double height = bounds.getHeight() - 2;
        double xCenter = x + width / 2;
        double yCenter = y + width / 2;
        double dx = p.getX() - xCenter; // Compute Angle
        double dy = p.getY() - yCenter;
        double alpha = Math.atan2(dy, dx);
        if (alpha < 0) {
            alpha = -alpha;
        } else {
            alpha = (Math.PI - alpha) + Math.PI;
        }
        double xout = 0, yout = 0;
        double pi = Math.PI;
        double pi2 = Math.PI / 2.0;
        double m2pi3 = (2 * Math.PI) / 3.0;

        if (alpha <= pi2 + m2pi3 && alpha >= pi2) { // Left edge

            double whereOnLine = 1 - ((alpha - pi2) / (m2pi3));
            xout = x + whereOnLine * ((double) (((int) width) / 2));
            yout = y + height - whereOnLine * height;
        } else if ((alpha >= pi2 + m2pi3 * 2 && alpha <= 2 * pi)
                || (alpha >= 0 && alpha <= pi2)) { // Top Edge

            if (alpha <= pi2) {
                alpha = alpha + Math.PI * 2;
            }
            double whereOnLine = 1 - (alpha - pi2 - m2pi3 * 2) / m2pi3;
            xout = x + ((double) (((int) width) / 2)) + whereOnLine
                    * ((double) (((int) width) / 2));
            yout = y + whereOnLine * height;
        } else { // Right Edge

            double whereOnLine = (alpha - (pi2 + m2pi3)) / m2pi3;

            xout = x + whereOnLine * width;
            yout = y + height;
        }
        return new Point2D.Double(xout, yout);

    }

    public void drawVertex(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        boolean isCorrect = false;
        if(currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT)){
            g2.setColor(Color.GREEN);
            isCorrect = true;           
        }else if(currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)){
            g2.setColor(new Color(0x90, 0x90, 0x00));
            isCorrect = true;           
        }else if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT) && 
            currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)){
            g2.setColor(Color.BLUE);
            isCorrect = true;
        }else if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP) && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)){
            g2.setColor(Color.BLUE);
            isCorrect = true;
        }else if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT) && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)){
            g2.setColor(Color.BLUE);
            isCorrect = true;
        }
        else if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP) && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)){
            g2.setColor(Color.BLUE);
            isCorrect = true;
        }
        else{
            g2.setColor(foreground);
        }
        
        int[] xpoints = {0, 60, 119, 60};
        int[] ypoints = {31, 1, 31, 62};
        if(selected && !(isCorrect)){
            g2.setStroke(new BasicStroke(2));
            g2.setColor(Color.GRAY);
        }else
            g2.setStroke(new BasicStroke(3));

        if (preview || !selected) {
            if (!useGraphBackround) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillPolygon(xpoints, ypoints, 3);
                g2.setColor(prevColor);
            }
            g2.drawPolygon(xpoints, ypoints, 4);
        } else {
            if (!useGraphBackround) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillPolygon(xpoints, ypoints, 3);
                g2.setColor(prevColor);
            }

            g2.drawPolygon(xpoints, ypoints, 4);
        }
        String vertexName = currentVertex.getName();
        
        double x = getWidth()/2 - (vertexName.length() * 3 -1);
       
        g2.setFont(new Font(null, Font.PLAIN, 10));
        g2.drawString(vertexName, (int)x-1, getHeight()-2);
        
        paintVertexStatusIcons(g, currentVertex);
        paintSelectable(g);

    }
}
