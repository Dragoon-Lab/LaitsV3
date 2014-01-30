/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
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
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.ControllerFactory;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.logger.UserActivityLog;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.PlanStatus;
import java.awt.Color;
import java.awt.Insets;
import java.util.HashMap;
import java.util.Map;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JOptionPane;
import javax.swing.JTabbedPane;
import javax.swing.UIManager;
import org.apache.log4j.Logger;

/**
 * View part of MVC Design for NodeEditor
 * @author ramayantiwari
 */
public class NodeEditorView extends javax.swing.JDialog {

    private DescriptionPanelView dPanel;
    private PlanPanelView pPanel;
    private CalculationsPanelView cPanel;
    
    //Tab Pane Indexes
    static final int DESCRIPTION = 0;
    static final int PLAN = 1;
    static final int CALCULATIONS = 2;
    
    private GraphEditorPane graphPane;
    private Vertex openVertex;
    private NodeEditorController _controller;
    
    private NodeEditorView _parent;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public NodeEditorView(Vertex selected) {
        super(MainWindow.getInstance(), true);
        graphPane = MainWindow.getInstance().getGraphEditorPane();
        openVertex = selected;
        _controller = ControllerFactory.getNodeEditorController(this, openVertex);
        initComponents();        
        
        configureAndRenderUI();                
    }

    public NodeEditorView(JDialog parent, Vertex v) {
        super(parent, true);
        _parent = (NodeEditorView) parent;
        initComponents();
        openVertex = v;
        graphPane = MainWindow.getInstance().getGraphEditorPane();
        _controller = ControllerFactory.getNodeEditorController(this, openVertex);
        _controller.initActionButtons();
        _controller.initializeCreateNewNodeDialog(this);
        initPanel();        
        tabPane.remove(1);
        tabPane.remove(1);
        setBounds(parent.getLocation().x + 50, parent.getLocation().y, parent.getBounds().width, parent.getBounds().height);
        prepareNodeEditorDisplay();        
    }

