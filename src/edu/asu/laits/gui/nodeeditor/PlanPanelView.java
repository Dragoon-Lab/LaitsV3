/*
 * LAITS Project
 * Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
 */

package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import javax.swing.JPanel;
import org.apache.log4j.Logger;

/**
 * This class implements Author's plan while creating any node
 *
 * @author ramayantiwari
 */
public class PlanPanelView extends JPanel {
    
    private String selectedPlan;
    private static PlanPanelView planView;
    private boolean isViewEnabled = false;
    private NodeEditor nodeEditor;
    /**
     * Logger *
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public PlanPanelView(NodeEditor ne) {
        initComponents();
        nodeEditor = ne;
        initPanel();
    }
    
    public void initPanel() {
        logs.debug("Initializing plan panel for Node ");
        setSelectedPlan(nodeEditor.getCurrentVertex().getPlan());
    }
    
    public void initPanelForNewNode() {
        logs.debug("Initializing plan panel For New Node");
        resetPlanPanel();        
    }
    
    private void resetPlanPanel() {
        isViewEnabled = false;
        buttonGroup1.clearSelection();
        
    }
    
    public boolean processPlanPanel() {
        if (buttonGroup1.getSelection() != null) {
            nodeEditor.getCurrentVertex().setPlan(getSelectedPlan());
        } else {
            nodeEditor.setEditorMessage("Please select a plan for this node.", true);
            return false;
        }
        return true;
    }

    /**
     * Method to set the initialize the selected plan radio button
     */
    private void setSelectedPlan(Vertex.Plan plan) {
        if (plan.equals(Vertex.Plan.FIXED)) {
            fixedNumberButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.DECREASE)) {
            decreaseButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.INCREASE)) {
            increaseButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.INCREASE_AND_DECREASE)) {
            bothButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.PROPORTIONAL)) {
            proportionalValueButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.RATIO)) {
            ratioTwoQuantitiesButton.setSelected(true);
        } else if (plan.equals(Vertex.Plan.DIFFERENCE)) {
            differenceButton.setSelected(true);
        } else {
            buttonGroup1.clearSelection();
        }
    }
    
    public Vertex.Plan getSelectedPlan() {
        if (fixedNumberButton.isSelected()) {
            return Vertex.Plan.FIXED;
        } else if (decreaseButton.isSelected()) {
            return Vertex.Plan.DECREASE;
        } else if (differenceButton.isSelected()) {
            return Vertex.Plan.DIFFERENCE;
        } else if (increaseButton.isSelected()) {
            return Vertex.Plan.INCREASE;
        } else if (bothButton.isSelected()) {
            return Vertex.Plan.INCREASE_AND_DECREASE;
        } else if (ratioTwoQuantitiesButton.isSelected()) {
            return Vertex.Plan.RATIO;
        } else if (proportionalValueButton.isSelected()) {
            return Vertex.Plan.PROPORTIONAL;
        } else {
            return Vertex.Plan.UNDEFINED;
        }
    }
    
    public boolean isViewEnabled() {
        if(nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.CORRECT) ||
                nodeEditor.getCurrentVertex().getDescriptionStatus().equals(Vertex.DescriptionStatus.GAVEUP))
            return true;
        else 
            return false;
    }
    
    
    
    public void setSelectedPlanBackground(Color c) {
        logs.debug("Setting Background of Selected Plan to " + c.toString());
        resetBackGroundColor();
        
        if (fixedNumberButton.isSelected()) {
            fixedNumberButton.setBackground(c);
            fixedNumberPanel.setBackground(c);
        } else if (decreaseButton.isSelected()) {
            decreaseButton.setBackground(c);
            decreasePanel.setBackground(c);
        } else if (differenceButton.isSelected()) {
            differenceButton.setBackground(c);
            differencePanel.setBackground(c);
        } else if (increaseButton.isSelected()) {
            increaseButton.setBackground(c);
            increasePanel.setBackground(c);
        } else if (bothButton.isSelected()) {
            bothButton.setBackground(c);
            bothPanel.setBackground(c);
        } else if (ratioTwoQuantitiesButton.isSelected()) {
            ratioTwoQuantitiesButton.setBackground(c);
            ratioTwoQuantitiesPanel.setBackground(c);
        } else if (proportionalValueButton.isSelected()) {
            proportionalValueButton.setBackground(c);
            proportionalValuePanel.setBackground(c);
        }
        
    }
    
    public void resetBackGroundColor() {
        fixedNumberPanel.setBackground(new Color(238, 238, 238));
        fixedNumberButton.setBackground(new Color(238, 238, 238));
        decreasePanel.setBackground(new Color(238, 238, 238));
        decreaseButton.setBackground(new Color(238, 238, 238));
        differencePanel.setBackground(new Color(238, 238, 238));        
        differenceButton.setBackground(new Color(238, 238, 238));
        increasePanel.setBackground(new Color(238, 238, 238));
        increaseButton.setBackground(new Color(238, 238, 238));
        bothPanel.setBackground(new Color(238, 238, 238));
        bothButton.setBackground(new Color(238, 238, 238));
        ratioTwoQuantitiesPanel.setBackground(new Color(238, 238, 238));
        ratioTwoQuantitiesButton.setBackground(new Color(238, 238, 238));
        proportionalValuePanel.setBackground(new Color(238, 238, 238));
        proportionalValueButton.setBackground(new Color(238, 238, 238));
    }
    
    public void giveUpPlanPanel() {
        TaskSolution solution = ApplicationContext.getCorrectSolution();
        Vertex.Plan correctPlan = solution.getNodeByName(
                nodeEditor.getCurrentVertex().getName()).getNodePlan();
        
        setSelectedPlan(correctPlan);
        setSelectedPlanBackground(Color.YELLOW);
    }
    
    public String printPlanPanel(){
        StringBuilder sb = new StringBuilder();
        sb.append("Selected Plan : '");
        sb.append(planToString(getSelectedPlan())+"'");
        return sb.toString();        
    }
    
    private String planToString(Vertex.Plan p){
        if(p.equals(Vertex.Plan.DECREASE))
            return "Decrease";
        else if(p.equals(Vertex.Plan.INCREASE))
            return "Increase";
        else if(p.equals(Vertex.Plan.DIFFERENCE))
            return "Difference";
        else if(p.equals(Vertex.Plan.FIXED))
            return "Fixed";
        else if(p.equals(Vertex.Plan.INCREASE_AND_DECREASE))
            return "Increase and Decrease";
        else if(p.equals(Vertex.Plan.PROPORTIONAL))
            return "Proportional";
        else if(p.equals(Vertex.Plan.RATIO))
            return "Ratio";
        else 
            return "Undefined";
    }
    
    public void setEditableRadio(Boolean b){
        bothButton.setEnabled(b);
        decreaseButton.setEnabled(b);
        fixedNumberButton.setEnabled(b);
        differenceButton.setEnabled(b);
        increaseButton.setEnabled(b);
        proportionalValueButton.setEnabled(b);
        ratioTwoQuantitiesButton.setEnabled(b);
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
        buttonGroup2 = new javax.swing.ButtonGroup();
        jProgressBar1 = new javax.swing.JProgressBar();
        ratioTwoQuantitiesPanel = new javax.swing.JPanel();
        ratioTwoQuantitiesButton = new javax.swing.JRadioButton();
        jLabel26 = new javax.swing.JLabel();
        jLabel27 = new javax.swing.JLabel();
        jPanel2 = new javax.swing.JPanel();
        jLabel10 = new javax.swing.JLabel();
        jLabel11 = new javax.swing.JLabel();
        jLabel12 = new javax.swing.JLabel();
        fixedNumberPanel = new javax.swing.JPanel();
        fixedNumberButton = new javax.swing.JRadioButton();
        jLabel14 = new javax.swing.JLabel();
        jLabel15 = new javax.swing.JLabel();
        proportionalValuePanel = new javax.swing.JPanel();
        proportionalValueButton = new javax.swing.JRadioButton();
        jLabel16 = new javax.swing.JLabel();
        jLabel17 = new javax.swing.JLabel();
        increasePanel = new javax.swing.JPanel();
        increaseButton = new javax.swing.JRadioButton();
        jLabel18 = new javax.swing.JLabel();
        jLabel19 = new javax.swing.JLabel();
        decreasePanel = new javax.swing.JPanel();
        decreaseButton = new javax.swing.JRadioButton();
        jLabel20 = new javax.swing.JLabel();
        jLabel21 = new javax.swing.JLabel();
        bothPanel = new javax.swing.JPanel();
        bothButton = new javax.swing.JRadioButton();
        jLabel22 = new javax.swing.JLabel();
        jLabel23 = new javax.swing.JLabel();
        differencePanel = new javax.swing.JPanel();
        differenceButton = new javax.swing.JRadioButton();
        jLabel24 = new javax.swing.JLabel();
        jLabel25 = new javax.swing.JLabel();

        setLayout(new org.netbeans.lib.awtextra.AbsoluteLayout());

        buttonGroup1.add(ratioTwoQuantitiesButton);
        ratioTwoQuantitiesButton.setText("the ratio of two quantities");

        jLabel26.setText("<html>quantity1/quantity2</html>");
        jLabel26.setAutoscrolls(true);

        jLabel27.setText("<html>function</html>");
        jLabel27.setAutoscrolls(true);

        javax.swing.GroupLayout ratioTwoQuantitiesPanelLayout = new javax.swing.GroupLayout(ratioTwoQuantitiesPanel);
        ratioTwoQuantitiesPanel.setLayout(ratioTwoQuantitiesPanelLayout);
        ratioTwoQuantitiesPanelLayout.setHorizontalGroup(
            ratioTwoQuantitiesPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(ratioTwoQuantitiesPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(ratioTwoQuantitiesButton, javax.swing.GroupLayout.PREFERRED_SIZE, 259, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jLabel27, javax.swing.GroupLayout.PREFERRED_SIZE, 87, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(55, 55, 55)
                .addComponent(jLabel26, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(47, Short.MAX_VALUE))
        );
        ratioTwoQuantitiesPanelLayout.setVerticalGroup(
            ratioTwoQuantitiesPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(ratioTwoQuantitiesPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(ratioTwoQuantitiesPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(ratioTwoQuantitiesButton)
                    .addComponent(jLabel27, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel26, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(11, Short.MAX_VALUE))
        );

        add(ratioTwoQuantitiesPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 295, 550, -1));

        jLabel10.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        jLabel10.setText("<html>Calculation</html>");
        jLabel10.setAutoscrolls(true);

        jLabel11.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        jLabel11.setText("<html>Node type</html>");
        jLabel11.setAutoscrolls(true);

        jLabel12.setFont(new java.awt.Font("Lucida Grande", 1, 13)); // NOI18N
        jLabel12.setText("The Node's value is...");

        buttonGroup1.add(fixedNumberButton);
        fixedNumberButton.setText("a fixed, given number");

        jLabel14.setText("<html>fixed value</html>");
        jLabel14.setAutoscrolls(true);

        jLabel15.setText("<html>the number</html>");
        jLabel15.setAutoscrolls(true);

        javax.swing.GroupLayout fixedNumberPanelLayout = new javax.swing.GroupLayout(fixedNumberPanel);
        fixedNumberPanel.setLayout(fixedNumberPanelLayout);
        fixedNumberPanelLayout.setHorizontalGroup(
            fixedNumberPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(fixedNumberPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(fixedNumberButton, javax.swing.GroupLayout.PREFERRED_SIZE, 223, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(37, 37, 37)
                .addComponent(jLabel14, javax.swing.GroupLayout.PREFERRED_SIZE, 92, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(49, 49, 49)
                .addComponent(jLabel15, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(80, Short.MAX_VALUE))
        );
        fixedNumberPanelLayout.setVerticalGroup(
            fixedNumberPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, fixedNumberPanelLayout.createSequentialGroup()
                .addContainerGap(8, Short.MAX_VALUE)
                .addGroup(fixedNumberPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(fixedNumberButton)
                    .addComponent(jLabel14, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel15, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(9, Short.MAX_VALUE))
        );

        javax.swing.GroupLayout jPanel2Layout = new javax.swing.GroupLayout(jPanel2);
        jPanel2.setLayout(jPanel2Layout);
        jPanel2Layout.setHorizontalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel2Layout.createSequentialGroup()
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(jPanel2Layout.createSequentialGroup()
                        .addGap(16, 16, 16)
                        .addComponent(jLabel12)
                        .addGap(119, 119, 119)
                        .addComponent(jLabel11, javax.swing.GroupLayout.PREFERRED_SIZE, 108, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(33, 33, 33)
                        .addComponent(jLabel10, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addGap(0, 0, Short.MAX_VALUE))
                    .addGroup(javax.swing.GroupLayout.Alignment.TRAILING, jPanel2Layout.createSequentialGroup()
                        .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE)
                        .addComponent(fixedNumberPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)))
                .addContainerGap())
        );
        jPanel2Layout.setVerticalGroup(
            jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(jPanel2Layout.createSequentialGroup()
                .addGap(11, 11, 11)
                .addGroup(jPanel2Layout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(jLabel12)
                    .addComponent(jLabel11, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel10, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addGap(18, 18, 18)
                .addComponent(fixedNumberPanel, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        add(jPanel2, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 6, -1, -1));

        buttonGroup1.add(proportionalValueButton);
        proportionalValueButton.setText("<html>proportional to the value of the <br>accumulator that it is input to</html>");

        jLabel16.setText("<html>function</html>");
        jLabel16.setAutoscrolls(true);

        jLabel17.setText("<html>accumulator*proportion</html>");
        jLabel17.setAutoscrolls(true);

        javax.swing.GroupLayout proportionalValuePanelLayout = new javax.swing.GroupLayout(proportionalValuePanel);
        proportionalValuePanel.setLayout(proportionalValuePanelLayout);
        proportionalValuePanelLayout.setHorizontalGroup(
            proportionalValuePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(proportionalValuePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(proportionalValueButton, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(82, 82, 82)
                .addComponent(jLabel16, javax.swing.GroupLayout.PREFERRED_SIZE, 92, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 89, Short.MAX_VALUE)
                .addComponent(jLabel17, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap())
        );
        proportionalValuePanelLayout.setVerticalGroup(
            proportionalValuePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(proportionalValuePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(proportionalValuePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(proportionalValueButton, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel16, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel17, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        add(proportionalValuePanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 90, 570, 50));

        buttonGroup1.add(increaseButton);
        increaseButton.setText("said to increase");

        jLabel18.setText("<html>accumulator</html>");
        jLabel18.setAutoscrolls(true);

        jLabel19.setText("<html>increase</html>");
        jLabel19.setAutoscrolls(true);

        javax.swing.GroupLayout increasePanelLayout = new javax.swing.GroupLayout(increasePanel);
        increasePanel.setLayout(increasePanelLayout);
        increasePanelLayout.setHorizontalGroup(
            increasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(increasePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(increaseButton, javax.swing.GroupLayout.PREFERRED_SIZE, 226, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(39, 39, 39)
                .addComponent(jLabel18, javax.swing.GroupLayout.PREFERRED_SIZE, 87, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(58, 58, 58)
                .addComponent(jLabel19, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(114, Short.MAX_VALUE))
        );
        increasePanelLayout.setVerticalGroup(
            increasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(increasePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(increasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
                    .addGroup(increasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                        .addComponent(jLabel19, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                        .addComponent(jLabel18, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                    .addComponent(increaseButton))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        add(increasePanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 135, 570, -1));

        buttonGroup1.add(decreaseButton);
        decreaseButton.setText("said to decrease");

        jLabel20.setText("<html>accumulator</html>");
        jLabel20.setAutoscrolls(true);

        jLabel21.setText("<html> - decrease</html>");
        jLabel21.setAutoscrolls(true);

        javax.swing.GroupLayout decreasePanelLayout = new javax.swing.GroupLayout(decreasePanel);
        decreasePanel.setLayout(decreasePanelLayout);
        decreasePanelLayout.setHorizontalGroup(
            decreasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(decreasePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(decreaseButton, javax.swing.GroupLayout.PREFERRED_SIZE, 204, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(60, 60, 60)
                .addComponent(jLabel20, javax.swing.GroupLayout.PREFERRED_SIZE, 87, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(58, 58, 58)
                .addComponent(jLabel21, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(104, Short.MAX_VALUE))
        );
        decreasePanelLayout.setVerticalGroup(
            decreasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(decreasePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(decreasePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(decreaseButton)
                    .addComponent(jLabel20, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel21, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(11, Short.MAX_VALUE))
        );

        add(decreasePanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 172, 570, -1));

        buttonGroup1.add(bothButton);
        bothButton.setText("said to both increase and decrease");

        jLabel22.setText("<html>accumulator</html>");
        jLabel22.setAutoscrolls(true);

        jLabel23.setText("<html>increase-decrease</html>");
        jLabel23.setAutoscrolls(true);

        javax.swing.GroupLayout bothPanelLayout = new javax.swing.GroupLayout(bothPanel);
        bothPanel.setLayout(bothPanelLayout);
        bothPanelLayout.setHorizontalGroup(
            bothPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(bothPanelLayout.createSequentialGroup()
                .addComponent(bothButton)
                .addGap(66, 66, 66)
                .addComponent(jLabel22, javax.swing.GroupLayout.PREFERRED_SIZE, 87, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED, 91, Short.MAX_VALUE)
                .addComponent(jLabel23, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(35, 35, 35))
        );
        bothPanelLayout.setVerticalGroup(
            bothPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(bothPanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(bothPanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(bothButton)
                    .addComponent(jLabel22, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel23, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(javax.swing.GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );

        add(bothPanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(10, 210, 560, -1));

        buttonGroup1.add(differenceButton);
        differenceButton.setText("the difference of two quantities");

        jLabel24.setText("<html>function</html>");
        jLabel24.setAutoscrolls(true);

        jLabel25.setText("<html>quantity1-quantity2</html>");
        jLabel25.setAutoscrolls(true);

        javax.swing.GroupLayout differencePanelLayout = new javax.swing.GroupLayout(differencePanel);
        differencePanel.setLayout(differencePanelLayout);
        differencePanelLayout.setHorizontalGroup(
            differencePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(differencePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addComponent(differenceButton, javax.swing.GroupLayout.PREFERRED_SIZE, 257, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addPreferredGap(javax.swing.LayoutStyle.ComponentPlacement.RELATED)
                .addComponent(jLabel24, javax.swing.GroupLayout.PREFERRED_SIZE, 87, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addGap(57, 57, 57)
                .addComponent(jLabel25, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                .addContainerGap(47, Short.MAX_VALUE))
        );
        differencePanelLayout.setVerticalGroup(
            differencePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.LEADING)
            .addGroup(differencePanelLayout.createSequentialGroup()
                .addContainerGap()
                .addGroup(differencePanelLayout.createParallelGroup(javax.swing.GroupLayout.Alignment.BASELINE)
                    .addComponent(differenceButton)
                    .addComponent(jLabel24, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE)
                    .addComponent(jLabel25, javax.swing.GroupLayout.PREFERRED_SIZE, javax.swing.GroupLayout.DEFAULT_SIZE, javax.swing.GroupLayout.PREFERRED_SIZE))
                .addContainerGap(11, Short.MAX_VALUE))
        );

        add(differencePanel, new org.netbeans.lib.awtextra.AbsoluteConstraints(6, 252, 550, -1));
    }// </editor-fold>//GEN-END:initComponents
    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JRadioButton bothButton;
    private javax.swing.JPanel bothPanel;
    private javax.swing.ButtonGroup buttonGroup1;
    private javax.swing.ButtonGroup buttonGroup2;
    private javax.swing.JRadioButton decreaseButton;
    private javax.swing.JPanel decreasePanel;
    private javax.swing.JRadioButton differenceButton;
    private javax.swing.JPanel differencePanel;
    private javax.swing.JRadioButton fixedNumberButton;
    private javax.swing.JPanel fixedNumberPanel;
    private javax.swing.JRadioButton increaseButton;
    private javax.swing.JPanel increasePanel;
    private javax.swing.JLabel jLabel10;
    private javax.swing.JLabel jLabel11;
    private javax.swing.JLabel jLabel12;
    private javax.swing.JLabel jLabel14;
    private javax.swing.JLabel jLabel15;
    private javax.swing.JLabel jLabel16;
    private javax.swing.JLabel jLabel17;
    private javax.swing.JLabel jLabel18;
    private javax.swing.JLabel jLabel19;
    private javax.swing.JLabel jLabel20;
    private javax.swing.JLabel jLabel21;
    private javax.swing.JLabel jLabel22;
    private javax.swing.JLabel jLabel23;
    private javax.swing.JLabel jLabel24;
    private javax.swing.JLabel jLabel25;
    private javax.swing.JLabel jLabel26;
    private javax.swing.JLabel jLabel27;
    private javax.swing.JPanel jPanel2;
    private javax.swing.JProgressBar jProgressBar1;
    private javax.swing.JRadioButton proportionalValueButton;
    private javax.swing.JPanel proportionalValuePanel;
    private javax.swing.JRadioButton ratioTwoQuantitiesButton;
    private javax.swing.JPanel ratioTwoQuantitiesPanel;
    // End of variables declaration//GEN-END:variables
}
