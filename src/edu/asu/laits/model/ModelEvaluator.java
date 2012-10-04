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
    Map<String, String> finalEquations;
    Map<String, List<String>> finalOperands;
    private static Logger logs = Logger.getLogger(ModelEvaluator.class);

    public ModelEvaluator(Graph inputGraph) {
        currentGraph = inputGraph;
        startTime = Task.getInstance().getStartTime();
        endTime = Task.getInstance().getEndTime();
        finalEquations = new HashMap<String, String>();
        finalOperands = new HashMap<String, List<String>>();
    }

    public boolean run() {
        try{
        List<Vertex> vertexList = getArrangedVertexList();
        int totalPoints = endTime - startTime;
        constructFinalEquations(vertexList);
        Queue<Double> iterationResult = new LinkedList<Double>();

        // Calculating Initial Flow for i =0
        for (int j = constantVertices; j < vertexList.size(); j++) {
            Vertex currentVertex = vertexList.get(j);
            if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                iterationResult.add(calculate(vertexList, currentVertex, 1));
            }
        }
        
        for (int j = constantVertices; j < vertexList.size(); j++) {
            Vertex currentVertex = vertexList.get(j);
            if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                currentVertex.getCorrectValues().add(iterationResult.remove());
            }
        }
        
        
        // Calculating all the points from 1 to totalpoints-1
        for (int i = 1; i < totalPoints; i++) {

            for (int j = constantVertices; j < vertexList.size(); j++) {
                Vertex currentVertex = vertexList.get(j);

                if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                    iterationResult.add(calculate(vertexList, currentVertex, i));
                } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                    iterationResult.add(calculate(vertexList, currentVertex, i));
                }
            }
            
            
            for (int j = constantVertices; j < vertexList.size(); j++) {
                Vertex currentVertex = vertexList.get(j);

                if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                    currentVertex.getCorrectValues().add(iterationResult.remove());
                } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                    currentVertex.getCorrectValues().add(iterationResult.remove());
                }
            }
            
            iterationResult.clear();

        }

        }catch(Exception ex){
            logs.error("Error in Model Execution "+ex.getMessage());
            return false;
        }
        return true;
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
                //thisVertex.getCorrectValues().add(0.0);
                flowList.add(thisVertex);
            }
        }

        allVertices.addAll(constantList);
        allVertices.addAll(stockList);
        allVertices.addAll(flowList);

        // Bad approach
        constantVertices = constantList.size();

        return allVertices;
    }

    private double calculate(List<Vertex> vertexList, Vertex currentVertex, int pointNumber) throws Exception {
        String formula = finalEquations.get(currentVertex.getName());
        Iterator<String> it = finalOperands.get(currentVertex.getName()).iterator();

        Evaluator eval = new Evaluator();
        eval.parse(formula);
        String name, value;

        while (it.hasNext()) {
            name = it.next();
            if (getVertexByName(vertexList, name).getCorrectValues().size() == 0) {
                value = "0.0";
            } else {
                value = String.valueOf(getVertexByName(vertexList, name).getCorrectValues().get(pointNumber - 1));
            }

            eval.putVariable(name, value);
        }

        return Double.valueOf(eval.evaluate());
    }

    private void constructFinalEquations(List<Vertex> vertexList) throws Exception {
        List<String> allName = new ArrayList<String>();

        for (Vertex v : vertexList) {
            allName.add(v.getName());
        }
        Evaluator eval = new Evaluator();
        for (Vertex v : vertexList) {
            eval.parse(v.getEquation());
            List<String> operands = eval.getOperands();

            String eq = v.getEquation();
            List<String> opList = new ArrayList<String>();
            for (String s : operands) {
                if (allName.contains(s)) {
                    opList.add(s);
                    eq = eq.replaceAll(s, "#{" + s + "}");
                }

            }
            finalOperands.put(v.getName(), opList);
            finalEquations.put(v.getName(), eq);
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
