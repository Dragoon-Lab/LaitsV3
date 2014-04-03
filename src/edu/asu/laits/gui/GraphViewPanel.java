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

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.PlotPanel;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.ModelEvaluationException;
import edu.asu.laits.model.ModelEvaluator;
import edu.asu.laits.model.TablePanel;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Vertex;
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
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.border.BevelBorder;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import net.miginfocom.swing.MigLayout;
import org.apache.log4j.Logger;

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
    private ChartDialogMode mode;
    private JPanel sliderPanel;
    
    private static Logger logs = Logger.getLogger("DevLogs");
    
    public GraphViewPanel(Graph<Vertex, Edge> graph, JDialog parent, ChartDialogMode mode){
        currentGraph = graph;
        this.parent = parent;
        this.mode = mode;
        initializeComponents();

        JScrollPane panelScroll = new JScrollPane(chartContainer);
        parent.add(panelScroll);
    }
     
    private void initializeComponents(){
        chartContainer = new JXTaskPaneContainer();
        sliderPanel =  new JPanel(new MigLayout());
        addCharts();
        addSliders();
        chartContainer.add(sliderPanel);
    }
    
    private void addSliders() {
        logs.debug("Adding Sliders in Chart Dialog.");
        
        DoubleJSlider newSlider;
        JLabel sliderLabel;
        JTextField sliderAmount;
        
        for(Vertex currentVertex : currentGraph.vertexSet()) {

            if(currentVertex.getVertexType().equals(Vertex.VertexType.CONSTANT) || currentVertex.getVertexType().equals(Vertex.VertexType.STOCK) ) {
                newSlider = addSlider(currentVertex);

                newSlider.setPaintTicks(true);
                newSlider.setPaintLabels(true);
                
                sliderLabel = new JLabel(currentVertex.getName());
                sliderPanel.add(sliderLabel, "skip");
                sliderPanel.add(newSlider, "right, width min:340:380");
                //chartContainer.add(sliderLabel);
                
                sliderAmount = new JTextField(8);
                sliderAmount.setText(String.valueOf(newSlider.getDoubleValue()));
                sliderAmount.setEditable(false);
                sliderPanel.add(sliderAmount, "wrap");
                
                newSlider.addChangeListener(new SliderListener(sliderAmount, currentVertex, this));
            }
        }
    }
    
    private DoubleJSlider addSlider(Vertex vertex){
        logs.debug("Adding Slider in Chart Dialog for Vertex : " + vertex.getName());
        //handle negative values
        if(vertex.getInitialValue() > 0)
            return new DoubleJSlider(0, 5 * vertex.getInitialValue(), vertex.getInitialValue());
        else
            return new DoubleJSlider(-1 , 1, vertex.getInitialValue());            
    }
    
    private void addCharts(){
        //if Mode is Graph Mode, Plot Graph against each not constant node
        if(mode.equals(ChartDialogMode.Graph)){
            for(Vertex currentVertex : currentGraph.vertexSet()){
                logs.debug("Attempting to add chart for " + currentVertex.getName());
                JXTaskPane plotPanel = addChart(currentVertex);
                if(plotPanel != null){
                    chartContainer.add(plotPanel);
                    map.put(plotPanel, currentVertex);
                }
            }
        }else{
           logs.debug("Attempting to plot table for given graph");
           JXTaskPane tablePanel = addTable(currentGraph);
           if(tablePanel != null){
               chartContainer.add(tablePanel);
           }
        }        
    }
    
    private JXTaskPane addTable(Graph currentGraph){
        TablePanel tablePanel = new TablePanel(currentGraph);
        return tablePanel;
    }
    
    private JXTaskPane addChart(Vertex vertex){
        PlotPanel plotPanel = null;
        if(!vertex.getVertexType().equals(Vertex.VertexType.CONSTANT)){
            plotPanel = new PlotPanel(vertex);
        }
        
        return plotPanel;
    }
      
    public void repaintCharts(Graph<Vertex,Edge> clonnedGraph){
        logs.debug("Repainting Chart with Cloned Vertex");
        Component[] components = chartContainer.getComponents();

        try {
            logs.debug("Evaluating Cloned Graph");
            new ModelEvaluator(clonnedGraph).run();
            
            for(Component c : components){
                if(c instanceof PlotPanel){
                    logs.info("repaint check succeeded, attempting to repaint " + map.get(c).getName());
                    ((PlotPanel)c).updateChartAfterSliderChange(clonnedGraph, map.get(c));
                }
            }
        } catch (ModelEvaluationException ex) {
            ex.printStackTrace();
            logs.error(ex.getMessage());
        }
   }
    
    private void repaintTable(Graph<Vertex,Edge> clonnedGraph) {        
        Component[] components = chartContainer.getComponents();
        for(Component c : components){
            if(c instanceof TablePanel){
                logs.debug("updating table ");
                ((TablePanel)c).updateTableData(clonnedGraph);
            }
        }
    }
    
    public enum ChartDialogMode{
        Graph,
        Table
    }    
    
    Map<JComponent, Vertex> map = new HashMap<JComponent, Vertex>();
    /**
     * Custom Listener for Slider Change event
     */
    private class SliderListener implements ChangeListener {        
        private JTextField textSource;
        private Vertex vertex;
        private GraphViewPanel panel;
        
        public SliderListener(JTextField amount, Vertex v, GraphViewPanel g) {
            textSource = amount;
            vertex = v;
            panel = g;
        } 

        @Override
        public void stateChanged(ChangeEvent e) {
            DoubleJSlider source = (DoubleJSlider)e.getSource();
            textSource.setText(String.valueOf(source.getDoubleValue()));
            Graph<Vertex,Edge> clonnedGraph = (Graph<Vertex,Edge>) currentGraph.clone();
            //modify value in new vertex
            clonnedGraph.getVertexByName(vertex.getName()).setInitialValue(source.getDoubleValue());
            
            if(mode.equals(ChartDialogMode.Graph))
                panel.repaintCharts(clonnedGraph);
            else
                panel.repaintTable(clonnedGraph);
        }
    }
}
