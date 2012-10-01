package edu.asu.laits.gui;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JToolBar;
import javax.swing.JPanel;
import java.awt.BorderLayout;
import java.awt.Dimension;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;


import edu.asu.laits.editor.GraphEditorPane;
import edu.asu.laits.model.GraphLoader;
import edu.asu.laits.model.GraphLoader.IncorcectGraphXMLFileException;
import edu.asu.laits.editor.listeners.GraphChangeListener;
import edu.asu.laits.editor.listeners.GraphPropertiesChangeListener;
import edu.asu.laits.editor.listeners.GraphSaveListener;

import javax.swing.JScrollPane;
import edu.asu.laits.gui.toolbars.FileToolBar;
import edu.asu.laits.gui.toolbars.EditToolBar;
import edu.asu.laits.gui.toolbars.ModelToolBar;
import edu.asu.laits.gui.toolbars.ViewToolBar;
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import java.awt.Toolkit;

import javax.swing.BoxLayout;

/**
 * The main window in the program. This can be opened both with an empty graph
 * and with the method openWindowWithFile which opens a new window and loads a
 * graph file into it.
 */
public class MainWindow extends JFrame {

    private MainMenu mainMenu = null;
    private JPanel jPanel = null;
    private JPanel toolBarPanel = null;
    private JScrollPane graphPaneScrollPane = null;
    private GraphEditorPane graphEditorPane = null;
    
    
    // Number of windows opened
    private static int windowCount;
    
    private FileToolBar fileToolBar = null;
    private EditToolBar editToolBar = null;
    private ViewToolBar viewToolBar = null;
    private ModelToolBar modelToolBar = null;
    private List<JToolBar> toolBars = new LinkedList<JToolBar>(); // @jve:decl-index=0:
    private StatusBarPanel statusBarPanel = null;

    /**
     * This method initializes
     *
     */
    public MainWindow() {
        super();
        initialize();
        GraphPropertiesChangeListener l = new MainGraphPropertiesChangeListener();
        l.graphPropertiesChanged();
        getGraphEditorPane().addGraphPropertiesChangeListener(l);
        pack();
        setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);

