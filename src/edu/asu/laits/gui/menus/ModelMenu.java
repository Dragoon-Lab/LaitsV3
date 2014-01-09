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
package edu.asu.laits.gui.menus;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphRangeEditor;
import edu.asu.laits.gui.ExportSolutionPanel;
import edu.asu.laits.gui.GraphViewPanel;
import edu.asu.laits.gui.GraphViewPanel.ChartDialogMode;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.nodeeditor.NodeEditorView;
import edu.asu.laits.logger.UserActivityLog;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.ModelEvaluationException;
import edu.asu.laits.model.ModelEvaluator;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.model.PersistenceManager;
import java.awt.Desktop;
import java.awt.event.KeyEvent;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import javax.swing.JDialog;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JScrollPane;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

/**
 * Menu for all Model Functionalities. 
 * Contains Menu Items for Run Model, TimeRangeEditor and Solution File Generation.
 *
 * @author rptiwari
 *
 */
public class ModelMenu extends JMenu {

    private JMenuItem addNodeMenuItem = null;
    private JMenuItem editTimeRangeMenuItem = null;
    private JMenuItem exportSolutionMenuItem = null;
    private JMenuItem showForumMenuItem = null;
    private JMenuItem deleteNodeMenuItem = null;
    private JMenuItem showGraphMenuItem = null;
    private JMenuItem showGraphTableItem = null;
    private static GraphEditorPane graphPane;
    private static MainWindow mainWindow;
    
    //delete 
    private Object[][] data;
    private String[] columnNames;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    /**
     * This method initializes
     */
    public ModelMenu(GraphEditorPane pane, MainWindow main) {
        super();
        graphPane = pane;
        mainWindow = main;
        initialize();
    }

    /**
     * Initializes all the MenuItems and attaches actions to each menu item
     */
    private void initialize() {
        this.setText("Model");
        this.setMnemonic(KeyEvent.VK_M);
        this.add(getAddNodeMenuItem());
        this.add(getDeleteNodeMenu());
        this.add(getShowGraphMenuItem());
        this.add(getShowTableMenuItem());
        this.add(getshowForumMenuItem());

        if (ApplicationContext.isAuthorMode()) {
            this.add(getExportSolutionMenuItem());
            this.add(getEditTimeRangeMenuItem());
        }
        // disableShowGraphMenu();         - why ?
    }

