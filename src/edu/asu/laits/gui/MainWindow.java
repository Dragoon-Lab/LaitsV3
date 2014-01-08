/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * LAITS is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS. If not, see <http://www.gnu.org/licenses/>.
 */
package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JFrame;
import javax.swing.JToolBar;
import javax.swing.JPanel;
import java.awt.BorderLayout;
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

import javax.swing.JScrollPane;
import edu.asu.laits.gui.toolbars.FileToolBar;
import edu.asu.laits.gui.toolbars.EditToolBar;
import edu.asu.laits.gui.toolbars.ModelToolBar;
import edu.asu.laits.gui.toolbars.ViewToolBar;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.PersistenceManager;
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import java.awt.Color;
import javax.swing.*;
import org.apache.log4j.Logger;
import org.dom4j.DocumentException;

/**
 * The main window in the program. This can be opened both with an empty graph
 * and with the method openWindowWithFile which opens a new window and loads a
 * graph file into it.
 * 
 * @author ramayantiwari
 */
public class MainWindow extends JFrame {

    private MainMenu mainMenu = null;
    private JPanel mainPanel = null;
    private JScrollPane situationPanel = null;
    private JPanel toolBarPanel = null;
    private JScrollPane graphPaneScrollPane = null;
    private GraphEditorPane graphEditorPane = null;
    
    // Number of windows opened
    private static int windowCount;
    private FileToolBar fileToolBar = null;
    private EditToolBar editToolBar = null;
    private ViewToolBar viewToolBar = null;
    private ModelToolBar modelToolBar = null;
    private List<JToolBar> toolBars = new LinkedList<JToolBar>();
    private StatusBarPanel statusBarPanel = null;
    //private boolean isSituationTabSelected = true;
    
    // Label to Display Tasks
    JLabel situationLabel;    
            
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    private static MainWindow _instance;

    /**
     * Method to get static instance of Main Application Window
     *
     * @return Instance of MainWindow
     */
    public static MainWindow getInstance() {
        if (_instance == null) {
            _instance = new MainWindow();
            if (!ApplicationContext.isAuthorMode()) {
                _instance.loadTask();
            }
            _instance.loadSavedSession();
            _instance.attachGraphChangeListener();
            _instance.setFrameTitle();
        }
        return _instance;
    }

    /**
     * Method to Launch the Application - called from main method
     */
    public static void launch() {
        MainWindow window = getInstance();
        window.pack();
        window.setVisible(true);
    }

    /**
     * Private Constructor to implement Singleton
     */
    private MainWindow() {
        super();
        initializeFrameElements();        
        setExtendedState(MAXIMIZED_BOTH);
        setDefaultCloseOperation(DO_NOTHING_ON_CLOSE);
        windowCount++;
    }

    public void attachGraphChangeListener() {
        logs.debug("Attached Graph Change Listener");
        GraphPropertiesChangeListener l = new MainGraphPropertiesChangeListener();
        l.graphPropertiesChanged();
        getGraphEditorPane().addGraphPropertiesChangeListener(l);
    }
    
    public void addHelpBalloon(String node, String timing) {
        if (ApplicationContext.isCoachedMode()) {
            List<HelpBubble> bubbles = ApplicationContext.getHelp(node, "MainWindow", timing);
            logs.debug(node + " MainWindow " + timing);
            if (!bubbles.isEmpty()) {
                for (HelpBubble bubble : bubbles) {
                    new BlockingToolTip(this, bubble, modelToolBar.getAddNodeButton());
                }
            }
        }
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
            e1.printStackTrace();
        } catch (IncorcectGraphXMLFileException e) {
            e.printStackTrace();
        }
    }

    /**
     * This method initializes this
     *
     */
    private void initializeFrameElements() {
        this.setContentPane(getJPanel());
        this.setJMenuBar(getMainMenu());
        this.addWindowListener(new java.awt.event.WindowAdapter() {
            public void windowClosing(java.awt.event.WindowEvent e) {
                exitWindow();
            }
        });
    }

    private void setFrameTitle() {
        // Set Title of Main Frame
        String title = GlobalProperties.PROGRAM_NAME
                + " - " + ApplicationContext.getAppMode() + " Mode";
        if (ApplicationContext.isAuthorMode()) {
            title += " : " + ApplicationContext.getCurrentTaskID();
        } else {
            title += " : " + ApplicationContext.getCurrentTask().getTaskName();
        }

        this.setTitle(title);
    }

    /**
     * This method initializes mainMenu
     *
     */
    public MainMenu getMainMenu() {
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
        if (mainPanel == null) {
            mainPanel = new JPanel();
            mainPanel.setLayout(new BorderLayout());
            mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);

            // Temporary - switch panels based on Mode
            logs.debug("Application running in " + ApplicationContext.getAppMode() + " Mode");
            if (ApplicationContext.isAuthorMode()) {
                mainPanel.add(getGraphPaneScrollPane(), BorderLayout.CENTER);
            } else {
                // Initialize Situation Panel so that first task can be loaded
                mainPanel.add(getSituationPanel());
            }
            mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
        }
        return mainPanel;
    }

    /**
     * This method create a JPanel for displaying Situation of a Task
     */
    private JScrollPane getSituationPanel() {
        if (situationPanel == null) {
            logs.debug("Initializing Situation Panel");

            situationPanel = new JScrollPane();

            situationLabel = new JLabel("");
            situationLabel.setVerticalTextPosition(JLabel.BOTTOM);
            situationLabel.setHorizontalTextPosition(JLabel.CENTER);
            situationLabel.setVerticalAlignment(JLabel.TOP);
            situationLabel.setHorizontalAlignment(JLabel.CENTER);
            //situationLabel.setBorder(BorderFactory.createTitledBorder(""));
            situationLabel.setBackground(Color.WHITE);
            situationLabel.setVerticalAlignment(SwingConstants.TOP);
        }
        situationLabel.setOpaque(true);
        situationPanel.setViewportView(situationLabel);
        return situationPanel;
    }

    public void loadTaskDescription(String name, String description, String imageURL) {
        logs.debug("Loading New Task - " + name);

        StringBuilder sb = new StringBuilder();
        sb.append("<html>");
        sb.append("<BR/><BR/><BR/>");
        //sb.append("<B><H2>"+name+"</B></H2>");
        sb.append("<B><H2 style='margin-left:150'>" + name + "</B></H2>");
        sb.append("<BR/><BR/>");
        sb.append("<img src='" + imageURL + "' height='300' width='300' hspace='40'> </img>");
        sb.append("<BR/><BR/>");

        description = description.replaceFirst("Problem:", "<B>Problem:</B>");
        description = description.replaceFirst("Goal:", "<B>Goal:</B>");
        description = description.replaceFirst("Hint:", "<B>Hint:</B>");

        description = description.replaceAll("NEWLINE", "<BR/>");

        sb.append("<div style='margin-left:10'>" + description + "</div>");

        sb.append("</html>");

        situationLabel.setText(sb.toString());
        situationLabel.setHorizontalAlignment(javax.swing.SwingConstants.LEFT);

        this.validate();
        mainPanel.repaint();
    }

    /**
     * This method replaces situation panel with graph panel and vice versa
     */
    public void prepareModelDesignPanel() {
        logs.debug("Loading Model Design Panel");

        mainPanel.removeAll();
        mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);
        mainPanel.add(getGraphPaneScrollPane(), BorderLayout.CENTER);
        mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
        //isSituationTabSelected = false;

        this.validate();
        mainPanel.repaint();
    }

