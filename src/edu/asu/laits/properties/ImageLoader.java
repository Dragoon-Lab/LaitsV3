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
