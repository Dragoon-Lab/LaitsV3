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

package edu.asu.laits.logger;

import com.google.gson.Gson;
import edu.asu.laits.editor.ApplicationContext;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

/**
 * Class to Encapsulate User Activity Logs.
 * all the possible methods are as per git documentation of new logging framework.
 * 
 * @author ramayantiwari
 */
public class UserActivityLog{
    public static final String START_WORKFLOW = "start-workflow";
    public static final String OPEN_PROBLEM = "open-problem";
    public static final String CLIENT_MESSAGE = "client-message";
    public static final String UI_ACTION = "ui-action";
    public static final String SOLUTION_STEP = "solution-step";
    public static final String SEEK_HELP = "seek-help";
    public static final String CLOSE_PROBLEM = "close-problem";
    public static final String STUDENT_STATUS = "student-status";
    
    private String method;
    private Map<String,Object> logMessage;
    
    public UserActivityLog(String method, Map<String,Object> message) {
        this.method = method;      
        logMessage = message;
        logMessage.put("time", getElapsedTime());
    }
    
    public UserActivityLog(String method, String infoMessage) {
        this.method = method;        
        logMessage = new HashMap<String, Object>();
        logMessage.put("time", getElapsedTime());
        logMessage.put("type", "info");
        logMessage.put("text", infoMessage);
    }
    
    
    public String getMethod() {
        return method;
    }
    
    /**
     * Build JSON Representation of the message.
     * This will be used by HttpLayout from Logger
     * {time:time_spent_so_far, message_param1:value1, message_param2:value2}
     * @return 
     */
    public String getLogMessage() {
        if(logMessage == null || logMessage.isEmpty())
            return "";
        Gson gson = new Gson();
        return gson.toJson(logMessage);
    }
    
    @Override
    public String toString() {
        return "Method: " + method + " Message: " + logMessage;
    }
    
    private String getElapsedTime() {
        long elapsedTimeInMilliSec = (new java.util.Date().getTime() - ApplicationContext.SESSION_START_TIME);
        
        double elapsedTime = ((double)elapsedTimeInMilliSec / 1000);
        DecimalFormat df = new DecimalFormat("#.0");
        return df.format(elapsedTime);
    }
}
