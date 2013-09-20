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
import edu.asu.laits.gui.MainWindow;
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
    private NodeEditorView nodeEditor;
    private Vertex openVertex;
        
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public CalculationsPanelView(NodeEditorView ne) {
        initComponents();
        nodeEditor = ne;
        openVertex = ne.getOpenVertex();
        initPanel();
    }
    
    public void initPanel() {
        logs.debug("Initializing Calculations Panel for Node "+openVertex.getName());
        
        initializeAvailableInputNodes();
        if(openVertex.isCalculationsDone()
           && !ApplicationContext.isAuthorMode()) {
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
        
    }
    
    /**
     * Method to initialize the list of available inputs for STOCK and FLOW
     */
    public void initializeAvailableInputNodes() {
        logs.debug("Initializing Available Input Nodes in jList Panel");
        
        availableInputJListModel.clear();
        if(nodeEditor.getOpenVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED))
            return;
        
        if(nodeEditor.getGraphPane().getModelGraph().vertexSet().size() <= 1)
            return;
        
        Vertex currentVertex = nodeEditor.getOpenVertex();
        Graph graph = (Graph) nodeEditor.getGraphPane().getModelGraph();
        Iterator<Edge> inEdges = graph.incomingEdgesOf(currentVertex).iterator();
        
        Set<Vertex> vertexes = graph.vertexSet();
        for(Vertex v : vertexes) {
            if(v.getName().equalsIgnoreCase(currentVertex.getName())){
                continue;
            }
            availableInputJListModel.addElement(v.getName());
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
   //     accumulatorPanel.setVisible(false);
        formulaInputArea.setText("");
        valuesLabel.setText(openVertex.getName() + " =");
    }
    
    public void preparePanelForStock() {
        
        fixedValueInputBox.setVisible(true);
        fixedValueLabel.setVisible(true);
        calculatorPanel.setVisible(true);
        formulaInputArea.setText("");
        
        if(!ApplicationContext.isAuthorMode())
            valuesLabel.setText("Change in " + openVertex.getName() + " per " + ApplicationContext.getCorrectSolution().getGraphUnits() + " = ");
    }
    
    public boolean processCalculationsPanel() {
        if (openVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            return processConstantVertex();
        } else if (openVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            return processStockVertex();
        } else if (openVertex.getVertexType().equals(Vertex.VertexType.FLOW)) {
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
            if (openVertex.getInitialValue() != newValue) {
                disableAllGraphs();
            }
            openVertex.setInitialValue(newValue);
            return true;
        }
    }
    
    private boolean processStockInitialValue() {
        if (fixedValueInputBox.getText().isEmpty()) {
            nodeEditor.setEditorMessage("Please provide fixed value for this node.", true);
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
        
        if (processStockInitialValue() && validateEquation()) {
            // Check if equation is changed - disable graph
            if (!openVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }
            
            openVertex.setEquation(formulaInputArea.getText().trim());
            return true;
        } else {
            return false;
        }
    }
    
    private boolean processFlowVertex() {
        if (validateEquation()) {
            if (!openVertex.getEquation().equals(formulaInputArea.getText().trim())) {
                disableAllGraphs();
            }
            
            openVertex.setEquation(formulaInputArea.getText().trim());
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
            s = removeBoldfromListItem(s);
            availableVariables.add(s);
        }
        
        // Check if this equation uses all the inputs
        
        for (String s : usedVariables) {
            if (!availableVariables.contains(s)) {
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
        if(openVertex.isPlanDone())
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
        
        if (openVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            fixedValueInputBox.setBackground(c);
        }
        
        if(openVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
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
        SolutionNode correctNode = solution.getNodeByName(
                                                          nodeEditor.getOpenVertex().getName());
        
        Vertex currentVertex = nodeEditor.getOpenVertex();
        if (currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
            logs.debug("Setting Constant Value as " + correctNode.getNodeEquation());
            fixedValueInputBox.setText(correctNode.getNodeEquation());
            reloadGraphPane();
        }
        
        if (currentVertex.getVertexType().equals(Vertex.VertexType.FLOW)
            || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
            List<String> correctInputs = correctNode.getInputNodes();
            List<String> availableInputs = new ArrayList<String>();
            
            Set<Vertex> vertices = nodeEditor.getGraphPane().getModelGraph().vertexSet();
            for (Vertex v : vertices) {
                availableInputs.add(v.getName());
            }
            
            availableInputs.remove(nodeEditor.getOpenVertex().getName());
            
            if (!availableInputs.containsAll(correctInputs)) {
                // Button name should be a variable;  see Bug #2104
                nodeEditor.setEditorMessage("Please define all the Nodes before using Demo.", true);
                return false;
            }
            for(String input: correctInputs){
                addEdge(MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(input), currentVertex);
            }
            if (currentVertex.getVertexType().equals(Vertex.VertexType.STOCK)) {
                fixedValueInputBox.setText(String.valueOf(correctNode.getInitialValue()));
            }
            
            reloadGraphPane();
            formulaInputArea.setText(correctNode.getNodeEquation());
            setCheckedBackground(Color.YELLOW);
        }
        
        return true;
        
    }
    
    private void reloadGraphPane() {
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
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
        buttonCreateNodeInputTab = new javax.swing.JButton();

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

        buttonCreateNodeInputTab.setText("Create Node");
        buttonCreateNodeInputTab.setHorizontalTextPosition(javax.swing.SwingConstants.CENTER);
        buttonCreateNodeInputTab.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCreateNodeInputTabActionPerformed(evt);
            }
        });

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
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                            .addGroup(calculatorPanelLayout.createSequentialGroup()
                                .addGap(12, 12, 12)
                                .addComponent(valuesLabel))
                            .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 219, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addGroup(calculatorPanelLayout.createSequentialGroup()
                                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                    .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, 54, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                                        .addGap(6, 6, 6)
                                        .addComponent(buttonDivide, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE)))
                                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                                    .addComponent(buttonMultiply, javax.swing.GroupLayout.PREFERRED_SIZE, 53, javax.swing.GroupLayout.PREFERRED_SIZE)
                                    .addComponent(buttonSubtract, javax.swing.GroupLayout.PREFERRED_SIZE, 55, javax.swing.GroupLayout.PREFERRED_SIZE)))))
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addContainerGap()
                        .addComponent(buttonCreateNodeInputTab)))
                .addGap(0, 4, Short.MAX_VALUE))
        );
        calculatorPanelLayout.setVerticalGroup(
            calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, calculatorPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(availableInputsLabel)
                    .addComponent(valuesLabel, javax.swing.GroupLayout.PREFERRED_SIZE, 16, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(18, 18, 18)
                .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(calculatorPanelLayout.createSequentialGroup()
                        .addComponent(jScrollPane1, javax.swing.GroupLayout.PREFERRED_SIZE, 141, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(18, 18, 18)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(buttonAdd, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                            .addComponent(buttonSubtract))
                        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                        .addGroup(calculatorPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                            .addComponent(buttonDivide)
                            .addComponent(buttonMultiply))
                        .addGap(0, 94, Short.MAX_VALUE))
                    .addComponent(jScrollPane4, javax.swing.GroupLayout.DEFAULT_SIZE, 315, Short.MAX_VALUE))
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(buttonCreateNodeInputTab))
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
        activityLogs.debug("Inputs Panel : User selected node type as INPUTS for Node "+
                           nodeEditor.getOpenVertex().getName());
        
        //   nodeEditor.getOpenVertex().setVertexType(Vertex.VertexType.DEFAULT);
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
        
    private void addEdge(Vertex v1, Vertex v2) {
        DefaultPort p1 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v1);
        DefaultPort p2 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v2);
        logs.debug("Adding edge between " + v1.getName() + " and " + v2.getName());
        nodeEditor.getGraphPane().insertEdge(p1, p2);
    }
    
    /**
     * This method is called when user selects any node from available input
     * jList Once a particular input node is selected, it gets removed from the
     * list. If there are no more input nodes to be selected, then jList gets
     * disabled.
     */
    private void availableInputsJListMouseClicked(java.awt.event.MouseEvent evt) {
        int i = availableInputsJList.getSelectedIndex();
        
        availableInputJListModel.set(i, removeBoldfromListItem(availableInputJListModel.get(i).toString()));
        
        formulaInputArea.setText(formulaInputArea.getText() + " "
                                 + availableInputsJList.getSelectedValue().toString());
        activityLogs.debug("User selected input "+availableInputsJList.getSelectedValue().toString()+
                           " for the Calculations of Node "+openVertex.getName());
        Graph graph = (Graph) this.nodeEditor.getGraphPane().getModelGraph();
        Vertex connectedVertex = graph.getVertexByName(availableInputsJList.getSelectedValue().toString());
        if(!graph.containsEdge(connectedVertex, openVertex)){
            addEdge(connectedVertex, openVertex);
        }
        
        availableInputJListModel.set(i, addBoldtoListItem(availableInputsJList.getSelectedValue().toString()));
    }
   
    private void fixedValueInputBoxKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyReleased
    }//GEN-LAST:event_fixedValueInputBoxKeyReleased
    
    private void fixedValueInputBoxKeyTyped(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_fixedValueInputBoxKeyTyped
    }//GEN-LAST:event_fixedValueInputBoxKeyTyped
    
    private void fixedValueInputBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueInputBoxActionPerformed
        
    }//GEN-LAST:event_fixedValueInputBoxActionPerformed

    private void buttonCreateNodeInputTabActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCreateNodeInputTabActionPerformed
        // TODO add your handling code here:
        // Process Cancel Action for all the Tabs
        activityLogs.debug("User pressed Create node button on inputs tab for Node " + nodeEditor.getOpenVertex().getName());
        if(openVertex.getVertexType()==Vertex.VertexType.STOCK  && !fixedValueInputBox.getText().isEmpty()){
            openVertex.setInitialValue(Double.valueOf(fixedValueInputBox.getText()));
        }
        Vertex v = new Vertex();
        v.setVertexIndex(nodeEditor.getGraphPane().getModelGraph().getNextAvailableIndex());
        nodeEditor.getGraphPane().addVertex(v);

        CreateNewNodeDialog newNodeDialog = new CreateNewNodeDialog(nodeEditor, v);
    }//GEN-LAST:event_buttonCreateNodeInputTabActionPerformed

    private void buttonDivideActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonDivideActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" / ");
    }//GEN-LAST:event_buttonDivideActionPerformed

    private void buttonMultiplyActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonMultiplyActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" * ");
    }//GEN-LAST:event_buttonMultiplyActionPerformed

    private void buttonSubtractActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonSubtractActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" - ");
    }//GEN-LAST:event_buttonSubtractActionPerformed

    private void buttonAddActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonAddActionPerformed
        // TODO add your handling code here:
        formulaInputArea.setText(formulaInputArea.getText()+" + ");
    }//GEN-LAST:event_buttonAddActionPerformed

