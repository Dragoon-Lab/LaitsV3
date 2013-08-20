/**
 * LAITS Project Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Updated by rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.swing.DefaultListModel;
import javax.swing.JComponent;
import javax.swing.JFormattedTextField;
import javax.swing.JTextArea;
import javax.swing.text.DefaultFormatter;
import net.sourceforge.jeval.EvaluationException;
import net.sourceforge.jeval.Evaluator;
import edu.asu.laits.model.Vertex.VertexType;
import java.util.LinkedList;


import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultPort;

/**
 * View class of Calculation Panel displayed in calculation tab of NodeEditor
 * This is responsible for creating FLOW and STOCK nodes and provide a way to
 * input formula using the selected nodes of Input Tab
 */
public class CalculationsPanelView extends javax.swing.JPanel {
    
    private DefaultListModel availableInputJListModel = new DefaultListModel();
    private final DecimalFormat inputDecimalFormat = new DecimalFormat("###0.000000##");
    private NodeEditor nodeEditor;
    private Vertex currentVertex;
    private LinkedList<String> inputNodesList;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public CalculationsPanelView(NodeEditor ne) {
        initComponents();
        nodeEditor = ne;
        currentVertex = ne.getCurrentVertex();
        inputNodesList = new LinkedList<String>();
        initPanel();
    }
    
    public void initPanel() {
        logs.debug("Initializing Calculations Panel for Node ");
        initializeAvailableInputNodes();
        
        if (currentVertex.getVertexType().equals(VertexType.CONSTANT)) {
            preparePanelForFixedValue();
            fixedValueInputBox.setText(String.valueOf(currentVertex.getInitialValue()));
            return;
        } 
        
        preparePanelForStockOrFlow();
        
        if (currentVertex.getVertexType().equals(VertexType.STOCK)) {
            preparePanelForStock();
            accumulatorInitialValueBox.setText(String.valueOf(currentVertex.getInitialValue()));
            formulaInputArea.setText(currentVertex.getEquation());
        } else if (currentVertex.getVertexType().equals(VertexType.FLOW)) {
            preparePanelForFlow();
            formulaInputArea.setText(currentVertex.getEquation());
        } 
                            
    }

    /**
     * Method to initialize the list of available inputs for STOCK and FLOW
     */
    public void initializeAvailableInputNodes() {
        logs.debug("Initializing Available Input Nodes in jList Panel");
        
        availableInputJListModel.clear();
        if(nodeEditor.getCurrentVertex().getDescriptionStatus().equals(
                Vertex.DescriptionStatus.UNDEFINED))
            return;
        
        if(nodeEditor.getGraphPane().getModelGraph().vertexSet().size() <= 1)
            return;
        
        Vertex currentVertex = nodeEditor.getCurrentVertex();
        Graph graph = (Graph) nodeEditor.getGraphPane().getModelGraph();
        Iterator<Edge> inEdges = graph.incomingEdgesOf(currentVertex).iterator();
//        
//        if (!inEdges.hasNext()) {
//            showThatJListModelHasNoInputs();
//            return;
//        }
        Set<Vertex> vertexes = graph.vertexSet();
        for(Vertex v : vertexes) {
            if(v.getName().equalsIgnoreCase(currentVertex.getName())){
                continue;
            }
            availableInputJListModel.addElement(v.getName());
        }
//        while (inEdges.hasNext()) {
//            v = (Vertex) graph.getEdgeSource(inEdges.next());
//            availableInputJListModel.addElement(v.getName());
//        }
        
        
        availableInputsJList.repaint();
    }
    
    public void showThatJListModelHasNoInputs() {
        availableInputJListModel.clear();
        availableInputJListModel.add(0, "This node does not have any inputs defined yet,");
        availableInputJListModel.add(1, "create one using Create Node button. ");
    }
    
