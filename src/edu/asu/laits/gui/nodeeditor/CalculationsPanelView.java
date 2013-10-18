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
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.gui.MainWindow;
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
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import javax.swing.JOptionPane;


import org.apache.log4j.Logger;

/**
 * View class of Calculation Panel displayed in calculation tab of NodeEditor
 * This is responsible for creating FLOW and STOCK nodes and provide a way to
 * input formula using the selected nodes of Input Tab
 * 
 * @author ramayantiwari
 */
public class CalculationsPanelView extends javax.swing.JPanel {
    
    private DefaultListModel availableInputJListModel = new DefaultListModel();
    private final DecimalFormat inputDecimalFormat = new DecimalFormat("###0.000000##");
    private NodeEditorView nodeEditor;
    private Vertex openVertex;
    private Graph modelGraph;
        
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public CalculationsPanelView(NodeEditorView ne) {
        initComponents();
        nodeEditor = ne;
        openVertex = ne.getOpenVertex();
        modelGraph = MainWindow.getInstance().getGraphEditorPane().getModelGraph();
        initPanel();        
    }
    
    public void initPanel() {
        logs.debug("Initializing Calculations Panel for Node " + openVertex.getName() + " Type: " + openVertex.getVertexType());
        // Initializing available input nodes on the avaialable input jListBox
        initializeAvailableInputNodes();
        
        if(openVertex.isCalculationsDone()
           && !ApplicationContext.isAuthorMode()) {
            logs.debug("Calculations were done so disabling edit on Calculations Panel");
            setEditableCalculations(false);
        }
        
        if (openVertex.getVertexType().equals(VertexType.CONSTANT)) {
            preparePanelForFixedValue();
            fixedValueInputBox.setText(String.valueOf(openVertex.getInitialValue()));
            return;
        }
        
        if (openVertex.getVertexType().equals(VertexType.STOCK)) {            
            preparePanelForStock();
            fixedValueInputBox.setText(String.valueOf(openVertex.getInitialValue()));
            formulaInputArea.setText(openVertex.getEquation());
        } else if (openVertex.getVertexType().equals(VertexType.FLOW)) {
            preparePanelForFlow();
            formulaInputArea.setText(openVertex.getEquation());
        }        
        if(!ApplicationContext.isAuthorMode()){
            setBackGroundColor();
        }        
        if(openVertex.isPlanDone()){
            setCreateButtonEnabled();
        }
    }
    
