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
    
    public abstract void initOnLoadBalloonTip();
    
    public abstract void initDescriptionPanelView(DescriptionPanelView dPanelView);
    
    protected void initCheckButton(){
    
    }
    
    protected void initDemoButton(){
        String taskPhase = ApplicationContext.getCorrectSolution().getPhase();

        // Disable Giveup in Challege tasks
        if (taskPhase.equalsIgnoreCase("Challenge")) {
            view.getDemoButton().setEnabled(false);            
            return;
        }
        resetActionButtonAfterDemoUsed();
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
    
    public void processCheckAction() throws NodeEditorException{
    
    }
    
    public void processDemoAction() throws NodeEditorException{
    
    }
    
    public void processOKAction() throws NodeEditorException{
        
    }
    
    public void processCancelAction() throws NodeEditorException{
        activityLogs.debug("User pressed Close button for Node " + openVertex.getName());
        
        // Delete this vertex if its not defined and user hits Cancel
        if (openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.UNDEFINED)
                || openVertex.getDescriptionStatus().equals(Vertex.DescriptionStatus.INCORRECT)) {
            
        }

        // Save Student's session to server
        PersistenceManager.saveSession();

        view.dispose();
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
    
}
