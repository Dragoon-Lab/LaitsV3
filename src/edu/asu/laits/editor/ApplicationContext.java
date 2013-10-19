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

import edu.asu.laits.gui.MainWindow;
import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.HelpBubble;
import edu.asu.laits.model.SolutionNode;
import edu.asu.laits.model.TargetNodes;
import edu.asu.laits.model.Task;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ramayantiwari
 */
public class ApplicationContext {

    private static String userId;
    private static AppMode appMode;
    private static String section;
    private static String rootURL;
    private static boolean isValid = false;
    private static TaskSolution correctSolution;
    private static String currentTaskID;
    private static boolean isProblemSolved = false;
    public static String taskLoaderURL;
    private static boolean helpBubbles = false;
    private static TargetNodes targetNodes;
    
    // Task is used at many places in the application. It should be same for all the uses
    private static Task task;

    public static boolean isHelpBubbles() {
        return helpBubbles;
    }

    private static ApplicationContext.ApplicationEnvironment applicationEnvironment;

    public enum ApplicationEnvironment {

        DEV, TEST, PROD
    }


    public static void setLoaderURL(String baseURL) {
        taskLoaderURL = baseURL.concat("/task_fetcher.php?taskid=");
    }

    public static String getRootURL() {
        return rootURL;
    }

    public static void setRootURL(String baseURL) {
        rootURL = baseURL;
    }

    public static String getUserID() {
        return userId;
    }

    public static void setUserID(String uid) {
        userId = uid;
    }

    public static String getSection() {
        return section;
    }

    public static void setSection(String theSection) {
        section = theSection;
    }

    public static boolean isUserValid() {
        return isValid;
    }

    public static void setUserValid(boolean input) {
        isValid = input;
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
    

    public static TargetNodes getTargetNodes() {
        return targetNodes;
    }

    public static void initTargetNodes() {
        targetNodes = new TargetNodes();
    }
    
}
