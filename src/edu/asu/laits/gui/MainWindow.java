package edu.asu.laits.gui;

import edu.asu.laits.editor.ApplicationContext;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
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
import edu.asu.laits.editor.listeners.GraphSaveListener;

import javax.swing.JScrollPane;
import edu.asu.laits.gui.toolbars.FileToolBar;
import edu.asu.laits.gui.toolbars.EditToolBar;
import edu.asu.laits.gui.toolbars.ModelToolBar;
import edu.asu.laits.gui.toolbars.TutorModeToolBar;
import edu.asu.laits.gui.toolbars.ViewToolBar;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.TaskSolutionReader;
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import java.awt.Color;
import java.io.FileInputStream;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import javax.swing.BorderFactory;

import javax.swing.BoxLayout;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.log4j.Logger;

/**
 * The main window in the program. This can be opened both with an empty graph
 * and with the method openWindowWithFile which opens a new window and loads a
 * graph file into it.
 */
public class MainWindow extends JFrame {

    private MainMenu mainMenu = null;
    private JPanel mainPanel = null;
    private JScrollPane introductionPanel = null;
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
    private TutorModeToolBar tutorModeToolBar = null;
    private List<JToolBar> toolBars = new LinkedList<JToolBar>(); 
    private StatusBarPanel statusBarPanel = null;
    private boolean isSituationTabSelected = true;

