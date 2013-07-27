/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.asu.laits.model;

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

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeName() {
        return nodeName;
    }

    public HelpBubble(String event, String timing, String message, String attachedTo, String nodeName) {
        this.event = event;
        this.timing = timing;
        this.message = message;
        this.attachedTo = attachedTo;
        this.nodeName = nodeName;
    }
    
    public HelpBubble(){
        this.event = null;
        this.timing = null;
        this.message = null;
        this.attachedTo = null;
        this.nodeName = null;
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
    
       
}

