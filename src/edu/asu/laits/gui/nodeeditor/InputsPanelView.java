/**
 * LAITS Project
 * Arizona State University
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
 * @author: rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexType;
import java.awt.Color;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Set;
import java.util.Stack;
import java.util.List;
import java.util.Map;
import javax.swing.*;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultPort;

public class InputsPanelView extends javax.swing.JPanel implements ItemListener {

    public LinkedList<JCheckBox> checkboxList;
    Stack undoStack = new Stack();
    boolean undoFlag = false;
    public String itemChanged;
    public boolean correctinput = false;
    NodeEditor nodeEditor;
    public HashMap<Vertex, Boolean> initialSelection = new HashMap<Vertex, Boolean>();
    /**
     * Logger *
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     * Private Constructor
     *
     * @param gc : GraphCanvas of LAITS Application.
     */
    public InputsPanelView(NodeEditor ne) {
        initComponents();
        nodeEditor = ne;
        checkboxList = new LinkedList<JCheckBox>();
        initPanel();
    }

    public void initPanel() {
        Graph graph = (Graph) this.nodeEditor.getGraphPane().getModelGraph();
        Set<Vertex> vertexes = graph.vertexSet();
        Vertex currentV = this.nodeEditor.getCurrentVertex();
        descriptionTextArea.setText(currentV.getCorrectDescription());
        checkboxList.clear();
        availableInputNodesPanels.removeAll();
        
        
        JCheckBox box;
        availableInputNodesPanels.setLayout(new GridLayout(0, 1));
        availableInputNodesPanels.setVisible(false);

        boolean selected;
        for (Vertex v : vertexes) {
            if (v.getName().equals(currentV.getName())) {
                continue;
            }
            if (graph.containsEdge(v, currentV)) {
                selected = true;
            } else {
                selected = false;
            }
            box = new JCheckBox(v.getName(), selected);
            initialSelection.put(v, selected);
            box.setVisible(false);
            box.setText(v.getName());
            box.addItemListener(this);
            box.setOpaque(false);
            checkboxList.add(box);
            availableInputNodesPanels.add(box);
        }

        if (currentV.getVertexType() == VertexType.CONSTANT) {
            fixedValueOptionButton.setSelected(true);
        } else if (currentV.getVertexType() == VertexType.FLOW || currentV.getVertexType() == VertexType.STOCK) {
            inputNodesSelectionOptionButton.setSelected(true);
            displayCurrentInputsPanel(true);

            if (checkboxList.size() == 0) {
                displayInappropriteInputsMsg();
            }
        }

    }

    /**
     * Method to display Unavailable Inputs message when there are no inputs to
     * be selected for the current node
     */
    private void displayInappropriteInputsMsg() {
        inputNodesSelectionOptionButton.setEnabled(false);
        displayCurrentInputsPanel(true);

        availableInputNodesPanels.repaint();
        JTextArea txt = new JTextArea(UNAVAILABLE_INPUTS_MSG);
        txt.setLineWrap(true);
        txt.setEditable(false);
        txt.setWrapStyleWord(true);
        txt.setFont(new Font("Arial", Font.PLAIN, 14));
        txt.setMargin(new java.awt.Insets(50, 5, 0, 0));
        availableInputNodesPanels.add(txt);

    }

    /**
     * Method to Show/Hide available input panel and check boxes
     *
     * @param flag : show/hide flag
     */
    private void displayCurrentInputsPanel(boolean flag) {
        availableInputNodesPanels.setVisible(flag);
        for (JCheckBox box : checkboxList) {
            box.setVisible(flag);
        }
    }

    public void updateNodeDescription() {
        descriptionTextArea.setText(nodeEditor.getCurrentVertex().getCorrectDescription());
    }

    /**
     * This method is called when any input check box is selected from the
     * available input nodes
     */
    public void itemStateChanged(ItemEvent e) {
        logs.debug("Input Node selection changed");
        
        Object source = e.getSource();
        if (!(source instanceof JCheckBox)) {
            return;
        }

        Graph graph = (Graph) this.nodeEditor.getGraphPane().getModelGraph();
        JCheckBox box = (JCheckBox) source;

        activityLogs.debug("User selected input vertex as "+box.getText()+
                " as input for Vertex "+nodeEditor.getCurrentVertex().getName());
        Vertex connectedV = graph.getVertexByName(box.getText());

        if (box.isSelected() && !graph.containsEdge(connectedV, nodeEditor.getCurrentVertex())) {
            addEdge(connectedV, nodeEditor.getCurrentVertex());
        } else if (!box.isSelected() && graph.containsEdge(connectedV, nodeEditor.getCurrentVertex())) {
            graph.removeEdge(connectedV, nodeEditor.getCurrentVertex());
        }

    }

    private void addEdge(Vertex v1, Vertex v2) {
        DefaultPort p1 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v1);
        DefaultPort p2 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v2);

        nodeEditor.getGraphPane().insertEdge(p1, p2);
    }

    
    /**
     * This method returns true if the value button is selected, false if it
     * isn't
     *
     * @return whether the value button is selected
     */
    public boolean getValueButtonSelected() {
        if (fixedValueOptionButton.isSelected() == true) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * This method returns true if the inputs button is selected, false if it
     * isn't
     *
     * @return whether the inputs button is selected
     */
    public boolean getInputsButtonSelected() {
        if (inputNodesSelectionOptionButton.isSelected() == true) {
            return true;
        } else {
            return false;
        }
    }

    public boolean giveUpInputsPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        SolutionNode correctNode = solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName());

        if (correctNode.getNodeType().equals(VertexType.CONSTANT)) {
            fixedValueOptionButton.setSelected(true);
            nodeEditor.getCurrentVertex().setVertexType(VertexType.CONSTANT);
        } else {
            List<String> correctInputs = correctNode.getInputNodes();
            List<String> availableInputs = new ArrayList<String>();

            Set<Vertex> vertices = nodeEditor.getGraphPane().getModelGraph().vertexSet();
            for (Vertex v : vertices) {
                availableInputs.add(v.getName());
            }

            availableInputs.remove(nodeEditor.getCurrentVertex().getName());

            if (!availableInputs.containsAll(correctInputs)) {
                nodeEditor.setEditorMessage("Please define all the Nodes before using Giveup.", true);
                return false;
            }

            for (JCheckBox input : checkboxList) {
                input.setSelected(false);
                if (correctInputs.contains(input.getText())) {
                    input.setSelected(true);
                }
            }
            inputNodesSelectionOptionButton.setSelected(true);
            this.displayCurrentInputsPanel(true);
            nodeEditor.getCurrentVertex().setVertexType(VertexType.DEFAULT);
        }

        setInputsTypeBackground(new Color(240, 240, 240));
        setInputValuesBackground(new Color(240, 240, 240));
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
        return true;
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
        contentPanel = new javax.swing.JPanel();
        radioPanel = new javax.swing.JPanel();
        inputNodesSelectionOptionButton = new javax.swing.JRadioButton();
        fixedValueOptionButton = new javax.swing.JRadioButton();
        nodeDescriptionHeading = new javax.swing.JLabel();
        jScrollPane1 = new javax.swing.JScrollPane();
        descriptionTextArea = new javax.swing.JTextArea();
        jScrollPane2 = new javax.swing.JScrollPane();
        checkBoxScrollPane = new javax.swing.JScrollPane();
        availableInputNodesPanels = new javax.swing.JPanel();
        buttonCreateNodeInputTab = new javax.swing.JButton();

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        contentPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        radioPanel.setBorder(javax.swing.BorderFactory.createLineBorder(new java.awt.Color(0, 0, 0)));

        buttonGroup1.add(inputNodesSelectionOptionButton);
        inputNodesSelectionOptionButton.setText("Inputs:");
        inputNodesSelectionOptionButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                inputNodesSelectionOptionButtonActionPerformed(evt);
            }
        });

        buttonGroup1.add(fixedValueOptionButton);
        fixedValueOptionButton.setText("Value is fixed, so no inputs");
        fixedValueOptionButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                fixedValueOptionButtonActionPerformed(evt);
            }
        });

        javax.swing.GroupLayout radioPanelLayout = new javax.swing.GroupLayout(radioPanel);
        radioPanel.setLayout(radioPanelLayout);
        radioPanelLayout.setHorizontalGroup(
            radioPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(radioPanelLayout.createSequentialGroup()
                .addGroup(radioPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addComponent(fixedValueOptionButton)
                    .addComponent(inputNodesSelectionOptionButton))
                .addContainerGap(74, Short.MAX_VALUE))
        );
        radioPanelLayout.setVerticalGroup(
            radioPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(radioPanelLayout.createSequentialGroup()
                .addComponent(fixedValueOptionButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addComponent(inputNodesSelectionOptionButton))
        );

        contentPanel.add(radioPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(20, 28, 280, -1));

        nodeDescriptionHeading.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        nodeDescriptionHeading.setText("Description");
        contentPanel.add(nodeDescriptionHeading, new org.netbeans.lib.awtextra.AbsoluteConstraints(339, 122, 237, -1));

        descriptionTextArea.setEditable(false);
        descriptionTextArea.setBackground(new java.awt.Color(238, 238, 238));
        descriptionTextArea.setColumns(20);
        descriptionTextArea.setLineWrap(true);
        descriptionTextArea.setRows(5);
        descriptionTextArea.setAutoscrolls(false);
        jScrollPane1.setViewportView(descriptionTextArea);

        contentPanel.add(jScrollPane1, new org.netbeans.lib.awtextra.AbsoluteConstraints(340, 140, 220, 140));

        checkBoxScrollPane.setHorizontalScrollBarPolicy(javax.swing.ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
        checkBoxScrollPane.setVerticalScrollBarPolicy(javax.swing.ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER);

        availableInputNodesPanels.setMaximumSize(new java.awt.Dimension(32767, 500));

        javax.swing.GroupLayout availableInputNodesPanelsLayout = new javax.swing.GroupLayout(availableInputNodesPanels);
        availableInputNodesPanels.setLayout(availableInputNodesPanelsLayout);
        availableInputNodesPanelsLayout.setHorizontalGroup(
            availableInputNodesPanelsLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 296, Short.MAX_VALUE)
        );
        availableInputNodesPanelsLayout.setVerticalGroup(
            availableInputNodesPanelsLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 246, Short.MAX_VALUE)
        );

        checkBoxScrollPane.setViewportView(availableInputNodesPanels);

        jScrollPane2.setViewportView(checkBoxScrollPane);

        contentPanel.add(jScrollPane2, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 110, 300, 250));

        buttonCreateNodeInputTab.setText("Create Node");
        buttonCreateNodeInputTab.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCreateNodeInputTabActionPerformed(evt);
            }
        });
        contentPanel.add(buttonCreateNodeInputTab, new org.netbeans.lib.awtextra.AbsoluteConstraints(440, 440, 110, -1));

        add(contentPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 6, 560, 480));
    }// </editor-fold>//GEN-END:initComponents

    /**
     * Event Handler for Fixed Value Option Button. Changes the UI for this
     * panel and prepares Fixed Value UI for Calculation Panel
     *
     * @param evt
     */
    private void fixedValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueOptionButtonActionPerformed
        // This method is called when Node has a fixed value.
        activityLogs.debug("Inputs Panel : User selected node type as CONSTANT for Node "+
                nodeEditor.getCurrentVertex().getName());
        
        this.displayCurrentInputsPanel(false);
        resetOptionPanelBackground();
        nodeEditor.getCurrentVertex().setVertexType(Vertex.VertexType.CONSTANT);
        logs.debug("Setting Vertex Type to Constant");
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
    }//GEN-LAST:event_fixedValueOptionButtonActionPerformed

    // Method for handling the click event of Input radio button
    private void inputNodesSelectionOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_inputNodesSelectionOptionButtonActionPerformed
        refreshInputs();
    }//GEN-LAST:event_inputNodesSelectionOptionButtonActionPerformed

    private void buttonCreateNodeInputTabActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCreateNodeInputTabActionPerformed
        // TODO add your handling code here:
        // Process Cancel Action for all the Tabs
        activityLogs.debug("User pressed Create node button on inputs tab for Node " + nodeEditor.getCurrentVertex().getName());
        if (nodeEditor.getGraphPane().getMainFrame().getMainMenu().getModelMenu().newNodeAllowed()) {
            Vertex v = new Vertex();
            v.setVertexIndex(nodeEditor.getGraphPane().getModelGraph().getNextAvailableIndex());
            nodeEditor.getGraphPane().addVertex(v);

            CreateNewNodeDialog newNodeDialog = new CreateNewNodeDialog(nodeEditor, v);

        } else {
            activityLogs.debug("User was not allowed to create new node as all the nodes were already present");
            JOptionPane.showMessageDialog(this, "The model is already using all the correct nodes.");
        }
    }//GEN-LAST:event_buttonCreateNodeInputTabActionPerformed

    public void refreshInputs(){
        activityLogs.debug("Inputs Panel : User selected node type as INPUTS for Node "+
                nodeEditor.getCurrentVertex().getName());
        
        this.displayCurrentInputsPanel(true);
        nodeEditor.getCurrentVertex().setVertexType(Vertex.VertexType.DEFAULT);
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
        inputNodesSelectionOptionButton.setSelected(true);        
    }
    /**
     * This function checks for any syntax errors in the inputsTab, and returns
     * true if there are
     *
     * @author Curt Tyler
     * @return boolean
     */
    public boolean hasInputError() {
        boolean syntaxError = false;

        if (!getValueButtonSelected() && !getInputsButtonSelected()) {
            syntaxError = true;
        } else if (getInputsButtonSelected() == true) {
            syntaxError = true;
            for (JCheckBox box : checkboxList) {
                // If there is at least one inputs check box selected, then there is no error
                if (box.isSelected() != false) {
                    syntaxError = false;
                }
            }
        }
        logs.debug("Error in Inputs Panel = " + syntaxError);
        return syntaxError;
    }

    public boolean validateInputsPanel() {
        return !hasInputError();
    }

    public boolean isViewEnabled() {
        if (nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.CORRECT)
                || nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }

    public boolean processInputsPanel() {
        if (fixedValueOptionButton.isSelected()) {
            return true;
        }

        if (inputNodesSelectionOptionButton.isSelected() && checkboxList.size() != 0) {
            return true;
        }

        nodeEditor.setEditorMessage("Please provide input for this node.", true);
        return false;
    }

