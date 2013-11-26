package edu.asu.laits.gui.menus;

import javax.swing.JMenu;

import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;

import javax.swing.JEditorPane;
import javax.swing.JMenuItem;
import javax.swing.JSeparator;
import javax.swing.JCheckBoxMenuItem;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.listeners.InsertModeChangeListener;
import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;

import com.sun.corba.se.spi.orbutil.fsm.Action;
import edu.asu.laits.editor.ApplicationContext;

import javax.swing.ImageIcon;
import org.apache.log4j.Logger;

/**
 * The edit menu that is added to the main menu. There are menu items to undo,
 * redo and to select the insert mode etc.
 */
public class EditMenu extends JMenu {

    private JMenuItem undoEditMenuItem = null;
    private JMenuItem redoEditMenuItem = null;
    private JSeparator jSeparator = null;
    
    private GraphEditorPane graphPane;
    private ActionListener undoAction;
    private ActionListener redoAction;
    /**
     * Used to indicate that no call to graphPane.setinserMode shall be done the
     * next time the selected status of the insertModeItem is changed.
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    /**
     * This method initializes
     *
     */
    public EditMenu(GraphEditorPane pane) {
        super();
        graphPane = pane;
        initialize();
        configureEditMenuForModes();
    }

    /**
     * Configures EditMenu for different modes.
     * Ideally this should be done in Controller for different modes.
     */
    private void configureEditMenuForModes() {
        if (ApplicationContext.isCoachedMode() || ApplicationContext.isTestMode()) {
            logs.debug("Disabling Undo and Redo Menu item for Mode : " + ApplicationContext.getAppMode());
            undoEditMenuItem.setEnabled(false);
            undoEditMenuItem.setEnabled(false);
        } else {
            logs.debug("Enabling Undo and Redo Menu item for Mode : " + ApplicationContext.getAppMode());
            
            graphPane.addUndoAndRedoAbleListener(new UndoAndRedoAbleListener() {
                public void canNotRedo() {
                    getRedoEditMenuItem().setEnabled(false);
                }

                public void canNotUndo() {
                    getUndoEditMenuItem().setEnabled(false);
                }

                public void canRedo() {
                    getRedoEditMenuItem().setEnabled(true);
                }

                public void canUndo() {
                    getUndoEditMenuItem().setEnabled(true);
                }
            });
        }
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setText("Edit");
        this.setMnemonic(KeyEvent.VK_E);
        this.setActionCommand("");
        this.add(getUndoEditMenuItem());
        this.add(getRedoEditMenuItem());        
    }

    /**
     * This method initializes undoEditMenuItem
     */
    private JMenuItem getUndoEditMenuItem() {
        if (undoEditMenuItem == null) {
            undoEditMenuItem = new JMenuItem();
            undoEditMenuItem.setText("Undo");
            undoEditMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/undo.png")));
            undoAction = new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    graphPane.undo();
                }
            };
            undoEditMenuItem.addActionListener(undoAction);
        }
        return undoEditMenuItem;
    }

    /**
     * This method initializes redoEditMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getRedoEditMenuItem() {
        if (redoEditMenuItem == null) {
            redoEditMenuItem = new JMenuItem();
            redoEditMenuItem.setText("Redo");
            redoEditMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/redo.png")));
            redoAction = new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    graphPane.redo();
                }
            };
            redoEditMenuItem.addActionListener(redoAction);
        }
        return redoEditMenuItem;
    }

    /**
     * This method initializes jSeparator
     */
    private JSeparator getJSeparator() {
        if (jSeparator == null) {
            jSeparator = new JSeparator();
        }
        return jSeparator;
    }

    /**
     * @return the redoAction
     */
    public ActionListener getRedoAction() {
        return redoAction;
    }

    /**
     * @return the undoAction
     */
    public ActionListener getUndoAction() {
        return undoAction;
    }
}
