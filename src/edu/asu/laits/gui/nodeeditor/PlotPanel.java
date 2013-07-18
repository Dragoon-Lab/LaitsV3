package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.jdesktop.swingx.JXTaskPane;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYItemRenderer;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.data.xy.XYDataset;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;
import org.jfree.ui.RectangleInsets;

public class PlotPanel extends JXTaskPane {
    
    private String units;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private static Color transparent = new Color(0, 0, 0, 0);
    
    public PlotPanel(Vertex vertex, int x0, String units) {
        List<Vertex> v = new ArrayList<Vertex>();
        v.add(vertex);
        this.units = units;
        
        if(ApplicationContext.getAppMode().equals("STUDENT") || ApplicationContext.getAppMode().equals("COACHED")){
            Vertex correctVertex = ApplicationContext.getCorrectSolution()
                    .getSolutionGraph().getVertexByName(vertex.getName());
            v.add(correctVertex);
        }
        
        Dimension d = new Dimension(575, 190);
        init(v,x0,d);
    }
    
    private void init(List<Vertex> vertices, int x0, Dimension d) {
        this.setTitle(vertices.get(0).getName());
        this.setBackground(transparent);
        this.setOpaque(false);
        
        XYDataset dataset = createSolutionDataset(vertices, x0);
        JFreeChart chart = createChart(dataset, vertices.get(0).getName());
        ChartPanel chartPanel = new ChartPanel(chart);
        chartPanel.setFillZoomRectangle(true);
        chartPanel.setMouseWheelEnabled(true);

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
    private XYDataset createSolutionDataset(List<Vertex> vertices, int x0) {
        XYSeriesCollection dataset = new XYSeriesCollection();
        String legends[] = new String[2];
        legends[0] = "Student Graph";
        legends[1] = "Correct Graph";
        int legendIndex = 0;
        
        for(Vertex v : vertices){
            int start = x0;
            XYSeries series = new XYSeries(legends[legendIndex++]);
            List<Double> correctValues = v.getCorrectValues();
            
            for (int i = 0; i < correctValues.size(); i++) {
                series.add(start, correctValues.get(i));
                start++;
            }
            
            dataset.addSeries(series);
        }
        
        return dataset;        
    }

    private JFreeChart createChart(final XYDataset dataset, String vertex) {

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

        XYItemRenderer r = plot.getRenderer();
        if (r instanceof XYLineAndShapeRenderer) {
            XYLineAndShapeRenderer renderer = (XYLineAndShapeRenderer) r;
            renderer.setBaseShapesVisible(true);
            renderer.setBaseShapesFilled(true);
            renderer.setDrawSeriesLineAsPath(true);
        }
        
        return chart;
    }
}