//    public void setOptionPanelBackground(Color c, boolean paintBoth) {
//        setInputsTypeBackground(c);
//        if(paintBoth){
//            setInputValuesBackground(c);
//        }
//    }
    
    public void setInputsTypeBackground(Color c){
        radioPanel.setBackground(c);
    }
    
    public void setInputValuesBackground(Color c){
        availableInputNodesPanels.setBackground(c);
    }

    public void resetOptionPanelBackground() {
        //radioPanel.setBackground(new Color(238, 238, 238));
        inputNodesSelectionOptionButton.setBackground(new Color(238, 238, 238));
        fixedValueOptionButton.setBackground(new Color(238, 238, 238));
        availableInputNodesPanels.setBackground(new Color(238, 238, 238));
    }

    public List<String> getSelectedInputsList() {
        List<String> inputsList = new ArrayList<String>();
        for (JCheckBox j : checkboxList) {
            if (j.isSelected()) {
                inputsList.add(j.getText());
            }
        }

        return inputsList;
    }
    
    public String printInputsPanel(){
        StringBuilder sb = new StringBuilder();
        sb.append("Node Type: '");
        if(fixedValueOptionButton.isSelected())
            sb.append("CONSTANT");
        else if(inputNodesSelectionOptionButton.isSelected()){
            sb.append("INPUTS");
            sb.append("' Input List: "+getSelectedInputsList().toString());
        }    
        else
            sb.append("UNDEFINED");
        
        return sb.toString();
        
    }
    
    public JComponent getLabel(String label){
 
    Map<String, JComponent> map = new HashMap<String, JComponent>();
    map.put("radioPanel", radioPanel);
    map.put("jScrollPane1", jScrollPane1);
    map.put("jScrollPane2", jScrollPane2);
    map.put("buttonCreateNodeInputTab", buttonCreateNodeInputTab);
    if(map.containsKey(label)){
        return map.get(label);
    }
    else {
        return null;
    }
}
    
    public void setEditableInputs(Boolean b){
        fixedValueOptionButton.setEnabled(b);
        inputNodesSelectionOptionButton.setEnabled(b);
        availableInputNodesPanels.setEnabled(b);
    }
    
    
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPanel availableInputNodesPanels;
    private javax.swing.JButton buttonCreateNodeInputTab;
    private javax.swing.ButtonGroup buttonGroup1;
    private javax.swing.JScrollPane checkBoxScrollPane;
    private javax.swing.JPanel contentPanel;
    private javax.swing.JTextArea descriptionTextArea;
    private javax.swing.JRadioButton fixedValueOptionButton;
    private javax.swing.JRadioButton inputNodesSelectionOptionButton;
    private javax.swing.JScrollPane jScrollPane1;
    private javax.swing.JScrollPane jScrollPane2;
    private javax.swing.JLabel nodeDescriptionHeading;
    private javax.swing.JPanel radioPanel;
    // End of variables declaration//GEN-END:variables
    private static String UNAVAILABLE_INPUTS_MSG = "Create some more nodes, and "
            + "they will appear here.  You have created only one node, and it "
            + "cannot be its own input, so there is nothing to display here.";
}
