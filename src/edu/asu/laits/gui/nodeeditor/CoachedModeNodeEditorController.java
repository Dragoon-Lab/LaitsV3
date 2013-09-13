/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.HelpBubble;
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
        super.resetActionButtonAfterDemoUsed();
    }

    public int processTabChange(int oldTab, int newTab){
        if(newTab == 2){
            view.getCalculationsPanel().initPanel();
            if(!openVertex.isCalculationsDone()){
                view.getCheckButton().setEnabled(true);
                view.getDemoButton().setEnabled(true);
            }
            
        }
        return newTab;
    }
    
    public void initDescriptionPanelView(DescriptionPanelView dPanelView){
    
    }
    
    public void initCheckButton() {
    }

    public void initDemoButton() {
        super.initDemoButton();
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
}
