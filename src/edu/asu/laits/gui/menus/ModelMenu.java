package edu.asu.laits.gui.menus;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphRangeEditor;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.nodeeditor.NodeEditor;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.ModelEvaluationException;
import edu.asu.laits.model.ModelEvaluator;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskMenuItem;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.TaskSolutionReader;
import edu.asu.laits.model.Vertex;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
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
    private JMenuItem runModelMenuItem = null;
    private JMenuItem editTimeRangeMenuItem = null;
    private JMenuItem exportSolutionMenuItem = null;
    private JMenu deleteNodeMenu= null;
    private GraphEditorPane graphPane;
    private MainWindow mainWindow;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private HashMap<String,JMenuItem> menuMap = new HashMap<String,JMenuItem>();

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
        this.add(getRunModelMenuItem());
        this.add(getEditTimeRangeMenuItem());
        this.add(getExportSolutionMenuItem());

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
    
    private JMenu getDeleteNodeMenu()
    {
        if (deleteNodeMenu == null) 
        {
            deleteNodeMenu = new JMenu("Delete Node");
            
        }
        
        return deleteNodeMenu;
    }

    /**
     * This method initializes runModelMenuItem
     *
     */
    private JMenuItem getRunModelMenuItem() {
        if (runModelMenuItem == null) {
            runModelMenuItem = new JMenuItem();
            runModelMenuItem.setText("Run Model ");
            runModelMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug("User pressed Run Model Button.");
                    runModelAction();
                }
            });
        }
        return runModelMenuItem;
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
    private JMenuItem getExportSolutionMenuItem() {
        if (exportSolutionMenuItem == null) {
            exportSolutionMenuItem = new JMenuItem();
            exportSolutionMenuItem.setText("Export Solution");
            exportSolutionMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    activityLogs.debug("User pressed Export Solution Button.");
                }
            });
        }
        return exportSolutionMenuItem;
    }

    public void menuSelectionChanged(boolean value) {
        super.menuSelectionChanged(value);
        if (value) {
            Object[] selectedVertices = graphPane.getSelectionCells(graphPane
                    .getGraphLayoutCache().getCells(false, true, false, false));

            boolean verticesSelected = !((selectedVertices == null)
                    || (selectedVertices.length == 0));

            getEditTimeRangeMenuItem().setEnabled(true);
            getExportSolutionMenuItem().setEnabled(verticesSelected);
        }
    }

    public void newNodeAction() {
        activityLogs.debug("User Pressed Create Node Button");
        MainWindow window = (MainWindow) graphPane.getMainFrame();
        if (newNodeAllowed()) {
            activityLogs.debug("User is allowed to create a new node");
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());
            graphPane.addVertex(v);
            graphPane.getMainFrame().getModelToolBar().disableDeleteNodeButton();
            disableDeleteNodeMenu();

            if (graphPane.getMainFrame().isSituationSelected()) {
                logs.debug("Switing to Model Design Panel");
                graphPane.getMainFrame().switchTutorModelPanels(false);
            }

            graphPane.repaint();
            NodeEditor editor = new NodeEditor(graphPane, true);
        } else {
            activityLogs.debug("User was not allowed to create new node as all the nodes were already present");
            JOptionPane.showMessageDialog(window, "The model is already using all the correct nodes.");
            //window.getStatusBarPanel().setStatusMessage("Please complete all the nodes before running Model", false);
        }

    }
    
    public void deleteNodeAction()
    {
        
        Object[] cells = graphPane.getSelectionCells();
        for(Object obj:cells)
        {
            DefaultGraphCell cell = (DefaultGraphCell)obj;
            Vertex v = (Vertex)cell.getUserObject();
            if(v!=null)
            {
                activityLogs.debug("User pressed Delete button for Node "+v.getName());
                
                if(menuMap.get(v.getName())!=null)
                {
                    deleteNodeMenu.remove(menuMap.get(v.getName()));
                }
                
            }
            
        }
        
        //DefaultGraphCell cell = (DefaultGraphCell)graphPane.getSelectionCell();
        //Vertex currentVertex = (Vertex)cell.getUserObject();
        
        
        graphPane.removeSelected();

        Iterator it = graphPane.getModelGraph().vertexSet().iterator();
        Vertex v;
        while (it.hasNext()) {
            v = (Vertex) it.next();
            v.getCorrectValues().clear();
            v.setGraphsStatus(Vertex.GraphsStatus.UNDEFINED);
        }

        activityLogs.debug("Closing NodeEditor because of Delete action.");
        

    }
    
    public void addDeleteNodeMenu()
    {
        DefaultGraphCell cell = (DefaultGraphCell)graphPane.getSelectionCell();
        Vertex currentVertex = (Vertex)cell.getUserObject();
        
        JMenuItem menu = new JMenuItem(currentVertex.getName());
        menuMap.put(currentVertex.getName(), menu);
        
        
     
        
        
     menu.addActionListener(new java.awt.event.ActionListener() {

         
            public void actionPerformed(ActionEvent e) {
                
                JMenuItem m = (JMenuItem)e.getSource();
                
                Object[] cells = graphPane.getGraphLayoutCache().getCells(true, true, true, true);
                for(Object obj:cells)
                {
                    DefaultGraphCell cell = (DefaultGraphCell)obj;
                    Vertex v = (Vertex)cell.getUserObject();
                    
                    if(v!=null)
                    {
                        //JMenuItem m = (JMenuItem)e.getSource();
                        if(v.getName() == m.getText())
                        {
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
    
    public void removeAllDeleteMenu()
    {
        deleteNodeMenu.removeAll();
    }
    
    public void enableDeleteNodeMenu()
    {
        deleteNodeMenu.setEnabled(true);
    }
    
    public void disableDeleteNodeMenu()
    {
        deleteNodeMenu.setEnabled(false);
    }

    private boolean newNodeAllowed() {
        if(ApplicationContext.getAppMode().equals("AUTHOR"))
            return true;
        
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        if (graphPane.getModelGraph().vertexSet().size()
                < solution.getSolutionNodes().size()) {
            return true;
        }

        return false;
    }

    public void runModelAction() {
        activityLogs.debug("User pressed Run Model button.");
        ModelEvaluator me = new ModelEvaluator((Graph) graphPane.getModelGraph());
        MainWindow window = (MainWindow) graphPane.getMainFrame();
        if (me.isModelComplete()) {
            if (!me.hasExtraNodes()) {
                try {
                    me.run();

                    if (ApplicationContext.getAppMode().equals("STUDENT")) {
                        me.validateStudentGraph();
                    }

                    window.getStatusBarPanel().setStatusMessage("", true);
                    JOptionPane.showMessageDialog(MainWindow.getFrames()[0],
                            "Run Model Complete.",
                            "Success", JOptionPane.INFORMATION_MESSAGE);
                    activityLogs.debug("Model ran successfully.");
                    
                    // Enable Done Button
                    if(ApplicationContext.isProblemSolved()){
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
        } else {
            activityLogs.debug("Model was incomplete, so user could not run the model.");
            JOptionPane.showMessageDialog(window, "The model is incomplete, please complete all the nodes before running Model");
            window.getStatusBarPanel().setStatusMessage("Please complete all the nodes before running Model", false);
        }
    }

    public void editTimeRangeAction() {
        activityLogs.debug("User pressed EditTimeRange Menu Item.");
        GraphRangeEditor ed = new GraphRangeEditor(graphPane, true);
        ed.setVisible(true);
    }
    
    public void doneButtonAction(){
        activityLogs.debug("User Pressed Done button with current task as "+ApplicationContext.getCurrentTaskID());
        
        
        writeResultToServer();
        
        String currentTaskLevel = ApplicationContext.getTaskIdNameMap()
                .get(ApplicationContext.getCurrentTaskID()).getTaskLevel();
        int level = Integer.parseInt(currentTaskLevel);
        level++;
        
        String nextLevel = String.valueOf(level);
        Iterator<TaskMenuItem> it = ApplicationContext.getTaskIdNameMap().values().iterator();
        String nextTaskID = null;
        
        while(it.hasNext()){
            TaskMenuItem item = it.next();
            if(item.getTaskLevel().equals(nextLevel)){
                nextTaskID = item.getTaskId();
                break;
            }    
        }
        activityLogs.debug("User is being given the next task "+nextTaskID);
        ApplicationContext.setCurrentTaskID(nextTaskID);
        TaskSolutionReader solutionReader = new TaskSolutionReader();
        try{
            TaskSolution solution = solutionReader.loadSolution(nextTaskID);
            ApplicationContext.setCorrectSolution(solution);
            
            mainWindow.loadTaskDescription(ApplicationContext.getTaskIdNameMap().get(nextTaskID).getTaskName(),
                    solution.getTaskDescription(), 
                    solution.getImageURL());
            
            mainWindow.getGraphEditorPane().resetModelGraph();
            if(solution.getTaskType().equalsIgnoreCase("debug")){
                createGivenModel(solution, graphPane);
            }
            
            mainWindow.switchTutorModelPanels(true);
        }catch(Exception e){
            e.printStackTrace();
        }
        
        mainWindow.getModelToolBar().disableDoneButton();
    }
    
    private void createGivenModel(TaskSolution solution, GraphEditorPane editorPane){
        List<SolutionNode> givenNodes = solution.getGivenNodes();
        
        for(SolutionNode node : givenNodes){
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
            
            if(solution.checkNodeInputs(node.getNodeName(), node.getInputNodes()))
                v.setInputsStatus(Vertex.InputsStatus.CORRECT);
            else 
                v.setInputsStatus(Vertex.InputsStatus.INCORRECT);
            
            if(solution.checkNodeCalculations(v))
                v.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            else 
                v.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            
            editorPane.addVertex(v);
        }
        
        for(SolutionNode node : givenNodes){
            List<String> inputVertices = node.getInputNodes();
            for(String vertexName : inputVertices){
                Vertex v1 = editorPane.getModelGraph().getVertexByName(node.getNodeName());
                Vertex v2 = editorPane.getModelGraph().getVertexByName(vertexName);
                
                DefaultPort p1 = editorPane.getJGraphTModelAdapter().getVertexPort(v1);
                DefaultPort p2 = editorPane.getJGraphTModelAdapter().getVertexPort(v2);
                
                editorPane.insertEdge(p2, p1);
            }            
        }
    }
    
    private void writeResultToServer(){
      logs.debug("Student "+ApplicationContext.getUserID()+" Completed Task: "+ApplicationContext.getCurrentTaskID());
    }
}