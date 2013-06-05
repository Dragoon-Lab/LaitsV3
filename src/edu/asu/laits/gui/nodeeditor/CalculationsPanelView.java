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
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.swing.DefaultListModel;
import javax.swing.JFormattedTextField;
import javax.swing.JTextArea;
import javax.swing.text.DefaultFormatter;
import net.sourceforge.jeval.EvaluationException;
import net.sourceforge.jeval.Evaluator;


import org.apache.log4j.Logger;

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
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public CalculationsPanelView(NodeEditor ne) {
        initComponents();
        nodeEditor = ne;
        currentVertex = ne.getCurrentVertex();
        initPanel();
    }
    
    public void initPanel() {
        logs.debug("Initializing Calculations Panel for Node ");
        initializeAvailableInputNodes();
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            preparePanelForFixedValue();
            fixedValueInputBox.setText(String.valueOf(currentVertex.getInitialValue()));
            fixedValueOptionButton.setSelected(true);
            return;
        } 
        
        preparePanelForStockOrFlow();
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            preparePanelForStock();
            fixedValueInputBox.setText(String.valueOf(currentVertex.getInitialValue()));
            formulaInputArea.setText(currentVertex.getEquation());
            stockValueOptionButton.setSelected(true);
        } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            preparePanelForFlow();
            flowValueOptionButton.setSelected(true);
            formulaInputArea.setText(currentVertex.getEquation());
        } 
                            
    }

    /**
     * Method to initialize the list of available inputs for STOCK and FLOW
     */
    public void initializeAvailableInputNodes() {
        logs.debug("Initializing Available Input Nodes in jList Panel");
        
        availableInputJListModel.clear();
        Vertex currentVertex = nodeEditor.getCurrentVertex();
        Graph graph = (Graph) nodeEditor.getGraphPane().getModelGraph();
        Iterator<Edge> inEdges = graph.incomingEdgesOf(currentVertex).iterator();
        
        if (!inEdges.hasNext()) {
            showThatJListModelHasNoInputs();
            return;
        }
        
        Vertex v;
        while (inEdges.hasNext()) {
            v = (Vertex) graph.getEdgeSource(inEdges.next());
            availableInputJListModel.addElement(v.getName());
        }
        
        availableInputsJList.repaint();
    }
    
    public void showThatJListModelHasNoInputs() {
        availableInputJListModel.clear();
        availableInputJListModel.add(0, "This node does not have any inputs defined yet,");
        availableInputJListModel.add(1, "please go back to the Inputs Tab and choose ");
        availableInputJListModel.add(2, "at least one input, if there are not inputs ");
        availableInputJListModel.add(3, "available, please exit this node and create ");
        availableInputJListModel.add(4, "the needed nodes using the \"New node\" button.");
    }
    
    public String getFixedValue() {
        return fixedValueInputBox.getText();
    }
    
    public void setGivenValueTextField(JFormattedTextField givenValueTextField) {
        this.fixedValueInputBox = givenValueTextField;
    }
    
    public void preparePanelForFixedValue() {
        fixedValueOptionButton.setSelected(true);
        fixedValueOptionButton.setEnabled(false);
        flowValueOptionButton.setEnabled(false);
        stockValueOptionButton.setEnabled(false);
        
        fixedValueInputBox.setEnabled(true);
        fixedValueInputBox.setVisible(true);
        fixedValueLabel.setVisible(true);
        calculatorPanel.setVisible(false);
    }
    
    public void preparePanelForFlow() {        
        fixedValueInputBox.setVisible(false);
        fixedValueLabel.setVisible(false);
        calculatorPanel.setVisible(true);
        formulaInputArea.setText("");
        valuesLabel.setText("Next Value = ");
    }
    
    public void preparePanelForStock() {
        fixedValueInputBox.setVisible(true);
        fixedValueLabel.setVisible(true);
        calculatorPanel.setVisible(true);
        fixedValueInputBox.setText("");
        formulaInputArea.setText("");
        valuesLabel.setText("Next Value = Current Value + ");
    }
    
    public void preparePanelForStockOrFlow() {
        fixedValueOptionButton.setEnabled(false);
        buttonGroup1.clearSelection();
        
        flowValueOptionButton.setEnabled(true);
        stockValueOptionButton.setEnabled(true);
        
        formulaInputArea.setText("");
        
        calculatorPanel.setEnabled(true);
    }
    
    public boolean processCalculationsPanel() {
        if (fixedValueOptionButton.isSelected()) {
            return processConstantVertex();
        } else if (stockValueOptionButton.isSelected()) {
            return processStockVertex();
        } else if (flowValueOptionButton.isSelected()) {
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
    
    private boolean processStockVertex() {
        
        if (processConstantVertex() && validateEquation()) {
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
            availableVariables.add(String.valueOf(availableInputJListModel.get(i)));            
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
        if(nodeEditor.getCurrentVertex().getInputsStatus().equals(Vertex.InputsStatus.CORRECT) ||
                nodeEditor.getCurrentVertex().getInputsStatus().equals(Vertex.InputsStatus.GAVEUP))
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
        quantitySelectionPanel.setBackground(c);
        fixedValueOptionButton.setBackground(c);
        stockValueOptionButton.setBackground(c);
        flowValueOptionButton.setBackground(c);
        
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
            fixedValueOptionButton.setSelected(true);
            logs.debug("Setting Constant Value as " + correctNode.getNodeEquation());
            fixedValueInputBox.setText(correctNode.getNodeEquation());
            fixedValueInputBox.setBackground(Color.YELLOW);
            reloadGraphPane();            
        } else{
            currentVertex.setVertexType(correctNode.getNodeType());            
        } 
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            stockValueOptionButton.setSelected(true);
            fixedValueInputBox.setText(String.valueOf(correctNode.getInitialValue()));
        } else if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            flowValueOptionButton.setSelected(true);
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
                nodeEditor.setEditorMessage("Please define all the Nodes before using Demo.", true);
                return false;
            }
            reloadGraphPane();
            formulaInputArea.setText(correctNode.getNodeEquation());
            formulaInputArea.setBackground(Color.YELLOW);
        }
        
        quantitySelectionPanel.setBackground(Color.YELLOW);
        
        
        return true;
        
    }
    
    private void reloadGraphPane() {
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
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
        quantitySelectionPanel = new javax.swing.JPanel();
        fixedValueOptionButton = new javax.swing.JRadioButton();
        stockValueOptionButton = new javax.swing.JRadioButton();
        flowValueOptionButton = new javax.swing.JRadioButton();
        quantityLabel = new javax.swing.JLabel();
        needInputLabel = new javax.swing.JLabel();
        jPanel2 = new javax.swing.JPanel();
        calculatorPanel = new javax.swing.JPanel();
        valuesLabel = new javax.swing.JLabel();
        jScrollPane1 = new javax.swing.JScrollPane();
        formulaInputArea = new javax.swing.JTextArea();
        availableInputsLabel = new javax.swing.JLabel();
        jScrollPane4 = new javax.swing.JScrollPane();
        jScrollPane2 = new javax.swing.JScrollPane();
        availableInputsJList = new javax.swing.JList();

        jScrollPane3.setViewportView(jEditorPane1);

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        contentPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        fixedValueLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        fixedValueLabel.setText("<html><b>Initial value = </b></html>");
        contentPanel.add(fixedValueLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(20, 136, -1, 30));

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
        contentPanel.add(fixedValueInputBox, new org.netbeans.lib.awtextra.AbsoluteConstraints(120, 140, 454, -1));

        quantitySelectionPanel.setBorder(javax.swing.BorderFactory.createLineBorder(new java.awt.Color(0, 0, 0)));

        fixedValueOptionButton.setBackground(new java.awt.Color(255, 255, 255));
        buttonGroup1.add(fixedValueOptionButton);
        fixedValueOptionButton.setText("has a fixed value");
        fixedValueOptionButton.setEnabled(false);
        fixedValueOptionButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                fixedValueOptionButtonActionPerformed(evt);
            }
        });

        stockValueOptionButton.setBackground(new java.awt.Color(255, 255, 255));
        buttonGroup1.add(stockValueOptionButton);
        stockValueOptionButton.setText("accumulates the values of its inputs");
        stockValueOptionButton.setEnabled(false);
        stockValueOptionButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                stockValueOptionButtonActionPerformed(evt);
            }
        });

        flowValueOptionButton.setBackground(new java.awt.Color(255, 255, 255));
        buttonGroup1.add(flowValueOptionButton);
        flowValueOptionButton.setText("is a function of its inputs values");
        flowValueOptionButton.setEnabled(false);
        flowValueOptionButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                flowValueOptionButtonActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout quantitySelectionPanelLayout = new javax.swing.GroupLayout(quantitySelectionPanel);
        quantitySelectionPanel.setLayout(quantitySelectionPanelLayout);
        quantitySelectionPanelLayout.setHorizontalGroup(
            quantitySelectionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(quantitySelectionPanelLayout.createSequentialGroup()
                .addGroup(quantitySelectionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(fixedValueOptionButton)
                    .addComponent(flowValueOptionButton)
                    .addComponent(stockValueOptionButton))
                .addContainerGap(314, Short.MAX_VALUE))
        );
        quantitySelectionPanelLayout.setVerticalGroup(
            quantitySelectionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(quantitySelectionPanelLayout.createSequentialGroup()
                .addComponent(fixedValueOptionButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(stockValueOptionButton, javax.swing.GroupLayout.PREFERRED_SIZE, 23, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(flowValueOptionButton)
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        contentPanel.add(quantitySelectionPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 28, -1, -1));

        quantityLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        quantityLabel.setText("The node's quantity:");
        contentPanel.add(quantityLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 6, -1, -1));
        contentPanel.add(needInputLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 163, -1, -1));

        add(contentPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(18, 7, -1, 210));

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

        javax.swing.GroupLayout calculatorPanelLayout = new javax.swing.GroupLayout(calculatorPanel);
        calculatorPanel.setLayout(calculatorPanelLayout);
        calculatorPanelLayout.setHorizontalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(availableInputsLabel)
                    .addComponent(jScrollPane4, javax.swing.GroupLayout.PREFERRED_SIZE, 266, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(59, 59, 59)
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(valuesLabel))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        calculatorPanelLayout.setVerticalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(availableInputsLabel)
                    .addComponent(valuesLabel))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(jScrollPane4)
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 160, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(0, 58, Short.MAX_VALUE))))
        );

        javax.swing.GroupLayout jPanel2Layout = new javax.swing.GroupLayout(jPanel2);
        jPanel2.setLayout(jPanel2Layout);
        jPanel2Layout.setHorizontalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel2Layout.createSequentialGroup()
                .addContainerGap()
                .addComponent(calculatorPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(19, Short.MAX_VALUE))
        );
        jPanel2Layout.setVerticalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel2Layout.createSequentialGroup()
                .addComponent(calculatorPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(0, 0, Short.MAX_VALUE))
        );

        add(jPanel2, new org.netbeans.lib.awtextra.AbsoluteConstraints(18, 223, 600, -1));
    }// </editor-fold>//GEN-END:initComponents

    private void stockValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_stockValueOptionButtonActionPerformed
        logs.debug("Preparing UI for Stock Node");
        activityLogs.debug("User Selected Node type as STOCK for Node "+
                currentVertex.getName());
        preparePanelForStock();
        currentVertex.setVertexType(Vertex.VertexType.STOCK);
        reloadGraphPane();
    }//GEN-LAST:event_stockValueOptionButtonActionPerformed
    
    private void flowValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_flowValueOptionButtonActionPerformed
        logs.debug("Preparing UI for Flow Node");
        activityLogs.debug("User Selected Node type as FLOW for Node "+
                currentVertex.getName());
        preparePanelForFlow();
        currentVertex.setVertexType(Vertex.VertexType.FLOW);
        reloadGraphPane();
    }//GEN-LAST:event_flowValueOptionButtonActionPerformed

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
    /**
     * This method will remove the given node from Available Input Nodes jList
     *
     * @param nodeName : index of the node to be removed
     */
    private void removeAvailableInputNode(int nodeIndex) {
        availableInputJListModel.remove(nodeIndex);
    }

    /**
     * This method is called when user selects any node from available input
     * jList Once a particular input node is selected, it gets removed from the
     * list. If there are no more input nodes to be selected, then jList gets
     * disabled.
     */
    private void availableInputsJListMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_availableInputsJListMouseClicked
        formulaInputArea.setText(formulaInputArea.getText() + " "
                + availableInputsJList.getSelectedValue().toString());
        activityLogs.debug("User selected input "+availableInputsJList.getSelectedValue().toString()+
                " for the Calculations of Node "+currentVertex.getName());
}//GEN-LAST:event_availableInputsJListMouseClicked
    
    private void fixedValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueOptionButtonActionPerformed
        //Delete the equation
    }//GEN-LAST:event_fixedValueOptionButtonActionPerformed
    
    private void fixedValueInputBoxKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyReleased
    }//GEN-LAST:event_fixedValueInputBoxKeyReleased
    
    private void fixedValueInputBoxKeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyTyped
    }//GEN-LAST:event_fixedValueInputBoxKeyTyped
    
  private void fixedValueInputBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueInputBoxActionPerformed
      // TODO add your handling code here:
  }//GEN-LAST:event_fixedValueInputBoxActionPerformed
    
    public JTextArea getFormulaInputArea() {
        return formulaInputArea;
    }
    
    public void setEditableCalculations(Boolean b){
        fixedValueOptionButton.setEnabled(b);
        flowValueOptionButton.setEnabled(b);    
        stockValueOptionButton.setEnabled(b);
        fixedValueInputBox.setEnabled(b);
        availableInputsJList.setEnabled(b);
        formulaInputArea.setEnabled(b);
    }
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JList availableInputsJList;
    private javax.swing.JLabel availableInputsLabel;
    private javax.swing.ButtonGroup buttonGroup1;
    private javax.swing.JPanel calculatorPanel;
    private javax.swing.JPanel contentPanel;
    private javax.swing.JFormattedTextField fixedValueInputBox;
    private javax.swing.JLabel fixedValueLabel;
    private javax.swing.JRadioButton fixedValueOptionButton;
    private javax.swing.JRadioButton flowValueOptionButton;
    private javax.swing.JTextArea formulaInputArea;
    private javax.swing.JEditorPane jEditorPane1;
    private javax.swing.JPanel jPanel2;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JScrollPane jScrollPane2;
    private javax.swing.JScrollPane jScrollPane3;
    private javax.swing.JScrollPane jScrollPane4;
    private javax.swing.JLabel needInputLabel;
    private javax.swing.JLabel quantityLabel;
    private javax.swing.JPanel quantitySelectionPanel;
    private javax.swing.JRadioButton stockValueOptionButton;
    private javax.swing.JLabel valuesLabel;
    // End of variables declaration//GEN-END:variables
}
