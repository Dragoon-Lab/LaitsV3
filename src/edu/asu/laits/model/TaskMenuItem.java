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
