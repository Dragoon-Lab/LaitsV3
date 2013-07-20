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
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Insets;
import java.awt.Toolkit;
import java.util.logging.Level;
import javax.swing.JOptionPane;
import javax.swing.UIManager;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultGraphCell;

/**
 *
 * @author ramayantiwari
 */
public class NodeEditor extends javax.swing.JDialog {

    private DescriptionPanelView dPanel;
    private PlanPanelView pPanel;
    private InputsPanelView iPanel;
    private CalculationsPanelView cPanel;
    //Tab Pane Indexes
    public static final int DESCRIPTION = 0;
    public static final int PLAN = 1;
    public static final int INPUTS = 2;
    public static final int CALCULATIONS = 3;
    private boolean extraTabEvent;
    private int selectedTab;
    private GraphEditorPane graphPane;
    private Vertex currentVertex;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    /**
     * Creates new form NodeEditor2
     */
    public NodeEditor(GraphEditorPane editorPane, boolean modal) {
        super(editorPane.getMainFrame(), false);
        graphPane = editorPane;
        DefaultGraphCell gc = (DefaultGraphCell) graphPane.getSelectionCell();
        currentVertex = (Vertex) gc.getUserObject();
        initComponents();
        UIManager.getDefaults().put("TabbedPane.contentBorderInsets", new Insets(2, 0, -1, 0));
        setTabListener();
        initNodeEditor();

        initializeBalloon();
    }

