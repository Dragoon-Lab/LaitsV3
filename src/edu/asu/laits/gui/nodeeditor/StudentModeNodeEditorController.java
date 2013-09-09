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

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.model.Vertex;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import org.apache.log4j.Logger;

/**
 * Implements functionalities of NodeEditor for Student Mode
 * @author ramayantiwari
 */
public class StudentModeNodeEditorController extends NodeEditorController{
    private NodeEditorView view;
    private Vertex openVertex;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public StudentModeNodeEditorController(NodeEditorView view, Vertex openVertex){
        super(view,openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }
    
    public int processTabChange(int oldTab, int newTab){
        return newTab;
    }
    
    public void initDescriptionPanelView(DescriptionPanelView dPanelView){
    
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
    
    public void processCancelAction() throws NodeEditorException{
        super.processCancelAction();        
    }
    
    public void initOnLoadBalloonTip(){
    
    }
}
