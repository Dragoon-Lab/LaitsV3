package edu.asu.laits.gui.toolbars;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JToolBar;
import javax.swing.JButton;
import javax.swing.ImageIcon;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;
import edu.asu.laits.gui.menus.EditMenu;
import javax.swing.Box;

/**
 * A tool bar with quick buttons to perform some edit operations.
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
        configureEditMenuForModes();
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
     * Configures EditToolBar for different modes.
     * Ideally this should be done in Controller for different modes.
     */
    private void configureEditMenuForModes(){
        if (ApplicationContext.isCoachedMode() || ApplicationContext.isTestMode()) {
            undoButton.setEnabled(false);
            redoButton.setEnabled(false);            
        } else {
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
