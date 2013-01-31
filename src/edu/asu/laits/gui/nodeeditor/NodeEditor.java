/*
 * LAITS Project
 * Arizona State University
 *
 * @author rptiwari
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Component;
import java.awt.Insets;
import java.awt.Point;
import java.awt.event.WindowEvent;
import java.awt.event.WindowListener;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.UIManager;
import javax.swing.WindowConstants;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.GraphConstants;
import org.jgraph.graph.Port;
import org.jgraph.graph.PortView;

public class NodeEditor extends JFrame implements WindowListener {

    private static NodeEditor nodeEditor;
    private DescriptionPanelView dPanel;
    private PlanPanelView pPanel;
    private InputsPanelView iPanel;
    private CalculationsPanelView cPanel;
    private GraphsPanelView gPanel;
    public boolean graphCanBeDisplayed = false;
    
    //Tab Pane Indexes
    public static final int DESCRIPTION = 0;
    public static final int PLAN = 1;
    public static final int INPUTS = 2;
    public static final int CALCULATIONS = 3;
    public static final int GRAPH = 4;
    private boolean extraTabEvent;
    private int selectedTab;
    private GraphEditorPane graphPane;
    private Vertex currentVertex;
    
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public NodeEditor(GraphEditorPane editorPane) {
        graphPane = editorPane;
        DefaultGraphCell gc = (DefaultGraphCell) graphPane.getSelectionCell();
        currentVertex = (Vertex) gc.getUserObject();
        UIManager.getDefaults().put("TabbedPane.contentBorderInsets", new Insets(2, 0, -1, 0));
        initComponents();
        setTabListener();
        initNodeEditor();
    }

    /**
     * Initialize NodeEditor for a new Node
     */
    public void initNodeEditor() {
        logs.debug("Initializing NodeEditor");

        initTabs(true);
        addWindowListener(this);
        setTitle(currentVertex.getName());
        prepareNodeEditorDisplay();

        if(ApplicationContext.getAppMode().equals("STUDENT")){
            this.checkButton.setEnabled(true);
            this.giveUpButton.setEnabled(true);            
        }
        
    }

    private void prepareNodeEditorDisplay() {
        pack();

        setVisible(true);
        setAlwaysOnTop(true);

        setResizable(false);
        setDefaultCloseOperation(WindowConstants.DO_NOTHING_ON_CLOSE);
        requestFocus(true);
        setFocusable(true);

        setEditorMessage("");

        setBounds(getToolkit().getScreenSize().width - 662,
                100,
                getPreferredSize().width, getPreferredSize().height);
    }

   

    /**
     * Method to Initialize all the Tabs of NodeEditor for this vertex
     *
     * @param newNode : if the tabs are for new node or for an existing node
     */
    public void initTabs(boolean newNode) {
        logs.debug("Initializing NodeEditor Tabs - Start");

        dPanel = new DescriptionPanelView(this);
        pPanel = new PlanPanelView(this);
        iPanel = new InputsPanelView(this);
        cPanel = new CalculationsPanelView(this);
        gPanel = new GraphsPanelView(this);

        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);

        planPanel.setLayout(new java.awt.GridLayout(1, 1));
        planPanel.add(pPanel);

        inputsPanel.setLayout(new java.awt.GridLayout(1, 1));
        inputsPanel.add(iPanel);

        calculationPanel.setLayout(new java.awt.GridLayout(1, 1));
        calculationPanel.add(cPanel);

        graphsPanel.setLayout(new java.awt.GridLayout(1, 1));
        graphsPanel.add(gPanel);
        
        setSelectedPanel();

        logs.debug("Initializing NodeEditor Tabs - End");
    }

    private void setSelectedPanel() {
        extraTabEvent = false;
        enableViewForPanels();

        if (!currentVertex.getGraphsStatus().equals(Vertex.GraphsStatus.UNDEFINED)) {
            gPanel.loadGraph();
            selectedTab = GRAPH;
            tabPane.setEnabledAt(GRAPH, true);
            tabPane.setSelectedIndex(GRAPH);
            tabPane.setForegroundAt(GRAPH, Color.BLACK);
        } else {
            logs.debug("Inside Else");
            tabPane.setEnabledAt(GRAPH, false);
            tabPane.setForegroundAt(GRAPH, Color.GRAY);

            if (!currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)) {
                logs.debug("setting calc panel as current");
                selectedTab = INPUTS;
                tabPane.setSelectedIndex(CALCULATIONS);
            } else if (!currentVertex.getPlan().equals(Vertex.Plan.UNDEFINED)) {
                logs.debug("Setting Inputs Panel as Current");
                selectedTab = PLAN;
                tabPane.setSelectedIndex(INPUTS);
            } else if (!currentVertex.getName().equals("")) {
                logs.debug("Setting Plan Panel as Current");
                selectedTab = DESCRIPTION;
                tabPane.setSelectedIndex(PLAN);
            } else {
                logs.debug("Setting Desc Panel as Current");
                selectedTab = DESCRIPTION;
                tabPane.setSelectedIndex(DESCRIPTION);
            }
        }
    }

    private void enableViewForPanels() {
        if (!currentVertex.getPlan().equals(Vertex.Plan.UNDEFINED)) {
            pPanel.setViewEnabled(true);
        }

        if (!currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)) {
            iPanel.setViewEnabled(true);
        }

        if (!currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED)) {
            cPanel.setViewEnabled(true);
        }
    }

    private void setTabListener() {
        logs.debug("Setting Tab Listener");
        final JFrame f = this;

        tabPane.addChangeListener(new ChangeListener() {
            // Set the Tab of Node Editor according to the finished Tabs
            public void stateChanged(ChangeEvent e) {

                logs.error("Current Tab " + tabPane.getSelectedIndex() + "  " + selectedTab);

                if (extraTabEvent) {
                    logs.debug("Exiting because of extraTabEvent");
                    extraTabEvent = false;
                    return;
                }
                
                processEditorInput();

                if (tabPane.getSelectedIndex() == DESCRIPTION) {
                    selectedTab = DESCRIPTION;
                } else if (tabPane.getSelectedIndex() == PLAN) {
                    if (pPanel.isViewEnabled()) {
                        selectedTab = PLAN;
                        logs.debug("Plan Panel View Enabled. ExtraTabEvent = " + extraTabEvent);
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } else if (tabPane.getSelectedIndex() == INPUTS) {
                    if (iPanel.isViewEnabled()) {
                        logs.debug("inside ipanel if " + extraTabEvent);
                        selectedTab = INPUTS;
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
                    if (cPanel.isViewEnabled()) {
                        selectedTab = CALCULATIONS;
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                }
                logs.debug("Tab Stage Changed Action - Ends");
            }
        });
        logs.debug("Setting Tab Listener -Ends");
    }

    private boolean processEditorInput() {
        if (selectedTab == GRAPH) {
            logs.debug("Selected Tab is Graph - DOING NOTHING");
            selectedTab = tabPane.getSelectedIndex();
        } else if (selectedTab == DESCRIPTION) {

            if (dPanel.processDescriptionPanel()) {
                logs.debug("Saving Description Panel");
                getInputsPanel().updateNodeDescription();
                getGraphsPanel().updateDescription();
                editorMsgLabel.setText("");
                pPanel.setViewEnabled(true);
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(DESCRIPTION);
                return false;
            }
        } else if (selectedTab == PLAN) {

            if (pPanel.processPlanPanel()) {
                logs.debug("Saving PLAN Panel");
                editorMsgLabel.setText("");
                iPanel.setViewEnabled(true);
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(PLAN);
                return false;
            }
        } else if (selectedTab == INPUTS) {

            if (iPanel.processInputsPanel()) {
                logs.debug("Saving INPUTS Panel");
                editorMsgLabel.setText("");
                cPanel.initPanel();
                cPanel.setViewEnabled(true);
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(INPUTS);
                return false;
            }
        } else if (selectedTab == CALCULATIONS) {

            if (cPanel.processCalculationsPanel()) {
                logs.debug("Saving CALCULATIONS Panel");
                editorMsgLabel.setText("");
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(CALCULATIONS);
                return false;
            }
        }

        return true;
    }

    public Vertex getCurrentVertex() {
        return currentVertex;
    }

    public GraphEditorPane getGraphPane() {
        return graphPane;
    }

    public CalculationsPanelView getCalculationsPanel() {
        return cPanel;
    }

    public DescriptionPanelView getDescriptionPanel() {
        return dPanel;
    }

    public InputsPanelView getInputsPanel() {
        return iPanel;
    }

    public GraphsPanelView getGraphsPanel() {
        return gPanel;
    }

    /**
     * Set Editor Error/Warning Messages
     *
     * @param msg : message to be displayed
     */
    public void setEditorMessage(String msg) {
        editorMsgLabel.setText(msg);
        editorMsgLabel.setVisible(true);
    }
    
    
    /**
     * Method to handle closing of Editor
     *
     * @param e
     */
    public void windowClosing(WindowEvent e) {
        logs.debug("Closing Node Editor");
    }

    public void windowOpened(WindowEvent e) {
    }

    public void windowClosed(WindowEvent e) {
        this.dispose();
    }

    public void windowIconified(WindowEvent e) {
    }

    public void windowDeiconified(WindowEvent e) {
    }

    public void windowActivated(WindowEvent e) {
    }

    public void windowDeactivated(WindowEvent e) {
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        tabPane = new javax.swing.JTabbedPane();
        descriptionPanel = new javax.swing.JPanel();
        planPanel = new javax.swing.JPanel();
        inputsPanel = new javax.swing.JPanel();
        calculationPanel = new javax.swing.JPanel();
        graphsPanel = new javax.swing.JPanel();
        checkButton = new javax.swing.JButton();
        giveUpButton = new javax.swing.JButton();
        buttonCancel = new javax.swing.JButton();
        buttonOK = new javax.swing.JButton();
        editorMsgLabel = new javax.swing.JLabel();
        bottomSpacer = new javax.swing.JLabel();
        buttonDelete = new javax.swing.JButton();

        setDefaultCloseOperation(javax.swing.WindowConstants.EXIT_ON_CLOSE);
        setTitle("Node Editor");
        setAlwaysOnTop(true);
        setResizable(false);
        addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                formMouseClicked(evt);
            }
        });
        addWindowFocusListener(new java.awt.event.WindowFocusListener() {
            public void windowGainedFocus(java.awt.event.WindowEvent evt) {
                formWindowGainedFocus(evt);
            }
            public void windowLostFocus(java.awt.event.WindowEvent evt) {
            }
        });
        addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseDragged(java.awt.event.MouseEvent evt) {
                formMouseDragged(evt);
            }
        });
        getContentPane().setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        tabPane.setCursor(new java.awt.Cursor(java.awt.Cursor.DEFAULT_CURSOR));
        tabPane.setMinimumSize(new java.awt.Dimension(500, 500));
        tabPane.setOpaque(true);
        tabPane.setPreferredSize(new java.awt.Dimension(500, 400));
        tabPane.setRequestFocusEnabled(false);
        tabPane.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                tabPaneMouseClicked(evt);
            }
        });
        tabPane.addMouseMotionListener(new java.awt.event.MouseMotionAdapter() {
            public void mouseDragged(java.awt.event.MouseEvent evt) {
                tabPaneMouseDragged(evt);
            }
        });

        descriptionPanel.setCursor(new java.awt.Cursor(java.awt.Cursor.DEFAULT_CURSOR));
        descriptionPanel.setFocusable(false);

        javax.swing.GroupLayout descriptionPanelLayout = new javax.swing.GroupLayout(descriptionPanel);
        descriptionPanel.setLayout(descriptionPanelLayout);
        descriptionPanelLayout.setHorizontalGroup(
            descriptionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        descriptionPanelLayout.setVerticalGroup(
            descriptionPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Description", descriptionPanel);

        javax.swing.GroupLayout planPanelLayout = new javax.swing.GroupLayout(planPanel);
        planPanel.setLayout(planPanelLayout);
        planPanelLayout.setHorizontalGroup(
            planPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        planPanelLayout.setVerticalGroup(
            planPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Plan", planPanel);

        javax.swing.GroupLayout inputsPanelLayout = new javax.swing.GroupLayout(inputsPanel);
        inputsPanel.setLayout(inputsPanelLayout);
        inputsPanelLayout.setHorizontalGroup(
            inputsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        inputsPanelLayout.setVerticalGroup(
            inputsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Inputs", inputsPanel);

        javax.swing.GroupLayout calculationPanelLayout = new javax.swing.GroupLayout(calculationPanel);
        calculationPanel.setLayout(calculationPanelLayout);
        calculationPanelLayout.setHorizontalGroup(
            calculationPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        calculationPanelLayout.setVerticalGroup(
            calculationPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Calculations", calculationPanel);

        javax.swing.GroupLayout graphsPanelLayout = new javax.swing.GroupLayout(graphsPanel);
        graphsPanel.setLayout(graphsPanelLayout);
        graphsPanelLayout.setHorizontalGroup(
            graphsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 601, Short.MAX_VALUE)
        );
        graphsPanelLayout.setVerticalGroup(
            graphsPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGap(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Graphs", graphsPanel);

        getContentPane().add(tabPane, new org.netbeans.lib.awtextra.AbsoluteConstraints(0, 0, 622, 552));

        checkButton.setText("Check");
        checkButton.setEnabled(false);
        checkButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                checkButtonActionPerformed(evt);
            }
        });
        getContentPane().add(checkButton, new org.netbeans.lib.awtextra.AbsoluteConstraints(20, 570, 82, 41));

        giveUpButton.setText("Give Up");
        giveUpButton.setEnabled(false);
        giveUpButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                giveUpButtonActionPerformed(evt);
            }
        });
        getContentPane().add(giveUpButton, new org.netbeans.lib.awtextra.AbsoluteConstraints(120, 570, 78, 41));

        buttonCancel.setText("Cancel");
        buttonCancel.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCancelActionPerformed(evt);
            }
        });
        getContentPane().add(buttonCancel, new org.netbeans.lib.awtextra.AbsoluteConstraints(420, 570, -1, 41));

        buttonOK.setText("Ok");
        buttonOK.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonOKActionPerformed(evt);
            }
        });
        getContentPane().add(buttonOK, new org.netbeans.lib.awtextra.AbsoluteConstraints(520, 570, 91, 41));

        editorMsgLabel.setFont(new java.awt.Font("Lucida Grande", 0, 12)); // NOI18N
        editorMsgLabel.setForeground(new java.awt.Color(255, 0, 0));
        editorMsgLabel.setText("jLabel1");
        getContentPane().add(editorMsgLabel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 550, 601, -1));
        getContentPane().add(bottomSpacer, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 616, 30, 10));

        buttonDelete.setText("Delete Node");
        buttonDelete.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonDeleteActionPerformed(evt);
            }
        });
        getContentPane().add(buttonDelete, new org.netbeans.lib.awtextra.AbsoluteConstraints(290, 570, 115, 40));

        pack();
    }// </editor-fold>//GEN-END:initComponents

  private void formWindowGainedFocus(java.awt.event.WindowEvent evt) {//GEN-FIRST:event_formWindowGainedFocus
  }//GEN-LAST:event_formWindowGainedFocus

  private void tabPaneMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseClicked
  }//GEN-LAST:event_tabPaneMouseClicked

  private void formMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_formMouseDragged
  }//GEN-LAST:event_formMouseDragged

  private void formMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_formMouseClicked
  }//GEN-LAST:event_formMouseClicked

  private void tabPaneMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseDragged
  }//GEN-LAST:event_tabPaneMouseDragged

  private void checkButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_checkButtonActionPerformed
      // Action for Check Button
      logs.debug("Handling Check Action");
      TaskSolution correctSolution = ApplicationContext.getCorrectSolution();

      if (tabPane.getSelectedIndex() == DESCRIPTION) {
          checkDescriptionPanel(correctSolution);
      } else if (tabPane.getSelectedIndex() == PLAN) {
          checkPlanPanel(correctSolution);
      } else if (tabPane.getSelectedIndex() == INPUTS) {
          checkInputsPanel(correctSolution);
      } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
          checkCalculationsPanel(correctSolution);
      }

 }//GEN-LAST:event_checkButtonActionPerformed

    private void checkDescriptionPanel(TaskSolution correctSolution) {
        if (correctSolution.checkNodeName(dPanel.getNodeName())) {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            dPanel.setTextFieldBackground(Color.GREEN);
        } else {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
        }
        
        // Save Description Panel Information in the Vertex Object
        dPanel.processDescriptionPanel();
        setTitle(currentVertex.getName());
    }

    private void checkPlanPanel(TaskSolution correctSolution) {
        logs.debug("Checking Plan Panel");
        if (correctSolution.checkNodePlan(dPanel.getNodeName(), pPanel.getSelectedPlan())) {
            pPanel.setSelectedPlanBackground(Color.GREEN);
            currentVertex.setPlanStatus(Vertex.PlanStatus.CORRECT);
        } else {
            pPanel.setSelectedPlanBackground(Color.RED);
            currentVertex.setPlanStatus(Vertex.PlanStatus.INCORRECT);
        }
        // Save Selected Plan to the Vertex Object
        pPanel.processPlanPanel();
    }
    
    private void checkInputsPanel(TaskSolution correctSolution){
        iPanel.processInputsPanel();
        
        boolean result = false;
        if(iPanel.getValueButtonSelected()){
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), null);
        }else if(iPanel.getInputsButtonSelected()){
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), iPanel.getSelectedInputsList());
        }
        
        if(result){
            iPanel.setOptionPanelBackground(Color.GREEN);
            currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);
        }    
        else{
            iPanel.setOptionPanelBackground(Color.RED);
            currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
        }              
    }
    
    private void checkCalculationsPanel(TaskSolution correctSolution){
        // Check Parsing Errors and Set Student's Equation in Vertex
        cPanel.processCalculationsPanel();
        
        // Check for fixed value
        if(correctSolution.checkNodeCalculations(currentVertex)){
            cPanel.setCheckedBackground(Color.GREEN);
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
        }else{
            cPanel.setCheckedBackground(Color.RED);
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
        }
    }
  
  private void giveUpButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_giveUpButtonActionPerformed
      // Action for Giveup Button
      if(tabPane.getSelectedIndex() == DESCRIPTION){
          logs.debug("Handling Give up Action for DESCRIPTION Tab");
          dPanel.giveUpDescriptionPanel();
          currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
      }else if(tabPane.getSelectedIndex() == PLAN){
      
      }else if(tabPane.getSelectedIndex() == INPUTS){
      
      }else if(tabPane.getSelectedIndex() == CALCULATIONS){
      
      }
 }//GEN-LAST:event_giveUpButtonActionPerformed

  private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
      // Process Cancel Action for all the Tabs
      
      // Delete this vertex if its not defined and user hits Cancel
      if(currentVertex.getName().equals("")){
          graphPane.removeSelected();
      }
      
      this.dispose();
  }//GEN-LAST:event_buttonCancelActionPerformed

  private void processAuthorModeOKAction(){
      logs.debug("Processing Author Mode OK Button Action");
      if (dPanel.processDescriptionPanel()) {
          if (pPanel.processPlanPanel()) {
              if (iPanel.processInputsPanel()) {
                  logs.debug("Setting Inputs completely");
                  currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);
                  if (cPanel.processCalculationsPanel()) {
                      currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
                  } else {
                      currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
                  }
              } else {
                  logs.debug("Setting input incompletely");
                  currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
              }
              graphPane.repaint();
          }
          this.dispose();
      }
  }
  
  private void processTutorModeOKAction(){
      logs.debug("Processing Tutor Mode OK Button Action");
      if(!isCheckGiveupButtonUsed())
          return;
      
      this.dispose();
  }
  
  private boolean isCheckGiveupButtonUsed(){
      logs.debug("Verifying if Check or Giveup button was used");
      
      if(tabPane.getSelectedIndex() == DESCRIPTION && 
              currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)){
          showUndefinedTabErr();
          return false;
      }
      
      if(tabPane.getSelectedIndex() == PLAN && 
              currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)){
          showUndefinedTabErr();
          return false;
      }
      
      if(tabPane.getSelectedIndex() == INPUTS && 
              currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)){
          showUndefinedTabErr();
          return false;
      }
      
      if(tabPane.getSelectedIndex() == CALCULATIONS && 
              currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED)){
          showUndefinedTabErr();
          return false;
      }
      
      return true;
  }
  
  private void showUndefinedTabErr(){
      this.editorMsgLabel.setText("Please use Check or Giveup buttons before exiting");
  }
  
    /**
     * Method to process the Node after filling all the details in NodeEditor
     *
     * @param evt
     */
  private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
      if(ApplicationContext.getAppMode().equalsIgnoreCase("STUDENT")){
          processTutorModeOKAction();
      }else{
          processAuthorModeOKAction();
      }
      
  }//GEN-LAST:event_buttonOKActionPerformed

    private void buttonDeleteActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonDeleteActionPerformed
        // TODO add your handling code here:
        logs.debug("Delete Button Action Performed "+graphPane.getSelectionCount());
        graphPane.removeSelected();        
        
        Iterator it=graphPane.getModelGraph().vertexSet().iterator();
            Vertex v;
            while(it.hasNext())
            {
                v=(Vertex)it.next();
                v.getCorrectValues().clear();
                v.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
            }
        
        this.dispose();        
    }//GEN-LAST:event_buttonDeleteActionPerformed

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel bottomSpacer;
    private javax.swing.JButton buttonCancel;
    private javax.swing.JButton buttonDelete;
    private javax.swing.JButton buttonOK;
    private javax.swing.JPanel calculationPanel;
    private javax.swing.JButton checkButton;
    private javax.swing.JPanel descriptionPanel;
    private javax.swing.JLabel editorMsgLabel;
    private javax.swing.JButton giveUpButton;
    private javax.swing.JPanel graphsPanel;
    private javax.swing.JPanel inputsPanel;
    private javax.swing.JPanel planPanel;
    private javax.swing.JTabbedPane tabPane;
    // End of variables declaration//GEN-END:variables
}
