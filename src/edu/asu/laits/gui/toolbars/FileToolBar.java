package edu.asu.laits.gui.toolbars;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JToolBar;
import javax.swing.JButton;
import javax.swing.ImageIcon;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.editor.listeners.GraphChangeListener;
import edu.asu.laits.editor.listeners.GraphPropertiesChangeListener;
import edu.asu.laits.editor.listeners.GraphSaveListener;
import edu.asu.laits.editor.listeners.UndoAndRedoAbleListener;
import edu.asu.laits.gui.menus.FileMenu;
import edu.asu.laits.properties.GraphProperties;
import javax.swing.Box;

/**
 * Tool bar with some quick buttons to do some file operations.
 */
public class FileToolBar extends JToolBar {

    private JButton newGraphButton = null;
    private JButton openGraphButton = null;
    private FileMenu fileMenu;
    private JButton saveGraphButton = null;
    private GraphEditorPane graphPane;

    /**
     * This method initializes
     *
     */
    public FileToolBar(GraphEditorPane graphPane, FileMenu fileMenu) {
        super();
        this.graphPane = graphPane;
        this.fileMenu = fileMenu;
        initialize();        
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setName("File quickmenu");
        this.add(getNewGraphButton());
        this.add(Box.createHorizontalStrut(3)); 
        this.add(openGraphButton());
        this.add(Box.createHorizontalStrut(3)); 
        this.add(getSaveButton());
        
        configureEditMenuForModes();
    }

    /**
     * Configures EditToolBar for different modes.
     * Ideally this should be done in Controller for different modes.
     */
    private void configureEditMenuForModes(){
        if (ApplicationContext.isCoachedMode() || ApplicationContext.isTestMode()) {
            newGraphButton.setEnabled(false);
            openGraphButton.setEnabled(false);
            saveGraphButton.setEnabled(false);
        } else {
            GraphPropertiesChangeListener l = new MainGraphPropertiesChangeListener();
            l.graphPropertiesChanged();
            graphPane.addGraphPropertiesChangeListener(l);
        }
    }
    /**
     * This method initializes newGraphButton
     */
    private JButton getNewGraphButton() {
        if (newGraphButton == null) {
            newGraphButton = new JButton();
            newGraphButton.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/filenew.png")));
            newGraphButton.addActionListener(fileMenu.getNewAction());
            newGraphButton.setToolTipText("Create a New Model");
        }
        return newGraphButton;
    }

    /**
     * This method initializes saveGraphButton
     */
    private JButton openGraphButton() {
        if (openGraphButton == null) {
            openGraphButton = new JButton();
            openGraphButton.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/fileopen.png")));
            openGraphButton.addActionListener(fileMenu.getOpenAction());
            openGraphButton.setToolTipText("Open a Saved Model");
        }
        return openGraphButton;
    }

    /**
     * This method initializes saveButton
     */
    private JButton getSaveButton() {
        if (saveGraphButton == null) {
            saveGraphButton = new JButton();
            saveGraphButton.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/filesave.png")));
            saveGraphButton.setToolTipText("Save Model");
            saveGraphButton.addActionListener(fileMenu.getSaveAction());
        }
        return saveGraphButton;
    }

    private class MainGraphPropertiesChangeListener implements
            GraphPropertiesChangeListener {

        /**
         * This shall happen when the properties of a graph is changed
         */
        public void graphPropertiesChanged() {
            final GraphProperties prop = graphPane.getGraphProperties();

            prop.addGraphChangeListener(new GraphChangeListener() {
                public void graphChanged() {
                    getSaveButton().setEnabled(true);

                }
            });

            prop.addSaveListener(new GraphSaveListener() {
                public void graphSaved() {
                    getSaveButton().setEnabled(false);

                }
            });
        }
    }
}
