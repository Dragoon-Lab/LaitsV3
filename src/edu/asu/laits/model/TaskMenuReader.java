/**
 * LAITS Project
 * Arizona State University
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State University.
 * This file is part of LAITS.
 *
 * LAITS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * LAITS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public License
 * along with LAITS.  If not, see <http://www.gnu.org/licenses/>.
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