    public String getFixedValue() {
        if(currentVertex.getVertexType().equals(VertexType.CONSTANT)){
            return fixedValueInputBox.getText();
        } else if(currentVertex.getVertexType().equals(VertexType.STOCK)){
            return accumulatorInitialValueBox.getText();
        } else {
            return "";
        }
        
    }
    
    public void setGivenValueTextField(JFormattedTextField givenValueTextField) {
        this.fixedValueInputBox = givenValueTextField;
    }
    
    public void preparePanelForFixedValue() {
        
        fixedValueInputBox.setEnabled(true);
        fixedValueInputBox.setVisible(true);
        fixedValueLabel.setVisible(true);
        fixedValueLabel.setText(currentVertex.getName() + " =");
        calculatorPanel.setVisible(false);
    }
    
    public void preparePanelForFlow() {    
        fixedValueInputBox.setVisible(false);
        fixedValueLabel.setVisible(false);
        calculatorPanel.setVisible(true);
        accumulatorPanel.setVisible(false);
        formulaInputArea.setText("");
        valuesLabel.setText(currentVertex.getName() + " =");
    }
    
    public void preparePanelForStock() {
        
        fixedValueInputBox.setVisible(false);
        fixedValueLabel.setVisible(false);
        calculatorPanel.setVisible(true);
        accumulatorPanel.setVisible(true);
        formulaInputArea.setText("");
  //      accumulatorInitialValueBox.setText("");
        valuesLabel.setText("Change in " + currentVertex.getName() + " per " + ApplicationContext.getCorrectSolution().getGraphUnits() + " = ");
    }
    
    public void preparePanelForStockOrFlow() {
        buttonGroup1.clearSelection();

        formulaInputArea.setText("");
        
        calculatorPanel.setEnabled(true);
    }
    
