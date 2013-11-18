package edu.asu.laits.properties;

import java.awt.Color;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;

import javax.help.HelpBroker;
import javax.help.HelpSet;

import edu.asu.laits.editor.GraphEditorPane;


import com.thoughtworks.xstream.XStream;
import edu.asu.laits.editor.ApplicationContext;
import java.awt.Dimension;
import java.awt.Point;
import java.util.HashMap;
import java.util.Map;
import javax.help.event.HelpSetListener;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

/**
 * This implements the design pattern singleton. It contains global properties
 * and settings for the program. It has methods that automatically saves and
 * loads the properties to and from a properties file
 *
 */
public class GlobalProperties {

    public static final String PROGRAM_NAME = "Dragoon";
    public static final String PROPERTIES_DIR = ".dragoon";
    public static final String HELPSET_DESTINATION = "GraphEditor.hs";
    public static final double SCALE_INTERVALL = 0.2;
    private static GlobalProperties instance = null;
    private int numberOfLatestFilesSaved = 6;
    private LinkedList<File> latestFiles;
    
    private boolean antialiasing = true;
    private boolean doubleBuffering = true;
    private boolean gridEnabled = false;
    private int gridMode = GraphEditorPane.CROSS_GRID_MODE;
    private double gridSize = 25.0;
    private boolean gridVisable = true;
    private Color gridColor = Color.GRAY;
    private String UITheme = null;
    private transient List<LatestFilesPropertyChangeListener> latestFilesListeners = new LinkedList<LatestFilesPropertyChangeListener>();
    private transient HelpSet helpSet;
    private transient HelpBroker helpBroker;
    
    public static Map<String, String> GENERAL_LABEL_MAP = new HashMap<> ();
    public static Map<String, String> GENERAL_TOOLTIP_MAP = new HashMap<> ();
    public static Map<String, String> AUTHOR_LABEL_MAP = new HashMap<> ();
    public static Map<String, String> AUTHOR_TOOLTIP_MAP = new HashMap<> ();
    public static Map<String, String> STUDENT_LABEL_MAP = new HashMap<> ();
    public static Map<String, String> STUDENT_TOOLTIP_MAP = new HashMap<> ();
    public static Map<String, String> TEST_LABEL_MAP = new HashMap<> ();
    public static Map<String, String> TEST_TOOLTIP_MAP = new HashMap<> ();
    public static Map<String, String> COACHED_LABEL_MAP = new HashMap<> ();
    public static Map<String, String> COACHED_TOOLTIP_MAP = new HashMap<> ();
    
    private static Logger logs = Logger.getLogger("DevLogs");
    /**
     * @return the helpBroker
     */
    public HelpBroker getHelpBroker() {
        return helpBroker;
    }

    private GlobalProperties() throws DocumentException{
        readUIProperties();
        latestFiles = new LinkedList<File>();
        createHelpSet(HELPSET_DESTINATION);
    }

    public static GlobalProperties getInstance() {
        if (instance == null) {
            try {
                instance = new GlobalProperties();
                instance.initializeNotSerializeFeelds();
            } catch(Exception ex) {
                ex.printStackTrace();
                logs.error("Error in reading property file. Details: " + ex.getMessage());
                System.exit(1);
            } 
        }

        return instance;
    }

    private void readUIProperties() throws DocumentException {
        SAXReader reader = new SAXReader();
        Document document = reader.read(getClass().getResource("/resources/properties.xml"));        
        Element dragoonProperties = document.getRootElement();
        
        Element userInterface = dragoonProperties.element("UserInterface");
        Element swingControls = userInterface.element("SwingControls");
        
        Element generalUIControls = swingControls.element("GeneralControls");
        fillUIProperties(generalUIControls, GENERAL_LABEL_MAP, GENERAL_TOOLTIP_MAP);
        
        Element modeOverrides = swingControls.element("ModeOverrides");
        
        Element authorModeUIElement = modeOverrides.element("AuthorModeControls");
        fillUIProperties(authorModeUIElement, AUTHOR_LABEL_MAP, AUTHOR_TOOLTIP_MAP);
        
        Element studentModeUIElement = modeOverrides.element("StudentModeControls");
        fillUIProperties(studentModeUIElement, STUDENT_LABEL_MAP, STUDENT_TOOLTIP_MAP);
        
        Element testModeUIElement = modeOverrides.element("TestModeControls");
        fillUIProperties(testModeUIElement, TEST_LABEL_MAP, TEST_TOOLTIP_MAP);
        
        Element coachedModeUIElement = modeOverrides.element("CoachedModeControls");
        fillUIProperties(coachedModeUIElement, COACHED_LABEL_MAP, COACHED_TOOLTIP_MAP);
    }

    private void readConfigs(Element configElement) {
    
    }
    
    private void fillUIProperties(Element element, Map<String, String> labelMap, Map<String, String> toolTipMap) {
        if(element == null || element.nodeCount() == 0)
            return;
        
        //Extract all the XML nodes in a list
        List<Element> uiElements = element.elements("UIElement");
        for(Element uiElement : uiElements){
            String name = uiElement.elementTextTrim("Name");
            String label = uiElement.elementTextTrim("Label");
            String toolTip = uiElement.elementTextTrim("ToolTipText");
            
            labelMap.put(name, label);
            toolTipMap.put(name, toolTip);
        }
    }
    
    private void initializeNotSerializeFeelds() {
        latestFilesListeners = new LinkedList<LatestFilesPropertyChangeListener>();
        
        List<File> latestFilesTemp = new LinkedList<File>();
        for (File f : latestFiles) {
            latestFilesTemp.add(f);
        }

        // Disabling HelpSet creation - slides are used for this
        createHelpSet(HELPSET_DESTINATION);
    }

