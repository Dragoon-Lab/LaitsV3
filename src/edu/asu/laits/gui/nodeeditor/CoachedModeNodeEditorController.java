/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.model.Vertex;

/**
 * Implements functionalities of NodeEditor for Coached Mode
 * @author ramayantiwari
 */
public class CoachedModeNodeEditorController extends NodeEditorController{
    private NodeEditorView view;
    private Vertex openVertex;
    
    public CoachedModeNodeEditorController(NodeEditorView view, Vertex openVertex){
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
        super.initDemoButton();
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
        view.getCancelButton().setEnabled(false);        
    }
}