    // Label to Display Tasks
    JLabel situationLabel;
    /**
     * Logger
     */
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
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
        setExtendedState(MAXIMIZED_BOTH);
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
        //Toolkit tk = Toolkit.getDefaultToolkit();
        //int xSize = ((int) tk.getScreenSize().getWidth());
        //int ySize = ((int) tk.getScreenSize().getHeight());
        //this.setPreferredSize(new Dimension(xSize, ySize));
        
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
        if (mainPanel == null) {
            mainPanel = new JPanel();
            mainPanel.setLayout(new BorderLayout());
            mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);
            
            
            // Temporary - switch panels based on Mode
            logs.debug("Application running in "+ApplicationContext.getAppMode() + " Mode");
            if(ApplicationContext.getAppMode().equals("AUTHOR"))
                mainPanel.add(getGraphPaneScrollPane(), BorderLayout.CENTER);
            else{
                mainPanel.add(getIntroductionPanel(), BorderLayout.CENTER);
                // Initialize Situation Panel so that first task can be loaded
                getSituationPanel();
                loadFirstTask();                
            }
            mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
        }
        return mainPanel;
    }

    /**
     * This method create a JPanel for displaying Introduction Slides
     */ 
    private JScrollPane getIntroductionPanel(){
        if(introductionPanel == null){
            logs.debug("Initializing Introduction Panel");
            
            introductionPanel = new JScrollPane();
            
            // Initialize All the Slides 
            InstructionPanel  panel = new InstructionPanel(this);
            panel.setBackground(Color.WHITE);
            introductionPanel.setViewportView(panel);
        } 
        
        return introductionPanel;
    }
    
    /**
     * This method create a JPanel for displaying Situation of a Task
     */ 
    private JScrollPane getSituationPanel(){
        if(situationPanel == null){
            logs.debug("Initializing Situation Panel");
            
            situationPanel = new JScrollPane();
            
            situationLabel = new JLabel("");
            situationLabel.setVerticalTextPosition(JLabel.BOTTOM);
            situationLabel.setHorizontalTextPosition(JLabel.CENTER);
            situationLabel.setVerticalAlignment(JLabel.TOP);
            situationLabel.setHorizontalAlignment(JLabel.CENTER);
            situationLabel.setBorder(BorderFactory.createTitledBorder(""));
            situationLabel.setBackground(Color.WHITE);
            situationLabel.setOpaque(true);
            situationLabel.setVerticalAlignment(SwingConstants.TOP);
            
            situationPanel.setViewportView(situationLabel); 
            
        } 
        
        return situationPanel;
    }
    
    public void loadTaskDescription(String name, String description, String imageURL){
        logs.debug("Loading New Task ");
        
        StringBuilder sb = new StringBuilder();
        sb.append("<html><center>");
        sb.append("<BR/><BR/><BR/>");
        sb.append("<B><H2>"+name+"</B></H2>");
        sb.append("<BR/><BR/>");
        sb.append("<img src='"+imageURL+"' height='300' width='300'> </img>");
        sb.append("</center><BR/><BR/>");
        
        description = description.replaceFirst("Problem:", "<B>Problem:</B>");
        description = description.replaceFirst("Goal:", "<B>Goal:</B>");
        description = description.replaceFirst("Hint:", "<B>Hint:</B>");
        
        description = description.replaceAll("NEWLINE", "<BR/>");
        
        sb.append(description);
       
        sb.append("</html");
        
        situationLabel.setText(sb.toString());
        this.validate();
        mainPanel.repaint();
    }
    
    /**
     * This method replaces situation panel with graph panel and vice versa
     */ 
    public void switchTutorModelPanels(boolean toSituationPanel){
        if(toSituationPanel){
            activityLogs.debug("User is viewing Situation Panel.");
            logs.debug("Switching to Situation Panel");
            mainPanel.removeAll();
            mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);
            mainPanel.add(getSituationPanel(), BorderLayout.CENTER);            
            mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);   
            isSituationTabSelected = true;
        }else{
            activityLogs.debug("User is viewing Model Design Panel.");
            logs.debug("Switching to Model Design Panel");
            mainPanel.removeAll();
            mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);
            mainPanel.add(getGraphPaneScrollPane(), BorderLayout.CENTER);
            mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
            isSituationTabSelected = false;
        }
        this.validate();
        
        mainPanel.repaint();
    }
    
    
    /**
     * This method replaces situation panel with graph panel and vice versa
     */
    public void displayIntroductionSlides() {
        activityLogs.debug("User is viewing Indroduction Slides.");
        logs.debug("Switching to Introduction Panel");
        
        mainPanel.removeAll();
        mainPanel.add(getToolBarPanel(), BorderLayout.NORTH);
        mainPanel.add(getIntroductionPanel(), BorderLayout.CENTER);
        mainPanel.add(getStatusBarPanel(), BorderLayout.SOUTH);
        

        this.validate();
        mainPanel.repaint();
    }
    
    public boolean isSituationSelected(){
        return isSituationTabSelected;
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
            
            toolBars.add(getFileToolBar());
            toolBars.add(getEditToolBar());
            toolBars.add(getViewToolBar());
            
            // Temporary - Add toobar based on mode
            if(ApplicationContext.getAppMode().equals("STUDENT")){
                toolBarPanel.add(getTutorModeToolBar(), null);
                toolBars.add(getTutorModeToolBar());
            }
            
            toolBarPanel.add(getModelToolBar(), null);
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
    public GraphEditorPane getGraphEditorPane() {
        if (graphEditorPane == null) {
            graphEditorPane = new GraphEditorPane(this, getStatusBarPanel());
            //getStatusBarPanel().setGraphPane(graphEditorPane);
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
            
            try{
                uploadLogFiles();
                Thread.sleep(1000);
                
            }catch(Exception e){
                e.printStackTrace();
            }
            System.exit(0);
        } else {
            setVisible(false);
            dispose();
        }
    }
    
    private void uploadLogFiles(){
        logs.debug("Uploading Log Files to Server.");
        activityLogs.debug("User has closed LAITS.... ");
        
        FTPClient client = new FTPClient();
        FileInputStream fis = null;

    try {
        client.connect("laits.engineering.asu.edu");
        client.login("upload@laits.engineering.asu.edu", "amt22amt");

        String filename1 = "logs/activity.log";
        String filename2 = "logs/laits.log";
        
        fis = new FileInputStream(filename1);
        DateFormat  dateFormat = new SimpleDateFormat("MM-dd_HH:mm:ss");
        Date date = new Date();
        
        String name1 = ApplicationContext.getUserASUID()+"_"+dateFormat.format(date)+"_activity.log";
        String name2 = ApplicationContext.getUserASUID()+"_"+dateFormat.format(date)+"_laits.log";
        
        client.storeFile(name1, fis);
        fis = new FileInputStream(filename2);
        client.storeFile(name2, fis);
        fis.close();
        client.logout();
    } catch (IOException e) {
        e.printStackTrace();
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

    private TutorModeToolBar getTutorModeToolBar(){
        if(tutorModeToolBar == null){
            tutorModeToolBar = new TutorModeToolBar(this);
        }
        
        return tutorModeToolBar;
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
    
    
    private void loadFirstTask(){
        activityLogs.debug("Student is given default problem ID: 105 - Intro 1");
        
        TaskSolutionReader solutionReader = new TaskSolutionReader();
        try{
            TaskSolution solution = solutionReader.loadSolution("105");
            ApplicationContext.setCorrectSolution(solution);
            
            this.loadTaskDescription(ApplicationContext.getTaskIdNameMap().get("105").getTaskName(),
                    solution.getTaskDescription(), 
                    solution.getImageURL());
            ApplicationContext.setCurrentTaskID("105");
        }catch(Exception e){
            e.printStackTrace();
        }
    }
    
    
}
