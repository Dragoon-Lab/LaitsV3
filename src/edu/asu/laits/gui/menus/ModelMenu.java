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
import edu.asu.laits.gui.ForumViewPanel;
import edu.asu.laits.gui.GraphViewPanel;
import edu.asu.laits.gui.GraphViewPanel.Mode;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.nodeeditor.NodeEditorView;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.LaitsSolutionExporter;
import edu.asu.laits.model.ModelEvaluationException;
import edu.asu.laits.model.ModelEvaluator;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.filechooser.FileFilter;
import org.apache.log4j.Logger;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.DefaultPort;

/**
 * Menu for all Model Functionalities. Contains Menu Items for Run Model,
 * TimeRangeEditor and Solution File Generation.
 *
 * @author rptiwari
 *
 */
public class ModelMenu extends JMenu {

    private JMenuItem addNodeMenuItem = null;
    private JMenuItem editTimeRangeMenuItem = null;
    private JMenuItem exportSolutionMenuItem = null;
    private JMenuItem showForumMenuItem = null;
    private JMenu deleteNodeMenu = null;
    private JMenuItem showGraphMenuItem = null;
    private static GraphEditorPane graphPane;
    private static MainWindow mainWindow;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private HashMap<String, JMenuItem> menuMap = new HashMap<String, JMenuItem>();
    private JFileChooser saveAsFileChooser = null;
    //delete 
    private Object[][] data;
    private String[] columnNames;
    //delete above
    public static String graph;

    /**
     * This method initializes
     *
     */
    public ModelMenu(GraphEditorPane pane, MainWindow main) {
        super();
        graphPane = pane;
        mainWindow = main;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setText("Model");
        this.setMnemonic(KeyEvent.VK_M);
        this.add(getAddNodeMenuItem());
        this.add(getDeleteNodeMenu());
        this.add(getShowGraphMenuItem());
        this.add(getshowForumMenuItem());

        if (ApplicationContext.isAuthorMode()) {
            this.add(getExportSolutionMenuItem());
            this.add(getEditTimeRangeMenuItem());
            this.setGraph();
        }
        disableShowGraphMenu();
        disableDeleteNodeMenu();
    }

