package edu.asu.laits.editor;

import java.awt.Color;
import java.util.LinkedList;
import java.util.List;

/**
 * This class represents a message provider. It is possible to set message and
 * message color to it and listeners that listens for messages that is set to
 * the provider.
 */
public class MessageProvider {

    private String message = null;
    private boolean useSpecialColor = false;
    private Color specialColor = Color.gray;
    List<MessageListener> messageListeners = new LinkedList<MessageListener>();

    public MessageProvider() {
    }

    public MessageProvider(String message) {
        this.message = message;
    }

    public String getMessage() {
        if (message == null) {
            return "";
        } else {
            return message;
        }
    }

    public void setMessage(String message) {
        this.message = message;
        for (MessageListener l : messageListeners) {
            l.messageChanged(message);
        }
    }

    public void addMessageListener(MessageListener l) {
        messageListeners.add(l);
        l.messageChanged(getMessage());
        if (isUseSpecialColor()) {
            l.colorChanged(specialColor);
        }
    }

    public void removeMessageListener(MessageListener l) {
        messageListeners.remove(l);

    }

    /**
     * @return the specialColor
     */
    public Color getSpecialColor() {
        return specialColor;
    }

    /**
     * @param specialColor the specialColor to set
     */
    public void setSpecialColor(Color specialColor) {
        this.useSpecialColor = true;
        this.specialColor = specialColor;
        for (MessageListener l : messageListeners) {
            l.colorChanged(this.specialColor);
        }

    }

    public boolean isUseSpecialColor() {
        return useSpecialColor;
    }

    public void setUseSpecialColor(boolean useSpecialColor) {
        this.useSpecialColor = useSpecialColor;
    }
}