    private void setBackGroundColor(){
        if(openVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)){
            setCheckedBackground(Color.GREEN);
        }else if(openVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)){
            setCheckedBackground(Color.YELLOW);
        }else if(openVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.INCORRECT)){
            setCheckedBackground(Color.RED);
        }
    }
    
    /**
     * Method to initialize the list of available inputs for STOCK and FLOW
     */
    public void initializeAvailableInputNodes() {
        logs.debug("Initializing Available Input Nodes in jList Panel");
        
        availableInputJListModel.clear();
        if(nodeEditor.getOpenVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED))
            return;
        
        if(modelGraph.vertexSet().size() <= 1)
            return;
        
        List<String> vertices = modelGraph.getVerticesByName();
        vertices.remove(nodeEditor.getOpenVertex().getName());
        Collections.sort(vertices, new SortIgnoreCase());
        
        String nodeEquation = openVertex.getEquation().trim();
        Evaluator eval = new Evaluator();
        try {
            eval.parse(nodeEquation);
        } catch (EvaluationException ex) {
            logs.debug("Incorrect Node Equation...");
            nodeEditor.setEditorMessage("Incorrect Node Equation");
            return;
        }
        
        List<String> usedVariables = eval.getAllVariables();

        for(String vertexName : vertices) {
            if(usedVariables.contains(vertexName)){
                availableInputJListModel.addElement(addBoldtoListItem(vertexName));
            }else{
                availableInputJListModel.addElement(vertexName);
            }
        }        

        availableInputsJList.repaint();
    }
    
    public void showThatJListModelHasNoInputs() {
        availableInputJListModel.clear();
        availableInputJListModel.add(0, "This node does not have any inputs defined yet,");
        availableInputJListModel.add(1, "create one using Create Node button. ");
    }
    
    public String getFixedValue() {
        if(openVertex.getVertexType().equals(VertexType.CONSTANT)){
            return fixedValueInputBox.getText();
        } else if(openVertex.getVertexType().equals(VertexType.STOCK)){
            return fixedValueInputBox.getText();
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
        fixedValueLabel.setText(openVertex.getName() + " =");
        calculatorPanel.setVisible(false);        
    }
    
    public void preparePanelForFlow() {
        fixedValueInputBox.setVisible(false);
        fixedValueLabel.setVisible(false);
        calculatorPanel.setVisible(true);
        setEditableCalculations(true);
        accumulatorTimeLabel.setVisible(false);
        formulaInputArea.setText("");
        valuesLabel.setText(openVertex.getName() + " =");
    }
    
    public void preparePanelForStock() {        
        fixedValueInputBox.setVisible(true);
        fixedValueInputBox.setEnabled(true);
        fixedValueLabel.setVisible(true);
        calculatorPanel.setVisible(true);
        setEditableCalculations(true);
        accumulatorTimeLabel.setVisible(true);
        formulaInputArea.setText("");
        
        if(!ApplicationContext.isAuthorMode())            
            valuesLabel.setText("<html><body style='width: 275px'>New " + openVertex.getName() + "= <br />Old " + openVertex.getName() + " +</body></html>");
    }
    
    public boolean processCalculationsPanel() {
        if (openVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            return processConstantVertex();
        } else if (openVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            return processStockVertex();
        } else if (openVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
            return processFlowVertex();
        } else {
            nodeEditor.setEditorMessage("Please Select Node Type in Calculation.");
            return false;
        }
    }
    
    private boolean processConstantVertex() {
        logs.info("Processing Constant Vertex");
        
        if (fixedValueInputBox.getText().isEmpty()) {
            nodeEditor.setEditorMessage("Please provide fixed value for this node.");
            return false;
        } else {
            // Check if value is getting changed - disable Graph
            Double newValue = Double.valueOf(fixedValueInputBox.getText());
            if (openVertex.getInitialValue() != newValue) {
                disableAllGraphs();
            }
            openVertex.setInitialValue(newValue);
            return true;
        }
    }
    
    private boolean processStockInitialValue() {
        logs.info("Processing Stock Initial Value");
        
        if (fixedValueInputBox.getText().isEmpty()) {
            nodeEditor.setEditorMessage("Please provide fixed value for this node.");
            return false;
        } else {
            // Check if value is getting changed - disable Graph
            Double newValue = Double.valueOf(fixedValueInputBox.getText());
            if (openVertex.getInitialValue() != newValue) {
                disableAllGraphs();
            }
            openVertex.setInitialValue(newValue);
            return true;
        }
    }

    private boolean processStockVertex() {   
        logs.info("Processing Stock Vertex");      
        
        if (processStockInitialValue() && validateEquation(formulaInputArea.getText().trim())) {
            // Check if equation is changed - disable graph
            if (!openVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }            
            // Process the equation to create links
            processNodeEquation();
            openVertex.setEquation(formulaInputArea.getText().trim());
            return true;
        } else {
            return false;
        }
    }
    
    private boolean processFlowVertex() {
        logs.info("Processing Flow Vertex");
        if (validateEquation(formulaInputArea.getText().trim())) {
            if (!openVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }            
            // Process the equation to create links
            processNodeEquation();
            //openVertex.setEquation(formulaInputArea.getText().trim());
            return true;
        } else {
            return false;
        }
    }
    
    private boolean validateEquation(String equation) {
        
        if (equation.isEmpty()) {
            nodeEditor.setEditorMessage("Please provide an equation for this node.");
            return false;
        }
        
        // Check Syantax of this equation
        Evaluator eval = new Evaluator();
        try {
            eval.parse(equation);
        } catch (EvaluationException ex) {
            nodeEditor.setEditorMessage(ex.getMessage());
            return false;
        }
        
        List<String> usedVariables = eval.getAllVariables();
        List<String> availableVariables = modelGraph.getVerticesByName();
        
        // Assign random values to variables to test if equation can be evaluated
        for (String s : usedVariables) {
            if (!availableVariables.contains(s)) {
                nodeEditor.setEditorMessage("Input node " + s + " is not availabe.");
                activityLogs.debug("User entered incorrect equation - "+
                                   "Input node " + s + " is not present.");
                return false;
            }
            eval.putVariable(s, String.valueOf(Math.random()));
        }        
        
        // Check Sematics of the equation
        try {
            eval.evaluate();
        } catch (EvaluationException ex) {
            logs.error(ex.getMessage());
            nodeEditor.setEditorMessage(ex.getMessage());
            return false;
        }
        
        return true;
    }
    
    public boolean isViewEnabled() {
        if(openVertex.isPlanDone())
            return true;
        else
            return false;
    }
    
    private void disableAllGraphs() {
        Iterator<Vertex> vertices = modelGraph.vertexSet().iterator();
        
        while (vertices.hasNext()) {
            vertices.next().setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
        }
    }
    
    public void setCheckedBackground(Color c) {        
        if (openVertex.getVertexType().equals(Vertex.VertexType.CONSTANT) || openVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            fixedValueInputBox.setBackground(c);
        }
        
        if (openVertex.getVertexType().equals(Vertex.VertexType.FLOW)
            || openVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            formulaInputArea.setBackground(c);            
            availableInputsJList.setBackground(c);            
        }
    }
    
    public void resetBackgroundColor(){
        setCheckedBackground(new Color(238, 238, 238));
    }
    
    public boolean giveUpCalculationsPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        SolutionNode correctNode = solution.getNodeByName(nodeEditor.getOpenVertex().getName());
        
        Vertex currentVertex = nodeEditor.getOpenVertex();
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            logs.debug("Setting Constant Value as " + correctNode.getNodeEquation());
            fixedValueInputBox.setText(correctNode.getNodeEquation());
            MainWindow.refreshGraph();
        }
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)
            || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            List<String> correctInputs = correctNode.getInputNodes();
            List<String> availableInputs = modelGraph.getVerticesByName();
            
            availableInputs.remove(nodeEditor.getOpenVertex().getName());
            
            if (!availableInputs.containsAll(correctInputs)) {
                // Button name should be a variable;  see Bug #2104
                nodeEditor.setEditorMessage("Please define all the Nodes before using Demo.");
                return false;
            }
            
            // Enter the correct equation in textarea and process the equation to create edges
            formulaInputArea.setText(correctNode.getNodeEquation());
            processNodeEquation();
            
            if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                fixedValueInputBox.setText(String.valueOf(correctNode.getInitialValue()));
            }
                                    
            setCheckedBackground(Color.YELLOW);
            MainWindow.refreshGraph();
        }
        
        return true;
        
    }
    
    private void addHelpBalloon(String timing){
        if(ApplicationContext.isCoachedMode()){
            List<HelpBubble> bubbles = ApplicationContext.getHelp(openVertex.getName(), "Calculations", timing);
            if(!bubbles.isEmpty()){
                for(HelpBubble bubble : bubbles){
                    
                    new BlockingToolTip(this.nodeEditor, bubble, this.getLabel(bubble.getAttachedTo()));
                }
            }
        }
    }
    
    private class SortIgnoreCase implements Comparator <Object> {
        public int compare(Object o1, Object o2) {
            String s1 = (String) o1;
            String s2 = (String) o2;
            return s1.toLowerCase().compareTo(s2.toLowerCase());
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
        buttonCreateNode = new javax.swing.JButton();
        accumulatorTimeLabel = new javax.swing.JLabel();

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        contentPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        fixedValueLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        fixedValueLabel.setText("<html><b>Initial value = </b></html>");
        contentPanel.add(fixedValueLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 0, 100, 30));

        fixedValueInputBox.setFormatterFactory(new javax.swing.text.DefaultFormatterFactory(new javax.swing.text.NumberFormatter(inputDecimalFormat)));
        fixedValueInputBox.setHorizontalAlignment(javax.swing.JTextField.LEFT);
        fixedValueInputBox.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        fixedValueInputBox.setFocusCycleRoot(true);
        ((DefaultFormatter)fixedValueInputBox.getFormatter()).setAllowsInvalid( true );
        contentPanel.add(fixedValueInputBox, new org.netbeans.lib.awtextra.AbsoluteConstraints(120, 0, 360, -1));
        contentPanel.add(needInputLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 163, -1, -1));

        valuesLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        valuesLabel.setText("Next Value = ");

        formulaInputArea.setColumns(20);
        formulaInputArea.setLineWrap(true);
        formulaInputArea.setRows(5);
        formulaInputArea.setToolTipText("Node Equation");
        formulaInputArea.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        formulaInputArea.addKeyListener(new java.awt.event.KeyAdapter() {
            public void keyReleased(java.awt.event.KeyEvent evt) {
                formulaInputAreaKeyReleased(evt);
            }
        });
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

        buttonCreateNode.setText("Create Node");
        buttonCreateNode.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        buttonCreateNode.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCreateNodeActionPerformed(evt);
            }
        });

        accumulatorTimeLabel.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        accumulatorTimeLabel.setText("* Change in Time");

        javax.swing.GroupLayout calculatorPanelLayout = new javax.swing.GroupLayout(calculatorPanel);
        calculatorPanel.setLayout(calculatorPanelLayout);
        calculatorPanelLayout.setHorizontalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addComponent(availableInputsLabel)
                            .addComponent(jScrollPane4, javax.swing.GroupLayout.PREFERRED_SIZE, 229, javax.swing.GroupLayout.PREFERRED_SIZE))
                        .addGap(18, 18, 18)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING, false)
                            .addComponent(jScrollPane1, javax.swing.GroupLayout.DEFAULT_SIZE, 219, Short.MAX_VALUE)
                            .addGroup(calculatorPanelLayout.createSequentialGroup()
                                .addGap(38, 38, 38)
                                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.TRAILING)
                                    .addComponent(buttonMultiply, javax.swing.GroupLayout.PREFERRED_SIZE, 53, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, 54, javax.swing.GroupLayout.PREFERRED_SIZE))
                                .addGap(18, 18, 18)
                                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                    .addComponent(buttonSubtract, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addComponent(buttonDivide, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE)))
                            .addComponent(accumulatorTimeLabel)
                            .addComponent(valuesLabel, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)))
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addContainerGap()
                        .addComponent(buttonCreateNode)))
                .addGap(0, 4, Short.MAX_VALUE))
        );
        calculatorPanelLayout.setVerticalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(calculatorPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, calculatorPanelLayout.createSequentialGroup()
                        .addComponent(availableInputsLabel)
                        .addGap(18, 18, 18)
                        .addComponent(jScrollPane4, javax.swing.GroupLayout.DEFAULT_SIZE, 315, Short.MAX_VALUE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(buttonCreateNode))
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addGap(44, 44, 44)
                        .addComponent(valuesLabel, javax.swing.GroupLayout.PREFERRED_SIZE, 43, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 141, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addComponent(accumulatorTimeLabel)
                        .addGap(18, 18, 18)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(buttonSubtract))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(buttonMultiply)
                            .addComponent(buttonDivide))
                        .addGap(0, 0, Short.MAX_VALUE))))
        );

        contentPanel.add(calculatorPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 30, 470, 390));

        add(contentPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 10, 490, 440));
    }// </editor-fold>//GEN-END:initComponents
    
    public String printCalculationPanel(){
        StringBuilder sb = new StringBuilder();
        sb.append("Node Type: '");
        if(openVertex.getVertexType().equals(Vertex.VertexType.FLOW)){
            sb.append("FLOW");
            sb.append("'  Calculations: '"+openVertex.getEquation()+"'");
        }
        else if(openVertex.getVertexType().equals(Vertex.VertexType.STOCK)){
            sb.append("STOCK");
            sb.append("'  Initial Value: '"+openVertex.getInitialValue()+"'");
            sb.append("'  Calculations: '"+openVertex.getEquation()+"'");
        }
        else if(openVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)){
            sb.append("CONSTANT");
            sb.append("'  Initial Value: '"+openVertex.getInitialValue()+"'");
        }
        else
            sb.append("UNDEFINED");
        
        return sb.toString();
    }
    
    public void refreshInputs(){
        activityLogs.debug("Refreshing Calculations Panel Inputs for Node: "+
                           nodeEditor.getOpenVertex().getName());
        initializeAvailableInputNodes();
        MainWindow.refreshGraph(); // Why ??
    }
    
    // This method is problematic, why are we creating new map each time ??
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
     * This method is called when user selects any node from available input
     * jList Once a particular input node is selected, it gets removed from the
     * list. If there are no more input nodes to be selected, then jList gets
     * disabled.
     */
    private void availableInputsJListMouseClicked(java.awt.event.MouseEvent evt) {
        if(ApplicationContext.isAuthorMode() || !openVertex.isCalculationsDone()){
            String selectedVertexName = availableInputsJList.getSelectedValue().toString();
            selectedVertexName = removeBoldfromListItem(selectedVertexName);
            
            if(formulaInputArea.getText().contains(selectedVertexName)){
                formulaInputArea.setText(formulaInputArea.getText().replaceAll(selectedVertexName, ""));                
            }else{
                formulaInputArea.setText(formulaInputArea.getText() + selectedVertexName);    
            }
            
            // This can be improved to set/reset selection in if-else
            setSelectedNodesOnJList();
            
            activityLogs.debug("User selected input '" + selectedVertexName + 
                    "' for the Calculations of Node '" + openVertex.getName() + "'");
            
            availableInputsJList.removeSelectionInterval(0, availableInputJListModel.getSize());
        }
    }
    
    private boolean hasCorrectNodesDefined(){
        List<String> correctNodeNames = ApplicationContext.getCorrectSolution()
                .getCorrectNodeNames();
        Iterator<Vertex> allVertices = MainWindow.getInstance().getGraphEditorPane().getModelGraph().vertexSet().iterator();
        List<String> studentNodeNames = new ArrayList<String>();
        while (allVertices.hasNext()) {
            studentNodeNames.add(allVertices.next().getName());
        }
        if (studentNodeNames.size() < correctNodeNames.size()) {
            return false;
        } else {
            return true;
        }
    }
    
    private void buttonCreateNodeActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCreateNodeActionPerformed
        activityLogs.debug("User pressed Create node button on Calculations tab for Node " + openVertex.getName());
    
        // Check if Creating new node is allowed in non authot modes
        if(! ApplicationContext.isAuthorMode()){
            if(hasCorrectNodesDefined()){
                JOptionPane.showMessageDialog(nodeEditor, "Correct Nodes are already defined.", "Node Editor Error", JOptionPane.ERROR_MESSAGE);                            
                return;
            }
        }
            
        if(openVertex.getVertexType().equals(Vertex.VertexType.STOCK)  && !fixedValueInputBox.getText().isEmpty()){
            openVertex.setInitialValue(Double.valueOf(fixedValueInputBox.getText()));
        }
        
        Vertex v = new Vertex();
        // Should Index be set like this ???
        v.setVertexIndex(modelGraph.getNextAvailableIndex());
        MainWindow.getInstance().getGraphEditorPane().addVertex(v);

        CreateNewNodeDialog newNodeDialog = new CreateNewNodeDialog(nodeEditor, v);
    }//GEN-LAST:event_buttonCreateNodeActionPerformed

    private void buttonDivideActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonDivideActionPerformed
        formulaInputArea.setText(formulaInputArea.getText() + " / ");
    }//GEN-LAST:event_buttonDivideActionPerformed

    private void buttonMultiplyActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonMultiplyActionPerformed
        formulaInputArea.setText(formulaInputArea.getText() + " * ");
    }//GEN-LAST:event_buttonMultiplyActionPerformed

    private void buttonSubtractActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonSubtractActionPerformed
        formulaInputArea.setText(formulaInputArea.getText() + " - ");
    }//GEN-LAST:event_buttonSubtractActionPerformed

    private void buttonAddActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonAddActionPerformed
        formulaInputArea.setText(formulaInputArea.getText() + " + ");
    }//GEN-LAST:event_buttonAddActionPerformed

