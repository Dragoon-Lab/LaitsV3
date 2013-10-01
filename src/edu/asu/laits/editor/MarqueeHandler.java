package edu.asu.laits.editor;

import edu.asu.laits.gui.menus.VertexSelectionMenu;
import java.awt.Color;
import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Point;
import java.awt.event.MouseEvent;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;
import java.util.Timer;
import java.util.TimerTask;

import javax.swing.SwingUtilities;

import org.jgraph.graph.BasicMarqueeHandler;
import org.jgraph.graph.GraphConstants;
import org.jgraph.graph.Port;
import org.jgraph.graph.PortView;

/**
 * Extends the BasicMarqueeHandler to add some extra functionality. Mutch of the
 * code in this class is taken from the MarqueHandler in the class GraphEd in
 * the JGraph package org.jgraph.example.
 *
 * An object of this class is added as a MarqueeListener to the JGraph pane to
 * add functionality to be able to draw deges between ports when not in insert
 * mode as well as displaying popup menus when the user click with the right
 * button of the mouse.
 * 
 * This needs a lot of refactoring
 */
public class MarqueeHandler extends BasicMarqueeHandler {

    private GraphEditorPane graph;

    /*
     * This is true if the mouse is in dragging mode.
     */
    private boolean dragging = false;
    // Holds the Start and the Current Point
    protected Point2D start, current;
    // Holds the First and the Current Port
    protected PortView port, firstPort;
    private VertexSelectionMenu vertexSelectedMenu;

    /**
     * @param graph
     */
    public MarqueeHandler(GraphEditorPane graph) {
        super();
        this.graph = graph;
        vertexSelectedMenu = new VertexSelectionMenu(graph);
    }

    // Override to Gain Control (for PopupMenu and ConnectMode)
    public boolean isForceMarqueeEvent(MouseEvent e) {
        if (e.isShiftDown()) {
            return false;
        }
        // Find and Remember Port
        port = getSourcePortAt(e.getPoint());
        // If Port Found and in ConnectMode (=Ports Visible)
        if (port != null && graph.isPortsVisible()) {
            return true;
        }
        // Else Call Superclass

        // If Right Mouse Button we want to Display the PopupMenu
        if (SwingUtilities.isRightMouseButton(e)) // Return Immediately
        {
            mousePressed(e);
        }

        return super.isForceMarqueeEvent(e);
    }

    // Display PopupMenu or Remember Start Location and First Port
    public void mousePressed(final MouseEvent e) {
        // If Right Mouse Button
        if (SwingUtilities.isRightMouseButton(e)) {
            // Find Cell in Model Coordinates
            // TODO:HAve to fix this

            Point point = e.getPoint();
            displayPopUpMenu(point);

        } else if (port != null && graph.isPortsVisible()) {
            // Remember Start Location
            start = graph.toScreen(port.getLocation());
            // Remember First Port
            firstPort = port;
        } else {
            // Call Superclass
            super.mousePressed(e);
        }
    }