    /**
     * This method initializes addNodeMenuItem
     */
    private JMenuItem getAddNodeMenuItem() {
        if (addNodeMenuItem == null) {
            addNodeMenuItem = new JMenuItem();
            addNodeMenuItem.setText("Create Node ");

            addNodeMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    newNodeAction();
                }
            });
        }
        return addNodeMenuItem;
    }

    /**
     * Provides Delete Node menu items and attaches action listener.
     * The action is called from GraphEditorPane
     * @return 
     */
    private JMenuItem getDeleteNodeMenu() {
        if (deleteNodeMenuItem == null) {
            deleteNodeMenuItem = new JMenuItem("Delete Node");
            deleteNodeMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    deleteNodeAction();
                }
            });
        }

        return deleteNodeMenuItem;
    }

    /**
     * This method initializes runModelMenuItem.
     *
     */
    private JMenuItem getShowGraphMenuItem() {
        if (showGraphMenuItem == null) {
            showGraphMenuItem = new JMenuItem();
            showGraphMenuItem.setText("Show Graph");
            showGraphMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    showNodeGraph();
                }
            });
        }
        return showGraphMenuItem;
    }
    
    /**
     * This method initializes Show Table Menu Item in Model Menu and attaches action to it.
     * The action is defined in this class and is used by ModelToolBar as well.
     */
    private JMenuItem getShowTableMenuItem() {
        if (showGraphTableItem == null) {
            showGraphTableItem = new JMenuItem();
            showGraphTableItem.setText("Show Table");
            showGraphTableItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Show Table Button."));
                    showNodeTable();
                }
            });
        }
        return showGraphTableItem;
    }

    /**
     * This method initializes selectOtherSelectionMenuItem
     */
    private JMenuItem getExportSolutionMenuItem() {
        if (exportSolutionMenuItem == null) {
            exportSolutionMenuItem = new JMenuItem();
            exportSolutionMenuItem.setText("Export Solution");
            exportSolutionMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Export Solution Button."));
                    exportSolution();
                }
            });
        }
        return exportSolutionMenuItem;
    }

    /**
     * This method initializes selectNeighbourSelectionMenuItem
     *
     */
    private JMenuItem getEditTimeRangeMenuItem() {
        if (editTimeRangeMenuItem == null) {
            editTimeRangeMenuItem = new JMenuItem();
            editTimeRangeMenuItem.setText("Edit Time Range ");
            editTimeRangeMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Edit Time Range Button."));
                    editTimeRangeAction();
                }
            });
        }
        return editTimeRangeMenuItem;
    }

    /**
     * This method initializes selectOtherSelectionMenuItem
     */
    private JMenuItem getshowForumMenuItem() {
        if (showForumMenuItem == null) {
            showForumMenuItem = new JMenuItem();
            showForumMenuItem.setText("Show Forum");
            showForumMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    showForumButtonAction();
                }
            });
        }
        return showForumMenuItem;
    }

    public boolean isGraphable() {
        if (!ApplicationContext.isAuthorMode()) {
            if (ApplicationContext.getCorrectSolution().getNodeCount() == 1) {
                return true;
            }
        }

        Graph<Vertex, Edge> graph = (Graph) graphPane.getModelGraph();
        boolean isGraphable = false;
        for (Vertex currentVertex : graph.vertexSet()) {
            if (!currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
                isGraphable = true;
                return isGraphable;
            }
        }
        return isGraphable;
    }

    public void showNodeGraph() {
        if (runModel()) {
            if(isGraphable())
                showChartDialog(ChartDialogMode.Graph);
            else
                JOptionPane.showMessageDialog(MainWindow.getInstance(), "This model does not contain any functions or accumulators. There is nothing to graph yet");
        }
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Show Graph Button. Is problem Solved: " + ApplicationContext.isProblemSolved() ));
    }

    public void showNodeTable() {
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Show Table button."));

        if (runModel()) {
            if(isGraphable())
                    showChartDialog(ChartDialogMode.Table);
                else
                    JOptionPane.showMessageDialog(MainWindow.getInstance(), "This model does not contain any functions or accumulators. There is nothing to show yet.");

        }
    }

    private void dumpTableValues(ModelEvaluator me) {
        try {
            double startTime = me.getTimes().getStartTime();
            double timeStep=me.getTimes().getTimeStep();
            int totalPoints = me.getTimes().getNumberSteps();
            int constantVertices = me.getConstantVertices();
            Vertex currentVertex = null;
            DecimalFormat decimalFormat = new DecimalFormat("#.##"); 

            List<Vertex> vertexList = me.returnArrangedVertexList();

            columnNames = new String[vertexList.size() - constantVertices + 1];

            columnNames[0] = "Time";
            int index = 1;
            for (int i = constantVertices; i < vertexList.size(); i++) {
                columnNames[index] = vertexList.get(i).getName();
                index++;
            }

            data = new Object[totalPoints][vertexList.size() - constantVertices + 1];

            double time=startTime,temp;
            for (int i = 0; i < totalPoints; i++,time+=timeStep) {
                // data[i][0] will always correspond to timestamp
                // Set timestamp value (i) if j=0
                data[i][0] = (float) time;
                index = 1;
                for (int j = constantVertices; j < vertexList.size(); j++) {
                    currentVertex = vertexList.get(j);

                     temp=currentVertex.getCorrectValues().get(i);
                     data[i][index] = (float) temp;
                    index++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public boolean runModel() {
        // Check if Model has already been executed and is still valid
        if (isGraphPrepared()) {
            return true;
        }

        ModelEvaluator me = new ModelEvaluator((Graph) graphPane.getModelGraph());
        MainWindow window = MainWindow.getInstance();
        if (me.isModelComplete()) {
            if (!me.hasExtraNodes()) {
                try {
                    // Pre process test mode nodes are they were not processed in check/demo
                    if(ApplicationContext.isTestMode()) {
                        me.processTestModeNodes();
                    }
                    
                    me.run();
                    dumpTableValues(me);

                    if (!ApplicationContext.isAuthorMode()) {
                        me.validateStudentGraph();
                    }

                    window.getStatusBarPanel().setStatusMessage("", true);
                    activityLogs.debug(new UserActivityLog(UserActivityLog.CLIENT_MESSAGE,"Model ran successfully."));                    

                } catch (ModelEvaluationException ex) {
                    window.getStatusBarPanel().setStatusMessage(ex.getMessage(), false);
                }
                MainWindow.refreshGraph();
            } else {
                activityLogs.debug(new UserActivityLog(UserActivityLog.CLIENT_MESSAGE, "Model had extra nodes, so user could not run the model."));
                JOptionPane.showMessageDialog(window, "Model has extra nodes in it, please remove them before running the model.");
            }

            return true;
        } else {
            activityLogs.debug(new UserActivityLog(UserActivityLog.CLIENT_MESSAGE, "Model was incomplete, so user could not run the model."));
            JOptionPane.showMessageDialog(window, "The model is incomplete, please complete all the nodes before running Model");
            window.getStatusBarPanel().setStatusMessage("Please complete all the nodes before running Model", false);
            return false;
        }
    }

    private boolean isGraphPrepared() {
        logs.info("Checking if Graph has already been prepared.");
        boolean isEnable = true;

        Iterator<Vertex> allVertices = graphPane.getModelGraph().vertexSet().iterator();
        while (allVertices.hasNext()) {
            Vertex v = allVertices.next();
            if (v.getGraphsStatus().equals(Vertex.GraphsStatus.UNDEFINED)) {
                isEnable = false;
                break;
            }
        }

        return isEnable;
    }

    private void showChartDialog(ChartDialogMode mode) {
        logs.debug("Showing Chart dialog with Mode : " + mode);
        JDialog graphValuesDialog = new JDialog(MainWindow.getInstance(), true);
        GraphViewPanel gPanel = new GraphViewPanel(graphPane.getModelGraph(), graphValuesDialog, mode);
        graphValuesDialog.setTitle("Model Graph");
        graphValuesDialog.setSize(610, 530);
        graphValuesDialog.setLocationRelativeTo(null);
        graphValuesDialog.setVisible(true);
    }

    public void menuSelectionChanged(boolean value) {
        super.menuSelectionChanged(value);
        if (value) {
            Object[] selectedVertices = graphPane.getSelectionCells(graphPane
                    .getGraphLayoutCache().getCells(false, true, false, false));

            getEditTimeRangeMenuItem().setEnabled(true);
        }
    }

    public void newNodeAction() {
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User Pressed Create Node Button"));
        MainWindow window = MainWindow.getInstance();
        // Disable test as work-around for Bug #2218
        if(false && ApplicationContext.isCoachedMode() && !isGraphEmpty()){
            activityLogs.debug(new UserActivityLog(UserActivityLog.CLIENT_MESSAGE, "User was not allowed to create new node as app is in COACHED mode and nodes already present"));
            JOptionPane.showMessageDialog(window, "Create new nodes inside the Calculations tab of existing nodes");
            return;
            
        }
        if (notAllNodesDefined()) {
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());
            graphPane.addVertex(v);            
            graphPane.repaint();
            NodeEditorView editor = new NodeEditorView(v);
        } else {
            activityLogs.debug(new UserActivityLog(UserActivityLog.CLIENT_MESSAGE, "User was not allowed to create new node as all the nodes were already present"));            
            JOptionPane.showMessageDialog(window, "The model is already using all the correct nodes.");            
        }
    }

    public void showForumButtonAction() {
        // The forum id is sent to the application
        String forumURL = ApplicationContext.getForumURL();
        
         //add variables to send
        List<NameValuePair> postVariable = new ArrayList<NameValuePair>();
        postVariable.add(new BasicNameValuePair("problem", ApplicationContext.getCurrentTaskID()));
        // Only include author and section for custom problems
        // For published problems, only need problem name.
        if(ApplicationContext.getAuthor() != null && ApplicationContext.getAuthor().length() > 0){
            postVariable.add(new BasicNameValuePair("section", ApplicationContext.getSection()));
            postVariable.add(new BasicNameValuePair("author", ApplicationContext.getAuthor()));
        } 
        try {
            // It would be more elegant to use HttpURLConnection
            // as done in sendHTTPRequest
           forumURL += "?" + PersistenceManager.getQuery(postVariable);
       } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        // Always print to console:
        System.out.println("forum URL:"+forumURL);

        try {
            Desktop.getDesktop().browse(new URL(forumURL).toURI());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void deleteNodeAction(){
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed Delete Node button."));
        MainWindow.getInstance().getGraphEditorPane().deleteSelectedNodes();
    }

    public void enableShowGraphMenu() {
        showGraphMenuItem.setEnabled(true);
    }

    public void disableShowGraphMenu() {
        showGraphMenuItem.setEnabled(false);
    }

    public void enableDeleteNodeMenu(){
        deleteNodeMenuItem.setEnabled(true);
    }
    
    public void disableDeleteNodeMenu(){
        deleteNodeMenuItem.setEnabled(false);
    }
    
    public void enableShowForumMenuItem() {
        showForumMenuItem.setEnabled(true);
    }
    
    public void disableShowForumMenuItem() {
        showForumMenuItem.setEnabled(false);
    }
    
    // This is really a property of the student graph
    // and doesn't have anything to do with the menus.
    // It should be moved elsewhere; Bug #2160  
    public boolean notAllNodesDefined() {
        if (ApplicationContext.isAuthorMode()) {
            return true;
        }

        // Go through the solution graph and find any vertices that
        // don't have a match in the student graph.
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        boolean noMatch = false;
        if (ApplicationContext.getAppMode().equals("COACHED")) {
            if (!isGraphEmpty()) {
                return noMatch;
            }
        }
        List<String> names = solution.getCorrectNodeNames();
        for (String n : names) {
            if (graphPane.getModelGraph().getVertexByName(n) == null) {
                noMatch = true;
                break;
            }
        }

        return noMatch;
    }

    public boolean isGraphEmpty() {
        if (graphPane.getModelGraph().isEmpty()) {
            return true;
        } else {
            return false;
        }

    }

    public void editTimeRangeAction() {
        activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, "User pressed EditTimeRange Menu Item."));
        GraphRangeEditor ed = new GraphRangeEditor(graphPane, true);
        ed.setVisible(true);
    }

    public void doneButtonAction() {
        if(ApplicationContext.isProblemSolved()){
            activityLogs.debug(new UserActivityLog(UserActivityLog.CLOSE_PROBLEM, "Task ' " + ApplicationContext.getCurrentTaskID() + "' is completed" ));
            writeResultToServer();
            System.exit(0);
        }
    }

    private void writeResultToServer() {
        logs.debug("Student " + ApplicationContext.getUserID() + " Completed Task: " + ApplicationContext.getCurrentTaskID());
    }

    public MainWindow getMainWindow() {
        return mainWindow;
    }

    /**
     * Export Author's Graph as a LAITS Solution File
     */
    private void exportSolution() {
        JDialog exportSolutionDialog = new JDialog(MainWindow.getInstance(), true);
        exportSolutionDialog.setTitle("Export Laits Solution");
        JScrollPane panelScroll = new JScrollPane(new ExportSolutionPanel(exportSolutionDialog));
        exportSolutionDialog.getContentPane().add(panelScroll);
        
        exportSolutionDialog.setSize(630, 700);
        exportSolutionDialog.setLocationRelativeTo(null);

        exportSolutionDialog.setResizable(false);
        exportSolutionDialog.setVisible(true);
    }

}