//GEN-FIRST:event_availableInputsJListMouseClicked

//GEN-LAST:event_availableInputsJListMouseClicked

    private void formulaInputAreaKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_formulaInputAreaKeyReleased
        // This method should only make the node names bold/unbold as they are 
        // typed or removed from the formula text box
        
        // If keypressed is an action key - Do nothing
        if(evt.isActionKey())
            return;
         
        setSelectedNodesOnJList();
        
        // Refresh List to show/hide bold node name
        availableInputsJList.removeSelectionInterval(0, availableInputJListModel.getSize());
    }//GEN-LAST:event_formulaInputAreaKeyReleased
     
    private void setSelectedNodesOnJList(){
        logs.debug("Setting NodeSelection on jListBox");
        Evaluator eval = new Evaluator();
        try{
            eval.parse(formulaInputArea.getText().trim());
            List<String> equationNodes = eval.getAllVariables();
            List<String> availableVariables = modelGraph.getVerticesByName();
            availableVariables.remove(openVertex.getName());
            Collections.sort(availableVariables, new SortIgnoreCase());
            
            availableInputJListModel.clear();
            for(String nodeName : availableVariables){
                if(equationNodes.contains(nodeName)){
                    availableInputJListModel.addElement(addBoldtoListItem(nodeName));
                }else{
                    availableInputJListModel.addElement(nodeName);
                }
            }
        }catch(Exception ex){
            logs.error("Could not parse the equation entered for node '" + openVertex.getName() +"'");
        }
    }
    
    private void processNodeEquation() {
        logs.debug("Processing NodeEquation to create edges");
        // Neglect spaces typed before or after the equation
        if (formulaInputArea.getText().trim().equals(openVertex.getEquation())) {
            return;
        }

        // Evaluators will ensure that entered equation is parsable 
        Evaluator old = new Evaluator();
        Evaluator changed = new Evaluator();

        try {
            old.parse(openVertex.getEquation());
            changed.parse(formulaInputArea.getText().trim());

            // Sets are used for easier comparision of old and new vertices
            Set<String> oldNodes = new HashSet<String>(old.getAllVariables());
            Set<String> newNodes = new HashSet<String>(changed.getAllVariables());
            
            if (!oldNodes.equals(newNodes)) {
                logs.info("Node Equation Changed");
                // Remove deleted nodes
                oldNodes.removeAll(newNodes);
                for(String node : oldNodes){
                    logs.info("Removing Edge from Node '" + node + "'");
                    modelGraph.removeEdge(modelGraph.getVertexByName(node),openVertex);                    
                }
                
                // Add newly created nodes
                oldNodes = new HashSet<String>(old.getAllVariables());
                newNodes.removeAll(oldNodes);
                List<String> availableVariables = modelGraph.getVerticesByName();
                
                for(String node : newNodes){
                    if(availableVariables.contains(node)){
                        logs.info("Adding Edge from Node '" + node + "'");
                        Vertex source = modelGraph.getVertexByName(node);
                        MainWindow.getInstance().getGraphEditorPane().addEdge(source, openVertex);                                          
                    }                    
                }
            }

            // Save new equation in the Node
            openVertex.setEquation(formulaInputArea.getText().trim());  
                
        } catch (EvaluationException ex) {
            logs.error("Could not parse the equation entered for node '" + openVertex.getName() +"'");
            // Do nothing if equation parsing fails
        }
    }
    
    
    public JTextArea getFormulaInputArea() {
        return formulaInputArea;
    }
    
    public void setEditableCalculations(Boolean b){
        fixedValueInputBox.setEnabled(b);
        availableInputsJList.setEnabled(b);
        formulaInputArea.setEnabled(b);
        fixedValueInputBox.setEnabled(b);
        buttonAdd.setEnabled(b);
        buttonSubtract.setEnabled(b);
        buttonMultiply.setEnabled(b);
        buttonDivide.setEnabled(b);
        buttonCreateNode.setEnabled(b);
    }
    
    public void setCreateButtonEnabled(){
        if(ApplicationContext.isCoachedMode()){
            SolutionNode node = ApplicationContext.getCorrectSolution().getNodeByName(openVertex.getName());
            List<String> correctInputs = node.getInputNodes();
            boolean enabled = false;
            for(String input : correctInputs){
                boolean included = false;
                for(int i=0; i < availableInputJListModel.getSize(); i++){
                    if(availableInputJListModel.get(i).toString().equalsIgnoreCase(input)){
                        included = true;
                    }
                }
                if(!included){
                    enabled = true;
                    break;
                }
            }
            buttonCreateNode.setEnabled(enabled);
        }
    }
    
    private String addBoldtoListItem(String vertexName){
        // Make sure that its not already bold
        String result = removeBoldfromListItem(vertexName);
        return "<html><strong>" + result + "</strong></html>";
    }
    
    private String removeBoldfromListItem(String vertexName){
        vertexName = vertexName.replace("<html><strong>", "");
        vertexName = vertexName.replace("</strong></html>", "");
        return vertexName;
    }
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel accumulatorTimeLabel;
    private javax.swing.JList availableInputsJList;
    private javax.swing.JLabel availableInputsLabel;
    private javax.swing.JButton buttonAdd;
    private javax.swing.JButton buttonCreateNode;
    private javax.swing.JButton buttonDivide;
    private javax.swing.JButton buttonMultiply;
    private javax.swing.JButton buttonSubtract;
    private javax.swing.JPanel calculatorPanel;
    private javax.swing.JPanel contentPanel;
    private javax.swing.JFormattedTextField fixedValueInputBox;
    private javax.swing.JLabel fixedValueLabel;
    private javax.swing.JTextArea formulaInputArea;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JScrollPane jScrollPane2;
    private javax.swing.JScrollPane jScrollPane4;
    private javax.swing.JLabel needInputLabel;
    private javax.swing.JLabel valuesLabel;
    // End of variables declaration//GEN-END:variables
}
