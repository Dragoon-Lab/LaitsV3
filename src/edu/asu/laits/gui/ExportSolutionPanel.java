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
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;

/**
 *
 * @author ramayantiwari
 */
public class ExportSolutionPanel {

    JXTaskPaneContainer solutionContainer;
    JDialog parent;

    public ExportSolutionPanel(JDialog parent) {
        this.parent = parent;
        initializeComponents();
        addProblemDefinitionSection();
        addTimingSection();
        addDescriptionTreeSection();
        
        JScrollPane panelScroll = new JScrollPane(solutionContainer);
        parent.add(panelScroll);
    }

    private void initializeComponents() {
        solutionContainer = new JXTaskPaneContainer();
    }

    private void addProblemDefinitionSection() {
        JXTaskPane problemDescPanel = new JXTaskPane();
        problemDescPanel.setTitle("Task Details");

        JLabel labelProblemName = new JLabel("Problem Name: ");
        JTextField textProbleName = new JTextField();
        
        JLabel labelProblemDesc = new JLabel("Problem Description: ");
        JTextArea problemDescriptionArea = new JTextArea(5, 100);
        problemDescriptionArea.setBorder(BorderFactory.createLineBorder(Color.BLACK));
        
        problemDescPanel.add(labelProblemName);
        problemDescPanel.add(textProbleName);
        problemDescPanel.add(labelProblemDesc);
        problemDescPanel.add(problemDescriptionArea);

        solutionContainer.add(problemDescPanel);
    }
    
    private void addTimingSection() {
        JXTaskPane timingPanel = new JXTaskPane();
        timingPanel.setTitle("Task Timings");

        JLabel startTime = new JLabel("Start: ");
        JTextField textStartTime = new JTextField();
        
        JLabel endTime = new JLabel("End: ");
        JTextField textEndTime = new JTextField();
        
        JLabel units = new JLabel("Units: ");
        JTextField textUnits = new JTextField();
        
        timingPanel.add(startTime);
        timingPanel.add(textStartTime);
        timingPanel.add(endTime);
        timingPanel.add(textEndTime);
        timingPanel.add(units);
        timingPanel.add(textUnits);
        
        solutionContainer.add(timingPanel);
    }

    private void addDescriptionTreeSection() {
        JXTaskPane dTreePanel = new JXTaskPane();
        dTreePanel.setTitle("Description Tree");

        
        JPanel bottom = new JPanel(new BorderLayout(0, 0));
        JButton exportButton = new JButton("Export");

        bottom.add(exportButton, BorderLayout.EAST);
        dTreePanel.add(bottom);
        
        solutionContainer.add(dTreePanel);
    }
       
}
