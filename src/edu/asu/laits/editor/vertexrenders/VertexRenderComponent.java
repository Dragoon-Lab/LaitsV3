package edu.asu.laits.editor.vertexrenders;

import java.awt.Color;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.util.Map;

import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphEditorVertexView;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexType;
import edu.asu.laits.properties.ImageLoader;
import java.awt.Image;
import java.awt.Toolkit;
import java.net.URL;
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

    VertexType shape;
    private boolean selectable;
    private boolean selected;
    private boolean preview;
   
    static VertexRenderComponent defaultRender = new VertexRenderComponent();
    private static FlowVertexRenderComponent flowVertexRenderComponent =
            new FlowVertexRenderComponent(defaultRender);
    private static StockVertexRenderComponent stockVertexRenderComponent =
            new StockVertexRenderComponent(defaultRender);
    private static ConstantVertexRenderComponent constantVertexComponent =
            new ConstantVertexRenderComponent(defaultRender);
    private static DefaultVertexRenderComponent defaultVertexComponent =
            new DefaultVertexRenderComponent(defaultRender);
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
   
    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {
        DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
        Vertex currentVertex = (Vertex) cell.getUserObject();

        VertexType shape = currentVertex.getVertexType();

        if (shape == VertexType.DEFAULT) {
            return defaultVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } else if (shape == VertexType.FLOW) {
            return flowVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } else if (shape == VertexType.STOCK) {
            return stockVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } else if (shape == VertexType.CONSTANT) {
            return constantVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } else {
            return super.getRendererComponent(graph, view, sel, focus, preview);
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

    protected void paintVertexStatusIcons(Graphics g, Vertex v) {
        paintPlanIcons(g, v);
        paintCalculationsIcons(g, v);
        paintGraphsIcons(g, v);
    }

    private void paintPlanIcons(Graphics g, Vertex currentVertex) {

        if (currentVertex.getPlanStatus() == Vertex.PlanStatus.UNDEFINED) {
            paintIcon(g, ImageLoader.getInstance().getPlanNoStatusIcon(), 0);

        } else if (currentVertex.getPlanStatus() == Vertex.PlanStatus.CORRECT) {
            paintIcon(g, ImageLoader.getInstance().getPlanCorrectIcon(), 0);

        } else if (currentVertex.getPlanStatus() == Vertex.PlanStatus.INCORRECT || currentVertex.getPlanStatus() == Vertex.PlanStatus.MISSEDFIRST) {
            paintIcon(g, ImageLoader.getInstance().getPlanInCorrectIcon(), 0);
        } else if (currentVertex.getPlanStatus() == Vertex.PlanStatus.GAVEUP) {
            paintIcon(g, ImageLoader.getInstance().getPlanGaveUpIcon(), 0);
        }
    }

    private void paintCalculationsIcons(Graphics g, Vertex currentVertex) {
        if (currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.UNDEFINED) {
            paintIcon(g, ImageLoader.getInstance().getCalculationsNoStatusIcon(), 30);

        } else if (currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.CORRECT) {
            paintIcon(g, ImageLoader.getInstance().getCalculationsCorrectIcon(), 30);

        } else if (currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.INCORRECT) {
            paintIcon(g, ImageLoader.getInstance().getCalculationsInCorrectIcon(), 30);
        } else if (currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.GAVEUP) {
            paintIcon(g, ImageLoader.getInstance().getCalculationsGaveUpIcon(), 30);
        }
    }

    private void paintGraphsIcons(Graphics g, Vertex currentVertex) {
        if (currentVertex.getGraphsStatus() == Vertex.GraphsStatus.UNDEFINED) {
            paintIcon(g, ImageLoader.getInstance().getGraphsNoStatusIcon(), 60);

        } else if (currentVertex.getGraphsStatus() == Vertex.GraphsStatus.CORRECT) {
            paintIcon(g, ImageLoader.getInstance().getGraphsCorrectIcon(), 60);

        } else if (currentVertex.getGraphsStatus() == Vertex.GraphsStatus.INCORRECT) {
            paintIcon(g, ImageLoader.getInstance().getGraphsInCorrectIcon(), 60);
        } else if (currentVertex.getGraphsStatus() == Vertex.GraphsStatus.GAVEUP) {
            paintIcon(g, ImageLoader.getInstance().getGraphsGaveUpIcon(), 60);
        }
    }

    private void paintIcon(Graphics g, Image iconImage, int displacement) {
        g.drawImage(iconImage,
                getWidth() / 2 - 40 + displacement,
                22,
                ImageLoader.statusIconWidth,
                ImageLoader.statusIconWidth,
                this);
    }

    protected String truncateNodeName(String name) {
        if (name == null || name.trim().length() == 0) {
            return "";
        }

        if (name.length() < 20) {
            return name;
        }

        String newName = name.substring(0, 17);
        newName += "...";
        return newName;
    }
}
