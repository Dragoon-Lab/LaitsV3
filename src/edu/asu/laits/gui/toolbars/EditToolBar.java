package edu.asu.laits.gui.toolbars;

import javax.swing.JToolBar;
import javax.swing.JButton;
import javax.swing.ImageIcon;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;
import edu.asu.laits.gui.menus.EditMenu;
import javax.swing.Box;

/**
 * A toolbar with quick buttons to perform some edit operations.
 */
public class EditToolBar extends JToolBar {

    private JButton undoButton = null;
    private JButton redoButton = null;
    private EditMenu editMenu;
    private GraphEditorPane graphPane;

    /**
     * This method initializes
     *
     */
    public EditToolBar(GraphEditorPane graphPane, EditMenu editMenu) {
        super();
        this.graphPane = graphPane;
        this.editMenu = editMenu;
        initialize();
        graphPane.addUndoAndRedoAbleListener(new UndoAndRedoAbleListener() {
            public void canNotRedo() {
                getRedoButton().setEnabled(false);

            }

            public void canNotUndo() {
                getUndoButton().setEnabled(false);

            }

            public void canRedo() {
                getRedoButton().setEnabled(true);

            }

            public void canUndo() {
                getUndoButton().setEnabled(true);

            }
        });

    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setName("Edit quickmenu");
        this.add(getUndoButton());
        this.add(Box.createHorizontalStrut(3)); 
        this.add(getRedoButton());
    }

    /**
     * This method initializes undoButton
     */
    private JButton getUndoButton() {
        if (undoButton == null) {
            undoButton = new JButton();
            undoButton.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/undo.png")));
            undoButton.setToolTipText("Undo Model Change");
            undoButton.addActionListener(editMenu.getUndoAction());
        }
        return undoButton;
    }

    /**
     * This method initializes redoButton
     */
    private JButton getRedoButton() {
        if (redoButton == null) {
            redoButton = new JButton();
            redoButton.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/redo.png")));
            redoButton.setToolTipText("Redo Model Change");
            redoButton.addActionListener(editMenu.getRedoAction());
        }
        return redoButton;
    }
}
