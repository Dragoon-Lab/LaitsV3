/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.model.Vertex;

/**
 * Implements functionalities of NodeEditor for Student Mode
 * @author ramayantiwari
 */
public class StudentModeNodeEditorController extends NodeEditorController{
    private NodeEditorView view;
    private Vertex openVertex;
    
    public StudentModeNodeEditorController(NodeEditorView view, Vertex openVertex){
        super(view,openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }
    
    public void initActionButtons(){
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
        super.resetActionButtonAfterDemoUsed();
    }
    
    public void initCheckButton(){
        
    }
    
    public void initDemoButton(){
        
    }
    
    public void initOkButton(){
        view.getOKButton().setVisible(false);
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
}
