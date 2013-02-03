/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.editor;

import edu.asu.laits.model.TaskMenuItem;
import edu.asu.laits.model.TaskSolution;
import java.util.HashMap;

/**
 *
 * @author ramayantiwari
 */
public class ApplicationContext {
  private static String firstName;
  private static String lastName;
  private static String asuid;
  private static String appMode;
  
  private static boolean isValid = false;
  private static TaskSolution correctSolution;
  private static HashMap<String,TaskMenuItem> taskIdNameMap;
  private static String currentTaskID;
  private static boolean isProblemSolved = false;
  
  
  public static String getUserFirstName(){
    return firstName;
  }
  
  public static void setUserFirstName(String fName){
    firstName = fName;
  }
  
  public static String getUserLastName(){
    return lastName;
  }
  
  public static void setUserLastName(String lName){
    lastName = lName;
  }
  
  public static String getUserASUID(){
    return asuid;
  }
  
  public static void setUserASUID(String uid){
    asuid = uid;
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