    private void displayPopUpMenu(final Point point) {
        /*
         * Diffrent menus shall be displayed depending on if 1) Vertexes is
         * selected 2) Only edges is selected 3) Nothing is selected Check which
         * types of objects is selected:
         */
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            public void run() {
                SwingUtilities.invokeLater(new Runnable() {
                    public void run() {
                        Object[] selectedVerteces = graph
                                .getSelectionCells(graph.getGraphLayoutCache()
                                .getCells(false, true, false, false));
                        

                        if(selectedVerteces.length == 1){
                            vertexSelectedMenu.setGraphDataItem();
                            vertexSelectedMenu.show(graph, (int) point.getX(),
                                    (int) point.getY());
                        }    


                    }
                });
            }
        }, 190);

        
    }

    // Find Port under Mouse and Repaint Connector
    public void mouseDragged(MouseEvent e) {
        dragging = true;
        // If remembered Start Point is Valid
        if (start != null) {
            // Fetch Graphics from Graph
            Graphics g = graph.getGraphics();
            // Reset Remembered Port
            PortView newPort = getTargetPortAt(e.getPoint());

            // Do not flicker (repaint only on real changes)
            if (newPort == null || newPort != port) {
                // Xor-Paint the old Connector (Hide old Connector)
                paintConnector(Color.black, graph.getBackground(), g);
                // If Port was found then Point to Port Location
                port = newPort;
                if (port != null) {
                    current = graph.toScreen(port.getLocation());
                } // Else If no Port was found then Point to Mouse Location
                else {
                    current = graph.snap(e.getPoint());
                }
                // Xor-Paint the new Connector
                paintConnector(graph.getBackground(), Color.black, g);
            }
        }
        // Call Superclass
        super.mouseDragged(e);
    }

    public PortView getSourcePortAt(Point2D point) {
        // Disable jumping
        
            graph.setTolerance(4);
            graph.setJumpToDefaultPort(false);
        

        PortView result;
        try {
            // Find a Port View in Model Coordinates and Remember
            result = graph.getPortViewAt(point.getX(), point.getY());
        } finally {
            graph.setJumpToDefaultPort(true);
        }
        return result;
    }

    // Find a Cell at point and Return its first Port as a PortView
    protected PortView getTargetPortAt(Point2D point) {
        // Find a Port View in Model Coordinates and Remember
        return graph.getPortViewAt(point.getX(), point.getY());
    }

    // Connect the First Port and the Current Port in the Graph or Repaint
    public void mouseReleased(MouseEvent e) {
        // UGLY FIX BECOUSE OF DEFAULT KEY HANDLER
        if (e == null) {
            return;
        }
        dragging = false;
        // If Valid Event, Current and First Port
        if (e != null && port != null && firstPort != null && firstPort != port) {
            // Then Establish Connect
            graph.connect(((Port) firstPort.getCell()), (Port) port.getCell());
            e.consume();
            // Else Repaint the Graph
        } else {
            graph.repaint();
        }

        // Reset Global Vars
        firstPort = port = null;
        start = current = null;
        // Call Superclass
        super.mouseReleased(e);
    }

    // Show Special Cursor if Over Port
    public void mouseMoved(MouseEvent e) {
        // Check Mode and Find Port
        if (e != null && getSourcePortAt(e.getPoint()) != null
                && graph.isPortsVisible()) {
            // Set Cusor on Graph (Automatically Reset)
            graph.setCursor(new Cursor(Cursor.HAND_CURSOR));
            // Consume Event
            // Note: This is to signal the BasicGraphUI's
            // MouseHandle to stop further event processing.
            e.consume();
        } else // Call Superclass
        {
            super.mouseMoved(e);
        }
    }

    // Use Xor-Mode on Graphics to Paint Connector
    protected void paintConnector(Color fg, Color bg, Graphics g) {
        // Set Foreground
        g.setColor(fg);
        // Set Xor-Mode Color
        g.setXORMode(bg);
        // Highlight the Current Port
        paintPort(graph.getGraphics());
        // If Valid First Port, Start and Current Point
        if (firstPort != null && start != null && current != null) // Then Draw A Line From Start to Current Point
        {
            g.drawLine((int) start.getX(), (int) start.getY(), (int) current
                    .getX(), (int) current.getY());
        }
    }

    // Use the Preview Flag to Draw a Highlighted Port
    protected void paintPort(Graphics g) {

        // If Current Port is Valid
        if (port != null) {
            // If Not Floating Port...
            boolean o = (GraphConstants.getOffset(port.getAllAttributes()) != null);
            // ...Then use Parent's Bounds
            Rectangle2D r = (o) ? port.getBounds() : port.getParentView()
                    .getBounds();
            // Scale from Model to Screen
            r = graph.toScreen((Rectangle2D) r.clone());
            // Add Space For the Highlight Border
            r.setFrame(r.getX() - 3, r.getY() - 3, r.getWidth() + 6, r
                    .getHeight() + 6);
            // Paint Port in Preview (=Highlight) Mode
            graph.getUI().paintCell(g, port, r, true);
        }
    }
}
