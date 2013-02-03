/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Insets;
import java.awt.Robot;
import java.awt.event.InputEvent;
import java.util.Iterator;
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
    }

    private void initNodeEditor() {
        logs.debug("Initializing NodeEditor");

        initTabs(true);
        setTitle(currentVertex.getName());
        setEditorMessage("");
        prepareNodeEditorDisplay();
    }

    private void prepareNodeEditorDisplay() {
        logs.debug("Preparing Node Editor Display");
        setBounds((int)currentVertex.getXPosition()+150,
                (int)currentVertex.getYPosition()+50,
                getPreferredSize().width, getPreferredSize().height);
        pack();

        setVisible(true);
        setResizable(false);

        /*setBounds(getToolkit().getScreenSize().width - 662,
         100,
         getPreferredSize().width, getPreferredSize().height);*/
    }

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
        //extraTabEvent = true;
        
        if (gPanel.isViewEnabled()) {
            gPanel.loadGraph();
            selectedTab = GRAPH;
            tabPane.setEnabledAt(GRAPH, true);
            tabPane.setSelectedIndex(GRAPH);
            tabPane.setForegroundAt(GRAPH, Color.BLACK);
        } else {
            tabPane.setEnabledAt(GRAPH, false);
            tabPane.setForegroundAt(GRAPH, Color.GRAY);

            if (!currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED) &&
                    !currentVertex.getInputsStatus().equals(Vertex.InputsStatus.INCORRECT)) {
                logs.debug("setting calc panel as current");
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.UNDEFINED);
                selectedTab = CALCULATIONS;
                tabPane.setSelectedIndex(CALCULATIONS);
            } 
            else if (!currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED) &&
                    !currentVertex.getPlanStatus().equals(Vertex.PlanStatus.INCORRECT)) {
                logs.debug("Setting Inputs Panel as Current");
                currentVertex.setInputsStatus(Vertex.InputsStatus.UNDEFINED);
                selectedTab = INPUTS;
                tabPane.setSelectedIndex(INPUTS);
            } 
            else if (!currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED) &&
                    !currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
                logs.debug("Setting Plan Panel as Current");
                currentVertex.setPlanStatus(Vertex.PlanStatus.UNDEFINED);
                selectedTab = PLAN;
                tabPane.setSelectedIndex(PLAN);
            } 
            else {
                logs.debug("Setting Desc Panel as Current");
                currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.UNDEFINED);
                selectedTab = DESCRIPTION;
                tabPane.setSelectedIndex(DESCRIPTION);
            }
        }
        
        setCheckGiveupButtons();
    }
    
    private void setTabListener() {
        logs.debug("Setting Tab Listener");

        tabPane.addChangeListener(new ChangeListener() {
            // Set the Tab of Node Editor according to the finished Tabs
            public void stateChanged(ChangeEvent e) {

                // If clicking on same Tab - Do nothing
                if(tabPane.getSelectedIndex() == selectedTab)
                    return ;
                
                logs.error("Trying to Change Tab to " + tabPane.getSelectedIndex() + 
                        " Previous Tab was " + selectedTab);

                if (extraTabEvent) {
                    logs.debug("Exiting because of extraTabEvent");
                    extraTabEvent = false;
                    return;
                }
                
                if(ApplicationContext.getAppMode().equals("AUTHOR"))
                    processEditorInput();
                else{
                    if(!isCurrentPanelChecked()){
                        setEditorMessage("Please use Check or Giveup buttons before proceeding.");
                        //extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                }
                
                if (tabPane.getSelectedIndex() == DESCRIPTION) {
                    setEditorMessage("");
                    dPanel.resetTextFieldBackground();
                    selectedTab = DESCRIPTION;
                    currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.UNDEFINED);
                } 
                else if (tabPane.getSelectedIndex() == PLAN) {
                    if (pPanel.isViewEnabled()) {
                        setEditorMessage("");
                        pPanel.resetBackGroundColor();
                        selectedTab = PLAN;  
                        currentVertex.setPlanStatus(Vertex.PlanStatus.UNDEFINED);
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } 
                else if (tabPane.getSelectedIndex() == INPUTS) {
                    if (iPanel.isViewEnabled()) {
                        setEditorMessage("");
                        iPanel.resetOptionPanelBackground();
                        selectedTab = INPUTS;
                        currentVertex.setInputsStatus(Vertex.InputsStatus.UNDEFINED);
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                } 
                else if (tabPane.getSelectedIndex() == CALCULATIONS) {
                    if (cPanel.isViewEnabled()) {
                        setEditorMessage("");
                        cPanel.resetBackgroundColor();
                        selectedTab = CALCULATIONS;
                        currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.UNDEFINED);
                    } else {
                        extraTabEvent = true;
                        tabPane.setSelectedIndex(selectedTab);
                        return;
                    }
                }else if(tabPane.getSelectedIndex() == GRAPH){
                    if(gPanel.isViewEnabled()){
                        setEditorMessage("");
                        selectedTab = GRAPH;
                    }else {
                        //extraTabEvent = true;
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

    private boolean isCurrentPanelChecked(){
        boolean result = true;
        
        if(selectedTab == CALCULATIONS && 
                currentVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.UNDEFINED))
            result = false;
        
        if(selectedTab == INPUTS && 
                currentVertex.getInputsStatus().equals(Vertex.InputsStatus.UNDEFINED))
            result = false;
        
        if(selectedTab == PLAN && 
                currentVertex.getPlanStatus().equals(Vertex.PlanStatus.UNDEFINED))
            result = false;
        
        if(selectedTab == DESCRIPTION && 
                currentVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED))
            result = false;
        
        return result;
    }
    
    private boolean processEditorInput() {
        if (selectedTab == GRAPH) {
            logs.debug("Selected Tab is Graph - DOING NOTHING");
            selectedTab = tabPane.getSelectedIndex();
        } else {
            if (selectedTab == DESCRIPTION) {
                if (dPanel.processDescriptionPanel()) {
                    logs.debug("Saving Description Panel");
                    getInputsPanel().updateNodeDescription();
                    getGraphsPanel().updateDescription();
                    editorMsgLabel.setText("");                    
                } else {
                    extraTabEvent = true;
                    tabPane.setSelectedIndex(DESCRIPTION);
                    return false;
                }
            } else if (selectedTab == PLAN) {

                if (pPanel.processPlanPanel()) {
                    logs.debug("Saving PLAN Panel");
                    editorMsgLabel.setText("");                    
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
        }

        return true;
    }

    

    private void setCheckGiveupButtons(){
        if (ApplicationContext.getAppMode().equals("STUDENT") &&
                selectedTab != GRAPH) {
            logs.debug("Enabling Check and Giveup");
            this.checkButton.setEnabled(true);
            this.giveUpButton.setEnabled(true);
        }else{
            logs.debug("Disabling Check and Giveup");
            this.checkButton.setEnabled(false);
            this.giveUpButton.setEnabled(false);
        }
    }

    public void setEditorMessage(String msg) {
        editorMsgLabel.setText(msg);
        editorMsgLabel.setVisible(true);
    }

    private void checkDescriptionPanel(TaskSolution correctSolution) {
        // Save Description Panel Information in the Vertex Object
        if(!dPanel.processDescriptionPanel())
            return;
        
        if (correctSolution.checkNodeName(dPanel.getNodeName())) {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            dPanel.setTextFieldBackground(Color.GREEN);
            setEditorMessage("You have selected correct Node.");
        } else {
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.INCORRECT);
            dPanel.setTextFieldBackground(Color.RED);
            setEditorMessage("You have selected an incorrect Node.");
        }

        setTitle(currentVertex.getName());
        validate();
        repaint();
    }

    private void checkPlanPanel(TaskSolution correctSolution) {
        logs.debug("Checking Plan Panel");
        if (correctSolution.checkNodePlan(dPanel.getNodeName(), pPanel.getSelectedPlan())) {
            pPanel.setSelectedPlanBackground(Color.GREEN);
            currentVertex.setPlanStatus(Vertex.PlanStatus.CORRECT);
            iPanel.updateNodeDescription();
        } else {
            pPanel.setSelectedPlanBackground(Color.RED);
            currentVertex.setPlanStatus(Vertex.PlanStatus.INCORRECT);
        }
        // Save Selected Plan to the Vertex Object
        pPanel.processPlanPanel();
    }

    private void checkInputsPanel(TaskSolution correctSolution) {
        iPanel.processInputsPanel();

        boolean result = false;
        if (iPanel.getValueButtonSelected()) {
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), null);
        } else if (iPanel.getInputsButtonSelected()) {
            result = correctSolution.checkNodeInputs(dPanel.getNodeName(), iPanel.getSelectedInputsList());
        }

        if (result) {
            iPanel.setOptionPanelBackground(Color.GREEN);
            currentVertex.setInputsStatus(Vertex.InputsStatus.CORRECT);            
        } else {
            iPanel.setOptionPanelBackground(Color.RED);
            currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
        }
        cPanel.initPanel();
    }

    private void checkCalculationsPanel(TaskSolution correctSolution) {
        // Check Parsing Errors and Set Student's Equation in Vertex
        cPanel.processCalculationsPanel();

        // Check for fixed value
        if (correctSolution.checkNodeCalculations(currentVertex)) {
            cPanel.setCheckedBackground(Color.GREEN);
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
        } else {
            cPanel.setCheckedBackground(Color.RED);
            currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
        }
    }

    private void processAuthorModeOKAction() {
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

    private void processTutorModeOKAction() {
        logs.debug("Processing Tutor Mode OK Button Action");
        if (!isCheckGiveupButtonUsed()) {
            return;
        }

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

    public GraphsPanelView getGraphsPanel() {
        return gPanel;
    }
    
    private void referehGraphPane(){
        graphPane.getMainFrame().validate();
        graphPane.getMainFrame().repaint();
    }
    
    private void setFocusOnGraph(){
        try{
        Robot r = new Robot();
        r.mouseMove((int)currentVertex.getXPosition()+150,
                (int)currentVertex.getYPosition()+50);
        r.mousePress(InputEvent.BUTTON1_MASK);
        Thread.sleep(100);  
        
        r.mouseRelease(InputEvent.BUTTON1_MASK);
        }catch (Exception e) {
        
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
        descriptionPanel.setSize(new java.awt.Dimension(506, 615));

        org.jdesktop.layout.GroupLayout descriptionPanelLayout = new org.jdesktop.layout.GroupLayout(descriptionPanel);
        descriptionPanel.setLayout(descriptionPanelLayout);
        descriptionPanelLayout.setHorizontalGroup(
            descriptionPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 601, Short.MAX_VALUE)
        );
        descriptionPanelLayout.setVerticalGroup(
            descriptionPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 506, Short.MAX_VALUE)
        );

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

        graphsPanel.setPreferredSize(new java.awt.Dimension(611, 506));

        org.jdesktop.layout.GroupLayout graphsPanelLayout = new org.jdesktop.layout.GroupLayout(graphsPanel);
        graphsPanel.setLayout(graphsPanelLayout);
        graphsPanelLayout.setHorizontalGroup(
            graphsPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 601, Short.MAX_VALUE)
        );
        graphsPanelLayout.setVerticalGroup(
            graphsPanelLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 506, Short.MAX_VALUE)
        );

        tabPane.addTab("Graphs", graphsPanel);

        checkButton.setText("Check");
        checkButton.setEnabled(false);
        checkButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                checkButtonActionPerformed(evt);
            }
        });

        giveUpButton.setText("Give Up");
        giveUpButton.setEnabled(false);
        giveUpButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                giveUpButtonActionPerformed(evt);
            }
        });

        buttonCancel.setText("Cancel");
        buttonCancel.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonCancelActionPerformed(evt);
            }
        });

        buttonOK.setText("Ok");
        buttonOK.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonOKActionPerformed(evt);
            }
        });

        editorMsgLabel.setFont(new java.awt.Font("Lucida Grande", 0, 12)); // NOI18N
        editorMsgLabel.setForeground(new java.awt.Color(255, 0, 0));
        editorMsgLabel.setText("jLabel1");

        buttonDelete.setText("Delete Node");
        buttonDelete.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                buttonDeleteActionPerformed(evt);
            }
        });

        org.jdesktop.layout.GroupLayout layout = new org.jdesktop.layout.GroupLayout(getContentPane());
        getContentPane().setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(layout.createSequentialGroup()
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(layout.createSequentialGroup()
                        .add(15, 15, 15)
                        .add(checkButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 82, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .add(18, 18, 18)
                        .add(giveUpButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 78, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .add(92, 92, 92)
                        .add(buttonDelete, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 115, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .add(15, 15, 15)
                        .add(buttonCancel)
                        .add(14, 14, 14)
                        .add(buttonOK, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 91, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE))
                    .add(layout.createSequentialGroup()
                        .addContainerGap()
                        .add(editorMsgLabel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 601, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap(15, Short.MAX_VALUE))
            .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                .add(layout.createSequentialGroup()
                    .add(0, 0, Short.MAX_VALUE)
                    .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                        .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 622, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                        .add(layout.createSequentialGroup()
                            .add(10, 10, 10)
                            .add(bottomSpacer, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 30, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)))
                    .add(0, 0, Short.MAX_VALUE)))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(org.jdesktop.layout.GroupLayout.TRAILING, layout.createSequentialGroup()
                .addContainerGap(552, Short.MAX_VALUE)
                .add(editorMsgLabel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 21, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(checkButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 41, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(giveUpButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 41, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(buttonDelete, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 40, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(buttonCancel, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 41, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(buttonOK, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 41, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE))
                .addContainerGap())
            .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                .add(layout.createSequentialGroup()
                    .add(0, 0, Short.MAX_VALUE)
                    .add(tabPane, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 552, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(64, 64, 64)
                    .add(bottomSpacer, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 10, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                    .add(0, 0, Short.MAX_VALUE)))
        );

        pack();
    }// </editor-fold>//GEN-END:initComponents

    private void tabPaneMouseClicked(java.awt.event.MouseEvent evt) {//GEN-FIRST:event_tabPaneMouseClicked
    }//GEN-LAST:event_tabPaneMouseClicked

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
        
        // Refreshing Graph
        referehGraphPane();
    }//GEN-LAST:event_checkButtonActionPerformed

    private void giveUpButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_giveUpButtonActionPerformed
        // Action for Giveup Button
        if (tabPane.getSelectedIndex() == DESCRIPTION) {
            logs.debug("Handling Give up Action for DESCRIPTION Tab.");
            dPanel.giveUpDescriptionPanel();
            dPanel.processDescriptionPanel();
            setTitle(currentVertex.getName());
            validate();
            repaint();
            currentVertex.setDescriptionStatus(Vertex.DescriptionStatus.GAVEUP);
        } else if (tabPane.getSelectedIndex() == PLAN) {
            logs.debug("Handling Give up Action for PLAN Tab.");
            pPanel.giveUpPlanPanel();
            pPanel.processPlanPanel();
            currentVertex.setPlanStatus(Vertex.PlanStatus.GAVEUP);
            iPanel.updateNodeDescription();
        } else if (tabPane.getSelectedIndex() == INPUTS) {
            logs.debug("Handling Give up Action for INPUTS Tab.");

            if (iPanel.giveUpInputsPanel()) {
                iPanel.processInputsPanel();
                currentVertex.setInputsStatus(Vertex.InputsStatus.GAVEUP);
            } else {
                currentVertex.setInputsStatus(Vertex.InputsStatus.INCORRECT);
            }
            cPanel.initPanel();
        } else if (tabPane.getSelectedIndex() == CALCULATIONS) {
            logs.debug("Handling Give up Action for CALCULATIONS Tab.");
            if (cPanel.giveUpCalculationsPanel()) {
                cPanel.processCalculationsPanel();
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.GAVEUP);
            } else {
                currentVertex.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }
        }
        referehGraphPane();
    }//GEN-LAST:event_giveUpButtonActionPerformed

    private void buttonCancelActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonCancelActionPerformed
        // Process Cancel Action for all the Tabs

        // Delete this vertex if its not defined and user hits Cancel
        if (currentVertex.getName().equals("")) {
            graphPane.removeSelected();
        }

        this.dispose();
        setFocusOnGraph();
    }//GEN-LAST:event_buttonCancelActionPerformed

    private void buttonOKActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonOKActionPerformed
        if (ApplicationContext.getAppMode().equalsIgnoreCase("STUDENT")) {
            processTutorModeOKAction();
        } else {
            processAuthorModeOKAction();
        }
        setFocusOnGraph();
    }//GEN-LAST:event_buttonOKActionPerformed

    private void buttonDeleteActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_buttonDeleteActionPerformed
        // TODO add your handling code here:
        logs.debug("Delete Button Action Performed " + graphPane.getSelectionCount());
        graphPane.removeSelected();

        Iterator it = graphPane.getModelGraph().vertexSet().iterator();
        Vertex v;
        while (it.hasNext()) {
            v = (Vertex) it.next();
            v.getCorrectValues().clear();
            v.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
        }

        this.dispose();
        setFocusOnGraph();
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
