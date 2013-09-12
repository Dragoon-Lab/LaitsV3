/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
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

/**
 *
 * @author rjoiner1
 */
public class PlanPanelViewWIP extends javax.swing.JPanel {

    private String selectedPlan;
    private boolean isViewEnabled = false;
    private NodeEditorView nodeEditor;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private JScrollPane scroll;
    private Vertex currentVertex;
    
    public PlanPanelViewWIP(NodeEditorView ne) {
        super(new BorderLayout(0, 5));

        nodeEditor = ne;
        initPanel();
    }
    
    public void initPanel() {
        logs.debug("Initializing Plan Panel");

        currentVertex = this.nodeEditor.getCurrentVertex();
        if(!currentVertex.getName().equalsIgnoreCase("")){
            
         this.descLabel.setText(currentVertex.getName() + "is a ...");
        }
        
        setSelectedPlan(currentVertex.getVertexType());

    }
        
    private void setSelectedPlan(Vertex.VertexType plan){
        if(plan.equals(Vertex.VertexType.CONSTANT)){
            parameterButton.setSelected(true);
        } else if(plan.equals(Vertex.VertexType.STOCK)) {
            accumulatorButton.setSelected(true);
        } else if(plan.equals(Vertex.VertexType.FLOW)) {
            functionButton.setSelected(true);
        }
    }
    
    public Vertex.VertexType getSelectedPlan() {
        if(parameterButton.isSelected()){
            return Vertex.VertexType.CONSTANT;
        } else if(accumulatorButton.isSelected()){
            return Vertex.VertexType.STOCK;
        } else if(functionButton.isSelected()){
            return Vertex.VertexType.FLOW;
        } else {
            return Vertex.VertexType.DEFAULT;
        }
    }
    
