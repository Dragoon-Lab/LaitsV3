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
import edu.asu.laits.model.LaitsSolutionExporter;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Times;
import edu.asu.laits.model.Vertex;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.TextArea;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import javax.swing.BorderFactory;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.JTree;
import javax.swing.SwingConstants;
import javax.swing.filechooser.FileFilter;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import net.miginfocom.swing.MigLayout;
import org.apache.log4j.Logger;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;

/**
 * Panel to display UI for exporting LAITS solution files in Author Mode. 
 * This panel is built using Mig Layout
 *
 * @author ramayantiwari
 */
public class ExportSolutionPanel extends JPanel {

    JDialog parent = null;
    private JFileChooser saveAsFileChooser = null;
    private static Logger logs = Logger.getLogger("DevLogs");
    // UI Components
    private JTextField taskName = null;
    private JTextArea taskDesc = null;
    private JTextField imageURL = null;
    private JTextField startTime = null;
    private JTextField endTime = null;
    private JTextField timesteps = null;
    private JComboBox units = null;
    private String[] UNITS = new String[]{"Years", "Months", "Days", "Hours", "Mins"};

    public ExportSolutionPanel(JDialog parentFrame) {
        super(new MigLayout());
        this.parent = parentFrame;
        setMaximumSize(new Dimension(700, 800));
        initializeComponents();
        addProblemDefinitionSection();
        addTimingSection();
        addDescriptionTreeSection();
        addExportAction();
    }

    private void initializeComponents() {
        Task currentTask = ApplicationContext.getCurrentTask();

        taskName = DragoonUIUtils.createTextField(20);
        taskName.setText(currentTask.getTaskName());

        taskDesc = DragoonUIUtils.createTextArea(5, 35);
        taskDesc.setText(currentTask.getTaskDescription());

        imageURL = DragoonUIUtils.createTextField(34);
        imageURL.setText(currentTask.getImageURL());

        startTime = DragoonUIUtils.createTextField(5);
        startTime.setText(String.valueOf(currentTask.getTimes().getStartTime()));

        endTime = DragoonUIUtils.createTextField(5);
        endTime.setText(String.valueOf(currentTask.getTimes().getEndTime()));

        timesteps = DragoonUIUtils.createTextField(5);
        timesteps.setText(String.valueOf(currentTask.getTimes().getTimeStep()));

        units = DragoonUIUtils.createComboBox(UNITS);
        units.setSelectedItem(currentTask.getUnits());
    }

    private void addProblemDefinitionSection() {
        DragoonUIUtils.addSeparator(this, "Task Details");

        add(DragoonUIUtils.createLabel("Problem Name: "), "skip");
        add(taskName, "wrap");

        add(DragoonUIUtils.createLabel("Problem Description: "), "skip");
        add(taskDesc, "wrap");

        add(DragoonUIUtils.createLabel("Image URL: "), "skip");
        add(imageURL, "wrap");
    }

    private void addTimingSection() {
        DragoonUIUtils.addSeparator(this, "Task Timings");

        add(DragoonUIUtils.createLabel("Start: "), "skip");
        add(startTime, "wrap");

        add(DragoonUIUtils.createLabel("End: "), "skip");
        add(endTime, "wrap");

        add(DragoonUIUtils.createLabel("TimeStep: "), "skip");
        add(timesteps, "wrap");

        add(DragoonUIUtils.createLabel("Units: "), "skip");
        add(units, "wrap");
    }

