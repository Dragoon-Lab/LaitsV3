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
package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.editor.DragoonUIUtils;
import edu.asu.laits.model.PlotPanel;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.TextArea;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.JTree;
import javax.swing.SwingConstants;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import net.miginfocom.swing.MigLayout;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;

/**
 * Panel to display UI for exporting LAITS solution files in Author Mode.
 * This panel is built using Mig Layout
 * @author ramayantiwari
 */
public class ExportSolutionPanel extends JPanel{

    public ExportSolutionPanel() {
        super(new MigLayout());
        setMaximumSize(new Dimension(700, 800));
        //initializeComponents();
        addProblemDefinitionSection();
        addTimingSection();
        addDescriptionTreeSection();        
        addExportAction();
    }

    private void initializeComponents() {
        
    }

    private void addProblemDefinitionSection() {
        DragoonUIUtils.addSeparator(this, "Task Details");
        
        add(DragoonUIUtils.createLabel("Problem Name: "), "skip");
        add(DragoonUIUtils.createTextField(20), "wrap");
        
        add(DragoonUIUtils.createLabel("Problem Description: "), "skip");
        add(DragoonUIUtils.createTextArea(5, 35), "wrap");
        
        add(DragoonUIUtils.createLabel("Image URL: "), "skip");
        add(DragoonUIUtils.createTextField(34), "wrap");
    }
    
    private void addTimingSection() {
        DragoonUIUtils.addSeparator(this, "Task Timings");
        
        add(DragoonUIUtils.createLabel("Start: "), "skip");
        add(DragoonUIUtils.createTextField(5), "wrap");
        
        add(DragoonUIUtils.createLabel("End: "), "skip");
        add(DragoonUIUtils.createTextField(5), "wrap");
        
        add(DragoonUIUtils.createLabel("TimeStep: "), "skip");
        add(DragoonUIUtils.createTextField(5), "wrap");
        
        add(DragoonUIUtils.createLabel("Units: "), "skip");
        add(DragoonUIUtils.createComboBox(
                new String[] { "Years", "Months", "Days", "Hours", "Mins" }), "wrap");        
    }

    private void addDescriptionTreeSection() {
        DragoonUIUtils.addSeparator(this, "Description Tree");
        // Add Nodes
        add(DragoonUIUtils.createLabel("Nodes: "), "skip");
        add(DragoonUIUtils.createComboBox(
                new String[] { "Node 1", "Node 2", "Node 3"}), "wrap");        
        
        add(DragoonUIUtils.createLabel("Correct Description: "), "skip");
        add(DragoonUIUtils.createTextField(35), "wrap");
        
        add(DragoonUIUtils.createLabel("Fake Description: "), "skip");
        add(DragoonUIUtils.createTextArea(5, 35), "wrap");
        
        // Extra Line for space
        add(DragoonUIUtils.createLabel(" "), "skip");
        add(DragoonUIUtils.createLabel(" "), "wrap");
        
        JScrollPane pane = new JScrollPane();
        JTree dTree = DragoonUIUtils.createTree();
        dTree.setModel(getDemoDTreeModel());
        pane.setViewportView(dTree);
        
        add(DragoonUIUtils.createLabel("DTree Preview: "), "skip");
        add(pane, "wrap, wmin 350");
    }
    
    private void addExportAction() {
        add(DragoonUIUtils.createLabel(" "), "skip");
        add(DragoonUIUtils.createLabel(" "), "wrap");
        add(DragoonUIUtils.createLabel(" "), "skip");
        JButton exportAction = DragoonUIUtils.createButton("Export Solution");
        add(exportAction, "right");
    }
 
    private DefaultTreeModel getDemoDTreeModel(){
        DefaultMutableTreeNode treeNode1 = new DefaultMutableTreeNode("root");
        DefaultMutableTreeNode treeNode2 = new DefaultMutableTreeNode("A count of");
        DefaultMutableTreeNode treeNode3 = new DefaultMutableTreeNode("rabbits in the population");
        DefaultMutableTreeNode treeNode4 = new DefaultMutableTreeNode("at the beginning of the year");
        DefaultMutableTreeNode treeNode5 = new DefaultMutableTreeNode("and it is constant from year to year");
        treeNode4.add(treeNode5);
        treeNode5 = new DefaultMutableTreeNode("and it varies from year to year");
        treeNode4.add(treeNode5);
        treeNode3.add(treeNode4);
        treeNode4 = new DefaultMutableTreeNode("totaled up across all years");
        treeNode3.add(treeNode4);
        treeNode4 = new DefaultMutableTreeNode("averaged across all years");
        treeNode3.add(treeNode4);
        treeNode2.add(treeNode3);
        treeNode3 = new DefaultMutableTreeNode("rabbits born into the population");
        treeNode4 = new DefaultMutableTreeNode("during a year");
        treeNode5 = new DefaultMutableTreeNode("and it is constant from year to year");
        treeNode4.add(treeNode5);
        treeNode5 = new DefaultMutableTreeNode("and it varies from year to year");
        treeNode4.add(treeNode5);
        treeNode3.add(treeNode4);
        treeNode4 = new DefaultMutableTreeNode("across all years");
        treeNode3.add(treeNode4);
        treeNode4 = new DefaultMutableTreeNode("per year on average");
        treeNode3.add(treeNode4);
        treeNode2.add(treeNode3);
        treeNode1.add(treeNode2);
        
        return new DefaultTreeModel(treeNode1);
    }
    
//    public static void main(String args[]){
//        JFrame exportUITester = new JFrame("Export Solution");
//        JScrollPane panelScroll = new JScrollPane(new ExportSolutionPanel());
//        exportUITester.getContentPane().add(panelScroll);
//        exportUITester.setSize(630, 750);
//        exportUITester.setVisible(true);
//    }
}
