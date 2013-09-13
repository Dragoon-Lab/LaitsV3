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

import edu.asu.laits.gui.MainWindow;
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
        
    public AuthorModeNodeEditorController(NodeEditorView view, Vertex openVertex){
        super(view,openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }
    
    public void initDescriptionPanelView(DescriptionPanelView dPanelView){
    
    }
    
    public void initActionButtons(){
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
    }
   
    /**
     * Handle Tab Change event for Author Mode. 
     * New Tab needs to be initialized as per the input from previous tab
     * @param oldTab
     * @param newTab
     * @return : New Tab Index
     */
    public int processTabChange(int oldTab, int newTab){
        logs.info("Processing Tab Change - Old "+oldTab+" New "+newTab);
        // Process Old Tab to store info in Vertex - Plan Panel info is updated at change event
        if(oldTab == NodeEditorView.DESCRIPTION){
            if(view.getDescriptionPanel().processDescriptionPanel()){
                openVertex.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            }else{
                openVertex.setDescriptionStatus(Vertex.DescriptionStatus.UNDEFINED);
            }
        }else if(oldTab == NodeEditorView.CALCULATIONS){
            if(view.getCalculationsPanel().processCalculationsPanel()){
                openVertex.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            }else{
                openVertex.setCalculationsStatus(Vertex.CalculationsStatus.UNDEFINED);
            }
        }
        
        // Reflect changes in graph to UI
        MainWindow.refreshGraph();
        
        // Prepare New Tab if it's initilization is dependent on old tab
        if(newTab == NodeEditorView.CALCULATIONS){
            view.getCalculationsPanel().initPanel();
        }
        
        return newTab;
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
    
    public void processCheckAction() throws NodeEditorException{
    
    }
    
    public void processDemoAction() throws NodeEditorException{
    
    }
    
    public void processOKAction() throws NodeEditorException{
        logs.debug("Processing Author Mode OK Button Action");
        
    }
    
    public void processCancelAction() throws NodeEditorException{
        super.processCancelAction();        
    }
    
    public void initOnLoadBalloonTip(){
    
    }
    
    public String  demoDescriptionPanel(){
        return null;
    }
    
    public void planPanelRadioClicked(){
    }
}
