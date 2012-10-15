package edu.asu.laits.gui.menus;

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
import edu.asu.laits.properties.GlobalProperties;
import edu.asu.laits.properties.GraphProperties;
import edu.asu.laits.properties.LatestFilesPropertyChangeListener;

import javax.swing.JFileChooser;
import javax.swing.filechooser.FileFilter;

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

    /*
     * The file that the current graph is asociated with
     */
    private File currentGraphsFile; 
    private MainWindow mainWindow;

    public FileMenu() {
        super();
        initialize();

    }

    /**
     * This method initializes
     *
     */
    public FileMenu(GraphEditorPane pane, MainWindow mainWindow) {
        super();
        initialize();
        this.mainWindow = mainWindow;
        graphPane = pane;

        updateOpenLatestMenu();
        globalProperties
                .addLatestFilesPropertyChangeListener(new LatestFilesPropertyChangeListener() {
            public void newFileOpened(File file) {
                updateOpenLatestMenu();

            }
        });
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
    private void initialize() {
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
                    MainWindow newWindow = new MainWindow();
                    newWindow.setVisible(true);
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
        /*
         * Open a save file chooser so the user can choose a file name to save
         * to
         */

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
            // TODO Auto-generated catch block
            e1.printStackTrace();
            mainWindow.getStatusBarPanel().setStatusMessage("Error in Loading Graph File", false);
        } catch (IncorcectGraphXMLFileException e) {
            // TODO Auto-generated catch block
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

            if (!selectedFile.getName().matches("(.*)(\\.laits)")) {

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
                            + ".laits");
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
        GraphSaver saver = new GraphSaver(graphPane);
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
                    return f.getName().matches(".*.laits");
                }

                @Override
                public String getDescription() {

                    return "Laits files (*.laits)";
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
                    return f.getName().matches(".*\\.laits");
                }

                @Override
                public String getDescription() {

                    return "Laits files (*.laits)";
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
                    getSaveFileMenuItem().setEnabled(true);
                }
            });

            prop.addSaveListener(new GraphSaveListener() {
                public void graphSaved() {
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
