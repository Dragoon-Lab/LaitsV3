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
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Dimension;
import javax.swing.ButtonGroup;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Enumeration;
import java.util.List;
import javax.swing.AbstractButton;
import javax.swing.JLabel;
import net.miginfocom.swing.MigLayout;
import org.apache.log4j.Logger;
/**
 *
 * @author rjoiner1
 */
public class PlanPanelView extends javax.swing.JPanel {

    private MigLayout PlanLayout = new MigLayout("filly, wrap", "[95%]","15[]15[]15[]15[]");
    private String rowString1 = "wrap";
    private String rowString2 = "[20%]15[]";
    private String rowString3 = "15[]15";
    private String labelHtml = "<html><body style='width: 275px'>";
    private MigLayout rowLayout = new MigLayout(rowString1, rowString2, rowString3);
    private MigLayout rowLayout2 = new MigLayout(rowString1, rowString2, rowString3);
    private MigLayout rowLayout3 = new MigLayout(rowString1, rowString2, rowString3);
    private String[] parameterPlan = new String[] {"Parameter", "A constant whose value is defined in the problem"};
    private String[] accumulatorPlan = new String[] {"Accumulator", "a quantity whose new value depends on its old value and its inputs"};
    private String[] functionPlan = new String[] {"Function", "a quantity that depends on its inputs alone"};
    private Dimension rowSize = new Dimension(465, 65);
    private List<String> parameterSubPlans;
    private List<String> accumulatorSubPlans;
    private List<String> functionSubPlans;
    private NodeEditorView nodeEditor;
    private TaskSolution solution;
    private Vertex openVertex;
    private JPanel panel;
    private JPanel paraPanel;
    private JPanel accPanel;
    private JPanel funPanel;
    private ButtonGroup primarySelections;
    private JRadioButton parameterSelection;
    private JRadioButton accumulatorSelection;
    private JRadioButton functionSelection;
   
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public PlanPanelView(NodeEditorView ne) {
        nodeEditor = ne;
        openVertex = ne.getOpenVertex();
        initPanel();        
    }
    
