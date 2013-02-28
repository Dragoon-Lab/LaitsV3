/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.core.BaseException;
import com.thoughtworks.xstream.io.xml.DomDriver;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.LinkedList;
import org.apache.log4j.Logger;

/**
 *
 * @author ramayantiwari
 */
public class TaskMenuReader {
    private static Logger logs = Logger.getLogger("DevLogs");
    
    public LinkedList<TaskMenuItem> load()
            throws Exception {
        logs.debug("Loading TaskMenuList");
        // Used to load objects from xml
        XStream xstream = new XStream(new DomDriver());
        xstream.alias("TaskMenu", TaskMenu.class);
        xstream.alias("Task", TaskMenuItem.class);
        
        TaskMenu menuList = null;
        try {
            InputStream in = getClass().getResourceAsStream("TaskMenu.xml");
            Reader reader = new InputStreamReader(in);
            menuList = (TaskMenu) xstream.fromXML(reader);
            
        } catch (Exception e) {
            // Could not read the XML file
            logs.debug(e.getMessage());
            throw new Exception("Incorrect XML for Task List");
        }
        
        
        LinkedList<TaskMenuItem> allMenuItems = menuList.getAllTasks();
        logs.debug("Menu List Size "+allMenuItems.size());
        
        return allMenuItems;
    }     
}   
