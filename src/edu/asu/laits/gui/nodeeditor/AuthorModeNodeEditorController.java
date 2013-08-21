/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.model.Vertex;
import org.apache.log4j.Logger;

/**
 * Implements functionalities of NodeEditor for Author Modes
 * @author ramayantiwari
 */
public class AuthorModeNodeEditorController extends NodeEditorController{
    private NodeEditorView view;
    private Vertex openVertex;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public AuthorModeNodeEditorController(NodeEditorView view, Vertex openVertex){
        super(view,openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }
    
    public void initActionButtons(){
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
    }
    
    public void initCheckButton(){
        view.getCheckButton().setEnabled(false);
    }
    
    public void initDemoButton(){
        view.getDemoButton().setEnabled(false);
    }
    
    public void initOkButton(){
    
    }
    
    public void initCloseButton(){
    
    }
    
    public void processCheckAction(){
    
    }
    
    public void processDemoAction(){
    
    }
    
    public void processCancelAction(){
        super.processCancelAction();
        view.getGraphPane().getMainFrame().getModelToolBar().enableDeleteNodeButton();
        view.getGraphPane().getMainFrame().getMainMenu().getModelMenu().enableDeleteNodeMenu();
    }
    
    public void initOnLoadBalloonTip(){
    
    }
}
