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
import java.util.ArrayList;
import java.util.List;
import net.sourceforge.jeval.Evaluator;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.GraphConstants;

/**
 * Class To Hold the information about a Node in the Graph.
 */
public class Vertex {
    
    private transient DefaultGraphCell jGraphVertex;

    private double xPosition, yPosition;
    private boolean useGraphBackround = true;
    private Color backgroundColor = Color.WHITE;
    private Color foregroundColor = Color.BLACK;
    private VertexType type = VertexType.DEFAULT;
    
    private String name = "";
    private String correctDescription = "";
    private Plan plan = Plan.UNDEFINED;
    private InputsStatus inputsStatus = InputsStatus.UNDEFINED;
    private CalculationsStatus calculationsStatus = 
            CalculationsStatus.UNDEFINED;
    private GraphsStatus graphsStatus = GraphsStatus.UNDEFINED;
    
    private double initialValue;
    private String equation;
    private List<Double> correctValues;
    
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
        name = "Node"+vertexIndex;
        xPosition = 200 * (vertexIndex % 6) + 80;
        yPosition = 200 * (vertexIndex / 6) + 60 ;
        correctValues = new ArrayList<Double>();
//        if(vertexIndex % 1 == 0)
//            setVertexType(VertexType.CONSTANT);
//        if(vertexIndex % 2 == 0)
//            setVertexType(VertexType.FLOW);
//        if(vertexIndex % 3 == 0)
//            setVertexType(VertexType.STOCK);
        
        vertIndexCount++;
    }
    

    public String getName() {
        return name;
    }
    
    public void setName(String label) {
        this.name = label;
    }
    
    public String getCorrectDescription(){
        return correctDescription;
    }
    
    public void setCorrectDescription(String desc){
        this.correctDescription = desc;
    }
    
    public Plan getPlan(){
        return plan;
    }
    
    public void setPlan(Plan plan){
        this.plan = plan;
    }    

    public SortedMap<String, String> getProperties() {
        return properties;
    }

    public void setProperties(SortedMap<String, String> properties) {
        this.properties = properties;
    }

    public VertexType getVertexType() {
        return type;
    }

    public void setVertexType(VertexType shape) {
        this.type = shape;
    }

    public InputsStatus getInputsStatus(){
        return inputsStatus;
    }
    
    public void setInputsStatus(InputsStatus status){
        this.inputsStatus = status;
    }
    
    public CalculationsStatus getCalculationsStatus(){
        return calculationsStatus;
    }
    
    public void setCalculationsStatus(CalculationsStatus status){
        this.calculationsStatus = status;
    }
           
    public GraphsStatus getGraphsStatus(){
        return graphsStatus;
    }
    
    public void setGraphsStatus(GraphsStatus status){
        this.graphsStatus = status;
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
    
    public List<Double> getCorrectValues(){
        return correctValues;
    }

    public double getInitialValue(){
        return initialValue;
    }
    
    public void setInitialValue(double input){
        initialValue = input;
    }
    
    public String getEquation(){
        return equation;
    }    
    
    public void setEquation(String input){
        equation = input;
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
        vertexInfoClone.setName(new String(name));
        vertexInfoClone.setVertexType(type);

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
            type = GraphEditorConstants.getShape(map);
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
    
    
    /**
     * An enumeration with the possible shapes of a vertex
     */
    public enum VertexType {
        DEFAULT, STOCK, FLOW, CONSTANT
    }
    
    /**
     * An enumeration with the possible Plans of a vertex
    */
    public enum Plan{
        UNDEFINED, FIXED, INCREASE, DECREASE, INCREASE_AND_DECREASE,
        PROPORTIONAL, DIFFERENCE, RATIO        
    }
    
    /**
     * An enumeration with the possible Status of Inputs of a vertex
    */
    public enum InputsStatus{
        UNDEFINED, CORRECT, INCORRECT
    }
    
    /**
     * An enumeration with the possible Status of Calculations of a vertex
    */
    public enum CalculationsStatus{
        UNDEFINED, CORRECT, INCORRECT
    }
    
    /**
     * An enumeration with the possible Status of Graphs of a vertex
    */
    public enum GraphsStatus{
        UNDEFINED, CORRECT, INCORRECT
    }
    
    //for debug purpose
    public void genRandomValues(){
        this.correctValues.clear();
        Task task=Task.getInstance();
        for(int i=task.getStartTime();i<=task.getEndTime();i++){
            this.correctValues.add(Math.random()*100);
        }
    }
}
