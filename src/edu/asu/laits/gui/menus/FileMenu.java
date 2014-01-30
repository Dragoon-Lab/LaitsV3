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

package edu.asu.laits.gui.menus;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JMenu;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import javax.swing.ImageIcon;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JSeparator;

import edu.asu.laits.editor.GraphEditorPane;

import edu.asu.laits.model.GraphLoader;
import edu.asu.laits.model.GraphSaver;
import edu.asu.laits.model.GraphLoader.IncorcectGraphXMLFileException;
import edu.asu.laits.editor.listeners.GraphChangeListener;
import edu.asu.laits.editor.listeners.GraphPropertiesChangeListener;
import edu.asu.laits.editor.listeners.GraphSaveListener;
import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.logger.UserActivityLog;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.TaskSolutionReader;
import edu.asu.laits.model.Vertex;
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import edu.asu.laits.properties.LatestFilesPropertyChangeListener;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.swing.JFileChooser;
import javax.swing.filechooser.FileFilter;
import org.apache.log4j.Logger;
import org.jfree.io.IOUtils;
import org.jgraph.graph.DefaultPort;

/**
 * This is the file menu that is in the MainMenu. It has Options for file
 * operations like open, save, export, import and new etc.
 *
 * @author kjellw
 *
 */
public class FileMenu extends JMenu {

    private JMenuItem newFileMenuItem = null;
    private JSeparator jSeparator = null;
    private JMenuItem openFileMenuItem = null;
    private JMenu openLatestFileMenu = null;
    private JSeparator jSeparator1 = null;
    private JMenuItem saveFileMenuItem = null;
    private JMenuItem saveAsFileMenuItem = null;
    private JSeparator jSeparator2 = null;
    private JMenuItem exitFileMenuItem = null;
    private GraphEditorPane graphPane;
    private JFileChooser saveAsFileChooser = null;
    private JFileChooser openFileChooser = null;
    // Actions
    private ActionListener newAction;
    private ActionListener openAction;
    private ActionListener saveAction;
    GlobalProperties globalProperties = GlobalProperties.getInstance();
    
    /*
     * Indicate if the current graph is associated with a file
     */
    private boolean currentGraphAssociateWithFile = false;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    /*
     * The file that the current graph is asociated with
     */
    private File currentGraphsFile;
    private MainWindow mainWindow;

    /**
     * Constructor to initialize FileMenu.
     */
    public FileMenu(GraphEditorPane pane, MainWindow mainWindow) {
        super();
        this.mainWindow = mainWindow;
        graphPane = pane;

        if (!ApplicationContext.isAuthorMode()) {
            initializeTutorMenu();
        } else {
            initializeAuthorMenu();
            updateOpenLatestMenu();
            globalProperties
                    .addLatestFilesPropertyChangeListener(new LatestFilesPropertyChangeListener() {
                public void newFileOpened(File file) {
                    updateOpenLatestMenu();
                }
            });
        }

        MainGraphPropertiesChangeListener l = new MainGraphPropertiesChangeListener();
        l.graphPropertiesChanged();
        graphPane.addGraphPropertiesChangeListener(l);

    }

    private void updateOpenLatestMenu() {
        getOpenLatestFileMenu().removeAll();
        addLatestFilesMenuItems();
    }

    /**
     * This method initializes this
     *
     */
    private void initializeAuthorMenu() {
        this.setText("File");
        this.setMnemonic(KeyEvent.VK_F);
        this.add(getNewFileMenuItem());
        this.add(getJSeparator());
        this.add(getOpenFileMenuItem());
        this.add(getOpenLatestFileMenu());
        this.add(getJSeparator1());
        this.add(getSaveFileMenuItem());
        this.add(getSaveAsFileMenuItem());
        this.add(getJSeparator2());
        this.add(getExitFileMenuItem());
    }

    /**
     * This method initializes File Menu for Tutor Mode
     *
     */
    private void initializeTutorMenu() {
        initializeAuthorMenu();
        newFileMenuItem.setEnabled(false);
        openFileMenuItem.setEnabled(false);
        saveAsFileMenuItem.setEnabled(false);
        openLatestFileMenu.setEnabled(false);
        saveFileMenuItem.setEnabled(false);
        saveAsFileMenuItem.setEnabled(false);
    }

