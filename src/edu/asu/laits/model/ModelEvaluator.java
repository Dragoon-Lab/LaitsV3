/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import net.sourceforge.jeval.Evaluator;
import org.apache.log4j.Logger;
import org.jgrapht.alg.CycleDetector;
import org.jgrapht.traverse.TopologicalOrderIterator;


/**
 *
 * @author ramayantiwari
 */
public class ModelEvaluator {

    Graph<Vertex, Edge> currentGraph;
    int constantVertices;
    int startTime;
    int endTime;
    Map<String, List<String>> finalOperands;
    private static Logger logs = Logger.getLogger(ModelEvaluator.class);

    public ModelEvaluator(Graph inputGraph) {
        currentGraph = inputGraph;
        startTime = currentGraph.getCurrentTask().getStartTime();
        endTime = currentGraph.getCurrentTask().getEndTime();
        finalOperands = new HashMap<String, List<String>>();
    }
    
    /**
     * Test if current model can be run
     * @return 
     */
    public boolean isModelComplete(){
        Iterator<Vertex> allVertices = currentGraph.vertexSet().iterator();
        Vertex thisVertex;
        while(allVertices.hasNext()){
            thisVertex = allVertices.next();
            if(!thisVertex.getInputsStatus().equals(Vertex.InputsStatus.CORRECT) &&
                    !thisVertex.getCalculationsStatus().equals(Vertex.InputsStatus.CORRECT)){
                return false;
            }
        }
       
        return true;
    }

