package edu.asu.laits.editor;

import edu.asu.laits.gui.nodeeditor.NodeEditor;
import edu.asu.laits.model.Vertex;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.util.LinkedList;
import java.util.List;
import java.util.TreeSet;
import org.apache.log4j.Logger;

import org.jgraph.graph.DefaultEdge;
import org.jgraph.graph.DefaultGraphCell;
import org.jgraph.graph.DefaultPort;
import org.jgraph.graph.Port;
import org.jgraph.graph.PortView;

/**
 * This class represents a mouse motion listener for a JGraph component that has
 * the properties of the default one plus the additional future that it is
 * possible to merge two vertices if the graph is not in insert mode and they
 * are dragged together.
 */
public class MouseAndMotionListener implements MouseListener,
        MouseMotionListener {

    private GraphEditorPane graphPane;
    private boolean mousePressed = false;
    private boolean insertMode = true;
    private boolean cellMoving = false;
    private PortView movingPortView;
    private MouseListener orginalMouseListener;
    private MouseMotionListener orginalMotionListener;
    private boolean mergeCells;
    private PortView mergePairToMergeTo;
    private PortView mergePairMerge;
    
    private static Logger logs = Logger.getLogger(MouseAndMotionListener.class);

    public MouseAndMotionListener(GraphEditorPane pane,
            MouseListener ml, MouseMotionListener mml) {
        this.orginalMotionListener = mml;
        this.orginalMouseListener = ml;
        this.graphPane = pane;
    }

    
    public void mouseClicked(MouseEvent e) {
        orginalMouseListener.mouseClicked(e);
    }

    
    public void mouseEntered(MouseEvent e) {
        orginalMouseListener.mouseEntered(e);
    }

    
    public void mouseExited(MouseEvent e) {
        orginalMouseListener.mouseExited(e);
    }

    
    public void mousePressed(MouseEvent e) {
        mousePressed = true;
        graphPane.setJumpToDefaultPort(false);
        PortView result;
        try {
            // Find a Port View in Model Coordinates and Remember
            result = graphPane.getPortViewAt(e.getPoint().getX(), e.getPoint()
                    .getY());
            
        } finally {
            graphPane.setJumpToDefaultPort(true);
        }
        if ((result != null) && !insertMode) {
            if ((result.getCell() instanceof DefaultGraphCell)
                    && !(result.getCell() instanceof DefaultEdge)) {

                cellMoving = true;
                movingPortView = result;
            }
        }
        orginalMouseListener.mousePressed(e);
    }

    
    public void mouseReleased(MouseEvent e) {
        // What is at the current position?
        cellMoving = false;
        orginalMouseListener.mouseReleased(e);
    }

    /**
     * @return the insertMode
     */
    public boolean isInsertMode() {
        return insertMode;
    }

    /**
     * @param insertMode the insertMode to set
     */
    public void setInsertMode(boolean insertMode) {
        this.insertMode = insertMode;
    }

    public void mouseDragged(MouseEvent e) {
        // What is at the current position?
        if (!insertMode && cellMoving) {

            graphPane.setJumpToDefaultPort(false);
            PortView result;
            try {
                // Find a Port View in Model Coordinates and Remember
                result = graphPane.getPortViewAt(e.getPoint().getX(), e
                        .getPoint().getY());

            } finally {
                graphPane.setJumpToDefaultPort(true);
            }

            if ((result != null) && (movingPortView != null)
                    && (result != movingPortView)) {

                mergePairToMergeTo = result;
                mergePairMerge = movingPortView;
                mergeCells = true;
            } else {
                mergeCells = false;
            }

        }
        orginalMotionListener.mouseDragged(e);
    }

    public void mouseMoved(MouseEvent e) {

        orginalMotionListener.mouseMoved(e);
    }
}
