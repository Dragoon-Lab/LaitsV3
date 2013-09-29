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
package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import org.apache.log4j.Logger;
import org.jdesktop.swingx.JXTaskPane;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYItemRenderer;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.data.xy.XYDataset;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;
import org.jfree.ui.RectangleInsets;
import org.jfree.util.ShapeUtilities;

public class PlotPanel extends JXTaskPane {

    private String units;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private static Color transparent = new Color(0, 0, 0, 0);
    
    //Dataset per Graph
    private XYDataset xydataset;
    private JFreeChart jfreeChart;

    public PlotPanel(Vertex vertex, Times times, String units) {
        logs.info("Initializing Plot Panel. Vertex: "+vertex.getName()+
                " Units: "+units);
        List<Vertex> v = new ArrayList<Vertex>();
        v.add(vertex);
        this.units = units;

        if (ApplicationContext.isStudentMode() || 
                ApplicationContext.isCoachedMode()) {
            Vertex correctVertex = ApplicationContext.getCorrectSolution()
                    .getSolutionGraph().getVertexByName(vertex.getName());
            v.add(correctVertex);
        }
        
        Dimension d = new Dimension(575, 190);
        init(v, times, d);
    }

    private void init(List<Vertex> vertices, Times times, Dimension d) {
        this.setTitle(vertices.get(0).getName());
        this.setBackground(transparent);
        this.setOpaque(false);

        XYDataset dataset = createSolutionDataset(vertices, times);
        this.xydataset = dataset;
        JFreeChart chart = createChart(dataset, vertices.get(0).getName(), 
                times.getStartTime(), times.getEndTime());
        
        this.jfreeChart = chart;
        
        
        ChartPanel chartPanel = new ChartPanel(chart);
        chartPanel.setFillZoomRectangle(true);
        chartPanel.setMouseWheelEnabled(true);
        chartPanel.setDomainZoomable(true);
        chartPanel.setRangeZoomable(true);
        chart.getTitle().setFont(new Font("Arial", Font.BOLD, 14));

        // The size of the panel depends on the size of the GraphDialog panel

        chartPanel.setPreferredSize(d);
        chartPanel.setSize(d);
        chartPanel.setMinimumSize(d);

        add(chartPanel);
        
        
       
    }

    /**
     * This method creates a solution dataset used to create the solution graphs
     *
     * @param taskName
     * @return
     */
    private XYDataset createSolutionDataset(List<Vertex> vertices, Times times) {
        logs.info("Creating Solution Dataset for PlotPanel");
        XYSeriesCollection dataset = new XYSeriesCollection();
        
        String legends[] = new String[2];
        legends[0] = "Your Graph";
        legends[1] = "Target Graph";

        if (ApplicationContext.isAuthorMode()) {
            legends[0] = "Author's Graph";
        }
        int legendIndex = 0;

        for (Vertex v : vertices) {
            XYSeries series = new XYSeries(legends[legendIndex++]);
            List<Double> correctValues = v.getCorrectValues();

            // Limit number of points that are plotted.
            double t=times.getStartTime();
            int di = (int) (times.getNumberSteps()/20);
            if(di < 1){
                di = 1;
            }
            logs.info("Gathering plot data with step size="+di+" from "+
                    correctValues.size()+" data points.");
            
            for (int i = 0; i < correctValues.size(); i += di) {
                series.add(t, correctValues.get(i));
                t += di*times.getTimeStep();
            }

            dataset.addSeries(series);
        }
        
        return dataset;
    }

    private JFreeChart createChart(final XYDataset dataset, String vertex, 
                                    double start, double end) {

        JFreeChart chart = ChartFactory.createXYLineChart(
                vertex, // chart title
                "Time (in " + units + ")", // x axis label
                vertex, // y axis label
                dataset, // data
                PlotOrientation.VERTICAL,
                true, // include legend
                true, // tooltips
                false // urls
                );
        
        
        chart.setBackgroundPaint(Color.white);
        
        
        XYPlot plot = (XYPlot) chart.getPlot();
        plot.setBackgroundPaint(Color.lightGray);
        plot.setDomainGridlinePaint(Color.white);
        plot.setRangeGridlinePaint(Color.white);
        plot.setAxisOffset(new RectangleInsets(5.0, 5.0, 5.0, 5.0));
        plot.setDomainCrosshairVisible(true);
        plot.setRangeCrosshairVisible(true);
        
        plot.getRangeAxis().setRange(((XYSeriesCollection)xydataset).getRangeLowerBound(true), ((XYSeriesCollection)xydataset).getRangeUpperBound(true));
       
        NumberAxis domain = (NumberAxis) plot.getDomainAxis();
        // Don't want any padding on left or right.
        domain.setRange(start, end);
        // Rotate ticks if numbers are large (years, for instance)
        if(Math.max(Math.abs(start),Math.abs(end))>1000){
            domain.setVerticalTickLabels(true);
            // We may have to adjust ticks spacing?
            // double tick = Math.abs(end-start)/20;
            // domain.setTickUnit(new NumberTickUnit(tick));
        }

        XYItemRenderer r = plot.getRenderer();
        if (r instanceof XYLineAndShapeRenderer) {
            XYLineAndShapeRenderer renderer = (XYLineAndShapeRenderer) r;

            renderer.setBaseShapesVisible(true);
            renderer.setBaseShapesFilled(true);
            renderer.setDrawSeriesLineAsPath(true);
            renderer.setSeriesShape(0, ShapeUtilities.createDownTriangle(3.5f));
            renderer.setSeriesShape(1, ShapeUtilities.createUpTriangle(3.5f));
        }
       
        return chart;
    }
    
    public void updateChartAfterSliderChange(Graph graph,Vertex vertex, Times times){
        logs.info("updating chart for new values from slider");
        
        XYSeries series = new XYSeries("New Value Graph");
           
        //remove last slider value series
        for (int i = 2; i < xydataset.getSeriesCount(); i++) {
            ((XYSeriesCollection)xydataset).removeSeries(i);
        }
        
        try {
           new ModelEvaluator(graph).run();
        } catch (ModelEvaluationException ex) {
            //handle this exception
        }
            List<Double> correctValues = graph.getVertexByName(vertex.getName()).getCorrectValues();        
             
            // Limit number of points that are plotted.
            double t=times.getStartTime();
            int di = (int) (times.getNumberSteps()/20);
            if(di < 1){
                di = 1;
            }
            logs.info("Gathering plot data with step size="+di+" from "+
                    correctValues.size()+" data points.");
           
            System.out.println("Corrected values are ");
            for (int i = 0; i < correctValues.size(); i += di) {
                logs.debug(correctValues.get(i)+" ");
                series.add(t, correctValues.get(i));
                t += di*times.getTimeStep();
            }
                
            ((XYSeriesCollection)xydataset).addSeries(series);
            ((XYPlot)jfreeChart.getPlot()).getRangeAxis().setRange(((XYSeriesCollection)xydataset).getRangeLowerBound(true), ((XYSeriesCollection)xydataset).getRangeUpperBound(true));
            jfreeChart.fireChartChanged(); 
    }
    
    //delete this
    public static void restoreOrignal(Graph graph, Map<String,Double> vertexValues){
        //restore graph values
            Iterator iterator = vertexValues.entrySet().iterator();
            while(iterator.hasNext()){
                Map.Entry<String,Double> entry =  (Map.Entry)iterator.next();
                graph.getVertexByName(entry.getKey()).setInitialValue(entry.getValue());
            }
    
            try {
                new ModelEvaluator(graph).run();
            } catch (ModelEvaluationException ex) {
            //handle this exception
            }
    }
    
}
