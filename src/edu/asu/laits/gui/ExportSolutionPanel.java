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
import edu.asu.laits.model.Edge.ErrorReaderException;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.LaitsSolutionExporter;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Times;
import edu.asu.laits.model.Vertex;
import java.awt.Dimension;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JDialog;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.JTree;
import javax.swing.tree.DefaultMutableTreeNode;
import javax.swing.tree.DefaultTreeModel;
import net.miginfocom.swing.MigLayout;
import org.apache.log4j.Logger;

/**
 * Panel to display UI for exporting LAITS solution files in Author Mode. This
 * panel is built using Mig Layout
 *
 * @author ramayantiwari
 */
public class ExportSolutionPanel extends JPanel {

    JDialog parent = null;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    // UI Components
    private JTextField taskName = null;
    private JTextArea taskDesc = null;
    private JTextField imageURL = null;
    private JTextField startTime = null;
    private JTextField endTime = null;
    private JTextField timesteps = null;
    private JComboBox units = null;
    private String[] UNITS = new String[]{"Years", "Months", "Days", "Hours", "Mins"};
    private Graph modelGraph;
    private JTree dTree;
    private JComboBox nodeNamesComboBox;
    JTextArea fakeDescTextArea;
    JTextField correctDesc;

    public ExportSolutionPanel(JDialog parentFrame) {
        super(new MigLayout());
        this.parent = parentFrame;
        modelGraph = MainWindow.getInstance().getGraphEditorPane().getModelGraph();
        setMaximumSize(new Dimension(700, 800));
        initializeComponents();
        addProblemDefinitionSection();
        addTimingSection();
        addDescriptionTreeSection();
        addActions();
    }

    private void initializeComponents() {
        Task currentTask = ApplicationContext.getCurrentTask();

        taskName = DragoonUIUtils.createTextField(20);
        taskName.setText(ApplicationContext.getCurrentTaskID());

        taskDesc = DragoonUIUtils.createTextArea(5, 35);
        taskDesc.setLineWrap(true);
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

        JScrollPane descScrollPane = new JScrollPane();
        descScrollPane.setViewportView(taskDesc);
        add(DragoonUIUtils.createLabel("Problem Description: "), "skip");
        add(descScrollPane, "wrap");

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
        logs.info("Adding Description Tree Section");
        
        fakeDescTextArea = DragoonUIUtils.createTextArea(5, 35);
        correctDesc = DragoonUIUtils.createTextField(35);

        DragoonUIUtils.addSeparator(this, "Description Tree");
        // Add Nodes
        add(DragoonUIUtils.createLabel("Nodes: "), "skip");

        List<String> vertexList = modelGraph.getVerticesByName();
        String[] nodeNames = vertexList.toArray(new String[vertexList.size()]);

        // Add Combo box for Displaying Node names, attach change listener to save the added descriptions
        nodeNamesComboBox = DragoonUIUtils.createComboBox(nodeNames);        
        nodeNamesComboBox.addItemListener(new NodeNameChangeListener());                
        add(nodeNamesComboBox, "wrap");

        String desc = "";
        
        if (nodeNames != null && nodeNames.length != 0) {
            logs.info("Setting correct and fake description for selected node");
            Vertex selectedVertex = MainWindow.getInstance().getGraphEditorPane().getModelGraph().getVertexByName(nodeNames[0]);
            desc = selectedVertex.getCorrectDescription();
            List<String> fakeDList = selectedVertex.getFakeDescription();
            fakeDescTextArea.setText(convertFakeDescListtoTextAreaText(fakeDList));
        }

        add(DragoonUIUtils.createLabel("Correct Description: "), "skip");

        correctDesc.setText(desc);
        add(correctDesc, "wrap");

        add(DragoonUIUtils.createLabel("Fake Description: "), "skip");
        add(fakeDescTextArea, "wrap");

        // Extra Line for space
        add(DragoonUIUtils.createLabel(" "), "skip");
        add(DragoonUIUtils.createLabel(" "), "wrap");

        JScrollPane dTreeScrollPane = new JScrollPane();
        dTreeScrollPane.setPreferredSize(new Dimension(400, 250));
        dTree = DragoonUIUtils.createTree();
        dTree.setVisibleRowCount(10);
        dTree.setModel(buildDTreeModel());
        dTreeScrollPane.setViewportView(dTree);

        add(DragoonUIUtils.createLabel("DTree Preview: "), "skip");
        add(dTreeScrollPane, "wrap, wmin 350");
    }

