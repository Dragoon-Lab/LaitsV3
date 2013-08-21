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
import edu.asu.laits.gui.nodeeditor.PlotPanel;
import edu.asu.laits.model.Edge;
import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Task;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import javax.swing.JDialog;
import javax.swing.JScrollPane;
import org.jdesktop.swingx.JXTaskPane;
import org.jdesktop.swingx.JXTaskPaneContainer;

/**
 *
 * @author ramayantiwari
 */
public class GraphViewPanel{
    private Graph<Vertex, Edge> currentGraph;
    JXTaskPaneContainer chartContainer;
    JDialog parent;
    
    public GraphViewPanel(Graph<Vertex, Edge> graph, JDialog parent){
        currentGraph = graph;
        this.parent = parent;
        initializeComponents();
        addCharts();

        JScrollPane panelScroll = new JScrollPane(chartContainer);
        parent.add(panelScroll);
    }
    
    private void initializeComponents(){
        chartContainer = new JXTaskPaneContainer();
    }
    
    private void addCharts(){
        Task t = null;
        if(!ApplicationContext.getAppMode().equalsIgnoreCase("AUTHOR")){
            t = new Task(ApplicationContext.getCorrectSolution().getStartTime(), 
                    ApplicationContext.getCorrectSolution().getEndTime(), 
                    ApplicationContext.getCorrectSolution().getGraphUnits());
        }
        for(Vertex currentVertex : currentGraph.vertexSet()){
            chartContainer.add(addChart(currentVertex, t));
        }        
    }
    
    private JXTaskPane addChart(Vertex vertex, Task task){
        PlotPanel plotPanel = null;
        if(task == null){
            plotPanel = new PlotPanel(vertex, currentGraph.getCurrentTask().getStartTime(), 
                    currentGraph.getCurrentTask().getUnits());
        }else{
             plotPanel = new PlotPanel(vertex, task.getStartTime(), task.getUnits()); 
        }
        return plotPanel;
    }
}