    /**
     * Method to open a new Task in Tutor Mode
     */
    public void openTaskById(String id, String author, String group) {
        TaskSolutionReader solutionReader = new TaskSolutionReader();
        try {
            TaskSolution solution = solutionReader.loadSolution(id,author,group);
            ApplicationContext.setCorrectSolution(solution);
            Map<String, Object> logMessage = new HashMap<String, Object>();
            logMessage.put("problem",id);            
            activityLogs.debug(new UserActivityLog(UserActivityLog.OPEN_PROBLEM, logMessage));
            
            mainWindow.loadTaskDescription(ApplicationContext.getCurrentTask().getTaskName(),
                    ApplicationContext.getCurrentTask().getTaskDescription(),
                    ApplicationContext.getCurrentTask().getImageURL());

            if (ApplicationContext.getCurrentTask().getTaskType().equalsIgnoreCase("debug")) {
                createGivenModel(solution, graphPane);
            }

            mainWindow.prepareModelDesignPanel();
        } catch (ArithmeticException e) {
            e.printStackTrace();
        }
    }

    /**
     * Method to create a given model in non-author mode
     * @param solution
     * @param editorPane 
     */
    private void createGivenModel(TaskSolution solution, GraphEditorPane editorPane) {
        logs.debug("Building Given Model for Task : "+ApplicationContext.getCurrentTask().getTaskName());
        List<SolutionNode> givenNodes = solution.getGivenNodes();
        logs.debug("Graph Presently Contains");
        Iterator<Vertex> it = graphPane.getModelGraph().vertexSet().iterator();
        while(it.hasNext()){
            logs.debug(it.next().getName());
        }
        
        for (SolutionNode node : givenNodes) {
            logs.info("Processing Node "+node.getNodeName());
            if(editorPane.getModelGraph().getVertexByName(node.getNodeName()) != null){
                logs.info("Node "+node.getNodeName()+" was loaded from session. Skipping in GivenModelCreation.");
               continue;
            }
            
            Vertex v = new Vertex();
            v.setVertexIndex(graphPane.getModelGraph().getNextAvailableIndex());
            
            v.setName(node.getNodeName());
            v.setCorrectDescription(node.getCorrectDescription());
            v.setPlan(node.getNodePlan());
            v.setDescriptionStatus(Vertex.DescriptionStatus.CORRECT);
            boolean plan = solution.checkNodePlan(node.getNodeName(), node.getNodeType());
            if(plan){
             
            v.setPlanStatus(Vertex.PlanStatus.CORRECT);   
            } else{
                
            v.setPlanStatus(Vertex.PlanStatus.INCORRECT);
            }
                
            v.setEquation(node.getNodeEquation());
            v.setInitialValue(node.getInitialValue());

            v.setVertexType(node.getNodeType());
            
            if (solution.checkNodeCalculations(v)) {
                v.setCalculationsStatus(Vertex.CalculationsStatus.CORRECT);
            } else {
                v.setCalculationsStatus(Vertex.CalculationsStatus.INCORRECT);
            }

            editorPane.addVertex(v);
            ApplicationContext.getCorrectSolution().getTargetNodes().setNextNodes();
            logs.debug("Added Node "+v.getName()+" in the Given Model.");
        }

        for (SolutionNode node : givenNodes) {
            List<String> inputVertices = node.getInputNodes();
            for (String vertexName : inputVertices) {
                Vertex v1 = editorPane.getModelGraph().getVertexByName(node.getNodeName());
                Vertex v2 = editorPane.getModelGraph().getVertexByName(vertexName);

                DefaultPort p1 = editorPane.getJGraphTModelAdapter().getVertexPort(v1);
                DefaultPort p2 = editorPane.getJGraphTModelAdapter().getVertexPort(v2);

                editorPane.insertEdge(p2, p1);
            }
        }
    }

    /**
     * This method initializes newFileMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getNewFileMenuItem() {
        if (newFileMenuItem == null) {
            newFileMenuItem = new JMenuItem();
            newFileMenuItem.setText("New");
            newFileMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/filenew.png")));
            newAction = new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    // If new is called a new main window is created
                    Map<String, Object> logMessage = new HashMap<String, Object>();
                    logMessage.put("type","menu-choice");
                    logMessage.put("name", "new");
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
                    MainWindow.launch();
                }
            };
            newFileMenuItem.addActionListener(newAction);
        }
        return newFileMenuItem;
    }

    /**
     * This method initializes jSeparator
     *
     * @return javax.swing.JSeparator
     */
    private JSeparator getJSeparator() {
        if (jSeparator == null) {
            jSeparator = new JSeparator();
        }
        return jSeparator;
    }

