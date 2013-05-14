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

package edu.asu.laits.properties;

import java.awt.Image;
import javax.swing.ImageIcon;

/**
 *
 * @author ramayantiwari
 */
public class ImageLoader {
    private Image inputsNoStatus;
    private Image inputsCorrect;
    private Image inputsInCorrect;
    private Image inputsGaveUp;
    
    private Image calculationsNoStatus;
    private Image calculationsCorrect;
    private Image calculationsInCorrect;
    private Image calculationsGaveUp;
    
    private Image graphsNoStatus;
    private Image graphsCorrect;
    private Image graphsInCorrect;
    private Image graphsGaveUp;
    
    public static final int statusIconHeight = 20;
    public static final int statusIconWidth = 20;
    
    private static ImageLoader imageLoader;
    
    public static ImageLoader getInstance(){
        if(imageLoader == null){
            imageLoader = new ImageLoader();
        }
        
        return imageLoader;
    }
    
    private ImageLoader(){
        inputsNoStatus = new ImageIcon(getClass().getResource(
                "/resources/icons/InputsNoStatus.png")).getImage();
        inputsCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/InputsCorrectStatus.png")).getImage();
        inputsInCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/InputsWrongStatus.png")).getImage();
        inputsGaveUp = new ImageIcon(getClass().getResource(
                "/resources/icons/InputsGaveUpStatus.png")).getImage();
        
        calculationsNoStatus = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsNoStatus.png")).getImage();
        calculationsCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsCorrectStatus.png")).getImage();
        calculationsInCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsWrongStatus.png")).getImage();
        calculationsGaveUp = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsGaveUpStatus.png")).getImage();
        
        graphsNoStatus = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsNoStatus.png")).getImage();
        graphsCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsCorrectStatus.png")).getImage();
        graphsInCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsWrongStatus.png")).getImage();
        graphsGaveUp = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsGaveUpStatus.png")).getImage();
        
    }
    
    public Image getInputsNoStatusIcon(){
        return inputsNoStatus;
    }
    
    public Image getInputsCorrectIcon(){
        return inputsCorrect;
    }
    
    public Image getInputsInCorrectIcon(){
        return inputsInCorrect;
    }
    
    public Image getInputsGaveUpIcon(){
        return inputsGaveUp;
    }
    
    public Image getCalculationsNoStatusIcon(){
        return calculationsNoStatus;
    }
    
    public Image getCalculationsCorrectIcon(){
        return calculationsCorrect;
    }
    
    public Image getCalculationsInCorrectIcon(){
        return calculationsInCorrect;
    }
    
    public Image getCalculationsGaveUpIcon(){
        return calculationsGaveUp;
    }
    
    public Image getGraphsNoStatusIcon(){
        return graphsNoStatus;
    }
    
    public Image getGraphsCorrectIcon(){
        return graphsCorrect;
    }
    
    public Image getGraphsInCorrectIcon(){
        return graphsInCorrect;
    }
    
    public Image getGraphsGaveUpIcon(){
        return graphsGaveUp;
    }
    
    
}
