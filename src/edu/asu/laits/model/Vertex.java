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
    
    // Status of All the Tabs
    private DescriptionStatus descriptionStatus = DescriptionStatus.UNDEFINED;
    private PlanStatus planStatus = PlanStatus.UNDEFINED;
    private InputsStatus inputsStatus = InputsStatus.UNDEFINED;
    private CalculationsStatus calculationsStatus = 
            CalculationsStatus.UNDEFINED;
    private GraphsStatus graphsStatus = GraphsStatus.UNDEFINED;
    
    private double initialValue;
    private String equation;
    private transient List<Double> correctValues;
    
    transient private SortedMap<String, String> properties = new TreeMap<String, String>();
    //transient public static int vertIndexCount = 0;
    private int vertexIndex;
    
    /** Logger */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     *
     */
    public Vertex() {
        //name = "Node"+vertexIndex;
        correctValues = new ArrayList<Double>();
        equation = "";        
    }
    
    public int getVertexIndex(){
        return vertexIndex;
    }
    
    public void setVertexIndex(int index){
        vertexIndex = index;
        
        //xPosition = 200 * (vertexIndex % 6) + 80;
        //yPosition = 200 * (vertexIndex / 6) + 60 ;
        xPosition = 200 * (vertexIndex % 4) + 480;
        yPosition = 200 * (vertexIndex / 4) + 60 ;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String label) throws IllegalArgumentException{
        Evaluator eval = new Evaluator();
        try{
            eval.isValidName(label);
        }catch(IllegalArgumentException e){
            logs.debug(e.getMessage());
            throw new IllegalArgumentException(e.getMessage());            
        }
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

    public DescriptionStatus getDescriptionStatus(){
        return descriptionStatus;
    }
    
    public void setDescriptionStatus(DescriptionStatus status){
        this.descriptionStatus = status;
    }
    
    public PlanStatus getPlanStatus(){
        return planStatus;
    }
    
    public void setPlanStatus(PlanStatus status){
        this.planStatus = status;
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

    public void resetCorrectValues(){
        correctValues = new ArrayList<Double>();
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
        vertexInfoClone.setEquation(equation);

        return vertexInfoClone;
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
            type = getVertexType();
            backgroundColor = GraphEditorConstants.getBackground(map);
            foregroundColor = GraphEditorConstants.getForeground(map);
            useGraphBackround = GraphEditorConstants.getUseGraphBackground(map);
            xPosition = vertexBounds.getX();
            yPosition = vertexBounds.getY();
            equation = getEquation();           

        } catch (Exception e) {
            throw new VertexReaderException();
        }

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
    public enum DescriptionStatus{
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }
    
    /**
     * An enumeration with the possible Status of Inputs of a vertex
    */
    public enum PlanStatus{
        UNDEFINED, MISSEDFIRST, CORRECT, INCORRECT, GAVEUP
    }
    
    /**
     * An enumeration with the possible Status of Inputs of a vertex
    */
    public enum InputsStatus{
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }
    
    /**
     * An enumeration with the possible Status of Calculations of a vertex
    */
    public enum CalculationsStatus{
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }
    
    /**
     * An enumeration with the possible Status of Graphs of a vertex
    */
    public enum GraphsStatus{
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }
    
    
}
