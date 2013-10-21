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
import java.util.Iterator;
import java.util.List;
import java.util.Random;
import javax.swing.JOptionPane;
import net.sourceforge.jeval.EvaluationException;
import net.sourceforge.jeval.Evaluator;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultPort;

/**
 * Represents Solutions of Dragoon Problem.
 * 
 * @author ramayantiwari
 */
public class TaskSolution {
    private Task taskForStudents;
    private int nodeCount;
    private List<SolutionNode> solutionNodes;
    private List<SolutionNode> givenNodes;
    private List<String> correctNodeNames;
    private List<HelpBubble> helpBubbles;
    private SolutionDTreeNode dTreeNode;
    private Graph solutionGraph = null;
    private List<String> parameterSubPlans;
    private List<String> accumulatorSubPlans;
    private List<String> functionSubPlans;
    private static Logger logs = Logger.getLogger("DevLogs");
    private TargetNodes targetNodes;

    public TaskSolution() {
        solutionNodes = new ArrayList<SolutionNode>();
        givenNodes = new ArrayList<SolutionNode>();
        correctNodeNames = new ArrayList<String>();
        helpBubbles = new ArrayList<HelpBubble>();
        taskForStudents = new Task();
        targetNodes = new TargetNodes();
    }

    public Task getTaskDetails(){
        return taskForStudents;
    }
    
    public void setTaskDetails(Task taskDetails){
        taskForStudents = taskDetails;
    }
    
    public List<String> getParameterSubPlans() {
        return parameterSubPlans;
    }

    public List<String> getAccumulatorSubPlans() {
        return accumulatorSubPlans;
    }

    public List<String> getFunctionSubPlans() {
        return functionSubPlans;
    }

    public void setParameterSubPlans(List<String> parameterSubPlans) {
        this.parameterSubPlans = parameterSubPlans;
    }

    public void setAccumulatorSubPlans(List<String> accumulatorSubPlans) {
        this.accumulatorSubPlans = accumulatorSubPlans;
    }

    public void setFunctionSubPlans(List<String> functionSubPlans) {
        this.functionSubPlans = functionSubPlans;
    }
    public void addParameterSubPlans(String parameterSubPlan) {
        this.parameterSubPlans.add(parameterSubPlan);
    }

    public void addAccumulatorSubPlans(String accumulatorSubPlan) {
        this.accumulatorSubPlans.add(accumulatorSubPlan);
    }

    public void addFunctionSubPlans(String functionSubPlan) {
        this.functionSubPlans.add(functionSubPlan);
    }
    public TargetNodes getTargetNodes() {
        return targetNodes;
    }

    public void initTargetNodes() {
        targetNodes.initFirstNodes(solutionNodes);
    }
    
    /**
     * @return the nodeCount
     */
    public int getNodeCount() {
        return nodeCount;
    }

    /**
     * @param nodeCount the nodeCount to set
     */
    public void setNodeCount(int nodeCount) {
        this.nodeCount = nodeCount;
    }

    /**
     * @return the solutionNodes
     */
    public List<SolutionNode> getSolutionNodes() {
        return solutionNodes;
    }

    /**
     * @param solutionNodes the solutionNodes to set
     */
    public void setSolutionNodes(List<SolutionNode> solutionNodes) {
        this.solutionNodes = solutionNodes;
    }

    /**
     * @return the solutionNodes
     */
    public List<String> getCorrectNodeNames() {
        return correctNodeNames;
    }

    /**
     * @param solutionNodes the solutionNodes to set
     */
    public void setCorrectNodeNames(List<String> solutionNodeNames) {
        this.correctNodeNames = solutionNodeNames;
    }

    /**
     * @return the solutionNodes
     */
    public List<SolutionNode> getGivenNodes() {
        return givenNodes;
    }

    /**
     * @param solutionNodes the solutionNodes to set
     */
    public void setGivenNodes(List<SolutionNode> givenNodes) {
        this.givenNodes = givenNodes;
    }

    /**
     * @return the dTreeNode
     */
    public SolutionDTreeNode getdTreeNode() {
        return dTreeNode;
    }

    /**
     * @param dTreeNode the dTreeNode to set
     */
    public void setdTreeNode(SolutionDTreeNode dTreeNode) {
        this.dTreeNode = dTreeNode;
    }

