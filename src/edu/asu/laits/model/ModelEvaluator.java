/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import net.sourceforge.jeval.Evaluator;
import org.apache.log4j.Logger;

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
        startTime = Task.getInstance().getStartTime();
        endTime = Task.getInstance().getEndTime();
        finalOperands = new HashMap<String, List<String>>();
    }
    
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

    public void run() throws ModelEvaluationException{
        List<Vertex> vertexList = getArrangedVertexList();
        try{
            int totalPoints = endTime - startTime;
            constructFinalEquations(vertexList);

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

    public List<Vertex> getArrangedVertexList() {
        
        List<Vertex> allVertices = new ArrayList<Vertex>();
        List<Vertex> constantList = new ArrayList<Vertex>();
        List<Vertex> flowList = new ArrayList<Vertex>();
        List<Vertex> stockList = new ArrayList<Vertex>();
        int totalPoints = endTime - startTime;

        Iterator<Vertex> it = currentGraph.vertexSet().iterator();
        while (it.hasNext()) {
            Vertex thisVertex = it.next();

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

        allVertices.addAll(constantList);
        allVertices.addAll(stockList);
        allVertices.addAll(rearrangeFlowVertices(flowList));

        // Bad approach
        constantVertices = constantList.size();

        return allVertices;
    }

    /**
     * Method to Arrange the Flow nodes based on input dependencies
     * @param inputVertices 
     */
    private List<Vertex> rearrangeFlowVertices(List<Vertex> inputVertices){
        List<Vertex> newList = new ArrayList<Vertex>();
        List<Vertex> dependsList = new ArrayList<Vertex>();

        for (int i = 0; i < inputVertices.size(); i++) {

            Vertex v1 = inputVertices.get(i);
            boolean foundInput = false;
      
            LinkedList<String> operandsList = new LinkedList<String>(); 
            LinkedList<Vertex> operands = new LinkedList<Vertex>();

            String equation = v1.getEquation();
            Evaluator eval = new Evaluator();
            List<String> inputs = null;
            try{
                eval.parse(equation);
                inputs = eval.getAllVariables();
            }catch(Exception e){
                logs.error("error in retrieving operands for Node "+v1.getName());
            }
            
            
            // adds the inputs to the operands list and takes away any '_' that may be 
            //from the eq
            for (int m = 0; m < inputs.size(); m++) {
                operandsList.add(inputs.get(m)); 
            }

            // the below nested for loop goes through each of the correct vertexes and 
            //operands and adds the vertex's they represent to the operands linked list
            for (int m = 0; m < operandsList.size(); m++) {
                for (int n = 0; n < inputVertices.size(); n++) {
                    if (operandsList.get(m).equals(inputVertices.get(n).getName())) {
                        foundInput = true;
                        break;
                    }
                }
            }


            if (!foundInput) {
                newList.add(inputVertices.get(i));
            }
            else {
                dependsList.add(inputVertices.get(i));
            }
        }

        for (int i = 0; i < dependsList.size(); i++){
            newList.add(dependsList.get(i));
        }   

        return newList;
    }
        
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

    private void constructFinalEquations(List<Vertex> vertexList) throws Exception {
        
        List<String> allName = new ArrayList<String>();

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

    private Vertex getVertexByName(List<Vertex> vertexList, String name) {
        for (Vertex v : vertexList) {
            if (v.getName().equals(name)) {
                return v;
            }
        }

        return null;
    }
}
