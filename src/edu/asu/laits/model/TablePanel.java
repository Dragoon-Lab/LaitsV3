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
 * @author: rptiwari
 */
package edu.asu.laits.model;

import java.awt.BorderLayout;
import java.text.DecimalFormat;
import java.util.List;
import java.util.logging.Level;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;
import org.apache.log4j.Logger;
import org.jdesktop.swingx.JXTaskPane;

/**
 * @author deepak
 * @author pradeep
 */
public class TablePanel extends JXTaskPane {

    private  Object[][] data;
    private  String[] columnNames;
    private  JTable tableValuesTable;
    private  Graph<Vertex, Edge> currentGraph;
    private  Logger logs = Logger.getLogger("DevLogs");
    private  Logger activityLogs = Logger.getLogger("ActivityLogs");

    public TablePanel(Graph<Vertex, Edge> graph) {
        this.currentGraph = graph;
        init();
    }
    
    
    
    private void init() {
        JPanel tableValuesPanel = new JPanel();
        tableValuesPanel.setLayout(new BorderLayout());
        createTableValues(new ModelEvaluator(currentGraph));

        if (data != null && columnNames != null) {
            tableValuesTable = new JTable();
            tableValuesTable.setModel(new DefaultTableModel(data, columnNames));

            JScrollPane tableValuesContainer = new JScrollPane(tableValuesTable);

            tableValuesPanel.add(tableValuesContainer, BorderLayout.CENTER);

            add(tableValuesPanel);
//            tableValuesFrame.getContentPane().add(tableValuesPanel);

//            tableValuesFrame.pack();
//            tableValuesFrame.setVisible(true);
        }
    }

    private void createTableValues(ModelEvaluator modelEvaluator) {
        try {
            modelEvaluator.run(); //get values
        } catch (ModelEvaluationException ex) {
              //handle these exceptions
        }
                   
        
        try {
            double startTime = modelEvaluator.getTimes().getStartTime();
            double timeStep = modelEvaluator.getTimes().getTimeStep();
            int totalPoints = modelEvaluator.getTimes().getNumberSteps();
            int constantVertices = modelEvaluator.getConstantVertices();
            Vertex currentVertex = null;
            DecimalFormat decimalFormat = new DecimalFormat("#.##");

            List<Vertex> vertexList = modelEvaluator.returnArrangedVertexList();

            columnNames = new String[vertexList.size() - constantVertices + 1];

            columnNames[0] = "Time";
            int index = 1;
            for (int i = constantVertices; i < vertexList.size(); i++) {
                columnNames[index] = vertexList.get(i).getName();
                index++;
            }

            data = new Object[totalPoints][vertexList.size() - constantVertices + 1];

            double time = startTime, temp;
            for (int i = 0; i < totalPoints; i++, time += timeStep) {
                // data[i][0] will always correspond to timestamp
                // Set timestamp value (i) if j=0
                data[i][0] = (float) time;
                index = 1;
                for (int j = constantVertices; j < vertexList.size(); j++) {
                    currentVertex = vertexList.get(j);
                    List<Double> values = currentVertex.getCorrectValues();
                    temp = values.get(i);
                    data[i][index] = (float) temp;
                    index++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public void updateTableData(Graph graph){
        DefaultTableModel tableModel = (DefaultTableModel) tableValuesTable.getModel();
        createTableValues(new ModelEvaluator((graph)));
        tableModel.setDataVector(data, columnNames);
        tableModel.fireTableDataChanged();
    }
    
}
