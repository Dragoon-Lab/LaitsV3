package edu.asu.laits.gui.menus;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.GraphRangeEditor;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.nodeeditor.NodeEditor;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.ModelEvaluationException;
import edu.asu.laits.model.ModelEvaluator;
import edu.asu.laits.model.Vertex;
import java.awt.event.KeyEvent;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import org.apache.log4j.Logger;

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
    
    private GraphEditorPane graphPane;
    private MainWindow mainWindow;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

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
            addNodeMenuItem.setText("Add Node ");
            
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
    
    public void newNodeAction(){
        Vertex v = new Vertex();        
        graphPane.addVertex(v);
        graphPane.repaint(); 
        
        NodeEditor editor = new NodeEditor(graphPane);  
    }
    
    public void runModelAction(){
        ModelEvaluator me = new ModelEvaluator((Graph)graphPane.getModelGraph());
        MainWindow window = (MainWindow)graphPane.getMainFrame();
        if(me.isModelComplete()){
            try{
                me.run();
                
                if(ApplicationContext.getAppMode().equals("STUDENT"))
                    me.validateStudentGraph();
                
                window.getStatusBarPanel().setStatusMessage("", true);                
                JOptionPane.showMessageDialog(MainWindow.getFrames()[0], 
                           "Run Model Complete.", 
                           "Success", JOptionPane.INFORMATION_MESSAGE);
            }catch(ModelEvaluationException ex){
                window.getStatusBarPanel().setStatusMessage(ex.getMessage(), false);
            }    
            graphPane.repaint(); 
        }else{
            JOptionPane.showMessageDialog(window, "The model is incomplete, please complete all the nodes before running Model");
            window.getStatusBarPanel().setStatusMessage("Please complete all the nodes before running Model", false);
        }
    }
    
    
    
    public void editTimeRangeAction(){
        GraphRangeEditor ed = new GraphRangeEditor(graphPane, true);
        ed.setVisible(true);
    }
}