    /**
     * This method initializes openFileMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getOpenFileMenuItem() {
        if (openFileMenuItem == null) {
            openFileMenuItem = new JMenuItem();
            openFileMenuItem.setText("Open...");
            openFileMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/fileopen.png")));
            openAction = new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    Map<String, Object> logMessage = new HashMap<String, Object>();
                    logMessage.put("type","menu-choice");
                    logMessage.put("name", "open");
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));                   
                    open();
                }
            };
            openFileMenuItem.addActionListener(openAction);
        }
        return openFileMenuItem;
    }

    /**
     * Open a file chooser to choose a file to open
     *
     */
    private void open() {
        //Open a save file chooser so the user can choose a file name to save to         
        int returnVal = getOpenFileChooser().showOpenDialog(getRootPane());
        File selectedFile = null;
        if (returnVal == JFileChooser.APPROVE_OPTION) {
            selectedFile = getOpenFileChooser().getSelectedFile();

            if (graphPane.isChanged()) {
                MainWindow.openWindowWithFile(selectedFile);
                return;
            }
            openFile(selectedFile);
        }
    }

    private void openFile(File file) {
        try {
            FileReader reader = new FileReader(file);
            GraphLoader loader = new GraphLoader(graphPane);
            loader.load(reader, file);
            reader.close();
            currentGraphAssociateWithFile = true;
            currentGraphsFile = file;
            globalProperties.addFileToLatestFiles(file);

        } catch (IOException e1) {
            e1.printStackTrace();
            mainWindow.getStatusBarPanel().setStatusMessage("Error in Loading Graph File", false);
        } catch (IncorcectGraphXMLFileException e) {
            mainWindow.getStatusBarPanel().setStatusMessage("Error in Loading Graph File", false);
            e.printStackTrace();
        }
    }

    /**
     * This method initializes openLatestFileMenu
     *
     * @return javax.swing.JMenu
     */
    private JMenu getOpenLatestFileMenu() {
        if (openLatestFileMenu == null) {
            openLatestFileMenu = new JMenu();
            openLatestFileMenu.setText("Open latest...");
            openLatestFileMenu.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/fileopen.png")));
        }

        return openLatestFileMenu;
    }