    public boolean isViewEnabled() {
        if (nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT)
                || nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP)) {
            return true;
        } else {
            return false;
        }
    }
    
    
    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        Vertex.VertexType correctPlan = solution.getNodeByName(
                currentVertex.getName()).getNodeType();
        System.out.println("Found Correct Plan as : " + correctPlan);
        setSelectedPlan(correctPlan);
        setSelectedPlanBackground(Color.YELLOW);
    }
    
    public void setSelectedPlanBackground(Color c) {
        if(getSelectedPlan().equals(Vertex.VertexType.CONSTANT)){
            parameterBackground.setBackground(c);
            accumulatorBackground.setBackground(Color.WHITE);
            functionBackground.setBackground(Color.WHITE);
        } else if(getSelectedPlan().equals(Vertex.VertexType.STOCK)){
            parameterBackground.setBackground(Color.WHITE);
            accumulatorBackground.setBackground(c);
            functionBackground.setBackground(Color.WHITE);
        } else if(getSelectedPlan().equals(Vertex.VertexType.FLOW)){
            parameterBackground.setBackground(Color.WHITE);
            accumulatorBackground.setBackground(Color.WHITE);
            functionBackground.setBackground(c);
        }
    }
    
    public boolean processPlanPanel() {
        if (parameterButton.isSelected() || accumulatorButton.isSelected() || functionButton.isSelected()) {
            nodeEditor.getCurrentVertex().setVertexType(getSelectedPlan());
        } else {
            nodeEditor.setEditorMessage("Please select a plan for this node.", true);
            return false;
        }
        return true;
    }

    
    public void setEditableRadio(boolean b){
        parameterButton.setEnabled(b);
        accumulatorButton.setEnabled(b);
        functionButton.setEnabled(b);
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

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {

        buttonGroup1 = new javax.swing.ButtonGroup();
        jPanel1 = new javax.swing.JPanel();
        parameterBackground = new javax.swing.JPanel();
        parameterButton = new javax.swing.JRadioButton();
        accumulatorBackground = new javax.swing.JPanel();
        accumulatorButton = new javax.swing.JRadioButton();
        functionBackground = new javax.swing.JPanel();
        functionButton = new javax.swing.JRadioButton();
        descLabel = new javax.swing.JLabel();

        setMinimumSize(new java.awt.Dimension(590, 473));
        setPreferredSize(new java.awt.Dimension(590, 502));

        jPanel1.setBackground(new java.awt.Color(255, 255, 255));

        parameterBackground.setBackground(new java.awt.Color(255, 255, 255));

        buttonGroup1.add(parameterButton);
        parameterButton.setText("Parameter");

        org.jdesktop.layout.GroupLayout parameterBackgroundLayout = new org.jdesktop.layout.GroupLayout(parameterBackground);
        parameterBackground.setLayout(parameterBackgroundLayout);
        parameterBackgroundLayout.setHorizontalGroup(
            parameterBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(parameterBackgroundLayout.createSequentialGroup()
                .add(parameterButton)
                .add(0, 0, Short.MAX_VALUE))
        );
        parameterBackgroundLayout.setVerticalGroup(
            parameterBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(parameterBackgroundLayout.createSequentialGroup()
                .add(parameterButton)
                .add(0, 7, Short.MAX_VALUE))
        );

        accumulatorBackground.setBackground(new java.awt.Color(255, 255, 255));

        buttonGroup1.add(accumulatorButton);
        accumulatorButton.setText("Accumulator");

        org.jdesktop.layout.GroupLayout accumulatorBackgroundLayout = new org.jdesktop.layout.GroupLayout(accumulatorBackground);
        accumulatorBackground.setLayout(accumulatorBackgroundLayout);
        accumulatorBackgroundLayout.setHorizontalGroup(
            accumulatorBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(accumulatorBackgroundLayout.createSequentialGroup()
                .add(accumulatorButton)
                .add(0, 0, Short.MAX_VALUE))
        );
        accumulatorBackgroundLayout.setVerticalGroup(
            accumulatorBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(org.jdesktop.layout.GroupLayout.TRAILING, accumulatorButton)
        );

        functionBackground.setBackground(new java.awt.Color(255, 255, 255));

        buttonGroup1.add(functionButton);
        functionButton.setText("Function");

        org.jdesktop.layout.GroupLayout functionBackgroundLayout = new org.jdesktop.layout.GroupLayout(functionBackground);
        functionBackground.setLayout(functionBackgroundLayout);
        functionBackgroundLayout.setHorizontalGroup(
            functionBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(functionBackgroundLayout.createSequentialGroup()
                .add(functionButton, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, 164, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(0, 320, Short.MAX_VALUE))
        );
        functionBackgroundLayout.setVerticalGroup(
            functionBackgroundLayout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(functionBackgroundLayout.createSequentialGroup()
                .add(functionButton)
                .add(0, 6, Short.MAX_VALUE))
        );

        org.jdesktop.layout.GroupLayout jPanel1Layout = new org.jdesktop.layout.GroupLayout(jPanel1);
        jPanel1.setLayout(jPanel1Layout);
        jPanel1Layout.setHorizontalGroup(
            jPanel1Layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(jPanel1Layout.createSequentialGroup()
                .add(60, 60, 60)
                .add(jPanel1Layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING, false)
                    .add(accumulatorBackground, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .add(parameterBackground, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                    .add(functionBackground, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
                .addContainerGap(org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        jPanel1Layout.setVerticalGroup(
            jPanel1Layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(jPanel1Layout.createSequentialGroup()
                .add(43, 43, 43)
                .add(parameterBackground, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(117, 117, 117)
                .add(accumulatorBackground, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .add(101, 101, 101)
                .add(functionBackground, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(123, Short.MAX_VALUE))
        );

        descLabel.setText("This node is a...");

        org.jdesktop.layout.GroupLayout layout = new org.jdesktop.layout.GroupLayout(this);
        this.setLayout(layout);
        layout.setHorizontalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(layout.createSequentialGroup()
                .add(layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
                    .add(layout.createSequentialGroup()
                        .add(43, 43, 43)
                        .add(descLabel))
                    .add(layout.createSequentialGroup()
                        .add(23, 23, 23)
                        .add(jPanel1, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap(17, Short.MAX_VALUE))
        );
        layout.setVerticalGroup(
            layout.createParallelGroup(org.jdesktop.layout.GroupLayout.LEADING)
            .add(layout.createSequentialGroup()
                .add(8, 8, 8)
                .add(descLabel)
                .addPreferredGap(org.jdesktop.layout.LayoutStyle.RELATED)
                .add(jPanel1, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, org.jdesktop.layout.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                .addContainerGap())
        );

        getAccessibleContext().setAccessibleName("");
        getAccessibleContext().setAccessibleParent(this);
    }// </editor-fold>//GEN-END:initComponents

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JPanel accumulatorBackground;
    private javax.swing.JRadioButton accumulatorButton;
    private javax.swing.ButtonGroup buttonGroup1;
    private javax.swing.JLabel descLabel;
    private javax.swing.JPanel functionBackground;
    private javax.swing.JRadioButton functionButton;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JPanel parameterBackground;
    private javax.swing.JRadioButton parameterButton;
    // End of variables declaration//GEN-END:variables
}