    private void initNodeEditor() {
        logs.debug("Initializing NodeEditor");
        activityLogs.debug("NodeEditor opened for Node '" + currentVertex.getName() + "'");
        displayEnterButton();
        showCreateNodeButtonInputTab(false);
        initTabs(true);
        setTitle(getNodeEditorTitle());
        setEditorMessage("", true);
        prepareNodeEditorDisplay();
        if (ApplicationContext.getAppMode().equals("COACHED")) {
            buttonCancel.setEnabled(false);
        }

        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {
                closeNodeEditor();
            }
        });

    }

    private String getNodeEditorTitle(){
        String title = "Node Editor - ";
        if(currentVertex.getName().equals(""))
            title += "New Node";
        else
            title += currentVertex.getName();
        
        return title;
    }
    /**
     * Attach BalloonTip at the start of Node Editor
     */
    private void initializeBalloon() {
//        HelpBubble bubble = ApplicationContext.getHelp(String.valueOf(ApplicationContext.getCurrentOrder()), "Description", "onLoad");
//        if (bubble != null) {
//           new BlockingToolTip(this, bubble.getMessage(), dPanel.getLabel(bubble.getAttachedTo()),0,0);
//        }
        //new BlockingToolTip(this, "Start by selecting a description..", dPanel.getLabel("evenMorePreciseLabel"),0,0);
    }

    private void prepareNodeEditorDisplay() {
        logs.debug("Preparing Node Editor Display");
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        double width = screenSize.getWidth();
        double height = screenSize.getHeight();
        int yPositionNodeEditor = (int) (height - getPreferredSize().height);
        int xPositionNodeEditor =
                (int) currentVertex.getXPosition() + 140 + getPreferredSize().width > width
                ? (int) (width - getPreferredSize().width) : (int) currentVertex.getXPosition() + 140;
        setBounds(xPositionNodeEditor, yPositionNodeEditor / 2,
                getPreferredSize().width, getPreferredSize().height);
        pack();

        setVisible(true);
        setResizable(false);

        if (ApplicationContext.getAppMode().equals("COACHED")) {
            if (!currentVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT)
                    && !currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
                tabPane.setEnabledAt(INPUTS, false);
                tabPane.setForegroundAt(INPUTS, Color.GRAY);
            }
            if (!currentVertex.getInputsStatus().equals(Vertex.InputsStatus.CORRECT)
                    && !currentVertex.getInputsStatus().equals(Vertex.InputsStatus.GAVEUP)) {
                tabPane.setEnabledAt(CALCULATIONS, false);
                tabPane.setForegroundAt(CALCULATIONS, Color.GRAY);
            }
        }

    }

    public void initTabs(boolean newNode) {
        logs.debug("Initializing NodeEditor Tabs - Start");

        dPanel = new DescriptionPanelView(this);
        pPanel = new PlanPanelView(this);

        iPanel = new InputsPanelView(this);
        cPanel = new CalculationsPanelView(this);

        activityLogs.debug("Vertex Details before opening node editor ");
        activityLogs.debug(dPanel.printDescriptionPanelDetails());
        //activityLogs.debug(pPanel.printPlanPanel());
        activityLogs.debug(iPanel.printInputsPanel());
        activityLogs.debug(cPanel.printCalculationPanel());

        descriptionPanel.setLayout(new java.awt.GridLayout(1, 1));
        descriptionPanel.add(dPanel);

        planPanel.setLayout(new java.awt.GridLayout(1, 1));
        planPanel.add(pPanel);

        inputsPanel.setLayout(new java.awt.GridLayout(1, 1));
        inputsPanel.add(iPanel);

        calculationPanel.setLayout(new java.awt.GridLayout(1, 1));
        calculationPanel.add(cPanel);

        setSelectedPanel();

        logs.debug("Initializing NodeEditor Tabs - End");
    }

    private void setSelectedPanel() {

        if (!currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)
                && !currentVertex.getInputsStatus().equals(Vertex.InputsStatus.INCORRECT)) {
            logs.debug("setting calc panel as current");
            activityLogs.debug("Node Editor is opend with Calculations Tab for Node: " + currentVertex.getName());
            selectedTab = CALCULATIONS;
            showCreateNodeButtonInputTab(false);
            tabPane.setSelectedIndex(CALCULATIONS);
        } else if (!currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)
                && !currentVertex.getPlanStatus().equals(Vertex.PlanStatus.INCORRECT)) {
            logs.debug("Setting Inputs Panel as Current");
            activityLogs.debug("Node Editor is opend with Inputs Tab for Node: " + currentVertex.getName());
            selectedTab = INPUTS;
            showCreateNodeButtonInputTab(true);
            tabPane.setSelectedIndex(INPUTS);
        } else if (!currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)
                && !currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            System.out.println("Setting Plan as current");
            logs.debug("Setting Plan Panel as Current");
            activityLogs.debug("Node Editor is opend with Plan Tab for Node: " + currentVertex.getName());
            selectedTab = PLAN;
            showCreateNodeButtonInputTab(false);
            tabPane.setSelectedIndex(PLAN);
        } else {
            logs.debug("Setting Desc Panel as Current");
            activityLogs.debug("Node Editor is opend with Description Tab for Node: " + currentVertex.getName());
            selectedTab = DESCRIPTION;
            showCreateNodeButtonInputTab(false);
            tabPane.setSelectedIndex(DESCRIPTION);
        }


        setCheckGiveupButtons();
    }

    private void setTabListener() {
        logs.debug("Setting Tab Listener");

        tabPane.addChangeListener(new ChangeListener() {
            // Set the Tab of Node Editor according to the finished Tabs
            public void stateChanged(ChangeEvent e) {

                // If clicking on same Tab - Do nothing
                if (tabPane.getSelectedIndex() == selectedTab) {
                    extraTabEvent = false;
                    return;
                }
                activityLogs.debug("User Trying to Change Tab to " + getTabName(tabPane.getSelectedIndex())
                        + " Previous Tab was " + getTabName(selectedTab));

                if (extraTabEvent) {
                    logs.debug("Exiting because of extraTabEvent");
                    extraTabEvent = false;
                    return;
                }

                if (ApplicationContext.getAppMode().equals("AUTHOR")) {
                    processEditorInput();
                } else {
                    if (!isCurrentPanelChecked() && ApplicationContext.getAppMode().equals("COACHED")) {
                        activityLogs.debug("User tried switching Tab without using Check or Giveup ");
                        setEditorMessage("Please use Check or Giveup buttons before proceeding.", true);
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                }

                if (tabPane.getSelectedIndex() == DESCRIPTION) {
                    activityLogs.debug("User Is in the Description Tab ");
                    setEditorMessage("", true);
                    selectedTab = DESCRIPTION;
                    if (currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT)
                            || currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
                        dPanel.setEditableTree(false);
                    }
                    showCreateNodeButtonInputTab(false);
                } else if (tabPane.getSelectedIndex() == PLAN) {
                    showCreateNodeButtonInputTab(false);
                    if (pPanel.isViewEnabled()) {
                        activityLogs.debug("User Is in the Plan Tab ");
                        setEditorMessage("", true);
                        selectedTab = PLAN;
                        if (currentVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT)
                                || currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
                            pPanel.setEditableRadio(false);
                        }
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } else if (tabPane.getSelectedIndex() == INPUTS) {
                    if (iPanel.isViewEnabled()) {
                        showCreateNodeButtonInputTab(true);
                        activityLogs.debug("User Is in the Inputs Tab ");
                        setEditorMessage("", true);
                        selectedTab = INPUTS;
                        if (currentVertex.getInputsStatus().equals(Vertex.InputsStatus.CORRECT)
                                || currentVertex.getInputsStatus().equals(Vertex.InputsStatus.GAVEUP)) {
                            iPanel.setEditableInputs(false);
                        }
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
                    showCreateNodeButtonInputTab(false);
                    if (cPanel.isViewEnabled()) {
                        activityLogs.debug("User Is in the Calculations Tab ");
                        setEditorMessage("", true);
                        selectedTab = CALCULATIONS;
                        if (currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)
                                || currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)) {
                            cPanel.setEditableCalculations(false);
                        }
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                }
                setCheckGiveupButtons();
                logs.debug("Tab Stage Changed Action - Ends");
            }
        });
        logs.debug("Setting Tab Listener -Ends");
    }

    private boolean isCurrentPanelChecked() {
        boolean result = true;

        if (selectedTab == CALCULATIONS
                && currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED)) {
            result = false;
        }

        if (selectedTab == INPUTS
                && currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)) {
            result = false;
        }

        if (selectedTab == PLAN
                && currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)) {
            result = false;
        }

        if (selectedTab == DESCRIPTION
                && currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)) {
            result = false;
        }

        return result;
    }

    private boolean processEditorInput() {

        if (selectedTab == DESCRIPTION) {
            if (dPanel.processDescriptionPanel()) {
                logs.debug("Saving Description Panel");
                getInputsPanel().updateNodeDescription();
                currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
                editorMsgLabel.setText("");
            } else {
                extraTabEvent = true;
                currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
                tabPane.setSelectedIndex(DESCRIPTION);
                return false;
            }
        } else if (selectedTab == PLAN) {

            if (pPanel.processPlanPanel()) {
                logs.debug("Saving PLAN Panel");
                currentVertex.setPlanStatus(Vertex.PlanStatus.CORRECT);
                editorMsgLabel.setText("");
            } else {
                extraTabEvent = true;
                currentVertex.setPlanStatus(Vertex.PlanStatus.INCORRECT);
                tabPane.setSelectedIndex(PLAN);
                return false;
            }
        } else if (selectedTab == INPUTS) {

            if (iPanel.processInputsPanel()) {
                logs.debug("Saving INPUTS Panel");
                editorMsgLabel.setText("");
                currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);
                cPanel.initPanel();
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(INPUTS);
                currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
                return false;
            }
        } else if (selectedTab == CALCULATIONS) {

            if (cPanel.processCalculationsPanel()) {
                logs.debug("Saving CALCULATIONS Panel");
                editorMsgLabel.setText("");
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            } else {
                extraTabEvent = true;
                tabPane.setSelectedIndex(CALCULATIONS);
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
                return false;
            }
        }



        return true;
    }

    /**
     * Method responsible for Enabling and Disabling Check/Giveup buttons based
     * on the use case
     */
    private void setCheckGiveupButtons() {
        logs.debug("Setting Check and Giveup Button for Tab " + selectedTab);

        if ((ApplicationContext.getAppMode().equals("STUDENT") || ApplicationContext.getAppMode().equals("COACHED"))) {
            logs.debug("Enabling Check and Giveup");
            this.checkButton.setEnabled(true);
            this.giveUpButton.setEnabled(true);

            String taskPhase = ApplicationContext.getCorrectSolution().getPhase();

            // Disable Giveup in Challege tasks
            if (taskPhase.equalsIgnoreCase("Challenge")) {
                this.giveUpButton.setEnabled(false);
            }

            if (selectedTab == DESCRIPTION) {
                if (currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
                    giveUpButton.setEnabled(false);
                    checkButton.setEnabled(false);
                }
            } else if (selectedTab == PLAN) {
                if (currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
                    giveUpButton.setEnabled(false);
                    checkButton.setEnabled(false);
                }
            } else if (selectedTab == INPUTS) {
                if (currentVertex.getInputsStatus().equals(Vertex.InputsStatus.GAVEUP)) {
                    giveUpButton.setEnabled(false);
                    checkButton.setEnabled(false);
                }
            } else if (selectedTab == CALCULATIONS) {
                if (currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)) {
                    giveUpButton.setEnabled(false);
                    checkButton.setEnabled(false);
                }
            }

        } else {
            logs.debug("Disabling Check and Giveup");
            this.checkButton.setEnabled(false);
            this.giveUpButton.setEnabled(false);
        }
    }

    public void setEditorMessage(String msg, boolean err) {
        editorMsgLabel.setText(msg);
        if (err) {
            editorMsgLabel.setForeground(Color.RED);
        } else {
            editorMsgLabel.setForeground(Color.BLUE);
        }
        editorMsgLabel.setVisible(true);
    }

    private void checkDescriptionPanel(TaskSolution correctSolution) {
        // Save Description Panel Information in the Vertex Object
        if (!dPanel.processDescriptionPanel()) {
            return;
        }

        if (correctSolution.checkNodeName(dPanel.getNodeName())) {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            //graphPane.getMainFrame().getMainMenu().getModelMenu().addDeleteNodeMenu();
            setEditorMessage("", false);
            dPanel.setTextFieldBackground(Color.GREEN);
            activityLogs.debug("User entered correct description");
            dPanel.setEditableTree(false);
            tabPane.setEnabledAt(PLAN, true);
            tabPane.setForegroundAt(PLAN, Color.BLACK);
        } else {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model. Please select another description.", true);
            activityLogs.debug("User entered incorrect description");
        }

        setTitle(currentVertex.getName());
        validate();
        repaint();
    }

    private void checkDescriptionPanelCoached(TaskSolution correctSolution) {
        // Save Description Panel Information in the Vertex Object
        if (!dPanel.processDescriptionPanel()) {
            return;
        }
        int solutionCheck = correctSolution.checkNodeNameOrdered(dPanel.getNodeName(), ApplicationContext.getCurrentOrder());
        if (solutionCheck == 1) {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            //graphPane.getMainFrame().getMainMenu().getModelMenu().addDeleteNodeMenu();
            setEditorMessage("", false);
            dPanel.setTextFieldBackground(Color.GREEN);
            activityLogs.debug("User entered correct description");
            dPanel.setEditableTree(false);
            ApplicationContext.nextCurrentOrder();
            tabPane.setEnabledAt(PLAN, true);
            tabPane.setForegroundAt(PLAN, Color.BLACK);
        } else if (solutionCheck == 2) {
            dPanel.setTextFieldBackground(Color.CYAN);
            setEditorMessage("That quantity used in this model, but now is not the right time to define it. Please select another description.", true);
            activityLogs.debug("User entered description out of order");
        } else {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("That quantity is not used in the correct model. Please select another description.", true);
            activityLogs.debug("User entered incorrect description");

        }


        setTitle(currentVertex.getName());
        validate();
        repaint();
    }

    private void checkPlanPanel(TaskSolution correctSolution) {
        logs.debug("Checking Plan Panel");
        if (correctSolution.checkNodePlan(dPanel.getNodeName(), pPanel.getSelectedPlan())) {
            pPanel.setSelectedPlanBackground(Color.GREEN);
            setEditorMessage("", false);
            currentVertex.setPlanStatus(Vertex.PlanStatus.CORRECT);
            activityLogs.debug("User entered correct Plan");
            iPanel.updateNodeDescription();
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(INPUTS, true);
            tabPane.setForegroundAt(INPUTS, Color.BLACK);
        } else {
            pPanel.setSelectedPlanBackground(Color.RED);
            setEditorMessage("You have selected incorrect Plan for this Node.", true);
            activityLogs.debug("User entered incorrect Plan");
            currentVertex.setPlanStatus(Vertex.PlanStatus.INCORRECT);
        }
        // Save Selected Plan to the Vertex Object
        pPanel.processPlanPanel();
        activityLogs.debug("User checked plan panel with node plan as " + pPanel.getSelectedPlan());
    }

    private void checkInputsPanel(TaskSolution correctSolution) {
        iPanel.processInputsPanel();
        iPanel.setInputsTypeBackground(new Color(240, 240, 240));
        iPanel.setInputValuesBackground(new Color(240, 240, 240));
      
        int result = 0;

        if (iPanel.getValueButtonSelected()) {
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), null);
        } else if (iPanel.getInputsButtonSelected()) {
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), iPanel.getSelectedInputsList());
        }

        if (result == 0 || result == 3) {
            if (result == 0) {
                iPanel.setInputsTypeBackground(Color.GREEN);
            } else {
                iPanel.setInputsTypeBackground(Color.GREEN);
                iPanel.setInputValuesBackground(Color.GREEN);
            }

            setEditorMessage("", false);
            activityLogs.debug("User entered correct Inputs");
            currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);
            iPanel.setEditableInputs(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
        } else {
            if (result == 1) {
                iPanel.setInputsTypeBackground(Color.RED);
            } else {
                iPanel.setInputsTypeBackground(Color.GREEN);
                iPanel.setInputValuesBackground(Color.RED);
            }

            activityLogs.debug("User entered incorrect Inputs");
            if (iPanel.getSelectedInputsList().isEmpty() & iPanel.getInputsButtonSelected()) {
                setEditorMessage("No inputs are created or selected.", true);
            } else {
                setEditorMessage("Your Inputs are Incorrect.", true);
            }
            currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
        }
        activityLogs.debug("User checked Inputs Panel with Type: " + currentVertex.getVertexType());
        cPanel.initPanel();
    }

    private void checkCalculationsPanel(TaskSolution correctSolution) {
        // Check Parsing Errors and Set Student's Equation in Vertex
        cPanel.processCalculationsPanel();
        cPanel.setCheckedBackground(new Color(240, 240, 240));
        // Check for fixed value
        if (correctSolution.checkNodeCalculations(currentVertex)) {
            cPanel.setCheckedBackground(Color.GREEN);
            setEditorMessage("", false);
            activityLogs.debug("User entered correct Calculations.");
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            cPanel.setEditableCalculations(false);
            buttonCancel.setEnabled(true);
        } else {
            cPanel.setCheckedBackground(Color.RED);
            setEditorMessage("You Calculations are Inorrect.", true);
            activityLogs.debug("User entered incorrect Calculations.");
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
        }

        activityLogs.debug("User checked calculations panel with Nodetype: " + currentVertex.getVertexType()
                + " Initial Value : " + currentVertex.getInitialValue() + " Calculations as " + currentVertex.getEquation());
    }

    private void processAuthorModeOKAction() {
        logs.debug("Processing Author Mode OK Button Action");
        if (dPanel.processDescriptionPanel()) {
            activityLogs.debug(dPanel.printDescriptionPanelDetails());
            if (pPanel.processPlanPanel()) {
                activityLogs.debug(pPanel.printPlanPanel());
                if (iPanel.processInputsPanel()) {
                    logs.debug("Setting Inputs completely");
                    activityLogs.debug(iPanel.printInputsPanel());
                    currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);
                    if (cPanel.processCalculationsPanel()) {
                        currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
                    } else {
                        currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
                    }
                    activityLogs.debug(cPanel.printCalculationPanel());
                } else {
                    logs.debug("Setting input incompletely");
                    currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
                }
                graphPane.repaint();
            }
            this.dispose();
        }
    }

    private void processTutorModeOKAction() {
        logs.debug("Processing Tutor Mode OK Button Action");
        if (!isCheckGiveupButtonUsed()) {
            activityLogs.debug("User pressed OK without using Check or Giveup button");
            return;
        }
        activityLogs.debug("Closing NodeEditor because of OK action.");
        this.dispose();
    }

    private boolean isCheckGiveupButtonUsed() {
        logs.debug("Verifying if Check or Giveup button was used");

        if (tabPane.getSelectedIndex() == DESCRIPTION
                && currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)) {
            showUndefinedTabErr();
            return false;
        }

        if (tabPane.getSelectedIndex() == PLAN
                && currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED)) {
            showUndefinedTabErr();
            return false;
        }

        if (tabPane.getSelectedIndex() == INPUTS
                && currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED)) {
            showUndefinedTabErr();
            return false;
        }

        if (tabPane.getSelectedIndex() == CALCULATIONS
                && currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED)) {
            showUndefinedTabErr();
            return false;
        }

        return true;
    }

    private void showUndefinedTabErr() {
        this.editorMsgLabel.setText("Please use Check or Giveup buttons before exiting");
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

    private void refreshGraphPane() {
        graphPane.getMainFrame().validate();
        graphPane.getMainFrame().repaint();
    }

    /**
     * Make necessary clean up and save graph session when NodeEditor closes
     */
    private void closeNodeEditor() {

        activityLogs.debug("User pressed Close button for Node " + currentVertex.getName());
        // Delete this vertex if its not defined and user hits Cancel
        if (currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED) || 
                currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            graphPane.removeSelected();
        }

        activityLogs.debug("Closing NodeEditor because of Close action.");
        if (!ApplicationContext.getAppMode().equalsIgnoreCase("COACHED")) {
            graphPane.getMainFrame().getModelToolBar().enableDeleteNodeButton();
            graphPane.getMainFrame().getMainMenu().getModelMenu().enableDeleteNodeMenu();
        }
        
        // Save Student's session to server
        PersistenceManager.saveSession();
        
        this.dispose();
    }

    private void displayEnterButton() {
        if (ApplicationContext.getAppMode().equalsIgnoreCase("STUDENT") || ApplicationContext.getAppMode().equals("COACHED")) {
            buttonOK.hide();
        } else {
            buttonOK.show();
        }
    }

    private void showCreateNodeButtonInputTab(Boolean b) {
        buttonCreateNodeInputTab.setVisible(b);
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
        checkButton = new javax.swing.JButton();
        giveUpButton = new javax.swing.JButton();
        buttonCancel = new javax.swing.JButton();
        buttonOK = new javax.swing.JButton();
        editorMsgLabel = new javax.swing.JLabel();
        bottomSpacer = new javax.swing.JLabel();
        buttonCreateNodeInputTab = new javax.swing.JButton();

        setDefaultCloseOperation(javax.swing.WindowConstants.DO_NOTHING_ON_CLOSE);

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
        descriptionPanel.setPreferredSize(new java.awt.Dimension(506, 615));
        descriptionPanel.setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());
        tabPane.addTab("Description", descriptionPanel);

        org.jdesktop.layout.GroupLayout planPanelLayout = new org.jdesktop.layout.GroupLayout(planPanel);
        planPanel.setLayout(planPanelLayout);
        planPanelLayout.setHorizontalGroup(
            planPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 601, Short.MAX_VALUE)
        );
        planPanelLayout.setVerticalGroup(
            planPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Plan", planPanel);

        org.jdesktop.layout.GroupLayout inputsPanelLayout = new org.jdesktop.layout.GroupLayout(inputsPanel);
        inputsPanel.setLayout(inputsPanelLayout);
        inputsPanelLayout.setHorizontalGroup(
            inputsPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 601, Short.MAX_VALUE)
        );
        inputsPanelLayout.setVerticalGroup(
            inputsPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Inputs", inputsPanel);

        org.jdesktop.layout.GroupLayout calculationPanelLayout = new org.jdesktop.layout.GroupLayout(calculationPanel);
        calculationPanel.setLayout(calculationPanelLayout);
        calculationPanelLayout.setHorizontalGroup(
            calculationPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 601, Short.MAX_VALUE)
        );
        calculationPanelLayout.setVerticalGroup(
            calculationPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Calculations", calculationPanel);

        checkButton.setText("Check");
        checkButton.setEnabled(false);
        checkButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                checkButtonActionPerformed(evt);
            }
        });

        giveUpButton.setText("Demo");
        giveUpButton.setActionCommand("Give Up");
        giveUpButton.setEnabled(false);
        giveUpButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                giveUpButtonActionPerformed(evt);
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

        editorMsgLabel.setFont(new java.awt.Font("Lucida Grande", 0, 12)); // NOI18N
        editorMsgLabel.setForeground(new java.awt.Color(255, 0, 0));
        editorMsgLabel.setText("jLabel1");

        buttonCreateNodeInputTab.setText("Create Node");
        buttonCreateNodeInputTab.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCreateNodeInputTabActionPerformed(evt);
            }
        });

        org.jdesktop.layout.GroupLayout layout = new org.jdesktop.layout.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(layout.createSequentialGroup()
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(layout.createSequentialGroup()
                        .addContainerGap()
                        .add(editorMsgLabel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 601, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .add(0, 0, Short.MAX_VALUE))
                    .add(org.jdesktop.layout.GroupLayout.TRAILING, layout.createSequentialGroup()
                        .add(0, 18, Short.MAX_VALUE)
                        .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 622, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap())
            .add(layout.createSequentialGroup()
                .add(15, 15, 15)
                .add(checkButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 82, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(18, 18, 18)
                .add(giveUpButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 78, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .add(buttonCreateNodeInputTab, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 106, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(32, 32, 32)
                .add(buttonOK, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 78, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(18, 18, 18)
                .add(buttonCancel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 78, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(20, 20, 20))
            .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                .add(layout.createSequentialGroup()
                    .add(10, 22, Short.MAX_VALUE)
                    .add(bottomSpacer, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 30, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(0, 594, Short.MAX_VALUE)))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(org.jdesktop.layout.GroupLayout.TRAILING, layout.createSequentialGroup()
                .addContainerGap(21, Short.MAX_VALUE)
                .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 552, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                .add(editorMsgLabel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 21, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING, false)
                    .add(checkButton, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .add(giveUpButton, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .add(buttonCancel, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .add(buttonOK, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 41, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(buttonCreateNodeInputTab, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                .addContainerGap())
            .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                .add(layout.createSequentialGroup()
                    .add(0, 628, Short.MAX_VALUE)
                    .add(bottomSpacer, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 10, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(0, 15, Short.MAX_VALUE)))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void checkButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_checkButtonActionPerformed
        // Action for Check Button
        logs.debug("Handling Check Action");
        TaskSolution correctSolution = ApplicationContext.getCorrectSolution();

        if (tabPane.getSelectedIndex() == DESCRIPTION) {
            activityLogs.debug("Check button pressed for Description Panel");
            if (ApplicationContext.getAppMode().equals("COACHED")) {
                checkDescriptionPanelCoached(correctSolution);
            } else {

                checkDescriptionPanel(correctSolution);
            }
        } else if (tabPane.getSelectedIndex() == PLAN) {
            activityLogs.debug("Check button pressed for Plan Panel");
            checkPlanPanel(correctSolution);
        } else if (tabPane.getSelectedIndex() == INPUTS) {
            activityLogs.debug("Check button pressed for Inputs Panel");

            checkInputsPanel(correctSolution);
        } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
            activityLogs.debug("Check button pressed for Calculations Panel");
            checkCalculationsPanel(correctSolution);
        }

        // Refreshing Graph
        refreshGraphPane();
    }//GEN-LAST:event_checkButtonActionPerformed

    public String getTabName(int id) {
        if (id == DESCRIPTION) {
            return "DESCRIPTION";
        } else if (id == PLAN) {
            return "PLAN";
        } else if (id == INPUTS) {
            return "INPUTS";
        } else if (id == CALCULATIONS) {
            return "CALCULATIONS";
        } else {
            return "";
        }
    }

    private void giveUpButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_giveUpButtonActionPerformed
        // Action for Giveup Button
        editorMsgLabel.setText("");
        if (tabPane.getSelectedIndex() == DESCRIPTION) {
            activityLogs.debug("Giveup button pressed for Description Panel");
            dPanel.giveUpDescriptionPanel();
            dPanel.processDescriptionPanel();
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
            setTitle(currentVertex.getName());
            //graphPane.getMainFrame().getMainMenu().getModelMenu().addDeleteNodeMenu();
            validate();
            repaint();
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
            dPanel.setEditableTree(false);
            tabPane.setEnabledAt(PLAN, true);
            tabPane.setForegroundAt(PLAN, Color.BLACK);
        } else if (tabPane.getSelectedIndex() == PLAN) {
            activityLogs.debug("Giveup button pressed for Plan Panel");
            pPanel.giveUpPlanPanel();
            pPanel.processPlanPanel();
            currentVertex.setPlanStatus(Vertex.PlanStatus.GAVEUP);
            iPanel.updateNodeDescription();
            pPanel.setEditableRadio(false);
            tabPane.setEnabledAt(INPUTS, true);
            tabPane.setForegroundAt(INPUTS, Color.BLACK);
        } else if (tabPane.getSelectedIndex() == INPUTS) {
            activityLogs.debug("Giveup button pressed for Inputs Panel");

            iPanel.setInputsTypeBackground(new Color(240, 240, 240));
            iPanel.setInputValuesBackground(new Color(240, 240, 240));
            if (iPanel.giveUpInputsPanel()) {
                iPanel.processInputsPanel();
                currentVertex.setInputsStatus(Vertex.InputsStatus.GAVEUP);
                buttonCreateNodeInputTab.setEnabled(false);
            } else {
                currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
            }
            cPanel.initPanel();
            iPanel.setEditableInputs(false);
            tabPane.setEnabledAt(CALCULATIONS, true);
            tabPane.setForegroundAt(CALCULATIONS, Color.BLACK);
        } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
            activityLogs.debug("Giveup button pressed for Calculations Panel");
            cPanel.setCheckedBackground(new Color(240, 240, 240));
            if (cPanel.giveUpCalculationsPanel()) {
                cPanel.processCalculationsPanel();
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.GAVEUP);
                cPanel.setEditableCalculations(false);
                buttonCancel.setEnabled(true);
            } else {
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }
        }
        checkButton.setEnabled(false);
        giveUpButton.setEnabled(false);
        refreshGraphPane();
    }//GEN-LAST:event_giveUpButtonActionPerformed

    public void refreshInputs() {
        iPanel.refreshInputs();
    }

    private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
        closeNodeEditor();
    }//GEN-LAST:event_buttonCancelActionPerformed

    private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
        activityLogs.debug("User pressed Enter button for Node '" + currentVertex.getName() + "'");
        /*
         * if (ApplicationContext.getAppMode().equalsIgnoreCase("STUDENT")) {
         * processTutorModeOKAction(); } else
         */ {
            processAuthorModeOKAction();
        }

    }//GEN-LAST:event_buttonOKActionPerformed

    private void buttonCreateNodeInputTabActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCreateNodeInputTabActionPerformed
        // TODO add your handling code here:
        // Process Cancel Action for all the Tabs
        activityLogs.debug("User pressed Create node button on inputs tab for Node " + currentVertex.getName());
        if (graphPane.getMainFrame().getMainMenu().getModelMenu().newNodeAllowed()) {
            this.checkButton.setEnabled(true);
            this.giveUpButton.setEnabled(true);
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());
            graphPane.addVertex(v);

            CreateNewNodeDialog newNodeDialog = new CreateNewNodeDialog(this, v);

        } else {
            activityLogs.debug("User was not allowed to create new node as all the nodes were already present");
            JOptionPane.showMessageDialog(this, "The model is already using all the correct nodes.");
        }
    }//GEN-LAST:event_buttonCreateNodeInputTabActionPerformed

    private void tabPaneMouseDragged(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseDragged
    }//GEN-LAST:event_tabPaneMouseDragged

    private void tabPaneMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseClicked
    }//GEN-LAST:event_tabPaneMouseClicked
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel bottomSpacer;
    private javax.swing.JButton buttonCancel;
    private javax.swing.JButton buttonCreateNodeInputTab;
    private javax.swing.JButton buttonOK;
    private javax.swing.JPanel calculationPanel;
    private javax.swing.JButton checkButton;
    private javax.swing.JPanel descriptionPanel;
    private javax.swing.JLabel editorMsgLabel;
    private javax.swing.JButton giveUpButton;
    private javax.swing.JPanel inputsPanel;
    private javax.swing.JPanel planPanel;
    private javax.swing.JTabbedPane tabPane;
    // End of variables declaration//GEN-END:variables
}