    private void addLatestFilesMenuItems() {
        List<File> fileList = globalProperties.getLatestFiles();

        for (File fileProp : fileList) {
            final File file = fileProp;
            JMenuItem fileItem = new JMenuItem();
            fileItem.setText(file.getName());
            fileItem.setToolTipText(file.getAbsolutePath());
            fileItem.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    if (graphPane.isChanged()) {
                        MainWindow.openWindowWithFile(file);
                    } else {
                        openFile(file);
                    }

                }
            });
            openLatestFileMenu.add(fileItem);
        }
    }

    /**
     * This method initializes jSeparator1
     *
     * @return javax.swing.JSeparator
     */
    private JSeparator getJSeparator1() {
        if (jSeparator1 == null) {
            jSeparator1 = new JSeparator();
        }
        return jSeparator1;
    }

    /**
     * This method initializes saveFileMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getSaveFileMenuItem() {
        if (saveFileMenuItem == null) {
            saveFileMenuItem = new JMenuItem();
            saveFileMenuItem.setText("Save");
            saveFileMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/filesave.png")));
            saveFileMenuItem.setEnabled(false);
            saveAction = new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    Map<String, Object> logMessage = new HashMap<String, Object>();
                    logMessage.put("type","menu-choice");
                    logMessage.put("name", "save");
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
                    save();
                }
            };
            saveFileMenuItem.addActionListener(saveAction);
        }
        return saveFileMenuItem;
    }

    /**
     * This method initializes saveAsFileMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getSaveAsFileMenuItem() {
        if (saveAsFileMenuItem == null) {
            saveAsFileMenuItem = new JMenuItem();
            saveAsFileMenuItem.setText("Save as...");
            saveAsFileMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/filesaveas.png")));
            saveAsFileMenuItem
                    .addActionListener(new java.awt.event.ActionListener() {
                public void actionPerformed(java.awt.event.ActionEvent e) {
                    Map<String, Object> logMessage = new HashMap<String, Object>();
                    logMessage.put("type","menu-choice");
                    logMessage.put("name", "save-as");
                    activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
                    saveAs();
                }
            });
        }
        return saveAsFileMenuItem;
    }

    public void save() {
        if (currentGraphAssociateWithFile) {
            saveToFile(currentGraphsFile);
        } else {
            saveAs();
        }
    }

    private void saveAs() {
        int returnVal = getSaveAsFileChooser().showSaveDialog(getRootPane());
        if (returnVal == JFileChooser.APPROVE_OPTION) {

            File selectedFile = getSaveAsFileChooser().getSelectedFile();

            if (!selectedFile.getName().matches("(.*)(\\.dragoon)")) {

                if (selectedFile.getName().matches("\".*\"")) {
                    if (selectedFile.getName().length() < 3) {
                        JOptionPane
                                .showMessageDialog(
                                getRootPane(),
                                "Can not save to file "
                                + selectedFile
                                .getAbsolutePath()
                                + "\nBecause of the following reason:\n"
                                + "File name is too short.",
                                "Unable to save file",
                                JOptionPane.ERROR_MESSAGE);
                        return;
                    } else {
                        selectedFile = new File(selectedFile.getParent()
                                + File.separator
                                + selectedFile.getName()
                                .substring(
                                1,
                                (int) (selectedFile.getName()
                                .length() - 2)));
                    }
                } else {
                    selectedFile = new File(selectedFile.getAbsoluteFile()
                            + ".dragoon");
                }
            }
            globalProperties.addFileToLatestFiles(selectedFile);
            saveToFile(selectedFile);
        }
    }

    /**
     * Tries to save to the specified file
     */
    private void saveToFile(File file) {
        GraphSaver saver = new GraphSaver();
        try {
            FileWriter writer = new FileWriter(file);
            saver.write(writer);
            writer.close();
            currentGraphsFile = file;
            currentGraphAssociateWithFile = true;
            graphPane.getGraphProperties().setSavedAs(file);
        } catch (IOException e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();

            JOptionPane.showMessageDialog(getRootPane(),
                    "Can not save to file " + file.getAbsolutePath()
                    + "\nBecause of the following reason:\n"
                    + e1.getMessage(), "Unable to save file",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    /**
     * This method initializes jSeparator2
     *
     * @return javax.swing.JSeparator
     */
    private JSeparator getJSeparator2() {
        if (jSeparator2 == null) {
            jSeparator2 = new JSeparator();
        }
        return jSeparator2;
    }

    /**
     * This method initializes exitFileMenuItem
     *
     * @return javax.swing.JMenuItem
     */
    private JMenuItem getExitFileMenuItem() {
        if (exitFileMenuItem == null) {
            exitFileMenuItem = new JMenuItem();
            exitFileMenuItem.setText("Exit");
            exitFileMenuItem.setIcon(new ImageIcon(getClass().getResource(
                    "/resources/icons/16x16/fileclose.png")));
            exitFileMenuItem.addActionListener(new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    mainWindow.exitWindow();
                }
            });
        }
        return exitFileMenuItem;
    }

    /**
     * This method initializes saveAsFileChooser
     */
    private JFileChooser getSaveAsFileChooser() {
        if (saveAsFileChooser == null) {
            saveAsFileChooser = new JFileChooser();
            saveAsFileChooser.setDialogTitle("Save as...");
            saveAsFileChooser.setAcceptAllFileFilterUsed(true);
            saveAsFileChooser.addChoosableFileFilter(new FileFilter() {
                @Override
                public boolean accept(File f) {
                    return f.getName().matches(".*.dragoon");
                }

                @Override
                public String getDescription() {

                    return "Dragoon files (*.dragoon)";
                }
            });
        }
        return saveAsFileChooser;
    }

    /**
     * This method initializes openFileChooser
     *
     * @return javax.swing.JFileChooser
     */
    private JFileChooser getOpenFileChooser() {
        if (openFileChooser == null) {
            openFileChooser = new JFileChooser();
            openFileChooser.setDialogTitle("Open file");

            openFileChooser.addChoosableFileFilter(new FileFilter() {
                @Override
                public boolean accept(File f) {
                    return f.getName().matches(".*\\.dragoon");
                }

                @Override
                public String getDescription() {

                    return "Dragoon files (*.dragoon)";
                }
            });
        }
        return openFileChooser;
    }

    /**
     * @param currentGraphsFile the currentGraphsFile to set
     */
    public void setCurrentGraphsFile(File currentGraphsFile) {
        if (currentGraphsFile != null) {
            this.currentGraphAssociateWithFile = true;
        }
        this.currentGraphsFile = currentGraphsFile;
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
                    if(ApplicationContext.isAuthorMode())
                        getSaveFileMenuItem().setEnabled(true);
                }
            });

            prop.addSaveListener(new GraphSaveListener() {
                public void graphSaved() {
                    if(ApplicationContext.isAuthorMode())
                        getSaveFileMenuItem().setEnabled(false);
                }
            });
        }
    }

    /**
     * @return the newAction
     */
    public ActionListener getNewAction() {
        return newAction;
    }

    /**
     * @return the openAction
     */
    public ActionListener getOpenAction() {
        return openAction;
    }

    /**
     * @return the saveAction
     */
    public ActionListener getSaveAction() {
        return saveAction;
    }
}