    private void initPanel() {
        dPanel = new DescriptionPanelView(this);
        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("type", "create-newnode-dialog-box");
        logMessage.put("name", "node-editor");
        
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
        
        // Attach Action Listener for Close ('X') button on title bar
        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {
                closeNodeEditor();
            }   
        });
        
        if(! ApplicationContext.isTestMode())
            setCheckGiveupButtons();
    }

    
    private void configureAndRenderUI() {
        initTabs();
        
        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {
                closeNodeEditor();
            }
        });
        
        UIManager.getDefaults().put("TabbedPane.contentBorderInsets", new Insets(2, 0, -1, 0));
        setLocationRelativeTo(null);
        prepareNodeEditorDisplay();
    }

    private void prepareNodeEditorDisplay() {
        logs.debug("Preparing Node Editor Display");
        pack();

        // TODO - Move this to specific mode initialization
        if (ApplicationContext.isCoachedMode()) {
            buttonCancel.setEnabled(false);
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            if (!openVertex.isPlanDone() && tabPane.getTabCount() != 1 ){
                tabPane.setEnabledAt(CALCULATIONS, false);
                tabPane.setForegroundAt(CALCULATIONS, Color.GRAY);
            }
            if (!openVertex.isDescriptionDone() && tabPane.getTabCount() != 1 ){
                tabPane.setEnabledAt(PLAN, false);
                tabPane.setForegroundAt(PLAN, Color.GRAY);
            }
            if (openVertex.isCalculationsDone()) {
                logs.debug("Should be enabled on close");
                buttonCancel.setEnabled(true);
            }
        }   
        
        setVisible(true);
        setResizable(false);
    }

    public void initTabs() {
        logs.debug("Initializing NodeEditor Tabs - Start");

        dPanel = new DescriptionPanelView(this);
        pPanel = new PlanPanelView(this);
        cPanel = new CalculationsPanelView(this);

        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);

        planPanel.setLayout(new java.awt.GridLayout(1, 1));
        planPanel.add(pPanel);

        calculationPanel.setLayout(new java.awt.GridLayout(1, 1));
        calculationPanel.add(cPanel);

        setSelectedPanel();
        
        _controller.initActionButtons();
        logs.debug("Initializing NodeEditor Tabs - End");
    }

    private void setSelectedPanel() {
        
        if (!openVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)
                && !openVertex.getPlanStatus().equals(Vertex.PlanStatus.INCORRECT)) {
            tabPane.setSelectedIndex(CALCULATIONS);
        } else if (!openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)
                && !openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            tabPane.setSelectedIndex(PLAN);
        } else {
            tabPane.setSelectedIndex(DESCRIPTION);
        }
        String panel = getTabName(tabPane.getSelectedIndex());
        logs.debug("setting " + panel + " panel as current");
        
        logs.debug("Initializing NodeEditor");
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("type","open-dialog-box");
        logMessage.put("name","node-editor");
        logMessage.put("tab", panel);
        logMessage.put("node", openVertex.getName());
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
        
        //TODO: send student status message
        Map<String, Object> logMessageStatus = new HashMap<String, Object>();
        logMessageStatus.put("type","info");
        logMessageStatus.put("text","Vertex Details before opening node editor");
        logMessageStatus.put("data",_controller.getNodeDetailLog());
        activityLogs.debug(new UserActivityLog(UserActivityLog.STUDENT_STATUS, logMessageStatus));
        
        if(! ApplicationContext.isTestMode())
            setCheckGiveupButtons();
    }

    /**
     * Method responsible for Enabling and Disabling Check/Demo buttons based
     * on the use case
     */
    private void setCheckGiveupButtons() {
        logs.debug("Setting Check and Giveup Button for Tab " + getTabName(tabPane.getSelectedIndex()));

        if (!ApplicationContext.isAuthorMode() && tabPane.getSelectedIndex() != PLAN) {
            logs.debug("Enabling Check and Giveup");
            this.getCheckButton().setEnabled(true);
            this.demoButton.setEnabled(true);
            String taskPhase = ApplicationContext.getCurrentTask().getPhase();

            // Disable Giveup in Challege tasks
            if (taskPhase != null && taskPhase.equalsIgnoreCase("Challenge")) {
                this.demoButton.setEnabled(false);
            }

            switch (tabPane.getSelectedIndex()) {
                case DESCRIPTION:
                    if (openVertex.isDescriptionDone()) {
                        demoButton.setEnabled(false);
                        getCheckButton().setEnabled(false);
                    }
                    break;
                case PLAN:
                    if (openVertex.isPlanDone()) {
                        demoButton.setEnabled(false);
                        getCheckButton().setEnabled(false);
                    }
                    break;
                case CALCULATIONS:
                    if (openVertex.isCalculationsDone()) {
                        demoButton.setEnabled(false);
                        getCheckButton().setEnabled(false);
                    }
                    break;
            }

        } else {
            logs.debug("Disabling Check and Giveup");
            this.getCheckButton().setEnabled(false);
            this.demoButton.setEnabled(false);
        }
    }

    public void setEditorMessage(String msg) {
        logs.debug("Setting NE Statues message to " + msg);
        JOptionPane.showMessageDialog(this, msg, "Node Editor Error", JOptionPane.ERROR_MESSAGE);                            
    }

    private void checkDescriptionPanel(TaskSolution correctSolution, Map<String, Object> logMessage) {
        // Save Description Panel Information in the Vertex Object
        if (!dPanel.processDescriptionPanel()) {
            return;
        }
        logMessage.put("name", dPanel.getNodeName());
        logMessage.put("text", dPanel.getNodeDesc());
        
        if (correctSolution.checkNodeName(dPanel.getNodeName()) && correctSolution.checkNodeDescription(dPanel.getNodeName(), dPanel.getNodeDesc())) {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            dPanel.setTextFieldBackground(Color.GREEN);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            logMessage.put("check-result", "CORRECT");
            dPanel.setEditableTree(false);

            if(tabPane.getTabCount() > 1) {
                tabPane.setEnabledAt(PLAN, true);
                tabPane.setForegroundAt(PLAN, Color.BLACK);
            }
        } else {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model. Please select another description.");
            logMessage.put("check-result", "INCORRECT");
        }

        setTitle("Node Editor - " + openVertex.getName());
        validate();
        repaint();      
    }

    private void checkDescriptionPanelCoached(TaskSolution correctSolution, Map<String, Object> logMessage) {
        // Save Description Panel Information in the Vertex Object
        logMessage.put("name", dPanel.getNodeName());
        logMessage.put("text", dPanel.getNodeDesc());
        if (!dPanel.processDescriptionPanel()) {
            logMessage.put("check-result", "INCORRECT");
            return;
        }
        
        int solutionCheck = correctSolution.checkNodeNameOrdered(dPanel.getNodeName());
        if (solutionCheck == 1) {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            dPanel.setTextFieldBackground(Color.GREEN);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            logMessage.put("check-result", "CORRECT");
            dPanel.setEditableTree(false);
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            if(tabPane.getTabCount() > 1) {
                tabPane.setEnabledAt(PLAN, true);
                tabPane.setForegroundAt(PLAN, Color.BLACK);
            }else{
                buttonCancel.setEnabled(true);
            }            
        } else if (solutionCheck == 2) {
            dPanel.setTextFieldBackground(Color.CYAN);
            setEditorMessage("That quantity is used in this model, but now is not the right time to define it.\nPlease select another description.");
            logMessage.put("check-result", "DESC OUT OF ORDER");
            
        } else {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model.\nPlease select another description.");
            logMessage.put("check-result", "INCORRECT");
        }

        setTitle("Node Editor - " + openVertex.getName());
        validate();
        repaint();        
    }

    public void checkPlanPanel(TaskSolution correctSolution, Map<String, Object> logMessage) {
        // Add Check button used to Stats
        ApplicationContext.updateCheckUsageStats(PLAN, openVertex.getName());
        logMessage.put("name", pPanel.getSelectedPlan());
        
        logs.debug("Checking Plan Panel");
        if (correctSolution.checkNodePlan(dPanel.getNodeName(), pPanel.getSelectedPlan())) {
            if (openVertex.getPlanStatus().equals(PlanStatus.UNDEFINED) || openVertex.getPlanStatus().equals(PlanStatus.INCORRECT)) {
                pPanel.setSelectedPlanBackground(Color.GREEN);
                openVertex.setPlanStatus(PlanStatus.CORRECT);                
            }
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            logMessage.put("check-result", "CORRECT");
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);            
        } else {
            setEditorMessage("You have selected the wrong Type for this node.\nThe correct Type will be selected for you.");
            logMessage.put("check-result", "INCORRECT");
            logMessage.put("correct-result", pPanel.planToString(correctSolution.getNodeByName(openVertex.getName()).getNodeType()));
            
            pPanel.giveUpPlanPanel();
            pPanel.processPlanPanel();
            openVertex.setPlanStatus(PlanStatus.GAVEUP);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
            
            // Add Demo button used to Stats
            ApplicationContext.updateDemoUsageStats(PLAN, openVertex.getName());
        }
        // Save Selected Plan to the Vertex Object
        pPanel.processPlanPanel();           
    }

    private void checkCalculationsPanel(TaskSolution correctSolution, Map<String, Object> logMessage) {
        // Check Parsing Errors and Set Student's Equation in Vertex
        // Check if Student Entered a valid calculation
        if(cPanel.processCalculationsPanel()) {
            logMessage.put("substeps", cPanel.getCalculationsActivityLog());
            
            // Check if Student's calculations are correct
            if (correctSolution.checkNodeCalculations(openVertex)) {
                cPanel.setCheckedBackground(Color.GREEN);
                getCheckButton().setEnabled(false);
                demoButton.setEnabled(false);

                logMessage.put("check-result", "CORRECT");
                openVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
                cPanel.setEditableCalculations(false);
                buttonCancel.setEnabled(true);                
            } else {
                cPanel.setCheckedBackground(Color.RED);
                setEditorMessage("Your Calculations are Incorrect.");
                logMessage.put("check-result", "INCORRECT");
                openVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }
        } else {
            cPanel.setCheckedBackground(Color.RED);
        }        
    }

    /**
     * Make necessary clean up and save graph session when NodeEditor closes
     */
    public void closeNodeEditor() {
        // Delete this vertex if its not defined and user hits Cancel
        if (!openVertex.isDescriptionDone()) {
            graphPane.setSelectionCell(openVertex.getJGraphVertex());
            graphPane.removeSelected();
        }
       
        // Save Student's session to server - we save session once node editor closes
        PersistenceManager.saveSession();
        MainWindow.refreshGraph();

        // Mode specific stuff needs refactoring
        if(ApplicationContext.isCoachedMode()){
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
        }
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("type", "close-dialog-box");
        logMessage.put("name", "node-editor");
        logMessage.put("tab", getTabName(tabPane.getSelectedIndex()));
        logMessage.put("node", openVertex.getName());
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage) );
        
        if(tabPane.getTabCount() == 1) {
            _parent.getCalculationsPanel().refreshInputs();
            _parent.getCalculationsPanel().setCreateButtonEnabled();
        }
        this.dispose();       
    }
    
    public NodeEditorView getParent() {
        return _parent;
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        tabPane = new NodeEditorTabbedPane(_controller);
        descriptionPanel = new javax.swing.JPanel();
        planPanel = new javax.swing.JPanel();
        calculationPanel = new javax.swing.JPanel();
        checkButton = new javax.swing.JButton();
        demoButton = new javax.swing.JButton();
        buttonCancel = new javax.swing.JButton();
        buttonOK = new javax.swing.JButton();
        tabPanel = new javax.swing.JLabel();

        setDefaultCloseOperation(javax.swing.WindowConstants.DO_NOTHING_ON_CLOSE);

        tabPane.setCursor(new java.awt.Cursor(java.awt.Cursor.DEFAULT_CURSOR));
        tabPane.setMaximumSize(new java.awt.Dimension(500, 400));
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
        descriptionPanel.setPreferredSize(new java.awt.Dimension(506, 615));
        descriptionPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());
        tabPane.addTab("Description", descriptionPanel);

        org.jdesktop.layout.GroupLayout planPanelLayout = new org.jdesktop.layout.GroupLayout(planPanel);
        planPanel.setLayout(planPanelLayout);
        planPanelLayout.setHorizontalGroup(
            planPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 494, Short.MAX_VALUE)
        );
        planPanelLayout.setVerticalGroup(
            planPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 454, Short.MAX_VALUE)
        );

        tabPane.addTab("Plan", planPanel);

        org.jdesktop.layout.GroupLayout calculationPanelLayout = new org.jdesktop.layout.GroupLayout(calculationPanel);
        calculationPanel.setLayout(calculationPanelLayout);
        calculationPanelLayout.setHorizontalGroup(
            calculationPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 494, Short.MAX_VALUE)
        );
        calculationPanelLayout.setVerticalGroup(
            calculationPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 454, Short.MAX_VALUE)
        );

        tabPane.addTab("Calculations", calculationPanel);

        checkButton.setText("Check");
        checkButton.setEnabled(false);
        checkButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                checkButtonActionPerformed(evt);
            }
        });

        demoButton.setText("Demo");
        demoButton.setActionCommand("Give Up");
        demoButton.setEnabled(false);
        demoButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                demoButtonActionPerformed(evt);
            }
        });

        buttonCancel.setText("Close");
        buttonCancel.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCancelActionPerformed(evt);
            }
        });

        buttonOK.setText("Enter");
        buttonOK.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonOKActionPerformed(evt);
            }
        });

        tabPanel.setForeground(new java.awt.Color(238, 238, 238));
        tabPanel.setText("Node Editor");

        org.jdesktop.layout.GroupLayout layout = new org.jdesktop.layout.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(layout.createSequentialGroup()
                .addContainerGap()
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(layout.createSequentialGroup()
                        .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 515, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                        .add(tabPanel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 7, Short.MAX_VALUE))
                    .add(layout.createSequentialGroup()
                        .add(checkButton)
                        .add(18, 18, 18)
                        .add(demoButton)
                        .add(142, 142, 142)
                        .add(buttonOK)
                        .add(18, 18, 18)
                        .add(buttonCancel)
                        .add(0, 0, Short.MAX_VALUE)))
                .addContainerGap())
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(org.jdesktop.layout.GroupLayout.TRAILING, layout.createSequentialGroup()
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(layout.createSequentialGroup()
                        .addContainerGap()
                        .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 500, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE))
                    .add(tabPanel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 16, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE))
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.BASELINE)
                    .add(checkButton)
                    .add(demoButton)
                    .add(buttonOK)
                    .add(buttonCancel, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void checkButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_checkButtonActionPerformed
        // Action for Check Button
        logs.debug("Handling Check Action");
        TaskSolution correctSolution = ApplicationContext.getCorrectSolution();
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("node",openVertex.getName());
        
        switch (tabPane.getSelectedIndex()) {
            case DESCRIPTION:
                logMessage.put("type","enter-quantity");
                if (ApplicationContext.isCoachedMode()) {
                    checkDescriptionPanelCoached(correctSolution, logMessage);
                } else {
                    checkDescriptionPanel(correctSolution, logMessage);
                }
                // Add Check button used to Stats
                ApplicationContext.updateCheckUsageStats(DESCRIPTION, openVertex.getName());                
                break;

            case PLAN:
                logMessage.put("type","quantity-type");
                checkPlanPanel(correctSolution, logMessage);
                break;

            case CALCULATIONS:
                checkCalculationsPanel(correctSolution, logMessage);
                // Add Check button used to Stats
                ApplicationContext.updateCheckUsageStats(CALCULATIONS, openVertex.getName());
        }

        activityLogs.debug(new UserActivityLog(UserActivityLog.SOLUTION_STEP, logMessage));
        // Refreshing Graph
        MainWindow.refreshGraph();
    }//GEN-LAST:event_checkButtonActionPerformed

    // This is string name of tab used in problem xml to
    // specify help bubbles and used in logging
    public static String getTabName(int id) {
        switch (id) {
            case DESCRIPTION:
                return "DESCRIPTION";
            case PLAN:
                return "PLAN";
            case CALCULATIONS:
                return "CALCULATIONS";
        }
        throw new IllegalArgumentException("invalid tab number " + id);
    }

    private void demoButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_demoButtonActionPerformed
        logs.debug("Demo Button Action Performed");
        // Action for Giveup Button
        switch (tabPane.getSelectedIndex()) {
            case DESCRIPTION:                
                dPanel.giveUpDescriptionPanel();
                dPanel.processDescriptionPanel();
                openVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
                setTitle(openVertex.getName());
                validate();
                repaint();
                openVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
                getCheckButton().setEnabled(false);
                demoButton.setEnabled(false);
                dPanel.setEditableTree(false);
                
                if(tabPane.getTabCount() == 1) {
                    buttonCancel.setEnabled(true);
                } else {
                    tabPane.setEnabledAt(PLAN, true);
                    tabPane.setForegroundAt(PLAN, Color.BLACK);
                }
                // Add Demo button used to Stats
                ApplicationContext.updateDemoUsageStats(DESCRIPTION, openVertex.getName());
                break;

            case PLAN:
                pPanel.giveUpPlanPanel();
                pPanel.processPlanPanel();
                openVertex.setPlanStatus(Vertex.PlanStatus.GAVEUP);
                getCheckButton().setEnabled(false);
                demoButton.setEnabled(false);
                pPanel.setEditableRadio(false);
                tabPane.setEnabledAt(CALCULATIONS, true);
                tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
                break;

            case CALCULATIONS:
                if (cPanel.giveUpCalculationsPanel()) {
                    cPanel.processCalculationsPanel();
                    openVertex.setCalculationsStatus(Vertex.CalculationsStatus.GAVEUP);
                    cPanel.setEditableCalculations(false);
                    buttonCancel.setEnabled(true);
                    getCheckButton().setEnabled(false);
                    demoButton.setEnabled(false);
                } else {
                    // Only disable buttons if tab was turned yellow.
                    // In this case, warning message was given and student
                    // needs to be able to update entry and check it.
                    openVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
                }
                
                // Add Demo button used to Stats
                ApplicationContext.updateDemoUsageStats(CALCULATIONS, openVertex.getName());
                break;
        }
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("type","demo-used");
        logMessage.put("name", openVertex.getName());
        logMessage.put("tab", getTabName(tabPane.getSelectedIndex()));
        activityLogs.debug(new UserActivityLog(UserActivityLog.SEEK_HELP, logMessage));
        MainWindow.refreshGraph();
    }//GEN-LAST:event_demoButtonActionPerformed
    
    private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
        closeNodeEditor();
    }//GEN-LAST:event_buttonCancelActionPerformed

    private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
        Map<String, Object> logMessage = new HashMap<String, Object>();
        logMessage.put("type","enter-used");
        logMessage.put("name", openVertex.getName());
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
        try{
            _controller.processOKAction();      
        } catch (NodeEditorException ex){
            ex.printStackTrace();
            logs.error(ex.getMessage());
        }
       
        logs.info(openVertex.toString());        
    }//GEN-LAST:event_buttonOKActionPerformed

    public Vertex getOpenVertex() {
        return openVertex;
    }

    public JTabbedPane getTabbedPane() {
        return tabPane;
    }

    public DescriptionPanelView getDescriptionPanel() {
        return dPanel;
    }

    public PlanPanelView getPlanPanel() {
        return pPanel;
    }

    public CalculationsPanelView getCalculationsPanel() {
        return cPanel;
    }

    public JButton getOKButton() {
        return buttonOK;
    }

    public JButton getCancelButton() {
        return buttonCancel;
    }

    public JButton getCheckButton() {        
        return checkButton;
    }

    public JButton getDemoButton() {        
        return demoButton;
    }

    public NodeEditorController getController(){
        return _controller;
    }
   
    private void tabPaneMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseDragged
    }//GEN-LAST:event_tabPaneMouseDragged

    private void tabPaneMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseClicked
    }//GEN-LAST:event_tabPaneMouseClicked
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JButton buttonCancel;
    private javax.swing.JButton buttonOK;
    private javax.swing.JPanel calculationPanel;
    private javax.swing.JButton checkButton;
    private javax.swing.JButton demoButton;
    private javax.swing.JPanel descriptionPanel;
    private javax.swing.JPanel planPanel;
    private javax.swing.JTabbedPane tabPane;
    private javax.swing.JLabel tabPanel;
    // End of variables declaration//GEN-END:variables
}