    public boolean checkNodeName(String nodeName) {
        if (getNodeByName(nodeName) != null) {
            return true;
        } else {
            return false;
        }
    }

    public int checkNodeNameOrdered(String nodeName) {
        SolutionNode correctNode = getNodeByName(nodeName);
        TargetNodes targetNodes = getTargetNodes();
        if (correctNode != null) {
            if (targetNodes.getNextNodes().contains(nodeName)) {
                return 1;
            } else {
                return 2;
            }
        } else {
            return 0;
        }

    }

    public boolean checkNodePlan(String nodeName, Vertex.VertexType plan) {
        logs.info("Checking Plan for Node : " + nodeName + "  " + "selected plan: " + plan);
        if (getNodeByName(nodeName).getNodeType().compareTo(plan) == 0) {
            return true;
        } else {
            return false;
        }
    }

    // Error Code 1 - type error, 2 - inputs error, 0 - No Type error, 3 - no type n input error
    public int checkNodeInputs(String nodeName, List<String> inputs) {
        logs.debug("Checking Inputs for Node " + nodeName + " Given Inputs: "+inputs);

        SolutionNode correctNode = getNodeByName(nodeName);
        if (correctNode.getNodeType().equals(Vertex.VertexType.CONSTANT)) {
            if (inputs == null || inputs.size() == 0) {
                return 0;
            }

            return 1;
        } else {
            if (inputs == null) {
                return 1;
            }

            List<String> correctInputs = correctNode.getInputNodes();
            logs.debug("Correct Inputs : " + correctInputs);
            
            if (correctInputs.size() != inputs.size()) {
                return 2;
            } else if (correctInputs.containsAll(inputs)) {
                return 3;
            } else {
                return 2;
            }
        }

    }

    public boolean checkNodeCalculations(Vertex studentNode) {
        logs.debug("Checking Calculations for Node " + studentNode.getName());

        SolutionNode correctNode = getNodeByName(studentNode.getName());

        // Check if Type of Nodes are Same
        if (!correctNode.getNodeType().equals(studentNode.getVertexType())) {
            return false;
        }

        // If Node is Constant or Accumulator check if Initial Values are same
        if (correctNode.getNodeType().equals(Vertex.VertexType.CONSTANT)
                || correctNode.getNodeType().equals(Vertex.VertexType.STOCK)) {

            if (!(correctNode.getInitialValue() == studentNode.getInitialValue())) {
                return false;
            }

            if (correctNode.getNodeType().equals(Vertex.VertexType.STOCK)) {
                return checkNodeEquation(correctNode.getNodeEquation(), studentNode.getEquation().trim());
            }

        } else if (correctNode.getNodeType().equals(Vertex.VertexType.FLOW)) {
            return checkNodeEquation(correctNode.getNodeEquation().trim(), studentNode.getEquation().trim());
        }

        return true;
    }

    private boolean checkNodeEquation(String correctEquation, String studentEquation) {
        logs.debug("Checking Node Equation. Correct Equation: "+correctEquation + ", Student's Equation: "+studentEquation);

        Evaluator evalStudent = new Evaluator();
        Evaluator evalCorrect = new Evaluator();

        try {
            evalStudent.parse(studentEquation);
            evalCorrect.parse(correctEquation);

            List<String> studentVariables = evalStudent.getAllVariables();
            List<String> correctVariables = evalCorrect.getAllVariables();

            if (studentVariables.size() != correctVariables.size()) {
                return false;
            }

            if (!studentVariables.containsAll(correctVariables)) {
                return false;
            }

            for (int i = 0; i < 5; i++) {
                    Random rand = new Random(123);

                for (String var : studentVariables) {
                    int r = rand.nextInt(100);

                    double value = (r + rand.nextDouble()) % 150;
                    evalStudent.putVariable(var, String.valueOf(value));
                    evalCorrect.putVariable(var, String.valueOf(value));
                }

                String studentResult = evalStudent.evaluate();
                String correctResult = evalCorrect.evaluate();

                logs.debug("Result " + (i + 1) + "  S: " + studentResult + "  C: " + correctResult);

                if (!studentResult.equals(correctResult)) {
                    logs.debug("Student and Author Equation Results did not match");
                    return false;
                }
            }

        } catch (EvaluationException ex) {
            ex.printStackTrace();
            logs.debug("Error in Evaluating Student's Equation");
            return false;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }

        return true;
    }

