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

import edu.asu.laits.model.TaskSolution;
import edu.asu.laits.model.HelpBubble;
import java.util.ArrayList;
import java.util.List;
 
/**
 *
 * @author ramayantiwari
 */
public class ApplicationContext {
  private static String userId;
  private static String appMode;
  private static String section;
  private static String rootURL;
  
  private static GraphEditorPane graphPane;
  private static boolean isValid = false;
  private static TaskSolution correctSolution;
  private static String currentTaskID;
  private static boolean isProblemSolved = false;
  public static String taskLoaderURL;
  private static int currentOrder = 1;
  private static List<String> nextNodes = new ArrayList<String>();
  private static boolean helpBubbles = false;

    public static boolean isHelpBubbles() {
        return helpBubbles;
    }

  public static void setNextNodes(String parentNode) {
//        ApplicationContext.nextNodes = nextNodes;
      List<String> childNodes = new ArrayList<String>();
      childNodes = correctSolution.getNodeByName(parentNode).getInputNodes();
      for(String childNode : childNodes){
          System.out.println("checking " + childNode);
          if (graphPane.getModelGraph().getVertexByName(childNode) == null && nextNodes.indexOf(childNode) == -1){
             addNextNodes(childNode);
             System.out.println("added " + childNode);
          }
      }
      removeNextNodes(parentNode);
  }

  public static List<String> getNextNodes() {
        return nextNodes;
  }
  
  public static void addNextNodes(String nextNode){
  
      System.out.println("adding " + nextNode);
      nextNodes.add(nextNode);
      for(String nNode : nextNodes){
          System.out.println("current next nodes include " + nNode + "   ");
      }
  }
  
  public static void removeNextNodes(String nextNode){
      int index = nextNodes.indexOf(nextNode);
      if(index != -1){
      nextNodes.remove(index);
      }
  }
  
  public static String getFirstNextNode(){
      if (!nextNodes.isEmpty()){
        return nextNodes.get(0);
      } else {
          return null;
      }
  }

  
  private static ApplicationEnvironment applicationEnvironment;
  
  public enum ApplicationEnvironment{
        DEV, TEST, PROD
  }

  public static int getCurrentOrder() {
        return currentOrder;
  }
  
  public static void nextCurrentOrder(){
      currentOrder++;
  } 

  public static String getNameByOrder(int order){
      if(correctSolution.getNodeByOrder(order) != null){
          System.out.println(correctSolution.getNodeByOrder(order).getNodeName());
      return correctSolution.getNodeByOrder(order).getNodeName();
      } else{
          return null;
      }
  }
  
  public static void setLoaderURL(String baseURL){
      taskLoaderURL =  baseURL.concat("/task_fetcher.php?taskid=");
  }
  
  public static String getRootURL(){
      return rootURL;
  }
  
  public static void setRootURL(String baseURL){
      rootURL =  baseURL;
  }
  
  public static String getUserID(){
    return userId;
  }
  
  public static void setUserID(String uid){
    userId = uid;
  }
  
  public static String getSection(){
    return section;
  }
  
  public static void setSection(String theSection){
    section = theSection;
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
  
  public static List<HelpBubble> getHelp(String order, String time, String cevent){
      return correctSolution.checkForHelp(order, time, cevent);
      
  }
  
  public static void setGraphEditorPane(GraphEditorPane gp){
      graphPane = gp;
  }
  
  public static GraphEditorPane getGraphEditorPane(){
      return graphPane;
  }
  
  public static ApplicationEnvironment getApplicationEnvironment(){
    return applicationEnvironment;
  }
  
  public static void setApplicationEnvironment(ApplicationEnvironment en){
      applicationEnvironment = en;
  }
}