//    public boolean isSituationSelected() {
//        return isSituationTabSelected;
//    }

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

            toolBars.add(getFileToolBar());
            toolBars.add(getEditToolBar());
            toolBars.add(getViewToolBar());

            toolBarPanel.add(getModelToolBar(), null);
            toolBars.add(getModelToolBar());

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
    public GraphEditorPane getGraphEditorPane() {
        if (graphEditorPane == null) {
            logs.debug("making new graph editor pane");
            graphEditorPane = new GraphEditorPane(this, getStatusBarPanel());
            graphEditorPane.setAntiAliased(GlobalProperties.getInstance()
                    .isAntialiasing());
            graphEditorPane.setDoubleBuffered(GlobalProperties.getInstance()
                    .isDoubleBuffering());
        }
        graphEditorPane.setBackgroundComponent(situationLabel);
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

            // Save session in Server when graph changes
            prop.addGraphChangeListener(new GraphChangeListener() {
                public void graphChanged() {
                    PersistenceManager.saveSession();
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
        activityLogs.info("User exited Dragoon....");

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
    public ModelToolBar getModelToolBar() {
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
    public StatusBarPanel getStatusBarPanel() {
        if (statusBarPanel == null) {
            statusBarPanel = new StatusBarPanel();
            statusBarPanel.setStatusMessage("", true);
        }
        return statusBarPanel;
    }

    private void loadTask() {
        try {
            String task = ApplicationContext.getCurrentTaskID();
            String author = ApplicationContext.getAuthor();
            String section = ApplicationContext.getSection();
            mainMenu.getFileMenu().openTaskById(task,author,section);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Method to Load user session form Server It will load previously saved
     * Graph from the last session of user
     * Modified by Reid: if in Author mode and retrieving another author's graph to edit, 
     * sets Author to the current user, effectively creating a new graph that is a 
     * copy of the other Author's graph
     */
    private void loadSavedSession() {
        try {
            String graphXML = PersistenceManager.loadSession();
            
            if (!graphXML.trim().isEmpty()) {
                getGraphEditorPane().resetModelGraph();
                GraphLoader loader = new GraphLoader(getGraphEditorPane());
                loader.loadFromServer(graphXML);
                prepareModelDesignPanel();
                
                if(ApplicationContext.isAuthorMode()){
                    ApplicationContext.setAuthor(ApplicationContext.getUserID());
                    if(ApplicationContext.getNewTaskID() != null && !ApplicationContext.getNewTaskID().equals("")){
                        ApplicationContext.setCurrentTaskID(ApplicationContext.getNewTaskID());
                    }
                }
            }
        } catch (IOException ex) {
            logs.error("Error loading session from database. " + ex.getMessage());
            ex.printStackTrace();
        } catch (GraphLoader.IncorcectGraphXMLFileException ex) {
            logs.error("Could not Load Graph : Incorrect Graph XML. " + ex.getMessage());
        }
        catch (DocumentException ex) {
            logs.error("XML Document is not parsable." + ex.getMessage());
        }
    }

    public static void refreshGraph() {
        getInstance().getGraphEditorPane().getLayoutCache().reload();
        getInstance().getGraphEditorPane().repaint();
        getInstance().validate();
        getInstance().repaint();
    }
}