    public SolutionNode getNodeByName(String name) {
        for (SolutionNode currentNode : solutionNodes) {
            if (currentNode.getNodeName().equalsIgnoreCase(name)) {
                return currentNode;
            }
        }
        return null;
    }
    public SolutionNode getNodeByOrder(int order) {
        for (SolutionNode currentNode : solutionNodes) {
            if (currentNode.getNodeOrder() == order) {
                return currentNode;
            }
        }
        return null;
    }

    public boolean checkNodeGraph(Vertex studentVertex) {
        if (solutionGraph == null) {
            createSolutionGraph();
            System.out.println("**\nIn checkNodeGraph()");
            ModelEvaluator evaluator = new ModelEvaluator(solutionGraph);

            try {
                evaluator.run();
            } catch (ModelEvaluationException ex) {
                ex.printStackTrace();
                logs.fatal("Error in Evaluating Correct Solution Graph.");
                JOptionPane.showMessageDialog(MainWindow.getFrames()[0],
                        "Internal LAITS Error in Solution File - System will exit.",
                        "Fatal Error", JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        }

        Vertex correctVertex = solutionGraph.getVertexByName(studentVertex.getName());

        // Check if Student Model was executed with correct start and end time
        if (correctVertex.getCorrectValues().size() != studentVertex.getCorrectValues().size()) {
            logs.debug("Student Solution and Correct Solution size for Vertex "
                    + studentVertex.getName() + " are different");
            logs.debug("Correct Solution " + correctVertex.getCorrectValues().size() + "  Student Values Size: "
                    + studentVertex.getCorrectValues().size());
            return false;
        }


        Iterator<Double> correctValues = correctVertex.getCorrectValues().iterator();
        Iterator<Double> studentValues = studentVertex.getCorrectValues().iterator();

        while (correctValues.hasNext()) {
            //double difference = 
            if (Math.abs(correctValues.next().doubleValue() - studentValues.next().doubleValue()) > 0.005) {
                logs.debug("Graph Values for Vertex " + studentVertex.getName() + " differ with more than 0.001");
                return false;
            }
        }

        return true;
    }

    private void createSolutionGraph() {
        solutionGraph = new Graph<Vertex, Edge>(Edge.class);

        // Add all the vertices in the Graph
        for (SolutionNode node : solutionNodes) {
            if (correctNodeNames.contains(node.getNodeName())) {
                Vertex v = new Vertex();
                v.setName(node.getNodeName());
                v.setEquation(node.getNodeEquation());
                v.setInitialValue(node.getInitialValue());

                v.setVertexType(node.getNodeType());

                //v.setInputsStatus(Vertex.InputsStatus.CORRECT);
                v.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);

                solutionGraph.addVertex(v);
            }
        }

        // Add all the Edges in the Graph
        for (SolutionNode node : solutionNodes) {
            List<String> inputVertices = node.getInputNodes();
            for (String vertexName : inputVertices) {
                if(!node.isExtra()){
                    solutionGraph.addEdge(solutionGraph.getVertexByName(vertexName),
                            solutionGraph.getVertexByName(node.getNodeName()));
                }
            }
        }


        logs.debug("Solution Graph Created with " + solutionGraph.vertexSet().size()
                + " Vertices, and " + solutionGraph.edgeSet().size() + " edges.");
    }

    public Graph getSolutionGraph() {
        return solutionGraph;
    }

    public void addHelpBubble(HelpBubble newBubble) {
        helpBubbles.add(newBubble);
    }

    public List<HelpBubble> checkForHelp(String order, String time, String cevent) {
        List<HelpBubble> bubbles = new ArrayList<HelpBubble>();
        for (HelpBubble bubble : this.helpBubbles) {
            //System.out.println("Help check passed in " + order + " looking at " + bubble.getNodeName());
            if (order.equalsIgnoreCase(bubble.getNodeName()) && time.equalsIgnoreCase(bubble.getTiming()) && cevent.equalsIgnoreCase(bubble.getEvent())) {

              //  System.out.println("check for help worked");
              //  return bubble;
                bubbles.add(bubble);
            }
        }
        //System.out.println("check for help failed");
            return bubbles;

    }
}
