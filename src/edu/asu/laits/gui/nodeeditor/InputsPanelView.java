/*
 * LAITS Project
 * Arizona State University
 * 
 * @author: rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.VertexType;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Set;
import java.util.Stack;
import javax.swing.*;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultPort;
import org.jgraph.graph.Port;
import org.jgraph.graph.PortView;


public class InputsPanelView extends javax.swing.JPanel implements ItemListener {

  public LinkedList<JCheckBox> checkboxList;
  Stack undoStack = new Stack();
  boolean undoFlag = false;
  
  public String itemChanged;
  
  public boolean correctinput = false;
  private final boolean TYPE_CHANGE = true;
  private static InputsPanelView inputView;
  boolean isViewEnabled;
  NodeEditor nodeEditor;
  
  public HashMap<Vertex, Boolean> initialSelection=new HashMap<Vertex, Boolean>();
  
  /** Logger **/
  private static Logger logs = Logger.getLogger("DevLogs");
  private static Logger activityLogs = Logger.getLogger("ActivityLogs");
  
  /**
   * Private Constructor
   * @param gc : GraphCanvas of LAITS Application.
   */
  public InputsPanelView(NodeEditor ne){ 
    initComponents();
    nodeEditor = ne;
    checkboxList = new LinkedList<JCheckBox>();
    initPanel();
  }
  
  public void initPanel(){    
    Graph graph=(Graph)this.nodeEditor.getGraphPane().getModelGraph();
    Set<Vertex> vertexes = graph.vertexSet();
    Vertex currentV = this.nodeEditor.getCurrentVertex();
    descriptionTextArea.setText(currentV.getCorrectDescription());
    
    JCheckBox box;
    availableInputNodesPanels.setLayout(new GridLayout(0, 1));
    availableInputNodesPanels.setVisible(false);
    
    boolean selected;
    for(Vertex v:vertexes){
        if(v.getName().equals(currentV.getName()))
            continue;
        if(graph.containsEdge(v,currentV))
            selected=true;
        else
            selected=false;
        box = new JCheckBox(v.getName(),selected);
        initialSelection.put(v, selected);
        box.setVisible(false);
        box.setText(v.getName());
        box.addItemListener(this);
        checkboxList.add(box);
        availableInputNodesPanels.add(box);           
    }
    
    if(currentV.getVertexType()==VertexType.CONSTANT)
        fixedValueOptionButton.setSelected(true);
    
    else if(currentV.getVertexType()==VertexType.FLOW || currentV.getVertexType()==VertexType.STOCK){
        inputNodesSelectionOptionButton.setSelected(true);
        displayCurrentInputsPanel(true);
        
        if(checkboxList.size() == 0)
            displayInappropriteInputsMsg();
    }
    
  }
   
  private void resetInputsPanel(){
    buttonGroup1.clearSelection();
    descriptionTextArea.setText("");
    inputNodesSelectionOptionButton.setEnabled(true);
    fixedValueOptionButton.setEnabled(true);
    availableInputNodesPanels.removeAll();
    availableInputNodesPanels.setEnabled(true);
    checkboxList.clear();
    isViewEnabled = false;
  }
  
  
  /**
   * Method to display Unavailable Inputs message when there are no inputs to
   * be selected for the current node
   */
  private void displayInappropriteInputsMsg(){
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
   * @param flag : show/hide flag
   */
  private void displayCurrentInputsPanel(boolean flag) {
    availableInputNodesPanels.setVisible(flag);
    for (JCheckBox box : checkboxList) {
      box.setVisible(flag);
    }    
  }
  
  
  /**
   * Method to Add One Check Box corresponding to each Available Input Node
   */
  private void addAvailableNodesCheckBoxes(){
    logs.debug("Adding all the Available Input Nodes for ");
    
  }
  
  /**
   * Method to load the Input Panel saved by the User last time. 
   * This will make constant/input option button selected. In case of Inputs,
   * this will mark previously selected inputs as selected check boxes.
   */
  public void loadSavedInputState() {
    logs.debug("Loading Saved Inputs for Vertex ");
    
    
  }
    
  /**
   * Method to load previously selected Inputs for Stock and Flow Nodes
   */
  private void loadSavedInputsForStockAndFlow(){
    logs.debug("Loading previously selected inputs for ");
    
  }
  
  public void updateNodeDescription(){
      descriptionTextArea.setText(nodeEditor.getCurrentVertex().getCorrectDescription());
  }
  /**
   * This method is called when any input check box is selected from the
   * available input nodes
   */
  public void itemStateChanged(ItemEvent e) {
    Object source=e.getSource();
    if(!(source instanceof JCheckBox))
        return;
    
    Graph graph=(Graph)this.nodeEditor.getGraphPane().getModelGraph();
    JCheckBox box=(JCheckBox) source;
    
    Vertex connectedV = graph.getVertexByName(box.getText());
    
    if(box.isSelected() && !graph.containsEdge(connectedV, nodeEditor.getCurrentVertex()))
        addEdge(connectedV,nodeEditor.getCurrentVertex());
    
    else if(!box.isSelected() && graph.containsEdge(connectedV, nodeEditor.getCurrentVertex()))
        graph.removeEdge(connectedV, nodeEditor.getCurrentVertex());
    
    logs.debug("Input Node selection changed");
  }
  
  private void addEdge(Vertex v1, Vertex v2){
      DefaultPort p1 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v1);
      DefaultPort p2 = nodeEditor.getGraphPane().getJGraphTModelAdapter().getVertexPort(v2);
      
      nodeEditor.getGraphPane().insertEdge(p1, p2);
  }
  
  
  /**
   * Reset the Generated Graph Status
   */
  private void resetGraphStatus() {
    logs.debug( "Resetting Graph Status");
    
    
  }

  /**
   * This method returns true if the value button is selected, false if it isn't
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

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        contentPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

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
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        radioPanelLayout.setVerticalGroup(
            radioPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(radioPanelLayout.createSequentialGroup()
                .addComponent(fixedValueOptionButton)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addComponent(inputNodesSelectionOptionButton))
        );

        contentPanel.add(radioPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(20, 28, -1, -1));

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
            .addGap(0, 292, Short.MAX_VALUE)
        );
        availableInputNodesPanelsLayout.setVerticalGroup(
            availableInputNodesPanelsLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 242, Short.MAX_VALUE)
        );

        checkBoxScrollPane.setViewportView(availableInputNodesPanels);

        jScrollPane2.setViewportView(checkBoxScrollPane);

        contentPanel.add(jScrollPane2, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 110, 300, 250));

        add(contentPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 6, 560, 480));
    }// </editor-fold>//GEN-END:initComponents
/**
 * Event Handler for Fixed Value Option Button. Changes the UI for this panel
 * and prepares Fixed Value UI for Calculation Panel
 * @param evt
 */
    private void fixedValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueOptionButtonActionPerformed
      // This method is called when Node has a fixed value.
      this.displayCurrentInputsPanel(false);
        nodeEditor.getCurrentVertex().setVertexType(Vertex.VertexType.CONSTANT);
      logs.debug("Setting Vertex Type to Constant");
      nodeEditor.getGraphPane().getLayoutCache().reload();
      nodeEditor.getGraphPane().repaint();
    }//GEN-LAST:event_fixedValueOptionButtonActionPerformed

  // Method for handling the click event of Input radio button
    private void inputNodesSelectionOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_inputNodesSelectionOptionButtonActionPerformed
        this.displayCurrentInputsPanel(true);
        nodeEditor.getCurrentVertex().setVertexType(Vertex.VertexType.DEFAULT);  
        nodeEditor.getGraphPane().getLayoutCache().reload();
        nodeEditor.getGraphPane().repaint();
    }//GEN-LAST:event_inputNodesSelectionOptionButtonActionPerformed


  /**
   * This function checks for any syntax errors in the inputsTab, and returns
   * true if there are
   *
   * @author Curt Tyler
   * @return boolean
   */
  public boolean hasInputError() {
    boolean syntaxError = false;

    if (!getValueButtonSelected()  && !getInputsButtonSelected() ) {
        syntaxError = true;
    }
    else if (getInputsButtonSelected() == true) {
        syntaxError = true;
        for (JCheckBox box : checkboxList) {
          // If there is at least one inputs check box selected, then there is no error
          if (box.isSelected() != false) {
            syntaxError = false;
          }
        }
      }
    logs.debug("Error in Inputs Panel = "+syntaxError);
    return syntaxError;
  }

  
  public boolean validateInputsPanel(){
    return !hasInputError();
  }

  public boolean isViewEnabled(){
    return isViewEnabled;
  }
  
  public void setViewEnabled(boolean flag){
    isViewEnabled = flag;
  }
  
  public boolean processInputsPanel(){
      if(fixedValueOptionButton.isSelected())
          return true;
      
      if(inputNodesSelectionOptionButton.isSelected() && checkboxList.size()!=0)
          return true;
      
      nodeEditor.setEditorMessage("Please provide input for this node.");
      return false;
  }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPanel availableInputNodesPanels;
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
