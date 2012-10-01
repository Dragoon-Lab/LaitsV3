/*
 * LAITS Project
 * Arizona State University
 * 
 * @author: rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import java.awt.Font;
import java.awt.GridLayout;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.util.LinkedList;
import java.util.Stack;
import javax.swing.*;
import org.apache.log4j.Logger;


public class InputsPanelView extends javax.swing.JPanel implements ItemListener {

  public LinkedList<JCheckBox> checkboxList;
  Stack undoStack = new Stack();
  boolean undoFlag = false;
  
  public String itemChanged;
  
  public boolean correctinput = false;
  private final boolean TYPE_CHANGE = true;
  private static InputsPanelView inputView;
  boolean isViewEnabled;
  boolean extraChangeEvent;
  NodeEditor nodeEditor;
  
  /** Logger **/
  private static Logger logs = Logger.getLogger(InputsPanelView.class);
  
  /**
   * Private Constructor
   * @param gc : GraphCanvas of LAITS Application.
   */
  public InputsPanelView(NodeEditor ne){
    initComponents();
    nodeEditor = ne;
    checkboxList = new LinkedList<JCheckBox>();
  }
  
  public void initPanel(){
    
  }
   
  /**
   * Method to Initialize Input Tab of Node Editor for a particular node
   * @param inputVertex: Vertex for which this Input tab is being constructed
   */ 
  public void initPanelForSavedNode(){
    logs.trace("Initializing InputPanel for Vertex ");
    resetInputsPanel();
    updateNodeDescription();
    initAvailableInputNodes();
    loadSavedInputState();
  }
  
  public void initPanelForNewNode(){
    logs.trace("Initializing InputPanel for New Node");
    resetInputsPanel();
    
    
    availableInputNodesPanels.setVisible(false);
    undoStack.setSize(1);
    initAvailableInputNodes();    
  }
  
  private void resetInputsPanel(){
    buttonGroup1.clearSelection();
    nodeDescriptionLabel.setText("");
    inputNodesSelectionOptionButton.setEnabled(true);
    fixedValueOptionButton.setEnabled(true);
    availableInputNodesPanels.removeAll();
    availableInputNodesPanels.setEnabled(true);
    checkboxList.clear();
    isViewEnabled = false;
  }
  
  /**
   * Method to set the Node Description in the UI
   */
  public void updateNodeDescription() {
   
  }
  
  /**
   * Method to Initialize the available inputs. A checkbox will be provided
   * corresponding to each available input node. User will select the input nodes
   * from this list
   */
  public void initAvailableInputNodes() {
    
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
    
    // Reset the Background color of input selection panel
    if(flag)
      setBackgroundEnable();
    else
      setBackgroundDisable();
  }
  
  private void setBackgroundEnable(){
    logs.trace("setting background color to WHITE");
    
  }
  
  private void setBackgroundDisable(){
    logs.trace("setting background color to GREY");
    
  }
  
  /**
   * Method to Add One Check Box corresponding to each Available Input Node
   */
  private void addAvailableNodesCheckBoxes(){
    logs.trace("Adding all the Available Input Nodes for ");
    
  }
  
  /**
   * Method to load the Input Panel saved by the User last time. 
   * This will make constant/input option button selected. In case of Inputs,
   * this will mark previously selected inputs as selected check boxes.
   */
  public void loadSavedInputState() {
    logs.trace("Loading Saved Inputs for Vertex ");
    
    
  }
    
  /**
   * Method to load previously selected Inputs for Stock and Flow Nodes
   */
  private void loadSavedInputsForStockAndFlow(){
    logs.trace("Loading previously selected inputs for ");
    
  }
  
  /**
   * This method is called when any input check box is selected from the
   * available input nodes
   */
  public void itemStateChanged(ItemEvent e) {
    if (extraChangeEvent) {
      extraChangeEvent = false;
      return;
    }

    logs.trace("Input Node selection changed");


  }
  
  
  /**
   * Reset the Generated Graph Status
   */
  private void resetGraphStatus() {
    logs.trace( "Resetting Graph Status");
    
    
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
    checkBoxScrollPane = new javax.swing.JScrollPane();
    availableInputNodesPanels = new javax.swing.JPanel();
    radioPanel = new javax.swing.JPanel();
    inputNodesSelectionOptionButton = new javax.swing.JRadioButton();
    fixedValueOptionButton = new javax.swing.JRadioButton();
    nodeDescriptionLabel = new javax.swing.JLabel();
    nodeDescriptionHeading = new javax.swing.JLabel();

    checkBoxScrollPane.setHorizontalScrollBarPolicy(javax.swing.ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    checkBoxScrollPane.setVerticalScrollBarPolicy(javax.swing.ScrollPaneConstants.VERTICAL_SCROLLBAR_NEVER);

    availableInputNodesPanels.setMaximumSize(new java.awt.Dimension(32767, 500));

    javax.swing.GroupLayout availableInputNodesPanelsLayout = new javax.swing.GroupLayout(availableInputNodesPanels);
    availableInputNodesPanels.setLayout(availableInputNodesPanelsLayout);
    availableInputNodesPanelsLayout.setHorizontalGroup(
      availableInputNodesPanelsLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGap(0, 408, Short.MAX_VALUE)
    );
    availableInputNodesPanelsLayout.setVerticalGroup(
      availableInputNodesPanelsLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGap(0, 253, Short.MAX_VALUE)
    );

    checkBoxScrollPane.setViewportView(availableInputNodesPanels);

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

    nodeDescriptionLabel.setVerticalAlignment(javax.swing.SwingConstants.TOP);

    nodeDescriptionHeading.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
    nodeDescriptionHeading.setText("Description");

    javax.swing.GroupLayout contentPanelLayout = new javax.swing.GroupLayout(contentPanel);
    contentPanel.setLayout(contentPanelLayout);
    contentPanelLayout.setHorizontalGroup(
      contentPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGroup(contentPanelLayout.createSequentialGroup()
        .addContainerGap()
        .addGroup(contentPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
          .addGroup(contentPanelLayout.createSequentialGroup()
            .addComponent(checkBoxScrollPane, javax.swing.GroupLayout.PREFERRED_SIZE, 327, javax.swing.GroupLayout.PREFERRED_SIZE)
            .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
            .addGroup(contentPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
              .addComponent(nodeDescriptionLabel, javax.swing.GroupLayout.PREFERRED_SIZE, 433, javax.swing.GroupLayout.PREFERRED_SIZE)
              .addComponent(nodeDescriptionHeading, javax.swing.GroupLayout.PREFERRED_SIZE, 237, javax.swing.GroupLayout.PREFERRED_SIZE)))
          .addGroup(contentPanelLayout.createSequentialGroup()
            .addGap(14, 14, 14)
            .addComponent(radioPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)))
        .addContainerGap(37, Short.MAX_VALUE))
    );
    contentPanelLayout.setVerticalGroup(
      contentPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, contentPanelLayout.createSequentialGroup()
        .addGap(28, 28, 28)
        .addComponent(radioPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
        .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 42, Short.MAX_VALUE)
        .addGroup(contentPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
          .addGroup(contentPanelLayout.createSequentialGroup()
            .addComponent(nodeDescriptionHeading)
            .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
            .addComponent(nodeDescriptionLabel, javax.swing.GroupLayout.PREFERRED_SIZE, 213, javax.swing.GroupLayout.PREFERRED_SIZE))
          .addComponent(checkBoxScrollPane, javax.swing.GroupLayout.PREFERRED_SIZE, 235, javax.swing.GroupLayout.PREFERRED_SIZE))
        .addGap(17, 17, 17))
    );

    javax.swing.GroupLayout layout = new javax.swing.GroupLayout(this);
    this.setLayout(layout);
    layout.setHorizontalGroup(
      layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGroup(layout.createSequentialGroup()
        .addComponent(contentPanel, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
        .addContainerGap())
    );
    layout.setVerticalGroup(
      layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
      .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, layout.createSequentialGroup()
        .addContainerGap()
        .addComponent(contentPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
        .addContainerGap(52, Short.MAX_VALUE))
    );
  }// </editor-fold>//GEN-END:initComponents
/**
 * Event Handler for Fixed Value Option Button. Changes the UI for this panel
 * and prepares Fixed Vlaue UI for Calculation Panel
 * @param evt
 */
    private void fixedValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_fixedValueOptionButtonActionPerformed
      // This method is called when Node has a fixed value.
     
      
    }//GEN-LAST:event_fixedValueOptionButtonActionPerformed

  // Method for handling the click event of Input radio button
    private void inputNodesSelectionOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_inputNodesSelectionOptionButtonActionPerformed

      
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
    logs.trace("Error in Inputs Panel = "+syntaxError);
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

  // Variables declaration - do not modify//GEN-BEGIN:variables
  private javax.swing.JPanel availableInputNodesPanels;
  private javax.swing.ButtonGroup buttonGroup1;
  private javax.swing.JScrollPane checkBoxScrollPane;
  private javax.swing.JPanel contentPanel;
  private javax.swing.JRadioButton fixedValueOptionButton;
  private javax.swing.JRadioButton inputNodesSelectionOptionButton;
  private javax.swing.JLabel nodeDescriptionHeading;
  private javax.swing.JLabel nodeDescriptionLabel;
  private javax.swing.JPanel radioPanel;
  // End of variables declaration//GEN-END:variables


  
  private static String UNAVAILABLE_INPUTS_MSG = "Create some more nodes, and "
          + "they will appear here.  You have created only one node, and it "
          + "cannot be its own input, so there is nothing to display here.";
}
