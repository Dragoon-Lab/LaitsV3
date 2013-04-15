package edu.asu.laits.model;

import java.util.LinkedList;

/**
 * LAITS Project
 * Arizona State University
 */

/**
 *
 * @author ramayantiwari
 */
public class TaskMenu {
   private LinkedList<TaskMenuItem> Tasks; 
   
   public LinkedList<TaskMenuItem> getAllTasks(){
       return Tasks;
   }
   
   public void setAllTasks(LinkedList<TaskMenuItem> tasks){
       Tasks = tasks;
   }
}