        windowCount++;
    }

    public static void openWindowWithFile(File file) {
        MainWindow window = new MainWindow();

        try {
            FileReader reader = new FileReader(file);
            GraphLoader loader = new GraphLoader(window.getGraphEditorPane());
            loader.load(reader, file);
            reader.close();
            GlobalProperties.getInstance().addFileToLatestFiles(file);
            window.getMainMenu().getFileMenu().setCurrentGraphsFile(file);
            window.setVisible(true);
        } catch (IOException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        } catch (IncorcectGraphXMLFileException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /**
     * This method initializes this
     *
     */
    private void initialize() {
        this.setTitle(GlobalProperties.PROGRAM_NAME);
        Toolkit tk = Toolkit.getDefaultToolkit();
        int xSize = ((int) tk.getScreenSize().getWidth());
        int ySize = ((int) tk.getScreenSize().getHeight());
        this.setPreferredSize(new Dimension(xSize, ySize));

        this.setContentPane(getJPanel());
        this.setJMenuBar(getMainMenu());
        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {

                exitWindow();

            }
        });

    }

    /**
     * This method initializes mainMenu
     *
     */
    private MainMenu getMainMenu() {
        if (mainMenu == null) {

            mainMenu = new MainMenu(getGraphEditorPane(), this);
        }
        return mainMenu;
    }

    /**
     * This method initializes jPanel
     *
     * @return javax.swing.JPanel
     */
    private JPanel getJPanel() {
        if (jPanel == null) {
            jPanel = new JPanel();
            jPanel.setLayout(new BorderLayout());
            jPanel.add(getToolBarPanel(), BorderLayout.NORTH);
            jPanel.add(getGraphPaneScrollPane(), BorderLayout.CENTER);
            jPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
        }
        return jPanel;
    }

    /**
     * This method initializes toolBarPanel
     *
     */
    private JPanel getToolBarPanel() {
        if (toolBarPanel == null) {
            toolBarPanel = new JPanel();
            toolBarPanel.setLayout(new BoxLayout(getToolBarPanel(),
                    BoxLayout.X_AXIS));
            toolBarPanel.add(getFileToolBar(), null);
            toolBarPanel.add(getEditToolBar(), null);
            toolBarPanel.add(getViewToolBar(), null);
            toolBarPanel.add(getModelToolBar(), null);

            toolBars.add(getFileToolBar());
            toolBars.add(getEditToolBar());
            toolBars.add(getViewToolBar());
            toolBars.add(getModelToolBar());


            //getMainMenu().getPropertiesMenu().setJToolBars(toolBars);
        }
        return toolBarPanel;
    }

    /**
     * This method initializes graphPaneScrollPane
     *
     */
    public JScrollPane getGraphPaneScrollPane() {
        if (graphPaneScrollPane == null) {
            graphPaneScrollPane = new JScrollPane();
            graphPaneScrollPane.setViewportView(getGraphEditorPane());
        }
        return graphPaneScrollPane;
    }

    /**
     * This method initializes graphEditorPane
     *
     */
    private GraphEditorPane getGraphEditorPane() {
        if (graphEditorPane == null) {
            graphEditorPane = new GraphEditorPane(this, getStatusBarPanel());
            getStatusBarPanel().setGraphPane(graphEditorPane);
            graphEditorPane.setAntiAliased(GlobalProperties.getInstance()
                    .isAntialiasing());
            graphEditorPane.setDoubleBuffered(GlobalProperties.getInstance()
                    .isDoubleBuffering());
        }
        return graphEditorPane;
    }

    private class MainGraphPropertiesChangeListener implements
            GraphPropertiesChangeListener {

        /**
         * This shall happen when the properties of a graph is changed
         */
        public void graphPropertiesChanged() {
            final GraphProperties prop = getGraphEditorPane()
                    .getGraphProperties();

            prop.addGraphChangeListener(new GraphChangeListener() {
                public void graphChanged() {
                    if (prop.isExistsOnFileSystem()) {
                        setTitle(prop.getSavedAs().getName()
                                + " - [Changed] - "
                                + GlobalProperties.PROGRAM_NAME);
                    } else {
                        setTitle("[New graph] - [Changed] - "
                                + GlobalProperties.PROGRAM_NAME);
                    }

                }
            });

            prop.addSaveListener(new GraphSaveListener() {
                public void graphSaved() {
                    setTitle(prop.getSavedAs().getName() + " - "
                            + GlobalProperties.PROGRAM_NAME);
                }
            });
        }
    }

    /**
     * @return the windowCount
     */
    public static int getWindowCount() {
        return windowCount;
    }

    public void exitWindow() {
        GlobalProperties.getInstance().saveToPropertiesFile();
        if (getGraphEditorPane().getGraphProperties().isChanged()) {
            int answear = JOptionPane
                    .showConfirmDialog(
                    getRootPane(),
                    "The graph has been changed.\nDo you want to save changes before exit?",
                    "Save before exit?",
                    JOptionPane.YES_NO_CANCEL_OPTION);
            switch (answear) {
                case JOptionPane.YES_OPTION:
                    getMainMenu().getFileMenu().save();
                    break;
                case JOptionPane.NO_OPTION:

                    break;
                case JOptionPane.CANCEL_OPTION:
                    // Dont close window and return
                    return;

            }
        }
        windowCount--;
        if (windowCount == 0) {
            System.exit(0);
        } else {
            setVisible(false);
            dispose();
        }
    }

    /**
     * This method initializes fileToolBar
     *
     * @return FileToolBar
     */
    private FileToolBar getFileToolBar() {
        if (fileToolBar == null) {
            fileToolBar = new FileToolBar(getGraphEditorPane(), getMainMenu()
                    .getFileMenu());
        }
        return fileToolBar;
    }

    /**
     * This method initializes editToolBar
     *
     * @return EditToolBar
     */
    private EditToolBar getEditToolBar() {
        if (editToolBar == null) {
            editToolBar = new EditToolBar(getGraphEditorPane(), mainMenu
                    .getEditMenu());
        }
        return editToolBar;
    }

    /**
     * This method initializes viewToolBar
     *
     * @return ViewToolBar
     */
    private ViewToolBar getViewToolBar() {
        if (viewToolBar == null) {
            viewToolBar = new ViewToolBar(mainMenu.getViewMenu());
        }
        return viewToolBar;
    }

    /**
     * This method initializes viewToolBar
     *
     * @return ViewToolBar
     */
    private ModelToolBar getModelToolBar() {
        if (modelToolBar == null) {
            modelToolBar = new ModelToolBar(mainMenu.getModelMenu());
        }
        return modelToolBar;
    }

    /**
     * This method initializes statusBarPanel
     *
     * @return StatusBarPanel
     */
    private StatusBarPanel getStatusBarPanel() {
        if (statusBarPanel == null) {
            statusBarPanel = new StatusBarPanel();
        }
        return statusBarPanel;
    }
}
