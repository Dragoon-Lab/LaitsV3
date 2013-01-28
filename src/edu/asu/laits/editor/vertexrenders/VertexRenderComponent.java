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
    private boolean focus;
    private boolean preview;
    private Color background;
    
    static VertexRenderComponent defaultRender = new VertexRenderComponent();
    
    private  static FlowVertexRenderComponent flowVertexRenderComponent =
            new FlowVertexRenderComponent(defaultRender);
    private static StockVertexRenderComponent stockVertexRenderComponent =
            new StockVertexRenderComponent(defaultRender);
    private static ConstantVertexRenderComponent constantVertexComponent =
            new ConstantVertexRenderComponent(defaultRender);
    private static DefaultVertexRenderComponent defaultVertexComponent =
            new DefaultVertexRenderComponent(defaultRender);
    
    /** Logger */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public Component getRendererComponent(JGraph graph, CellView view,
            boolean sel, boolean focus, boolean preview) {
        Map<Object, Object> attributes = ((DefaultGraphCell) view.getCell())
                .getAttributes();

        DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
        Vertex currentVertex = (Vertex)cell.getUserObject();
        
        VertexType shape = currentVertex.getVertexType();
        
        if (shape == VertexType.DEFAULT) {
            return defaultVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        }
        else if (shape == VertexType.FLOW) {
            return flowVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else if (shape == VertexType.STOCK) {
            return stockVertexRenderComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else if (shape == VertexType.CONSTANT) {
            return constantVertexComponent.getRendererComponent(graph,
                    view, sel, focus, preview);
        } 
        else {
            return super.getRendererComponent(graph, view, sel, focus, preview);
        }
    }

    public CellViewRenderer getRenderer(GraphEditorVertexView view, JGraph graph) {
       logs.debug("Getting Renderer");
        Map<Object, Object> atributes = view.getAllAttributes();

        DefaultGraphCell cell = (DefaultGraphCell) view.getCell();
        Vertex currentVertex = (Vertex)cell.getUserObject();
        
        VertexType shape = currentVertex.getVertexType();

        if (shape == VertexType.DEFAULT) {
            return defaultVertexComponent;
        }else if (shape == VertexType.FLOW) {
            return flowVertexRenderComponent;
        } else if (shape == VertexType.STOCK) {
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
    
    protected void paintVertexStatusIcons(Graphics g, Vertex v){
        paintInputIcons(g, v);
        paintCalculationsIcons(g, v);
        paintGraphsIcons(g, v);
    }
    
    private void paintInputIcons(Graphics g, Vertex currentVertex){
        
        if(currentVertex.getInputsStatus() == Vertex.InputsStatus.UNDEFINED){
            paintIcon(g, ImageLoader.getInstance().getInputsNoStatusIcon(), 0); 
        
        }else if(currentVertex.getInputsStatus() == Vertex.InputsStatus.CORRECT){
            paintIcon(g, ImageLoader.getInstance().getInputsCorrectIcon(), 0); 
        
        }else if(currentVertex.getInputsStatus() == Vertex.InputsStatus.INCORRECT){
            paintIcon(g, ImageLoader.getInstance().getInputsInCorrectIcon(), 0); 
        }
    }
    
    private void paintCalculationsIcons(Graphics g, Vertex currentVertex){
        if(currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.UNDEFINED){
            paintIcon(g, ImageLoader.getInstance().getCalculationsNoStatusIcon(), 30); 
            
        }else if(currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.CORRECT){
            paintIcon(g, ImageLoader.getInstance().getCalculationsCorrectIcon(), 30); 
            
        }else if(currentVertex.getCalculationsStatus() == Vertex.CalculationsStatus.INCORRECT){
            paintIcon(g, ImageLoader.getInstance().getCalculationsInCorrectIcon(), 30);            
        }
    }
    
    private void paintGraphsIcons(Graphics g, Vertex currentVertex){
       if(currentVertex.getGraphsStatus() == Vertex.GraphsStatus.UNDEFINED){
           paintIcon(g, ImageLoader.getInstance().getGraphsNoStatusIcon(), 60);
        
       }else if(currentVertex.getGraphsStatus() == Vertex.GraphsStatus.CORRECT){
           paintIcon(g, ImageLoader.getInstance().getGraphsCorrectIcon(), 60);
        
       }else if(currentVertex.getGraphsStatus() == Vertex.GraphsStatus.INCORRECT){
            paintIcon(g, ImageLoader.getInstance().getGraphsInCorrectIcon(), 60);
       }  
    }
    private void paintIcon(Graphics g, Image iconImage, int displacement){
        g.drawImage(iconImage, 
                    getWidth()/2 - 40 + displacement, 
                    22, 
                    ImageLoader.statusIconWidth, 
                    ImageLoader.statusIconWidth, 
                    this);
    }
}
