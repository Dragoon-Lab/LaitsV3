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

package edu.asu.laits.model;

/**
 *
 * @author bvds
 */
public class Times {
    private double startTime;
    private double endTime;
    private double timeStep;

    public int getNumberSteps(){
        return (int) ((endTime-startTime)/timeStep)+1;
    }
    
    /*
     *  Generally, we set all three at once.
     */
    
    public void setTimes(double startTime, double stopTime, double timeStep) {
        this.startTime=startTime;
        this.endTime=stopTime;
        this.timeStep=timeStep;
    }

    public double getStartTime() {
        return startTime;
    }

    public double getEndTime() {
        return endTime;
    }

    public double getTimeStep() {
        return timeStep;
    }
    
}
