/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.model.Graph;
import edu.asu.laits.model.Vertex;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.List;
import javax.swing.JPanel;
import org.apache.log4j.Logger;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.XYPlot;
import org.jfree.chart.renderer.xy.XYLineAndShapeRenderer;
import org.jfree.data.xy.XYDataset;
import org.jfree.data.xy.XYSeries;
import org.jfree.data.xy.XYSeriesCollection;

/**
 * Class to create plots of the different variables of the model
 * THIS CLASS IS IN TESTING MODE, WE NEED TO DO THE ADJUSTMENTS TO THE REQUIRMENTS OF THE SW.
 *
 * @author Javier Gonzalez Sanchez
 * @author lzhang90
 */
public class PlotPanel extends JPanel {
  // The string vertex is used to complete the label of the window including the name of the vertex
  // which is represented on this plot
  //private String vertex;

  private Vertex vertex;
  private String units;
  
  private static Logger logs = Logger.getLogger("DevLogs");
  private static Logger activityLogs = Logger.getLogger("ActivityLogs");
  /**
   * Constructor
   *
   * Creates a new window with a plot inside of it
   * @param vertex is the name of the vertex that is being plotted
   * @param x0 is the initial value for the x-axis
   * @param xf is the final value for the x-axis
   * @param units  
   */
  public PlotPanel(Vertex vertex, int x0, int xf, String units, Dimension d) {
    this.vertex = vertex;
    this.units = units;
    final XYDataset dataset = createSolutionDataset(vertex, x0);
    final JFreeChart chart = createChart(dataset, this.vertex.getName());
    final ChartPanel chartPanel = new ChartPanel(chart);


    chart.getTitle().setFont(new Font("Arial", Font.BOLD, 14));

    // The size of the panel depends on the size of the GraphDialog panel
    chartPanel.setPreferredSize(d);
    chartPanel.setSize(d);
    this.setLayout(new GridLayout(1, 1));
    add(chartPanel);
  }



  /**
   * This method creates a solution dataset used to create the solution graphs
   * @param taskName
   * @return
   */
  private XYDataset createSolutionDataset(Vertex vertex, int x0) {
    final XYSeries series = new XYSeries("");
    List<Double> correctValues = vertex.getCorrectValues();
    
    for(int i = 0; i < correctValues.size(); i++) {
      series.add(x0, correctValues.get(i));
      x0++;
    }
    
    final XYSeriesCollection dataset = new XYSeriesCollection();
    if(correctValues.size()>0)
      dataset.addSeries(series);    
    
    return dataset;
  }


  /**
   * Creates the chart with the plot on it
   * @param dataset is the data (x and y coordinates to be ploted)
   * @param vertex is the name of the vertex being ploted
   * @return the chart with the plot on it
   */
  private JFreeChart createChart(final XYDataset dataset, String vertex) {
    final JFreeChart chart = ChartFactory.createXYLineChart(
            vertex, // chart title
            "Time (in " + units + ")", // x axis label
            /*"# "*/vertex, // y axis label
            dataset, // data
            PlotOrientation.VERTICAL,
            false, // include legend
            true, // tooltips
            false // urls
            );
    chart.setBackgroundPaint(Color.white);
    // final StandardLegend legend = (StandardLegend) chart.getLegend();
    // legend.setDisplaySeriesShapes(true);
    final XYPlot plot = chart.getXYPlot();
    plot.setBackgroundPaint(Color.lightGray);
    plot.setDomainGridlinePaint(Color.white);
    plot.setRangeGridlinePaint(Color.white);
    final XYLineAndShapeRenderer renderer = new XYLineAndShapeRenderer();
    //renderer.setSeriesLinesVisible(0, true);
    renderer.setSeriesShapesVisible(0, false);
    //renderer.setSeriesShapesVisible(2, true);
    plot.setRenderer(renderer);
    final NumberAxis rangeAxis = (NumberAxis) plot.getRangeAxis();
    rangeAxis.setStandardTickUnits(NumberAxis.createStandardTickUnits());
    //jclaxton start - force integers on x-axis
    final NumberAxis domainAxis = (NumberAxis) plot.getDomainAxis();
    domainAxis.setStandardTickUnits(NumberAxis.createIntegerTickUnits());
    //jclaxton end
    return chart;
    
  }

}

