package edu.asu.laits.model;

import java.awt.geom.Rectangle2D;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
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
    private VertexType type = VertexType.DEFAULT;
    private String name = "";
    private String correctDescription = "";
    private String plan = "";
    // Status of All the Tabs
    private DescriptionStatus descriptionStatus;
    private PlanStatus planStatus;
    private CalculationsStatus calculationsStatus;
    private GraphsStatus graphsStatus;
    private double initialValue;
    private String equation;
    private transient List<Double> correctValues;
    transient private SortedMap<String, String> properties = new TreeMap<String, String>();
    //transient public static int vertIndexCount = 0;
    private int vertexIndex;
    // List to store Fake Description List for each vertex
    private List<String> fakeDescription;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     *
     */
    public Vertex() {
        descriptionStatus = DescriptionStatus.UNDEFINED;
        planStatus = PlanStatus.UNDEFINED;
        calculationsStatus = CalculationsStatus.UNDEFINED;
        graphsStatus = GraphsStatus.UNDEFINED;
        correctValues = new ArrayList<Double>();
        fakeDescription = new ArrayList<String>();        
        equation = "";
    }

    public int getVertexIndex() {
        return vertexIndex;
    }

    public void setVertexIndex(int index) {
        vertexIndex = index;

        xPosition = 200 * (vertexIndex % 4) + 480;
        yPosition = 200 * (vertexIndex / 4) + 60;
    }

    public String getName() {
        return name;
    }

    public void setName(String label) throws IllegalArgumentException {
        Evaluator eval = new Evaluator();
        try {
            eval.isValidName(label);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            logs.debug(e.getMessage());
            throw new IllegalArgumentException(e.getMessage());
        }
        this.name = label;
    }

    public String getCorrectDescription() {
        return correctDescription;
    }

    public void setCorrectDescription(String desc) {
        this.correctDescription = desc;
    }

    public List<String> getFakeDescription() {
        return fakeDescription;
    }

    public void setFakeDescription(List<String> description) {
        this.fakeDescription = description;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
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

    /**
     * Method to change VertexType.
     *
     * @param shape
     */
    public void setVertexType(VertexType shape) {
        this.type = shape;
    }

    public DescriptionStatus getDescriptionStatus() {
        return descriptionStatus;
    }

    public void setDescriptionStatus(DescriptionStatus status) {
        this.descriptionStatus = status;
    }

    public PlanStatus getPlanStatus() {
        return planStatus;
    }

    public void setPlanStatus(PlanStatus status) {
        this.planStatus = status;
    }

    public CalculationsStatus getCalculationsStatus() {
        return calculationsStatus;
    }

    public void setCalculationsStatus(CalculationsStatus status) {
        this.calculationsStatus = status;
    }

    public GraphsStatus getGraphsStatus() {
        return graphsStatus;
    }

    public void setGraphsStatus(GraphsStatus status) {
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

    public List<Double> getCorrectValues() {
        return correctValues;
    }

    public void resetCorrectValues() {
        correctValues = new ArrayList<Double>();
    }

    public double getInitialValue() {
        return initialValue;
    }

    public void setInitialValue(double input) {
        initialValue = input;
    }

    public String getEquation() {
        return equation;
    }

    public void setEquation(String input) {
        equation = input;
    }

    public Object clone() {
        Vertex vertexInfoClone = new Vertex();
        vertexInfoClone.setXPosition(xPosition);
        vertexInfoClone.setYPosition(yPosition);
        vertexInfoClone.setName(new String(name));
        vertexInfoClone.setVertexType(type);
        vertexInfoClone.setEquation(equation);
        vertexInfoClone.setInitialValue(initialValue);
        vertexInfoClone.setVertexIndex(vertexIndex);
        if(this.correctValues != null)
            vertexInfoClone.getCorrectValues().addAll(this.correctValues);
        vertexInfoClone.setCorrectDescription(correctDescription);
        if(this.fakeDescription != null)
        vertexInfoClone.getFakeDescription().addAll(this.fakeDescription);
        vertexInfoClone.setPlan(plan);
        vertexInfoClone.setDescriptionStatus(descriptionStatus);
        vertexInfoClone.setPlanStatus(planStatus);
        vertexInfoClone.setCalculationsStatus(calculationsStatus);
        vertexInfoClone.setGraphsStatus(graphsStatus);

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
            xPosition = vertexBounds.getX();
            yPosition = vertexBounds.getY();
            equation = getEquation();  
            fakeDescription = getFakeDescription();
        } catch (Exception e) {
            e.printStackTrace();
            throw new VertexReaderException();
        }
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
    public enum Plan {
        UNDEFINED, FIXED, INCREASE, DECREASE, INCREASE_AND_DECREASE,
        PROPORTIONAL, DIFFERENCE, RATIO
    }

    /**
     * An enumeration with the possible Status of Inputs of a vertex
     */
    public enum DescriptionStatus {
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }

    /**
     * An enumeration with the possible Status of Inputs of a vertex
     */
    public enum PlanStatus {
        UNDEFINED, MISSEDFIRST, CORRECT, INCORRECT, GAVEUP
    }

    /**
     * An enumeration with the possible Status of Inputs of a vertex
     */
    public enum InputsStatus {
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }

    /**
     * An enumeration with the possible Status of Calculations of a vertex
     */
    public enum CalculationsStatus {
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }

    /**
     * An enumeration with the possible Status of Graphs of a vertex
     */
    public enum GraphsStatus {
        UNDEFINED, CORRECT, INCORRECT, GAVEUP
    }

    public boolean isDescriptionDone() {
        if (descriptionStatus.equals(Vertex.DescriptionStatus.CORRECT) || descriptionStatus.equals(Vertex.DescriptionStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }

    public boolean isPlanDone() {
        if (planStatus.equals(Vertex.PlanStatus.CORRECT) || planStatus.equals(Vertex.PlanStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }

    public boolean isCalculationsDone() {
        if (calculationsStatus.equals(Vertex.CalculationsStatus.CORRECT) || calculationsStatus.equals(Vertex.CalculationsStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Print Vertex Information for debugging purposes.
     */
    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();
        
        sb.append("NodeName : " + getName() + "\n");
        sb.append("NodeDesc : " + getCorrectDescription() + "\n");
        sb.append("Fake Desc: " + getFakeDescription() + "\n");
        sb.append("NodeType : " + getVertexType() + "\n");
        sb.append("NodeInitialVal : " + getInitialValue() + "\n");
        sb.append("NodeEquation : " + getEquation() + "\n");
        sb.append("DescStatus : " + getDescriptionStatus() + "\n");
        sb.append("PlanStatus : " + getPlanStatus() + "\n");
        sb.append("CalcStatus : " + getCalculationsStatus() + "\n");        
        
        return sb.toString();
    }
}
