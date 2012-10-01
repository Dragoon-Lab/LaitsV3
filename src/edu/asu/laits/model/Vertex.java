package edu.asu.laits.model;

import java.awt.Color;
import java.awt.geom.Rectangle2D;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.SortedSet;
import java.util.TreeMap;
import java.util.Map.Entry;

import edu.asu.laits.editor.GraphEditorConstants;
import edu.asu.laits.model.Edge.ErrorReaderException;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.GraphConstants;

/**
 * Class To Hold the information about a Node in the Graph.
 */
public class Vertex {

    private transient DefaultGraphCell jGraphVertex;

    /**
     * An enumeration with the possible shapes of a vertex
     */
    public enum Shape {
        DEFAULT, STOCK, FLOW, CONSTANT
    }
    
    public enum Plan{
        UNDEFINED, FIXED, INCREASE, DECREASE, INCREASE_AND_DECREASE,
        PROPORTIONAL, DIFFERENCE, RATIO        
    }
    private double xPosition, yPosition;
    private boolean useGraphBackround = true;
    private Color backgroundColor = Color.WHITE;
    private Color foregroundColor = Color.BLACK;
    private Shape shape = Shape.DEFAULT;
    private boolean displayLabel = true;
    
    private String name = "";
    private String correctDescription = "";
    private Plan plan = Plan.UNDEFINED;
    
    
    transient private SortedMap<String, String> properties = new TreeMap<String, String>();
    transient private static int vertIndexCount = 0;
    private int vertexIndex;
    
    /** Logger */
    private static Logger logs = Logger.getLogger(Vertex.class);

    /**
     *
     */
    public Vertex() {
        vertexIndex = vertIndexCount;
        name = "V"+vertexIndex;
        xPosition = 160 * (vertexIndex % 6) + 80;
        yPosition = 200 * (vertexIndex / 6) + 60 ;
        
        vertIndexCount++;
    }

    /**
     * @return the displayLabel
     */
    public boolean isDisplayLabel() {
        return displayLabel;
    }

    /**
     * @param displayLabel the displayLabel to set
     */
    public void setDisplayLabel(boolean displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getName() {
        return name;
    }

    
    public void setName(String label) {
        this.name = label;
    }

    public SortedMap<String, String> getProperties() {
        return properties;
    }

    public void setProperties(SortedMap<String, String> properties) {
        this.properties = properties;
    }

    public Shape getShape() {
        return shape;
    }

    public void setShape(Shape shape) {
        this.shape = shape;
    }

    public double getXPosition() {
        return xPosition;
    }

    public void setXPosition(double position) {
        xPosition = position;
    }

    public double getYPosition() {
        return yPosition;
    }

    public void setYPosition(double position) {
        yPosition = position;
    }

    public String toString() {
        return name;
    }

    public Object clone() {
        Vertex vertexInfoClone = new Vertex();
        vertexInfoClone.setXPosition(xPosition);
        vertexInfoClone.setYPosition(yPosition);
        vertexInfoClone.setForegroundColor(new Color(foregroundColor.getRGB()));
        vertexInfoClone.setBackgroundColor(new Color(backgroundColor.getRGB()));
        vertexInfoClone.setUseGraphBackround(useGraphBackround);
        vertexInfoClone.setDisplayLabel(displayLabel);
        vertexInfoClone.setName(new String(name));
        vertexInfoClone.setShape(shape);

        return vertexInfoClone;

    }

    public int getVertexIndex() {
        return vertexIndex;
    }

    public DefaultGraphCell getJGraphVertex() {
        return jGraphVertex;
    }

    public void setJGraphVertex(DefaultGraphCell graphVertex) {
        jGraphVertex = graphVertex;
    }

    public void fetchInformationFromJGraph()
            throws VertexReaderException {
        // Fetch the id of the source and target vertex
        try {
            Map<Object, Object> map = jGraphVertex.getAttributes();
            Rectangle2D vertexBounds = GraphConstants.getBounds(map);
            shape = GraphEditorConstants.getShape(map);
            backgroundColor = GraphEditorConstants.getBackground(map);
            foregroundColor = GraphEditorConstants.getForeground(map);
            useGraphBackround = GraphEditorConstants.getUseGraphBackground(map);
            xPosition = vertexBounds.getX();
            yPosition = vertexBounds.getY();

        } catch (Exception e) {
            throw new VertexReaderException();
        }

    }

    public void generateNewVertexIndex() {
        vertexIndex = vertIndexCount;
        vertIndexCount++;
    }

    public Color getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(Color backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public Color getForegroundColor() {
        return foregroundColor;
    }

    public void setForegroundColor(Color foregroundColor) {
        this.foregroundColor = foregroundColor;
    }

    public boolean isUseGraphBackround() {
        return useGraphBackround;
    }

    public void setUseGraphBackround(boolean useGraphBackround) {
        this.useGraphBackround = useGraphBackround;
    }
    
    
    public class VertexReaderException extends Exception {
    }
}
