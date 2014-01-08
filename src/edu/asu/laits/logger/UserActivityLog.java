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

import com.google.gson.GsonBuilder;

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
    
    private String method;
    private String logMessage;
    
    public UserActivityLog(String method, String message) {
        this.method = method;
        this.logMessage = message;
    }
    
    public String getMethod() {
        return method;
    }
    
    public String getLogMessage() {
        return logMessage;
    }
    
    @Override
    public String toString() {
        return "Method: " + method + " Message: " + logMessage;
    }
}
