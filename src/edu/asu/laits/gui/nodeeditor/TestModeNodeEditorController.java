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
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.util.List;
import javax.swing.JButton;
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
        logs.info("Processing Tab Change - Old " + oldTab + " New " + newTab);
        // If use pressed same tab - Do Nothing
        if (oldTab == newTab) {
            return oldTab;
        }

        int tabToReturn = oldTab;

        if (oldTab == NodeEditorView.DESCRIPTION) {
            if (openVertex.isDescriptionDone()) {
                view.getDescriptionPanel().setEditableTree(false);
                view.getPlanPanel().refreshPanel();
                tabToReturn = newTab;
            } else {
                tabToReturn = oldTab;
            }
        } else if (oldTab == NodeEditorView.PLAN) {
            //view.getPlanPanel().refreshPanel();
            if (view.getPlanPanel().processPlanPanel()) {
                view.getCalculationsPanel().initPanel();
                //view.getPlanPanel().setEditableRadio(false);                
                tabToReturn = newTab;
            } else if (newTab == NodeEditorView.DESCRIPTION) {
                tabToReturn = newTab;
            } else {
                tabToReturn = oldTab;
            }
        } else {
            if (view.getCalculationsPanel().processCalculationsPanel()) {
                view.getCalculationsPanel().setEditableCalculations(false);
                tabToReturn = newTab;
            } else {
                tabToReturn = oldTab;
            }
        }

        if (tabToReturn == NodeEditorView.CALCULATIONS && !view.getPlanPanel().processPlanPanel()) {
            tabToReturn = NodeEditorView.PLAN;
        }

        if (tabToReturn == NodeEditorView.PLAN || tabToReturn == NodeEditorView.CALCULATIONS) {
            logs.debug("disabling Check and Demo for Plan number : " + tabToReturn);
            view.getCheckButton().setEnabled(false);
            view.getDemoButton().setEnabled(false);

            if (tabToReturn == NodeEditorView.CALCULATIONS) {
                logs.debug("Enabling Ok button for Calculations panel in Test Mode.");
                view.getCalculationsPanel().initPanel();                
            }
            view.getOKButton().setEnabled(true);
        } 
        view.validate();
        view.repaint();
        return tabToReturn;
    }

    public void initDescriptionPanelView(DescriptionPanelView dPanelView) {
    }

    public void initActionButtons() {
        logs.info("Initializing Action buttons in Test Mode Controller");
        initOkButton();
        initCloseButton();
        initCheckButton();
        initDemoButton();
        //super.resetActionButtonAfterDemoUsed();
    }

    public void initCheckButton() {
        enableCheckDemoButtons(view.getCheckButton());
    }

    public void initDemoButton() {
        enableCheckDemoButtons(view.getDemoButton());
        //super.diasableDemoForChanllengeProblems();       
    }

    public void initOkButton() {
        view.getOKButton().setText("Ok");
        if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.CALCULATIONS 
                && view.getOpenVertex().getCalculationsStatus().equals(Vertex.CalculationsStatus.CORRECT)){
            view.getOKButton().setEnabled(false);
        }
    }

    public void initCloseButton() {
        view.getCancelButton().setText("Cancel");
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

    public String demoDescriptionPanel() {
        // Get a correct Node Name
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        //List<String> correctNodeNames = solution.getCorrectNodeNames();
        List<SolutionNode> correctNodeNames = solution.getSolutionNodes();

        String giveupNode = null;

        for (SolutionNode name : correctNodeNames) {
            if (MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(name.getNodeName()) == null) {
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

    public void planPanelRadioClicked() {
        //TaskSolution solution = ApplicationContext.getCorrectSolution();
        //view.checkPlanPanel(solution);
    }

    public void initializeCreateNewNodeDialog(CreateNewNodeDialog dialog) {
        dialog.getCheckButton().setEnabled(true);
        dialog.getDemoButton().setEnabled(true);
        //String taskPhase = ApplicationContext.getCurrentTask().getPhase();
        // Disable Giveup in Challege tasks
//        if (taskPhase.equalsIgnoreCase("Challenge")) {
//            dialog.getDemoButton().setEnabled(false);            
//        } 
        
        dialog.getCancelButton().setText("Close");
    }

    public void processOKAction() throws NodeEditorException {
        logs.debug("Processing Test Mode OK Button Action");
        
        if(openVertex.getVertexType().equals(Vertex.VertexType.DEFAULT)) {
            view.dispose();
        } 
        
        else if (view.getCalculationsPanel().processCalculationsPanel()) {
            PersistenceManager.saveSession();
            MainWindow.refreshGraph();
            view.dispose();
        }
    }

    private void enableCheckDemoButtons(JButton button) {
        if(view.getTabbedPane().getSelectedIndex() == NodeEditorView.DESCRIPTION){
            if(openVertex.isDescriptionDone())
                button.setEnabled(false);
            else 
                button.setEnabled(true);
        }
    }
}
