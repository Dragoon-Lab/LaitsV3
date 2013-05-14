/**
 * LAITS 
 * Project
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

package edu.asu.laits.editor;

import edu.asu.laits.model.TaskMenuItem;
import edu.asu.laits.model.TaskSolution;
import java.util.HashMap;
import org.apache.log4j.Logger;

/**
 *
 * @author ramayantiwari
 */
public class ApplicationContext {
  private static String userId;
  private static String appMode;
  
  private static boolean isValid = false;
  private static TaskSolution correctSolution;
  private static HashMap<String,TaskMenuItem> taskIdNameMap;
  private static String currentTaskID;
  private static boolean isProblemSolved = false;
  
  public static String getUserID(){
    return userId;
  }
  
  public static void setUserID(String uid){
    userId = uid;
  }
  
  public static boolean isUserValid(){
    return isValid;
  }
  
  public static void setUserValid(boolean input){
    isValid = input;
  }
  
  public static String getAppMode(){
      return appMode;
  }
  
  public static void setAppMode(String s){
      appMode = s;
  }
  
  public static void setCorrectSolution(TaskSolution sol){
      correctSolution = sol;
  }
  
  public static TaskSolution getCorrectSolution(){
      return correctSolution;
  }
  
  public static void setTaskIdNameMap(HashMap<String,TaskMenuItem> map){
      taskIdNameMap = map;
  }
  
  public static HashMap<String,TaskMenuItem> getTaskIdNameMap(){
      return taskIdNameMap;
  }
  
  public static String getCurrentTaskID(){
    return currentTaskID;
  }
  
  public static void setCurrentTaskID(String uid){
    currentTaskID = uid;
  }
  
  public static boolean isProblemSolved(){
    return isProblemSolved;
  }
  
  public static void setProblemSolved(boolean input){
    isProblemSolved = input;
  }
}
