/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.model;

import net.java.balloontip.BalloonTip;

/**
 *
 * @author rjoiner1
 */
public class HelpBubble {
    private String event;
    private String timing;
    private String message;
    private String attachedTo;
    private String nodeName;
    private int x;
    private int y;
    private boolean displayed;
    private BalloonTip.Orientation orientation;

    public void setOrientation(BalloonTip.Orientation orientation) {
        this.orientation = orientation;
    }
    public void setOrientation(String orientation){
        if (orientation.equalsIgnoreCase("right_above")){
            System.out.println("adding bubble as right above");
            this.orientation = BalloonTip.Orientation.RIGHT_ABOVE;
        } else if (orientation.equalsIgnoreCase("left_below")){
            this.orientation = BalloonTip.Orientation.LEFT_BELOW;
        } else if (orientation.equalsIgnoreCase("left_above")){
            this.orientation = BalloonTip.Orientation.LEFT_ABOVE;
        } else {
            System.out.println("adding bubble as right above");
            this.orientation = BalloonTip.Orientation.RIGHT_BELOW; 
        }
    }

    public BalloonTip.Orientation getOrientation() {
        return orientation;
    }

    public void setDisplayed(boolean displayed) {
        this.displayed = displayed;
    }

    public boolean isDisplayed() {
        return displayed;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeName() {
        return nodeName;
    }

    public HelpBubble(String event, String timing, String message, String attachedTo, String nodeName, int x, int y, BalloonTip.Orientation orientation) {
        this.event = event;
        this.timing = timing;
        this.message = message;
        this.attachedTo = attachedTo;
        this.nodeName = nodeName;
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }
    
    public HelpBubble(){
        this.event = null;
        this.timing = null;
        this.message = null;
        this.attachedTo = null;
        this.nodeName = null;
        this.x=0;
        this.y=0;
        this.displayed = false;
        this.orientation = BalloonTip.Orientation.LEFT_ABOVE;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public void setTiming(String timing) {
        this.timing = timing;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setAttachedTo(String attachedTo) {
        this.attachedTo = attachedTo;
    }

    public String getEvent() {
        return event;
    }

    public String getTiming() {
        return timing;
    }

    public String getMessage() {
        return message;
    }

    public String getAttachedTo() {
        return attachedTo;
    }
    
    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
    
       
}

