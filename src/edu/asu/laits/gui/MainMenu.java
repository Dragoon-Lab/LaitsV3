package edu.asu.laits.gui;

import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.gui.menus.ModelMenu;
import edu.asu.laits.gui.menus.EditMenu;
import edu.asu.laits.gui.menus.FileMenu;
import edu.asu.laits.gui.menus.HelpAboutMenu;
import edu.asu.laits.gui.menus.ViewMenu;
import javax.swing.JMenuBar;
import javax.swing.JToolBar;

import java.util.List;

/**
 * This is the main menu in the program. 
 * It contains a lot of sub menus to let the user select what he/she wants to do with the program.
 *
 * @author kjellw
 *
 */
public class MainMenu extends JMenuBar {

    private FileMenu fileMenu = null;
    private EditMenu editMenu = null;
    private ModelMenu modelMenu = null;
    private ViewMenu viewMenu = null;
    private HelpAboutMenu helpAboutMenu = null;
    private GraphEditorPane graphPane;
    private MainWindow mainFrame;
    private List<JToolBar> toolBars;

    /**
     * This method initializes
     *
     */
    public MainMenu(GraphEditorPane pane, MainWindow mainFrame) {
        super();
        this.toolBars = toolBars;
        this.mainFrame = mainFrame;
        graphPane = pane;
        initialize();
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.add(getFileMenu());
        this.add(getEditMenu());
        this.add(getViewMenu());
        this.add(getModelMenu());
        this.add(getHelpAboutMenu());
    }

    /**
     * This method initializes fileMenu
     *
     */
    protected FileMenu getFileMenu() {
        if (fileMenu == null) {
            fileMenu = new FileMenu(graphPane, mainFrame);
        }
        return fileMenu;
    }

    /**
     * This method initializes editMenu
     *
     */
    public EditMenu getEditMenu() {
        if (editMenu == null) {
            editMenu = new EditMenu(graphPane);
        }
        return editMenu;
    }

    /**
     * This method initializes viewMenu
     *
     */
    public ViewMenu getViewMenu() {
        if (viewMenu == null) {
            viewMenu = new ViewMenu(graphPane, mainFrame);
        }
        return viewMenu;
    }

    /**
     * This method initializes the ModelMenu
     */
    public ModelMenu getModelMenu() {
        if (modelMenu == null) {
            modelMenu = new ModelMenu(graphPane, mainFrame);
        }
        return modelMenu;
    }

    /**
     * This method initializes helpAboutMenu
     *
     */
    private HelpAboutMenu getHelpAboutMenu() {
        if (helpAboutMenu == null) {
            helpAboutMenu = new HelpAboutMenu(mainFrame);
        }
        return helpAboutMenu;
    }
}
