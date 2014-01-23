/**
 * LAITS Project
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

package edu.asu.laits.model;

import edu.asu.laits.editor.ApplicationContext;

/**
 *
 * @author ramayantiwari
 * This class is slated to be merged with TaskSolution
 */
public class Task {
    private String taskName;
    private String taskDescription;
    private String imageURL;
    private String units;
    private Times times;
    private String phase;
    private String taskType;
     
    public Task(){
        taskName = "";
        taskDescription = "";
        imageURL = "";
        units = "Days";
        times = new Times();
    }
    
    public Task(Times times, String u){
        this.times = times;
        this.units = u;
    }
    
    public Times getTimes() {
        return this.times;
    }

    public void setTimes(Times definedTimes){
        times = definedTimes;
    }
    
    public String getChartUnits(){
        return units;
    }   
    
    public void setChartUnits(String inputUnits){
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
    
    public void setImageURL(String imageURL) {
        if(imageURL.startsWith("http")){
            this.imageURL = imageURL;
        } else {
            this.imageURL = ApplicationContext.APP_HOST + imageURL;
        }
    } 
    
    /**
     * @return the phase
     */
    public String getPhase() {
        return phase;
    }

    /**
     * @param phase the phase to set
     */
    public void setPhase(String phase) {
        this.phase = phase;
    }

    /**
     * @return the phase
     */
    public String getTaskType() {
        return taskType;
    }

    /**
     * @param phase the phase to set
     */
    public void setTaskType(String type) {
        this.taskType = type;
    }
    
    public String getUnits() {
        return this.units;
    }
    
    public void setUnits(String units) {
        this.units = units;
    }
    
    public String toString(){
        return "Task Details: "+"Name : "+taskName + 
                " Type: " + taskType + 
                " Phase: " + phase + 
                " Image URL: " + imageURL + 
                " Times: " + times.toString() ;        
    }
}