//GEN-FIRST:event_availableInputsJListMouseClicked
 
//GEN-LAST:event_availableInputsJListMouseClicked

    private void formulaInputAreaKeyReleased(java.awt.event.KeyEvent evt) {//GEN-FIRST:event_formulaInputAreaKeyReleased
        // TODO add your handling code here:
         Graph graph = (Graph) this.nodeEditor.getGraphPane().getModelGraph();
            for (int i = 0; i < availableInputJListModel.getSize(); i++) {
            String s = removeBoldfromListItem(availableInputJListModel.get(i).toString());
            availableInputJListModel.set(i, s);
            if(formulaInputArea.getText().trim().contains(s)){
                availableInputJListModel.set(i, addBoldtoListItem(s));
                Vertex connectedVertex = graph.getVertexByName(s);
                addEdge(connectedVertex, openVertex);
            }
            if(!formulaInputArea.getText().trim().contains(s)){
                graph.removeEdge(graph.getVertexByName(s), openVertex);
            }  
            
        }

    }//GEN-LAST:event_formulaInputAreaKeyReleased
                                        
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
        buttonCreateNodeInputTab.setEnabled(b);
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
            buttonCreateNodeInputTab.setEnabled(enabled);
        }
    }
    
    private String addBoldtoListItem(String s){
        return "<html><strong>" + s + "</strong></html>";
    }
    
    private String removeBoldfromListItem(String s){
        s = s.replace("<html><strong>", "");
        s = s.replace("</strong></html>", "");
        return s;
    }
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JList availableInputsJList;
    private javax.swing.JLabel availableInputsLabel;
    private javax.swing.JButton buttonAdd;
    private javax.swing.JButton buttonCreateNodeInputTab;
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
