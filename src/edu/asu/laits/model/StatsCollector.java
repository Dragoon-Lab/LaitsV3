/**
 * (c) 2013, Arizona Board of Regents for and on behalf of Arizona State
 * University. This file is part of LAITS.
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
 * Class to collect number of check and demo button uses for each model node.
 * @author ramayantiwari
 */
public class StatsCollector {
    private int descriptionPanelCheckUsed;
    private int planPanelCheckUsed;
    private int calculationsPanelCheckUsed;
    private int descriptionPanelDemoUsed;
    private int planPanelDemoUsed;
    private int calculationsPanelDemoUsed;
    
    public StatsCollector() {
        descriptionPanelCheckUsed = 0;
        planPanelCheckUsed = 0;
        calculationsPanelCheckUsed = 0;
        descriptionPanelDemoUsed = 0;
        planPanelDemoUsed = 0;
        calculationsPanelDemoUsed = 0;
    }
    
    public int getDescriptionPanelCheckCount() {
        return descriptionPanelCheckUsed;
    }
    
    public int getPlanPanelCheckCount() {
        return planPanelCheckUsed;
    }
    
    public int getCalculationsPanelCheckCount() {
        return calculationsPanelCheckUsed;
    }
    
    public int getDescriptionPanelDemoCount() {
        return descriptionPanelDemoUsed;
    }
    
    public int getPlanPanelDemoCount() {
        return planPanelDemoUsed;
    }
    
    public int getCalculationsPanelDemoCount() {
        return calculationsPanelDemoUsed;
    }
    
    public void updateDescriptionPanelCheckCount() {
        descriptionPanelCheckUsed++;
    }
    
    public void updatePlanPanelCheckCount() {
        planPanelCheckUsed++;
    }
    
    public void updateCalculationsPanelCheckCount() {
        calculationsPanelCheckUsed++;
    }
    
    public void updateDescriptionPanelDemoCount() {
        descriptionPanelDemoUsed++;
    }
    
    public void updatePlanPanelDemoCount() {
        planPanelDemoUsed++;
    }
    
    public void updateCalculationsPanelDemoCount() {
        calculationsPanelDemoUsed++;
    }
    
    public String toString() {
        return "[DescriptipnPanelCheck: " + descriptionPanelCheckUsed + ", DescriptionPanelDemo: " + descriptionPanelDemoUsed + "  " +
                "PlanPanelCheck: " + planPanelCheckUsed + ", PlanPanelDemo: " + planPanelDemoUsed + "  " +
                "CalculationsPanelCheck: " + calculationsPanelCheckUsed + ", CalculationsPanelDemo: " + calculationsPanelDemoUsed + "]";
    }
}
