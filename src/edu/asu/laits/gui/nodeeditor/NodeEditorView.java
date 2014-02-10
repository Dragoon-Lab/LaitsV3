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
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.Vertex.PlanStatus;
import java.awt.Color;
import java.awt.Insets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.swing.JButton;
import javax.swing.JComponent;
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
    
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public NodeEditorView(Vertex selected) {
        super(MainWindow.getInstance(), true);
        graphPane = MainWindow.getInstance().getGraphEditorPane();
        logs.info("Initializing Node Editor view for Vertex " + selected.getName());
        openVertex = selected;
        _controller = ControllerFactory.getNodeEditorController(this, openVertex);
        initComponents();
        configureAndRenderUI();
        
    }

    private void configureAndRenderUI() {
        logs.debug("Initializing NodeEditor");
        activityLogs.debug("NodeEditor opened for Node '" + openVertex.getName() + "'");
        initTabs();
        
        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {
                activityLogs.debug("User pressed Close button for Node " + openVertex.getName());
                closeNodeEditor();
            }
        });
        _controller.initOnLoadBalloonTip();
        UIManager.getDefaults().put("TabbedPane.contentBorderInsets",new Insets(2, 0, -1, 0));
        prepareNodeEditorDisplay();
    }

    private void positionNodeEditorOnScreen() {
        setLocationRelativeTo(null);
    }

    private void prepareNodeEditorDisplay() {
        logs.debug("Preparing Node Editor Display");
        positionNodeEditorOnScreen();
        pack();

        if (ApplicationContext.isCoachedMode()) {
            buttonCancel.setEnabled(false);
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            if (!openVertex.isPlanDone()) {
                tabPane.setEnabledAt(CALCULATIONS, false);
                tabPane.setForegroundAt(CALCULATIONS, Color.GRAY);
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

        activityLogs.debug("Vertex Details before opening node editor ");
        activityLogs.debug(dPanel.printDescriptionPanelDetails());
        //activityLogs.debug(pPanel.printPlanPanel());
        activityLogs.debug(cPanel.printCalculationPanel());

        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);

        planPanel.setLayout(new java.awt.GridLayout(1, 1));
        planPanel.add(pPanel);

        calculationPanel.setLayout(new java.awt.GridLayout(1, 1));
        calculationPanel.add(cPanel);

        setSelectedPanel();
        //setTabListener();
        
        _controller.initActionButtons();
        logs.debug("Initializing NodeEditor Tabs - End");
    }

    private void setSelectedPanel() {

        if (!openVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)
                && !openVertex.getPlanStatus().equals(Vertex.PlanStatus.INCORRECT)) {
            logs.debug("setting calc panel as current");
            activityLogs.debug("Node Editor is opend with Calculations Tab for Node: " + openVertex.getName());
            tabPane.setSelectedIndex(CALCULATIONS);
        } else if (!openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)
                && !openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            logs.debug("Setting Plan Panel as Current");
            activityLogs.debug("Node Editor is opend with Plan Tab for Node: " + openVertex.getName());
            tabPane.setSelectedIndex(PLAN);
        } else {
            logs.debug("Setting Desc Panel as Current");
            activityLogs.debug("Node Editor is opend with Description Tab for Node: " + openVertex.getName());
            
            tabPane.setSelectedIndex(DESCRIPTION);
        }
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
            System.out.println("test " + ApplicationContext.getCurrentTask().toString());
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

    private void checkDescriptionPanel(TaskSolution correctSolution) {
        // Save Description Panel Information in the Vertex Object
        if (!dPanel.processDescriptionPanel()) {
            return;
        }

        if (correctSolution.checkNodeName(dPanel.getNodeName()) && correctSolution.checkNodeDescription(dPanel.getNodeName(), dPanel.getNodeDesc())) {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            //graphPane.getMainFrame().getMainMenu().getModelMenu().addDeleteNodeMenu();
            dPanel.setTextFieldBackground(Color.GREEN);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            activityLogs.debug("User entered correct description");
            dPanel.setEditableTree(false);
            tabPane.setEnabledAt(PLAN, true);
            tabPane.setForegroundAt(PLAN, Color.BLACK);
        } else {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model. Please select another description.");
            activityLogs.debug("User entered incorrect description");
        }

        setTitle("Node Editor - "+openVertex.getName());
        validate();
        repaint();      
    }

    private void checkDescriptionPanelCoached(TaskSolution correctSolution) {
        // Save Description Panel Information in the Vertex Object
        if (!dPanel.processDescriptionPanel()) {
            return;
        }
        int solutionCheck = correctSolution.checkNodeNameOrdered(dPanel.getNodeName());
        if (solutionCheck == 1) {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            //graphPane.getMainFrame().getMainMenu().getModelMenu().addDeleteNodeMenu();
            dPanel.setTextFieldBackground(Color.GREEN);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            activityLogs.debug("User entered correct description");
            dPanel.setEditableTree(false);
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            tabPane.setEnabledAt(PLAN, true);
            tabPane.setForegroundAt(PLAN, Color.BLACK);
            addHelpBalloon(openVertex.getName(), "descCheckDemo", "DESCRIPTION");
        } else if (solutionCheck == 2) {
            dPanel.setTextFieldBackground(Color.CYAN);
            setEditorMessage("That quantity used in this model, but now is not the right time to define it. Please select another description.");
            activityLogs.debug("User entered description out of order");
            addHelpBalloon(ApplicationContext.getCorrectSolution().getTargetNodes().getFirstNextNode(openVertex), "onLoad", "DESCRIPTION");
        } else {
            openVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model. Please select another description.");
            activityLogs.debug("User entered incorrect description");

        }

        setTitle("Node Editor - "+openVertex.getName());
        validate();
        repaint();        
    }

    public void checkPlanPanel(TaskSolution correctSolution) {
        logs.debug("Checking Plan Panel");
        if (correctSolution.checkNodePlan(dPanel.getNodeName(), pPanel.getSelectedPlan())) {
            if (openVertex.getPlanStatus().equals(PlanStatus.UNDEFINED) || openVertex.getPlanStatus().equals(PlanStatus.INCORRECT)) {
                pPanel.setSelectedPlanBackground(Color.GREEN);
                openVertex.setPlanStatus(PlanStatus.CORRECT);
            
            }
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            activityLogs.debug("User entered correct Plan");
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
            if (ApplicationContext.isCoachedMode()) {
                addHelpBalloon(openVertex.getName(), "descCheckDemo", "PLAN");
            }
        } else {
            setEditorMessage("You have selected incorrect Plan for this Node. Correct plan has been selected for you.");
            activityLogs.debug("User entered incorrect Plan");

            pPanel.giveUpPlanPanel();
            pPanel.processPlanPanel();
            openVertex.setPlanStatus(PlanStatus.GAVEUP);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
        }
        // Save Selected Plan to the Vertex Object
        pPanel.processPlanPanel();
        activityLogs.debug("User checked plan panel with node plan as " + pPanel.getSelectedPlan());       
    }

    private void checkCalculationsPanel(TaskSolution correctSolution) {
        // Check Parsing Errors and Set Student's Equation in Vertex
        cPanel.processCalculationsPanel();
        cPanel.setCheckedBackground(new Color(240, 240, 240));
        // Check for fixed value
        if (correctSolution.checkNodeCalculations(openVertex)) {
            cPanel.setCheckedBackground(Color.GREEN);
            getCheckButton().setEnabled(false);
            demoButton.setEnabled(false);
            
            activityLogs.debug("User entered correct Calculations.");
            openVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            cPanel.setEditableCalculations(false);
            buttonCancel.setEnabled(true);
            if (ApplicationContext.isCoachedMode()) {
                addHelpBalloon(openVertex.getName(), "descCheckDemo", "CALCULATIONS");
            }
        } else {
            cPanel.setCheckedBackground(Color.RED);
            setEditorMessage("Your Calculations are Incorrect.");
            activityLogs.debug("User entered incorrect Calculations.");
            openVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
        }
        
        activityLogs.debug("User checked calculations panel with Nodetype: " + openVertex.getVertexType()
                + " Initial Value : " + openVertex.getInitialValue() + " Calculations as " + openVertex.getEquation());
    }

    /**
     * Make necessary clean up and save graph session when NodeEditor closes
     */
    public void closeNodeEditor() {
        activityLogs.debug("Closing NodeEditor because of Close action.");
        
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
            MainWindow.getInstance().addHelpBalloon(openVertex.getName(), "nodeEditorClose");
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
        }
        
        this.dispose();
    }

    public void addHelpBalloon(String name, String timing, String panel) {
        logs.debug("Adding Help Bubble for " + panel);
        if (ApplicationContext.isCoachedMode()) {
            System.out.println("addhelpballoon passing in " + name);
            List<HelpBubble> bubbles = ApplicationContext.getHelp(name, panel, timing);
            if (!bubbles.isEmpty()) {
                for (HelpBubble bubble : bubbles) {
                    try {
                        if (panel.equalsIgnoreCase("description")) {
                            new BlockingToolTip(this, bubble, getLabel("dPanel", bubble.getAttachedTo()));
                        } else if (panel.equalsIgnoreCase("plan")) {
                            System.out.println("Trying to add help in Plan. Msg: " + bubble.getMessage() + "  " + bubble.getAttachedTo());
                            new BlockingToolTip(this, bubble, getLabel("pPanel", bubble.getAttachedTo()));
                        } else if (panel.equalsIgnoreCase("calculations")) {
                            new BlockingToolTip(this, bubble, getLabel("cPanel", bubble.getAttachedTo()));
                        }
                    } catch (IllegalArgumentException e) {
                        System.err.println("Error creating bubble: " + e.getMessage());
                    }
                }
            }
        }
    }

    public JComponent getLabel(String panel, String attachedTo) {
        JComponent rPanel = null;
        if (panel.equalsIgnoreCase("dPanel")) {
            rPanel = dPanel.getLabel(attachedTo);
        } else if (panel.equalsIgnoreCase("pPanel")) {
            //      rPanel = pPanel.getLabel(attachedTo);
        } else if (panel.equalsIgnoreCase("cPanel")) {
            rPanel = cPanel.getLabel(attachedTo);
        }
        if (rPanel == null) {
            rPanel = getLabel(attachedTo);
        }
        if (rPanel == null) {
            // This is a bit ugly:  should create new exception type.
            throw new IllegalArgumentException("panel=" + panel + " not found; attachedTo=" + attachedTo);
        }
        return rPanel;
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

        switch (tabPane.getSelectedIndex()) {
            case DESCRIPTION:
                activityLogs.debug("Check button pressed for Description Panel");
                if (ApplicationContext.isCoachedMode()) {
                    checkDescriptionPanelCoached(correctSolution);
                } else {

                    checkDescriptionPanel(correctSolution);
                }
                break;

            case PLAN:
                activityLogs.debug("Check button pressed for Plan Panel");
                checkPlanPanel(correctSolution);
                break;

            case CALCULATIONS:
                activityLogs.debug("Check button pressed for Calculations Panel");
                checkCalculationsPanel(correctSolution);
        }

        // Refreshing Graph
        MainWindow.refreshGraph();
    }//GEN-LAST:event_checkButtonActionPerformed

    // This is string name of tab used in problem xml to
    // specify help bubbles and used in logging
    private String getTabName(int id) {
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
                activityLogs.debug("Giveup button pressed for Description Panel");
                List<HelpBubble> bubbles = ApplicationContext.getHelp(ApplicationContext.getCorrectSolution().getTargetNodes().getFirstNextNode(openVertex), "DESCRIPTION", "descFilled");
                if (!bubbles.isEmpty()) {
                    for (HelpBubble bubble : bubbles) {
                        bubble.setDisplayed(true);
                    }
                }
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
                tabPane.setEnabledAt(PLAN, true);
                tabPane.setForegroundAt(PLAN, Color.BLACK);
                addHelpBalloon(openVertex.getName(), "descCheckDemo", "DESCRIPTION");
                break;

            case PLAN:
                activityLogs.debug("Giveup button pressed for Plan Panel");
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
                activityLogs.debug("Giveup button pressed for Calculations Panel");
                //  cPanel.setCheckedBackground(new Color(240, 240, 240));
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
                break;

        }
        MainWindow.refreshGraph();
    }//GEN-LAST:event_demoButtonActionPerformed
    public JComponent getLabel(String label) {
        // Hash table should be created earlier; See Bug #2085
        Map<String, JComponent> map = new HashMap<String, JComponent>();
        map.put("tabPane", tabPane);
        map.put("checkButton", getCheckButton());
        map.put("giveUpButton", demoButton);
        map.put("buttonCancel", buttonCancel);
        //map.put("editorMsgLabel", editorMsgLabel);
        map.put("tabPanel", tabPanel);
        if (map.containsKey(label)) {
            return map.get(label);
        } else {
            return null;
        }
    }

    private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
        closeNodeEditor();
    }//GEN-LAST:event_buttonCancelActionPerformed

    private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
        activityLogs.debug("User pressed Enter button for Node '" + openVertex.getName() + "'");
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