    private void addActions() {
        // Create 2 lines of empty spaces to create spaces above action buttons
        add(DragoonUIUtils.createLabel(" "), "skip");
        add(DragoonUIUtils.createLabel(" "), "wrap");

        // Preview button to preview decision tree construction
        JButton dTreePreviewAction = DragoonUIUtils.createButton("DTree Preview");
        dTreePreviewAction.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent e) {
                // Build DTree from Correct and Fake Description
                activityLogs.debug("Author is Previewing Description Tree");
                dTree.setModel(buildDTreeModel());
            }
        });
        add(dTreePreviewAction, "skip");

        // Export Solution Action
        JButton exportAction = DragoonUIUtils.createButton("Export Solution");
        exportAction.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent e) {
                doexportAction();
            }
        });

        add(exportAction, "right");
    }

    private void doexportAction() {
        // Perform Validation before exporting the task
        logs.info("Exporting Solution");
        activityLogs.debug("Author is Exporting Solution");
        
        if (validateExportSolutionPanel()) {
            saveSelectedNodeDescription();
            setTaskDetails();

            logs.info("Exporting Dragoon Solution File.");
            try {            
                saveToServer();
            } catch (ErrorReaderException ex) {
                logs.error("Error in reading edge info. Export Solution unsuccessful");
            }
        }
    }

    /**
     * Save currently visible correct and incorrect description to Vertex before exporting solution.
     * This is required as change action is not fired for currently visible node. 
     */
    private void saveSelectedNodeDescription() {
        logs.info("saving correct and fake description for currently selected node.");
        
        String selectedVertexName = (String)nodeNamesComboBox.getSelectedItem();
        Vertex v = modelGraph.getVertexByName(selectedVertexName);
        updateNodeDescription(v);
    }
    
    /**
     * Tries to save to the specified file
     */
    private void saveToServer() throws ErrorReaderException {
        logs.info("Exporting Dragoon Solution to Server");

        // Exporter will read all the information from task object
        LaitsSolutionExporter exporter = new LaitsSolutionExporter();
        if (exporter.export()) {
            activityLogs.debug("Author's solution is exported to server. Problem name: '" + taskName.getText().trim() + "'");
            JOptionPane.showMessageDialog(getRootPane(), "Solution File Saved to Server.",
                    "Solution File Exported", JOptionPane.INFORMATION_MESSAGE);
        } else {
            activityLogs.debug("Author's solution could not be exported to server.");
            JOptionPane.showMessageDialog(getRootPane(), "Solution Could not be exported.",
                    "Export Error", JOptionPane.ERROR_MESSAGE);
        }

        // This is being done so that newly created dtree, and task details are pushed to server.
        PersistenceManager.saveSession();
        parent.dispose();
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

    /**
     * Set task details for exporting solution file.
     * These details will be used to create Student Mode Task.
     */
    private void setTaskDetails() {
        logs.info("Setting Task Details");

        Task currentTask = ApplicationContext.getCurrentTask();

        currentTask.setTaskName(taskName.getText());
        currentTask.setTaskDescription(taskDesc.getText());
        currentTask.setImageURL(imageURL.getText());
        currentTask.setPhase("Challenge");
        currentTask.setTaskType("Whole");
        currentTask.setTimes(new Times(startTime.getText(), endTime.getText(), timesteps.getText()));
    }

    /**
     * Prepare Description Tree for preview.
     * 
     * @return DefaultTreeModel to publish on DTree
     */
    private DefaultTreeModel buildDTreeModel() {
        DefaultMutableTreeNode root = new DefaultMutableTreeNode("root");
        Set<Vertex> vertexSet = modelGraph.vertexSet();
        Set<String> allDescriptions = new HashSet<String>();
        
        for(Vertex v : vertexSet){
            allDescriptions.add(v.getCorrectDescription());
            for(String s : v.getFakeDescription()) {
                String[] parts = s.split("#");
                allDescriptions.add(parts[0].trim());
            }            
        }
        logs.info("All Description Set : " + allDescriptions);
        
        for(String s : allDescriptions) {
            DefaultMutableTreeNode node = new DefaultMutableTreeNode(s);
            root.add(node);
        }
        
        return new DefaultTreeModel(root);
    }
    
    /**
     * Listener to perform action on change event of nodes of combo box.
     */
    class NodeNameChangeListener implements ItemListener {
        @Override
        public void itemStateChanged(ItemEvent event) {
            String selectedName = (String)event.getItem();
            logs.info("Selected node name : " + selectedName);
            activityLogs.debug("Author Selected node name : " + selectedName);
            
            Vertex v = modelGraph.getVertexByName(selectedName);
            
            if (event.getStateChange() == ItemEvent.SELECTED) {
                List<String> fakeDList = v.getFakeDescription();
                fakeDescTextArea.setText(convertFakeDescListtoTextAreaText(fakeDList));                
                correctDesc.setText(v.getCorrectDescription());
            }
            if(event.getStateChange() == ItemEvent.DESELECTED) {
                updateNodeDescription(v);
            }            
        }
    }    
    
    private void updateNodeDescription(Vertex vertex) {
        List<String> updatedfakeDList = convertTextAreaTextToFakeDescList(fakeDescTextArea.getText());
        vertex.setFakeDescription(updatedfakeDList);
        vertex.setCorrectDescription(correctDesc.getText().trim());
    }
    
    // Helper Methods
    private String convertFakeDescListtoTextAreaText(List<String> fakeDList) {
        logs.info("Converting fake description list to TextArea list");
        
        String fakeDesc = "";
        for (int i = 0; i < fakeDList.size() - 1; i++) {
            fakeDesc += fakeDList.get(i) + "\n";
        }

        if (fakeDList.size() > 0) {
            fakeDesc += fakeDList.get(fakeDList.size() - 1);
        }

        return fakeDesc;
    }
    
    private List<String> convertTextAreaTextToFakeDescList(String text) {
        logs.info("Converting TextArea list to FakeDescription List");
        
        String[] splitText = text.split("\n");
        List<String> result = new ArrayList<String>();
        for(String s : splitText){
            if(s != null && s.trim().length() > 0)
                result.add(s);
        }
        
        return result;
    }
}
