/**
 * LAITS Project
 * Arizona State University
 * 
 * Updated by rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import java.awt.Color;
import java.awt.event.KeyEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.util.LinkedList;

import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JFormattedTextField;
import javax.swing.JTextArea;
import javax.swing.text.DefaultFormatter;

import org.apache.log4j.Logger;


/**
 * View class of Calculation Panel displayed in calculation tab of NodeEditor
 * This is responsible for creating FLOW and STOCK nodes and provide a way 
 * to input formula using the selected nodes of Input Tab
*/
public class CalculationsPanelView extends javax.swing.JPanel 
                                   implements PropertyChangeListener {

  private DefaultListModel availableInputJListModel = new DefaultListModel();
  private boolean changed = false;
  private boolean givenValueButtonPreviouslySelected = false;
  boolean jListVariablesNotEmpty = false;
  private LinkedList<String> changes = new LinkedList<String>();
  private final DecimalFormat inputDecimalFormat = new DecimalFormat("###0.###");
  private static CalculationsPanelView calcView;
  private boolean isViewEnabled;
  private NodeEditor nodeEditor;
  
  /** Logger **/
  private static Logger logs = Logger.getLogger(CalculationsPanelView.class);
  
  
  
  public CalculationsPanelView(NodeEditor ne){
    initComponents();
    nodeEditor = ne; 
  }
  
  public void initPanel(){
  }
  
  public void initPanelForSavedNode(){
    logs.trace("Initializing Calculations Panel for Node ");
    resetCalculationsPanel();
    
    initValues();
    addedOperand(false);    
    
  }
  
  public void initPanelForNewNode(){
    logs.trace("Initializing Calculations Panel for Node ");
    resetCalculationsPanel();
    
    initValues();
    addedOperand(false);    
  }
  
  private void resetCalculationsPanel(){
    isViewEnabled = false;
    buttonGroup1.clearSelection();
    
    fixedValueOptionButton.setEnabled(true);
    flowValueOptionButton.setEnabled(true);
    stockValueOptionButton.setEnabled(true);
    
    availableInputJListModel.clear();
    
    calculatorPanel.setVisible(true);
    fixedValueLabel.setVisible(true);
    fixedValueInputBox.setText("");
    fixedValueInputBox.setVisible(true);
    
  }
  
  public void initValues() {
    logs.trace("Intializing calc panel values");
    initializeAvailableInputNodes();

    quantitySelectionPanel.setEnabled(true);
    fixedValueOptionButton.setEnabled(true);
    flowValueOptionButton.setEnabled(true);
    stockValueOptionButton.setEnabled(true); 
    
    logs.trace("Type of this node is ");

  }
  
  /**
   * Method to initialize the list of available inputs for STOCK and FLOW
   */
  public void initializeAvailableInputNodes() {
    logs.trace("Initializing Available Input Nodes in jList Panel");
    
    availableInputJListModel.clear();

    

    availableInputsJList.repaint();
  }
  
  private void setLinkType(){
    
  }
  
  public void showThatJListModelHasNoInputs() {
    availableInputJListModel.clear();
    availableInputJListModel.add(0, "This node does not have any inputs defined yet,");
    availableInputJListModel.add(1, "please go back to the Inputs Tab and choose ");
    availableInputJListModel.add(2, "at least one input, if there are not inputs ");
    availableInputJListModel.add(3, "available, please exit this node and create ");
    availableInputJListModel.add(4, "the needed nodes using the \"New node\" button.");
  }
  
  /**
   * Method to enable/disable fixed value input panel
   * @param flag : true/false to enable and disable
   */
  private void enableFixedValuePanel(boolean flag){
   fixedValueInputBox.setVisible(flag);
   fixedValueLabel.setVisible(flag);
  }
  

  private void clearEquation(){
    formulaInputArea.setText("");
  }
  
  /**
   * Update displayed equation in the text area by removing the last value
   * entered
   *
   * @param notError
   * @return
   */
  public void deleteLastFormula() {

    resetGraphStatus();
    

  }

  /**
   * CommitEdit() needed to be created because of the fact that we need a method
   * that will refresh all the components when a value is added/removed from the
   * formula/jTextAreaEqation/givenValueTextField
   */
  public void commitEdit() {
    resetGraphStatus();
    

  }

  public void resetColors(boolean typeChange) {
    
 }

   public void resetColors() {
 
  }

  private void resetGraphStatus() {
    
    
  }

  void restart_calc_panel(boolean TYPE_CHANGE) {

    clearEquationArea(TYPE_CHANGE);    
    initValues();
  }

  public void update() {
    initValues();
  }

  public void clearEquationArea(boolean typeChange) {
    formulaInputArea.setText("");
       
  }

  /**
   * This method clears the givenValueTextField and jTextAreaEquation
   */
  public void clearEquationArea() {
    formulaInputArea.setText("");    
  }

  

  public JFormattedTextField getGivenValueTextField() {
    return fixedValueInputBox;
  }

  public String getFixedValue(){
    return fixedValueInputBox.getText();
  }

  public void setGivenValueTextField(JFormattedTextField givenValueTextField) {
    this.fixedValueInputBox = givenValueTextField;
  }

  public LinkedList<String> splitEquation(String equation) {
    LinkedList<String> parsed = new LinkedList<String>();
    String variable = "";
    for (int i = 0; i < equation.length(); i++) {
      char currentChar = equation.charAt(i);
      if (currentChar == '+' || currentChar == '*' || currentChar == '-'
              || currentChar == '/' || currentChar == '^') {
        if (!variable.isEmpty()) {
          parsed.add(variable);
          variable = "";
        }
        parsed.add(currentChar + "");
      } else {
        variable += currentChar;
      }
    }
    if (!variable.isEmpty()) {
      parsed.add(variable);
      variable = "";
    }
    return parsed;
  }

  private void addedOperand(boolean justAdded) {
    
  }
  
  public void propertyChange(PropertyChangeEvent pce) {

  }


  public void preparePanelForFixedValue(){
    contentPanel.setVisible(true);
    calculatorPanel.setVisible(false);
  }

  public void preparePanelForFlow(){
    contentPanel.setVisible(true);
    calculatorPanel.setVisible(false);
  }

  public void preparePanelForStock(){
    preparePanelForFlow();
  }
  
  public boolean isViewEnabled(){
    return isViewEnabled;
  }
  
  public void setViewEnabled(boolean flag){
    isViewEnabled = flag;
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
        fixedValueLabel.setText("<html><b>Fixed value = </b></html>");
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
        formulaInputArea.setDisabledTextColor(new java.awt.Color(102, 102, 102));
        formulaInputArea.setHighlighter(null);
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
      logs.trace("Preparing UI for Stock Node");


    }//GEN-LAST:event_stockValueOptionButtonActionPerformed

    private void flowValueOptionButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_flowValueOptionButtonActionPerformed
      logs.trace("Preparing UI for Flow Node");
     
      
    }//GEN-LAST:event_flowValueOptionButtonActionPerformed

    
    /**
     * This method will remove the given node from Available Input Nodes jList
     * @param nodeName : index of the node to be removed
     */
    private void removeAvailableInputNode(int nodeIndex){
      availableInputJListModel.remove(nodeIndex);
    }
    
  /**
   * This method is called when user selects any node from available input jList
   * Once a particular input node is selected, it gets removed from the list. If
   * there are no more input nodes to be selected, then jList gets disabled.
   */
    private void availableInputsJListMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_availableInputsJListMouseClicked

      
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

  public JTextArea getFormulaInputArea(){
    return formulaInputArea;
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