    private void addDescriptionTreeSection() {
        DragoonUIUtils.addSeparator(this, "Description Tree");
        // Add Nodes
        add(DragoonUIUtils.createLabel("Nodes: "), "skip");
        
        List<String> vertexList = MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVerticesByName();
        String[] nodeNames = vertexList.toArray(new String[vertexList.size()]);
        
        add(DragoonUIUtils.createComboBox(nodeNames), "wrap");
        
        String desc = "";
        if(nodeNames != null && nodeNames.length != 0) {
            Vertex selectedVertex = MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(nodeNames[0]);
            desc = selectedVertex.getCorrectDescription();
        }
        
        add(DragoonUIUtils.createLabel("Correct Description: "), "skip");
        JTextField correctDesc = DragoonUIUtils.createTextField(35);
        correctDesc.setText(desc);
        add(correctDesc, "wrap");
        
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

        exportAction.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent e) {
                // Perform Validation before exporting the task
                if (!validateExportSolutionPanel()) return;
                setTaskDetails();

                // Exporter will read all the information from task object
                LaitsSolutionExporter exporter = new LaitsSolutionExporter();
                    
                if(exporter.export()){
                    JOptionPane.showMessageDialog(getRootPane(), 
                            "Solution saved to server.",
                            "Solution Exported", 
                            JOptionPane.INFORMATION_MESSAGE);
                } else {

                    logs.info("Exporting Laits Solution File.");

                    int returnVal = getSaveFileChooser().showSaveDialog(getRootPane());
                    if (returnVal == JFileChooser.APPROVE_OPTION) {

                        File selectedFile = getSaveFileChooser().getSelectedFile();

                        if (!selectedFile.getName().matches("(.*)(\\.xml)")) {

                            if (selectedFile.getName().matches("\".*\"")) {
                                if (selectedFile.getName().length() < 3) {
                                    JOptionPane.showMessageDialog(
                                            getRootPane(), "Can not save to file " + selectedFile.getAbsolutePath()
                                            + "\nBecause of the following reason:\n" + "File name is too short.",
                                            "Unable to save file", JOptionPane.ERROR_MESSAGE);
                                    return;
                                } else {
                                    selectedFile = new File(selectedFile.getParent() + File.separator
                                            + selectedFile.getName().substring(1, (int) (selectedFile.getName().length() - 2)));
                                }
                            } else {
                                selectedFile = new File(selectedFile.getAbsoluteFile()
                                        + ".xml");
                            }
                        }

                        if(exporter.save_file(selectedFile)){
                            JOptionPane.showMessageDialog(getRootPane(), 
                                "Solution saved to file "+selectedFile.toString(),
                            "Solution Exported", 
                            JOptionPane.INFORMATION_MESSAGE);
                       } else {
                            JOptionPane.showMessageDialog(getRootPane(), 
                                        "Solution Could not be exported.",
                                        "Export Error",
                                        JOptionPane.ERROR_MESSAGE);
                        }
                    }
                }
                // BvdS:  I have no idea where this is supposed to go
                parent.dispose();
            }
        });

        add(exportAction, "right");
    }

    private boolean validateExportSolutionPanel() {
        logs.info("Validating Inputs in Export Solution Panel");
        
        StringBuilder errorMessage = new StringBuilder();

        // Validte Input Fields
        if (taskName.getText().isEmpty()) {
            errorMessage.append("Problem Name can not be empty. \n");
        }

        if (taskDesc.getText().isEmpty()) {
            errorMessage.append("Problem Description can not be empty. \n");
        }

        if (startTime.getText().isEmpty()) {
            errorMessage.append("Start Time can not be empty. \n");
        }

        if (endTime.getText().isEmpty()) {
            errorMessage.append("End Time can not be empty. \n");
        }

        if (timesteps.getText().isEmpty()) {
            errorMessage.append("End Time can not be empty. \n");
        }

        // If there was an error, Show the error string and return false
        if (errorMessage.length() > 0) {
            logs.info("Error in Validation " + errorMessage.toString());
            
            JOptionPane.showMessageDialog(getRootPane(), errorMessage.toString(),
                    "Validation Error", JOptionPane.ERROR_MESSAGE);
            return false;
        }

        return true;
    }

    private void setTaskDetails() {
        logs.info("Setting Task Details");
        
        Task currentTask = ApplicationContext.getCurrentTask();

        currentTask.setTaskName(taskName.getText());
        currentTask.setTaskDescription(taskDesc.getText());
        currentTask.setImageURL(imageURL.getText());
        currentTask.setTaskType("Challenge");
        currentTask.setTaskType("Whole");
        currentTask.setTimes(new Times(startTime.getText(), endTime.getText(), timesteps.getText()));
    }

    private JFileChooser getSaveFileChooser() {
        if (saveAsFileChooser == null) {
            saveAsFileChooser = new JFileChooser();
            saveAsFileChooser.setDialogTitle("Export Model as LAITS Solution...");
            saveAsFileChooser.setAcceptAllFileFilterUsed(true);
            saveAsFileChooser.addChoosableFileFilter(new FileFilter() {
                @Override
                public boolean accept(File f) {
                    return f.getName().matches(".*.xml");
                }

                @Override
                public String getDescription() {
                    return "Laits Solution Files (*.xml)";
                }
            });
        }
        return saveAsFileChooser;
    }

    private DefaultTreeModel getDemoDTreeModel() {
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
