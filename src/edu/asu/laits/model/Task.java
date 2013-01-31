/**
 * LAITS Project
 * Arizona State University
 */

package edu.asu.laits.model;

/**
 *
 * @author ramayantiwari
 */
public class Task {
    private String taskName;
    private String taskDescription;
    private String imageURL;
    private int startTime, endTime;
    private String units;
    
    public Task(){
        taskName = "";
        taskDescription = "";
        imageURL = "";
        startTime = 0;
        endTime = 10;
        units = "Days";
    }
    
    public Task(int s, int e, String u){
        this.startTime = s;
        this.endTime = e;
        this.units = u;
    }
    
    public int getStartTime(){
        return startTime;
    }
    
    public void setStartTime(int s){
        startTime = s;
    }
    
    public int getEndTime(){
        return endTime;
    }
    
    public void setEndTime(int s){
        endTime = s;
    }
    
    public String getUnits(){
        return units;
    }   
    
    public void setUnits(String inputUnits){
        units = inputUnits;
    }
    
    public String getTaskName(){
        return taskName;
    }
    
    public void setTaskName(String inputName){
        taskName = inputName;
    }
    
    public String getTaskDescription(){
        return taskDescription;
    }
    
    public void setTaskDescription(String inputDesc){
        taskDescription = inputDesc;
    }
    
    public String getImageURL(){
        return imageURL;
    }
    
    public void setImageURL(String input){
        imageURL = input;
    }    
    
}
