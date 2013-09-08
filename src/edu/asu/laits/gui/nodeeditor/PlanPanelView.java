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
import edu.asu.laits.editor.DragoonUIUtils;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.util.Enumeration;
import java.util.List;
import javax.swing.AbstractButton;
import javax.swing.ButtonGroup;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import net.miginfocom.swing.MigLayout;

/**
 *
 * @author ramayantiwari
 */
public class PlanPanelView extends JPanel {
    
    private String[] parameterPlan = new String[]{"Parameter", "A constant whose value is defined in the problem"};
    private String[] accumulatorPlan = new String[]{"Accumulator", "test1"};
    private String[] functionPlan = new String[]{"Function", "test2"};
    private Dimension rowSize = new Dimension(560, 65);
    private List<String> parameterSubPlans;
    private List<String> accumulatorSubPlans;
    private List<String> functionSubPlans;
    private NodeEditorView nodeEditor;
    private TaskSolution solution;
    private Vertex currentVertex;
    private JPanel panel;
    private JPanel paraPanel;
    private JPanel accPanel;
    private JPanel funPanel;
    private ButtonGroup planButtonGroup;
    private JRadioButton parameterSelection;
    private JRadioButton accumulatorSelection;
    private JRadioButton functionSelection;
    
    public PlanPanelView(NodeEditorView ne) {        
        super(new MigLayout());
        nodeEditor = ne;
        currentVertex = ne.getCurrentVertex();
        initPanel();        
    }
    
    private void initPanel() {
        solution = ApplicationContext.getCorrectSolution();
        planButtonGroup = new ButtonGroup();
        parameterSelection = DragoonUIUtils.createRadioButton(parameterPlan[0], planButtonGroup);
        accumulatorSelection = DragoonUIUtils.createRadioButton(accumulatorPlan[0], planButtonGroup);
        functionSelection = DragoonUIUtils.createRadioButton(accumulatorPlan[0], planButtonGroup);
        
        DragoonUIUtils.addSeparator(this, "Node " + currentVertex.getName() + " is a ...");
        
        add(parameterSelection, "skip");
        add(DragoonUIUtils.createLabel(parameterPlan[1]), "span, gapleft 30");
        add(accumulatorSelection, "skip");
        add(DragoonUIUtils.createLabel(accumulatorPlan[1]), "span, gapleft 30");
        add(functionSelection, "skip");
        add(DragoonUIUtils.createLabel(functionPlan[1]), "wrap, gapleft 30");
        
        parameterSelection.setSelected(true);
        setSelectedPlanBackground(Color.red);
    }
    
    public boolean isViewEnabled() {
        if (nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT)
            || nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }
    
    public void setEditableRadio(Boolean b) {
        for (Enumeration<AbstractButton> buttons = planButtonGroup.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            button.setEnabled(b);
        }
    }
    
    public boolean processPlanPanel() {
        if (planButtonGroup.getSelection() != null) {
            nodeEditor.getCurrentVertex().setVertexType(getSelectedPlan());
        } else {
            nodeEditor.setEditorMessage("Please select a plan for this node.", true);
            return false;
        }
        return true;
    }
    
    public Vertex.VertexType getSelectedPlan() {
        System.out.println("Selected plan determined to be: " + planButtonGroup.getSelection().toString());
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
        for (Enumeration<AbstractButton> buttons = planButtonGroup.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            
            if (button.isSelected()) {
                button.setForeground(c);
                
                Component[] comp = getComponents();
                int count = 0;
                for (Component cc : comp) {
                    if (cc.equals(button)) {
                        break;
                    }
                    ++count;
                }
                comp[++count].setForeground(c);
            }
            
        }
    }
    
    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        String correctPlan = planToString(solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName()).getNodeType());
        System.out.println("Found Correct Plan as : " + correctPlan);
        if (correctPlan.equalsIgnoreCase(parameterPlan[0])) {
            parameterSelection.setSelected(true);
        } else if (correctPlan.equalsIgnoreCase(accumulatorPlan[0])) {
            accumulatorSelection.setSelected(true);
        } else if (correctPlan.equalsIgnoreCase(functionPlan[0])) {
            functionSelection.setSelected(true);
        }    
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
        for (Enumeration<AbstractButton> buttons = planButtonGroup.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();
            
            if (button.getText().equalsIgnoreCase(plan)) {
                button.setSelected(true);
            }
        }        
    }
    
    public String getSelected() {
        return getSelectedButtonText(planButtonGroup);
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
