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
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.util.List;
import org.apache.log4j.Logger;

/**
 * Implements functionalities of NodeEditor for Student Mode
 *
 * @author meghatiwari
 */
public class TestModeNodeEditorController extends NodeEditorController {

    private NodeEditorView view;
    private Vertex openVertex;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");

    public TestModeNodeEditorController(NodeEditorView view, Vertex openVertex) {
        super(view, openVertex);
        this.view = view;
        this.openVertex = openVertex;
    }

    /**
     * Handle Tab Change Event
     *
     * @param oldTab
     * @param newTab
     * @return new tab id
     */
    public int processTabChange(int oldTab, int newTab) {
        if (oldTab == NodeEditorView.DESCRIPTION) {
            if (openVertex.isDescriptionDone()) {
                view.getDescriptionPanel().setEditableTree(false);
                view.getPlanPanel().refreshPanel();
                return newTab;
            } else {
                return oldTab;
            }
        } else if (oldTab == NodeEditorView.PLAN) {
            view.getPlanPanel().refreshPanel();
            if (openVertex.isPlanDone()) {
                view.getCalculationsPanel().initPanel();
                view.getPlanPanel().setEditableRadio(false);
                if(!openVertex.isCalculationsDone()){
                  view.getCheckButton().setEnabled(true);
                  view.getDemoButton().setEnabled(true);
                }
                return newTab;
            } else if (newTab == NodeEditorView.DESCRIPTION){
                return newTab;
            }else{
                return oldTab;
            }
        } else {
            if (openVertex.isCalculationsDone()) {
                view.getCalculationsPanel().setEditableCalculations(false);
                return newTab;
            } else {
                return oldTab;
            }
        }
    }

    public void initDescriptionPanelView(DescriptionPanelView dPanelView) {
    }

    public void initActionButtons() {
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
        super.resetActionButtonAfterDemoUsed();
    }

    public void initCheckButton() {
        view.getCheckButton().setVisible(false);
    }

    public void initDemoButton() {
        super.initDemoButton();
        view.getDemoButton().setVisible(false);
        
    }

    public void initOkButton() {
        //view.getOKButton().setVisible();
    }

    public void initCloseButton() {
    }

    public void processCheckAction() {
    }

    public void processDemoAction() {
    }

    public void processCancelAction() throws NodeEditorException {
        super.processCancelAction();
    }

    public void initOnLoadBalloonTip() {
    }
    
    public String demoDescriptionPanel(){
        // Get a correct Node Name
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        //List<String> correctNodeNames = solution.getCorrectNodeNames();
        List<SolutionNode> correctNodeNames = solution.getSolutionNodes();
        
        String giveupNode = null;

            for (SolutionNode name : correctNodeNames) {
                if (view.getGraphPane().getModelGraph().getVertexByName(name.getNodeName()) == null) {
                    giveupNode = name.getNodeName();
                    break;
                }
            }
        
        if (giveupNode == null) {
            view.setEditorMessage("All Nodes are already being used in the Model.");
            return null;
        }
        
        logs.debug("Found Giveup Node as : " + giveupNode);
        return giveupNode;
    }
    
    public void planPanelRadioClicked(){
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        view.checkPlanPanel(solution);
    }
    
    public void initializeCreateNewNodeDialog(CreateNewNodeDialog dialog){
        dialog.getCheckButton().setEnabled(false);
        dialog.getDemoButton().setEnabled(false);
    }
}
