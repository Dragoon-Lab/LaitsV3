/**
 * LAITS Project Arizona State University (c) 2013, Arizona Board of Regents for
 * and on behalf of Arizona State University. This file is part of LAITS.
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
package edu.asu.laits.editor;

import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.StatsCollector;
import edu.asu.laits.model.Task;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author ramayantiwari
 */
public class ApplicationContext {

    private static String userId;
    private static AppMode appMode;
    private static String section;
    private static String author;
    public static String APP_HOST = "http://dragoon.asu.edu/ram";
    private static String forumURL = "http://dragoon.asu.edu/ram";
    private static TaskSolution correctSolution;
    private static String currentTaskID;
    private static String newTaskID;
    private static boolean isProblemSolved = false;
    private static boolean helpBubbles = false;
    private static String session_id;
    public static long SESSION_START_TIME = new Date().getTime();
    
    public static Map<String, StatsCollector> studentCheckDemoStats = new HashMap<String, StatsCollector> ();
    
    // Task is used at many places in the application. It should be same for all the uses
    private static Task task;

    public static boolean isHelpBubbles() {
        return helpBubbles;
    }

    private static ApplicationContext.ApplicationEnvironment applicationEnvironment;

    public enum ApplicationEnvironment {

        DEV, TEST, PROD
    }

    public static String getUserID() {
        return userId;
    }

    public static void setUserID(String uid) {
        userId = uid;
    }
    
   public static String getAuthor() {
        return author;
    }

    public static void setAuthor(String authorName) {
        author = authorName;
    }

    public static String getSection() {
        return section;
    }

    public static void setSection(String theSection) {
        section = theSection;
    }

    public static String getForumURL() {
        return forumURL;
    }

    public static void setForumURL(String theForum) {
            forumURL = theForum;
    }

    public static void setAppMode(String mode) {
        appMode = AppMode.getEnum(mode);
    }

    public static void setCorrectSolution(TaskSolution sol) {
        correctSolution = sol;
    }

    public static TaskSolution getCorrectSolution() {
        return correctSolution;
    }

    public static String getCurrentTaskID() {
        return currentTaskID;
    }

    public static void setCurrentTaskID(String uid) {
        currentTaskID = uid;
    }

    public static String getNewTaskID() {
        return newTaskID;
    }

    public static void setNewTaskID(String newTaskID) {
        ApplicationContext.newTaskID = newTaskID;
    }
    
    public static String getSessionID() {
        return session_id;
    }

    public static void setSessionID(String sid) {
        session_id = sid;
    }
    
    public static boolean isProblemSolved() {
        return isProblemSolved;
    }

    public static void setProblemSolved(boolean input) {
        isProblemSolved = input;
    }

    public static List<HelpBubble> getHelp(String order, String time, String cevent) {
        return correctSolution.checkForHelp(order, time, cevent);

    }

    public static ApplicationContext.ApplicationEnvironment getApplicationEnvironment() {
        return applicationEnvironment;
    }

    public static void setApplicationEnvironment(ApplicationContext.ApplicationEnvironment en) {
        applicationEnvironment = en;
    }

    public static boolean isAuthorMode() {
        return (appMode.equals(AppMode.AUTHOR));
    }

    public static boolean isStudentMode() {
        return (appMode.equals(AppMode.STUDENT));
    }

    public static boolean isCoachedMode() {
        return (appMode.equals(AppMode.COACHED));
    }

    public static boolean isTestMode() {
        return (appMode.equals(AppMode.TEST));
    }

    public static AppMode getAppMode() {
        return appMode;
    }
    
    /**
     * This method returns current Task.
     * For Author Mode - task should be created only once with default values.
     * For all other modes - Task object is already created and stored in TaskSolution
     * @return 
     */
    public static Task getCurrentTask(){
        if(task == null){
            // initialize task for different modes
            if(isAuthorMode()){
                task = new Task();
            }else{
                task = correctSolution.getTaskDetails();
            }
        }
        
        return task;
    }
    
    public static void setCurrentTask(Task predefinedTask){
        System.out.println("Setting Current Task to: " + predefinedTask.toString());
        task = predefinedTask;
    }
   
    public static void updateCheckUsageStats(int tabId, String nodeName) {
        if(initStatsMap(nodeName)) {
            switch(tabId) {
                case 0:
                    studentCheckDemoStats.get(nodeName).updateDescriptionPanelCheckCount();
                    break;

               case 1:
                    studentCheckDemoStats.get(nodeName).updatePlanPanelCheckCount();
                    break;

               case 2:
                    studentCheckDemoStats.get(nodeName).updateCalculationsPanelCheckCount();
                    break;    
            }
        }
    }
    
    public static void updateDemoUsageStats(int tabId, String nodeName) {
        if(initStatsMap(nodeName)) {
            switch(tabId) {
                case 0:
                    studentCheckDemoStats.get(nodeName).updateDescriptionPanelDemoCount();
                    break;

               case 1:
                    studentCheckDemoStats.get(nodeName).updatePlanPanelDemoCount();
                    break;

               case 2:
                    studentCheckDemoStats.get(nodeName).updateCalculationsPanelDemoCount();
                    break;    
            }
        }
    }
    
    public static String logCheckDemoStats() {
        return studentCheckDemoStats.toString();
    }
    
    public static StatsCollector getCheckDemoStats(String nodeName) {
        return studentCheckDemoStats.get(nodeName);
    }
    
    private static boolean initStatsMap(String nodeName) {
        if(nodeName == null || nodeName.trim().equals(""))
            return false;
                    
        if(studentCheckDemoStats.get(nodeName) == null)
            studentCheckDemoStats.put(nodeName, new StatsCollector());
        
        return true;
    }
}