    /**
     * Create a help set to use as help information in this application.     
     * The code is influenced from the demo code that follows with the Java Help
     * system distribution.     
     */
    private void createHelpSet(String helpSetName) {    
        ClassLoader loader = this.getClass().getClassLoader();
        URL url;
        try {
            url = HelpSet.findHelpSet(loader, helpSetName);
            HelpSet helpSet = new HelpSet(loader, url);
            
            helpBroker = helpSet.createHelpBroker();
            helpBroker.setSize(new Dimension(830, 680));     
            helpBroker.setLocation(new Point(300,100));
            
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

    }

    public void addLatestFilesPropertyChangeListener(
            LatestFilesPropertyChangeListener l) {
        latestFilesListeners.add(l);

    }

    

    /**
     * Returns a copy of he list with latest files
     *
     * @return the latestFiles
     */
    public List<File> getLatestFiles() {

        return latestFiles;
    }

    /**
     * @param latestFiles the latestFiles to set
     */
    public void addFileToLatestFiles(File file) {

        if (latestFiles.size() >= getNumberOfLatestFilesSaved()) {
            long size = latestFiles.size();

            for (long n = getNumberOfLatestFilesSaved() - 1; n < size; n++) {
                // latestFiles.remove(n);
                latestFiles.removeLast();
            }
        }

        latestFiles.addFirst(file);
        // Fire acion

        saveToPropertiesFile();

        for (LatestFilesPropertyChangeListener l : latestFilesListeners) {
            l.newFileOpened(file);
        }
    }

    /**
     * @return the numberOfLatestFilesSaved
     */
    public int getNumberOfLatestFilesSaved() {
        return numberOfLatestFilesSaved;
    }

    /**
     * @param numberOfLatestFilesSaved the numberOfLatestFilesSaved to set
     */
    public void setNumberOfLatestFilesSaved(int numberOfLatestFilesSaved) {
        this.numberOfLatestFilesSaved = numberOfLatestFilesSaved;
    }

    public boolean saveToPropertiesFile() {

        XStream xstream = new XStream();
        File propertiesDir = new File(System.getProperty("user.home")
                + File.separator + PROPERTIES_DIR + File.separator);
        File propertiesFile = new File(System.getProperty("user.home")
                + File.separator + PROPERTIES_DIR + File.separator
                + "properties.xml");
        if (!propertiesDir.exists()) {
            if (!propertiesDir.mkdir()) {
                return false;
            }
        }

        if (!propertiesFile.exists()) {
            // There is no properties file.
            try {
                propertiesFile.createNewFile();
            } catch (IOException e) {
                // TODO
                e.printStackTrace();
                return false;
            }
        }

        try {
            FileWriter writer = new FileWriter(propertiesFile);

            xstream.toXML(getInstance(), writer);
            writer.close();
        } catch (Exception e) {
            e.printStackTrace();
            System.err
                    .println("Not possible to write properties file, because of the following reason:"
                    + e.getMessage());
            return false;
        }

        return true;
    }

    /**
     * @return the helpSet
     */
    public HelpSet getHelpSet() {
        return helpSet;
    }

    /**
     * @return the antialiasing
     */
    public boolean isAntialiasing() {
        return antialiasing;
    }

    /**
     * @param antialiasing the antialiasing to set
     */
    public void setAntialiasing(boolean antialiasing) {
        this.antialiasing = antialiasing;
        saveToPropertiesFile();
    }

    /**
     * @return the doubleBuffering
     */
    public boolean isDoubleBuffering() {
        return doubleBuffering;
    }

    /**
     * @param doubleBuffering the doubleBuffering to set
     */
    public void setDoubleBuffering(boolean doubleBuffering) {
        this.doubleBuffering = doubleBuffering;
        saveToPropertiesFile();
    }

    /**
     * @return the uITheme
     */
    public String getUITheme() {
        return UITheme;
    }

    /**
     * @param theme the uITheme to set
     */
    public void setUITheme(String theme) {
        UITheme = theme;
        saveToPropertiesFile();
    }

    /**
     * @return the gridColor
     */
    public Color getGridColor() {
        return gridColor;
    }

    /**
     * @param gridColor the gridColor to set
     */
    public void setGridColor(Color gridColor) {
        this.gridColor = gridColor;
        saveToPropertiesFile();
    }

    /**
     * @return the gridEnabled
     */
    public boolean isGridEnabled() {
        return gridEnabled;
    }

    /**
     * @param gridEnabled the gridEnabled to set
     */
    public void setGridEnabled(boolean gridEnabled) {
        this.gridEnabled = gridEnabled;
        saveToPropertiesFile();
    }

    /**
     * @return the gridMode
     */
    public int getGridMode() {
        return gridMode;
    }

    /**
     * @param gridMode the gridMode to set
     */
    public void setGridMode(int gridMode) {
        this.gridMode = gridMode;
        saveToPropertiesFile();
    }

    /**
     * @return the gridSize
     */
    public double getGridSize() {
        return gridSize;
    }

    /**
     * @param gridSize the gridSize to set
     */
    public void setGridSize(double gridSize) {
        this.gridSize = gridSize;
        saveToPropertiesFile();
    }

    /**
     * @return the gridVisable
     */
    public boolean isGridVisable() {
        return gridVisable;
    }

    /**
     * @param gridVisable the gridVisable to set
     */
    public void setGridVisable(boolean gridVisable) {
        this.gridVisable = gridVisable;
        saveToPropertiesFile();
    }
}
