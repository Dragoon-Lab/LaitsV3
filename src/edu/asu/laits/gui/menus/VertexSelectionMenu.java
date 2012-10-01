/**
 * LAITS Project Arizona State University
 */
package edu.asu.laits.gui.menus;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.listeners.InsertModeChangeListener;
import edu.asu.laits.gui.nodeeditor.NodeEditor;
import javax.swing.JMenuItem;
import javax.swing.JPopupMenu;
import javax.swing.JSeparator;

/**
 *
 * @author ramayantiwari
 */
public class VertexSelectionMenu extends JPopupMenu {

    GraphEditorPane graphPane;
    private JMenuItem deleteItem = null;
    private JMenuItem editItem = null;

    /**
     * This method initializes
     *
     */
    public VertexSelectionMenu(GraphEditorPane graphPane) {
        super();
        this.graphPane = graphPane;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.add(getEditItem());
        this.add(getDeleteItem());

    }

    /**
     * This method initializes deleteItem
     */
    private JMenuItem getDeleteItem() {
        if (deleteItem == null) {
            deleteItem = new JMenuItem();
            deleteItem.setText("Delete");
            deleteItem.addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    graphPane.removeSelected();
                }
            });
        }
        return deleteItem;
    }

    /**
     * This method initializes deleteItem
     */
    private JMenuItem getEditItem() {
        if (editItem == null) {
            editItem = new JMenuItem();
            editItem.setText("Edit");
            editItem.addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    new NodeEditor(graphPane);
                }
            });
        }
        return editItem;
    }
}
