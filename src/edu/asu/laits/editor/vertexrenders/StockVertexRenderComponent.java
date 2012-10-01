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
import edu.asu.laits.model.Vertex.Shape;
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
            Shape shape = GraphEditorConstants.getShape(atributes);
            GraphEditorPane graphPane = (GraphEditorPane) graph;

            if (Shape.STOCK != shape) {
                if (!(Shape.DEFAULT == shape && graphPane.getGraphProperties()
                        .getDefaultShape() == Shape.STOCK)) {

                    return defaultVertexRenderComponent.getRendererComponent(
                            graph, view, sel, focus, preview);

                }

            }
            // CHECK END
            // TODO Auto-generated method stub
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

    @Override
    public Point2D getPerimeterPoint(VertexView view, Point2D source, Point2D p) {

        Rectangle2D bounds = view.getBounds();
        double x = bounds.getX();
        double y = bounds.getY();
        double width = bounds.getWidth() - 1;
        double height = bounds.getHeight() - 1;
        double xCenter = x + width / 2;
        double yCenter = y + width / 2;
        double dx = p.getX() - xCenter; // Compute Angle
        double dy = p.getY() - yCenter;
        double alpha = Math.atan2(dy, dx);
        double xout = 0, yout = 0;
        double pi = Math.PI;
        double pi2 = Math.PI / 2.0;
        double beta = pi2 - alpha;
        double t = Math.atan2(height, width);
        if (alpha < -pi + t || alpha > pi - t) { // Left edge
            xout = x;
            yout = yCenter - width * Math.tan(alpha) / 2;
        } else if (alpha < -t) { // Top Edge
            yout = y;
            xout = xCenter - height * Math.tan(beta) / 2;
        } else if (alpha < t) { // Right Edge
            xout = x + width;
            yout = yCenter + width * Math.tan(alpha) / 2;
        } else { // Bottom Edge
            yout = y + height;
            xout = xCenter + height * Math.tan(beta) / 2;
        }
        return new Point2D.Double(xout, yout);

    }

    public void drawVertex(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        g2.setColor(foreground);
        if (preview || !selected) {
            if (!useGraphBackround) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillRect(0, 0, getWidth() - 1, getHeight() - 1);
                g2.setColor(prevColor);
            }
            g2.drawRect(0, 0, getWidth() - 1, getHeight() - 1);
        } else {
            if (!useGraphBackround) {
                Color prevColor = g2.getColor();
                g2.setColor(background);
                g2.fillRect(0, 0, getWidth() - 1, getHeight() - 1);
                g2.setColor(prevColor);
            }
            Stroke previousStroke = g2.getStroke();
            g2.setStroke(GraphEditorConstants.SELECTION_STROKE);
            g2.drawRect(0, 0, getWidth() - 1, getHeight() - 1);
            g2.setStroke(previousStroke);
        }
        paintSelectable(g);

    }
}
