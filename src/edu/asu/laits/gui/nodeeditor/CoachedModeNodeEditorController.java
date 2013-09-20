/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.util.List;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import org.apache.log4j.Logger;

/**
 * Implements functionalities of NodeEditor for Coached Mode
 *
 * @author ramayantiwari
 */
public class CoachedModeNodeEditorController extends NodeEditorController {

    private NodeEditorView view;
    private Vertex openVertex;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public CoachedModeNodeEditorController(NodeEditorView view, Vertex openVertex) {
        super(view, openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }

    public void initActionButtons() {
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
    }

    public int processTabChange(int oldTab, int newTab){
        if (oldTab == NodeEditorView.DESCRIPTION) {
            if (openVertex.isDescriptionDone()) {
                view.getDescriptionPanel().setEditableTree(false);
                view.getPlanPanel().refreshPanel();
                if(openVertex.isPlanDone() && newTab == NodeEditorView.CALCULATIONS){
                    return newTab;
                } else if(!openVertex.isPlanDone() && newTab == NodeEditorView.CALCULATIONS){
                    return oldTab;
                    
                }
            } else {
                return oldTab;
            }
        }else if (oldTab == NodeEditorView.PLAN){
            if(openVertex.isPlanDone()){
                view.getCalculationsPanel().initPanel();
                return newTab;
            } else if(newTab!=NodeEditorView.DESCRIPTION){
                return oldTab;
            }
        }
        return newTab;
    }
    
    public void initDescriptionPanelView(DescriptionPanelView dPanelView){
    
    }
    
    // Duplicates code in initDemoButton
    public void initCheckButton() {
        if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.PLAN){
            view.getCheckButton().setEnabled(false);
        }else if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.DESCRIPTION){
            if(openVertex.isDescriptionDone()){
                view.getCheckButton().setEnabled(false);
            } else{
                view.getCheckButton().setEnabled(true);
            }
        }else if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.CALCULATIONS){
            if(openVertex.isCalculationsDone()){
                view.getCheckButton().setEnabled(false);
            } else{
                view.getCheckButton().setEnabled(true);
            }
        }
    }

    // Duplicates code in initCheckButton 
    public void initDemoButton() {
        if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.PLAN){
            view.getDemoButton().setEnabled(false);
        }else if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.DESCRIPTION){
            if(openVertex.isDescriptionDone()){
                view.getDemoButton().setEnabled(false);
            } else{
                view.getDemoButton().setEnabled(true);
            }
        }else if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.CALCULATIONS){
            if(openVertex.isCalculationsDone()){
                view.getDemoButton().setEnabled(false);
            } else{
                view.getDemoButton().setEnabled(true);
            }
        }
    }

    public void initOkButton() {
        view.getOKButton().setVisible(false);
    }

    public void initCloseButton() {
    }

    public void processCheckAction() throws NodeEditorException{
    
    }
    
    public void processDemoAction() throws NodeEditorException{
    
    }
    
    public void processCancelAction() throws NodeEditorException{
        view.getCancelButton().setEnabled(false);
    }

    public void initOnLoadBalloonTip() {
        
    }

    private void addHelpBalloon(String name, String timing, String panel) {
        logs.debug("Adding Help Bubble for " + panel);        
    }
    
    public String demoDescriptionPanel(){
        // Get a correct Node Name
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        //List<String> correctNodeNames = solution.getCorrectNodeNames();
        List<SolutionNode> correctNodeNames = solution.getSolutionNodes();
        
        String giveupNode = null;
        for (SolutionNode name : correctNodeNames) {
            if (name.getNodeName().equalsIgnoreCase(ApplicationContext.getFirstNextNode())) {
                giveupNode = name.getNodeName();
                ApplicationContext.setNextNodes(name.getNodeName());
                    //                  ApplicationContext.nextCurrentOrder()
                break;
            }
        }
        if (giveupNode == null) {
            view.setEditorMessage("All Nodes are already being used in the Model.", true);
            return null;
        }
        
        logs.debug("Found Giveup Node as : " + giveupNode);
        return giveupNode;
        
    }
    
    public void planPanelRadioClicked(){
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        view.checkPlanPanel(solution);
    }
}
