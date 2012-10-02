/**
 * LAITS Project
 * Arizona State University
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
    
    private Image calculationsNoStatus;
    private Image calculationsCorrect;
    private Image calculationsInCorrect;
    
    private Image graphsNoStatus;
    private Image graphsCorrect;
    private Image graphsInCorrect;
    
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
        
        calculationsNoStatus = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsNoStatus.png")).getImage();
        calculationsCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsCorrectStatus.png")).getImage();
        calculationsInCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/CalculationsWrongStatus.png")).getImage();
        
        graphsNoStatus = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsNoStatus.png")).getImage();
        graphsCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsCorrectStatus.png")).getImage();
        graphsInCorrect = new ImageIcon(getClass().getResource(
                "/resources/icons/GraphsWrongStatus.png")).getImage();
        
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
    
    public Image getCalculationsNoStatusIcon(){
        return calculationsNoStatus;
    }
    
    public Image getCalculationsCorrectIcon(){
        return calculationsCorrect;
    }
    
    public Image getCalculationsInCorrectIcon(){
        return calculationsInCorrect;
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
    
    
    
}