    private void initPanel(){
        
        solution = ApplicationContext.getCorrectSolution();
        parameterSelection = new JRadioButton(parameterPlan[0]);
        accumulatorSelection = new JRadioButton(accumulatorPlan[0]);
        functionSelection = new JRadioButton(functionPlan[0]);
        primarySelections = new ButtonGroup();
        primarySelections.add(parameterSelection);
        primarySelections.add(accumulatorSelection);
        primarySelections.add(functionSelection);
        
        if(!ApplicationContext.isAuthorMode()){
            parameterSubPlans = solution.getParameterSubPlans();
            accumulatorSubPlans = solution.getAccumulatorSubPlans();
            functionSubPlans = solution.getFunctionSubPlans();
        }
        
        panel = new JPanel(PlanLayout);
        panel.setBackground(Color.WHITE);
        panel.add(new JLabel(openVertex.getName() + " is a ..."), "align center");
        paraPanel = new JPanel(rowLayout);
        paraPanel.add(parameterSelection, "");
        paraPanel.add(new JLabel(labelHtml + parameterPlan[1]), "");
     
        paraPanel.setBackground(Color.WHITE);
        panel.add(paraPanel, "wrap");
        accPanel = new JPanel(rowLayout2);
        accPanel.add(accumulatorSelection, "");
        accPanel.add(new JLabel(labelHtml + accumulatorPlan[1]), "");
   
        accPanel.setBackground(Color.WHITE);
        panel.add(accPanel, "");
        funPanel = new JPanel(rowLayout3);
        funPanel.add(functionSelection, "");
        funPanel.add(new JLabel(labelHtml + functionPlan[1]), "");
     
        funPanel.setBackground(Color.WHITE);
        panel.add(funPanel, "");
        
        add(panel, "growx, growy");
        if(openVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT)){
            setSelectedPlan(planToString(openVertex.getVertexType()));
            setSelectedPlanBackground(Color.GREEN);
            setEditableRadio(false);
        } else if(openVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)){
            setSelectedPlan(planToString(openVertex.getVertexType()));
            setSelectedPlanBackground(Color.YELLOW);
            setEditableRadio(false);
        }
        
        // Temporary hack - initializatin should happen in appropriate controllers
        if(ApplicationContext.isAuthorMode()){
            setSelectedPlanBackground(Color.WHITE);
            setEditableRadio(true);
        }
        
        panel.revalidate();
        panel.repaint();
        panel.setVisible(true);
        
        attachChangeListener();        
    }
    
    /**
     * Associates Event handler for Click events in Plan Panel Radio Buttons
     */
    private void attachChangeListener(){
        JRadioButton buttonList[] = {parameterSelection,accumulatorSelection,functionSelection};
        
        for(JRadioButton button : buttonList){
            button.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    processPlanPanel();
                    nodeEditor.getController().planPanelRadioClicked();
                    MainWindow.refreshGraph();
                }
            });
        }       
    }
    
    public boolean isViewEnabled() {
        if (openVertex.isDescriptionDone()) {
            return true;
        } else {
            return false;
        }
    }
    
    public void setEditableRadio(Boolean b) {
        for (Enumeration<AbstractButton> buttons = primarySelections.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            button.setEnabled(b);
        }
    }
    
    /**
     * Save selected plan in the Vertex and update Vertex type as per the plan.
     * This updated vertex type will be used to initialize Calculations Panel
     * @return : boolean to indicate if Plan Panel processing was successful
     */
    public boolean processPlanPanel() {
        if (primarySelections.getSelection() != null) {
            openVertex.setPlan(planToString(getSelectedPlan()));
            
            Vertex.VertexType old = openVertex.getVertexType();
            Vertex.VertexType newType = getSelectedPlan();
            
            // If vertex type is changed to constant and - remove all the incoming edges
            if((old.equals(Vertex.VertexType.FLOW) || old.equals(Vertex.VertexType.FLOW))
                && newType.equals(Vertex.VertexType.CONSTANT)){
                    MainWindow.getInstance().getGraphEditorPane().getModelGraph().removeIncomingEdgesOf(openVertex);
                    openVertex.setEquation("");
                    openVertex.setInitialValue(0.0);
            }             
            
            openVertex.setVertexType(getSelectedPlan());              
            logs.info("Plan Set to "+openVertex.getPlan() + "Vetex Type set to "+openVertex.getVertexType());
        } else {
            return false;
        }
        return true;
    }
    
    public Vertex.VertexType getSelectedPlan() {
        if (parameterSelection.isSelected()) {
            return Vertex.VertexType.CONSTANT;
        } else if (accumulatorSelection.isSelected()) {
            return Vertex.VertexType.STOCK;
        } else if (functionSelection.isSelected()) {
            return Vertex.VertexType.FLOW;
        } else {
            return Vertex.VertexType.DEFAULT;
        }        
    }
    
    public void setSelectedPlanBackground(Color c) {
        for (Enumeration<AbstractButton> buttons = primarySelections.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();

            if (button.isSelected()) {
                button.getParent().setBackground(c);               
            }
        }
    }
    
    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        String correctPlan = planToString(solution.getNodeByName(
                nodeEditor.getOpenVertex().getName()).getNodeType());
        
        if (correctPlan.equalsIgnoreCase(parameterPlan[0])) {
            parameterSelection.setSelected(true);
        } else if (correctPlan.equalsIgnoreCase(accumulatorPlan[0])) {
            accumulatorSelection.setSelected(true);
        } else if (correctPlan.equalsIgnoreCase(functionPlan[0])) {
            functionSelection.setSelected(true);
        }    
        setSelectedPlanBackground(Color.YELLOW);
    }
    
    public String printPlanPanel() {
        StringBuilder sb = new StringBuilder();
        sb.append("Selected Plan : '");
        sb.append(planToString(getSelectedPlan()) + "'");
        return sb.toString();
    }
    
    private String planToString(Vertex.VertexType p) {
        if (p.equals(Vertex.VertexType.CONSTANT)) {
            return "Parameter";
        } else if (p.equals(Vertex.VertexType.STOCK)) {
            return "Accumulator";
        } else if (p.equals(Vertex.VertexType.FLOW)) {
            return "Function";
        } else {
            return "Undefined";
        }
    }
    
    public void refreshPanel() {
        this.removeAll();
        initPanel();
    }
    
    public void setSelectedPlan(String plan) {
        logs.info("Setting Plan to "+plan);
        for (Enumeration<AbstractButton> buttons = primarySelections.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            if(button.getText().equalsIgnoreCase(plan)) {
                button.setSelected(true);
            }
        }        
    }
    
    public String getSelected() {
        return getSelectedButtonText(primarySelections);
    }
    
    public String getSelectedButtonText(ButtonGroup buttonGroup) {
        for (Enumeration<AbstractButton> buttons = buttonGroup.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            
            if (button.isSelected()) {
                return button.getText();
            }
        }
        
        return null;
    }
}