    /**
     * Run Model 
     * @throws ModelEvaluationException 
     */
    public void run() throws ModelEvaluationException{
        List<Vertex> vertexList = getArrangedVertexList();
        logs.trace("Arranged Vertex List "+vertexList.toString());
        
        try{
            int totalPoints = endTime - startTime;
            constructFinalEquations(vertexList);
            logs.trace("Final Operands   "+finalOperands.toString());
            logs.trace("Constant Vertices : "+constantVertices);
            
            // Calculating Initial Flow for i =0
            for (int j = constantVertices; j < vertexList.size(); j++) {
                Vertex currentVertex = vertexList.get(j);
                if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                    currentVertex.getCorrectValues().add(calculateFlow(vertexList, currentVertex, 0));
                }
            }

            // Calculating all the points from 1 to totalpoints-1
            for (int i = 1; i < totalPoints; i++) {

                for (int j = constantVertices; j < vertexList.size(); j++) {
                    Vertex currentVertex = vertexList.get(j);

                    if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                        currentVertex.getCorrectValues().add(calculateStock(vertexList, currentVertex, i));
                    } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                        currentVertex.getCorrectValues().add(calculateFlow(vertexList, currentVertex, i));
                    }
                }
            }
            
            for(Vertex v : vertexList){
                v.setGraphsStatus(Vertex.GraphsStatus.CORRECT);
            }
            
            printVertexValues(vertexList);
        }catch(Exception ex){
            ex.printStackTrace();
            String err = "Error in Model Execution "+ex.getMessage();
            logs.error(err);
            for(Vertex v : vertexList){
                v.setGraphsStatus(Vertex.GraphsStatus.CORRECT);
            }
            throw new ModelEvaluationException(err);
            
        }        
    }

    /**
     * Arrange all the vertices in Order : Constant, Stock, Flow
     * @return: arranged Vertex List
     * @throws ModelEvaluationException 
     */
    public List<Vertex> getArrangedVertexList() throws ModelEvaluationException{        
        List<Vertex> allVertices = new ArrayList<Vertex>();
        List<Vertex> constantList = new ArrayList<Vertex>();
        List<Vertex> flowList = new ArrayList<Vertex>();
        List<Vertex> stockList = new ArrayList<Vertex>();
        int totalPoints = endTime - startTime;

        Iterator<Vertex> it = currentGraph.vertexSet().iterator();
        while (it.hasNext()) {
            Vertex thisVertex = it.next();
            thisVertex.resetCorrectValues();

            if (thisVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
                // Initialize constant values
                for (int i = 0; i < totalPoints; i++) {
                    thisVertex.getCorrectValues().add(thisVertex.getInitialValue());
                }

                constantList.add(thisVertex);
            } else if (thisVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                // Setting initial value for Stock
                thisVertex.getCorrectValues().add(thisVertex.getInitialValue());
                stockList.add(thisVertex);
            } else if (thisVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                flowList.add(thisVertex);
            }
        }

        // Model is invalid if only Flow Vertices are present
        if(flowList.size() == currentGraph.vertexSet().size()){
            throw new ModelEvaluationException("Invalid Model - only Flow Nodes are present");
        }        
        
        allVertices.addAll(constantList);
        allVertices.addAll(stockList);
        allVertices.addAll(topologialSort(flowList));

        // Bad approach
        constantVertices = constantList.size();

        return allVertices;
    }

    /**
     * Method to Arrange the Flow nodes in Topological Order
     * @param inputVertices
     * @return : Arrange Vertices
     * @throws ModelEvaluationException 
     */
    private List<Vertex> topologialSort(List<Vertex> inputVertices) 
            throws ModelEvaluationException {
        
        List<Vertex> sortedList = new ArrayList<Vertex>();
        Graph<Vertex,Edge> newGraph = new Graph<Vertex, Edge>(Edge.class);
        
        for(Vertex v : inputVertices){
            newGraph.addVertex(v);
        }
        for(Edge e : currentGraph.edgeSet()){
            if(inputVertices.contains(currentGraph.getEdgeSource(e)) && 
                    inputVertices.contains(currentGraph.getEdgeTarget(e))){
                
                newGraph.addEdge(currentGraph.getEdgeSource(e), 
                        currentGraph.getEdgeTarget(e));
            }
        }
        
        detectCycles(newGraph);
        
        TopologicalOrderIterator<Vertex, Edge> itr = 
                    new TopologicalOrderIterator<Vertex, Edge>(newGraph);
        while(itr.hasNext()){            
           sortedList.add(itr.next());            
        }
        
        return sortedList;        
    }
    
    /**
     * Method to check Cycles among Flow Nodes
     * @param graph : new graph construct from flow nodes
     * @throws ModelEvaluationException 
     */
    private void detectCycles(Graph graph) throws ModelEvaluationException{
        CycleDetector<Vertex, Edge> cycleDetector = new CycleDetector<Vertex, Edge>(graph);
        
        if(cycleDetector.detectCycles()){
            Set<Vertex> cycleVertices;
            cycleVertices = cycleDetector.findCycles();
            
            String names="[ ";
            for(Vertex v : cycleVertices){
                names += v.getName()+" ";
            }
            names += "]";
            
            String msg = "Cycles found among Flow Nodes "+names;
            logs.error(msg);
            throw new ModelEvaluationException(msg);
        }     
    }
    
    /**
     * Calculate Value of Stock Vertex
     * @param vertexList
     * @param currentVertex
     * @param pointNumber
     * @return
     * @throws Exception 
     */
    private double calculateStock(List<Vertex> vertexList, Vertex currentVertex, int pointNumber) throws Exception {
        String formula = currentVertex.getEquation();
        Iterator<String> it = finalOperands.get(currentVertex.getName()).iterator();
        
        Evaluator eval = new Evaluator();
        eval.parse(formula);
        String name, value;

        while (it.hasNext()) {
            name = it.next();
            value = String.valueOf(getVertexByName(vertexList, name).getCorrectValues().get(pointNumber - 1));            
            eval.putVariable(name, value);
        }

        double result = Double.valueOf(eval.evaluate()) + currentVertex.getCorrectValues().get(pointNumber - 1);
        return result;
    }
    
    /**
     * Calculate value of Flow Vertex
     * @param vertexList
     * @param currentVertex
     * @param pointNumber
     * @return
     * @throws Exception 
     */
    private double calculateFlow(List<Vertex> vertexList, Vertex currentVertex, int pointNumber) throws Exception {
        
        String formula = currentVertex.getEquation();
        Iterator<String> it = finalOperands.get(currentVertex.getName()).iterator();

        Evaluator eval = new Evaluator();
        eval.parse(formula);
        String name, value;

        while (it.hasNext()) {
            name = it.next();
            if (getVertexByName(vertexList, name).getCorrectValues().size() == 0) {
                value = "0.0";
            } else { 
                value = String.valueOf(getVertexByName(vertexList, name).getCorrectValues().get(pointNumber));
            }
            eval.putVariable(name, value);
        }

        return Double.valueOf(eval.evaluate());
    }

    /**
     * Build operand - dependent operand list
     * @param vertexList
     * @throws Exception 
     */
    private void constructFinalEquations(List<Vertex> vertexList) throws Exception {
        for (Vertex v : vertexList) {
         
            Iterator<Edge> inEdges = currentGraph.incomingEdgesOf(v).iterator();

            Vertex vertex;
            List<String> operands = new ArrayList<String>();
            
            while (inEdges.hasNext()) {
                vertex = (Vertex) currentGraph.getEdgeSource(inEdges.next());
                operands.add(vertex.getName());
            }
            
            finalOperands.put(v.getName(), operands);
        }
       
    }

    /**
     * Find a vertex by using its name in the given list
     * @param vertexList
     * @param name
     * @return 
     */
    private Vertex getVertexByName(List<Vertex> vertexList, String name) {
        for (Vertex v : vertexList) {
            if (v.getName().equals(name)) {
                return v;
            }
        }

        return null;
    }
    
    /**
     * Print values of vertices : used in debugging
     * @param vertices 
     */
    private void printVertexValues(List<Vertex> vertices){
        for (Vertex v : vertices) {
            logs.trace("Vertex "+v.getName());
            logs.trace(v.getCorrectValues().toString());
        }
    }
}