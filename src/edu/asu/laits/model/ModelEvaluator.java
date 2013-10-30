/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */
package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.MainWindow;
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
    Times times;
    double timeStep;
    List<Vertex> arrangedVertexList;
    Map<String, List<String>> finalOperands;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public ModelEvaluator(Graph inputGraph) {
        currentGraph = inputGraph;
        times = ApplicationContext.getCurrentTask().getTimes();

        logs.debug("Getting Start Time and End Time from AppContext. "
                + times.getStartTime() + "  " + times.getEndTime() + "  dt=" + times.getTimeStep());
        finalOperands = new HashMap<String, List<String>>();
    }

    public int getConstantVertices() {
        return constantVertices;
    }

    public List<Vertex> returnArrangedVertexList() {
        return arrangedVertexList;
    }

    public Times getTimes() {
        return times;
    }

    /**
     * Test if current model can be run.
     * 1. Check if all the nodes are complete - plan, calculations are defined.
     * 2. All the correct student nodes has to be defined
     * 
     * Note: For author mode it only checks if all the nodes in the graph are complete.
     * 
     * @return True/False indicating if the current student model is complete
     */
    public boolean isModelComplete() {
        logs.info("Checking if Model is Complete.");
        Iterator<Vertex> allVertices = currentGraph.vertexSet().iterator();

        while (allVertices.hasNext()) {
            Vertex thisVertex = allVertices.next();
            if(!ApplicationContext.isTestMode()){
                if (thisVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)
                        || thisVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED)) {
                    return false;
                }
            } else {
                if(thisVertex.getVertexType().equals(Vertex.VertexType.DEFAULT) || 
                        (thisVertex.getEquation().equalsIgnoreCase("") && !thisVertex.getVertexType().equals(Vertex.VertexType.CONSTANT))) {
                    logs.debug("Vertex returning false for isModelComplete : " + thisVertex.getName());
                    return false;
                }
            }
        }
                
        // Mode Graph can not be executed until all the correct nodes are defined.
        if (!ApplicationContext.isAuthorMode() && !ApplicationContext.isTestMode()) {            
            if(!correctNodesDefined())
                return false;
        }
        
        return true;
    }

    /**
     * Method to pre-process Test Modes Nodes.
     * Test mode does not give feedback while creating node and providing plan/calculations.
     * Running a model requires that Description, Plan and Calculations are correct, so we 
     * need to pre-process all the student nodes and provide CORRECT/INCORRECT status to each node.
     * 
     * This is required as Test Mode does not have check and demo button enabled in Plan and Calculations panel.
     */ 
    public void processTestModeNodes(){
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        
        Iterator<Vertex> verticesInStudentGraph = currentGraph.vertexSet().iterator();
        
        while(verticesInStudentGraph.hasNext()){
            Vertex current = verticesInStudentGraph.next();
            if (solution.checkNodePlan(current.getName(), current.getVertexType())) {
                current.setPlanStatus(Vertex.PlanStatus.CORRECT);
            } else {
                current.setPlanStatus(Vertex.PlanStatus.INCORRECT);           
            }

            if (solution.checkNodeCalculations(current)) {
                current.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            } else {                
                current.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }
        }
    }
    
    public boolean hasExtraNodes() {
        // Author mode will not have extra nodes.
        if (ApplicationContext.isAuthorMode()) {
            return false;
        }

        List<String> correctNodeNames = ApplicationContext.getCorrectSolution()
                .getCorrectNodeNames();
        Iterator<Vertex> allVertices = currentGraph.vertexSet().iterator();
        List<String> studentNodeNames = new ArrayList<String>();
        while (allVertices.hasNext()) {
            studentNodeNames.add(allVertices.next().getName());
        }
        if (studentNodeNames.size() > correctNodeNames.size()) {
            return true;
        } else {
            return false;
        }
    }

    private boolean correctNodesDefined() {
        logs.info("Checking if Correct Nodes are defined");

        Iterator<Vertex> allVertices = currentGraph.vertexSet().iterator();
        List<String> studentNodeNames = new ArrayList<String>();
        while (allVertices.hasNext()) {
            Vertex current = allVertices.next();
            studentNodeNames.add(current.getName());
        }

        List<String> correctNodeNames = ApplicationContext.getCorrectSolution()
                .getCorrectNodeNames();

        if (studentNodeNames.containsAll(correctNodeNames)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Run Model
     *
     * @throws ModelEvaluationException
     */
    public void run() throws ModelEvaluationException {
        List<Vertex> vertexList = getArrangedVertexList();
        arrangedVertexList = vertexList;
        String arragedVertexNames = "";
        for (Vertex vertex : vertexList) {
            arragedVertexNames += vertex.getName() + ", ";
        }
        logs.debug("Arranged Vertex List " + arragedVertexNames);
        
        Vertex currentVertex = null;
        try {
            constructFinalEquations(vertexList);
            logs.debug("Final Operands   " + finalOperands.toString());
            logs.debug("Constant Vertices : " + constantVertices);

            // Calculating Initial Flow for i=0
            for (int j = constantVertices; j < vertexList.size(); j++) {
                currentVertex = vertexList.get(j);
                logs.debug("evaluating vertex " + currentVertex.getName());
                if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                    currentVertex.getCorrectValues().add(calculateFlow(vertexList, currentVertex, 0));
                }
            }

            
            logs.info("Calculating all the points from 1 to totalpoints-1");
            for (int i = 1; i < times.getNumberSteps(); i++) {
                for (int j = constantVertices; j < vertexList.size(); j++) {
                    currentVertex = vertexList.get(j);
                    //      logs.debug("evaluating vertex " + currentVertex.getName() + " time point " + i);
                    if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                        currentVertex.getCorrectValues().add(calculateStock(vertexList, currentVertex, i));
                        //     logs.debug(calculateStock(vertexList, currentVertex, i));
                    } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
                        currentVertex.getCorrectValues().add(calculateFlow(vertexList, currentVertex, i));
                    }

                    currentVertex.setGraphsStatus(Vertex.GraphsStatus.CORRECT);
                }
            }

            //printVertexValues(vertexList);
        } catch (Exception ex) {
            ex.printStackTrace();
            String err = "Error in Model Execution at Node '" + currentVertex.getName() + "'  " + ex.getMessage();
            logs.error(err);
            //currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            currentVertex.setGraphsStatus(Vertex.GraphsStatus.INCORRECT);
            throw new ModelEvaluationException(err);
        }
    }

    public void validateStudentGraph() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        int incorrectVertices = currentGraph.vertexSet().size();

        Iterator<Vertex> it = currentGraph.vertexSet().iterator();
        while (it.hasNext()) {
            Vertex currentVertex = it.next();
            logs.debug(" Checking Vertex " + currentVertex.getName());
            if (!solution.checkNodeGraph(currentVertex)) {
                logs.debug("Student Graph for Vertex " + currentVertex.getName() + " is Incorrect.");
                currentVertex.setGraphsStatus(Vertex.GraphsStatus.INCORRECT);
            } else {
                incorrectVertices--;
            }
        }
        if (incorrectVertices == 0) {
            logs.debug("Setting Problem Solved to True");
            ApplicationContext.setProblemSolved(true);
            MainWindow.getInstance().getModelToolBar().enableDoneButton();
        }
    }

    /**
     * Arrange all the vertices in Order : Constant, Stock, Flow
     *
     * @return: arranged Vertex List
     * @throws ModelEvaluationException
     */
    public List<Vertex> getArrangedVertexList() throws ModelEvaluationException {
        List<Vertex> allVertices = new ArrayList<Vertex>();
        List<Vertex> constantList = new ArrayList<Vertex>();
        List<Vertex> flowList = new ArrayList<Vertex>();
        List<Vertex> stockList = new ArrayList<Vertex>();

        Iterator<Vertex> it = currentGraph.vertexSet().iterator();
        logs.debug("Total Vertex : " + currentGraph.vertexSet().size());

        while (it.hasNext()) {
            Vertex thisVertex = it.next();
            thisVertex.resetCorrectValues();

            if (thisVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
                // Initialize constant values
                for (int i = 0; i < times.getNumberSteps(); i++) {
                    thisVertex.getCorrectValues().add(thisVertex.getInitialValue());
                }
                thisVertex.setGraphsStatus(Vertex.GraphsStatus.CORRECT);
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
        if (flowList.size() == currentGraph.vertexSet().size()) {
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
     *
     * @param inputVertices
     * @return : Arrange Vertices
     * @throws ModelEvaluationException
     */
    private List<Vertex> topologialSort(List<Vertex> inputVertices)
            throws ModelEvaluationException {

        List<Vertex> sortedList = new ArrayList<Vertex>();
        Graph<Vertex, Edge> newGraph = new Graph<Vertex, Edge>(Edge.class);

        for (Vertex v : inputVertices) {
            newGraph.addVertex(v);
        }
        for (Edge e : currentGraph.edgeSet()) {
            if (inputVertices.contains(currentGraph.getEdgeSource(e))
                    && inputVertices.contains(currentGraph.getEdgeTarget(e))) {

                newGraph.addEdge(currentGraph.getEdgeSource(e),
                        currentGraph.getEdgeTarget(e));
            }
        }

        detectCycles(newGraph);

        TopologicalOrderIterator<Vertex, Edge> itr =
                new TopologicalOrderIterator<Vertex, Edge>(newGraph);
        while (itr.hasNext()) {
            sortedList.add(itr.next());
        }

        return sortedList;
    }

    /**
     * Method to check Cycles among Flow Nodes
     *
     * @param graph : new graph construct from flow nodes
     * @throws ModelEvaluationException
     */
    private void detectCycles(Graph graph) throws ModelEvaluationException {
        CycleDetector<Vertex, Edge> cycleDetector = new CycleDetector<Vertex, Edge>(graph);

        if (cycleDetector.detectCycles()) {
            Set<Vertex> cycleVertices;
            cycleVertices = cycleDetector.findCycles();

            String names = "[ ";
            for (Vertex v : cycleVertices) {
                names += v.getName() + " ";
            }
            names += "]";

            String msg = "Cycles found among Flow Nodes " + names;
            logs.error(msg);
            throw new ModelEvaluationException(msg);
        }
    }

    /**
     * Calculate Value of Stock Vertex
     *
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

        double result = times.getTimeStep() * Double.valueOf(eval.evaluate())
                + currentVertex.getCorrectValues().get(pointNumber - 1);
        return result;
    }

    /**
     * Calculate value of Flow Vertex
     *
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
     *
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
     *
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
     *
     * @param vertices
     */
    private void printVertexValues(List<Vertex> vertices) {
        for (Vertex v : vertices) {
            logs.debug("Vertex " + v.getName());
            logs.debug(v.getCorrectValues().toString());
        }
    }
}
