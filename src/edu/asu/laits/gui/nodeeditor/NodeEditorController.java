/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.Vertex;
import org.apache.log4j.Logger;

/**
 * Implements common functionalities of NodeEditor for all the Modes
 * @author ramayantiwari
 */
public abstract class NodeEditorController{
    private NodeEditorView view;
    private Vertex openVertex;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public NodeEditorController(NodeEditorView view, Vertex openVertex){
        this.view = view;
        this.openVertex = openVertex;
        view.setTitle(getNodeEditorTitle());
    }
    
    public abstract void initActionButtons();
    
    protected void initCheckButton(){
    
    }
    
    protected void initDemoButton(){
        String taskPhase = ApplicationContext.getCorrectSolution().getPhase();

        // Disable Giveup in Challege tasks
        if (taskPhase.equalsIgnoreCase("Challenge")) {
            view.getDemoButton().setEnabled(false);            
        }
        
    }
    
    
    protected void initOkButton(){
    
    }
    
    protected void initCloseButton(){
    
    }
    
    protected void resetActionButtonAfterDemoUsed(){
        boolean isEnabled = true;
        switch(view.getTabbedPane().getSelectedIndex()){
            case 0:
               if (openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
                   isEnabled = false;
               }
               break;
            case 1:
                if (openVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)) {
                    isEnabled = false;
                }
                break;
            case 2:
                if (openVertex.getInputsStatus().equals(Vertex.InputsStatus.GAVEUP)) {
                    isEnabled = false;
                }
                break;
            case 3:
                if (openVertex.getCalculationsStatus().equals(Vertex.CalculationsStatus.GAVEUP)) {
                    isEnabled = false;
                }
                break;
            }
        
        view.getDemoButton().setEnabled(isEnabled);
        view.getCheckButton().setEnabled(isEnabled);
    }
    
    public void processCheckAction(){
    
    }
    
    public void processDemoAction(){
    
    }
    
    private String getNodeEditorTitle(){
        String title = "Node Editor - ";
        if (openVertex.getName().equals("")) {
            title += "New Node";
        } else {
            title += openVertex.getName();
        }

        return title;
    }
    
    
    public void processCancelAction(){
        activityLogs.debug("User pressed Close button for Node " + openVertex.getName());
        // Delete this vertex if its not defined and user hits Cancel
        if (openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)
                || openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            view.getGraphPane().setSelectionCell(openVertex.getJGraphVertex());
            view.getGraphPane().removeSelected();
        }

        activityLogs.debug("Closing NodeEditor because of Close action.");
        if (!ApplicationContext.isCoachedMode()) {
            
        }

        // Save Student's session to server
        PersistenceManager.saveSession();

        view.getGraphPane().getMainFrame().addHelpBalloon(openVertex.getName(), "nodeEditorClose");
        view.dispose();
    }
    
}