    /**
     * This method initializes addNodeMenuItem
     *
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

    private JMenu getDeleteNodeMenu() {
        if (deleteNodeMenu == null) {
            deleteNodeMenu = new JMenu("Delete Node");

        }

        return deleteNodeMenu;
    }

    /**
     * This method initializes runModelMenuItem
     *
     */
    private JMenuItem getShowGraphMenuItem() {
        if (showGraphMenuItem == null) {
            showGraphMenuItem = new JMenuItem();
            showGraphMenuItem.setText("Show Graph");
            showGraphMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug("User pressed Run Model Button.");
                    showNodeGraph();
                }
            });
        }
        return showGraphMenuItem;
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
                    activityLogs.debug("User pressed Export Solution Button.");
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
                    activityLogs.debug("User pressed Edit Time Range Button.");
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

    public void showNodeGraph() {
        activityLogs.debug("User pressed Run Model button.");

        if (runModel()) {
            showChartDialog(Mode.Graph);
        }
    }

    public void showNodeTable() {
        activityLogs.debug("User pressed Show Table button.");

        if (runModel()) {
            showChartDialog(Mode.Table);
//            showTableDialog();
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
                    me.run();
                    dumpTableValues(me);

                    if (ApplicationContext.isStudentMode()
                            || ApplicationContext.isCoachedMode()) {
                        me.validateStudentGraph();
                    }

                    window.getStatusBarPanel().setStatusMessage("", true);
                    activityLogs.debug("Model ran successfully.");

                    // Enable Done Button
                    if (ApplicationContext.isProblemSolved()) {
                        mainWindow.getModelToolBar().enableDoneButton();
                    }

                } catch (ModelEvaluationException ex) {
                    window.getStatusBarPanel().setStatusMessage(ex.getMessage(), false);
                }
                graphPane.repaint();
            } else {
                activityLogs.debug("Model had extra nodes, so user could not run the model.");
                JOptionPane.showMessageDialog(window, "Model has extra nodes in it, please remove them before running the model.");
            }

            return true;
        } else {
            activityLogs.debug("Model was incomplete, so user could not run the model.");
            JOptionPane.showMessageDialog(window, "The model is incomplete, please complete all the nodes before running Model");
            window.getStatusBarPanel().setStatusMessage("Please complete all the nodes before running Model", false);
            return false;
        }
    }

    private boolean isGraphPrepared() {
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

    /*
     *  This method is used to display table after
     *  running the model
     */
    private void showTableDialog() {
        /*
        try {
            JFrame tableValuesFrame = new JFrame("Node Table display");
            JPanel tableValuesPanel = new JPanel();
            tableValuesPanel.setLayout(new BorderLayout());

            if(data!=null && columnNames!=null)
            {
                JTable tableValuesTable = new JTable(data, columnNames);
                JScrollPane tableValuesContainer = new JScrollPane(tableValuesTable);

                tableValuesPanel.add(tableValuesContainer, BorderLayout.CENTER);
                tableValuesFrame.getContentPane().add(tableValuesPanel);

                tableValuesFrame.pack();
                tableValuesFrame.setVisible(true);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }*/

    }

    private void showChartDialog(Mode mode) {
        JDialog graphValuesDialog = new JDialog(MainWindow.getInstance(), true);
        GraphViewPanel gPanel = new GraphViewPanel(graphPane.getModelGraph(), graphValuesDialog,mode);
        graphValuesDialog.setTitle("Model Graph");
        graphValuesDialog.setSize(610, 530);
        graphValuesDialog.setLocationRelativeTo(null);

        graphValuesDialog.setResizable(false);
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
        activityLogs.debug("User Pressed Create Node Button");
        MainWindow window = MainWindow.getInstance();
        // Disable test as work-around for Bug #2218
        if(false && ApplicationContext.isCoachedMode() && !isGraphEmpty()){
            activityLogs.debug("User was not allowed to create new node as app is in COACHED mode and nodes already present");
            JOptionPane.showMessageDialog(window, "Create new nodes inside the Calculations tab of existing nodes");
            return;
            
        }
        if (notAllNodesDefined()) {
            activityLogs.debug("User is allowed to create a new node");
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());
            graphPane.addVertex(v);
            MainWindow.getInstance().getModelToolBar().disableDeleteNodeButton();
            disableDeleteNodeMenu();

            if (MainWindow.getInstance().isSituationSelected()) {
                logs.debug("Switching to Model Design Panel");
                MainWindow.getInstance().switchTutorModelPanels(false);
            }

            graphPane.repaint();
            NodeEditorView editor = new NodeEditorView(v);

        } else {
                activityLogs.debug("User was not allowed to create new node as all the nodes were already present");
                JOptionPane.showMessageDialog(window, "The model is already using all the correct nodes.");
            
        }
    }

    public void deleteNodeAction() {

        Object[] cells = graphPane.getSelectionCells();
        for (Object obj : cells) {
            DefaultGraphCell cell = (DefaultGraphCell) obj;
            Vertex v = (Vertex) cell.getUserObject();
            if (v != null) {
                activityLogs.debug("User pressed Delete button for Node " + v.getName());

                if (menuMap.get(v.getName()) != null) {
                    deleteNodeMenu.remove(menuMap.get(v.getName()));
                }

            }

        }

        graphPane.removeSelected();

        Iterator<Vertex> it = graphPane.getModelGraph().vertexSet().iterator();
        Vertex v;
        while (it.hasNext()) {
            v = it.next();
            //v.getCorrectValues().clear();
            v.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
        }

        activityLogs.debug("Closing NodeEditor because of Delete action.");
    }

    public void showForumButtonAction() {
        JDialog forumDialog = new JDialog(MainWindow.getInstance(), true);
        new ForumViewPanel(forumDialog);
        forumDialog.setTitle("Discussion Forum");
        forumDialog.setSize(610, 540);
        forumDialog.setLocationRelativeTo(null);

        forumDialog.setResizable(false);
        forumDialog.setVisible(true);

//        CellView[] test = graphPane.getGraphLayoutCache().getAllViews();
//        for(CellView v : test)
//            System.out.println("V : "+v);
    }

    public void addDeleteNodeMenu() {
        DefaultGraphCell cell = (DefaultGraphCell) graphPane.getSelectionCell();
        Vertex currentVertex = (Vertex) cell.getUserObject();

        JMenuItem menu = new JMenuItem(currentVertex.getName());
        menuMap.put(currentVertex.getName(), menu);

        menu.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(ActionEvent e) {

                JMenuItem m = (JMenuItem) e.getSource();

                Object[] cells = graphPane.getGraphLayoutCache().getCells(true, true, true, true);
                for (Object obj : cells) {
                    DefaultGraphCell cell = (DefaultGraphCell) obj;
                    Vertex v = (Vertex) cell.getUserObject();

                    if (v != null) {
                        //JMenuItem m = (JMenuItem)e.getSource();
                        if (v.getName() == m.getText()) {
                            graphPane.setSelectionCell(obj);
                            graphPane.removeSelected();
                            deleteNodeMenu.remove(menuMap.get(v.getName()));
                        }

                    }
                }
            }
        });
        deleteNodeMenu.add(menu);
    }

    public void removeAllDeleteMenu() {
        deleteNodeMenu.removeAll();
    }

    public void enableDeleteNodeMenu() {
        deleteNodeMenu.setEnabled(true);
    }

    public void disableDeleteNodeMenu() {
        deleteNodeMenu.setEnabled(false);
    }

    public void enableShowGraphMenu() {
        showGraphMenuItem.setEnabled(true);
    }

    public void disableShowGraphMenu() {
        showGraphMenuItem.setEnabled(false);
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
        activityLogs.debug("User pressed EditTimeRange Menu Item.");
        GraphRangeEditor ed = new GraphRangeEditor(graphPane, true);
        ed.setVisible(true);
    }

    public void doneButtonAction() {
        activityLogs.debug("User Pressed Done button with current task as " + ApplicationContext.getCurrentTaskID());
        writeResultToServer();
        System.exit(0);
    }

    private void createGivenModel(TaskSolution solution, GraphEditorPane editorPane) {
        List<SolutionNode> givenNodes = solution.getGivenNodes();

        for (SolutionNode node : givenNodes) {
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());

            v.setName(node.getNodeName());
            v.setCorrectDescription(node.getCorrectDescription());
            v.setPlan(node.getNodePlan());
            v.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            v.setPlanStatus(Vertex.PlanStatus.CORRECT);
            v.setEquation(node.getNodeEquation());
            v.setInitialValue(node.getInitialValue());

            v.setVertexType(node.getNodeType());

//            if (solution.checkNodeInputs(node.getNodeName(), node.getInputNodes()) == 0) {
//                v.setInputsStatus(Vertex.InputsStatus.CORRECT);
//            } else {
//                v.setInputsStatus(Vertex.InputsStatus.INCORRECT);
//            }

            if (solution.checkNodeCalculations(v)) {
                v.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            } else {
                v.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }

            editorPane.addVertex(v);
        }

        for (SolutionNode node : givenNodes) {
            List<String> inputVertices = node.getInputNodes();
            for (String vertexName : inputVertices) {
                Vertex v1 = editorPane.getModelGraph().getVertexByName(node.getNodeName());
                Vertex v2 = editorPane.getModelGraph().getVertexByName(vertexName);

                DefaultPort p1 = editorPane.getJGraphTModelAdapter().getVertexPort(v1);
                DefaultPort p2 = editorPane.getJGraphTModelAdapter().getVertexPort(v2);

                editorPane.insertEdge(p2, p1);
            }
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
        int returnVal = getSaveAsFileChooser().showSaveDialog(getRootPane());
        if (returnVal == JFileChooser.APPROVE_OPTION) {

            File selectedFile = getSaveAsFileChooser().getSelectedFile();

            if (!selectedFile.getName().matches("(.*)(\\.xml)")) {

                if (selectedFile.getName().matches("\".*\"")) {
                    if (selectedFile.getName().length() < 3) {
                        JOptionPane
                                .showMessageDialog(
                                getRootPane(),
                                "Can not save to file "
                                + selectedFile
                                .getAbsolutePath()
                                + "\nBecause of the following reason:\n"
                                + "File name is too short.",
                                "Unable to save file",
                                JOptionPane.ERROR_MESSAGE);
                        return;
                    } else {
                        selectedFile = new File(selectedFile.getParent()
                                + File.separator
                                + selectedFile.getName()
                                .substring(
                                1,
                                (int) (selectedFile.getName()
                                .length() - 2)));
                    }
                } else {
                    selectedFile = new File(selectedFile.getAbsoluteFile()
                            + ".xml");
                }
            }

            saveToFile(selectedFile);
        }
    }

    /**
     * Tries to save to the specified file
     */
    private void saveToFile(File file) {
        LaitsSolutionExporter exporter = new LaitsSolutionExporter(graphPane.getModelGraph(), file);
        exporter.export();
    }

    /**
     * Updates graph String (used for saving authored problems to the server)
     */
    public static void updateGraph() {
        ModelMenu mm = new ModelMenu(graphPane, mainWindow);
        mm.setGraph();
    }

    /**
     * Retrieves graph String (used for saving authored problems to the server)
     */
    private void setGraph() {
        LaitsSolutionExporter graphBuilder = new LaitsSolutionExporter(graphPane.getModelGraph(), null);
        graph = graphBuilder.getXML();
    }

    private JFileChooser getSaveAsFileChooser() {
        if (saveAsFileChooser == null) {
            saveAsFileChooser = new JFileChooser();
            saveAsFileChooser.setDialogTitle("Export Model as LAITS Solution...");
            saveAsFileChooser.setAcceptAllFileFilterUsed(true);
            saveAsFileChooser.addChoosableFileFilter(new FileFilter() {
                @Override
                public boolean accept(File f) {
                    return f.getName().matches(".*.xml");
                }

                @Override
                public String getDescription() {
                    return "Laits Solution Files (*.xml)";
                }
            });
        }
        return saveAsFileChooser;
    }
}
