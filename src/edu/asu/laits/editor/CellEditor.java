/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.editor;

import edu.asu.laits.gui.nodeeditor.NodeEditor;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Point;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import javax.swing.JFrame;
import javax.swing.SwingUtilities;
import javax.swing.event.CellEditorListener;
import org.jgraph.graph.CellView;
import org.jgraph.graph.GraphCellEditor;
import org.jgraph.plaf.basic.BasicGraphUI;

/**
 *
 * @author ramayantiwari
 */
public class CellEditor extends BasicGraphUI {

    protected CellEditorListener cellEditorListener;
    protected JFrame editDialog = null;

    /**
     * Create the dialog using the cell's editing component.
     */
    protected void createEditDialog(Object cell) {
        GraphEditorPane g = (GraphEditorPane) graph;
        new NodeEditor(g, true);
    }

    /**
     * Stops the editing session. If messageStop is true the editor is messaged
     * with stopEditing, if messageCancel is true the editor is messaged with
     * cancelEditing. If messageGraph is true the graphModel is messaged with
     * valueForCellChanged.
     */
    protected void completeEditing(
            boolean messageStop,
            boolean messageCancel,
            boolean messageGraph) {
        if (stopEditingInCompleteEditing
                && editingComponent != null
                && editDialog != null) {

            Object oldCell = editingCell;
            GraphCellEditor oldEditor = cellEditor;
            Object newValue = oldEditor.getCellEditorValue();
            boolean requestFocus =
                    (graph != null
                    && (graph.hasFocus() || editingComponent.hasFocus()));
            editingCell = null;
            editingComponent = null;
            if (messageStop) {
                oldEditor.stopCellEditing();
            } else if (messageCancel) {
                oldEditor.cancelCellEditing();
            }
            editDialog.dispose();
            if (requestFocus) {
                graph.requestFocus();
            }
            if (messageGraph) {
                graphLayoutCache.valueForCellChanged(oldCell, newValue);
            }
            updateSize();
            // Remove Editor Listener 
            if (oldEditor != null && cellEditorListener != null) {
                oldEditor.removeCellEditorListener(cellEditorListener);
            }
            cellEditor = null;
            editDialog = null;
        }
    }

    /**
     * Will start editing for cell if there is a cellEditor and shouldSelectCell
     * returns true.<p> This assumes that cell is valid and visible.
     */
    protected boolean startEditing(Object cell, MouseEvent event) {
        completeEditing();
        if (graph.isCellEditable(cell) && editDialog == null) {

            // Create Editing Component **** ***** 
            CellView tmp = graphLayoutCache.getMapping(cell, false);
            cellEditor = tmp.getEditor();
            editingComponent =
                    cellEditor.getGraphCellEditorComponent(
                    graph,
                    cell,
                    graph.isCellSelected(cell));
            if (cellEditor.isCellEditable(event)) {
                editingCell = cell;

                // Create Wrapper Dialog **** ***** 
                createEditDialog(cell);

                // Add Editor Listener 
                if (cellEditorListener == null) {
                    cellEditorListener = createCellEditorListener();
                }
                if (cellEditor != null && cellEditorListener != null) {
                    cellEditor.addCellEditorListener(cellEditorListener);
                }

                if (cellEditor.shouldSelectCell(event)) {
                    stopEditingInCompleteEditing = false;
                    try {
                        graph.setSelectionCell(cell);
                    } catch (Exception e) {
                        System.err.println("Editing exception: " + e);
                    }
                    stopEditingInCompleteEditing = true;
                }

                if (event instanceof MouseEvent) {
                    /* Find the component that will get forwarded all the 
                     mouse events until mouseReleased. */
                    Point componentPoint =
                            SwingUtilities.convertPoint(
                            graph,
                            new Point(event.getX(), event.getY()),
                            editingComponent);

                    /* Create an instance of BasicTreeMouseListener to handle 
                     passing the mouse/motion events to the necessary 
                     component. */
                    // We really want similiar behavior to getMouseEventTarget, 
                    // but it is package private. 
                    Component activeComponent =
                            SwingUtilities.getDeepestComponentAt(
                            editingComponent,
                            componentPoint.x,
                            componentPoint.y);
                    if (activeComponent != null) {
                        new MouseInputHandler(
                                graph,
                                activeComponent,
                                event);
                    }
                }
                return true;
            } else {
                editingComponent = null;
            }
        }
        return false;
    }
}
