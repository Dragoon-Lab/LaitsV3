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
package edu.asu.laits.gui.nodeeditor;

import edu.asu.laits.editor.ApplicationContext;
import edu.asu.laits.logger.UserActivityLog;
import java.util.HashMap;
import java.util.Map;
import javax.swing.JTabbedPane;
import org.apache.log4j.Logger;

/**
 *
 * @author ramayantiwari
 */
public class NodeEditorTabbedPane extends JTabbedPane {

    private NodeEditorController _controller;
    private static int MAX_TAB_INDEX = 2;
    private static Logger logs = Logger.getLogger("DevLogs");
    private static Logger activityLogs = Logger.getLogger("ActivityLogs");
    
    public NodeEditorTabbedPane(NodeEditorController controller) {
        _controller = controller;
    }

    @Override
    public void setSelectedIndex(int newIndex) {
        int currentIndex = getSelectedIndex();
        logs.info("Current Index "+currentIndex+" New Index:"+newIndex);
        
        // If Old Index was not initialized return 0 as New Tab
        if(currentIndex == -1)
            super.setSelectedIndex(0);
        
        else if(newIndex >= 0 && newIndex <= MAX_TAB_INDEX){
            if(currentIndex != newIndex){
                int res = _controller.processTabChange(currentIndex, newIndex);
                super.setSelectedIndex(res);
                Map<String, Object> logMessage = new HashMap<String, Object>();
                logMessage.put("type","dialog-box-tab");
                logMessage.put("name", "node-editor");
                logMessage.put("tab", NodeEditorView.getTabName(res));
                activityLogs.debug(new UserActivityLog(UserActivityLog.UI_ACTION, logMessage));
                
                if(!ApplicationContext.isTestMode())
                    _controller.initActionButtons();
            }else{
                super.setSelectedIndex(newIndex);
            }
        }
    }
}
