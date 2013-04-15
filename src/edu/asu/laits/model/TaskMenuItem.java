/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

/**
 *
 * @author ramayantiwari
 */
public class TaskMenuItem {
    private String TaskId;
    private String TaskLevel;
    private String TaskName;
    private String TaskPhase;
    
    public String getTaskId(){
        return TaskId;
    }
    
    public String getTaskLevel(){
        return TaskLevel;
    }
    
    public String getTaskName(){
        return TaskName;
    }
    
    public String getTaskPhase(){
        return TaskPhase;
    }
    
    public void setTaskId(String id){
        TaskId = id;
    }
    
    public void setTaskLevel(String tl){
        TaskLevel = tl;
    }
    
    public void setTaskName(String name){
        TaskName = name;
    }
    
    public void setTaskPhase(String phase){
        TaskPhase = phase;
    }

}
