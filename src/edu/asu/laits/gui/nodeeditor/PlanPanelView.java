/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.gui.BlockingToolTip;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;
import javax.swing.AbstractCellEditor;
import javax.swing.BorderFactory;

import javax.swing.ButtonGroup;
import javax.swing.CellRendererPane;
import javax.swing.JComponent;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.TableCellEditor;
import javax.swing.table.TableCellRenderer;
import javax.swing.table.TableModel;
import org.apache.log4j.Logger;
import edu.asu.laits.model.Vertex.VertexType;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Enumeration;
import java.util.List;
import javax.swing.AbstractButton;
import javax.swing.ButtonModel;
import javax.swing.JLabel;
import javax.swing.border.Border;
import net.miginfocom.swing.MigLayout;
/**
 *
 * @author rjoiner1
 */
public class PlanPanelView extends javax.swing.JPanel {

    private MigLayout PlanLayout = new MigLayout("filly, wrap", "[95%]","");
    private String rowString1 = "wrap";
    private String rowString2 = "[20%]15[]";
    private String rowString3 = "15[]15";
    private MigLayout rowLayout = new MigLayout(rowString1, rowString2, rowString3);
    private MigLayout rowLayout2 = new MigLayout(rowString1, rowString2, rowString3);
    private MigLayout rowLayout3 = new MigLayout(rowString1, rowString2, rowString3);
    private String[] parameterPlan = new String[] {"Parameter", "A constant whose value is defined in the problem"};
    private String[] accumulatorPlan = new String[] {"Accumulator", "a quantity whose new value depends on its old value and its inputs"};
    private String[] functionPlan = new String[] {"Function", "a quantity that depends on its inputs alone"};
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
    private ButtonGroup primarySelections;
    private JRadioButton parameterSelection;
    private JRadioButton accumulatorSelection;
    private JRadioButton functionSelection;
   
    public PlanPanelView(NodeEditorView ne) {
        nodeEditor = ne;
        currentVertex = ne.getCurrentVertex();

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
        panel.add(new JLabel(currentVertex.getName() + " is a ..."), "");
        paraPanel = new JPanel(rowLayout);
        paraPanel.add(parameterSelection, "");
        paraPanel.add(new JLabel(parameterPlan[1]), "");
     //   paraPanel.setMinimumSize(rowSize);
        paraPanel.setBackground(Color.WHITE);
        panel.add(paraPanel, "wrap");
        accPanel = new JPanel(rowLayout2);
        accPanel.add(accumulatorSelection, "");
        accPanel.add(new JLabel(accumulatorPlan[1]), "");
   //     accPanel.setMinimumSize(rowSize);
        accPanel.setBackground(Color.WHITE);
        panel.add(accPanel, "");
        funPanel = new JPanel(rowLayout3);
        funPanel.add(functionSelection, "");
        funPanel.add(new JLabel(functionPlan[1]), "");
     //   funPanel.setMinimumSize(rowSize);
        funPanel.setBackground(Color.WHITE);
        panel.add(funPanel, "");
        
        add(panel, "growx, growy");
        if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.CORRECT)){
            setSelectedPlan(planToString(currentVertex.getVertexType()));
            setSelectedPlanBackground(Color.GREEN);
            setEditableRadio(false);
        } else if(currentVertex.getPlanStatus().equals(Vertex.PlanStatus.GAVEUP)){
            setSelectedPlan(planToString(currentVertex.getVertexType()));
            setSelectedPlanBackground(Color.YELLOW);
            setEditableRadio(false);
        }
        panel.revalidate();
        panel.repaint();
        panel.setVisible(true);
        
        attachChangeListener();
        
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
        for (Enumeration<AbstractButton> buttons = primarySelections.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();

            button.setEnabled(b);
        }
    }
    
    public boolean processPlanPanel(){
        if(primarySelections.getSelection() != null){
            nodeEditor.getCurrentVertex().setVertexType(getSelectedPlan());
        } else {
            nodeEditor.setEditorMessage("Please select a plan for this node.", true);
            return false;
        }
        return true;
    }
    
    public Vertex.VertexType getSelectedPlan() {
        System.out.println("Selected plan determined to be: " + primarySelections.getSelection().toString());
        if(parameterSelection.isSelected()){
            return Vertex.VertexType.CONSTANT;
        } else if(accumulatorSelection.isSelected()){
            return Vertex.VertexType.STOCK;
        } else if(functionSelection.isSelected()){
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
                nodeEditor.getCurrentVertex().getName()).getNodeType());
        System.out.println("Found Correct Plan as : " + correctPlan);
        if(correctPlan.equalsIgnoreCase(parameterPlan[0])){
            parameterSelection.setSelected(true);
        } else if(correctPlan.equalsIgnoreCase(accumulatorPlan[0])){
            accumulatorSelection.setSelected(true);
        }  else if(correctPlan.equalsIgnoreCase(functionPlan[0])){
            functionSelection.setSelected(true);
        } 
        if(nodeEditor.getCurrentVertex().getPlanStatus().equals(Vertex.PlanStatus.MISSEDFIRST)){
            //            setSelectedPlanBackground(Color.RED);
        }
        else {
            setSelectedPlanBackground(Color.YELLOW);
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
    
    public void setSelectedPlan(String plan){
        for (Enumeration<AbstractButton> buttons = primarySelections.getElements(); buttons.hasMoreElements();) {
            AbstractButton button = buttons.nextElement();

            if (button.getText().equalsIgnoreCase(plan)) {
                button.setSelected(true);
            }
        }
        
    }
    
    public String getSelected(){
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
    
    private void attachChangeListener(){
        JRadioButton buttonList[] = {parameterSelection,accumulatorSelection,functionSelection};
        for(JRadioButton button : buttonList){
            button.addActionListener(new ActionListener() {

                @Override
                public void actionPerformed(ActionEvent e) {
                    processPlanPanel();
                    
                    if(!ApplicationContext.isAuthorMode()){
                        TaskSolution solution = ApplicationContext.getCorrectSolution();
                        nodeEditor.checkPlanPanel(solution);
                    }
                //    MainWindow.refreshGraph();
                }
            });
        }       
    }
    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        org.jdesktop.layout.GroupLayout layout = new org.jdesktop.layout.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 400, Short.MAX_VALUE)
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(0, 300, Short.MAX_VALUE)
        );
    }// </editor-fold>//GEN-END:initComponents
    // Variables declaration - do not modify//GEN-BEGIN:variables
    // End of variables declaration//GEN-END:variables
}