    public boolean processCalculationsPanel() {
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            return processConstantVertex();
        } else if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            return processStockVertex();
        } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            return processFlowVertex();
        } else {
            nodeEditor.setEditorMessage("Please Select Node Type in Calculation.", true);
            return false;
        }
    }
    
    private boolean processConstantVertex() {
        if (fixedValueInputBox.getText().isEmpty()) {
            nodeEditor.setEditorMessage("Please provide fixed value for this node.", true);
            return false;
        } else {
            // Check if value is getting changed - disable Graph
            Double newValue = Double.valueOf(fixedValueInputBox.getText());
            if (currentVertex.getInitialValue() != newValue) {
                disableAllGraphs();
            }
            currentVertex.setInitialValue(newValue);
            return true;
        }
    }
    
      private boolean processStockInitialValue() {
        if (accumulatorInitialValueBox.getText().isEmpty()) {
            nodeEditor.setEditorMessage("Please provide fixed value for this node.", true);
            return false;
        } else {
            // Check if value is getting changed - disable Graph
            Double newValue = Double.valueOf(accumulatorInitialValueBox.getText());
            if (currentVertex.getInitialValue() != newValue) {
                disableAllGraphs();
            }
            currentVertex.setInitialValue(newValue);
            return true;
        }
    }  
    
    private boolean processStockVertex() {
        
        if (processStockInitialValue() && validateEquation()) {
            // Check if equation is changed - disable graph
            if (!currentVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }
            
            currentVertex.setEquation(formulaInputArea.getText().trim());
            return true;
        } else {
            return false;
        }        
    }
    
    private boolean processFlowVertex() {
        if (validateEquation()) {
            if (!currentVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }
            
            currentVertex.setEquation(formulaInputArea.getText().trim());
            return true;
        } else {
            return false;
        }        
    }
    
    private boolean validateEquation() {
        String equation = formulaInputArea.getText().trim();
        
        if (equation.isEmpty()) {
            nodeEditor.setEditorMessage("Please provide an equation for this node.", true);
            return false;
        }

        // Check Syantax of this equation
        Evaluator eval = new Evaluator();
        try {
            eval.parse(equation);
        } catch (EvaluationException ex) {
            nodeEditor.setEditorMessage(ex.getMessage(), true);
            return false;
        }        
        
        List<String> availableVariables = new ArrayList<String>();
        List<String> usedVariables = eval.getAllVariables();
        
        for (int i = 0; i < availableInputJListModel.getSize(); i++) {
            String s = availableInputJListModel.get(i).toString();
            s = s.replace("<html><strong>", "");
            s = s.replace("</strong></html>", "");

            availableVariables.add(s);            
        }

        // Check if this equation uses all the inputs
        
        for (String s : availableVariables) {
            if (!usedVariables.contains(s)) {
                nodeEditor.setEditorMessage("Input node " + s + " is not used in the equation.", true);
                activityLogs.debug("User entered incorrect equation - "+
                        "Input node " + s + " is not used in the equation.");
                return false;
            }            
            eval.putVariable(s, String.valueOf(Math.random()));
        }


        // Check Sematics of the equation
        try {
            eval.evaluate();
        } catch (EvaluationException ex) {
            logs.error(ex.getMessage());
            nodeEditor.setEditorMessage(ex.getMessage(), true);
            return false;
        }
        return true;
    }
    
    public boolean isViewEnabled() {
        if(nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.CORRECT) ||
                nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.GAVEUP))
            return true;
        else 
            return false;
    }
    
    private void disableAllGraphs() {
        Iterator<Vertex> vertices = nodeEditor.getGraphPane().getModelGraph().
                vertexSet().iterator();
        
        while (vertices.hasNext()) {
            vertices.next().setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
        }
    }
    
    public void setCheckedBackground(Color c) {
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)
                || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            fixedValueInputBox.setBackground(c);            
        }
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)
                || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            formulaInputArea.setBackground(c);
        }
    }
    
    public void resetBackgroundColor(){
        setCheckedBackground(new Color(238, 238, 238));
    }
    
    public boolean giveUpCalculationsPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        SolutionNode correctNode = solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName());
        
        Vertex currentVertex = nodeEditor.getCurrentVertex();
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            logs.debug("Setting Constant Value as " + correctNode.getNodeEquation());
            fixedValueInputBox.setText(correctNode.getNodeEquation());
            fixedValueInputBox.setBackground(Color.YELLOW);
            reloadGraphPane();            
        } else{
            currentVertex.setVertexType(correctNode.getNodeType());            
        } 
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            accumulatorInitialValueBox.setText(String.valueOf(correctNode.getInitialValue()));
        } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            fixedValueInputBox.setEditable(false);
        }
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)
                || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            List<String> correctInputs = correctNode.getInputNodes();
            List<String> availableInputs = new ArrayList<String>();
            
            Set<Vertex> vertices = nodeEditor.getGraphPane().getModelGraph().vertexSet();
            for (Vertex v : vertices) {
                availableInputs.add(v.getName());
            }
            
            availableInputs.remove(nodeEditor.getCurrentVertex().getName());
            
            if (!availableInputs.containsAll(correctInputs)) {
                // Button name should be a variable;  see Bug #2104
                nodeEditor.setEditorMessage("Please define all the Nodes before using Demo.", true);
                return false;
            }
            for(String input: correctInputs){
                addEdge(ApplicationContext.getGraphEditorPane().getModelGraph().getVertexByName(input), currentVertex);
            }
            
            reloadGraphPane();
            formulaInputArea.setText(correctNode.getNodeEquation());
            formulaInputArea.setBackground(Color.YELLOW);
        }
        
        return true;
        
    }
    
    private void reloadGraphPane() {
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
    }
    
    private void addHelpBalloon(String timing){
        if(ApplicationContext.getAppMode().equalsIgnoreCase("COACHED")){
             List<HelpBubble> bubbles = ApplicationContext.getHelp(currentVertex.getName(), "Calculations", timing);
                if(!bubbles.isEmpty()){
                    for(HelpBubble bubble : bubbles){

                new BlockingToolTip(this.nodeEditor, bubble, this.getLabel(bubble.getAttachedTo()));
            }
        }
    }
 }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        buttonGroup1 = new javax.swing.ButtonGroup();
        jScrollPane3 = new javax.swing.JScrollPane();
        jEditorPane1 = new javax.swing.JEditorPane();
        contentPanel = new javax.swing.JPanel();
        fixedValueLabel = new javax.swing.JLabel();
        //Code commented by Josh 011912 -- starts here
        //givenValueTextField = new javax.swing.JFormattedTextField();
        //Code commented by Josh 011912 -- ends here
        fixedValueInputBox = new DecimalTextField();
        needInputLabel = new javax.swing.JLabel();
        calculatorPanel = new javax.swing.JPanel();
        valuesLabel = new javax.swing.JLabel();
        jScrollPane1 = new javax.swing.JScrollPane();
        formulaInputArea = new javax.swing.JTextArea();
        availableInputsLabel = new javax.swing.JLabel();
        jScrollPane4 = new javax.swing.JScrollPane();
        jScrollPane2 = new javax.swing.JScrollPane();
        availableInputsJList = new javax.swing.JList();
        buttonAdd = new javax.swing.JButton();
        buttonSubtract = new javax.swing.JButton();
        buttonMultiply = new javax.swing.JButton();
        buttonDivide = new javax.swing.JButton();
        buttonCreateNodeInputTab = new javax.swing.JButton();
        accumulatorPanel = new javax.swing.JPanel();
        accumulatorInitialValueLabel = new javax.swing.JLabel();
        //Code commented by Josh 011912 -- starts here
        //givenValueTextField = new javax.swing.JFormattedTextField();
        //Code commented by Josh 011912 -- ends here
        accumulatorInitialValueBox = new DecimalTextField();

        jScrollPane3.setViewportView(jEditorPane1);

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        contentPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        fixedValueLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        fixedValueLabel.setText("<html><b>Initial value = </b></html>");
        contentPanel.add(fixedValueLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(60, 10, -1, 30));

        fixedValueInputBox.setFormatterFactory(new javax.swing.text.DefaultFormatterFactory(new javax.swing.text.NumberFormatter(inputDecimalFormat)));
        fixedValueInputBox.setHorizontalAlignment(javax.swing.JTextField.LEFT);
        fixedValueInputBox.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        fixedValueInputBox.setFocusCycleRoot(true);
        ((DefaultFormatter)fixedValueInputBox.getFormatter()).setAllowsInvalid( true );
        fixedValueInputBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                fixedValueInputBoxActionPerformed(evt);
            }
        });
        fixedValueInputBox.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                fixedValueInputBoxKeyTyped(evt);
            }
            public void keyReleased(java.awt.event.KeyEvent evt) {
                fixedValueInputBoxKeyReleased(evt);
            }
        });
        contentPanel.add(fixedValueInputBox, new org.netbeans.lib.awtextra.AbsoluteConstraints(60, 40, 454, -1));
        contentPanel.add(needInputLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 163, -1, -1));

        valuesLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        valuesLabel.setText("Next Value = ");

        formulaInputArea.setColumns(20);
        formulaInputArea.setLineWrap(true);
        formulaInputArea.setRows(5);
        formulaInputArea.setToolTipText("Node Equation");
        formulaInputArea.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        jScrollPane1.setViewportView(formulaInputArea);

        availableInputsLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        availableInputsLabel.setText("Available Inputs:");

        availableInputsJList.setModel(availableInputJListModel);
        availableInputsJList.setSelectionMode(javax.swing.ListSelectionModel.SINGLE_SELECTION);
        availableInputsJList.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                availableInputsJListMouseClicked(evt);
            }
        });
        jScrollPane2.setViewportView(availableInputsJList);

        jScrollPane4.setViewportView(jScrollPane2);

        buttonAdd.setText("+");
        buttonAdd.setMaximumSize(new java.awt.Dimension(65, 29));
        buttonAdd.setMinimumSize(new java.awt.Dimension(65, 29));
        buttonAdd.setPreferredSize(new java.awt.Dimension(65, 29));
        buttonAdd.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonAddActionPerformed(evt);
            }
        });

        buttonSubtract.setText("-");
        buttonSubtract.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonSubtractActionPerformed(evt);
            }
        });

        buttonMultiply.setText("*");
        buttonMultiply.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonMultiplyActionPerformed(evt);
            }
        });

        buttonDivide.setText("/");
        buttonDivide.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonDivideActionPerformed(evt);
            }
        });

        buttonCreateNodeInputTab.setText("Create Node");
        buttonCreateNodeInputTab.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        buttonCreateNodeInputTab.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCreateNodeInputTabActionPerformed(evt);
            }
        });

        accumulatorInitialValueLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        accumulatorInitialValueLabel.setText("Initial Value =");

        accumulatorInitialValueBox.setFormatterFactory(new javax.swing.text.DefaultFormatterFactory(new javax.swing.text.NumberFormatter(inputDecimalFormat)));
        accumulatorInitialValueBox.setHorizontalAlignment(javax.swing.JTextField.LEFT);
        accumulatorInitialValueBox.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        accumulatorInitialValueBox.setFocusCycleRoot(true);
        ((DefaultFormatter)fixedValueInputBox.getFormatter()).setAllowsInvalid( true );
        accumulatorInitialValueBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                accumulatorInitialValueBoxActionPerformed(evt);
            }
        });
        accumulatorInitialValueBox.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyTyped(java.awt.event.KeyEvent evt) {
                accumulatorInitialValueBoxKeyTyped(evt);
            }
            public void keyReleased(java.awt.event.KeyEvent evt) {
                accumulatorInitialValueBoxKeyReleased(evt);
            }
        });

        javax.swing.GroupLayout accumulatorPanelLayout = new javax.swing.GroupLayout(accumulatorPanel);
        accumulatorPanel.setLayout(accumulatorPanelLayout);
        accumulatorPanelLayout.setHorizontalGroup(
            accumulatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, accumulatorPanelLayout.createSequentialGroup()
                .addGap(0, 38, Short.MAX_VALUE)
                .addGroup(accumulatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(accumulatorInitialValueLabel)
                    .addComponent(accumulatorInitialValueBox, javax.swing.GroupLayout.PREFERRED_SIZE, 266, javax.swing.GroupLayout.PREFERRED_SIZE)))
        );
        accumulatorPanelLayout.setVerticalGroup(
            accumulatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(accumulatorPanelLayout.createSequentialGroup()
                .addGap(18, 18, 18)
                .addComponent(accumulatorInitialValueLabel)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(accumulatorInitialValueBox, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        javax.swing.GroupLayout calculatorPanelLayout = new javax.swing.GroupLayout(calculatorPanel);
        calculatorPanel.setLayout(calculatorPanelLayout);
        calculatorPanelLayout.setHorizontalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jScrollPane4, javax.swing.GroupLayout.PREFERRED_SIZE, 266, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(availableInputsLabel))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, calculatorPanelLayout.createSequentialGroup()
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(calculatorPanelLayout.createSequentialGroup()
                                .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, 54, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addComponent(buttonSubtract, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addComponent(buttonMultiply, javax.swing.GroupLayout.PREFERRED_SIZE, 53, javax.swing.GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addComponent(buttonDivide, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE))
                            .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 252, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(valuesLabel))
                        .addGap(12, 12, 12))
                    .addComponent(accumulatorPanel, javax.swing.GroupLayout.Alignment.TRAILING, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(0, 35, Short.MAX_VALUE))
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addGap(64, 64, 64)
                .addComponent(buttonCreateNodeInputTab)
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        calculatorPanelLayout.setVerticalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, calculatorPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addGap(0, 0, Short.MAX_VALUE)
                        .addComponent(accumulatorPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(valuesLabel, javax.swing.GroupLayout.PREFERRED_SIZE, 16, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(34, 34, 34)
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 125, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(buttonSubtract)
                            .addComponent(buttonMultiply)
                            .addComponent(buttonDivide)))
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addComponent(availableInputsLabel)
                        .addGap(18, 18, 18)
                        .addComponent(jScrollPane4)))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(buttonCreateNodeInputTab))
        );

        contentPanel.add(calculatorPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 90, -1, 340));

        add(contentPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 20, -1, 550));
    }// </editor-fold>//GEN-END:initComponents
    
    public String printCalculationPanel(){
        StringBuilder sb = new StringBuilder();
        sb.append("Node Type: '");
        if(currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)){
            sb.append("FLOW");
            sb.append("'  Calculations: '"+currentVertex.getEquation()+"'");
        }    
        else if(currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)){
            sb.append("STOCK");                    
            sb.append("'  Initial Value: '"+currentVertex.getInitialValue()+"'");
            sb.append("'  Calculations: '"+currentVertex.getEquation()+"'");
        }    
        else if(currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)){
            sb.append("CONSTANT");
            sb.append("'  Initial Value: '"+currentVertex.getInitialValue()+"'");
        }    
        else 
            sb.append("UNDEFINED");
        
        
        return sb.toString();
    }
    public void refreshInputs(){
        activityLogs.debug("Inputs Panel : User selected node type as INPUTS for Node "+
                nodeEditor.getCurrentVertex().getName());
        
     //   nodeEditor.getCurrentVertex().setVertexType(Vertex.VertexType.DEFAULT);
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();    
    }
    
    public JComponent getLabel(String label){
 
    Map<String, JComponent> map = new HashMap<String, JComponent>();
    map.put("fixedValueLabel", fixedValueLabel);
    map.put("jScrollPane1", jScrollPane1);
    map.put("jScrollPane2", jScrollPane2);
    map.put("availableInputsJList", availableInputsLabel);
    map.put("formulaInputArea", formulaInputArea);
    map.put("valuesLabel", valuesLabel);
    if(map.containsKey(label)){
        return map.get(label);
    }
    else {
        return null;
    }
}
    /**
     * This method will remove the given node from Available Input Nodes jList
     *
     * @param nodeName : index of the node to be removed
     */
    private void removeAvailableInputNode(int nodeIndex) {
        availableInputJListModel.remove(nodeIndex);
    }
    
   private void addEdge(Vertex v1, Vertex v2) {
        DefaultPort p1 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v1);
        DefaultPort p2 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v2);

        nodeEditor.getGraphPane().insertEdge(p1, p2);
    }

    /**
     * This method is called when user selects any node from available input
     * jList Once a particular input node is selected, it gets removed from the
     * list. If there are no more input nodes to be selected, then jList gets
     * disabled.
     */
    private void availableInputsJListMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_availableInputsJListMouseClicked
        int i = availableInputsJList.getSelectedIndex();
        
        availableInputJListModel.set(i, availableInputJListModel.get(i).toString().replace("<html><strong>", ""));
        availableInputJListModel.set(i, availableInputJListModel.get(i).toString().replace("</strong></html>", ""));

        formulaInputArea.setText(formulaInputArea.getText() + " "
                + availableInputsJList.getSelectedValue().toString());
        activityLogs.debug("User selected input "+availableInputsJList.getSelectedValue().toString()+
                " for the Calculations of Node "+currentVertex.getName());
        Graph graph = (Graph) this.nodeEditor.getGraphPane().getModelGraph();
        Vertex connectedVertex = graph.getVertexByName(availableInputsJList.getSelectedValue().toString());
        if(!graph.containsEdge(connectedVertex, currentVertex)){
            addEdge(connectedVertex, currentVertex);
        }
       
        availableInputJListModel.set(i, "<html><strong>" + availableInputsJList.getSelectedValue().toString() + "</strong></html>");
}//GEN-LAST:event_availableInputsJListMouseClicked
        
    private void fixedValueInputBoxKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyReleased
    }//GEN-LAST:event_fixedValueInputBoxKeyReleased
    
    private void fixedValueInputBoxKeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyTyped
    }//GEN-LAST:event_fixedValueInputBoxKeyTyped
    
  private void fixedValueInputBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueInputBoxActionPerformed

  }//GEN-LAST:event_fixedValueInputBoxActionPerformed

    private void buttonAddActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonAddActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" + ");
    }//GEN-LAST:event_buttonAddActionPerformed

    private void buttonSubtractActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonSubtractActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" - ");
    }//GEN-LAST:event_buttonSubtractActionPerformed

    private void buttonMultiplyActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonMultiplyActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" * ");
    }//GEN-LAST:event_buttonMultiplyActionPerformed

    private void buttonDivideActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonDivideActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" / ");
    }//GEN-LAST:event_buttonDivideActionPerformed

    private void buttonCreateNodeInputTabActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCreateNodeInputTabActionPerformed
        // TODO add your handling code here:
        // Process Cancel Action for all the Tabs
        activityLogs.debug("User pressed Create node button on inputs tab for Node " + nodeEditor.getCurrentVertex().getName());
        if(currentVertex.getVertexType()==Vertex.VertexType.STOCK){
            currentVertex.setInitialValue(Double.valueOf(accumulatorInitialValueBox.getText()));
        }
        Vertex v = new Vertex();
        v.setVertexIndex(nodeEditor.getGraphPane().getModelGraph().getNextAvailableIndex());
        nodeEditor.getGraphPane().addVertex(v);

        CreateNewNodeDialog newNodeDialog = new CreateNewNodeDialog(nodeEditor, v);
    }//GEN-LAST:event_buttonCreateNodeInputTabActionPerformed

    private void accumulatorInitialValueBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_accumulatorInitialValueBoxActionPerformed
        // TODO add your handling code here:
    }//GEN-LAST:event_accumulatorInitialValueBoxActionPerformed

    private void accumulatorInitialValueBoxKeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_accumulatorInitialValueBoxKeyTyped
        // TODO add your handling code here:
    }//GEN-LAST:event_accumulatorInitialValueBoxKeyTyped

    private void accumulatorInitialValueBoxKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_accumulatorInitialValueBoxKeyReleased
        // TODO add your handling code here:
    }//GEN-LAST:event_accumulatorInitialValueBoxKeyReleased
    
    public JTextArea getFormulaInputArea() {
        return formulaInputArea;
    }
    
    public void setEditableCalculations(Boolean b){
        fixedValueInputBox.setEnabled(b);
        availableInputsJList.setEnabled(b);
        formulaInputArea.setEnabled(b);
    }
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JFormattedTextField accumulatorInitialValueBox;
    private javax.swing.JLabel accumulatorInitialValueLabel;
    private javax.swing.JPanel accumulatorPanel;
    private javax.swing.JList availableInputsJList;
    private javax.swing.JLabel availableInputsLabel;
    private javax.swing.JButton buttonAdd;
    private javax.swing.JButton buttonCreateNodeInputTab;
    private javax.swing.JButton buttonDivide;
    private javax.swing.ButtonGroup buttonGroup1;
    private javax.swing.JButton buttonMultiply;
    private javax.swing.JButton buttonSubtract;
    private javax.swing.JPanel calculatorPanel;
    private javax.swing.JPanel contentPanel;
    private javax.swing.JFormattedTextField fixedValueInputBox;
    private javax.swing.JLabel fixedValueLabel;
    private javax.swing.JTextArea formulaInputArea;
    private javax.swing.JEditorPane jEditorPane1;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JScrollPane jScrollPane2;
    private javax.swing.JScrollPane jScrollPane3;
    private javax.swing.JScrollPane jScrollPane4;
    private javax.swing.JLabel needInputLabel;
    private javax.swing.JLabel valuesLabel;
    // End of variables declaration//GEN-END:variables
}
