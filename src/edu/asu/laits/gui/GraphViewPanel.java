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

package edu.asu.laits.gui;

import com.rits.cloning.Cloner;
import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.PlotPanel;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JSlider;
import javax.swing.JFormattedTextField;
import javax.swing.JScrollPane;
import javax.swing.JComponent;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;
import java.awt.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import org.apache.commons.net.ntp.TimeStamp;
import org.jfree.data.xy.XYDataset;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;


/**
 *
 * @author ramayantiwari
 * 
 */
public class GraphViewPanel{
    private Graph<Vertex, Edge> currentGraph;
    private JXTaskPaneContainer chartContainer;
    private JDialog parent;
    private JSlider testSlider;
    private Map<String,Double> vertexValues; //Store vertex and old values
    
    
    Map<JComponent, Vertex> map = new HashMap<JComponent, Vertex>();
    
    public GraphViewPanel(Graph<Vertex, Edge> graph, JDialog parent){
        currentGraph = graph;
        this.parent = parent;
        this.vertexValues = new HashMap<String,Double>();
        initializeComponents();

        JScrollPane panelScroll = new JScrollPane(chartContainer);
        parent.add(panelScroll);
    }
       
    private void initializeComponents(){
        chartContainer = new JXTaskPaneContainer();
        addCharts();
        addSliders();
    }
    
    private void addSliders() {
        Task t = null;
        DoubleJSlider newSlider;
        JLabel sliderLabel;
        JFormattedTextField sliderAmount;
        if(!ApplicationContext.isAuthorMode()){
            t = new Task(ApplicationContext.getCorrectSolution().getTimes(),
                         ApplicationContext.getCorrectSolution().getGraphUnits());
        }
        for(Vertex currentVertex : currentGraph.vertexSet()) {
            if(currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT)) {
                newSlider = addSlider(currentVertex, t);
                newSlider.setPaintTicks(true);
                newSlider.setPaintLabels(true);
                chartContainer.add(newSlider);
                sliderLabel = new JLabel(currentVertex.getName());
                chartContainer.add(sliderLabel);
                sliderAmount = new JFormattedTextField();
                sliderAmount.setText(String.valueOf(newSlider.getDoubleValue()));
                chartContainer.add(sliderAmount);
                newSlider.addChangeListener(new SliderListener(sliderAmount, currentVertex, this));
            }
        }
    }
    
    private DoubleJSlider addSlider(Vertex vertex, Task task){
        return new DoubleJSlider(0, 5*vertex.getInitialValue(), vertex.getInitialValue());
    }
    
    private void addCharts(){
        Task t = null;
        if(!ApplicationContext.isAuthorMode()){
            t = new Task(ApplicationContext.getCorrectSolution().getTimes(),
                         ApplicationContext.getCorrectSolution().getGraphUnits());
        }
        for(Vertex currentVertex : currentGraph.vertexSet()){
            System.out.println("Attempting to add chart for " + currentVertex.getName());
            JXTaskPane plotPanel = addChart(currentVertex, t);
            if(plotPanel != null){
                chartContainer.add(plotPanel);
                map.put(plotPanel, currentVertex);
            }
        }        
    }
    
    private JXTaskPane addChart(Vertex vertex, Task task){
        PlotPanel plotPanel = null;
        if(task == null){
            plotPanel = new PlotPanel(vertex, currentGraph.getCurrentTask().getTimes(), 
                    currentGraph.getCurrentTask().getUnits());
        }else if(!vertex.getVertexType().equals(Vertex.VertexType.CONSTANT)){
             plotPanel = new PlotPanel(vertex, task.getTimes(), task.getUnits()); 
        }
        return plotPanel;
    }
      
    int count1 = 0;
    int count2 = 0;
            
    public void repaintCharts(){
        Component[] components = chartContainer.getComponents();
        List<Vertex> vertices = new ArrayList<Vertex>();
        for(Component c : components){
            if(c instanceof PlotPanel){
                System.out.println("repaint check succeeded, attempting to repaint " + map.get(c).getName());
                vertices.add(map.get(c));
             ((PlotPanel)c).updateChartAfterSliderChange(currentGraph,map.get(c),ApplicationContext.getCorrectSolution().getTimes(),vertexValues);
            }
        }
        //restore oringal 
        PlotPanel.restoreOrignalChart(currentGraph, vertexValues);
   }
    private class SliderListener implements ChangeListener {
        
        private JFormattedTextField textSource;
        private Vertex vertex;
        private GraphViewPanel panel;
        public SliderListener(JFormattedTextField amount, Vertex v, GraphViewPanel g) {
            textSource = amount;
            vertex = v;
            panel = g;
        } 

        @Override
        public void stateChanged(ChangeEvent e) {
            DoubleJSlider source = (DoubleJSlider)e.getSource();
            textSource.setText(String.valueOf(source.getDoubleValue()));
            vertex.setInitialValue(source.getDoubleValue());
            //copy vertexvalue first time
            if(!vertexValues.containsKey(vertex.getName()))
                vertexValues.put(vertex.getName(), vertex.getInitialValue());
            panel.repaintCharts();
        }
    }
}
